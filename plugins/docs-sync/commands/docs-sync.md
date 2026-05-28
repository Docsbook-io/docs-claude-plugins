---
description: Detect and fix code↔docs drift in parallel git worktrees before push
allowed-tools: Bash, Read, Write, Edit, Grep, Glob, Agent
---

# /docs-sync — code↔docs drift orchestrator

Run as a pre-push workflow. Detect markdown documentation that no longer matches the current code on the branch, fix it in parallel git worktrees, and atomically amend the push.

This command orchestrates four subagents shipped with this plugin: `docs-planner` (Haiku), `docs-searcher` (Haiku), `docs-editor` (Sonnet), `docs-curator` (Sonnet). The `markdown-lsp` MCP server (bundled) provides the doc-graph search tools.

---

## Step 0 — Offer to install the pre-push hook (first run only)

Before any docs work, check whether the pre-push git hook is already installed in this repo:

```bash
HOOK=".git/hooks/pre-push"
if [ -f "$HOOK" ] && grep -q "docs-sync" "$HOOK" 2>/dev/null; then
  HOOK_INSTALLED=1
else
  HOOK_INSTALLED=0
fi
```

If `HOOK_INSTALLED=0`, tell the user in one sentence:

> "I can install a pre-push git hook so `/docs-sync` runs automatically on every `git push`. Install it now?"

If they say yes (or `--yes` was passed to the command), run:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/Docsbook-io/docs-claude-plugins/main/scripts/install-git-hook.sh)
```

If they say no, continue — `/docs-sync` still works as a manual command.

Do **not** ask again on subsequent runs (the grep on `$HOOK` is the gate). Never block the workflow on this — if the hook installer fails, log it and continue with the drift detection.

## Step 1 — Detect changed code files

```bash
BASE=$(git merge-base HEAD origin/main 2>/dev/null || git merge-base HEAD origin/master 2>/dev/null || echo "")
[ -z "$BASE" ] && { echo "[docs-sync] no remote base; nothing to compare"; exit 0; }
DIFF_FILES=$(git diff --name-only "$BASE"..HEAD -- ':(exclude)docs' ':(exclude)*.md')
[ -z "$DIFF_FILES" ] && { echo "[docs-sync] no code changes since $BASE"; exit 0; }
```

If `DIFF_FILES` is empty, exit cleanly — no work to do.

## Step 2 — Verify the markdown-lsp MCP server is reachable

It is registered by this plugin's `.mcp.json`. Run a probe:

```
Use the docs-searcher subagent for one trivial query like doc_workspace_outline to confirm MCP is up. If it returns an error, abort the workflow with a clear message — never block push silently.
```

## Step 3 — Plan clusters (Haiku via docs-planner)

Invoke the `docs-planner` subagent. Pass it:
- The output of `git diff "$BASE"..HEAD` (full diff, capped at 50KB — truncate if larger)
- The output of `find src -maxdepth 2 -type d` for tree context

Expected return: strict JSON `{"clusters":[{"name":"...","files":[...],"hypothesis":"..."}]}`.

If the agent fails or returns empty clusters, fall back to top-level dirs of the changed files (group by first path segment).

## Step 4 — Fan out per cluster (parallel)

For each cluster, in parallel:

1. Create an isolated worktree:
   ```bash
   RUN_ID=$(date +%s)
   WORKTREE=".claude/worktrees/docs-sync-${RUN_ID}-<cluster_name>"
   git worktree add "$WORKTREE" HEAD
   ```

2. Invoke `docs-searcher` (Haiku) with the cluster name, files, and cluster diff. Expected return: `{"drifted_pages":[{"path":"...","why":"...","confidence":0.0-1.0}],"confidence":0.0-1.0}`.

3. If `confidence >= 0.6` and `drifted_pages` is non-empty, invoke `docs-editor` (Sonnet) inside the worktree with the drifted_pages list and cluster diff. Editor edits the .md files in-place inside the worktree and returns a summary.

4. Capture the edits (paths + diffs) for the curator step.

Run all clusters concurrently — issue multiple Agent calls in one message.

## Step 5 — Wait for all subagents

Block until every cluster has finished. Collect all editor outputs.

## Step 6 — Curate (Sonnet, fresh context via docs-curator)

Invoke the `docs-curator` subagent with:
- The original full diff
- A structured list of every editor's hunks (path + before + after)

Curator resolves overlaps, normalizes style, drops speculative edits. Returns:

```json
{
  "final_edits": [{"path":"...","action":"replace_lines|append|prepend","range":[start,end],"content":"..."}],
  "conflicts": [{"path":"...","clusters":["..."],"resolution":"..."}],
  "dropped": [{"path":"...","reason":"..."}]
}
```

## Step 7 — Apply atomically

Apply `final_edits` to the main worktree (this repo). Then:

```bash
git add docs/
if git diff --cached --quiet; then
  echo "[docs-sync] no doc edits needed"
else
  git commit --amend --no-edit
  echo "[docs-sync] amended HEAD with $(git diff --cached --name-only | wc -l) doc files"
fi
```

On success: remove worktrees (`git worktree remove <path>`).
On error: keep worktrees in place for triage; write `.claude/worktrees/docs-sync-${RUN_ID}/log.json` with the conflict.

## Configuration (optional)

Drop a config file named `.docs-sync.json` at the repo root to override defaults:

| Field | Default | Meaning |
|---|---|---|
| `docsPath` | `./docs` | Where to look for markdown |
| `codePaths` | `["./src"]` | Watch these dirs for drift |
| `mode` | `warn` | `warn` never blocks; `block` exits non-zero on detected drift |
| `threshold` | `0.6` | Confidence floor for editor |
| `diffCap` | `0.4` | Max share of a page editor may rewrite |
| `worktreeDir` | `.claude/worktrees` | Where parallel worktrees live |

## Failure mode

- Hook in `warn` mode (default) → never blocks push; logs warning and exits 0
- Hook in `block` mode → exits non-zero on detected drift, push aborted
- Subagent timeout → skip that cluster, log it, continue with the rest
- MCP server unreachable → abort with a one-line warning; do not block push in `warn` mode
