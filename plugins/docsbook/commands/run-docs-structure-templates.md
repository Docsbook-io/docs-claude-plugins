---
description: Run only the structure-templates check — heading hierarchy, section order, and template conformance per page.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Agent
argument-hint: [path-or-full] [--workspace <id>]
skill: docs-analyze
---

# /docsbook:run-docs-structure-templates — quick shortcut

Shortcut for `/docsbook:run-docs-analyze --only structure-templates`. See the underlying skill at [docs-analyze — structure detector](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-analyze/references/detectors.md).

## Workflow

1. Resolve `SCOPE` (path argument, default `full`) and `WORKSPACE` (`--workspace` argument, default `none`).
2. Invoke the `docs-auditor` subagent with:
   ```
   CHECK: structure-templates
   SCOPE: <resolved-scope>
   WORKSPACE: <resolved-workspace>
   OUTPUT: <tmp-path>/structure-templates.json
   ```
3. Read the `FINDINGS_JSON:` path it prints and load the file.
4. Print the finding count by severity (critical/high/medium/low) and the top 3 findings by severity.
5. Exit 0 if the check succeeded, 1 if it failed.
