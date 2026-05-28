---
description: Detect and fix code↔docs drift in parallel git worktrees before push
allowed-tools: Bash, Read, Write, Edit, Grep, Glob, Agent
argument-hint: [optional free-text intent, e.g. "remove all mentions of the legacy export feature"]
---

# /docs-sync — code↔docs drift orchestrator

Two ways to run this command:

- **Diff mode (default, no arguments).** A pre-push workflow. Detect markdown that no longer matches the current code on the branch, fix it in parallel git worktrees, and atomically amend the push. Triggered by `git push` via the bundled PreToolUse hook.
- **Intent mode (`$ARGUMENTS` is non-empty).** A user-driven workflow. The user describes in plain text what should change in the docs — e.g. *"remove all mentions of the legacy export feature"*, *"sync the auth section to describe the new SSO flow"*, *"drop the comparison with feature X from every alternatives page"*. The same four-subagent pipeline runs, but inputs are derived from the intent string instead of a git diff. No commit is amended, no push gate is touched.

In **both** modes, this command orchestrates the same four subagents shipped with this plugin: `docs-planner` (Haiku), `docs-searcher` (Haiku), `docs-editor` (Sonnet), `docs-curator` (Sonnet). The `markdown-lsp` MCP server (bundled) provides the doc-graph search tools.

**You MUST run the pipeline through these subagents in both modes.** Do not silently fall back to doing the work yourself just because there is no diff — the whole point of the command is that the four agents handle planning, search, editing and curation in parallel. If you ever find yourself reading and editing docs directly without spawning `docs-planner` / `docs-searcher` / `docs-editor` / `docs-curator`, stop and re-enter the pipeline.

## Mode selection

```text
INTENT = "$ARGUMENTS"           # raw text passed after /docs-sync
if INTENT is empty or whitespace-only:
    MODE = "diff"
else:
    MODE = "intent"
```

- `MODE=diff` → run Steps 0a, 0b, 1, 2, 3, 4, 5, 6, 7, 8, 9 as written.
- `MODE=intent` → run Steps 0a, 2, 3, 4, 5, 6, 7, 8, 9. **Skip Step 0b** (no push gate to clear) and **skip Step 1** (no diff to compute). Where steps below say "the diff" or "cluster diff", substitute the intent text — see the per-step **Intent mode** boxes.

Set the carrier variables for downstream steps:

```bash
if [ -n "$INTENT" ]; then
  MODE="intent"
  DIFF_CONTEXT="USER INTENT: $INTENT"     # passed wherever the diff would normally go
  DIFF_FILES=""                            # no changed code files
else
  MODE="diff"
fi
```

---

## Step 0a — Clean up stale worktrees from previous runs

Before doing anything, remove leftover worktrees from previous `/docs-sync` runs. They are safe to delete — each run creates fresh ones.

```bash
# List leftover docs-sync worktrees (any RUN_ID, any cluster) and force-remove them
for wt in $(git worktree list --porcelain | awk '/^worktree .*\.claude\/worktrees\/docs-sync-/ {print $2}'); do
  git worktree remove --force "$wt" 2>/dev/null
done
# Also clean any stale `/tmp/docs-sync-*` worktrees if they exist
for wt in /tmp/docs-sync-*; do
  [ -d "$wt" ] && git worktree remove --force "$wt" 2>/dev/null
done
git worktree prune
```

This step is unconditional and silent on success. Never ask the user about it — leftover worktrees are always garbage.

> **Intent mode skips Step 0b.** The push-gate marker is only relevant when docs-sync runs because of a git push. When the user explicitly invokes `/docs-sync <intent>`, do not touch the marker file.

## Step 0b — Mark this session as docs-synced  *(diff mode only)*

This plugin ships a `PreToolUse` hook (`hooks/pre-tool-git-push-docs-sync.sh`)
that blocks any `git push` issued by Claude until docs-sync has run in the
current session. Once you've finished the workflow below successfully, drop a
marker file so the next push in this session is not blocked again:

```bash
touch "/tmp/.docs-sync-done-${CLAUDE_SESSION_ID:-$(date +%s)}"
```

The marker is consumed (deleted) on first use, so each new code change still
triggers a fresh docs-sync before push. If the user wants to skip the guard for
a single push without running this command, they can prefix:

```bash
DOCS_SYNC_DONE=1 git push origin main
```

To disable the guard entirely in this environment, set `DOCS_SYNC_SKIP=1`.

> **Note.** The legacy `scripts/install-git-hook.sh` (real `.git/hooks/pre-push`)
> is still shipped for users who push from a plain terminal outside Claude Code.
> It runs `claude --print /docs-sync` in a separate headless session and is **not**
> recommended when you're already working inside an interactive Claude Code
> session — the PreToolUse hook is the in-session equivalent and keeps docs-sync
> running in the same context as the change.

