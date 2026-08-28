---
description: Run only docs-utm-analyzer — UTM ↔ landing-page mismatch detection (PRO+).
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Agent, mcp__plugin_docsbook_docsbook__get_workspace, mcp__plugin_docsbook_docsbook__list_workspaces, mcp__plugin_docsbook_docsbook__get_analytics, mcp__plugin_docsbook_docsbook__query_events
argument-hint: [optional: --workspace <id>] [--period 30d]
skill: docs-analyze
---

# /docs-utm — quick shortcut

Shortcut for `/docs-insights --only docs-utm-analyzer`. See the underlying skill at [docs-analyze — campaign-traffic pass](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-analyze/references/signals.md).

## Workflow

1. Verify `.docsbook/insights/.config.json` exists. If not, tell the user to run `/docs-insights-setup` first and exit.
2. Resolve `workspace` and `period` from config + arguments (same precedence as `/docs-insights`).
3. Invoke the `docs-utm-analyzer` skill with those arguments. The skill orchestrates the 4-stage subagent pipeline (`analytics-collector` → `analytics-clusterer` → `analytics-reporter` → `insights-archivist`) and writes the JSON + Markdown reports to `.docsbook/insights/`.
4. Tail the `summary.headline` from the new report and print it for the user.
5. Exit 0 on success, 1 on failure.

## Plan guard

If the workspace plan is below PRO+, exit cleanly with: *"docs-utm-analyzer needs the PRO+ plan to use `query_events`. Upgrade at https://docsbook.io/billing — or use /docs-questions which works on PRO."*
