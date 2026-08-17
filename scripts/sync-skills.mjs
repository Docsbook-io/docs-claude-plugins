#!/usr/bin/env node
/**
 * Copy the docs-skills catalog into the plugin, flattened.
 *
 * The plugin ships every skill as a committed file, because a marketplace
 * install is a git fetch — no `npm install` ever runs on the user's machine, so
 * a node_modules dependency would simply not be there at plugin load time.
 * That leaves the question of how the files get here without being hand-copied
 * and quietly drifting, which is what this script answers.
 *
 * Source layout is two-level and inconsistent: 36 skills live at
 * skills/<name>/SKILL.md and 16 at skills/<category>/<name>/SKILL.md. The
 * nesting is cosmetic — every consumer reads the category from frontmatter —
 * but Claude Code scans exactly one level, so everything flattens to
 * skills/<name>/SKILL.md here. Two things the flatten must not do silently:
 * collide two names into one file, and break the relative metric_dictionary
 * paths (../../../metrics/... from a nested skill, ../../metrics/... from a
 * flat one — after flattening every one of them is ../../metrics/...).
 *
 * Usage:
 *   node scripts/sync-skills.mjs            write the tree
 *   node scripts/sync-skills.mjs --check    fail if the committed tree differs
 *
 * --check is the point. CI runs it, so a stale catalog cannot merge, which is a
 * stronger guarantee than a bot PR nobody merges.
 *
 * The source is a version-pinned npm tarball rather than "whatever is on main
 * right now", so a sync is reproducible: the same pin always produces the same
 * tree. `skills/`, `schema/` and `metrics/` are all in docs-skills'
 * package.json `files`. index.json is NOT, which does not matter — the plugin
 * has no use for it, and this script reads frontmatter directly.
 */

import { execFileSync } from "node:child_process"
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, readdirSync, statSync, existsSync, cpSync } from "node:fs"
import { join, dirname, basename, relative } from "node:path"
import { tmpdir } from "node:os"
import { fileURLToPath } from "node:url"
import { createHash } from "node:crypto"

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const PLUGIN_DIR = join(REPO_ROOT, "plugins", "docsbook")
const SKILLS_OUT = join(PLUGIN_DIR, "skills")
const LOCK_PATH = join(SKILLS_OUT, ".sync-lock.json")

/** Pin. Bump deliberately; CI re-runs this script and diffs the result. */
const UPSTREAM = "docs-skills"
const UPSTREAM_VERSION = "1.8.28"

const CHECK = process.argv.includes("--check")

function die(msg) {
  console.error(`\n✗ sync-skills: ${msg}\n`)
  process.exit(1)
}

/** Minimal frontmatter reader — we need exactly one field, `name`. Pulling in a
 *  YAML parser for that would add a dependency to a repo that has none. */
function frontmatterName(src, path) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) die(`${path} has no YAML frontmatter`)
  const nameLine = m[1].split(/\r?\n/).find((l) => /^name:\s*/.test(l))
  if (!nameLine) die(`${path} declares no \`name\` in frontmatter`)
  return nameLine.replace(/^name:\s*/, "").trim().replace(/^["']|["']$/g, "")
}

/** Every directory that directly contains a SKILL.md, at any depth. */
function findSkillDirs(root) {
  const out = []
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue
      const full = join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name === "SKILL.md") out.push(dir)
    }
  }
  walk(root)
  return out.sort()
}

function sha256(buf) {
  return createHash("sha256").update(buf).digest("hex")
}

function fetchUpstream(workdir) {
  const spec = `${UPSTREAM}@${UPSTREAM_VERSION}`
  console.log(`  fetching ${spec} …`)
  const tarball = execFileSync("npm", ["pack", spec, "--silent", "--pack-destination", workdir], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  }).trim().split(/\r?\n/).pop()
  const tarPath = join(workdir, tarball)
  execFileSync("tar", ["-xzf", tarPath, "-C", workdir])
  const pkg = join(workdir, "package")
  if (!existsSync(join(pkg, "skills"))) die(`${spec} contains no skills/ directory`)
  return { pkg, tarballSha: sha256(readFileSync(tarPath)) }
}

