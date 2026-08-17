---
name: docs-title-rewriter
description: Rewrites the titles and opening lines of pages readers found but refused to open. Works from the searches that returned results and got no click — search worked, the results were right there, and the reader looked at your titles and decided none of them was the answer. That points at titles and summaries rather than page bodies, and it is an order of magnitude cheaper to fix than writing new content. Returns the rewritten title and first line verbatim, ready to paste. Use when asked "why does nobody click our search results", "our search is useless", "readers can't find anything even though the page exists", or after a gap analysis showed the content is already there. Requires PRO plan.
metadata:
  version: 1.0.0
  category: analysis
  mode: refactor
  measures:
    - zero_click_rate
    - search_ctr
    - zero_result_rate
  metric_dictionary: ../../metrics/metric-dictionary.json
  requires_plan: pro
  uses_mcp_tools:
    - get_search_zero_click
    - search_docs
    - get_doc_outline
  accelerated_by:
    - docsbook-mcp
    - markdown-lsp
  keywords: [titles, headlines, rewrite title, search results, zero click, no click, snippet, findability, wording, reader vocabulary, internal search, first line, summary]
---

# docs-title-rewriter

**Mode: refactor.** This skill rewrites the titles and opening lines of pages
that already exist. It never creates a page, never restructures a body, and
never files the work as "the docs are missing something".

There is a failure that no zero-result report will ever show you. The reader
typed a query. Search worked. Results appeared. And the reader read your titles,
decided that none of them was the answer, and left without opening a single one.

The page they needed was very often right there in that list. What failed was
the eight words on the row. That is why this is the cheapest repair in the whole
documentation toolbox: you are not writing content, you are renaming content
that already exists — and searches that returned nothing are deliberately kept
out of this analysis, because an empty list cannot be clicked and blaming titles
for missing pages wastes the author's week.

## When to run

- On-site search is described as "useless" or "it never finds anything", but the
  pages plainly exist.
- A gap analysis came back saying the topic is already covered — and readers
  still complain they cannot find it.
- After a rename, a product repositioning, or a docs migration: the vocabulary
  changed under the reader's feet.
- Monthly, on the top handful of rejected queries. This is a small, repeatable
  chore, not a project.

## Before you start

Read `metrics/metric-dictionary.json` for the metrics in `metadata.measures`.
Three confounders there will make you rewrite the wrong thing if you skip them:

- **A non-click is not automatically a failure.** A reader who got the answer
  out of the result snippet leaves without clicking and is perfectly happy. If
  the query is a short factual one — a default value, a port number, a limit —
  and the snippet already contains the answer, that is quiet success. Do not
  rewrite it. Say so in the report.
- **One rejected search is not a signal.** Require repetition before you touch
  anything: the same query, or two queries that clearly mean the same thing,
  from separate visits. Below that, report the query as an observation and stop.
  The rate itself is an estimate and is withheld entirely below the sample
  floor — when it is withheld, quote the raw counts and never invent a
  percentage.
- **Zero results and zero clicks are opposite diagnoses.** Nothing returned
  means the content is missing. Results returned and rejected means the content
  exists and does not look like the answer. Conflating them is the single most
  expensive mistake available here.

If the analytics behind this are gated by plan, say which plan unlocks it and
what it would have produced — the rejected queries in the reader's own words,
each with the pages that were offered and refused. Then degrade honestly: work
from whatever search logs, support tickets or session recordings the owner can
export, and label the run as reduced.

## Workflow

1. **Collect the rejected searches.** Take the queries where results were
   returned and no result was opened, for the chosen period. Group them by
   meaning rather than by exact string — "reset password", "forgot password"
   and "password recovery" are one query with three spellings, and splitting
   them hides the frequency that justifies the fix.

2. **Reconstruct what the reader actually saw.** For each surviving cluster, run
   the query against the docs yourself and write down the result list in order:
   which pages came back, and under exactly which titles. You are not judging
   whether the right page exists — you are judging whether its title, read cold
   in a list of five, looks like the answer to that query. Read the target
   page's heading structure too: the reader's words often already appear in an
   H2 halfway down, which is the fastest possible fix.

3. **Diagnose. Exactly one of three.**

   | Diagnosis | What you saw | Who fixes it |
   |---|---|---|
   | **Wrong words** | The right page was in the list, but its title uses different vocabulary than the query | You. Rewrite. |
   | **Wrong impression** | The title is technically accurate but reads as internal jargon, a feature codename, or something off-topic | You. Rewrite. |
   | **Genuinely absent** | The results are relevant-ish, but no page in the list actually answers the query | **Not this skill.** Hand it to `docs-gap-finder`. |

   Be strict about the third row. If you find yourself proposing a title that
   promises something the page does not deliver, you have misdiagnosed — a title
   that over-promises converts a non-click into a dead end, which is worse.

4. **Write the replacement, verbatim.** For each page: the current title, the
   proposed title, and the proposed first line. Both must be paste-ready — no
   "consider something like". The first line matters as much as the title,
   because it is what the result snippet shows and it is where the reader
   confirms the guess the title made.

