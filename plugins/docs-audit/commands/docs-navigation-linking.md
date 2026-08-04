---
description: Run only the navigation-linking check — broken links, orphan pages, and nav-tree consistency across the full doc graph.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Agent
argument-hint: [full-or-folder] [--workspace <id>]
---

# /docs-navigation-linking — quick shortcut

Shortcut for `/docs-analyze --only navigation-linking`. See the underlying skill at [docs-navigation-linking](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-navigation-linking/SKILL.md).

This check needs the full doc graph, not a single page — pass `SCOPE=full` or a folder, never one file.

## Workflow

1. Resolve `SCOPE` (path argument, default `full`) and `WORKSPACE` (`--workspace` argument, default `none`).
2. If `SCOPE` resolves to a single page (not a folder and not `full`), stop and tell the user this check needs `--scope full` or a folder path to see cross-page links and the nav tree — a single page has nothing to be inconsistent against.
3. Invoke the `docs-auditor` subagent with:
   ```
   CHECK: navigation-linking
   SCOPE: <resolved-scope>
   WORKSPACE: <resolved-workspace>
   OUTPUT: <tmp-path>/navigation-linking.json
   ```
4. Read the `FINDINGS_JSON:` path it prints and load the file.
5. Print the finding count by severity (critical/high/medium/low) and the top 3 findings by severity.
6. Exit 0 if the check succeeded, 1 if it failed.
