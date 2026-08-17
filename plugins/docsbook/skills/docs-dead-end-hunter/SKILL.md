---
name: docs-dead-end-hunter
description: Finds the evidence that readers are leaving your documentation with nothing — the visits where someone searched, asked the AI or opened several pages and still gave up. Produces a ranked list of the pages they gave up on, each with the actual reader journeys behind it, so the fix queue is decided by evidence rather than opinion. Use when asked "why are readers leaving", "which pages are losing people", "what should I rewrite first", "prove the docs are failing", or for a weekly retention review. Requires PRO plan.
metadata:
  version: 1.0.0
  category: observability
  mode: audit
  measures:
    - dead_end_rate
    - self_serve_resolution_rate
    - exit_rate
    - content_health_score
    - visit_evidence
  metric_dictionary: ../../metrics/metric-dictionary.json
  requires_plan: pro
  accelerated_by:
    - docsbook-mcp
    - markdown-lsp
  produces_files:
    - .docsbook/insights/<timestamp>__docs-dead-end-hunter.json
    - .docsbook/insights/<timestamp>__docs-dead-end-hunter.md
    - .docsbook/insights/latest/docs-dead-end-hunter.json
  output_schema: https://docsbook.io/schemas/insight.schema.json
  keywords: [dead end, retention, churn, giving up, losing readers, what to fix, rewrite, exit, evidence, failing docs]
---

# docs-dead-end-hunter

Traffic tells you how many arrived. This tells you **how many left with nothing —
and which page to fix.**

A *dead end* is a visit where the reader demonstrably tried: they searched, asked
the assistant, or opened three or more pages — and still produced no sign of
having got what they came for. It is the closest thing to direct evidence that
documentation is failing, and unlike bounce rate it never counts someone who
never engaged in the first place.

## Before you start

Read `metrics/metric-dictionary.json` for the metrics listed in
`metadata.measures`. Every number below has confounders that will make you give
confidently wrong advice if you skip them — in particular:

- **A high exit rate is not a problem on its own.** A page people leave from
  *after succeeding* is a terminal success page. Recommending a rewrite there
  makes the docs worse. Always read `exit_rate` next to `dead_end_rate`.
- **Rates below ~30 visits are noise.** The product withholds the percentage and
  returns counts instead. When it does, say "not enough data" and report the
  absolute number — never quote a percentage it declined to give you.
- **Visitors are hashed IPs.** Shared networks merge readers, mobile networks
  split them. Report direction of travel, not headcounts.

## Workflow

1. **Establish the headline.** Get the visit-outcome breakdown for the period:
   dead-end rate, self-serve resolution rate, and the raw counts behind them.
   If the sample is too small, stop and report that plainly — a fabricated
   percentage destroys trust in everything else in the report.

2. **Rank the pages.** Pull the dead-end pages list. Ignore any row flagged as a
   terminal success. What remains is the fix queue, ordered by how many readers
   actually gave up there.

3. **Read the journeys, not just the counts.** For the top three pages, pull the
   individual visits that ended on them. The step *before* the exit is usually
   the real problem — a reader who lands on `/billing`, searches twice and leaves
   is telling you something different from one who arrives from `/quickstart`
   and stops dead.

4. **Separate the three failure modes.** Every dead end is one of:
   - **Missing** — no page answers the question. Cross-check zero-result
     searches and unanswered AI questions; a topic in *both* is confirmed
     independently and outranks a bigger count in either alone.
   - **Unhelpful** — the page exists but does not answer. High dead-end with
     traffic already arriving.
   - **Unfindable** — the answer exists but readers do not reach it. Low search
     click-through, or journeys that never touch the page that would have helped.

   The fix is different for each, and mislabelling wastes the author's time:
   writing a new page when the real problem was the title is expensive and does
   not work.

5. **Write the report.** For each item: the page, how many readers gave up there,
   which failure mode, the evidence (a journey or a query, quoted), and one
   concrete action. Rank by readers affected.

## Guardrails

- **Report absolute numbers alongside every rate.** "31% (14 of 45 visits)" is
  honest; "31%" alone invites the owner to over-read a thin sample.
- **Never convert this into a support-deflection figure or a dollar amount** on
  Docsbook's behalf. Deflection counts someone who gave up the same as someone
  who got help. If the owner wants money, ask *them* for their cost per ticket
  and label the result as their assumption.
- **Do not recommend rewriting a page on exit rate alone.** Check the outcome
  mix first.
- **Quote the reader.** A zero-result search in the reader's own words is more
  persuasive to an author than any aggregate, and it is evidence they can act on
  immediately.
- **Bots are excluded from behavioural metrics but not from raw pageviews.** Do
  not present the two totals side by side as if they reconcile.

## Output

A ranked list of concrete fixes with `title` in the imperative — "Rewrite
/billing: 14 readers searched and left" — not a dashboard of numbers. Each entry
carries its evidence so the author can verify the claim without rerunning the
analysis.

## Related skills

- **`docs-change-impact`** — run it after one of these fixes ships. This skill
  says which pages readers gave up on; that one says whether the fix moved
  anything the untouched pages did not, which is the only way a recommendation
  here stops being repeated on faith.
