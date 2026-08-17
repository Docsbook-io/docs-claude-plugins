---
name: docs-engagement-analyzer
description: Splits high-dwell-time pages into "engagement signal" (deep interest) vs "engagement problem" (stuck users) by cross-referencing dwell time with negative feedback. Identifies which long-read pages are loved vs which are confusing. Produces an insight JSON report consumable by downstream actor agents. Requires PRO+ plan.
metadata:
  version: 1.1.0
  category: observability
  mode: audit
  measures:
    - dead_end_rate
    - exit_rate
    - time_to_first_value
    - bounce_rate
    - content_health_score
  metric_dictionary: ../../metrics/metric-dictionary.json
  requires_plan: pro_plus
  accelerated_by:
    - docsbook-mcp
    - markdown-lsp
  produces_files:
    - .docsbook/insights/<timestamp>__docs-engagement-analyzer.json
    - .docsbook/insights/<timestamp>__docs-engagement-analyzer.md
    - .docsbook/insights/latest/docs-engagement-analyzer.json
  output_schema: https://docsbook.io/schemas/insight.schema.json
  pipeline_subagents:
    - analytics-collector
    - analytics-clusterer
    - analytics-reporter
    - insights-archivist
  keywords: [engagement, dwell-time, time-on-page, attention, confusion, retention, content-quality]
---

# docs-engagement-analyzer — Tell interest from confusion

A user spending 5 minutes on a page can mean two opposite things:

1. **Deep interest** — pricing, billing, AI chat setup. They're reading carefully because the decision is important. _Good._
2. **Stuck** — they cannot figure out what the page is telling them. _Bad._

The only reliable disambiguator is **negative feedback** on the same page. This skill combines dwell time and feedback to label every long-dwell page as `engagement_signal` (info) or `engagement_problem` (high severity).

## When to run

- Monthly — engagement patterns are slow-moving.
- After major content rewrites — verify the rewrite improved things.
- When negative feedback on pages spikes.

## Workflow

Standard four-stage docs-insights pipeline. Slice = `engagement`. See [`docs-utm-analyzer`](../docs-utm-analyzer/SKILL.md) for the canonical step-by-step. Differences for this skill:

1. **Collector slice:** `engagement` — per-page traffic totals, the raw reading events needed to compute dwell p50/p90 per page, and the feedback readers left on each page. Any other per-page attention signal available (scroll depth, repeat reads) belongs in the same slice.
2. **Clusterer:** groups by page path, computes dwell z-score against site median, joins with feedback counts.
3. **Reporter input:** `SKILL: docs-engagement-analyzer`, `SKILL_VERSION: 1.0.0`.

## Decision matrix (clusterer applies; reporter surfaces)

| Dwell time | Negative feedback count | Finding type | Severity |
|---|---|---|---|
| > 2× site median | ≥ 1 | `engagement_problem` | `high` |
| > 2× site median | 0 | `engagement_signal` | `info` |
| < 0.5× site median | ≥ 1 | `engagement_problem` | `medium` — page is short AND disliked |
| ~median | ≥ 3 | `engagement_problem` | `medium` |

## What this skill catches

| Pattern | Example finding |
|---|---|
| **Confusing reference page** | `webhooks.md` — dwell p50 = 6:00, 12 thumbs-down. People keep re-reading because the payload shape isn't clear. → `invoke_skill: docs-editor` with the specific section. |
| **Engagement signal (positive)** | `pricing-spec.md` — dwell p50 = 4:30, 0 thumbs-down. People genuinely study pricing. → `add_to_todo` (consider expanding with comparison tables). |
| **Skim-and-leave** | `api-overview.md` — dwell p50 = 0:08. Page exists but no one reads it. → Likely an SEO/title problem, not content. |

## Guardrails

- PRO+ only.
- Need ≥ 30 pageviews per page before it's included — small samples produce noisy dwell percentiles.
- Site median is computed from the workspace itself, not from all of Docsbook — every doc set has its own attention norm.
- Never recommend deleting a page solely on dwell time.

## Output for downstream consumption

The JSON report's `findings[].suggested_actions[]` is pre-filled so the actor agent can:

- Invoke `docs-editor` with the specific page path and a prompt naming the suspected confusion source.
- Add an engagement-signal page to a `todo.md` to consider expanding it.
- Open an Issue if dwell collapsed week-over-week (`engagement_collapse` global anomaly).

## Acceptance criteria

Same shape as `docs-utm-analyzer`. Skill exits with PRO+ message if workspace is below PRO+.

## Arguments

| Argument | Type | Default | Description |
|---|---|---|---|
| `workspace` | string | required | id or `owner/repo` |
| `period` | string | `30d` | `30d` / `90d` (need volume for stable percentiles) |
| `min_pageviews` | number | `30` | Floor before including a page |

## Related skills

- `docs-utm-analyzer` — why they arrived
- `docs-funnel-mapper` — where they went next
- `docs-tune-ai-chat` — if negative feedback is on AI chat answers, not the page itself
