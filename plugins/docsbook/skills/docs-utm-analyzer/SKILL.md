---
name: docs-utm-analyzer
description: Maps UTM-tagged traffic against landing pages to find mismatches between marketing promise and documentation reality. Surfaces UTM campaigns where users land but bounce — the doc page doesn't answer what the ad/post promised. Produces an insight JSON report consumable by downstream actor agents. Requires PRO+ plan.
metadata:
  version: 1.1.0
  category: observability
  mode: audit
  measures:
    - traffic
    - bounce_rate
    - dead_end_rate
  metric_dictionary: ../../metrics/metric-dictionary.json
  requires_plan: pro_plus
  accelerated_by:
    - docsbook-mcp
    - markdown-lsp
  produces_files:
    - .docsbook/insights/<timestamp>__docs-utm-analyzer.json
    - .docsbook/insights/<timestamp>__docs-utm-analyzer.md
    - .docsbook/insights/latest/docs-utm-analyzer.json
  output_schema: https://docsbook.io/schemas/insight.schema.json
  pipeline_subagents:
    - analytics-collector
    - analytics-clusterer
    - analytics-reporter
    - insights-archivist
  keywords: [utm, attribution, landing-page, bounce, marketing, campaigns, traffic-source]
---

# docs-utm-analyzer — Match UTM campaigns to landing-page reality

Marketing posts promise X. Users arrive with `?utm_campaign=launch-hn` expecting X. They land on `quick-start.md` which is about Y. They bounce in 8 seconds. This skill finds those mismatches with numbers.

## When to run

- Weekly during active campaigns.
- After every major launch (HN, Product Hunt, blog post, ad burst).
- When traffic data shows a referrer surge without a corresponding signup bump.

## Workflow (4-stage pipeline)

This skill is a thin orchestrator over four pinned subagents. If those subagents are not installed, see the [docs-subagents README](https://github.com/Docsbook-io/docs-subagents) for setup.

### Stage 1 — Collect (Haiku)

Invoke the `analytics-collector` subagent:

```
SLICE: utm
WORKSPACE: <resolved id or owner/repo>
PERIOD: <iso-from>..<iso-to>
OUTPUT: .docsbook/insights/.tmp/utm-dump-<iso>.json
LIMIT: 1000
```

Wait for `WROTE: <path>`.

### Stage 2 — Cluster (Sonnet)

Invoke `analytics-clusterer`:

```
DUMP: <path from stage 1>
OUTPUT: .docsbook/insights/.tmp/utm-clustered-<iso>.json
TOP_N: 15
MIN_CLUSTER_SIZE: 5
```

Wait for `CLUSTERED: <path>`.

### Stage 3 — Report (Sonnet)

Invoke `analytics-reporter`:

```
CLUSTERED: <path from stage 2>
SCHEMA: .docsbook/schemas/insight.schema.json
OUTDIR: .docsbook/insights/
SKILL: docs-utm-analyzer
SKILL_VERSION: 1.0.0
```

Wait for `REPORT_JSON:` and `REPORT_MD:`.

### Stage 4 — Archive (Haiku)

Invoke `insights-archivist`:

```
INSIGHTS_DIR: .docsbook/insights/
NEW_REPORT_JSON: <path from stage 3 REPORT_JSON>
```

Wait for `INDEX:` / `DIFF:` / `ROTATED:`.

### Stage 5 — Tell the user

Print:

```
✅ docs-utm-analyzer ran.
  Report:  .docsbook/insights/latest/docs-utm-analyzer.md (human)
  JSON:    .docsbook/insights/latest/docs-utm-analyzer.json (machine)
  Diff:    .docsbook/insights/latest/docs-utm-analyzer.diff.json (since last run)
  Findings: <critical_count> critical · <high_count> high · <medium_count> medium

Top finding: <summary.headline>

Next steps:
  • Read the Markdown report for context
  • Pass the JSON to the actor agent (forthcoming) or feed it to your own /apply pipeline
  • Re-run weekly during active campaigns
```

## What this skill catches

| Pattern | Example finding |
|---|---|
| **UTM with high bounce** | `utm_campaign=launch-hn` → 800 pv on `quick-start.md`, 78% bounce. Headline of `quick-start.md` doesn't match the HN post's hook. |
| **UTM with zero conversion** | `utm_source=ph` → 1.2k pv, 0 clicks on `Upgrade`. The PH copy promised pricing — link to `pricing.md` instead. |
| **Missing landing page** | UTM landed on `404` or root. Suggest creating the campaign-specific landing doc. |
| **Successful campaign signal** | High pv + low bounce + clicks on conversion CTAs. Marked as `info` — replicate the formula. |

## Guardrails

- **PRO+ only** — raw event-level data, which this analysis needs, is gated above PRO. Exit early if the workspace plan is below `pro_plus` with a clear upgrade message.
- **Do not modify any doc pages.** This is a read-only analyzer. Action is delegated to the actor agent that reads the JSON.
- **Min volume** — clusters with `pageviews < 50` are dropped by the clusterer; do not surface low-confidence findings.
- **PII** — never include raw `referrer` query strings in the report. The collector already strips them.

## Output for downstream consumption

The JSON report at `.docsbook/insights/latest/docs-utm-analyzer.json` conforms to `insight.schema.json` (schema version 1).

Each finding's `suggested_actions[]` is pre-filled so a future actor agent can:

- Open a GitHub Issue per high-bounce UTM/landing pair (`action_type: open_github_issue`)
- Invoke `docs-editor` to rewrite the landing page headline (`action_type: invoke_skill`, `skill_to_invoke: docs-editor`)
- Drop a Slack note for traffic anomalies (`action_type: notify_slack`)

## Acceptance criteria

- [ ] All four pipeline subagents invoked in sequence.
- [ ] Final JSON validates against `insight.schema.json` (`schema_version: 1`).
- [ ] Two files written: `<ts>__docs-utm-analyzer.json` and `<ts>__docs-utm-analyzer.md`.
- [ ] `latest/` symlinks updated.
- [ ] Diff against previous run computed when prior run exists.
- [ ] Skill exits early with PRO+ upgrade message if workspace is not PRO+.

## Arguments

| Argument | Type | Default | Description |
|---|---|---|---|
| `workspace` | string | required | Workspace id or `owner/repo` |
| `period` | string | `30d` | `7d` / `14d` / `30d` / `90d` |
| `limit` | number | `1000` | Max raw rows the collector pulls |

## Related skills

- `docs-engagement-analyzer` — what users do *after* landing
- `docs-funnel-mapper` — multi-step journey analysis
- `docs-gap-finder` — what to write next (different question entirely)
