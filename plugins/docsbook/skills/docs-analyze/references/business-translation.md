# Translating numbers into something a business acts on

A finding nobody acts on was written for the wrong reader. The report's job is not to prove the analysis happened; it is to make one person able to decide what to do on Monday.

## The shape of a finding

Every line answers four questions: **what to fix, why this one, who fixes it, how we will know it helped.**

```
Period: last 7 days · 1,240 visits · source tier: full (behaviour + ranked digest)

#1  /billing/invoices — health 31/100 (readers giving up dominates; 3 dislikes)
    Why now:   412 readers, 58 gave up here — the largest single loss in the set
    Effort:    M (rewrite of one section, no new page)
    Effect:    dead-end rate on this page 14% → under 8% within two weeks
    Owner:     docs-manage — rewrite brief, after the journeys are read

#2  "sso saml setup" — unanswered 23×, zero results 11× (two independent signals agree)
    Why now:   no page exists; workspace impact: high
    Effort:    L (new page)
    Effect:    the query stops appearing in unanswered questions within one release
    Owner:     docs-create

#3  /quickstart — health 44/100 (dislikes dominate; 9 of 11 votes negative)
    Why now:   highest-traffic page in the set; a correctness problem, not a gap
    Effort:    S (accuracy pass on two steps)
    Effect:    assistant satisfaction on this page recovers above the warning line
    Owner:     docs-manage

Not this week: 14 further pages below the cut, all under 40 visits in the period.
Excluded as noise: 6 pages scoring badly on fewer than 5 events.
```

Rules for the table: absolute counts next to every rate; effort as S/M/L with the reason in parentheses; the effect line names **one** number and a horizon; every line ends with a named owner or an explicit "nothing in the catalogue fits, here is the work in one sentence". A line without an executor is not a plan, it is a complaint.

Five items is a plan. Twenty is a backlog dump that gets ignored. Everything below the cut is one line with a count.

## Say it in the reader's terms, not the metric's

| Instead of | Say |
|---|---|
| "dead_end_rate 14%" | "58 of 412 readers left this page without getting what they came for" |
| "position 8.4, CTR 0.6%" | "1,840 people saw this page in search results this month and 11 clicked. The title they saw shares no words with what they typed." |
| "zero_click_rate elevated" | "readers searched, saw your pages listed, and opened none of them — the titles are not reading as the answer" |
| "content_health 31/100" | "on this page, readers giving up is what drives the score, not disliked answers — so it needs a rewrite of the section they give up in, not a correctness pass" |
| "funnel completion 8%" | "4,000 sessions walked quick start → features → billing; 320 took the action at the end" |
| "12% of conversations are pricing-stage" | "14 of 118 conversations were people asking what it costs before deciding — and the assistant had nothing to answer 9 of them with" |

## Quote the reader

A query in someone's own words moves an author more than any aggregate, and they can verify it without rerunning the analysis. Wherever a reader wrote something — a search, a question, a piece of feedback — quote it verbatim, with the count of separate visits behind it.

## The conversions you must refuse

- **Never convert findings into money, pipeline, or deflected support tickets on the owner's behalf.** Deflection counts a reader who gave up the same as one who got help. If the owner wants a figure, ask *them* for their cost per ticket and label the result as their assumption.
- **Never restate a buying-stage count as intent or revenue.** It is a count of conversations classified from text.
- **Never restate someone else's impact estimate in your own units.** Pass it through as given, and label your own estimates as yours.
- **Never present impressions as an audience size.** They are counted per query.
- **Never promise a search position.** You can promise a better pitch to people already being shown the page.

## Measured or hypothesis, on every line

Findings backed by data carry the dated window and the numbers behind them. Findings without carry `hypothesis` and say what the missing data would have settled. Keep the two visibly separated — a reader who cannot tell which is which discounts both.

"This title is 74 characters" is a fact. "This title is a label, not a search intent" is a hypothesis. Length, duplication, missing frontmatter, heading skips, missing alt text and orphan pages are all verifiable from the text alone and stay facts even with no analytics at all.

## The machine format stays underneath

Structured findings exist so an orchestrator or a host application can consume them — the `action` and `constraints` fields are instructions for a tool, not prose for a person. Never paste that JSON into a reply as "the report": a wall of `"severity": "high"` reads as a system error and buries the one line that mattered.

When a person asked, answer the way an editor would: the worst problem first, in plain language, with the before and after, and an offer to apply the fixes. If the host can render changes for approval, that is the answer; the machine format stays under it.

```json
{
  "file": "docs/api/authentication.md",
  "line": 2,
  "severity": "critical",
  "rule": "position-5-20-no-clicks",
  "confidence": "measured",
  "evidence": {
    "window": "2026-07-01..2026-07-29",
    "query": "how to authenticate api requests",
    "position": 8.4,
    "impressions": 1840,
    "clicks": 11
  },
  "found": "Ranks at 8.4 for 'how to authenticate api requests' — 1,840 people saw this result and 11 clicked. The title shown to them is 'Authentication', which shares no words with what they typed.",
  "suggestion": "title: 'How to authenticate API requests | Product' (52 chars, matches the query the page already ranks for). The page is already visible; only the click is missing.",
  "action": "rewrite_title",
  "constraints": { "max_length": 60 }
}
```
