---
name: docs-visitor-cohort
description: Drills into the top-N most active anonymous visitors and clusters them by behavior pattern — "buyer-blocker" (visits pricing, leaves negative feedback), "tire-kicker" (browses but never reaches CTA), "deep-reader" (long engagement, positive signals). Surfaces cohort-level findings that page-level analytics miss. Produces an insight JSON report consumable by downstream actor agents. Requires PRO+ plan.
metadata:
  version: 1.1.0
  category: observability
  mode: audit
  measures:
    - visit_evidence
    - dead_end_rate
    - time_to_first_value
  metric_dictionary: ../../metrics/metric-dictionary.json
  requires_plan: pro_plus
  accelerated_by:
    - docsbook-mcp
    - markdown-lsp
  produces_files:
    - .docsbook/insights/<timestamp>__docs-visitor-cohort.json
    - .docsbook/insights/<timestamp>__docs-visitor-cohort.md
    - .docsbook/insights/latest/docs-visitor-cohort.json
  output_schema: https://docsbook.io/schemas/insight.schema.json
  pipeline_subagents:
    - analytics-collector
    - analytics-clusterer
    - analytics-reporter
    - insights-archivist
  keywords: [cohort, visitor, behavior, segmentation, top-users, buyer, blocker, retention]
---

# docs-visitor-cohort — Find the behavioral cohorts behind aggregate numbers

Page-level analytics tell you *which page* is doing badly. Cohort analysis tells you *which kind of user* is failing — and that's often what marketing/product actually need to know.

This skill takes the top ~20 most active anonymous visitors, pulls each one's full activity timeline, and uses the LLM to cluster them into 3–6 named behavioral cohorts (e.g. `buyer-blocker`, `mcp-debugger`, `tire-kicker`). Each cohort becomes a finding with severity tied to how blocking the pattern is.

## When to run

- Monthly.
- After major launches — who arrived?
- Before a pricing change — what's the current top-user profile?

## Workflow

Standard four-stage docs-insights pipeline. Slice = `cohort`. The collector fans out: first the ranked list of the most active anonymous visitors, then one full timeline per returned `visitor_id` (5 parallel).

- **Collector:** `COHORT_SIZE` defaults to `20`. Each visitor's timeline is captured (pageviews, cta_clicks, feedback).
- **Clusterer:** LLM-clusters timelines by behavior pattern. Produces 3–6 cohorts.
- **Reporter:** `cohort_pattern` finding per cluster. Severity by blocker score.

## What this skill catches

| Cohort label (example) | Pattern | Action |
|---|---|---|
| **`buyer-blocker`** | landing → quick-start → billing → 👎 on billing, no Upgrade click | `add_to_todo` + `notify_slack` — this is a sales-critical pattern |
| **`mcp-debugger`** | repeated visits to mcp.md and webhooks.md, no CTA hits | `invoke_skill: docs-editor` — likely missing examples |
| **`deep-reader`** | wide path coverage, long dwell, no negative signals | `info` — replicate what they read in onboarding |
| **`tire-kicker`** | many pages, 0 CTA, never returns | `info` — context, not problem |

## Guardrails

- PRO+ only — per-visitor rankings and timelines are gated above PRO.
- Privacy: `visitor_id` is a random anonymous ID; report MAY include up to 20 of them in `samples` for downstream debugging. NEVER include `user_agent`, IPs, or referrer query strings.
- Minimum 10 visitors needed to attempt clustering; below that, exit with `no_data`.
- Cohort labels must be descriptive — never numeric. Use lowercase-kebab-case.
- LLM-clustering with < 10 visitors is unreliable; the clusterer sets `confidence: 0.5` in that case.

## Output for downstream consumption

Each cohort finding's `suggested_actions[]` is mapped to:

- `add_to_todo` for behavioral patterns that need product/marketing/sales input.
- `notify_slack` if a blocker cohort exceeds 30% of the top visitors (escalation worth a human's attention).
- `invoke_skill: docs-editor` only when the cohort's drop page is clearly a documentation problem (e.g. `mcp-debugger` cohort dropping on `mcp.md`).

## Acceptance criteria

Same shape as `docs-utm-analyzer`. Cohort labels are present in `findings[].title`.

## Arguments

| Argument | Type | Default | Description |
|---|---|---|---|
| `workspace` | string | required | id or `owner/repo` |
| `period` | string | `30d` | `30d` is the working default |
| `cohort_size` | number | `20` | How many top visitors to drill into |

## Related skills

- `docs-funnel-mapper` — aggregate journeys
- `docs-engagement-analyzer` — page-level dwell
- `docs-utm-analyzer` — entry-side, often correlates with cohort
