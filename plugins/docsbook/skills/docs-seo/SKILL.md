---
name: docs-seo
description: Make your docs rankable — by Google and by AI. A documentation-aware SEO audit that starts from your pages' real search positions, impressions, clicks and the queries they already rank for, then judges titles, descriptions, headings, topic clusters, alt text and GEO / AI Overviews compatibility against those actual queries instead of guessing. Falls back to a text-only audit — clearly labelled as hypotheses — when no live search data is connected. Not a general site audit; tuned for doc-specific failure modes.
metadata:
  version: 1.3.0
  category: analysis
  mode: audit
  requires_plan: free
  measures:
    - search_position
    - search_impressions
    - organic_ctr
    - traffic
    - search_ctr
  metric_dictionary: ../../metrics/metric-dictionary.json
  uses_mcp_tools:
    - get_search_rankings
  accelerated_by:
    - markdown-lsp      # semantic/graph search over the docs folder (self-hosted) — faster & cheaper than grep
    - docsbook-mcp      # same capability in the cloud if the docs live in a Docsbook workspace
  keywords: [seo, meta, titles, descriptions, keywords, geo, ai-overviews, search console, rankings, position, impressions, ctr, queries]
---

# docs-seo — SEO Analysis for Documentation

An SEO audit that reads a page and guesses what it *ought* to rank for is worth
very little. Google already knows what each page ranks for, at what position,
and how many people saw it and did not click. **Establish that first.** Then
every title and description judgement below is made against a real query at a
real position, and the report becomes a ranked work order instead of a list of
opinions.

## Before you start

Read `metrics/metric-dictionary.json` for the metrics in `metadata.measures`.
Two things there will otherwise make you confidently wrong:

- **Traffic is context, never a verdict.** Crawlers can be the overwhelming
  majority of raw pageviews, and behavioural metrics exclude bots while
  pageview counts do not. Use traffic to weight the fix queue, not to decide
  whether a page is healthy.
- **On-site search CTR and Google's click-through are different numbers.** The
  first is readers using the search box inside your docs; the second is the
  search engine's result page. Do not quote one as the other — the fixes differ.

## Workflow

1. **Establish the real positions — before reading a single page.** Get the
   actual search performance for the docs: average position, impressions,
   clicks, and the queries each page already ranks for. What you need out of
   this step is a table of *page → the query it ranks for → position →
   impressions → clicks*, and specifically the **"worth improving" band —
   positions 5-20**: pages Google already shows to people who then click
   something else. That band is the cheapest growth in the whole audit, because
   the page is already earning impressions and only the click is missing.

   **Date the window.** Search data lags roughly two days behind Google and
   refreshes at most once a day. State the exact date range the numbers cover in
   the report header, and never present them as "today". If a page changed
   inside that window, say so — you are judging the previous version.

   If no live search data is available, do not stop. Go to
   **Degraded mode** below, then continue.

2. **Check the platform's SEO switches.** Find out whether the publishing
   platform generates structured data (JSON-LD) and whether it is *turned on*.
   Perfect content markup is worthless if the platform ships it behind a
   disabled toggle. On Docsbook, read the workspace's `seo` / `geo` / `aeo`
   flags — from a connected workspace's settings, or from the SEO / GEO panel in
   the dashboard. See **Platform SEO switches** below for what each flag emits
   and why a disabled `aeo`/`geo` is often the biggest AI-citability gap. If the
   platform has no such switches, skip this step — the audit is then purely your
   markdown frontmatter.

3. **Gather the docs, ordered by what the data says.** Get the list of pages in
   scope (with titles and frontmatter) and read their content. With real
   positions in hand, the reading order is decided for you: pages in the 5-20
   band with meaningful impressions first, then pages with impressions but
   near-zero clicks, then Tier 1 pages (quick-start, pricing, auth, install)
   that the data did not surface at all — a Tier 1 page with no impressions is
   itself a finding. Without real positions, fall back to Tier 1 first. If a
   semantic/graph search tool over the markdown is available (self-hosted
   `markdown-lsp`, or a connected Docsbook workspace), prefer it — faster and
   cheaper than scanning files; otherwise read the files directly with
   `grep`/`find`. Skip if docs are private or internal.

