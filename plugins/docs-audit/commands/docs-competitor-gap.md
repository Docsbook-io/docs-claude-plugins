---
description: Run only the competitor-gap check — topics a named competitor covers that these docs don't, optionally cross-checked against what you already rank for.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Agent, WebFetch, mcp__docsbook__get_workspace, mcp__docsbook__list_workspaces, mcp__docsbook__get_search_rankings
argument-hint: [path-or-full] --competitor <url> [--workspace <id>]
---

# /docs-competitor-gap — quick shortcut

Shortcut for `/docs-analyze --only competitor-gap`. See the underlying skill at [docs-competitor-gap](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-competitor-gap/SKILL.md).

## Workflow

1. Resolve `SCOPE` (path argument, default `full`) and `WORKSPACE` (`--workspace` argument, default `none`).
2. Require `--competitor <url>`. If it's missing, stop and ask the user for the competitor's docs URL — this check has nothing to compare against without one.
3. Invoke the `docs-auditor` subagent with:
   ```
   CHECK: competitor-gap
   SCOPE: <resolved-scope>
   WORKSPACE: <resolved-workspace>
   COMPETITOR_URL: <url-from---competitor>
   OUTPUT: <tmp-path>/competitor-gap.json
   ```
4. Read the `FINDINGS_JSON:` path it prints and load the file.
5. Print the finding count by severity (critical/high/medium/low) and the top 3 findings by severity.
6. Exit 0 if the check succeeded, 1 if it failed.
