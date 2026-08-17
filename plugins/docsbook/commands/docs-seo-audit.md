---
description: Run only the seo check — titles, meta descriptions, heading structure, and real search positions where a workspace is connected.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Agent, mcp__plugin_docsbook_docsbook__get_workspace, mcp__plugin_docsbook_docsbook__list_workspaces, mcp__plugin_docsbook_docsbook__get_search_rankings
argument-hint: [path-or-full] [--workspace <id>]
---

# /docs-seo-audit — quick shortcut

Shortcut for `/docsbook:run-docs-analyze --only seo`. See the underlying skill at [docs-seo](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-seo/SKILL.md).

Named `/docs-seo-audit` (with the `-audit` suffix) to avoid colliding with the existing global `docs-seo` skill name, consistent with `/docs-media-audit` above. Falls back to a text-only audit without a connected workspace — real search positions require `get_search_rankings`.

## Workflow

1. Resolve `SCOPE` (path argument, default `full`) and `WORKSPACE` (`--workspace` argument, default `none`).
2. Invoke the `docs-auditor` subagent with:
   ```
   CHECK: seo
   SCOPE: <resolved-scope>
   WORKSPACE: <resolved-workspace>
   OUTPUT: <tmp-path>/seo.json
   ```
3. Read the `FINDINGS_JSON:` path it prints and load the file.
4. Print the finding count by severity (critical/high/medium/low) and the top 3 findings by severity. If `skipped` lists `get_search_rankings`, note in the summary that this was a text-only audit and findings are hypotheses, not confirmed positions.
5. Exit 0 if the check succeeded, 1 if it failed.