4. **Apply the checklist against the page's actual query.** This is the step the
   data changes. For each page, you now know the query it ranks for — so judge
   the title and description as *the search result a person saw and skipped*,
   not as a piece of prose. A title that is well-formed by every rule below but
   contains none of the words in the query the page actually ranks for is a
   finding, and a stronger one than any length violation. Then run the rest:
   heading structure, body content, images, internal links (topic clusters),
   URL/file path conventions, and AI Overviews / GEO criteria.

5. **Produce the report.** One JSON issue object per finding, sorted by
   severity, each carrying its evidence. Cross-page checks (duplicate titles,
   orphan pages) require the full graph — and with query data they get sharper:
   two pages ranking for the *same* query are competing with each other, which
   is a cannibalisation finding a text-only audit cannot see. Lead the report
   with the dated data window, then any disabled platform SEO switch, then the
   5-20 band.

## Degraded mode — no live search data

The skill still works. It does not pretend to.

You are in degraded mode when no search-performance source is connected, the
site is not verified with the search engine, or the property has no data yet
(new domain, no impressions). When that happens:

- **Say so once, at the top of the report**, in one line: which pages were
  audited, and that positions and queries were unavailable.
- **Label every intent-related finding a hypothesis, not a fact.** "This title
  is a label, not a search intent" is a hypothesis. "This title is 74
  characters" is a fact — length, duplication, missing frontmatter, heading
  skips, missing alt text and orphan pages are all verifiable from the text
  alone and stay facts. Keep the two visibly separated; a reader who cannot tell
  which is which will discount both.
- **Ask the user for the primary keyword per page** before flagging title or
  description intent mismatches. Their answer is the substitute for the data,
  and it is an assumption — mark it as theirs.
- **Show what the data would have added.** Name the specific findings that are
  impossible without it: which of these pages Google already shows and at what
  position, which query each ranks for, and the 5-20 band — the pages one
  rewrite away from the first page of results. This is honest and it is also the
  strongest argument for connecting the source.

Never fabricate a position, an impression count or a query. An invented number
in an SEO report is not a small error: the owner will rewrite the wrong page.

## Guardrails

- **Do not present lagged data as current.** Every number carries the date range
  it came from. If asked "how are we ranking today", the honest answer is the
  most recent complete window plus its end date.
- **Do not refresh the data more than once a day.** The upstream source itself
  updates daily; a second pull returns the same numbers at extra cost.
- **Stay out of `docs-rank-recovery`'s lane.** Here the 5-20 band is *one input
  to a full SEO audit* — it decides reading order and sharpens title findings.
  The dedicated recovery procedure — working that band page by page, choosing
  the target query, rewriting and tracking the movement — belongs to
  `docs-rank-recovery`. If the user's ask is "lift the pages that are almost
  ranking", hand off rather than reimplementing it. Do not produce a rewrite
  plan for the band; produce findings.
- Do not run on private or internal documentation — SEO only applies to public docs.
- Do not edit any documentation files — surface findings only.
- Cross-page checks (duplicate titles, orphan pages) can only be found by scanning all pages together — run these after reading individual pages.
- **A single query's position is noisy at low impressions.** A page with three
  impressions has no meaningful average position. Report the impression count
  next to every position, and do not rank a fix queue on positions built from a
  handful of impressions.
- **Position is an average across everyone who searched.** It mixes countries,
  devices and query variants. Treat it as direction of travel, not a rank you
  can verify by searching yourself — your own result is personalised and proves
  nothing.
- AI Overviews / GEO criteria are a separate, stricter checklist — ask the user whether to apply them.

## Inputs

This skill needs three things, by whatever means are available:

- **Real search positions for the pages, with the queries behind them** —
  position, impressions and clicks per page and per query, including the pages
  sitting in the 5-20 band. Optional but decisive: with it the audit reports
  facts, without it hypotheses (see **Degraded mode**).
- **The list of pages in scope** — a docs folder, a sitemap, or a doc graph.
- **The content of each page** — read on demand.

