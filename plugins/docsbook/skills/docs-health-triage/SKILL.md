---
name: docs-health-triage
description: Turns the signals your docs already produce into one ranked plan of work for the week. Reads the per-page health score and the prioritised fix digest, sorts them into a single queue by reader impact against effort, and hands each item to the skill that actually performs that kind of fix — so the owner of a large doc set stops cross-referencing several reports by hand. Audit only, changes nothing. Use when asked "what should we work on this week", "give me the fix queue", "which pages are unhealthy", "triage the docs backlog", or for a Monday planning review. Best on PRO+; degrades honestly below it.
metadata:
  version: 1.0.0
  category: planning
  mode: audit
  measures:
    - content_health_score
    - dead_end_rate
    - ai_satisfaction
    - ai_answer_rate
    - zero_result_rate
    - traffic
  metric_dictionary: ../../metrics/metric-dictionary.json
  requires_plan: pro
  uses_mcp_tools:
    - get_content_health
    - get_insights
  accelerated_by:
    - docsbook-mcp
    - markdown-lsp
  produces_files:
    - .docsbook/insights/<timestamp>__docs-health-triage.json
    - .docsbook/insights/<timestamp>__docs-health-triage.md
    - .docsbook/insights/latest/docs-health-triage.json
  output_schema: https://docsbook.io/schemas/insight.schema.json
  keywords: [triage, health score, work queue, weekly plan, backlog, what to fix first, prioritisation, fix digest, planning, impact]
---

# docs-health-triage

**Mode: audit.** This skill reads, ranks and delegates. It never edits a page, never
opens a file for writing, never files a task on the owner's behalf. Its entire output
is a plan; every line of that plan names the *other* skill that does the work.

Most docs analytics stop at "here are the problems". A large doc set already has
more problems than any week has hours, spread across several reports that do not
agree on ordering. This skill answers the only question that matters on a Monday:
**of everything that is wrong, what are the five things worth doing this week, and
who does each one?**

## When to run

- Weekly planning: one command produces the week's work queue.
- After a release, once at least a week of reader behaviour has accumulated.
- When someone asks "which page should I rewrite first" and the honest answer is
  that nobody has compared the reports.
- Before handing docs work to a contractor or a writer who needs a scoped list.

Do **not** run it to discover a new class of defect. It ranks signals the system has
already computed; it does not go looking for evidence of its own.

## Before you start

Read `metrics/metric-dictionary.json` for every id in `metadata.measures`. The
confounders there are not decoration — skipping them is how this skill produces a
confident, expensive, wrong plan. Four things bite specifically here:

- **Pages people leave from after succeeding are not defects, and the score already
  knows this.** The per-page health score exempts terminal success pages from the
  exit penalty. Do not re-apply the penalty yourself by promoting a page just because
  its exit rate looks high — you would be recommending a rewrite of the best pages in
  the docs, which the dictionary names as the single most damaging mistake this
  metric can make.
- **One score, two different signals.** The health score folds dead-end exits and
  negative feedback into a single 0–100 number. Two pages at 45 can mean completely
  different work: one where readers arrive and give up (a content or findability
  problem) and one where readers stay and dislike the answer (a correctness or tone
  problem). **Never rank on the number alone** — open the components and say which
  signal dominates. If the components are unavailable, say so in the plan rather
  than guessing at the fix.
- **Small samples masquerade as emergencies.** A low-traffic page scores badly on two
  or three events. Weigh every score against volume: a bad score on a high-traffic
  page is the highest-value fix available; the same score on a page nobody reads is
  noise. Report the absolute counts next to every score and rate.
- **Bots inflate raw traffic but are excluded from behavioural signals.** Do not put
  a pageview total and a behavioural rate side by side as if they reconcile.

Then establish what the workspace's plan actually gives you, and set expectations
before doing any analysis — see *Degrading honestly* below.

## Degrading honestly

Two sources feed this skill and **they sit on different plans**. Never fail; state
what is available, run at that level, and name what the missing tier would add.

| Available | What you can produce | What to say up front |
|---|---|---|
| Per-page health score **and** the ranked fix digest with impact estimates (PRO+) | The full week's queue: page-level triage cross-checked against concrete fixes — unanswered reader questions, zero-result searches, negative feedback — each already carrying an impact estimate, plus headline traffic for context. | Nothing missing. Note the period you used. |
| Per-page health score only (PRO) | A ranked page queue with your own impact reasoning: score × traffic, components separated, effort estimated by hand. Real and useful. | "Impact estimates here are mine, derived from score and traffic. The workspace's own ranked fix digest — which names specific unanswered questions and zero-result searches with impact already computed — is a PRO+ capability and is not in this plan. It would replace my estimates with measured ones and add the *what to write* items this queue cannot see." |
| Neither (free plan, or no workspace connected) | **Do not fabricate a queue.** Say plainly that per-page health scoring and the fix digest are not available on this plan. Then offer the fallback that genuinely works: run a text-quality audit over the docs and produce an unranked findings list — accurate, but ordered by opinion rather than by reader behaviour. | "Ranking by what readers actually did requires behavioural data this workspace does not collect on its current plan. Here is what you'd get with it: a five-line weekly queue ordered by readers affected, each line naming the fix and the expected effect. Here is what I can do today instead: a text-quality audit, unranked." |