## Step 1 — Detect changed code files and docs layout  *(diff mode only)*

> **Intent mode skips Step 1 entirely.** There is no diff to compute. Still detect the docs submodule layout — copy the `DOCS_IS_SUBMODULE` / `SUBMODULE_REMOTE` / `SUBMODULE_BRANCH` detection block below and run it, because Step 4 and Step 7 still need it. Just do not run the `git diff` block.

```bash
BASE=$(git merge-base HEAD origin/main 2>/dev/null || git merge-base HEAD origin/master 2>/dev/null || echo "")
[ -z "$BASE" ] && { echo "[docs-sync] no remote base; nothing to compare"; exit 0; }
DIFF_FILES=$(git diff --name-only "$BASE"..HEAD -- ':(exclude)docs' ':(exclude)*.md')
[ -z "$DIFF_FILES" ] && { echo "[docs-sync] no code changes since $BASE"; exit 0; }
```

If `DIFF_FILES` is empty, exit cleanly — no work to do.

**Detect whether `docs/` is a git submodule** — this changes the apply/commit/push flow at Step 7:

```bash
if [ -f .gitmodules ] && git config -f .gitmodules --get-regexp 'submodule\..*\.path' | grep -qE '\bdocs(/|$)'; then
  DOCS_IS_SUBMODULE=1
  SUBMODULE_REMOTE=$(git -C docs config --get remote.origin.url 2>/dev/null || echo "")
  SUBMODULE_BRANCH=$(git -C docs rev-parse --abbrev-ref HEAD 2>/dev/null)
  # If submodule is on detached HEAD, find the branch the parent expects
  [ "$SUBMODULE_BRANCH" = "HEAD" ] && SUBMODULE_BRANCH=$(git config -f .gitmodules submodule.docs.branch || echo "main")
else
  DOCS_IS_SUBMODULE=0
fi
```

Carry `DOCS_IS_SUBMODULE`, `SUBMODULE_REMOTE`, `SUBMODULE_BRANCH` to Step 7. The submodule case requires:
1. Worktrees created inside the submodule (not the main repo's `.claude/worktrees`)
2. A commit inside the submodule and a push to its remote (gated by user confirmation)
3. A separate commit in the main repo that bumps the submodule SHA

## Step 2 — Verify the markdown-lsp MCP server is reachable

It is registered by this plugin's `.mcp.json`. Run a probe:

```
Use the docs-searcher subagent for one trivial query like doc_workspace_outline to confirm MCP is up. If it returns an error, abort the workflow with a clear message — never block push silently.
```

## Step 3 — Plan clusters (Haiku via docs-planner)

Invoke the `docs-planner` subagent.

**Diff mode — pass it:**
- A line `MODE: diff`
- The output of `git diff "$BASE"..HEAD` (full diff, capped at 50KB — truncate if larger)
- The output of `find src -maxdepth 2 -type d` for tree context

**Intent mode — pass it:**
- A line `MODE: intent`
- A line `INTENT: <the raw $ARGUMENTS string>`
- The output of `find docs -maxdepth 3 -type d` for docs tree context (planner clusters by docs area, not src area, in intent mode)
- Optionally the output of `find src -maxdepth 2 -type d` if the intent references code concepts

Expected return in both modes: strict JSON `{"clusters":[{"name":"...","files":[...],"hypothesis":"..."}]}`. In intent mode `files` may be empty (planner did not see code changes) — that's fine; the searcher will discover candidate doc paths from MCP anyway.

If the agent fails or returns empty clusters:
- Diff mode → fall back to top-level dirs of the changed files (group by first path segment).
- Intent mode → fall back to a single cluster `{"name":"intent","files":[],"hypothesis":"$INTENT"}` so the pipeline still runs end-to-end.

## Step 4 — Fan out per cluster (parallel)

For each cluster, in parallel:

1. Create an isolated worktree. **The worktree must be created in the repo whose `.md` files the editors will touch.** If `docs/` is a regular folder, that's the main repo. If `docs/` is a submodule, the worktree must live inside the submodule on its tracked branch (so the resulting commit can be pushed to the submodule's own remote):
   ```bash
   RUN_ID=$(date +%s)
   if [ "$DOCS_IS_SUBMODULE" = "1" ]; then
     # Create worktree inside the submodule, detached from its tracked branch
     WORKTREE=".claude/worktrees/docs-sync-${RUN_ID}-<cluster_name>"
     git -C docs worktree add --detach "../$WORKTREE" "$SUBMODULE_BRANCH"
   else
     WORKTREE=".claude/worktrees/docs-sync-${RUN_ID}-<cluster_name>"
     git worktree add "$WORKTREE" HEAD
   fi
   ```

   When `DOCS_IS_SUBMODULE=1`, pass the editor the worktree path **without** a `docs/` prefix — inside that worktree, `ai/source-of-truth.md` is at root, not under `docs/`.

