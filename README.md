# docs-claude-plugins

> **Claude Code plugins for documentation workflows — subagents, MCP servers, and git hooks bundled together.**

A marketplace with two plugins. Both follow the same rule: **install the plugin, and the subagents, MCP servers, and (where applicable) the git hook are wired automatically.** No manual `.mcp.json` editing, no hand-rolled hook scripts.

| Plugin | What it does |
|---|---|
| **`docs-sync`** | Pre-push `code↔docs` drift detection: planner → searcher → editor → curator. |
| **`docs-create`** | End-to-end docs bootstrap from a URL: crawl → publish to GitHub → configure Docsbook workspace. |

---

## What a plugin install gives you

`/plugin install <name>@docs-claude-plugins` is the single source of truth. One command sets up:

| Piece | Where it lands | Set up automatically? |
|---|---|---|
| Subagents (`.md` with pinned model + tools) | `.claude/agents/` in the current project | ✅ Yes, on install |
| MCP servers (`markdown-lsp`, optionally `docsbook`) | Registered in the session from the plugin's `.mcp.json` | ✅ Yes, on install |
| Slash command (`/docs-sync`, `/docs-create`, …) | Available in the session | ✅ Yes, on install |
| Pre-push git hook (docs-sync only) | `.git/hooks/pre-push` | ⚠️ Offered on first `/docs-sync` run — accept once |

Compared to installing the same pieces by hand:

| Action | This plugin | `npx docs-subagents install` | `npx docs-skills install` |
|---|---|---|---|
| Copies subagents | ✅ | ✅ | ❌ |
| Registers MCP automatically | ✅ | ❌ (edit `.mcp.json` yourself) | ❌ |
| Installs pre-push hook | ✅ (one accept) | ❌ | ❌ |
| Ships a `/docs-sync` orchestrator | ✅ | ❌ | ❌ |
| Ships SKILL.md knowledge base | ❌ | ❌ | ✅ |
| Works in Cursor/Codex/Copilot | ❌ Claude Code only | ✅ | ✅ |

The three installers do not conflict — running all three just gives you subagents (from the plugin), the same files again (from `docs-subagents`, harmlessly overwriting), and a separate set of SKILL.md guides (from `docs-skills`).

---

## docs-sync — pre-push drift detection

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

### What happens on `git push`

1. Pre-push hook fires → calls `claude --print /docs-sync`.
2. `docs-planner` (Haiku) clusters the diff into 1–5 thematic groups.
3. Per cluster, in parallel:
   - `docs-searcher` (Haiku) finds drifted docs pages via the `markdown-lsp` MCP.
   - `docs-editor` (Sonnet) edits drifted `.md` files inside an isolated `git worktree`.
4. `docs-curator` (Sonnet, fresh context) merges all worktree edits, resolves overlaps, drops speculative changes.
5. Final patch is applied via `git commit --amend` and pushed.

Per-run cost: ~$0.05–0.15. Wall time: 10–20s for typical changes.

### Components