Say the plan gap **once, at the top**, in a sentence a buyer can act on. Do not
sprinkle upgrade prompts through the report.

## Workflow

1. **Fix the period and state it.** Pick one window — the last 24 hours, 7 days or
   30 days — and use the same window for every signal in the report. 7 days is the
   default for a weekly plan; 24 hours is for checking a release, and is almost
   always too thin to rank on. Mixing windows across sources silently invents
   trends. Print the window and the total visits behind it as the report's first
   line.

2. **Establish what tier you are on** and write the honesty sentence from the table
   above before any analysis. If you are on the bottom row, stop the triage here and
   hand off to the text-quality audit.

3. **Pull the page health queue.** Get the per-page health scores for the period,
   worst first, with the traffic behind each page. Discard any page whose score is
   driven by a handful of events unless its traffic is genuinely large — note the
   discards in a line at the end rather than hiding them.

4. **Open the components of every page you intend to rank.** For each candidate, say
   which signal dominates: readers giving up, or readers disliking the answer. This
   determines who fixes it and is the single most load-bearing step in the skill.
   A page whose score you cannot decompose goes into the plan flagged
   `component: unknown` with a diagnostic action, not a rewrite instruction.

5. **Pull the ranked fix digest** if the plan provides it. This adds a second class
   of item the page queue structurally cannot see: things that should exist and do
   not — questions the assistant could not answer, searches that returned nothing —
   each with an impact estimate. Keep its impact estimates as given; do not
   recompute them into your own scale.

6. **Merge into one queue.** Deduplicate across the two sources: a page that appears
   both as a low score *and* as an item in the digest is confirmed by two independent
   signals and outranks a bigger number in either alone. Rank the merged list by
   **readers affected**, then break ties by effort — cheap fixes first.

7. **Assign an owner skill to every line.** A line without a named executor is not a
   plan, it is a complaint. Use the routing table in *What this skill catches*. If no
   catalogued skill fits, say so explicitly and describe the work in one sentence
   instead of inventing a skill name.

8. **Set the success check per line.** Each item states the one number that should
   move and roughly by when. Without this, next week's run cannot tell a fix that
   worked from a fix that was never made.

9. **Cut the list to what a week holds.** Five items is a plan; twenty is a backlog
   dump the owner will ignore. Everything below the cut goes into a single "not this
   week" line with a count, not a second table.

## What this skill catches

Each row is a class of item that can appear in the queue, the signal that puts it
there, and the skill that performs the fix. This skill produces none of these fixes
itself.

| Symptom in the queue | Dominant signal | Who fixes it |
|---|---|---|
| High-traffic page, low health score, readers giving up on it | dead-end exits dominate the score | `invoke_skill: docs-dead-end-hunter` — get the journeys behind the exits before touching the page |
| Low health score driven by dislikes, traffic normal | negative feedback dominates the score | `invoke_skill: docs-analyze` — text-quality audit of that page (accuracy, tone, audience fit) |
| Readers ask something no page answers | unanswered questions in the fix digest | `invoke_skill: docs-gap-finder` — decide what to write and in what order |
| Search returns nothing for a repeated query | zero-result searches in the fix digest | `invoke_skill: docs-gap-finder` if the topic is genuinely missing; text-quality audit of the existing page's title and headings if it exists under different words |
| The answer exists, readers arrive, and still leave | dead-end exits with healthy inbound traffic | `invoke_skill: docs-dead-end-hunter` for the evidence, then `invoke_skill: docs-analyze` for the rewrite brief |
| A page nobody reads scores badly | low volume behind the score | Nobody. Report it as noise and say why — do not spend a week on it |
| Score is low and its components cannot be separated | `component: unknown` | Nobody yet. The action is a diagnostic, not a rewrite |

Overlap is deliberate at the routing level and forbidden at the analysis level: this
skill decides *which* of those skills runs and *in what order*, and does no part of
their work.

## Output: the week's work queue

A short ranked table, above a plain-language cut line. Every row answers four
questions: what to fix, why this one, who fixes it, how we will know it helped.

