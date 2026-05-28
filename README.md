# docs-claude-plugins

> **Two Claude Code plugins for documentation workflows.**

A marketplace with two plugins:

| Plugin | What it does |
|---|---|
| **`docs-sync`** | Pre-push `code↔docs` drift detection: planner → searcher → editor → curator. |
| **`docs-create`** | End-to-end docs bootstrap from a URL: crawl → publish to GitHub → configure Docsbook workspace. |

Both share the same principles: real Claude Code subagents with pinned models, MCP servers registered automatically via `.mcp.json`, no CI, no cloud, no account beyond GitHub + Docsbook.

---

## docs-sync — pre-push drift detection

- **`/docs-sync`** slash command — the orchestrator
- **4 subagents with pinned models** — Haiku for planner & searcher, Sonnet for editor & curator
- **`markdown-lsp` MCP server** — local docs-graph search (registered automatically)
- **Pre-push git hook installer** — one script wires up the trigger

Works on private repos. No CI, no cloud, no account. Falls back gracefully when the AI is offline.

---

## Install

Two steps. No choices, no config files, no questions.

**Step 1 — inside Claude Code, run these two slash commands:**

```
/plugin marketplace add Docsbook-io/docs-claude-plugins
/plugin install docs-sync@docs-claude-plugins
```

That registers the marketplace and enables the plugin for the current project. The subagents (`docs-planner`, `docs-searcher`, `docs-editor`, `docs-curator`) and the `markdown-lsp` MCP server become available immediately — no restart needed.

**Step 2 — type `/docs-sync` in Claude Code.**

The first time you run it, Claude will offer to install the pre-push git hook for you. Accept it. From that moment on, every `git push` automatically syncs your docs — you don't need to type `/docs-sync` again.

> If you prefer to install the hook manually instead of letting `/docs-sync` do it, run:
> ```bash
> bash <(curl -fsSL https://raw.githubusercontent.com/Docsbook-io/docs-claude-plugins/main/scripts/install-git-hook.sh)
> ```

### Verify it works

```bash
# Run the workflow once without pushing anything:
claude --print --dangerously-skip-permissions /docs-sync

# List the subagents (should include 4 docs-* ones):
/agents
```

---

## What happens on `git push`

1. **Pre-push hook fires** → calls `claude --print /docs-sync`
2. **`docs-planner` (Haiku)** clusters the diff into 1–5 thematic groups
3. **Per cluster in parallel:**
   - `docs-searcher` (Haiku) finds drifted docs pages via `markdown-lsp` MCP
   - `docs-editor` (Sonnet) edits drifted .md files inside an isolated `git worktree`
4. **`docs-curator` (Sonnet, fresh context)** merges all worktree edits, resolves overlaps, drops speculative changes
5. **Apply atomically** → `git commit --amend` adds docs to your push

Per-run cost: ~$0.05–0.15. Wall time: 10–20s for typical changes.

---

## Components

### `/docs-sync` command

[commands/docs-sync.md](commands/docs-sync.md) — the orchestrator. Reads the diff, delegates to subagents, applies the final patch set.

### Subagents (with pinned models)

| Subagent | Model | Job | Tools |
|---|---|---|---|
| `docs-planner` | Haiku | Cluster a code diff into thematic groups | Read, Grep, Glob |
| `docs-searcher` | Haiku | Find docs pages that drifted from one cluster | Read + `markdown-lsp` MCP tools |
| `docs-editor` | Sonnet | Edit drifted .md inside a git worktree | Read, Edit, Grep, Glob, Bash |
| `docs-curator` | Sonnet | Merge editor outputs, resolve overlaps | Read, Edit, Grep, Glob, Bash |

The model is pinned in each subagent's frontmatter — invoking `docs-planner` always runs on Haiku, no matter what the parent session uses.

