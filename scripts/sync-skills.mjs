#!/usr/bin/env node
/**
 * Copy the docs-skills catalog into the plugin.
 *
 * The plugin ships every skill as a committed file, because a marketplace
 * install is a git fetch — no `npm install` ever runs on the user's machine, so
 * a node_modules dependency would simply not be there at plugin load time.
 * That leaves the question of how the files get here without being hand-copied
 * and quietly drifting, which is what this script answers.
 *
 * Usage:
 *   node scripts/sync-skills.mjs            write the tree at the pinned ref
 *   node scripts/sync-skills.mjs --check    fail if the committed tree differs
 *   node scripts/sync-skills.mjs --update   move the pin to the branch head first
 *
 * --check is the wall: CI runs it, so a stale catalog cannot merge, which is a
 * stronger guarantee than a bot PR nobody merges. --update is what makes the
 * wall survivable — a scheduled job moves the pin and commits, so an upstream
 * release lands here without anyone remembering it should.
 *
 * ── Why the source is git and not npm ────────────────────────────────────────
 * This script used to pin `docs-skills@<npm version>`, which read well on paper
 * (a published version is immutable) and failed in the only way that matters:
 * docs-skills' publish workflow has been erroring `E404 PUT
 * https://registry.npmjs.org/docs-skills` — an NPM_TOKEN without publish rights
 * on that package — since 1.8.29 on 2026-08-17. The version-bump step runs
 * BEFORE the publish step, so bump commits kept landing on main and the repo
 * looked like it was releasing normally while npm stayed frozen. Eleven days
 * and five releases later, upstream had collapsed 52 skills into 4 orchestrators
 * and this plugin was still shipping the 52 — pinned, checked by CI, green, and
 * wrong. A pin can only be as current as the registry it reads, and this one
 * silently stopped being a registry.
 *
 * Git is also the source everyone else already reads: docs-skills' index.json
 * publishes `raw_url` pointing at raw.githubusercontent…/main, `npx skills add
 * Docsbook-io/docs-skills` clones the repo, and find_skill serves the same
 * index. Pinning a commit SHA keeps the reproducibility the npm pin was chosen
 * for — the same SHA always produces the same tree — without depending on a
 * publish step in another repository succeeding.
 *
 * ── Why the whole skill directory is copied ──────────────────────────────────
 * The old layout was one self-contained SKILL.md per skill, so the sync copied
 * exactly that file. The four orchestrators are not self-contained: each routes
 * into `references/*.md` (and docs-manage into `assets/`) and is nearly useless
 * without them — a copy of SKILL.md alone installs a routing table whose every
 * destination is missing. Everything under the skill directory now comes along.
 *
 * The flatten and the metric_dictionary rewrite below are kept even though the
 * current upstream layout needs neither: upstream nested 16 of its 52 skills one
 * level deeper once before, and Claude Code scans exactly one level.
 */

import { execFileSync } from "node:child_process"
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync } from "node:fs"
import { join, dirname, basename, relative } from "node:path"
import { tmpdir } from "node:os"
import { fileURLToPath } from "node:url"
import { createHash } from "node:crypto"

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const PLUGIN_DIR = join(REPO_ROOT, "plugins", "docsbook")
const SKILLS_OUT = join(PLUGIN_DIR, "skills")
const LOCK_PATH = join(SKILLS_OUT, ".sync-lock.json")
const PIN_PATH = join(REPO_ROOT, "scripts", "upstream.json")

const CHECK = process.argv.includes("--check")
const UPDATE = process.argv.includes("--update")

function die(msg) {
  console.error(`\n✗ sync-skills: ${msg}\n`)
  process.exit(1)
}

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex")

/** curl, not fetch(). Node's fetch ignores HTTPS_PROXY, and a proxied
 *  environment answers the blocked request with a 200-shaped error body — the
 *  failure looks like "upstream is empty" rather than "the network said no". */
function curl(url, args = []) {
  return execFileSync("curl", ["-fsSL", ...args, url], {
    encoding: "buffer",
    maxBuffer: 64 * 1024 * 1024,
    stdio: ["ignore", "pipe", "inherit"],
  })
}

