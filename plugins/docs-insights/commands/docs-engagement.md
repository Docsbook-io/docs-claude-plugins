---
description: Run only docs-engagement-analyzer — interest vs confusion via dwell time + feedback (PRO+).
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Agent, mcp__docsbook__get_workspace, mcp__docsbook__list_workspaces, mcp__docsbook__get_analytics, mcp__docsbook__query_events, mcp__docsbook__get_negative_feedback
argument-hint: [optional: --workspace <id>] [--period 30d]
---

# /docs-engagement — quick shortcut

Shortcut for `/docs-insights --only docs-engagement-analyzer`. See the underlying skill at [docs-engagement-analyzer](https://github.com/Docsbook-io/docs-skills/blob/main/skills/observability/docs-engagement-analyzer/SKILL.md).

## Workflow

1. Verify `.docsbook/insights/.config.json` exists. If not, tell the user to run `/docs-insights-setup` first.
2. Resolve `workspace` and `period` from config + arguments.
3. Invoke the `docs-engagement-analyzer` skill. The skill runs the 4-stage subagent pipeline and writes the JSON + Markdown report.
4. Print the new report's `summary.headline`.

## Plan guard

PRO+ required (uses `query_events` for dwell percentiles). On lower plans, exit with the upgrade message.
