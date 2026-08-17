---
description: Run every enabled analyzer in parallel and produce one schema-validated insight JSON report per analyzer under .docsbook/insights/. Aggregates the headlines into a single Slack-friendly summary.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Agent, mcp__plugin_docsbook_docsbook__get_workspace, mcp__plugin_docsbook_docsbook__list_workspaces
argument-hint: [optional: --workspace <id>] [--only docs-utm-analyzer,docs-engagement-analyzer] [--period 30d]
---

# /docs-insights — full audit run

Runs every analyzer enabled in `.docsbook/insights/.config.json` and produces one report per analyzer. Designed to be safe to run on a cron — write-once outputs, atomic file moves, no destructive operations.

If `.docsbook/insights/.config.json` does not exist, this command tells the user to run `/docs-insights-setup` first and exits.

## Step 1 — Read config

```bash
test -f .docsbook/insights/.config.json || { echo "Run /docs-insights-setup first."; exit 1; }
```

Parse `workspace.id`, `analyzers[]`, `notify.*`, `retention.*` from the config.

Honor argument overrides:

- `--workspace <id-or-owner/repo>` overrides the configured workspace for this run only.
- `--only <a,b,c>` restricts the run to a comma-separated subset of analyzers.
- `--period <30d|14d|7d>` overrides the default period passed to each analyzer.

## Step 2 — Fan out

For each enabled analyzer, invoke the matching skill. The skills themselves orchestrate the 4-stage subagent pipeline (collector → clusterer → reporter → archivist). The mapping:

| Analyzer name | Skill to invoke |
|---|---|
| `docs-utm-analyzer` | docs-skills `docs-utm-analyzer` |
| `docs-engagement-analyzer` | docs-skills `docs-engagement-analyzer` |
| `docs-funnel-mapper` | docs-skills `docs-funnel-mapper` |
| `docs-visitor-cohort` | docs-skills `docs-visitor-cohort` |
| `docs-link-click-analyzer` | docs-skills `docs-link-click-analyzer` |
| `docs-question-clusterer` | docs-skills `docs-question-clusterer` |

**Run analyzers sequentially**, not in parallel. Three reasons:

1. They all hit the same Docsbook MCP — parallel calls trigger rate limits.
2. Each analyzer's pipeline already fans out internally across its own 4 subagents.
3. Sequential output is easier to read in a CI log.

For each analyzer:

1. Print `▶ Running <analyzer-name> (period: <period>) ...`.
2. Invoke the skill with `workspace = <id>` and `period = <period>`.
3. Wait for it to finish. Capture the final `REPORT_JSON:` path it printed.
4. If the skill failed (no `REPORT_JSON:` line, or the file isn't valid JSON), record the failure and **continue with the next analyzer** — one broken analyzer must not block the others.

## Step 3 — Aggregate

After all enabled analyzers have finished, read each report's top-level fields (skip `findings[]` — too big) and build an aggregate summary:

```
═══════════════════════════════════════════════════
 docs-insights run · <workspace> · <period>
 generated <iso>
═══════════════════════════════════════════════════

  ▼ docs-utm-analyzer
     "73% of launch-hn UTM traffic bounces on quick-start.md"
     12 findings · 2 critical · 4 high

  ▼ docs-engagement-analyzer
     "billing.md average dwell 4:30 with 0 negative feedback — engagement signal"
     8 findings · 0 critical · 3 high

  ▼ docs-funnel-mapper
     ... (one block per analyzer)

  ✖ docs-visitor-cohort  FAILED
     Reason: insufficient data (only 4 top visitors in period)

═══════════════════════════════════════════════════
 Total findings: 47 (3 critical · 12 high · 19 medium · 13 low)
 Reports:        .docsbook/insights/latest/
 Diffs vs prev:  .docsbook/insights/latest/*.diff.json
═══════════════════════════════════════════════════
```

Save this aggregate as `.docsbook/insights/latest/_summary.md`.

## Step 4 — Notify

If `.config.json` has `notify.slack_webhook_env` set AND any report has at least one finding at or above `notify.min_severity` (default `high`):

1. Read the webhook URL from the env var named in the config. If unset, skip notification with a warning.
2. POST a compact JSON to Slack with:
   - Workspace label
   - Period
   - Aggregate counts
   - The headline (`summary.headline`) of each report that has ≥ 1 finding at the threshold
   - Direct URL to `.docsbook/insights/latest/` if the repo is on a public Git host (best-effort — read `git config --get remote.origin.url`)

Use `curl -s -X POST -H 'content-type: application/json' "$WEBHOOK" -d @<payload>` from Bash. Don't fail the whole run if the POST returns non-2xx — log and continue.

## Step 5 — Exit code

- Exit 0 if at least one analyzer succeeded.
- Exit 1 only if **every** enabled analyzer failed. This keeps cron-driven CI green even if one analyzer is temporarily broken.

## Rules

1. **No destructive operations.** This command never edits doc pages, never opens Issues, never updates settings. It writes JSON reports and a Markdown summary. Acting on the reports is the job of a separate (forthcoming) actor agent — `/docs-insights` deliberately stops at the reporting boundary.
2. **Honor the schema.** Every written JSON must validate against `<plugin-root>/schemas/insight.schema.json`. The `analytics-reporter` subagent enforces this; this command does not need to re-validate.
3. **Sequential, not parallel.** Even when tempted.
4. **Idempotent.** Running twice in the same minute produces two reports with different `generated_at` and does not clobber the first.
