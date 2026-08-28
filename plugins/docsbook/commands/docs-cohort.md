---
description: Run only docs-visitor-cohort — top-visitor behavioral cohort analysis (PRO+).
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Agent, mcp__plugin_docsbook_docsbook__get_workspace, mcp__plugin_docsbook_docsbook__list_workspaces, mcp__plugin_docsbook_docsbook__get_top_visitors, mcp__plugin_docsbook_docsbook__get_visitor_activity
argument-hint: [optional: --workspace <id>] [--period 30d] [--cohort-size 20]
skill: docs-analyze
---

# /docs-cohort — quick shortcut

Shortcut for `/docs-insights --only docs-visitor-cohort`. See the underlying skill at [docs-analyze — reader-cohorts pass](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-analyze/references/signals.md).

## Workflow

1. Verify `.docsbook/insights/.config.json` exists. If not, instruct the user to run `/docs-insights-setup`.
2. Resolve `workspace`, `period`, and `cohort_size` from config + arguments.
3. Invoke the `docs-visitor-cohort` skill. The skill runs the 4-stage subagent pipeline (the collector fans out per visitor) and writes the JSON + Markdown report.
4. Print the new report's `summary.headline`.

## Plan guard

PRO+ required (`get_top_visitors`, `get_visitor_activity`). On lower plans, exit with the upgrade message.

## Privacy note

`visitor_id` values are anonymous random identifiers. The reports include them in `samples` for downstream debugging only — no IPs, no user agents, no referrer query strings are ever recorded.
