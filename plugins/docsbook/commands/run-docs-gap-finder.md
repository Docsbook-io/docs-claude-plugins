---
description: Run only the gap-finder check — missing pages inferred from failed searches, unanswered AI questions, and popular queries. Best on PRO+, degrades honestly without it.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Agent, mcp__plugin_docsbook_docsbook__get_workspace, mcp__plugin_docsbook_docsbook__list_workspaces, mcp__plugin_docsbook_docsbook__get_failed_searches, mcp__plugin_docsbook_docsbook__get_ai_unanswered, mcp__plugin_docsbook_docsbook__get_popular_searches
argument-hint: [path-or-full] [--workspace <id>] [--open-issues]
skill: docs-analyze
---

# /docsbook:run-docs-gap-finder — quick shortcut

Shortcut for `/docsbook:run-docs-analyze --only gap-finder`. See the underlying skill at [docs-analyze — opportunity audit](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-analyze/references/opportunity-audit.md).

Best on PRO+ — uses `get_failed_searches`/`get_ai_unanswered`/`get_popular_searches` when the workspace plan covers them. Degrades honestly without a workspace or on a lower plan: it still runs, just notes in `skipped` which real-query sources it couldn't use.

## Workflow

1. Resolve `SCOPE` (path argument, default `full`) and `WORKSPACE` (`--workspace` argument, default `none`).
2. Resolve `OPEN_ISSUES` from the `--open-issues` flag (default `false`). This is the one check in this plugin that may write outside its JSON report — never pass `true` unless the user explicitly asked for GitHub Issues to be opened in this run.
3. Invoke the `docs-auditor` subagent with:
   ```
   CHECK: gap-finder
   SCOPE: <resolved-scope>
   WORKSPACE: <resolved-workspace>
   OPEN_ISSUES: <resolved-open-issues>
   OUTPUT: <tmp-path>/gap-finder.json
   ```
4. Read the `FINDINGS_JSON:` path it prints and load the file. Print the finding count by severity, the top 3 findings, and note in `skipped` which analytics sources (PRO+) were unavailable.
5. Exit 0 if the check succeeded, 1 if it failed.
