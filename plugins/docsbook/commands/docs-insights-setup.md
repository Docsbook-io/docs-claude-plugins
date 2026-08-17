---
description: One-time interactive setup for the docs-insights pipeline — picks workspace, optionally schedules recurring runs via Claude Code Routines, and wires notification destinations.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, mcp__plugin_docsbook_docsbook__list_workspaces, mcp__plugin_docsbook_docsbook__get_workspace, mcp__plugin_docsbook_docsbook__get_info
argument-hint: [optional: workspace id or owner/repo to skip the picker]
---

# /docs-insights-setup — wire up recurring docs analytics

This command is the **front door** of the `docs-insights` plugin. It runs once. After it finishes, the six analyzer skills (`docs-utm-analyzer`, `docs-engagement-analyzer`, `docs-funnel-mapper`, `docs-visitor-cohort`, `docs-link-click-analyzer`, `docs-question-clusterer`) and the `/docs-insights` aggregator know exactly which workspace to query, where to write reports, on what cadence, and where to send notifications.

You are running interactively. Talk to the user. Confirm before writing anything outside `.docsbook/`. Quote the cost of every tool you are about to call.

---

## Step 0 — Verify MCP transport

1. The plugin's bundled `.mcp.json` registers the **Docsbook** MCP server at `https://docsbook.io/api/mcp/server`. The first time any `mcp__plugin_docsbook_docsbook__*` tool is called, Claude Code prompts the user for OAuth in the browser.
2. Call `mcp__plugin_docsbook_docsbook__get_info`. If it fails with an auth error, tell the user: *"Click the OAuth prompt that appeared, then say 'continue' to re-try."* Loop until success.
3. Print the resolved server URL and the OAuth status. This is the only confirmation that the MCP path works.

---

## Step 1 — Resolve workspace

There are three resolution paths. Try them in order and stop at the first that succeeds.

### Path A — argument

If `$ARGUMENTS` is non-empty:

- If it looks like `owner/repo`, call `mcp__plugin_docsbook_docsbook__get_workspace({ owner_repo: "$ARGUMENTS" })`.
- Else if it's a number, call `mcp__plugin_docsbook_docsbook__get_workspace({ id: $ARGUMENTS })`.
- On success, jump to Step 2.

### Path B — implicit from the MCP URL

The Docsbook MCP server has two URL forms:

- **Global:** `https://docsbook.io/api/mcp/server` — does not encode a workspace.
- **Workspace-scoped:** `https://docsbook.io/api/mcp/workspaces/<id>/server` — encodes workspace `<id>`.

If `.mcp.json` for this plugin uses the workspace-scoped form, parse `<id>` from the URL and use it directly. Otherwise continue to Path C.

### Path C — interactive picker

Call `mcp__plugin_docsbook_docsbook__list_workspaces`. Present the result as a numbered list:

```
Which workspace should /docs-insights analyze?
  1. acme-co/api-docs        (PRO+)        — 12,400 pageviews / 30d
  2. acme-co/marketing-site  (PRO)         — 3,200 pageviews / 30d
  3. acme-co/internal        (free)        — 80 pageviews / 30d
```

Ask the user to pick a number. On selection, confirm with the workspace's `owner/repo` and plan.

**Plan guard:** if the chosen workspace is on the `free` plan, warn the user that **most** insights skills require PRO or PRO+ and ask if they want to proceed anyway (only `docs-analytics`-style basic analytics will work). If they say yes, continue with reduced functionality. If they say no, exit cleanly.

---

## Step 2 — Pick analyzers

Show the catalog and let the user choose. Default: select all six.

```
Which analyzers do you want to enable?

  [x] docs-utm-analyzer         — UTM ↔ landing page mismatch (PRO+)
  [x] docs-engagement-analyzer  — interest vs confusion via dwell + feedback (PRO+)
  [x] docs-funnel-mapper        — drop-off in multi-step journeys (PRO+)
  [x] docs-visitor-cohort       — top-visitor behavioral cohorts (PRO+)
  [x] docs-link-click-analyzer  — CTA / link CTR vs site median (PRO+)
  [x] docs-question-clusterer   — AI-chat questions → gap vs chat-failure (PRO)

(Enter to accept all, or list the names to keep, comma-separated.)
```

Drop any analyzer whose `requires_plan` is above the workspace plan. Print the dropped list with the reason.

---

## Step 3 — Choose cadence (Claude Code Routines)

Ask the user whether they want recurring runs.

```
Recurring runs let you skip remembering to invoke /docs-insights — Claude Code Routines fires
the command on a schedule and commits the JSON report to .docsbook/insights/.

  1. Weekly (Mon 09:00 local)       — recommended for active products
  2. Bi-weekly (every other Mon)
  3. Monthly (1st of month)
  4. Custom cron
  5. No schedule — I will run it manually
```

If 1–4, generate a Claude Code Routine. The mechanism:

1. Compute the cron expression for the chosen cadence in the user's timezone (read `TZ` env var, default UTC).
2. Use the `/schedule` skill (or the `mcp__scheduled-tasks__create_scheduled_task` tool if available) to create a routine that runs `/docs-insights --workspace <id>` at that cadence. Each enabled analyzer's individual schedule is **not** set here — they are all triggered by the single aggregator command.
3. Store the routine id in `.docsbook/insights/.config.json` so a future `/docs-insights-setup --reset` can remove it.

If the scheduling tool is unavailable, fall back to generating a `.github/workflows/docsbook-insights-cron.yml`:

```yaml
name: docsbook-insights
on:
  schedule:
    - cron: "<resolved-cron-utc>"
  workflow_dispatch:
jobs:
  insights:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run /docs-insights
        run: claude --print --dangerously-skip-permissions /docs-insights
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          DOCSBOOK_MCP_TOKEN: ${{ secrets.DOCSBOOK_MCP_TOKEN }}
      - name: Commit reports
        run: |
          git config user.name "docsbook-insights[bot]"
          git config user.email "actions@github.com"
          git add .docsbook/insights/
          git diff --cached --quiet || git commit -m "chore(insights): scheduled report $(date -u +%F)"
          git push
```

Ask the user which path they prefer before writing anything. **Do not push or commit on their behalf** — write the file, tell them to commit it.

---

## Step 4 — Notifications (optional)

```
Do you want notifications when an insight report contains a `critical` or `high` finding?

  1. Slack incoming webhook
  2. Email (via Docsbook chat hooks)
  3. None — I'll read the reports myself
```

For **Slack**:

- Ask for the incoming webhook URL.
- Store it as a placeholder in `.docsbook/insights/.config.json` under `notify.slack_webhook` — but **do not** write the URL itself there if the file is gitted. Instead:
  - If `.docsbook/` is in `.gitignore`, write the URL plainly with a comment warning.
  - If `.docsbook/` IS gitted, write `{ "slack_webhook_env": "DOCSBOOK_INSIGHTS_SLACK_WEBHOOK" }` and instruct the user to set the env var (or repo secret) of that name.
- Send a test message: `🧪 docs-insights setup test — receiving notifications for <workspace>`. Ask the user to confirm receipt.

For **Email**: skip for v0.1. Print *"Email notifications are not yet supported — use Slack or check the reports directly."* and continue.

---

## Step 5 — Write `.docsbook/insights/.config.json`

```json
{
  "schema_version": 1,
  "configured_at": "<iso>",
  "workspace": { "id": <n>, "owner_repo": "<o/r>", "plan": "<plan>" },
  "analyzers": ["docs-utm-analyzer", "docs-engagement-analyzer", "..."],
  "schedule": {
    "kind": "routine" | "github-actions" | "manual",
    "cron": "<cron-utc>" | null,
    "routine_id": "<id>" | null
  },
  "notify": {
    "slack_webhook_env": "<env-var-name>" | null,
    "min_severity": "high"
  },
  "retention": { "days": 90, "keep": 10 }
}
```

Also create:

- `.docsbook/insights/` directory.
- `.docsbook/insights/latest/` directory.
- `.docsbook/insights/.gitignore` containing `*.tmp.json` and `.tmp/` (so collector temp dumps don't get committed).

Decide on **whether the `.docsbook/insights/` folder itself should be gitted**:

- Default recommendation: **yes**. JSON reports are tiny, diffable, and useful as history.
- Ask: *"Commit insight reports to git so the team and downstream actor agents can see history?"* — `Y/n`.
- If yes, ensure the folder is not in `.gitignore`. If no, append `.docsbook/insights/` to `.gitignore` (creating the file if needed).

---

## Step 6 — Print the summary

```
✅ docs-insights configured.

Workspace:    acme-co/api-docs (PRO+)
Analyzers:    6 enabled
Schedule:     weekly · Mon 09:00 UTC (routine #r_abc123)
Notifications: Slack via $DOCSBOOK_INSIGHTS_SLACK_WEBHOOK (min severity: high)
Storage:      .docsbook/insights/ (committed to git)

Run now? (Y/n)
```

If yes, immediately invoke `/docs-insights` to produce the first report. Tell the user this first run may take 3–5 minutes because it walks all enabled analyzers in sequence.

If no, print:

```
Run on demand:    /docs-insights
Run one analyzer: /docs-utm   |   /docs-engagement   |   /docs-funnel
                  /docs-cohort | /docs-link-clicks   |   /docs-questions
```

---

## Rules

1. **Never write outside `.docsbook/` or `.github/workflows/` without asking.** Files in `.github/` get an explicit *"may I write `<path>`?"* prompt.
2. **Never commit on the user's behalf.** Write files, then tell them.
3. **OAuth flow is the user's job.** If MCP auth fails, explain and wait for them.
4. **Plan guard is non-negotiable.** Drop analyzers above the workspace plan with a clear message.
5. **Idempotent.** Running setup again must read the existing `.config.json`, show the current state, and offer to modify — not silently overwrite.
6. **If anything fails, leave the system in a recoverable state.** No half-written `.config.json`. Use a `.tmp` write + atomic `mv`.
