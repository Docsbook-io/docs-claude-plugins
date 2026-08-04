---
description: Run only the style-tone check — voice, tense, and terminology consistency across pages.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Agent
argument-hint: [path-or-full] [--workspace <id>]
---

# /docs-style-tone — quick shortcut

Shortcut for `/docs-analyze --only style-tone`. See the underlying skill at [docs-style-tone](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-style-tone/SKILL.md).

## Workflow

1. Resolve `SCOPE` (path argument, default `full`) and `WORKSPACE` (`--workspace` argument, default `none`).
2. Invoke the `docs-auditor` subagent with:
   ```
   CHECK: style-tone
   SCOPE: <resolved-scope>
   WORKSPACE: <resolved-workspace>
   OUTPUT: <tmp-path>/style-tone.json
   ```
3. Read the `FINDINGS_JSON:` path it prints and load the file.
4. Print the finding count by severity (critical/high/medium/low) and the top 3 findings by severity.
5. Exit 0 if the check succeeded, 1 if it failed.
