---
description: Run only the i18n check — translation coverage, staleness, and locale-specific issues across enabled languages.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Agent, mcp__plugin_docsbook_docsbook__get_workspace, mcp__plugin_docsbook_docsbook__list_workspaces
argument-hint: [path-or-full] [--workspace <id>]
skill: docs-analyze
---

# /docsbook:run-docs-i18n — quick shortcut

Shortcut for `/docsbook:run-docs-analyze --only i18n`. See the underlying skill at [docs-analyze — translations detector](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-analyze/references/detectors.md).

Skip automatically if only one language is enabled — same guard as `/docsbook:run-docs-analyze` Step 2.

## Workflow

1. Resolve `SCOPE` (path argument, default `full`) and `WORKSPACE` (`--workspace` argument, default `none`).
2. If a workspace is connected, call `get_workspace` to read its enabled languages. If only one language is enabled (or no workspace is connected to check), skip the run and print a one-line note explaining why — do not fail.
3. Invoke the `docs-auditor` subagent with:
   ```
   CHECK: i18n
   SCOPE: <resolved-scope>
   WORKSPACE: <resolved-workspace>
   OUTPUT: <tmp-path>/i18n.json
   ```
4. Read the `FINDINGS_JSON:` path it prints and load the file.
5. Print the finding count by severity (critical/high/medium/low) and the top 3 findings by severity.
6. Exit 0 if the check succeeded or was skipped by design, 1 if it failed.
