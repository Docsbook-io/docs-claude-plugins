---
description: Run only docs-link-click-analyzer — CTA / link CTR analysis vs site median (PRO+).
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Agent, mcp__plugin_docsbook_docsbook__get_workspace, mcp__plugin_docsbook_docsbook__list_workspaces, mcp__plugin_docsbook_docsbook__query_events, mcp__plugin_docsbook_docsbook__get_analytics
argument-hint: [optional: --workspace <id>] [--period 14d]
---

# /docs-link-clicks — quick shortcut

Shortcut for `/docs-insights --only docs-link-click-analyzer`. See the underlying skill at [docs-link-click-analyzer](https://github.com/Docsbook-io/docs-skills/blob/main/skills/observability/docs-link-click-analyzer/SKILL.md).

## Workflow

1. Verify `.docsbook/insights/.config.json` exists. If not, instruct the user to run `/docs-insights-setup`.
2. Resolve `workspace` and `period` (default `14d`) from config + arguments.
3. Invoke the `docs-link-click-analyzer` skill. The skill runs the 4-stage subagent pipeline and writes the JSON + Markdown report.
4. Print the new report's `summary.headline`.

## Plan guard

PRO+ required (uses `query_events` for CTA event aggregation). On lower plans, exit with the upgrade message.
