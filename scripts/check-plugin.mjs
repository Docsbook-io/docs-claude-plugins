#!/usr/bin/env node
/**
 * Plugin-side guardrails — the counterpart to docs-skills' check-catalog.js.
 *
 * Each check here exists because the thing it checks for was actually wrong in
 * this repo, not because it seemed prudent:
 *
 *  1. Versions drifted (marketplace said docs-sync 0.1.0, plugin.json said
 *     0.2.0) and nobody noticed because the repo had no CI at all.
 *  2. Every `mcp__docsbook__…` reference in the command frontmatter was wrong:
 *     under a plugin, MCP tools are namespaced `mcp__plugin_<plugin>_<server>__`.
 *     128 occurrences across 26 files were granting nothing.
 *  3. A command named a tool that does not exist
 *     (`register_webhook_translation_requested`) and was dead end to end.
 *  4. Commands and skills share one namespace, so a command named the same as a
 *     skill is ambiguous to the model.
 *  5. Flattening the skills tree rewrites relative metric_dictionary paths; if
 *     that rewrite is ever wrong, eight skills point at nothing.
 */

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..")
const PLUGIN = join(REPO, "plugins", "docsbook")
const problems = []

const readJson = (p) => JSON.parse(readFileSync(p, "utf8"))
const listMd = (dir) =>
  existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".md")) : []

// ── 1. versions agree ────────────────────────────────────────────────────────
const marketplace = readJson(join(REPO, ".claude-plugin", "marketplace.json"))
const manifest = readJson(join(PLUGIN, ".claude-plugin", "plugin.json"))
if (marketplace.plugins.length !== 1 || marketplace.plugins[0].name !== "docsbook") {
  problems.push("marketplace.json must list exactly one plugin named 'docsbook'")
}
const entry = marketplace.plugins.find((p) => p.name === "docsbook")
if (entry && entry.version !== manifest.version) {
  problems.push(`version drift: marketplace says ${entry.version}, plugin.json says ${manifest.version}`)
}

// ── 2 & 3. tool references are real and correctly namespaced ─────────────────
// The authoritative tool list, kept next to the checker so a rename in the
// product is a visible diff here rather than a silent mismatch.
const TOOLS = new Set(readJson(join(REPO, "scripts", "mcp-tools.json")).tools)
const NS = "mcp__plugin_docsbook_docsbook__"

const bodyFiles = []
const walk = (dir) => {
  if (!existsSync(dir)) return
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const f = join(dir, e.name)
    if (e.isDirectory()) walk(f)
    else if (/\.(md|sh|json)$/.test(e.name)) bodyFiles.push(f)
  }
}
walk(join(PLUGIN, "commands"))
walk(join(PLUGIN, "agents"))
walk(join(PLUGIN, "scripts"))

for (const f of bodyFiles) {
  const src = readFileSync(f, "utf8")
  const rel = f.slice(REPO.length + 1)

  for (const m of src.matchAll(/mcp__docsbook__([a-z_0-9]+)/g)) {
    problems.push(`${rel}: uses the un-namespaced form mcp__docsbook__${m[1]} — under a plugin it must be ${NS}${m[1]}`)
  }
  for (const m of src.matchAll(new RegExp(`${NS}([a-z_0-9]+)`, "g"))) {
    if (!TOOLS.has(m[1])) problems.push(`${rel}: names a tool the MCP server does not register: ${m[1]}`)
  }
}

// ── 4. commands and skills do not share a name ───────────────────────────────
const skillNames = existsSync(join(PLUGIN, "skills"))
  ? readdirSync(join(PLUGIN, "skills"), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)
  : []
const commandNames = listMd(join(PLUGIN, "commands")).map((f) => f.replace(/\.md$/, ""))
for (const c of commandNames) {
  if (skillNames.includes(c)) {
    problems.push(`command '${c}' collides with skill '${c}' — both resolve to docsbook:${c}. Rename the command (skills' names are public API via find_skill and npx skills add).`)
  }
}

// ── 5. every metric_dictionary path resolves ─────────────────────────────────
for (const name of skillNames) {
  const skillPath = join(PLUGIN, "skills", name, "SKILL.md")
  const m = readFileSync(skillPath, "utf8").match(/^\s*metric_dictionary:\s*(\S+)/m)
  if (!m) continue
  const target = join(PLUGIN, "skills", name, m[1])
  if (!existsSync(target)) problems.push(`skills/${name}: metric_dictionary points at ${m[1]}, which does not exist after flattening`)
}

// ── report ───────────────────────────────────────────────────────────────────
if (problems.length) {
  console.error(`\n✗ plugin check failed — ${problems.length} problem(s):\n`)
  for (const p of problems) console.error(`  • ${p}`)
  console.error("")
  process.exit(1)
}
console.log(`✓ plugin check passed`)
console.log(`  · ${commandNames.length} commands, ${listMd(join(PLUGIN, "agents")).length} agents, ${skillNames.length} skills`)
console.log(`  · marketplace and plugin versions agree (${manifest.version})`)
console.log(`  · every MCP tool named is real and namespaced for a plugin`)
console.log(`  · no command shares a name with a skill`)
console.log(`  · every metric_dictionary path resolves`)
