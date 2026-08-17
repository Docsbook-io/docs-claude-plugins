---
name: docs-link-click-analyzer
description: Measures click-through rate on every internal link and CTA button across the docs. Flags conversion-critical buttons (Upgrade, Sign up, Book demo) whose CTR sits below the site median given comparable impressions. Also surfaces "orphan traffic" — pages with pageviews but zero outgoing clicks. Produces an insight JSON report consumable by downstream actor agents. Requires PRO+ plan.
metadata:
  version: 1.1.0
  category: observability
  mode: audit
  measures:
    - exit_rate
    - traffic
  metric_dictionary: ../../metrics/metric-dictionary.json
  requires_plan: pro_plus
  accelerated_by:
    - docsbook-mcp
    - markdown-lsp
  produces_files:
    - .docsbook/insights/<timestamp>__docs-link-click-analyzer.json
    - .docsbook/insights/<timestamp>__docs-link-click-analyzer.md
    - .docsbook/insights/latest/docs-link-click-analyzer.json
  output_schema: https://docsbook.io/schemas/insight.schema.json
  pipeline_subagents:
    - analytics-collector
    - analytics-clusterer
    - analytics-reporter
    - insights-archivist
  keywords: [ctr, cta, conversion, clicks, links, buttons, upgrade, sign-up]
---

# docs-link-click-analyzer — Find dead CTAs and dead-end pages

Two failure modes this skill catches:

1. **Underperforming CTA** — a button gets impressions but few clicks. Example: `/quick-start` has 30k views, `Sign up` CTA has 60 clicks (0.2%). The CTA is invisible, mislabeled, or the page doesn't earn the click.
2. **Orphan traffic** — a page receives pageviews but no one clicks anything on it. Either the page is a terminal (FAQ-style), or it's a dead end nobody intended.

## When to run

- Weekly during pricing/onboarding experiments.
- Monthly otherwise.
- Whenever site median CTR moves materially.

## Workflow

Standard four-stage docs-insights pipeline. Slice = `link_clicks`. See [`docs-utm-analyzer`](../docs-utm-analyzer/SKILL.md) for canonical step-by-step.

- **Collector:** every click a reader made on a CTA or an outgoing link, grouped by `(source_page, target_label)`, plus per-page traffic totals to serve as impressions. Any other click-level signal on the same pages belongs here.
- **Clusterer:** computes `expected_ctr` = site-wide median CTR of the same CTA label. Flags clusters where CTR < 0.5× expected AND impressions ≥ 200.
- **Reporter:** `cta_underperformance` (high severity for revenue CTAs like Upgrade/Sign up; medium otherwise); `orphan_traffic` for zero-click pages with ≥ 200 pv.

## What this skill catches

| Pattern | Example finding |
|---|---|
| **CTA buried** | `Upgrade` on `pricing-spec.md`: 12k impressions, 160 clicks (1.3% vs site median 4%). Position or wording problem. |
| **Wrong CTA on the wrong page** | `Sign up` on `webhooks.md`: 800 imp, 2 clicks. Readers here are already users — the CTA should be `View example payloads` or `Open Webhooks tab`. |
| **Orphan page** | `legacy-export.md`: 2k pv, 0 outbound clicks, 0 CTA clicks. Probably dead end — verify and either link out from it or redirect it. |
| **Healthy CTA** | `Book demo` on `enterprise.md`: 1.2k imp, 110 clicks (9%). → `info`, replicate. |

## Guardrails

- PRO+ only.
- Need ≥ 200 impressions before flagging a CTA — fewer is statistical noise.
- The site-median CTR baseline is per-workspace, not global.
- A CTA may legitimately have low CTR if the page is purely informational (e.g. a 404 explanation page) — when in doubt, the reporter marks severity as `medium` not `high`.

## Output for downstream consumption

`suggested_actions`:

- `invoke_skill: docs-editor` with the source page path + the CTA label + the expected vs. actual CTR. The editor decides whether to change the label, move the CTA up, or rewrite the surrounding paragraph.
- For orphan pages: `add_to_todo` ("review whether this page should link out or be redirected").
- `invoke_skill: docs-link-click-analyzer` itself as a follow-up after a change (with `next_run.after` = `+7 days`).

## Acceptance criteria

Same shape as `docs-utm-analyzer`. Site median CTR is reported in `site_baselines.median_ctr` so the actor can apply consistent reasoning.

## Arguments

| Argument | Type | Default | Description |
|---|---|---|---|
| `workspace` | string | required | id or `owner/repo` |
| `period` | string | `14d` | `7d` / `14d` / `30d` |
| `min_impressions` | number | `200` | Floor before flagging |

## Related skills

- `docs-funnel-mapper` — multi-step view (this is one-hop)
- `docs-engagement-analyzer` — dwell time on the same page
- `docs-utm-analyzer` — many low-CTR CTAs correlate with bad-source UTM traffic
