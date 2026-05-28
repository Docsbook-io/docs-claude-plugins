# docs-claude-plugins

> **Solve docs drift — one Claude Code plugin install away.**

A Claude Code plugin that bundles everything needed for a pre-push `code↔docs` drift workflow:

- **`/docs-sync`** slash command — the orchestrator
- **4 subagents with pinned models** — Haiku for planner & searcher, Sonnet for editor & curator
- **`markdown-lsp` MCP server** — local docs-graph search (registered automatically)
- **Pre-push git hook installer** — one script wires up the trigger

Works on private repos. No CI, no cloud, no account. Falls back gracefully when the AI is offline.

---

## Install

```bash
# Add this repo as a marketplace
/plugin marketplace add Docsbook-io/docs-claude-plugins

# Install the plugin
/plugin install docs-sync@docs-claude-plugins

# Then install the git hook (one time, inside your repo)
bash <(curl -fsSL https://raw.githubusercontent.com/Docsbook-io/docs-claude-plugins/main/scripts/install-git-hook.sh)
```

That's it. Every `git push` now syncs your docs.

### Verify it works

```bash
# Run the workflow once without pushing:
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