2. Invoke `docs-searcher` (Haiku) with the cluster name, files, and **the cluster payload**:
   - Diff mode → the cluster's slice of the unified diff.
   - Intent mode → a block `MODE: intent\nINTENT: <text>` plus the cluster's `hypothesis` line.

   Expected return in both modes: `{"drifted_pages":[{"path":"...","why":"...","confidence":0.0-1.0}],"confidence":0.0-1.0}`.

3. If `confidence >= 0.6` and `drifted_pages` is non-empty, invoke `docs-editor` (Sonnet) inside the worktree with the drifted_pages list and the cluster payload:
   - Diff mode → the cluster diff (current behaviour).
   - Intent mode → `MODE: intent\nINTENT: <text>` plus the cluster `hypothesis`. The editor treats the intent as the change spec — it must justify every edit by the intent, not invent unrelated improvements.

   Editor edits the .md files in-place inside the worktree and returns a summary.

4. Capture the edits (paths + diffs) for the curator step.

Run all clusters concurrently — issue multiple Agent calls in one message.

> **Intent mode reminder.** Even when the intent is short ("remove every mention of feature X"), still spawn one `docs-searcher` and one `docs-editor` per cluster. Do not bypass the subagents and edit files yourself "because it's just a find-and-replace". The subagents enforce the 40% diff cap, MCP-grounded search, and the docs-skills checklist — losing those is the whole regression the user wants fixed.

## Step 5 — Wait for all subagents

Block until every cluster has finished. Collect all editor outputs.

## Step 6 — Curate (Sonnet, fresh context via docs-curator)

Invoke the `docs-curator` subagent with:
- **The grounding source.** In diff mode: the original full diff. In intent mode: a block `MODE: intent\nINTENT: <text>`. The curator uses this to decide which edits are "grounded" (justified by the source) vs "speculative" (out of scope).
- A structured list of every editor's hunks (path + before + after).

Curator resolves overlaps, normalizes style, drops speculative edits. Returns:

```json
{
  "final_edits": [{"path":"...","action":"replace_lines|append|prepend","range":[start,end],"content":"..."}],
  "conflicts": [{"path":"...","clusters":["..."],"resolution":"..."}],
  "dropped": [{"path":"...","reason":"..."}]
}
```

## Step 7 — Apply atomically

Apply `final_edits` from the curator. The flow branches on `DOCS_IS_SUBMODULE`:

### Step 7a — `docs/` is a regular folder (DOCS_IS_SUBMODULE=0)

Apply `final_edits` to the main worktree. Then:

```bash
git add docs/
if git diff --cached --quiet; then
  echo "[docs-sync] no doc edits needed"
  STATUS="no_op"
else
  if [ "$MODE" = "intent" ]; then
    # Intent mode: stand-alone commit, no amend (the user did not author a parent commit for this run)
    git commit -m "docs: $(echo "$INTENT" | head -c 72)

    Generated by /docs-sync intent mode.
    Intent: $INTENT"
  else
    # Diff mode: amend the user's HEAD so the docs commit ships with the code commit
    git commit --amend --no-edit
  fi
  echo "[docs-sync] committed $(git diff HEAD~..HEAD --name-only | wc -l) doc files"
  STATUS="success"
  MAIN_COMMIT=$(git rev-parse HEAD)
fi
```

### Step 7b — `docs/` is a submodule (DOCS_IS_SUBMODULE=1)

Editors wrote their changes inside per-cluster submodule worktrees. To land them on disk, pick one worktree as the "merge worktree", apply curator's `final_edits` there (resolving any cross-cluster overlaps using curator's authoritative list), then commit + ask for push permission + bump the parent.

```bash
# Pick the first cluster's worktree as the merge target
MERGE_WT=".claude/worktrees/docs-sync-${RUN_ID}-<first_cluster>"
# Apply curator's final_edits into $MERGE_WT (each entry: path/action/range/content).
# Then:
cd "$MERGE_WT"
git add -A
if git diff --cached --quiet; then
  echo "[docs-sync] no doc edits needed"
  STATUS="no_op"
else
  if [ "$MODE" = "intent" ]; then
    git commit -m "docs: $(echo "$INTENT" | head -c 72)

    Generated by /docs-sync intent mode.
    Intent: $INTENT"
  else
    git commit -m "docs: sync to code changes in $(git -C ../../.. rev-parse --short HEAD)

    Generated by /docs-sync. See main repo commit for code diff."
  fi
  SUBMODULE_COMMIT=$(git rev-parse HEAD)
  echo "[docs-sync] committed $(git diff HEAD~..HEAD --name-only | wc -l) files in submodule: $SUBMODULE_COMMIT"
  STATUS="commit_local"   # not pushed yet
fi
cd -
```