5. **Report, ranked by readers affected.** Each entry carries the query in the
   reader's own words, how many separate visits rejected the results, the page,
   the diagnosis, and the before/after pair. Rank by how many readers were
   turned away, not by how bad the title looks to you.

## The principle this skill exists to enforce

**A title is written in the reader's words, not the product's.**

Feature names are decided in a planning meeting by people who already know what
the feature does. Search queries are typed by people who do not. When the two
disagree, the reader is right by definition — they are the ones doing the
searching.

The rejected queries in this dataset are the literal, unmediated source of the
reader's vocabulary. You do not have to guess at it, run a survey, or debate it:
it is written down, in their own spelling, with a frequency count attached. Use
those exact words in the title. That is the entire method.

## What this skill catches

| Pattern | What it means | Example fix |
|---|---|---|
| Query uses a plain verb, title uses a noun phrase | The reader searches for the task, the title names the object | "Webhook Configuration Reference" → **"Send events to your server with webhooks"** |
| Title is the internal feature name | The reader has never heard the codename and skips the row | "Atlas Sync" → **"Keep two workspaces in sync"** |
| Title states the concept, query states the error | The reader arrives holding a symptom, not a topic | "Authentication Overview" → **"Fix 401 and 403 errors when calling the API"** |
| Title is a bare noun that could mean anything | Nothing in the row distinguishes it from four neighbours | "Limits" → **"Rate limits, file size caps and how to raise them"** |
| Several near-identical titles in one result list | The reader cannot choose, so chooses nothing | Differentiate each: "Billing" / "Billing FAQ" → **"Change your plan or payment method"** / **"Refunds, invoices and failed payments"** |
| Title answers, opening line does not | The snippet undercuts a good title with boilerplate | Replace "This page describes the configuration options available." with the answer's first sentence |
| Marketing register in a technical result list | Reads as a landing page, so it is skipped as an ad | "Powerful, flexible deployments" → **"Deploy to production from the CLI"** |

## Guardrails

- **This skill does not create pages.** If the diagnosis is that no page answers
  the query, that finding is handed to `docs-gap-finder` — the skill for
  searches that came back empty and for topics with no page at all. The two
  never overlap: it takes the missing content, this one takes the content that
  exists and is refused. Explicitly listing the handoffs is part of the report,
  not an exception to it.
- **This is internal search, not Google.** How a page performs on a search
  engine's result page — impressions, positions, external click-through — is a
  different number with different fixes and belongs to `docs-seo`. Never quote
  one as the other, and never optimise a doc title for a search engine and the
  reader's search box in the same breath: when they conflict, the reader in your
  docs wins, because they are already a user.
- **Never rewrite a body here.** If the body is wrong, that is a separate,
  larger and more expensive finding — note it and move on. Mixing the two
  destroys the one thing that makes this skill worth running: it is cheap.
- **Do not touch a title on a single rejected search.** Report it as an
  observation and wait for it to repeat.
- **Check the snippet-answered case before proposing anything.** If the answer
  was visible without clicking, the non-click is a success and the title stays.
- **Never quote a withheld rate.** When the sample is too thin for a percentage,
  report the absolute counts and say the sample is thin.
- **Preserve meaning and preserve URLs.** A rewritten title must describe the
  same page it always described. If the title change implies the slug should
  change too, flag the redirect requirement rather than silently breaking links.

## Acceptance criteria

- [ ] Every proposed change traces back to at least one real rejected query,
      quoted verbatim, from more than one visit.
- [ ] For every cluster, the result list the reader saw is reconstructed and
      recorded — the pages offered and the titles they were offered under.
- [ ] Every cluster carries exactly one of the three diagnoses, and the
      "genuinely absent" ones are handed off rather than rewritten.
- [ ] Every rewrite ships both a title and a first line, verbatim and
      paste-ready.
- [ ] Queries plausibly answered by the snippet are identified and explicitly
      excluded from the rewrite list, with the reason.
- [ ] No page was created, no body was rewritten, and no rate was quoted that
      the data withheld.

## Arguments

| Argument | Type | Default | Description |
|---|---|---|---|
| `workspace` | string | required | Workspace ID or `owner/repo` |
| `period` | string | `30d` | Analysis window: `24h` / `7d` / `30d` |
| `limit` | number | `10` | Max query clusters to work through |
| `min_visits` | number | `2` | Separate visits that must reject a query cluster before it is eligible for a rewrite |
| `apply` | boolean | `false` | Write the approved titles and first lines back into the pages instead of only proposing them |

## Related skills

- `docs-gap-finder` — the mirror image: searches that returned **nothing**, and
  topics with no page at all. Hand it every cluster diagnosed as genuinely
  absent; take from it nothing, since anything it finds needs writing, not
  renaming.
- `docs-seo` — titles and descriptions for **external** search engines, judged
  against real positions and impressions. Same artefact, different audience,
  different data.
- `docs-dead-end-hunter` — readers who tried and left with nothing. Its
  "unfindable" failure mode is this skill's entire subject; run this one to
  resolve those rows.
- `docs-navigation-linking` — when readers cannot find pages by browsing rather
  than by searching.
- `docs-style-tone` — the general register and vocabulary rules that stop new
  pages from being born with the titles this skill has to repair.
