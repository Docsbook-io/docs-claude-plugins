---
name: docs-rank-recovery
description: Turns the pages that already rank on Google page one-to-two — visible, getting impressions, not getting the click — into a ranked queue of rewrites. For each page it establishes which query Google actually ranks it for, decides whether that query matches what the page is really about, and separates "wrong intent, no rewrite will save it" from "right intent, weak pitch" — the second is a title and opening-paragraph fix and is the cheapest traffic a docs site can buy. Use when asked "where is the easy traffic", "which pages are close to ranking", "we get impressions but no clicks", "what should I rewrite for SEO first", or for a monthly search-position review. Rewrites existing pages; it does not create new ones.
metadata:
  version: 1.1.0
  category: growth
  mode: refactor
  measures:
    - search_position
    - search_impressions
    - organic_ctr
    - traffic
  metric_dictionary: ../../metrics/metric-dictionary.json
  requires_plan: free
  accelerated_by:
    - docsbook-mcp
    - markdown-lsp
  uses_mcp_tools:
    - get_search_rankings
    - get_doc_outline
    - search_docs
  keywords: [search rankings, google position, impressions, striking distance, page two, click-through, rank recovery, rewrite titles, search console, easy traffic, low hanging fruit]
---

# docs-rank-recovery

Most SEO advice is about pages that do not rank. This is about the ones that
**already do** — the pages sitting at position 5 to 20, collecting impressions
and almost no clicks.

Those pages have already won the expensive part. Google has crawled them,
indexed them, judged them relevant enough to show, and is putting them in front
of real people who typed a real query. What is missing is the last, cheap step:
looking like the answer in a result list. Moving one page from position 9 to
position 4 is a title and an opening paragraph. Getting a brand-new page to
position 9 is months.

**Mode: refactor.** This skill rewrites pages that exist, preserving their
meaning and their URL. It does not create new pages — when the honest verdict is
"this page is not about that query", the output is a note for whoever plans new
content, not a new page written here. It also never invents a position it did
not read.

## When to run

- Monthly, as the standing search review — this set changes slowly and rewards
  patience more than frequency.
- After a docs restructure, to find pages whose ranking survived a URL or title
  change but whose click-through did not.
- When someone says "traffic is flat but we keep publishing" — the answer is
  usually sitting in this set, not in the next new page.
- **Not** as a general SEO audit. If nobody has ever checked titles, headings,
  structured data or alt text on these docs, run the broad audit first (see
  Related skills) and come back here once the basics are in place.

## Before you start

Real search-position data is available for docs published on a verified domain
and has hard limits you must respect. Getting these wrong produces advice that
is confidently, expensively wrong.

- **The data lags roughly two days, and the upstream source refreshes once a
  day.** Whatever you are looking at describes last week, not today. Date every
  window you report ("positions for 4–31 July, as of 30 July") and never present
  it as live. Forcing a refresh more than once a day buys nothing — the source
  itself only updates daily.
- **Position is averaged over impressions, and the average hides the shape.**
  An average of 7 can be a page steadily at 7, or a page at 3 for one query and
  15 for another. These need opposite fixes: the steady 7 needs a better pitch,
  the split needs the page to pick a side. Always break the average down by
  query before recommending anything.
- **A handful of impressions is noise, not a signal.** A page with 6 impressions
  at position 6 tells you nothing — one person's search, possibly a colleague's.
  Set a volume floor before you rank anything, state the floor in the report,
  and say "not enough data" for everything under it rather than padding the
  queue.
- **Impressions are counted per query, so one page appears many times.** Sum
  them per page before comparing pages, or a page ranking for twenty long-tail
  variants will look smaller than a page ranking for one.
- **Position 5–20 is a heuristic, not a law.** It is where the click curve is
  steepest and rewrites pay off fastest. A page at 21–30 with heavy impressions
  can be a better bet than a page at 6 with three. Use the potential score in
  step 4, not the band alone.
- **Ranking for a query you did not want is still information.** It usually
  means the page's actual centre of gravity differs from what its author
  intended — worth knowing even when you decide to do nothing.

Read `metrics/metric-dictionary.json` for `traffic` before weighting anything by
volume: raw pageviews include crawlers, so never reconcile impression counts
against pageview counts as if they measure the same people.