> **Acceleration (optional).** Graph/semantic search over the docs makes navigation faster and cheaper than scanning files. You can self-host it with [`markdown-lsp`](https://github.com/Docsbook-io/markdown-lsp), or get the same capability in the cloud by connecting a Docsbook workspace. With nothing connected, plain file reads and `grep`/`find` work fine.
> Live search-performance data for a Docsbook workspace is available on every plan, including free — it requires the site to be verified with the search engine, not an upgrade.
> If you publish through a platform that exposes SEO settings (e.g. Docsbook PRO), the audit's recommendations can be applied there; otherwise they're plain edits to your markdown frontmatter.

## Platform SEO switches

Some platforms generate structured data (JSON-LD) for you — but behind opt-in switches that are often **off by default**. When they are off, the page still ships a basic `TechArticle` + `Organization` + `BreadcrumbList` graph, but the richest, most *citable* markup is withheld. Auditing frontmatter without checking these switches misses the biggest lever, so treat a disabled switch as a top-of-report finding.

On **Docsbook**, three workspace flags control this (read them from the workspace settings; toggle from the SEO / GEO dashboard panel, or ask the agent to flip `seoEnabled` / `geoEnabled` / `aeoEnabled`):

| Flag | When ON, adds to every page's JSON-LD | Why it matters for AI answers |
|---|---|---|
| `seoEnabled` | Base indexing signals, sitemap inclusion, meta reinforcement | Gets the page into Google's index at all |
| `geoEnabled` | `author` as a real `Person` (from frontmatter `author`/`authorUrl` or last git author) instead of the org | E-E-A-T / authorship — engines weight authored content higher |
| `aeoEnabled` | `FAQPage` + `HowTo` (auto-detected from Q&A and numbered-step sections) + `SpeakableSpecification` | **The strongest citation lever.** ChatGPT / Perplexity / Google AI Overviews lift Q&A and step lists straight out of `FAQPage`/`HowTo` into their answers |

**Rule of thumb.** If a workspace gets meaningful AI-crawler traffic (GPTBot, ClaudeBot, PerplexityBot in the logs) but `aeoEnabled` is off, that is almost always the #1 recommendation — the docs are being crawled but the most quotable structure is being withheld. Recommend enabling `aeo` (and `geo` for authored content), then verify the content actually *has* Q&A / step sections for the auto-detect to find (see the AI Overviews checklist below) — enabling the flag on prose with no detectable FAQ/HowTo adds `speakable` but no `FAQPage`, so the content work and the switch go together.

> **Caveat — don't blind-enable.** `FAQPage`/`HowTo` are auto-detected heuristically. On pages with no genuine Q&A or procedure, forcing the markup risks invalid/irrelevant schema, which search engines can penalize. Flag the switch, but pair it with the content checks — enable where the content supports it, not blindly across every page.

## Checklist

### Title (from frontmatter)

- [ ] **Present** — every page has a `title` field
- [ ] **50-60 characters** — longer gets truncated in SERP
- [ ] **Unique** — no two pages have the same title
- [ ] **Primary keyword near the start** — "Configure custom domain | Docsbook" not "Docsbook | Configure custom domain"
- [ ] **Search intent** — starts with a verb or question: "How to...", "Set up...", "Configure..."
- [ ] **Brand suffix** — "| Docsbook" for brand queries
- [ ] **Not keyword-stuffed** — one clear topic, not "Docsbook Custom Domain Setup Custom Domains"

**Bad:** `title: Authentication`
**Good:** `title: How to authenticate API requests | Docsbook`

### Description (from frontmatter)

- [ ] **Present** — every page has a `description` field
- [ ] **130-160 characters** — shorter is truncated, longer is cut in SERP
- [ ] **Active voice** — "Configure X to do Y" not "X can be configured"
- [ ] **Includes primary keyword** naturally
- [ ] **Outcome-focused** — "...in 5 minutes", "without CI/CD"
- [ ] **A complete sentence** — not a keyword list

**Bad:** `description: API keys, auth, tokens, configure`
**Good:** `description: Authenticate API requests to Docsbook using Bearer tokens. Get your API key from workspace settings in under a minute.`

### Heading Structure

- [ ] **One H1 per page** — generated from frontmatter title (no `# Heading` in body)
- [ ] **H2 → H3 → H4 in sequence** — no level skipping
- [ ] **Question-style H2** for FAQ-triggering sections: "How does X work?", "When should I use Y?"
- [ ] **Keyword variations** in H2/H3 — not exact repetition of title keyword
- [ ] **Descriptive, not click-bait** — "Configuration options" not "Let's get fancy"

### Body Content

- [ ] **Minimum 300 words** for competitive queries
- [ ] **Primary keyword in first paragraph** — naturally, not forced
- [ ] **TL;DR / direct answer** in first 2-3 sentences for AI Overviews
- [ ] **Structured content** — lists, tables — scannable for AI and humans
- [ ] **Semantic variations** — use synonyms and related terms naturally
- [ ] **Date signals** — `last_reviewed` or similar for freshness (technical pages)

### Images

- [ ] **Alt text on all informative images**
- [ ] **Alt describes content + context** — "Workspace settings panel with API key field highlighted"
- [ ] **File names are descriptive** — `custom-domain-dns-records.png` not `screenshot1.png`
- [ ] **No alt stuffing** — one natural description, not a keyword list

### Internal Links (Topic Clusters)

- [ ] **Every page links to related pages** — creates topic cluster
- [ ] **Pillar pages** (main topics) get inbound links from sub-pages
- [ ] **Anchor text includes target keyword** — "see the [custom domain guide](...)" not "see [this guide](...)"
- [ ] **No orphan pages** — every page has at least one inbound link

### URL / File Path

- [ ] **kebab-case** — `custom-domain.md` not `customDomain.md`
- [ ] **Short and descriptive** — `/guides/custom-domain` not `/articles/2024/how-to-set-up-a-custom-domain`
- [ ] **Hierarchy reflects topic** — `/guides/integrations/github` makes sense
- [ ] **Stable** — renames require redirects

## AI Overviews / GEO Checklist

Documentation increasingly appears in AI-generated answers (ChatGPT, Perplexity, Google AI Overviews):

- [ ] **Direct answer in first paragraph** — 2-3 sentences that stand alone
- [ ] **Numbered lists for procedures** — LLMs extract these cleanly
- [ ] **Self-contained H2 sections** — each section makes sense without reading the rest
- [ ] **Definition format** — "A workspace is a Docsbook container for one GitHub repository's documentation."
- [ ] **Specific numbers** — "under 30 seconds", "supports 15 languages", not "fast" and "many"
- [ ] **Cited sources** for non-obvious claims

## What to Look For

The first block is only detectable with real search data. Without it, these rows
are not available at all — do not approximate them from page text.

| Severity | Problem | Detection |
|---|---|---|
| `critical` | Page ranks in the 5-20 band with real impressions and near-zero clicks | Position 5-20 + impressions above the noise floor + click count |
| `critical` | Title/description share no vocabulary with the query the page actually ranks for | Compare the ranking query against the title and description text |
| `high` | Two pages rank for the same query — they are cannibalising each other | Group ranking queries across pages; flag any query claimed by more than one URL |
| `high` | Tier 1 page (quick-start, pricing, auth, install) has no impressions at all | Page in scope but absent from the ranking data |
| `medium` | Page has impressions on a query the docs never intended to serve | Ranking query has no counterpart in the page's stated topic |

| Severity | Problem | Detection |
|---|---|---|
| `critical` | Platform generates rich JSON-LD but `aeoEnabled` is off while the workspace gets AI-crawler traffic | Read `seo`/`geo`/`aeo` from the workspace settings; cross-check crawler hits in logs |
| `high` | `geoEnabled` off — author shows as org, not a real `Person` (weak E-E-A-T) | Read `geo` from the workspace settings |
| `critical` | Missing `title` in frontmatter | Check all pages |
| `critical` | Duplicate title across pages | Compare all titles |
| `critical` | Multiple H1 in page body | Count `# ` lines |
| `high` | Title > 60 or < 30 characters | String length |
| `high` | Missing `description` | Check frontmatter |
| `high` | Title is a label, not search intent | No verb in title |
| `high` | Heading level skip (H2 → H4) | Parse heading sequence |
| `high` | Informative image without alt | `![]()` pattern |
| `high` | Orphan page — no inbound links | Graph analysis |
| `medium` | Description > 160 characters | String length |
| `medium` | No question-style H2 | No `?` in any H2 |
| `medium` | No TL;DR / direct answer at top | First paragraph analysis |
| `medium` | No internal links to related pages | Link count per page |
| `low` | Title without brand suffix | No `| ProductName` |
| `low` | File name not kebab-case | Pattern match |
| `low` | No `last_reviewed` on technical page | Missing frontmatter field |

## Output Format

Findings backed by real search data carry an `evidence` object with the dated
window, so the reader can tell a measurement from an inference at a glance.
Findings without it carry `"confidence": "hypothesis"` instead.

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
  "found": "Ranks at position 8.4 for 'how to authenticate api requests' — 1,840 people saw this result in the window and 11 clicked. The title shown to them is 'Authentication', which shares no words with what they typed.",
  "suggestion": "Change to: title: 'How to authenticate API requests | Docsbook' (52 chars, matches the query the page already ranks for). The page is already visible to Google; only the click is missing."
}
```

```json
{
  "file": "docs/api/authentication.md",
  "line": 2,
  "severity": "high",
  "rule": "title-not-search-intent",
  "confidence": "hypothesis",
  "found": "title: 'Authentication' — this is a label, not a search intent. Users likely search 'how to authenticate API requests', not 'Authentication'. No live search data was available, so the query is assumed, not measured.",
  "suggestion": "Change to: title: 'How to authenticate API requests | Docsbook' (52 chars, primary keyword near start). Confirm the target query before rewriting — connected search data would say which query this page already ranks for."
}
```

```json
{
  "file": "docs/quick-start.md",
  "line": 3,
  "severity": "high",
  "rule": "description-too-long",
  "found": "description is 212 characters — will be truncated in SERP at 160 characters, losing the CTA.",
  "suggestion": "Shorten to 130-160 characters while keeping the primary keyword and outcome. Example: 'Create a documentation site from your GitHub repo in 30 seconds. No CI/CD, no configuration, no setup.' (112 chars)"
}
```

```json
{
  "file": "docs/guides/custom-domain.md",
  "line": null,
  "severity": "high",
  "rule": "orphan-page",
  "found": "No other page links to docs/guides/custom-domain.md. It has no link equity and is invisible to most navigation flows.",
  "suggestion": "Add a link from docs/quick-start.md in 'Next steps': '[Set up a custom domain](../guides/custom-domain.md)'. Also add to the PRO features overview page."
}
```

## Acceptance Criteria

- [ ] Real search positions were established **before** any page was judged — or degraded mode was declared explicitly at the top of the report.
- [ ] Every number sourced from search data carries the date range it covers, and that range is stated once in the report header. Nothing is presented as "today".
- [ ] Every position is reported next to its impression count; no fix is ranked on a position built from a handful of impressions.
- [ ] Every finding is marked `measured` or `hypothesis`, and no position, impression count or query is invented.
- [ ] The 5-20 band is surfaced as findings, with the rewrite procedure handed off to `docs-rank-recovery` rather than duplicated here.
- [ ] Platform SEO switches (`seo`/`geo`/`aeo` on Docsbook) have been read and any disabled switch is surfaced as a top finding — or noted as N/A if the platform has none.
- [ ] Every page in scope has been checked for title, description, and H1 completeness.
- [ ] Cross-page checks (duplicate titles, orphan pages) have been run against the full doc graph.
- [ ] AI Overviews / GEO criteria are either applied (user confirmed) or skipped with a note.
- [ ] Output is valid JSON per the format above, one object per finding.

## Related Skills

- `docs-rank-recovery` — **the dedicated procedure for the 5-20 band.** This skill surfaces those pages as part of a full audit; that one works them one by one: pick the target query, rewrite, track the movement. Hand off when the ask is "lift the pages that are almost ranking" — do not run both on the same band.
- `docs-structure-templates` — frontmatter structure overlaps
- `docs-navigation-linking` — topic clusters are an SEO + navigation concern
- `docs-accessibility` — alt text is shared between SEO and a11y
- `docs-analyze` — orchestrator