function readPin() {
  const pin = JSON.parse(readFileSync(PIN_PATH, "utf8"))
  for (const k of ["repo", "branch", "ref"]) {
    if (!pin[k]) die(`scripts/upstream.json is missing "${k}"`)
  }
  if (!/^[0-9a-f]{40}$/.test(pin.ref)) die(`scripts/upstream.json ref must be a full 40-character commit SHA, got "${pin.ref}"`)
  return pin
}

/** Resolve the branch head. Unauthenticated is fine — 60 requests/hour against
 *  a public repo, and this runs at most hourly. GITHUB_TOKEN is used when the
 *  environment has one so a busy runner is not the thing that breaks the sync. */
function resolveHead(pin) {
  const auth = process.env.GITHUB_TOKEN ? ["-H", `Authorization: Bearer ${process.env.GITHUB_TOKEN}`] : []
  const url = `https://api.github.com/repos/${pin.repo}/commits/${pin.branch}`
  const body = JSON.parse(curl(url, [...auth, "-H", "Accept: application/vnd.github+json"]).toString("utf8"))
  if (!body.sha) die(`could not resolve ${pin.repo}@${pin.branch} — the API returned no sha`)
  return body.sha
}

function fetchUpstream(pin, workdir) {
  console.log(`  fetching ${pin.repo}@${pin.ref.slice(0, 12)} …`)
  const tar = curl(`https://codeload.github.com/${pin.repo}/tar.gz/${pin.ref}`)
  const tarPath = join(workdir, "upstream.tar.gz")
  writeFileSync(tarPath, tar)
  execFileSync("tar", ["-xzf", tarPath, "-C", workdir])
  // codeload names the root <repo>-<ref>; take whatever single directory landed
  // rather than reconstructing that name, which changes with the ref format.
  const roots = readdirSync(workdir, { withFileTypes: true }).filter((e) => e.isDirectory())
  if (roots.length !== 1) die(`expected one directory in the tarball, found ${roots.length}`)
  const pkg = join(workdir, roots[0].name)
  if (!existsSync(join(pkg, "skills"))) die(`${pin.repo}@${pin.ref} contains no skills/ directory`)
  return { pkg, tarballSha: sha256(tar) }
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

function readTree(root) {
  const out = []
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name.startsWith(".")) continue
      const full = join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else out.push({ rel: relative(root, full).split("\\").join("/"), buf: readFileSync(full) })
    }
  }
  walk(root)
  return out
}

