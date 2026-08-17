---
name: docs-gap-finder
description: Know exactly which docs page to write next. Cross-references real user signals — failed searches, AI-unanswered questions, popular queries — against your live doc graph and returns the top 7 pages worth creating. Optionally opens a GitHub Issue with a draft outline for each. PRO+.
metadata:
  version: 1.0.0
  category: observability
  mode: audit
  accelerated_by:
    - markdown-lsp      # graph search over the docs folder (self-hosted)
    - docsbook-mcp      # search-miss & unanswered-question analytics + doc graph, if a Docsbook workspace is connected (PRO+)
  keywords: [gap, content, missing, analytics, observability]
---

# docs-gap-finder — Content Gap Analysis

Surfaces which documentation pages should be created next, based on real user signals (search misses, unanswered AI-chat questions, top external queries) instead of guesswork. Cross-references these signals against the live doc graph so already-covered topics are filtered out, then returns a prioritized list of the **top 7 pages to create**.

## Workflow

1. **Collect demand signals** — gather what users searched for but didn't find, questions the AI/support couldn't answer, and the most popular queries. If a docs analytics source is connected (e.g. a Docsbook workspace, PRO+), pull these directly; otherwise work from whatever search-log / support-ticket / question data the user can provide. Retain normalized text, frequency, and source signal type for each result.
2. **Gather the docs** — get the list of pages in scope and read their titles/headings. If a semantic/graph search tool over the markdown is available (self-hosted `markdown-lsp`, or a connected Docsbook workspace), prefer it — faster and cheaper than scanning files; otherwise read the files directly with `grep`/`find`.
3. **Cluster and score** — group near-duplicate queries into topic clusters. Compute priority score: `(failed_search × 3) + (ai_unanswered × 3) + (popular_search × 1)`. Failed searches and unanswered AI questions outweigh popularity — they confirm a gap.
4. **Cross-reference doc graph** — drop clusters already covered by an existing page (title/H1/H2 token overlap ≥ 0.6 with non-stub content). Mark partial matches as `expand_existing`.
5. **Produce report** — sort surviving clusters by score, take top `limit` (default 7), emit a markdown report with draft outlines per gap.
6. **Optionally open GitHub Issues** — if `open_issues: true`, create one issue per gap in the source repo with the draft outline and signal data.

## Guardrails

- Demand-signal analytics (search misses, unanswered AI questions) come from a connected docs-analytics source — in Docsbook these are PRO+ features. If none is connected, don't exit: run on whatever search-log / support / question data the user provides, and note in the report which signal sources were unavailable.
- Do not create docs files — surface gaps only (or GitHub Issues if `open_issues: true`).
- A cluster is "covered" only when the matching page has non-trivial content — stubs count as gaps.
- Run monthly or after major product launches — search-miss patterns shift fastest then.
- Pairs with `docs-analyze` (quality of existing pages) and `docs-stale-watcher` (freshness) — this skill answers a different question: *what's missing entirely?*

## Inputs

This skill needs two things, by whatever means are available:
- **Demand signals** — failed searches, unanswered AI/support questions, popular queries. From a connected docs-analytics source if you have one, or from exported logs the user provides.
- **The current doc tree** — to see which topics are already covered.

> **Acceleration (optional).** A connected Docsbook workspace (PRO+) exposes search-miss and unanswered-question analytics plus the doc graph directly. Without it, feed the skill whatever search/support data you have, and read the docs folder normally.

## Checklist

### Step 1 — Signal collection

- [ ] Failed / zero-result searches collected for the target docs and period
- [ ] Unanswered AI/support questions collected for the target docs and period
- [ ] Popular queries (demand signal) collected for the target docs and period
- [ ] Each result retains: normalized text, frequency, representative phrasings, source type

### Step 2 — Clustering

- [ ] Near-duplicate queries grouped into topic clusters
- [ ] Priority score computed per cluster: `(failed × 3) + (unanswered × 3) + (popular × 1)`

### Step 3 — Coverage check

- [ ] The existing page set built from the doc tree (graph search if available, otherwise file listing)
- [ ] Clusters with covered, non-stub pages dropped
- [ ] Partial matches marked as `expand_existing` with path to the stub

### Step 4 — Report output

```
# Documentation gaps — <workspace> (<period>)

Found N high-signal gaps. Prioritized by user demand.

## 1. <Cluster topic> — score: <X>
- Action: create_new | expand_existing → <path>
- Signals:
  - failed_search: <n> hits (e.g. "<example query>")
  - ai_unanswered: <n> hits (e.g. "<example question>")
  - popular_search: <n> hits
- Suggested path: docs/<slug>.md
- Draft outline:
  1. <heading 1>
  2. <heading 2>
  3. <heading 3>

## 2. ...
```

- [ ] Top `limit` clusters reported (default 7)
- [ ] Each gap has a suggested path and draft outline derived from user query phrasings

### Step 5 — GitHub Issues (if `open_issues: true`)

- [ ] Source `owner/repo` resolved for issue creation
- [ ] One issue created per gap with title `docs: <Cluster topic>`, signal data, draft outline, and `documentation` + `gap-finder` labels
- [ ] Issue URLs printed at the end of the report

## Arguments

| Argument | Type | Default | Description |
|---|---|---|---|
| `workspace` | string | required | Workspace ID or `owner/repo` |
| `period` | string | `30d` | Analytics window: `7d` / `14d` / `30d` |
| `open_issues` | boolean | `false` | Create one GitHub Issue per gap |
| `limit` | number | `7` | Max number of gaps to return |

## Acceptance Criteria

- [ ] All three signal sources have been queried, or the report explicitly notes which were unavailable (e.g. no connected analytics source) and what data was used instead.
- [ ] Every reported gap includes a priority score, the source signals that drove it, and a draft outline.
- [ ] Clusters already covered by non-stub pages are excluded from the report.

## Related Skills

- `docs-analyze` — audit quality of existing pages
- `docs-create` — scaffold the pages identified as gaps
- `docs-strategy-plan` — plan documentation from scratch
- `docs-maintenance` — find stale pages (complementary to gap-finding)