## Workflow

1. **Pull the "already visible, not yet winning" set, and date it.**
   Get the pages that rank in the 5–20 band with their average position,
   impressions, clicks and the queries behind them, for an explicit window.
   Write the window and the data's as-of date at the top of the report before
   anything else. If the set is empty or the volume floor filters everything
   out, say so and stop — see *No data*.

2. **For each page, establish the query it actually ranks for.**
   Take the queries carrying the most impressions for that page, not the one the
   author had in mind. Then read the page itself — its outline and its opening
   — and answer one question in plain words: *is this page about that query?*

   Quote the query verbatim. A query in the reader's own words is the single
   most persuasive artefact you can hand an author, and it is checkable without
   rerunning any analysis.

3. **Split the set into two piles. This is the step that saves the money.**

   - **Wrong intent.** The page ranks for a query it does not answer. Someone
     searching "pricing per seat" landing on an architecture overview will
     bounce no matter how good the title is. Rewriting here is wasted effort:
     the honest recommendation is that a different page should own that query,
     and this one should stop competing for it. Record it as a content-gap note
     and move on — do not queue a rewrite.

   - **Right intent, weak pitch.** The page genuinely answers the query, but the
     result listing does not say so: the title is an internal label rather than
     the reader's phrasing, the description is missing or truncated, or the first
     paragraph makes the reader read three sentences before confirming they are
     in the right place. This is the queue. It is cheap, low-risk and reversible.

   When a page's queries split across both piles, that is the hidden-average
   case from *Before you start*: the page is trying to be two pages. Say so
   explicitly instead of averaging it into one recommendation.

4. **Rank the queue by potential, not by position.**
   The prize on a page is roughly *impressions × the distance still to close to
   the top three* — a page at 15 with thousands of impressions is worth more
   than a page at 6 with forty, even though the second looks closer. Score every
   candidate the same way, show the arithmetic, and sort by it. Where two
   candidates score alike, prefer the one whose fix is smaller.

5. **Write the fix, page by page.**
   For each entry in the queue: the URL, the window and as-of date, current
   average position, impressions, clicks, the verbatim query, the verdict from
   step 3, and one concrete rewrite — a proposed title, a proposed description,
   and the one-sentence direct answer the first paragraph should open with. Keep
   the page's meaning and its URL; a rewrite that changes what the page is about
   forfeits the ranking it was supposed to protect.

6. **Record the baseline so the next run can judge this one.**
   Note each page's position and impressions at the time of the rewrite. Search
   effects take weeks to appear, and without a written baseline the next run
   cannot tell a real improvement from a seasonal one.

## What this skill catches

| Pattern | What the data looks like | The finding |
|---|---|---|
| **Label title on a page at the edge of page one** | Position 6–9, healthy impressions, clicks far below what that position should yield | The title is the product's vocabulary, not the reader's — "Authentication" against a query of "how to authenticate api requests". Rewrite the title to the query's phrasing |
| **Split average** | Average position 7, but the query breakdown shows 3 and 15 | Not one problem. The page is answering two questions at once; decide which one it owns and let the other go to a page that wants it |
| **Wrong intent, high impressions** | Strong impressions for a query the page does not answer | Do not rewrite. Google has found demand you have no page for — hand it to content planning as a gap |
| **Buried answer** | Position 5–10, reasonable title, clicks still low | The description is missing or auto-truncated from prose, so the result listing shows nothing worth clicking. Write a real description and open with a direct answer |
| **Long-tail page that looks small** | Twenty queries at 3–15 impressions each, position ~12 | Summed, this is a serious page. Per-query it looks like noise — the classic miss of anyone who forgets to aggregate before ranking |
| **Nearly there, ignored** | Position 4–5, high impressions | The most under-rated row in the set. The click curve is steepest right here; a description rewrite alone often moves it |
| **Thin row masquerading as a win** | Position 3, 5 impressions | Not enough data. Report the absolute number and refuse to rank it |
| **Cannibalisation** | Two URLs ranking for the same query, both mid-band | Neither will win while they split the signal. Flag it; the merge decision belongs to a human, not to this skill |

## Guardrails

- **Never state a position you did not read.** No estimating from page content,
  no inferring from traffic, no "probably around page two". If there is no
  position data, say there is none.
