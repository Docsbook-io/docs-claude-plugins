---
description: Run only the rank-recovery check — pages that dropped in search position, with a rewrite recommendation. Requires live GSC ranking data.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Agent, mcp__plugin_docsbook_docsbook__get_workspace, mcp__plugin_docsbook_docsbook__list_workspaces, mcp__plugin_docsbook_docsbook__get_search_rankings
argument-hint: [path-or-full] --workspace <id>
---

# /docsbook:run-docs-rank-recovery — quick shortcut

Shortcut for `/docsbook:run-docs-analyze --only rank-recovery`. See the underlying skill at [docs-rank-recovery](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-rank-recovery/SKILL.md).

This check requires live `get_search_rankings` data — there is no text-only fallback, because there is nothing to recover from without knowing what dropped.

## Workflow

1. Resolve `SCOPE` (path argument, default `full`) and `WORKSPACE` (`--workspace` argument, default `none`).
2. If `WORKSPACE` is `none`, stop and tell the user: *"docs-rank-recovery needs a connected Docsbook workspace with live Google Search Console position data — pass `--workspace <id>`. Without it there's nothing to compare current rankings against."* Do not attempt a degraded run.
3. Call `get_workspace` to confirm the workspace is reachable and has ranking data available. If the call fails or returns no ranking data, stop and explain that plainly rather than silently returning empty findings.
4. Invoke the `docs-auditor` subagent with:
   ```
   CHECK: rank-recovery
   SCOPE: <resolved-scope>
   WORKSPACE: <resolved-workspace>
   OUTPUT: <tmp-path>/rank-recovery.json
   ```
5. Read the `FINDINGS_JSON:` path it prints and load the file. Print the finding count by severity and the top 3 findings, each with its rewrite recommendation text.
6. Exit 0 if the check succeeded, 1 if it failed or was blocked by missing ranking data.