These subagents are also published standalone at [docs-subagents](https://github.com/Docsbook-io/docs-subagents) for users who don't want the full plugin.

### MCP server: `markdown-lsp`

Registered automatically via [.mcp.json](.mcp.json). Provides 9 tools over stdio (`doc_outline`, `doc_workspace_outline`, `doc_search_text`, `doc_search_symbols`, `doc_search_links_to`, `doc_search_links_from`, `doc_resolve_link`, `doc_get_section`, `doc_search_paths`). Source: [markdown-lsp-mcp](https://github.com/Docsbook-io/markdown-lsp-mcp).

### Pre-push hook

[scripts/install-git-hook.sh](scripts/install-git-hook.sh) writes `.git/hooks/pre-push` for the current repo. The hook calls `claude --print /docs-sync` and respects env vars:

| Variable | Effect |
|---|---|
| `DOCS_SYNC_SKIP=1` | Skip the hook for one push |
| `DOCS_SYNC_MODE=block` | Fail push on AI failure or detected drift |

Default mode is `warn` — the hook never blocks push.

---

## Configuration

Drop an optional config file named `.docs-sync.json` at the repo root:

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

---

## docs-create — end-to-end docs bootstrap

```bash
/plugin marketplace add Docsbook-io/docs-claude-plugins
/plugin install docs-create@docs-claude-plugins
```

The `docs-create` plugin ships:

- **`/docs-create`** — full pipeline: crawl URL → publish GitHub → configure Docsbook workspace
- **`/docs-from-site`** — crawl only (stage 1)
- **`/docs-publish`** — publish a local folder (stage 2)
- **`/docs-setup-workspace`** — configure Docsbook via MCP (stage 3)

### Subagents (with pinned models)

| Subagent | Model | Job | Tools |
|---|---|---|---|
| `docs-site-crawler` | Haiku | Crawl product URL → Markdown + `_branding.json` | Read, Write, Bash, WebFetch |
| `docs-publisher` | Haiku | `git init` + `gh repo create` + push via HTTPS | Bash, Read |
| `docs-workspace-configurator` | Sonnet | Branding/UI/AI/SEO via Docsbook MCP | Read + Docsbook MCP tools |

### MCP servers (bundled)

Both registered automatically via `plugins/docs-create/.mcp.json`:

| MCP | Transport | Purpose |
|---|---|---|
| `markdown-lsp` | stdio (`npx markdown-lsp-mcp`) | Local doc-graph search (same one as `docs-sync`) |
| `docsbook` | HTTP (`https://docsbook.io/api/mcp/server`) | Workspace configuration: branding, UI, AI, SEO, languages |

The `docsbook` MCP needs OAuth on first use — Claude Code will prompt for it the first time a subagent calls a `mcp__docsbook__*` tool.

### Quick start

```bash
# After /plugin install docs-create@docs-claude-plugins
/docs-create https://example.com
```

One command. Three subagents. Live docs at `https://docsbook.io/<you>/<example>` in under a minute (Docsbook indexing time depends).

### Knowledge base

The pinned subagents are the *executors*. The corresponding [docs-skills](https://github.com/Docsbook-io/docs-skills) entries are the *knowledge base* — tips, edge cases, output contracts, writing rules. Read the skill *before* tuning a subagent's behaviour:

- [docs-from-site](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-from-site/SKILL.md)
- [docs-publish](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-publish/SKILL.md)
- [docs-setup-workspace](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-setup-workspace/SKILL.md)
- [docs-create](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-create/SKILL.md)

---

## How it differs from the docs-sync skill in `docs-skills`

This plugin **supersedes** the standalone `/docs-sync` skill in [docs-skills](https://github.com/Docsbook-io/docs-skills). Differences:

| | docs-skills skill | This plugin |
|---|---|---|
| Format | SKILL.md + prompt files | Claude Code plugin (`.claude-plugin/plugin.json`) |
| Subagents | Text-only prompts; orchestrator picks the model | Real subagents with pinned models in YAML frontmatter |
| MCP setup | Manual `.mcp.json` edit | Automatic (bundled) |
| Install | `npx docs-skills install` + manual `.mcp.json` + `node install.mjs` | `/plugin install` + one bash one-liner |
| Tool support | Claude Code, Cursor, Codex, Copilot | Claude Code only |

If you use Cursor/Codex/Copilot, stick with the [docs-skills](https://github.com/Docsbook-io/docs-skills) catalog.

---

## License

MIT © 2024 Dan Bondarev / [docsbook.io](https://docsbook.io)