- **Always date the window and the as-of date.** Undated search data is the
  fastest way to have a rewrite blamed for a change that happened before it.
- **Report absolute impressions next to every rate or score.** "Position 8,
  1,240 impressions, 11 clicks" is auditable; a bare potential score is not.
- **Do not create pages.** This skill is refactor-mode. Wrong-intent findings
  leave as notes for content planning, never as new pages written here.
- **Do not change a page's URL or its subject.** Both forfeit the ranking the
  page already holds — the one asset this whole exercise is built on.
- **Stay out of the broad audit's lane.** This skill takes exactly one input
  signal — real search positions — and produces one output: a ranked rewrite
  queue for pages in the striking-distance band. Structured-data switches,
  heading hierarchy, alt text, orphan pages and site-wide title conventions
  belong to the broad SEO audit. If a check applies to a page regardless of
  where it ranks, it is not this skill's job.
- **One page can carry one recommendation per run.** If a page needs a title
  rewrite and a restructure and a merge, ship the title and re-measure. Bundled
  changes make the next run unable to say which one worked.
- **Do not promise a position.** You can promise a better pitch to the people
  already being shown the page. Ranking movement is Google's decision, and
  saying otherwise sets up the author to be blamed for a competitor's release.

## No data

If the docs are not published on a verified domain, or search-position data is
not connected, **say so plainly in the first line and stop**. Do not
substitute internal analytics, do not estimate from page content, and do not
produce a queue of guesses dressed as findings.

Then show what the skill would produce with the data connected — for the docs
in front of you, name two or three pages that would be the likeliest candidates
and what would be checked about them — and give the single next action:
verify the domain with the search engine's own console and connect it, then
re-run once a window of data has accumulated. The data lags a couple of days
and backfills gradually, so the first useful run is not the same day.

## Acceptance criteria

- [ ] The report opens with the exact date window and the data's as-of date.
- [ ] The volume floor is stated, and every page under it is reported as "not
      enough data" with its absolute impression count — never ranked, never
      given a percentage.
- [ ] Every page in the queue carries at least one verbatim query.
- [ ] Every page is labelled either *wrong intent* or *right intent, weak
      pitch*, and pages whose queries split across both are called out as split
      rather than averaged.
- [ ] The queue is sorted by impressions × distance to the top three, with the
      arithmetic shown.
- [ ] Every queued page has a concrete proposed title, description, and opening
      sentence — not "improve the title".
- [ ] No page was given a new URL, a new subject, or a new sibling page.
- [ ] Baseline position and impressions are recorded per page for the next run.
- [ ] With no position data available, the report says so in its first line and
      contains no invented positions.

## Arguments

All optional; ask only when the answer changes the output.

- **Scope** — a path prefix or a set of pages. Defaults to the whole verified
  site. Narrowing helps when one section is the current priority.
- **Window** — the reporting period. Defaults to the last 28 days, which is long
  enough to absorb weekday effects and short enough to reflect the current
  content.
- **Position band** — defaults to 5–20. Widen to 5–30 on a site with few
  page-one rankings; narrow to 5–10 when there is only appetite for a handful
  of rewrites.
- **Impression floor** — the minimum impressions a page needs to enter the
  queue. Set it deliberately; if the caller has no view, pick one, state it,
  and show what it excluded.
- **Freshness** — whether to pull fresh data or accept the cached window. Fresh
  is worth it at most once a day; otherwise the cached window is the same data.

## Related skills

- `docs-seo` — the broad, page-level SEO audit: titles, descriptions, headings,
  structured data, alt text, internal linking. **Run it first if the basics have
  never been checked.** It judges a page against best practice; this skill
  judges a page against its own real ranking and only touches the
  striking-distance band. Overlapping fixes should be made once, in the queue
  this skill produces, so the effect is measurable.
- `docs-ai-retrieval` — the same opening-paragraph and direct-answer work, aimed
  at being quoted by AI assistants rather than clicked in a result list. The
  rewrites reinforce each other.
- `docs-sales-conversion` — for pages where the click is not the goal and the
  signup is.
- `docs-gap-finder` — the right destination for *wrong intent* findings: demand
  Google found that no page of yours answers.
