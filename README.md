<div align="center">

# docs-claude-plugins

**Claude Code plugins for documentation workflows — subagents, MCP servers, and git hooks bundled into one command.**

[![npm version](https://badge.fury.io/js/docs-claude-plugins.svg)](https://www.npmjs.com/package/docs-claude-plugins)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Claude Code only](https://img.shields.io/badge/Claude%20Code-only-orange.svg)](#)

[docs-sync](#docs-sync--pre-push-drift-detection) • [docs-create](#docs-create--end-to-end-docs-bootstrap) • [docs-insights](#docs-insights--recurring-analytics-pipeline) • [docs-audit](#docs-audit--full-documentation-quality-audit) • [docs-growth](#docs-growth--growth-reasoning-pipeline) • [How It Fits Together](#how-it-fits-together) • [Troubleshooting](#troubleshooting)

</div>

---

## The Problem

> You push code. Your docs drift. Nobody notices until a user opens a GitHub issue saying "this doesn't match the README."

Setting up the fix is painful: wire up subagents by hand, edit `.mcp.json`, write a pre-push hook script, figure out which model to pin where. Most teams skip it.

## The Solution

Five plugins. One command each (`docs-sync` and `docs-audit` ship several — see their sections). Every piece — subagents, MCP servers, git hooks — wired automatically on install.

| Plugin | What it does |
|---|---|
| **`docs-sync`** | Pre-push `code↔docs` drift detection: planner → searcher → editor → curator. Also ships 6 one-shot platform setup commands (PR CI gate, stale-content watcher, AI chat tuning, release announcements, translation). |
| **`docs-create`** | End-to-end docs bootstrap from a URL: crawl → publish to GitHub → configure Docsbook workspace. |
| **`docs-insights`** | Recurring analytics pipeline: collector → clusterer → reporter → archivist. Produces schema-validated JSON reports under `.docsbook/insights/` so future actor agents can act on them. |
| **`docs-audit`** | Full documentation quality audit, read-only: 17 checks (structure, style, SEO, accessibility, i18n, AI retrieval, trust, pricing consistency, and more) run through one pinned auditor and return prioritized JSON findings. |
| **`docs-growth`** | Growth-reasoning pipeline over your product source-of-truth: three lenses (segment / funnel / competitor) reason grounded in real analytics and append findings back into your knowledge base. |

---

## How It Fits Together

This package is the third layer of the Docsbook documentation ecosystem:

```
Skill (docs-skills)          = regulation   — knows HOW to do it right
Subagent (docs-subagents)    = executor     — knows WHAT to do and with whom
Plugin (docs-claude-plugins) = bundle       — everything together, one command
```

**Which layer should you use?**

- **Use the plugin** if you want "it just works" — one install command, everything wired.
- **Use [docs-subagents](https://github.com/Docsbook-io/docs-subagents) directly** if you want control — pick only the agents you need, configure MCP yourself.
- **Use [docs-skills](https://github.com/Docsbook-io/docs-skills) directly** if you want to teach your agent — SKILL.md files work in Cursor, Codex, Copilot, and any Claude-based tool.

The three layers don't conflict. Running all three gives you:

- Agents from the plugin (richer versions, evolve with plugin commands like `/docs-sync` intent mode or `/docs-insights-setup`).
- Agents from `docs-subagents` (standalone-friendly minimal versions of the same names).
- A separate set of SKILL.md guides from `docs-skills`.

**The plugin and standalone versions of the same subagent are intentionally not byte-identical.** Plugin versions reference plugin-specific commands and config files (`.docsbook/insights/.config.json`, MCP bundled in `.mcp.json`). Standalone versions are simpler and assume the user invokes them manually. Both honor the same input/output contract (e.g. `WROTE:`, `CLUSTERED:`, `REPORT_JSON:` final-line conventions), so swapping one for the other is safe within a pipeline. If both end up in `.claude/agents/` because the user installed both, the second install backs up the first — pick the version that matches how you're invoking it.

---

## What a Plugin Install Gives You

`/plugin install <name>@docs-claude-plugins` is the single source of truth. One command sets up:

| Piece | Where it lands | Set up automatically? |
|---|---|---|
| Subagents (`.md` with pinned model + tools) | `.claude/agents/` in the current project | ✅ Yes, on install |
| MCP servers (`markdown-lsp`, optionally `docsbook`) | Registered in the session from the plugin's `.mcp.json` | ✅ Yes, on install |
| Slash command (`/docs-sync`, `/docs-create`, …) | Available in the session | ✅ Yes, on install |
| Pre-push git hook (docs-sync only) | `.git/hooks/pre-push` | ⚠️ Offered on first `/docs-sync` run — accept once |

### Plugin vs. standalone installers

| Action | This plugin | [`npx docs-subagents install`](https://github.com/Docsbook-io/docs-subagents) | [`npx docs-skills install`](https://github.com/Docsbook-io/docs-skills) |
|---|---|---|---|
| Copies subagents | ✅ | ✅ | ❌ |
| Registers MCP automatically | ✅ | ❌ (edit `.mcp.json` yourself) | ❌ |
| Installs pre-push hook | ✅ (one accept) | ❌ | ❌ |
| Ships a `/docs-sync` orchestrator | ✅ | ❌ | ❌ |
| Ships SKILL.md knowledge base | ❌ | ❌ | ✅ |
| Works in Cursor/Codex/Copilot | ❌ Claude Code only | ✅ | ✅ |

---

## docs-sync — Pre-Push Drift Detection

Four subagents with pinned models (Haiku for cheap reads, Sonnet for edits), one MCP server for local doc-graph search, one pre-push hook that fires on every `git push`. Works on private repos. No CI, no cloud, no account.

### Install

Inside Claude Code:

```
/plugin marketplace add Docsbook-io/docs-claude-plugins
/plugin install docs-sync@docs-claude-plugins
```

This registers the marketplace, copies the 4 subagents into `.claude/agents/`, and registers the `markdown-lsp` MCP server from the plugin's `.mcp.json`. No restart needed — `/agents` and `/docs-sync` are available immediately.

Then type `/docs-sync` once. On first run, Claude offers to install the pre-push git hook. Accept it — from that moment, every `git push` syncs docs automatically.

If you decline the offer, `/docs-sync` keeps working as a manual command. To install the hook later by hand:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/Docsbook-io/docs-claude-plugins/main/plugins/docs-sync/scripts/install-git-hook.sh)
```

To uninstall the hook:

```bash
rm .git/hooks/pre-push
```

### Verify

```bash
# Run the workflow once without pushing:
claude --print --dangerously-skip-permissions /docs-sync

# List subagents — should include 4 docs-* ones:
/agents
```

### What Happens on `git push`

1. Pre-push hook fires → calls `claude --print /docs-sync`.
2. [`docs-planner`](https://github.com/Docsbook-io/docs-subagents/blob/main/agents/docs-planner.md) (Haiku) clusters the diff into 1–5 thematic groups.
3. Per cluster, in parallel:
   - [`docs-searcher`](https://github.com/Docsbook-io/docs-subagents/blob/main/agents/docs-searcher.md) (Haiku) finds drifted docs pages via the `markdown-lsp` MCP.
   - [`docs-editor`](https://github.com/Docsbook-io/docs-subagents/blob/main/agents/docs-editor.md) (Sonnet) edits drifted `.md` files inside an isolated `git worktree`.
4. [`docs-curator`](https://github.com/Docsbook-io/docs-subagents/blob/main/agents/docs-curator.md) (Sonnet, fresh context) merges all worktree edits, resolves overlaps, drops speculative changes.
5. Final patch is applied via `git commit --amend` and pushed.

Per-run cost: ~$0.05–0.15. Wall time: 10–20s for typical changes.

### Components

| Component | File | Purpose |
|---|---|---|
| `/docs-sync` command | [commands/docs-sync.md](plugins/docs-sync/commands/docs-sync.md) | Orchestrator — reads diff, delegates to subagents, applies the final patch |
| `docs-planner` (Haiku) | [agents/docs-planner.md](plugins/docs-sync/agents/docs-planner.md) | Cluster the diff |
| `docs-searcher` (Haiku) | [agents/docs-searcher.md](plugins/docs-sync/agents/docs-searcher.md) | Find drifted pages via `markdown-lsp` CLI |
| `docs-editor` (Sonnet) | [agents/docs-editor.md](plugins/docs-sync/agents/docs-editor.md) | Edit `.md` files inside a worktree |
| `docs-curator` (Sonnet) | [agents/docs-curator.md](plugins/docs-sync/agents/docs-curator.md) | Merge editor outputs |
| `markdown-lsp` CLI | (bundled via `npx markdown-lsp`) | 9 doc-graph tools (`outline`, `search-text`, …) via CLI. Source: [markdown-lsp](https://github.com/Docsbook-io/markdown-lsp) |
| Hook installer | [scripts/install-git-hook.sh](plugins/docs-sync/scripts/install-git-hook.sh) | Writes `.git/hooks/pre-push` |

The model is pinned in each subagent's YAML frontmatter — invoking `docs-planner` always runs on Haiku, no matter what the parent session uses.

The same subagents are also published standalone at [docs-subagents](https://github.com/Docsbook-io/docs-subagents) for users who don't want the full plugin. See that repo's README for the by-hand setup path.

### Hook Environment Variables

| Variable | Effect |
|---|---|
| `DOCS_SYNC_SKIP=1` | Skip the hook for one push |
| `DOCS_SYNC_MODE=block` | Fail push on AI failure or detected drift |

Default mode is `warn` — the hook never blocks push.

### Optional Config

Drop `.docs-sync.json` at the repo root:

```json
{
  "docsPath": "./docs",
  "codePaths": ["./src", "./packages"],
  "mode": "warn",
  "threshold": 0.6,
  "diffCap": 0.4
}
```

| Field | Default | Meaning |
|---|---|---|
| `mode` | `warn` | `warn` never blocks push; `block` exits non-zero on detected drift |
| `threshold` | `0.6` | Confidence floor for `docs-editor` to act |
| `diffCap` | `0.4` | Max share of a page editor may rewrite per pass |
| `worktreeDir` | `.claude/worktrees` | Where parallel worktrees live (kept on error for triage) |

### Platform Automation Commands

Six one-shot setup commands ship alongside `/docs-sync`. Unlike the drift pipeline above, these are flat, single-invocation commands — no worktrees, no fan-out — that either generate a GitHub Actions workflow, register a Docsbook webhook, or both. `docs-sync`'s `.mcp.json` registers the `docsbook` HTTP MCP server for the five that need it.

| Command | Plan | Produces |
|---|---|---|
| `/docs-pr-check` | Free | `.github/workflows/docsbook-docs-check.yml` — CI gate checking code↔docs ratio, frontmatter, broken links on every PR |
| `/docs-stale-watcher` | PRO+ | `.github/workflows/docsbook-stale-handler.yml` + a `content.outdated` webhook — turns stale-page notifications into GitHub Issues |
| `/docs-tune-ai-chat` | PRO | Rewrites the workspace's AI chat system prompt from real negative feedback + unanswered questions, applied only after you confirm the diff |
| `/docs-release-announce` | PRO | `.github/workflows/docsbook-release-announce.yml` + a release webhook — dispatches Slack/email on `release: published` |
| `/docs-enable-translation` | PRO | Enables up to 15 languages, switches translation mode to `auto`, updates `AGENTS.md` |
| `/docs-translate-webhook` | PRO+ | Switches translation mode to `external`, registers a `translation.requested` webhook, scaffolds a Vercel/Express handler you deploy with your own translation logic |

Knowledge base for these six: [docs-skills/automation/](https://github.com/Docsbook-io/docs-skills/tree/main/skills/automation).

---

## docs-create — End-to-End Docs Bootstrap

```
/plugin marketplace add Docsbook-io/docs-claude-plugins
/plugin install docs-create@docs-claude-plugins
```

Same install model as `docs-sync` — subagents copied to `.claude/agents/`, two MCP servers registered automatically from `plugins/docs-create/.mcp.json`. No git hook for this plugin.

### Quick Start

```
/docs-create https://example.com                       # marketing site
/docs-create https://github.com/owner/repo             # code repo or docs platform — auto-detected
```

One command. Auto-routes between three builder subagents depending on what your source is. Live docs at `https://docsbook.io/<you>/<example>` in under a minute.

### Slash Commands

| Command | Purpose |
|---|---|
| `/docs-create` | Full pipeline: detect source → crawl/extract/import → publish GitHub → configure Docsbook workspace |
| `/docs-from-site` | Crawl a marketing website only |
| `/docs-from-code` | Extract a code repo (README + API + config) only |
| `/docs-from-docs` | Import from Mintlify / GitBook / Docusaurus / Nextra / VitePress / Starlight only |
| `/docs-publish` | Publish a local folder (push to GitHub) |
| `/docs-setup-workspace` | Configure Docsbook via MCP |

### Subagents

| Subagent | Model | Job | Tools |
|---|---|---|---|
| `docs-site-crawler` | Haiku | Crawl product URL → Markdown + `_branding.json` | Read, Write, Bash, WebFetch |
| `docs-code-crawler` | Haiku | Clone code repo → split README + enumerate public API + extract config | Read, Write, Bash, WebFetch |
| `docs-platform-importer` | Haiku | Identify docs platform → copy pages + normalise MDX components → relative-link rewrite | Read, Write, Bash, WebFetch |
| `docs-publisher` | Haiku | `git init` + `gh repo create` + push via HTTPS | Bash, Read |
| `docs-workspace-configurator` | Sonnet | Branding / UI / AI / SEO via Docsbook MCP | Read + Docsbook MCP tools |

### MCP Servers

Both are registered automatically:

| MCP | Transport | Purpose |
|---|---|---|
| `markdown-lsp` CLI | CLI (`npx markdown-lsp`) | Local doc-graph search (same as `docs-sync`) |
| `docsbook` | HTTP (`https://docsbook.io/api/mcp/server`) | Workspace configuration: branding, UI, AI, SEO, languages |

The `docsbook` MCP needs OAuth on first use. Claude Code prompts for it the first time a subagent calls a `mcp__docsbook__*` tool.

### Knowledge Base

The pinned subagents are the *executors*. The matching [docs-skills](https://github.com/Docsbook-io/docs-skills) entries are the *knowledge base* — tips, edge cases, output contracts, writing rules. Read the skill before tuning a subagent's behaviour:

- [docs-from-site skill](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-from-site/SKILL.md)
- [docs-from-code skill](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-from-code/SKILL.md)
- [docs-from-docs skill](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-from-docs/SKILL.md)
- [docs-publish skill](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-publish/SKILL.md)
- [docs-setup-workspace skill](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-setup-workspace/SKILL.md)
- [docs-create skill](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-create/SKILL.md)

---

## docs-insights — Recurring Analytics Pipeline

Four pinned subagents that walk the Docsbook MCP, produce **machine-readable JSON reports** under `.docsbook/insights/`, and update a `latest/` symlink folder so downstream actor agents (next phase) can dispatch on `findings[].suggested_actions[]` without re-querying analytics. Sets up its own recurring schedule via Claude Code Routines (or generates a GitHub Actions workflow as a fallback). Works on workspaces with PRO or PRO+.

### Install

```
/plugin marketplace add Docsbook-io/docs-claude-plugins
/plugin install docs-insights@docs-claude-plugins
```

This copies the four analyzer subagents into `.claude/agents/`, registers the Docsbook MCP server (HTTP) from the plugin's `.mcp.json`, and ships eight slash commands.

Then run the one-time setup wizard:

```
/docs-insights-setup
```

It asks for the workspace, picks which of the six analyzers to enable (default: all), offers a recurring cadence, optionally wires Slack notifications, and writes `.docsbook/insights/.config.json`. Idempotent — re-run to modify the configuration.

### What it produces

```
.docsbook/insights/
├── .config.json                                  # written by /docs-insights-setup
├── 2026-05-28T08-00-00Z__docs-utm-analyzer.json  # machine
├── 2026-05-28T08-00-00Z__docs-utm-analyzer.md    # human
├── index.json                                    # flat catalog of all runs
└── latest/
    ├── docs-utm-analyzer.json
    ├── docs-utm-analyzer.md
    ├── docs-utm-analyzer.diff.json               # what's new since last run
    └── _summary.md                               # aggregated headlines
```

Every JSON validates against [`schemas/insight.schema.json`](plugins/docs-insights/schemas/insight.schema.json) — the **stable contract** between today's analyzer agents and tomorrow's actor agents. See [the schema README](plugins/docs-insights/schemas/README.md) for the full design.

### Slash commands

| Command | Purpose |
|---|---|
| `/docs-insights-setup` | Interactive one-time setup — workspace, schedule, notifications |
| `/docs-insights` | Run every enabled analyzer; produce one report per analyzer |
| `/docs-utm` | Shortcut: only `docs-utm-analyzer` |
| `/docs-engagement` | Shortcut: only `docs-engagement-analyzer` |
| `/docs-funnel` | Shortcut: only `docs-funnel-mapper` |
| `/docs-cohort` | Shortcut: only `docs-visitor-cohort` |
| `/docs-link-clicks` | Shortcut: only `docs-link-click-analyzer` |
| `/docs-questions` | Shortcut: only `docs-question-clusterer` |

### Subagents

| Subagent | Model | Job | Tools |
|---|---|---|---|
| `analytics-collector` | Haiku | Pull raw rows from Docsbook MCP for one slice (utm/engagement/funnel/cohort/link_clicks/questions/traffic_anomaly) | Bash, Read, Write, all `mcp__docsbook__get_*` and `query_events` |
| `analytics-clusterer` | Sonnet | Cluster/normalize the dump, compute period-over-period deltas, flag anomalies | Read, Write, Bash |
| `analytics-reporter` | Sonnet | Emit a schema-validated JSON report + human Markdown sibling, update `latest/` symlinks | Read, Write, Bash |
| `insights-archivist` | Haiku | Build `index.json`, compute diff against previous run, rotate old reports | Read, Write, Bash, Glob |

The pipeline runs **sequentially per analyzer** (each analyzer fans out internally) to respect Docsbook MCP rate limits.

### Designed for downstream actor agents

The whole plugin **stops at the reporting boundary by design**. It produces structured data; it never edits a doc page, opens an Issue, or updates settings on its own. That action layer is the next phase. The schema is built for it — every finding's `suggested_actions[]` already names the `action_type`, `skill_to_invoke`, and `prompt` a future actor would need:

```json
"suggested_actions": [
  {
    "action_type": "invoke_skill",
    "skill_to_invoke": "docs-tune-ai-chat",
    "prompt": "Add explicit guidance about webhook payload shape — 9 user questions clustered around this topic; the existing docs/webhooks.md covers it but the AI chat couldn't find it.",
    "priority": "p1",
    "auto_apply_safe": false
  }
]
```

Until the actor ships, the JSON reports are also useful directly: skim the Markdown sibling, feed the JSON to your own scripts, or commit reports to your repo for review.

### Knowledge base

The analyzer subagents are *executors*. The matching skills in [docs-skills/observability/](https://github.com/Docsbook-io/docs-skills/tree/main/skills/observability) are the *knowledge base* — when to run each analyzer, the decision matrices, the guardrails:

- [docs-utm-analyzer](https://github.com/Docsbook-io/docs-skills/blob/main/skills/observability/docs-utm-analyzer/SKILL.md)
- [docs-engagement-analyzer](https://github.com/Docsbook-io/docs-skills/blob/main/skills/observability/docs-engagement-analyzer/SKILL.md)
- [docs-funnel-mapper](https://github.com/Docsbook-io/docs-skills/blob/main/skills/observability/docs-funnel-mapper/SKILL.md)
- [docs-visitor-cohort](https://github.com/Docsbook-io/docs-skills/blob/main/skills/observability/docs-visitor-cohort/SKILL.md)
- [docs-link-click-analyzer](https://github.com/Docsbook-io/docs-skills/blob/main/skills/observability/docs-link-click-analyzer/SKILL.md)
- [docs-question-clusterer](https://github.com/Docsbook-io/docs-skills/blob/main/skills/observability/docs-question-clusterer/SKILL.md)

---

## docs-audit — Full Documentation Quality Audit

One pinned Sonnet subagent (`docs-auditor`) runs any of 17 read-only checks against a page, a folder, or the full docs tree, and returns machine-readable JSON findings. Where `docs-insights` reads *analytics* (what visitors do), `docs-audit` reads *content* (whether the pages themselves are good) — structure, tone, accessibility, SEO, i18n parity, and whether AI assistants can actually retrieve and cite what you wrote.

### Install

```
/plugin marketplace add Docsbook-io/docs-claude-plugins
/plugin install docs-audit@docs-claude-plugins
```

Copies the `docs-auditor` subagent into `.claude/agents/`, registers the Docsbook MCP server (HTTP, optional — most checks work text-only), and ships 18 slash commands.

### Quick Start

```
/docs-analyze                          # every applicable check, full docs/ tree
/docs-analyze docs/guides/webhooks.md  # every applicable check, one page
/docs-ai-retrieval docs/quick-start.md # shortcut: only the AI-retrieval check
```

### Slash commands

| Command | Purpose |
|---|---|
| `/docs-analyze` | Run every applicable check; produce one prioritized report |
| `/docs-content-types` | Shortcut: Diátaxis classification (tutorial/how-to/reference/explanation) |
| `/docs-structure-templates` | Shortcut: frontmatter, heading hierarchy, code-block tags |
| `/docs-style-tone` | Shortcut: passive voice, filler words, terminology consistency |
| `/docs-audience` | Shortcut: vocabulary mismatch, undeclared prerequisites |
| `/docs-navigation-linking` | Shortcut: broken links, orphan pages, anchor text (needs the full graph) |
| `/docs-a11y` | Shortcut: WCAG 2.1 AA — alt text, heading hierarchy, screen-reader concerns |
| `/docs-media-audit` | Shortcut: image formats, sizes, stale screenshots |
| `/docs-maintenance` | Shortcut: stale content, deprecated pages, TODO/FIXME |
| `/docs-i18n` | Shortcut: translation parity, hreflang — auto-skips on single-language workspaces |
| `/docs-seo-audit` | Shortcut: titles, descriptions, GEO/AI Overviews — grounded in real GSC positions when connected |
| `/docs-ai-retrieval` | Shortcut: is each page chunk-retrievable by an AI chat, not just readable by a human |
| `/docs-trust-audit` | Shortcut: verifies external claims (integrations, partner limits) against their live source |
| `/docs-pricing-consistency` | Shortcut: docs' quoted prices/plans against the live pricing page |
| `/docs-competitor-gap` | Shortcut: topics a named competitor covers that you don't (`--competitor <url>`) |
| `/docs-gap-finder` | Shortcut: top pages worth creating, from failed searches + unanswered questions |
| `/docs-rank-recovery` | Shortcut: pages ranking page 1–2 but not converting clicks — rewrite queue |
| `/docs-title-rewriter` | Shortcut: rewrites titles/openings for zero-click search results (PRO) |

### Subagent

| Subagent | Model | Job | Tools |
|---|---|---|---|
| `docs-auditor` | Sonnet | Runs one named check (`CHECK:` input), reads the matching docs-skills rules, returns JSON findings | Read, Grep, Glob, Bash, WebFetch, `mcp__docsbook__get_*` (scoped per check) |

### Read-only, with three explicit exceptions

Every check is strictly read-only — no doc page is ever edited, no setting changed. Three checks may still act, and only opt-in:

- `docs-gap-finder` opens a GitHub Issue per gap only when called with `--open-issues`.
- `docs-title-rewriter` and `docs-rank-recovery` return their rewrite **as text in the finding** — ready to paste, never applied automatically.

### Knowledge base

The `docs-auditor` subagent is the *executor* for all 17 checks; the matching [docs-skills](https://github.com/Docsbook-io/docs-skills) entries are the *knowledge base* — issue types, severities, guardrails per check:

- [docs-content-types](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-content-types/SKILL.md) · [docs-structure-templates](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-structure-templates/SKILL.md) · [docs-style-tone](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-style-tone/SKILL.md) · [docs-audience](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-audience/SKILL.md) · [docs-navigation-linking](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-navigation-linking/SKILL.md)
- [docs-accessibility](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-accessibility/SKILL.md) · [docs-media](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-media/SKILL.md) · [docs-maintenance](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-maintenance/SKILL.md) · [docs-i18n](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-i18n/SKILL.md)
- [docs-seo](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-seo/SKILL.md) · [docs-ai-retrieval](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-ai-retrieval/SKILL.md) — writing for retrieval, not just reading; the chunk is the unit of optimization, not the page
- [docs-trust-audit](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-trust-audit/SKILL.md) · [docs-pricing-consistency](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-pricing-consistency/SKILL.md) · [docs-competitor-gap](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-competitor-gap/SKILL.md)
- [docs-gap-finder](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-gap-finder/SKILL.md) · [docs-rank-recovery](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-rank-recovery/SKILL.md) · [docs-title-rewriter](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-title-rewriter/SKILL.md)

---

## docs-growth — Growth-Reasoning Pipeline

Three pinned subagents (`segment-analyst`, `funnel-analyst`, `competitor-analyst`) reason about who buys your product, how they enter it, and who competes with it — grounded in real analytics via `docs-insights` where data exists, clearly labelled `simulated` where it doesn't — then **append** what they learn back into your private knowledge base (`about/`, `.agents/product-marketing.md`, or wherever your source-of-truth lives). It never touches product code or client-facing docs.

### Install

```
/plugin marketplace add Docsbook-io/docs-claude-plugins
/plugin install docs-growth@docs-claude-plugins
```

### Quick Start

```
/enrich-audience --sot-dir about/ --workspace docsbook-io/docs
```

### Slash command

| Command | Purpose |
|---|---|
| `/enrich-audience` | Run all three lenses (or a subset via `--lenses`), reconcile findings, append to the source-of-truth |

### Subagents

| Subagent | Model | Job |
|---|---|---|
| `segment-analyst` | Sonnet | Who buys — segments, JTBD, persona gaps |
| `funnel-analyst` | Sonnet | How they enter — funnel/GTM paths, entry-point friction |
| `competitor-analyst` | Sonnet | Who competes — live market changes, positioning gaps |

### Additive, reversible, never silent

Every write is wrapped in a marked block (`<!-- BEGIN docs-audience-enricher · <lens> · <date> · evidence:<measured\|simulated> -->`) so a re-run replaces its own block instead of duplicating it, and human-authored prose outside those markers is never touched. The command does not commit or push — persisting the enriched source-of-truth is the caller's responsibility.

### Knowledge base

- [growth skill](https://github.com/Docsbook-io/docs-skills/blob/main/skills/growth/docs-audience-enricher/SKILL.md)

---

## Plugin vs. docs-skills Skill

This plugin **supersedes** the standalone [docs-sync skill](https://github.com/Docsbook-io/docs-skills/blob/main/skills/automation/docs-sync/SKILL.md) in [docs-skills](https://github.com/Docsbook-io/docs-skills). Differences:

| | docs-skills skill | This plugin |
|---|---|---|
| Format | SKILL.md + prompt files | Claude Code plugin (`.claude-plugin/plugin.json`) |
| Subagents | Text-only prompts; orchestrator picks the model | Real subagents with pinned models in YAML frontmatter |
| MCP setup | Manual `.mcp.json` edit | Automatic (bundled) |
| Install | `npx docs-skills install` + manual `.mcp.json` + `node install.mjs` | `/plugin install` + one bash one-liner |
| Tool support | Claude Code, Cursor, Codex, Copilot | Claude Code only |

If you use Cursor/Codex/Copilot, stick with the [docs-skills](https://github.com/Docsbook-io/docs-skills) catalog.

---

## Troubleshooting

**`/agents` does not list `docs-*`.**
Confirm the plugin is enabled: `/plugin list`. If listed but agents missing, re-run `/plugin install docs-sync@docs-claude-plugins` — the install step copies the agent files.

**`docs-searcher` returns no results.**
The `markdown-lsp` CLI may not be available. Run `npx markdown-lsp workspace-outline ./docs --limit 1` manually to see the failure. If `markdown-lsp` is not installed, run `npm install -g markdown-lsp` or use `npx markdown-lsp` (auto-downloads).

**Pre-push hook never fires.**
Confirm `.git/hooks/pre-push` exists and is executable. If not, run the installer one-liner above.

**Hook fires but blocks the push.**
You set `DOCS_SYNC_MODE=block` somewhere. Default is `warn` — never blocks.

**I want to skip the hook just once.**
`DOCS_SYNC_SKIP=1 git push`

---

## License

MIT © 2024 Dan Bondarev / [docsbook.io](https://docsbook.io)
