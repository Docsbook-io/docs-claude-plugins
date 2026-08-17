---
name: docs-sync
description: Detect and fix code↔docs drift before every push. Orchestrates a four-subagent pipeline — Haiku planner clusters changed code files, Haiku searchers find drifted pages per cluster in parallel worktrees, Sonnet editors rewrite the affected sections, and a Sonnet curator merges everything atomically into the commit. Works as a manual command or as an auto-installed pre-push git hook.
metadata:
  version: 1.0.0
  category: automation
  mode: refactor
  requires_docsbook_mcp: false
  produces_files:
    - docs/**/*.md
  keywords: [sync, drift, pre-push, subagents, worktree, markdown, code-docs]
---

# docs-sync — code↔docs drift orchestrator

Orchestrates four subagents (planner, searcher, editor, curator) to detect and fix documentation drift in parallel git worktrees, then atomically amend the commit before push.

## Workflow

1. **Stale-worktree cleanup** — unconditionally remove any leftover `docs-sync-*` worktrees from previous runs before doing anything else. They are always garbage.
2. **Hook check** — on first run, offer to install a pre-push git hook so the command runs automatically. On subsequent runs, skip this prompt silently.
3. **Detect changed code + docs layout** — compute the diff between HEAD and the remote merge-base. If no non-documentation files changed, exit cleanly. Also detect whether `docs/` is a regular folder or a git submodule (changes the apply/commit flow at step 8).
4. **MCP probe** — verify the `markdown-lsp` MCP server is reachable. Abort with a clear error if it is not; never block push silently.
5. **Plan clusters (Haiku)** — the `docs-planner` subagent groups changed code files into semantic clusters and produces a hypothesis per cluster about which docs sections might have drifted.
6. **Fan out per cluster (parallel)** — for each cluster, create an isolated git worktree (in the main repo for regular `docs/`, or inside the submodule when `docs/` is a submodule), then invoke `docs-searcher` (Haiku) to locate drifted pages with a confidence score.
7. **Edit drifted pages (Sonnet)** — for each cluster whose confidence meets the threshold, invoke `docs-editor` (Sonnet) in the worktree to rewrite the affected sections.
8. **Curate (Sonnet)** — the `docs-curator` subagent receives all editor hunks, resolves cross-cluster conflicts, normalizes style, drops speculative edits AND verifies grounding of CLI commands / URLs / version numbers against the original diff, then produces a final edit list.
9. **Apply atomically (branches on docs layout):**
   - **Regular folder:** apply final edits in main repo → `git add docs/` → `git commit --amend --no-edit`.
   - **Submodule:** apply final edits in a submodule worktree → commit inside the submodule → ask the user before pushing to the submodule's public remote → on consent, push + fast-forward the submodule + amend HEAD in the parent.
10. **Cleanup** — remove worktrees unconditionally on success or no-op; keep them on `awaiting_push_consent` or hard failure for triage.
11. **Emit structured report** — final JSON to stdout with `status`, `submodule_commit`, `main_repo_commit`, `remote_pushes_pending`, `worktrees_cleaned`, `human_review_needed`. Parent orchestrators rely on this contract.

## Guardrails

- Never block a push in `warn` mode (the default). Only exit non-zero when the repo explicitly sets `mode: block` in `.docs-sync.json`.
- Never amend if the curated edit list is empty — log "no doc edits needed" and exit cleanly.
- Cap the diff passed to the planner at 50 KB; truncate larger diffs with a note.
- No single editor pass may rewrite more than the configured `diffCap` fraction (default 0.4) of a page — edits beyond that threshold are dropped by the curator.
- On subagent timeout, skip that cluster and log it; do not abort the remaining clusters.
- If the MCP server is unreachable, abort the workflow and print a one-line warning; do not silently pass.
- Keep worktrees in place on `awaiting_push_consent` or hard failure for triage. Clean them up unconditionally on success or no-op.
- **Submodule public push needs consent.** When `docs/` is a submodule, pushing to its remote is a public action — always ask the user with a concrete one-line offer naming the SHA, remote and branch before pushing. The local commit is safe to do without asking; only the push needs consent. Override with `submoduleAutoPush: true` in `.docs-sync.json` (CI only).
- **No fabricated CLI commands, URLs, or version numbers.** Editors and curator must ground every concrete claim in the original diff, the project's README/package.json, or the existing page. When in doubt, link the README instead of guessing the install command.

## MCP Tools

| Tool | Purpose |
|------|---------|
| `doc_workspace_outline` | Probe liveness of the markdown-lsp MCP server |
| `doc_search_text` | Locate documentation sections relevant to a code cluster |
| `doc_search_paths` | Enumerate candidate pages by path pattern |
| `doc_resolve_link` | Validate internal links before and after edits |
| `doc_outline` | Read page structure to plan targeted edits |

## Acceptance Criteria

- [ ] Stale `docs-sync-*` worktrees from previous runs removed silently before any work
- [ ] Pre-push hook offer shown only on first run; subsequent runs skip it
- [ ] Clean exit with no edits when no non-doc code files changed
- [ ] MCP probe runs before any subagent invocation; failure aborts with a message
- [ ] Submodule detection runs before worktree creation; submodule worktrees created inside the submodule, not the main repo
- [ ] Planner returns clusters; fallback to top-level dir grouping on failure
- [ ] All cluster worktrees created and searched in parallel
- [ ] Editor only invoked for clusters with confidence >= threshold (default 0.6)
- [ ] Curator resolves conflicts across clusters, drops speculative edits, AND drops fabricated CLI commands / URLs / versions not present in the diff or repo metadata
- [ ] Amend commits only when the curated edit list is non-empty
- [ ] Warn-mode never exits non-zero; block-mode exits non-zero on detected drift
- [ ] For submodule case: local commit happens without user prompt; public push gated by a concrete consent question naming SHA, remote and branch
- [ ] Worktrees removed unconditionally on success or no-op; preserved on `awaiting_push_consent` or hard failure with a log file
- [ ] Final stdout is a single structured JSON report with status, commits, pending pushes, and human-review flags
