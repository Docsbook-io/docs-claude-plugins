---
description: Run only the pricing-consistency check — prices, plan names, and limits in the docs checked against the live pricing page.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Agent, WebFetch
argument-hint: [path-or-full] [--workspace <id>]
skill: docs-analyze
---

# /docsbook:run-docs-pricing-consistency — quick shortcut

Shortcut for `/docsbook:run-docs-analyze --only pricing-consistency`. See the underlying skill at [docs-analyze — live-pricing check](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-analyze/references/external-checks.md).

## Workflow

1. Resolve `SCOPE` (path argument, default `full`) and `WORKSPACE` (`--workspace` argument, default `none`).
2. Invoke the `docs-auditor` subagent with:
   ```
   CHECK: pricing-consistency
   SCOPE: <resolved-scope>
   WORKSPACE: <resolved-workspace>
   OUTPUT: <tmp-path>/pricing-consistency.json
   ```
3. Read the `FINDINGS_JSON:` path it prints and load the file.
4. Print the finding count by severity (critical/high/medium/low) and the top 3 findings by severity.
5. Exit 0 if the check succeeded, 1 if it failed.