**Confirmation gate — public push to submodule remote.**

Pushing into the submodule's remote (e.g. `Docsbook-io/docs`) is a public, externally-visible action. Always ask the user before pushing, with a concrete one-line offer:

> "Push docs commit `<SUBMODULE_COMMIT_SHORT>` to `<SUBMODULE_REMOTE>` `<SUBMODULE_BRANCH>` and bump the submodule pointer in this repo?"

If the user accepts:

```bash
cd "$MERGE_WT"
# The worktree is detached HEAD — push the commit to the tracked branch on the remote
git push origin "HEAD:refs/heads/${SUBMODULE_BRANCH}"
cd -

# Now fast-forward the submodule's checked-out branch and bump the parent
git -C docs fetch origin "$SUBMODULE_BRANCH"
git -C docs checkout "$SUBMODULE_BRANCH"
git -C docs reset --hard "origin/${SUBMODULE_BRANCH}"

# Amend HEAD of the main repo to include the new submodule pointer
git add docs
git commit --amend --no-edit
MAIN_COMMIT=$(git rev-parse HEAD)
STATUS="success"
```

If the user declines: stop with `STATUS="awaiting_push_consent"`, leave the merge worktree intact (skip Step 8 cleanup for it), and emit the final report with the pending action listed in `remote_pushes_pending`.

## Step 8 — Cleanup (unconditional on success or no_op)

Remove worktrees and clean up the per-run directory. This runs whether `STATUS=success` or `STATUS=no_op`. **Skip only when `STATUS=awaiting_push_consent` or `STATUS=blocked`** — those need triage worktrees in place.

```bash
if [ "$STATUS" = "success" ] || [ "$STATUS" = "no_op" ]; then
  if [ "$DOCS_IS_SUBMODULE" = "1" ]; then
    for wt in $(git -C docs worktree list --porcelain | awk '/^worktree .*docs-sync-'"$RUN_ID"'/ {print $2}'); do
      git -C docs worktree remove --force "$wt" 2>/dev/null
    done
    git -C docs worktree prune
  else
    for wt in $(git worktree list --porcelain | awk '/^worktree .*docs-sync-'"$RUN_ID"'/ {print $2}'); do
      git worktree remove --force "$wt" 2>/dev/null
    done
    git worktree prune
  fi
fi
```

On error: keep worktrees in place for triage; write `.claude/worktrees/docs-sync-${RUN_ID}/log.json` with the conflict.

## Step 9 — Emit structured final report

Print a single JSON object to stdout — nothing else after this. The format is part of the public contract so parent orchestrators (and CI) can rely on it:

```json
{
  "status": "success | no_op | partial | awaiting_push_consent | blocked",
  "mode": "diff | intent",
  "intent": "<the $ARGUMENTS string, or empty string in diff mode>",
  "run_id": "<RUN_ID>",
  "docs_is_submodule": true,
  "drift_detected": true,
  "files_changed": ["ai/source-of-truth.md", "ai/mcp.md"],
  "submodule_commit": "abc1234",
  "main_repo_commit": "def5678",
  "remote_pushes_pending": [
    { "repo": "Docsbook-io/docs", "branch": "main", "ref": "abc1234" }
  ],
  "worktrees_cleaned": 1,
  "worktrees_kept": [],
  "human_review_needed": false,
  "review_reasons": []
}
```

Field rules:

- `status=success` requires: edits committed AND (no remote pushes pending OR all pushes done) AND all worktrees cleaned.
- `status=no_op` means: no drift detected or curator returned an empty edit list. `files_changed=[]`. Worktrees cleaned.
- `status=partial` means: some clusters edited, some skipped due to timeouts/diff-cap/etc. List skipped clusters in `review_reasons`.
- `status=awaiting_push_consent` means: local commit made (`submodule_commit` set), public push declined or not yet asked. Worktree kept until consent.
- `status=blocked` means: hard failure (MCP unreachable, curator returned conflicting edits, etc.). Worktrees kept for triage; `review_reasons` lists why.
- `human_review_needed=true` whenever the curator's `dropped` list is non-empty OR any editor flagged a TODO comment. Reasons listed verbatim.
- `submodule_commit` / `main_repo_commit` are omitted (not null) when the corresponding commit did not happen.

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
| `submoduleAutoPush` | `false` | If `true`, skip the consent prompt and push to the submodule remote automatically. Set this only in CI or trusted environments. |
| `submoduleBranch` | auto | Override the submodule branch to push to (default: branch from `.gitmodules`, or `main`). |

## Failure mode

- Hook in `warn` mode (default) → never blocks push; logs warning and exits 0
- Hook in `block` mode → exits non-zero on detected drift, push aborted
- Subagent timeout → skip that cluster, log it, continue with the rest
- MCP server unreachable → abort with a one-line warning; do not block push in `warn` mode