| Component | File | Purpose |
|---|---|---|
| `/docs-sync` command | [commands/docs-sync.md](plugins/docs-sync/commands/docs-sync.md) | Orchestrator — reads diff, delegates to subagents, applies the final patch |
| `docs-planner` (Haiku) | [agents/docs-planner.md](plugins/docs-sync/agents/docs-planner.md) | Cluster the diff |
| `docs-searcher` (Haiku) | [agents/docs-searcher.md](plugins/docs-sync/agents/docs-searcher.md) | Find drifted pages via `markdown-lsp` MCP |
| `docs-editor` (Sonnet) | [agents/docs-editor.md](plugins/docs-sync/agents/docs-editor.md) | Edit `.md` files inside a worktree |
| `docs-curator` (Sonnet) | [agents/docs-curator.md](plugins/docs-sync/agents/docs-curator.md) | Merge editor outputs |
| `markdown-lsp` MCP | [.mcp.json](plugins/docs-sync/.mcp.json) | 9 doc-graph tools (`doc_outline`, `doc_search_text`, …) over stdio. Source: [markdown-lsp-mcp](https://github.com/Docsbook-io/markdown-lsp-mcp) |
| Hook installer | [scripts/install-git-hook.sh](plugins/docs-sync/scripts/install-git-hook.sh) | Writes `.git/hooks/pre-push` |

The model is pinned in each subagent's YAML frontmatter — invoking `docs-planner` always runs on Haiku, no matter what the parent session uses.

The same subagents are also published standalone at [docs-subagents](https://github.com/Docsbook-io/docs-subagents) for users who don't want the full plugin. See that repo's README for the by-hand setup path.

### Hook environment variables

| Variable | Effect |
|---|---|
| `DOCS_SYNC_SKIP=1` | Skip the hook for one push |
| `DOCS_SYNC_MODE=block` | Fail push on AI failure or detected drift |

Default mode is `warn` — the hook never blocks push.

### Optional config

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

---

## docs-create — end-to-end docs bootstrap

```
/plugin marketplace add Docsbook-io/docs-claude-plugins
/plugin install docs-create@docs-claude-plugins
```

Same install model as `docs-sync` — subagents copied to `.claude/agents/`, two MCP servers registered automatically from `plugins/docs-create/.mcp.json`. No git hook for this plugin.

### Slash commands

| Command | Purpose |
|---|---|
| `/docs-create` | Full pipeline: crawl URL → publish GitHub → configure Docsbook workspace |
| `/docs-from-site` | Crawl only (stage 1) |
| `/docs-publish` | Publish a local folder (stage 2) |
| `/docs-setup-workspace` | Configure Docsbook via MCP (stage 3) |

### Subagents

| Subagent | Model | Job | Tools |
|---|---|---|---|
| `docs-site-crawler` | Haiku | Crawl product URL → Markdown + `_branding.json` | Read, Write, Bash, WebFetch |
| `docs-publisher` | Haiku | `git init` + `gh repo create` + push via HTTPS | Bash, Read |
| `docs-workspace-configurator` | Sonnet | Branding / UI / AI / SEO via Docsbook MCP | Read + Docsbook MCP tools |

### MCP servers

Both are registered automatically:

| MCP | Transport | Purpose |
|---|---|---|
| `markdown-lsp` | stdio (`npx markdown-lsp-mcp`) | Local doc-graph search (same as `docs-sync`) |
| `docsbook` | HTTP (`https://docsbook.io/api/mcp/server`) | Workspace configuration: branding, UI, AI, SEO, languages |

The `docsbook` MCP needs OAuth on first use. Claude Code prompts for it the first time a subagent calls a `mcp__docsbook__*` tool.

### Quick start

```
/docs-create https://example.com
```

One command. Three subagents. Live docs at `https://docsbook.io/<you>/<example>` in under a minute (Docsbook indexing time depends).

### Knowledge base

The pinned subagents are the *executors*. The matching [docs-skills](https://github.com/Docsbook-io/docs-skills) entries are the *knowledge base* — tips, edge cases, output contracts, writing rules. Read the skill *before* tuning a subagent's behaviour:

- [docs-from-site](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-from-site/SKILL.md)
- [docs-publish](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-publish/SKILL.md)
- [docs-setup-workspace](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-setup-workspace/SKILL.md)
- [docs-create](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-create/SKILL.md)

---

## How this differs from the standalone `docs-sync` skill in `docs-skills`

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

## Troubleshooting

**`/agents` does not list `docs-*`.** Confirm the plugin is enabled: `/plugin list`. If listed but agents missing, re-run `/plugin install docs-sync@docs-claude-plugins` — the install step copies the agent files.

**`docs-searcher` returns no results.** The `markdown-lsp` MCP probably did not start. Check `/mcp` — `markdown-lsp` should be `connected`. If it shows an error, run `npx -y markdown-lsp-mcp --docs ./docs` manually to see the failure.

**Pre-push hook never fires.** Confirm `.git/hooks/pre-push` exists and is executable. If not, run the installer one-liner above.

**Hook fires but blocks the push.** You set `DOCS_SYNC_MODE=block` somewhere. Default is `warn` — never blocks.

**I want to skip the hook just once.** `DOCS_SYNC_SKIP=1 git push`.

---

## License

MIT © 2024 Dan Bondarev / [docsbook.io](https://docsbook.io)
