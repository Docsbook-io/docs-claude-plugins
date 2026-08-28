---
description: Run only the title-rewriter check — titles with high impressions but zero clicks, rewritten to earn the click (PRO).
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Agent, mcp__plugin_docsbook_docsbook__get_workspace, mcp__plugin_docsbook_docsbook__list_workspaces, mcp__plugin_docsbook_docsbook__get_search_zero_click
argument-hint: [path-or-full] --workspace <id>
skill: docs-analyze
---

# /docsbook:run-docs-title-rewriter — quick shortcut

Shortcut for `/docsbook:run-docs-analyze --only title-rewriter`. See the underlying skill at [docs-analyze — rejected-searches pass](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-analyze/references/signals.md).

## Workflow

1. Resolve `SCOPE` (path argument, default `full`) and `WORKSPACE` (`--workspace` argument, default `none`).
2. If `WORKSPACE` is `none`, stop and tell the user this check needs a connected Docsbook workspace on the PRO plan — see Plan guard below.
3. Call `get_workspace` to confirm the plan. Apply the Plan guard below before doing anything else.
4. Invoke the `docs-auditor` subagent with:
   ```
   CHECK: title-rewriter
   SCOPE: <resolved-scope>
   WORKSPACE: <resolved-workspace>
   OUTPUT: <tmp-path>/title-rewriter.json
   ```
5. Read the `FINDINGS_JSON:` path it prints and load the file. Print the finding count by severity and the top 3 findings, each with its rewritten title text ready to paste.
6. Exit 0 if the check succeeded, 1 if it failed or was blocked by the plan guard.

## Plan guard

If the workspace plan is below PRO, exit cleanly with: *"docs-title-rewriter needs the PRO plan to use `get_search_zero_click`. Upgrade at https://docsbook.io/billing"*
