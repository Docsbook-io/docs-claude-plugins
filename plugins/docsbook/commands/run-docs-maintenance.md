---
description: Run only the maintenance check — stale content, dead code samples, outdated version references, and ownership gaps.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Agent
argument-hint: [path-or-full] [--workspace <id>]
---

# /docsbook:run-docs-maintenance — quick shortcut

Shortcut for `/docsbook:run-docs-analyze --only maintenance`. See the underlying skill at [docs-maintenance](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-maintenance/SKILL.md).

## Workflow

1. Resolve `SCOPE` (path argument, default `full`) and `WORKSPACE` (`--workspace` argument, default `none`).
2. Invoke the `docs-auditor` subagent with:
   ```
   CHECK: maintenance
   SCOPE: <resolved-scope>
   WORKSPACE: <resolved-workspace>
   OUTPUT: <tmp-path>/maintenance.json
   ```
3. Read the `FINDINGS_JSON:` path it prints and load the file.
4. Print the finding count by severity (critical/high/medium/low) and the top 3 findings by severity.
5. Exit 0 if the check succeeded, 1 if it failed.