function build(pin) {
  const workdir = mkdtempSync(join(tmpdir(), "docs-skills-"))
  try {
    const { pkg, tarballSha } = fetchUpstream(pin, workdir)
    const dirs = findSkillDirs(join(pkg, "skills"))
    if (!dirs.length) die("upstream contained zero skills")

    /** "<skill>/<path within the skill>" -> Buffer */
    const files = new Map()
    const owners = new Map()
    for (const dir of dirs) {
      const src = readFileSync(join(dir, "SKILL.md"), "utf8")
      const rel = relative(pkg, join(dir, "SKILL.md"))
      const name = frontmatterName(src, rel)

      // A name that disagrees with its directory means the flatten would put the
      // file somewhere no one expects. Upstream holds this invariant today; the
      // check is here so that if it ever stops holding, it stops here loudly.
      if (name !== basename(dir)) {
        die(`${rel}: frontmatter name "${name}" does not match directory "${basename(dir)}"`)
      }
      const clash = owners.get(name)
      if (clash) die(`two skills flatten to the same name "${name}":\n    ${clash}\n    ${relative(pkg, dir)}`)
      owners.set(name, relative(pkg, dir))

      for (const { rel: inner, buf } of readTree(dir)) {
        // Every skill sits one level deep here, so every relative path out of it
        // is the same depth regardless of how deep it was upstream. Only paths
        // that LEAVE the skill directory need rewriting; references/ and assets/
        // are relative to the skill and survive the move untouched.
        const body = inner === "SKILL.md"
          ? Buffer.from(buf.toString("utf8").replace(/^(\s*metric_dictionary:\s*)(\.\.\/)+metrics\//m, "$1../../metrics/"), "utf8")
          : buf
        files.set(`${name}/${inner}`, body)
      }
    }

    const lock = {
      upstream: pin.repo,
      branch: pin.branch,
      ref: pin.ref,
      tarball_sha256: tarballSha,
      skill_count: owners.size,
      file_count: files.size,
      files: Object.fromEntries(
        [...files.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([p, buf]) => [p, sha256(buf)]),
      ),
    }

    // schema/ and metrics/ come along because skills reference them by relative
    // path; without metrics/ the metric-bearing skills point at nothing. Read
    // into memory here rather than copying later — the temp tree is gone by the
    // time the caller runs.
    const extras = new Map()
    for (const d of ["metrics", "schema"]) {
      const root = join(pkg, d)
      if (!existsSync(root)) continue
      for (const { rel, buf } of readTree(root)) extras.set(`${d}/${rel}`, buf)
    }
    return { files, lock, extras, skills: [...owners.keys()].sort() }
  } finally {
    rmSync(workdir, { recursive: true, force: true })
  }
}

function write({ files, lock, extras, skills }) {
  rmSync(SKILLS_OUT, { recursive: true, force: true })
  for (const [rel, buf] of files) {
    const dest = join(SKILLS_OUT, rel)
    mkdirSync(dirname(dest), { recursive: true })
    writeFileSync(dest, buf)
  }
  writeFileSync(LOCK_PATH, JSON.stringify(lock, null, 2) + "\n", "utf8")

  const extraDirs = [...new Set([...extras.keys()].map((p) => p.split("/")[0]))]
  for (const d of extraDirs) rmSync(join(PLUGIN_DIR, d), { recursive: true, force: true })
  for (const [rel, buf] of extras) {
    const dest = join(PLUGIN_DIR, rel)
    mkdirSync(dirname(dest), { recursive: true })
    writeFileSync(dest, buf)
  }
  console.log(`✓ wrote ${skills.length} skills / ${files.size} files to ${relative(REPO_ROOT, SKILLS_OUT)} (+ ${extraDirs.join(", ")})`)
  console.log(`  · ${skills.join(", ")}`)
}

function check({ files, lock, skills }, pin) {
  const problems = []
  if (!existsSync(LOCK_PATH)) {
    problems.push("plugins/docsbook/skills/.sync-lock.json is missing — run `node scripts/sync-skills.mjs`")
  } else if (JSON.stringify(JSON.parse(readFileSync(LOCK_PATH, "utf8"))) !== JSON.stringify(lock)) {
    problems.push("the committed lock differs from the pinned upstream — run `node scripts/sync-skills.mjs` and commit")
  }
  for (const [rel, buf] of files) {
    const path = join(SKILLS_OUT, rel)
    if (!existsSync(path)) { problems.push(`missing: skills/${rel}`); continue }
    if (!readFileSync(path).equals(buf)) problems.push(`differs from upstream: skills/${rel}`)
  }
  if (existsSync(SKILLS_OUT)) {
    for (const { rel } of readTree(SKILLS_OUT)) {
      if (!files.has(rel)) problems.push(`not in upstream: skills/${rel}`)
    }
  }
  if (problems.length) {
    die(`plugin skills are out of sync with ${pin.repo}@${pin.ref.slice(0, 12)}:\n  • ${problems.slice(0, 40).join("\n  • ")}${problems.length > 40 ? `\n  • …and ${problems.length - 40} more` : ""}`)
  }
  console.log(`✓ ${skills.length} skills / ${files.size} files match ${pin.repo}@${pin.ref.slice(0, 12)}`)
}

const pin = readPin()
if (UPDATE) {
  const head = resolveHead(pin)
  if (head === pin.ref) {
    console.log(`✓ pin already at ${pin.repo}@${pin.branch} head (${head.slice(0, 12)})`)
  } else {
    console.log(`↑ moving pin ${pin.ref.slice(0, 12)} → ${head.slice(0, 12)}`)
    pin.ref = head
    writeFileSync(PIN_PATH, JSON.stringify(pin, null, 2) + "\n", "utf8")
  }
}

const built = build(pin)
if (CHECK) check(built, pin)
else write(built)
