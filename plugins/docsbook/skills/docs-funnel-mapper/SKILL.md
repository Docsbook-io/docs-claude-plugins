---
name: docs-funnel-mapper
description: Maps the most common 3-step navigation journeys through your docs and identifies high-volume paths with low completion rates (users dropping before reaching a conversion page). Surfaces "broken journeys" — transitions implied by the doc graph that users do not actually take. Produces an insight JSON report consumable by downstream actor agents. Requires PRO+ plan.
metadata:
  version: 1.1.0
  category: observability
  mode: audit
  measures:
    - dead_end_rate
    - exit_rate
    - visit_evidence
    - self_serve_resolution_rate
  metric_dictionary: ../../metrics/metric-dictionary.json
  requires_plan: pro_plus
  accelerated_by:
    - docsbook-mcp
    - markdown-lsp
  produces_files:
    - .docsbook/insights/<timestamp>__docs-funnel-mapper.json
    - .docsbook/insights/<timestamp>__docs-funnel-mapper.md
    - .docsbook/insights/latest/docs-funnel-mapper.json
  output_schema: https://docsbook.io/schemas/insight.schema.json
  pipeline_subagents:
    - analytics-collector
    - analytics-clusterer
    - analytics-reporter
    - insights-archivist
  keywords: [funnel, journey, conversion, drop-off, navigation, paths, sessions]
---

# docs-funnel-mapper — Find where users fall out

The classic funnel question, applied to docs: "60% land on `/quick-start`, 40% reach `/billing`, but only 5% click `Upgrade`. Where did the other 35% go and why?"

This skill runs over real session data — the ordered page-to-page paths readers actually walked — clusters the recurring multi-step paths, and flags the high-volume / low-completion ones as `conversion_problem` findings.

## When to run

- Bi-weekly.
- After any navigation / sidebar change.
- Before pricing or onboarding rewrites — establishes baseline.

## Workflow

Standard four-stage docs-insights pipeline. Slice = `funnel`. See [`docs-utm-analyzer`](../docs-utm-analyzer/SKILL.md) for the canonical step-by-step.

- **Collector:** the top recurring 3-step reader paths through the docs, plus per-page traffic totals to attach volume to each step. Any session-level signal that shows what a reader did next belongs here.
- **Clusterer:** groups by `journey_pattern`, computes `completion_rate` = % of sessions reaching at least one conversion page (defined as pages containing CTA `Upgrade`, `Sign up`, `Book demo`, or pages matching the workspace's billing/pricing slug).
- **Reporter:** `conversion_problem` for completion_rate < 0.2; `broken_journey` when a doc-graph-implied transition is missing from real journeys.

## What this skill catches

| Pattern | Example finding |
|---|---|
| **Drop on billing page** | `quick-start → features → billing` has 4k sessions, but only 8% click `Upgrade`. Page exists but doesn't close. |
| **Detour journey** | Top journey is `landing → search → ???`. Users land then search instead of using the sidebar. Sidebar discoverability problem. |
| **Broken journey** | `getting-started.md` links to `webhooks.md`, but no session in the period followed that link. The anchor text is unclear. |
| **Direct-to-CTA** | `pricing.md` → `Upgrade` in one hop, 80% completion. → Mark as healthy. |

## Guardrails

- PRO+ only.
- Need ≥ 50 sessions per pattern before it's reported.
- Conversion pages are inferred from the doc graph + CTA strings — if your workspace uses non-standard CTA labels, results may miss; mention this in the human report.
- Do not collapse anonymous and authenticated sessions together — but this is enforced by the MCP, not by this skill.

## Output for downstream consumption

`suggested_actions`:

- `open_github_issue` for each high-traffic, low-completion path with a suggested hypothesis.
- `edit_page` (via `invoke_skill: docs-editor`) on the drop page — pre-filled prompt names the previous step in the path so the editor knows the context the user was carrying.
- `add_to_todo` for broken-journey items (often need product/marketing input, not a doc edit).

## Acceptance criteria

Same shape as `docs-utm-analyzer`.

## Arguments

| Argument | Type | Default | Description |
|---|---|---|---|
| `workspace` | string | required | id or `owner/repo` |
| `period` | string | `30d` | `14d` / `30d` |
| `top_journeys` | number | `15` | Top N recurring paths to surface |

## Related skills

- `docs-utm-analyzer` — entry side of the funnel
- `docs-link-click-analyzer` — per-link CTR, complements per-journey view
- `docs-visitor-cohort` — who is in each cohort that drops
