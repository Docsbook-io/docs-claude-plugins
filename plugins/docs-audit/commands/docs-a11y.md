---
description: Run only the accessibility check — alt text, heading order, link text, contrast, and other a11y issues in doc pages.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Agent
argument-hint: [path-or-full] [--workspace <id>]
---

# /docs-a11y — quick shortcut

Shortcut for `/docs-analyze --only accessibility`. See the underlying skill at [docs-accessibility](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-accessibility/SKILL.md).

Named `/docs-a11y` (the standard shorthand for "accessibility") rather than `/docs-accessibility` to avoid colliding with the existing global `docs-accessibility` skill name.

## Workflow

1. Resolve `SCOPE` (path argument, default `full`) and `WORKSPACE` (`--workspace` argument, default `none`).
2. Invoke the `docs-auditor` subagent with:
   ```
   CHECK: accessibility
   SCOPE: <resolved-scope>
   WORKSPACE: <resolved-workspace>
   OUTPUT: <tmp-path>/accessibility.json
   ```
3. Read the `FINDINGS_JSON:` path it prints and load the file.
4. Print the finding count by severity (critical/high/medium/low) and the top 3 findings by severity.
5. Exit 0 if the check succeeded, 1 if it failed.
