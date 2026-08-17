---
description: Run only the media check — missing/oversized/broken images, video, and other embedded media in doc pages.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Agent
argument-hint: [path-or-full] [--workspace <id>]
---

# /docs-media-audit — quick shortcut

Shortcut for `/docsbook:run-docs-analyze --only media`. See the underlying skill at [docs-media](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-media/SKILL.md).

Named `/docs-media-audit` (with the `-audit` suffix) to avoid colliding with the existing global `docs-media` skill name.

## Workflow

1. Resolve `SCOPE` (path argument, default `full`) and `WORKSPACE` (`--workspace` argument, default `none`).
2. Invoke the `docs-auditor` subagent with:
   ```
   CHECK: media
   SCOPE: <resolved-scope>
   WORKSPACE: <resolved-workspace>
   OUTPUT: <tmp-path>/media.json
   ```
3. Read the `FINDINGS_JSON:` path it prints and load the file.
4. Print the finding count by severity (critical/high/medium/low) and the top 3 findings by severity.
5. Exit 0 if the check succeeded, 1 if it failed.
