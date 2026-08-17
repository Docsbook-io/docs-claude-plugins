---
description: Run only docs-funnel-mapper — multi-step journey drop-off detection (PRO+).
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Agent, mcp__plugin_docsbook_docsbook__get_workspace, mcp__plugin_docsbook_docsbook__list_workspaces, mcp__plugin_docsbook_docsbook__get_page_journeys, mcp__plugin_docsbook_docsbook__get_analytics
argument-hint: [optional: --workspace <id>] [--period 30d]
---

# /docs-funnel — quick shortcut

Shortcut for `/docs-insights --only docs-funnel-mapper`. See the underlying skill at [docs-funnel-mapper](https://github.com/Docsbook-io/docs-skills/blob/main/skills/observability/docs-funnel-mapper/SKILL.md).

## Workflow

1. Verify `.docsbook/insights/.config.json` exists. If not, instruct the user to run `/docs-insights-setup`.
2. Resolve `workspace` and `period` from config + arguments.
3. Invoke the `docs-funnel-mapper` skill. The skill runs the 4-stage subagent pipeline and writes the JSON + Markdown report.
4. Print the new report's `summary.headline`.

## Plan guard

PRO+ required (uses `get_page_journeys`). On lower plans, exit with the upgrade message.
