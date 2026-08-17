---
description: Run only the trust-audit check — claims in the docs checked against the live site, quoting both sides before flagging staleness.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Agent, WebFetch
argument-hint: [path-or-full] [--workspace <id>]
---

# /docsbook:run-docs-trust-audit — quick shortcut

Shortcut for `/docsbook:run-docs-analyze --only trust-audit`. See the underlying skill at [docs-trust-audit](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-trust-audit/SKILL.md).

## Workflow

1. Resolve `SCOPE` (path argument, default `full`) and `WORKSPACE` (`--workspace` argument, default `none`).
2. Invoke the `docs-auditor` subagent with:
   ```
   CHECK: trust-audit
   SCOPE: <resolved-scope>
   WORKSPACE: <resolved-workspace>
   OUTPUT: <tmp-path>/trust-audit.json
   ```
3. Read the `FINDINGS_JSON:` path it prints and load the file.
4. Print the finding count by severity (critical/high/medium/low) and the top 3 findings by severity.
5. Exit 0 if the check succeeded, 1 if it failed.