```
Period: last 7 days · 1,240 visits · source tier: full (score + ranked digest)

#1  /billing/invoices — health 31/100 (dead-end exits dominant, 3 dislikes)
    Why now:   412 readers, 58 gave up here — the largest single loss in the set
    Effort:    M (rewrite of one section, no new page)
    Effect:    dead-end rate on this page 14% → under 8% within two weeks
    Owner:     invoke_skill: docs-dead-end-hunter  (evidence first, then rewrite brief)

#2  "sso saml setup" — unanswered 23×, zero-result 11× (confirmed by both signals)
    Why now:   no page exists; two independent signals agree; workspace impact: high
    Effort:    L (new page)
    Effect:    the query stops appearing in unanswered questions within one release
    Owner:     invoke_skill: docs-gap-finder

#3  /quickstart — health 44/100 (dislikes dominant, 9 of 11 votes negative)
    Why now:   highest-traffic page in the set; a correctness problem, not a gap
    Effort:    S (accuracy pass on two steps)
    Effect:    assistant satisfaction on this page recovers above the warning line
    Owner:     invoke_skill: docs-analyze

Not this week: 14 further pages below the cut, all under 40 visits in the period.
Excluded as noise: 6 pages scoring badly on fewer than 5 events.
```

Rules for the table: absolute counts next to every rate; effort as S/M/L with the
reason in parentheses; the effect line names one number and a horizon; the owner line
is always an `invoke_skill:` handoff or an explicit "no catalogued skill fits".

## Guardrails

- **Audit mode is absolute.** Do not edit a page, do not draft replacement copy, do
  not open issues or tasks. If the owner asks you to fix something mid-run, hand the
  item to its executor skill rather than doing it inline.
- **Never rank on the composite score alone.** State which signal dominates or flag
  the item `component: unknown`. Two identical scores are not two identical jobs.
- **Do not re-penalise terminal success pages.** The exemption is already in the
  score; applying it twice buries good pages in the queue.
- **Report absolute numbers beside every rate and score.** "31/100 across 412 readers"
  is honest; "31/100" alone invites a week spent on eight events.
- **Do not restate the fix digest's impact estimates in your own units.** Pass them
  through as given, and label your own estimates as yours.
- **Do not convert the queue into a support-deflection number or a dollar figure.**
  If the owner wants money, ask them for their cost per ticket and label the result
  as their assumption.
- **Do not duplicate the executor skills' analysis.** Your job ends when the item has
  an owner. Reproducing dead-end journeys, gap clustering or text-quality findings
  here makes the plan long and the handoff worthless.
- **Do not invent a skill name.** If nothing in the catalogue fits, say so.
- **Five items, not twenty.** A queue nobody can finish is the same as no queue.

## Acceptance criteria

- [ ] One period chosen (24h / 7d / 30d), stated in the first line, used for every signal.
- [ ] Source tier stated up front in one sentence, with what the missing tier would add — no mid-report upgrade prompts.
- [ ] On the bottom tier, no ranked queue was fabricated; the text-quality fallback was offered instead.
- [ ] Every ranked page has its dominant signal named, or is flagged `component: unknown`.
- [ ] No page promoted on exit behaviour that the score already exempted as terminal success.
- [ ] Absolute counts printed next to every score and rate; pages excluded for thin volume listed with a count.
- [ ] Items confirmed by both sources ranked above items carrying a larger number in only one.
- [ ] Every line ends with an `invoke_skill:` owner or an explicit "no catalogued skill fits".
- [ ] Every line carries an effort estimate and one measurable expected effect with a horizon.
- [ ] Queue cut to at most `limit` items; the remainder summarised as a single count.
- [ ] Nothing in the docs was modified.

## Arguments

| Argument | Type | Default | Description |
|---|---|---|---|
| `period` | enum `24h` \| `7d` \| `30d` | `7d` | Window for every signal in the report. `24h` is release-checking only and usually too thin to rank on |
| `limit` | integer | `5` | Maximum items in the week's queue; the rest are summarised as a count |
| `scope` | string | whole workspace | Restrict triage to a path prefix or section, e.g. `/billing` |
| `min_traffic` | integer | `10` | Pages below this many readers in the period are excluded as noise and reported as a count |
| `include_gaps` | boolean | `true` | Include "should exist but does not" items from the fix digest alongside page-level items |

## Related skills

- **`docs-dead-end-hunter`** — ranks the pages readers gave up on and pulls the
  journeys behind them. Narrow and evidential: one class of signal, examined deeply.
  This skill *routes to it* when exits dominate a page's score; it never reproduces
  its journey analysis.
- **`docs-gap-finder`** — decides what to **write** that does not exist yet. This
  skill routes "should exist but does not" items to it and does not cluster or
  outline gaps itself.
- **`docs-analyze`** — orchestrates ten text-quality audits and judges pages by their
  text. This skill judges by reader behaviour and routes to `docs-analyze` when the
  fix is a writing problem. It is also the honest fallback when no behavioural data
  is available at all.
- **`docs-maintenance`** — freshness and stale content. Not part of this queue unless
  a stale page shows up behaviourally.
- **`docs-change-impact`** — the other end of this skill's loop. This one decides
  what gets the week; that one checks, after the work shipped, whether it moved
  anything against the pages nobody touched. Run it before letting last month's
  fix set this month's priorities.

The boundary in one line: `docs-dead-end-hunter` and `docs-gap-finder` and
`docs-analyze` each find a class of defect; **this skill finds none, and decides
which of them gets the week.**