function build() {
  const workdir = mkdtempSync(join(tmpdir(), "docs-skills-"))
  try {
    const { pkg, tarballSha } = fetchUpstream(workdir)
    const dirs = findSkillDirs(join(pkg, "skills"))
    if (!dirs.length) die("upstream contained zero skills")

    /** name -> { body, sourcePath } */
    const files = new Map()
    for (const dir of dirs) {
      const skillPath = join(dir, "SKILL.md")
      const src = readFileSync(skillPath, "utf8")
      const rel = relative(pkg, skillPath)
      const name = frontmatterName(src, rel)

      // A name that disagrees with its directory means the flatten would put the
      // file somewhere no one expects. Upstream holds this invariant today; the
      // check is here so that if it ever stops holding, it stops here loudly.
      if (name !== basename(dir)) {
        die(`${rel}: frontmatter name "${name}" does not match directory "${basename(dir)}"`)
      }
      const clash = files.get(name)
      if (clash) {
        die(`two skills flatten to the same name "${name}":\n    ${clash.sourcePath}\n    ${rel}`)
      }

      // Every skill sits one level deep here, so every relative path out of it
      // is the same depth regardless of how deep it was upstream.
      const body = src.replace(
        /^(\s*metric_dictionary:\s*)(\.\.\/)+metrics\//m,
        "$1../../metrics/",
      )
      files.set(name, { body, sourcePath: rel })
    }

    const lock = {
      upstream: UPSTREAM,
      version: UPSTREAM_VERSION,
      tarball_sha256: tarballSha,
      skill_count: files.size,
      skills: Object.fromEntries(
        [...files.entries()].sort(([a], [b]) => a.localeCompare(b))
          .map(([name, { body }]) => [name, sha256(Buffer.from(body))]),
      ),
    }

    // schema/ and metrics/ come along because skills reference them by relative
    // path; without metrics/ the eight metric-bearing skills point at nothing.
    // Read into memory here rather than copying later — the temp tree is gone
    // by the time the caller runs.
    const extras = new Map()
    for (const d of ["metrics", "schema"]) {
      const root = join(pkg, d)
      if (!existsSync(root)) continue
      const walk = (dir) => {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
          const full = join(dir, entry.name)
          if (entry.isDirectory()) walk(full)
          else extras.set(relative(pkg, full), readFileSync(full))
        }
      }
      walk(root)
    }
    return { files, lock, extras }
  } finally {
    rmSync(workdir, { recursive: true, force: true })
  }
}

function write({ files, lock, extras }) {
  rmSync(SKILLS_OUT, { recursive: true, force: true })
  for (const [name, { body }] of files) {
    const dir = join(SKILLS_OUT, name)
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, "SKILL.md"), body, "utf8")
  }
  writeFileSync(LOCK_PATH, JSON.stringify(lock, null, 2) + "\n", "utf8")

  for (const d of new Set([...extras.keys()].map((p) => p.split("/")[0]))) {
    rmSync(join(PLUGIN_DIR, d), { recursive: true, force: true })
  }
  for (const [rel, buf] of extras) {
    const dest = join(PLUGIN_DIR, rel)
    mkdirSync(dirname(dest), { recursive: true })
    writeFileSync(dest, buf)
  }
  const extraDirs = [...new Set([...extras.keys()].map((p) => p.split("/")[0]))]
  console.log(`✓ wrote ${files.size} skills to ${relative(REPO_ROOT, SKILLS_OUT)} (+ ${extraDirs.join(", ")})`)
}

function check({ files, lock }) {
  const problems = []
  if (!existsSync(LOCK_PATH)) problems.push("plugins/docsbook/skills/.sync-lock.json is missing — run `node scripts/sync-skills.mjs`")
  else {
    const committed = JSON.parse(readFileSync(LOCK_PATH, "utf8"))
    if (JSON.stringify(committed) !== JSON.stringify(lock)) {
      problems.push("the committed skills differ from the pinned upstream — run `node scripts/sync-skills.mjs` and commit")
    }
  }
  for (const [name, { body }] of files) {
    const path = join(SKILLS_OUT, name, "SKILL.md")
    if (!existsSync(path)) { problems.push(`missing: skills/${name}/SKILL.md`); continue }
    if (readFileSync(path, "utf8") !== body) problems.push(`differs from upstream: skills/${name}/SKILL.md`)
  }
  if (existsSync(SKILLS_OUT)) {
    for (const entry of readdirSync(SKILLS_OUT, { withFileTypes: true })) {
      if (entry.isDirectory() && !files.has(entry.name)) problems.push(`not in upstream: skills/${entry.name}/`)
    }
  }
  if (problems.length) die(`plugin skills are out of sync with ${UPSTREAM}@${UPSTREAM_VERSION}:\n  • ${problems.join("\n  • ")}`)
  console.log(`✓ ${files.size} skills match ${UPSTREAM}@${UPSTREAM_VERSION}`)
}

const built = build()
if (CHECK) check(built)
else write(built)
