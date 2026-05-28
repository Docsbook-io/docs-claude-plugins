---
description: Run only docs-question-clusterer — AI-chat questions clustered into content_gap vs ai_chat_failure (PRO).
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Agent, mcp__docsbook__get_workspace, mcp__docsbook__list_workspaces, mcp__docsbook__get_ai_questions, mcp__docsbook__get_ai_unanswered, mcp__docsbook__get_negative_feedback, mcp__docsbook__get_failed_searches, mcp__docsbook__get_popular_searches
argument-hint: [optional: --workspace <id>] [--period 30d]
---

# /docs-questions — quick shortcut

Shortcut for `/docs-insights --only docs-question-clusterer`. See the underlying skill at [docs-question-clusterer](https://github.com/Docsbook-io/docs-skills/blob/main/skills/observability/docs-question-clusterer/SKILL.md).

## Workflow

1. Verify `.docsbook/insights/.config.json` exists. If not, instruct the user to run `/docs-insights-setup`.
2. Resolve `workspace` and `period` from config + arguments.
3. Invoke the `docs-question-clusterer` skill. The skill runs the 4-stage subagent pipeline and writes the JSON + Markdown report.
4. Print the new report's `summary.headline`.

## Plan guard

PRO required (`get_ai_questions`, `get_ai_unanswered`). On free workspaces, exit with the upgrade message.

## Relationship to existing skills

This skill is **broader** than `docs-gap-finder` (which only uses failed_search + ai_unanswered + popular_search). It also factors in **answered** questions, then distinguishes:

- `content_gap` — write a new doc (delegates to `docs-create` via `suggested_actions`).
- `ai_chat_failure` — doc exists but chat can't surface it; tune the system prompt (delegates to `docs-tune-ai-chat`).
