---
description: Run only the ai-retrieval check — is each page structured so an LLM can extract a correct, self-contained answer chunk from it.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Agent, mcp__docsbook__get_workspace, mcp__docsbook__list_workspaces, mcp__docsbook__get_ai_unanswered, mcp__docsbook__get_failed_searches
argument-hint: [path-or-full] [--workspace <id>]
---

# /docs-ai-retrieval — quick shortcut

Shortcut for `/docs-analyze --only ai-retrieval`. See the underlying skill at [docs-ai-retrieval](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-ai-retrieval/SKILL.md).

This is the check the whole plugin was built for: the chunk is the unit of optimization, not the page.

## Workflow

1. Resolve `SCOPE` (path argument, default `full`) and `WORKSPACE` (`--workspace` argument, default `none`).
2. Invoke the `docs-auditor` subagent with:
   ```
   CHECK: ai-retrieval
   SCOPE: <resolved-scope>
   WORKSPACE: <resolved-workspace>
   OUTPUT: <tmp-path>/ai-retrieval.json
   ```
3. Read the `FINDINGS_JSON:` path it prints and load the file.
4. Print the finding count by severity (critical/high/medium/low) and the top 3 findings by severity. If a workspace was connected, note whether real `get_ai_unanswered`/`get_failed_searches` questions were used or the check fell back to sub-query decomposition from page content alone.
5. Exit 0 if the check succeeded, 1 if it failed.
