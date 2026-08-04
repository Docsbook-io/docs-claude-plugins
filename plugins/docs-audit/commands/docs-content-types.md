---
description: Run only the content-types check — is each page the right doc type for its job (tutorial vs reference vs how-to vs explanation).
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Agent
argument-hint: [path-or-full] [--workspace <id>]
---

# /docs-content-types — quick shortcut

Shortcut for `/docs-analyze --only content-types`. See the underlying skill at [docs-content-types](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-content-types/SKILL.md).

## Workflow

1. Resolve `SCOPE` (path argument, default `full`) and `WORKSPACE` (`--workspace` argument, default `none`).
2. Invoke the `docs-auditor` subagent with:
   ```
   CHECK: content-types
   SCOPE: <resolved-scope>
   WORKSPACE: <resolved-workspace>
   OUTPUT: <tmp-path>/content-types.json
   ```
3. Read the `FINDINGS_JSON:` path it prints and load the file.
4. Print the finding count by severity (critical/high/medium/low) and the top 3 findings by severity.
5. Exit 0 if the check succeeded, 1 if it failed.
