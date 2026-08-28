# Metrics — how to read the numbers without being confidently wrong

Read `metrics/metric-dictionary.json` for every id in the skill's `measures` list before quoting a single number. The confounders there are not decoration. What follows is the operating discipline on top of them.

## One window, stated once

Pick one period — 24 hours, 7 days, 30 days — and use it for every signal in the run. 7 days is the default for a weekly plan; 24 hours is for checking a release and is almost always too thin to rank on. Mixing windows across sources invents trends that were never there.

Print the window and the total volume behind it as the report's first line.

## Search data lags, and the lag is part of the number

Search-performance data trails roughly two days behind and refreshes at most once a day. Whatever you are reading describes last week, not today.

- Date every window *and* its as-of date: "positions for 4–31 July, as of 30 July".
- Never answer "how are we ranking today" with anything but the most recent complete window plus its end date.
- Do not force a refresh more than once a day. The upstream source updates daily; a second pull returns the same numbers at extra cost.
- If a page changed inside the window, say so — you are judging the previous version.

## Sample floors

| Signal | Floor | Below it |
|---|---|---|
| Any behavioural rate | ~30 visits | Report the absolute count; the percentage is withheld and must never be invented |
| A page's average position | Meaningful impressions | Report the impression count next to every position; never rank a queue on a position built from a handful |
| A rejected-search cluster | 2 separate visits | An observation, not a finding — do not rewrite anything for it |
| A buying-stage characterisation | 5 conversations | Quote the raw text as anecdote and say the volume does not support a conclusion |
| A blocker pattern | 3 independent conversations | As above |
| A competitor mention | 2 mentions | Log it; do not strategise against it |
| A CTA click-through | ~200 impressions | Statistical noise |
| A dwell percentile | ~30 pageviews | Noisy — exclude and report the exclusion |
| A route or journey pattern | ~50 sessions | Not reportable |
| A question cluster | 5 questions | Too small; drop it and say so |

State the floor you used, and list what it excluded as a count. Pages dropped silently read as pages that were fine.

## The confounders that bite hardest

- **Traffic is context, never a verdict.** Crawlers can be the overwhelming majority of raw pageviews, and behavioural metrics exclude bots while pageview counts do not. Use traffic to weight a queue, never to decide whether a page is healthy, and never put a pageview total next to a behavioural rate as if they reconcile.
- **A high exit rate is not a problem on its own.** A page readers leave from *after succeeding* is a terminal success page. Recommending its rewrite makes the docs worse. Always read exits next to the outcome mix, and never re-apply an exit penalty that a health score already exempted.
- **One health score, two different jobs.** A composite score folds "readers gave up here" and "readers stayed and disliked it" into one number. Two pages at 45 need opposite work. Open the components and name the dominant signal, or flag the item as undecomposable and make its action a diagnostic rather than a rewrite.
- **On-site search click-through and the search engine's click-through are different numbers.** One is readers using the search box inside the docs; the other is the result page of a search engine. The fixes differ. Never quote one as the other.
- **Position is an average across everyone who searched**, mixing countries, devices and query variants. An average of 7 can be a steady 7, or a 3 and a 15 that need opposite fixes. Break the average down by query before recommending anything. And never verify a position by searching yourself — your own result is personalised and proves nothing.
- **Impressions are counted per query**, so one page appears many times. Sum per page before comparing pages, or a page ranking for twenty long-tail variants looks smaller than a page ranking for one. Never present impressions as an audience size.
- **A non-click is not automatically a failure.** A reader who got the answer out of the snippet leaves happy. For short factual queries — a default value, a port number, a limit — check whether the snippet already answered before proposing a title rewrite.
- **Zero results and zero clicks are opposite diagnoses.** Nothing returned means content is missing. Results returned and refused means content exists and does not look like the answer. Conflating them is the most expensive mistake available here.
- **Visitors are hashed identifiers.** Shared networks merge readers, mobile networks split them. Report direction of travel, never headcounts.
- **A buying stage is a classification, not a fact.** It is inferred from wording; nobody's billing record was consulted. Report it as what the reader was asking about — never as confirmed intent, never as pipeline.
- **Stage mix reflects who visits.** Docs linked from an in-app help menu read as support-heavy however well they sell. Establish where traffic enters before blaming the content.
- **An absent signal is not a clean bill.** No pricing conversations in a product that charges money means readers stopped asking, not that pricing is clear.

## Degrading honestly

Say the availability gap **once, at the top**, in a sentence a buyer can act on. Never sprinkle upgrade prompts through the report.

| What you have | What you can produce | What to say |
|---|---|---|
| Search performance + per-page health + a ranked fix digest | The full queue: pages triaged by behaviour, cross-checked against concrete fixes that already carry impact estimates | Nothing missing. Name the period. |
| Per-page health only | A ranked page queue with **your own** impact reasoning: score × traffic, components separated, effort estimated by hand | "The impact estimates here are mine. The workspace's own ranked digest — which names specific unanswered questions and zero-result searches with impact already computed — is not in this plan. It would replace my estimates with measured ones and add the *what to write* items this queue cannot see." |
| Search performance only, no behavioural data | A ranked rewrite queue for the striking-distance band, and a text-quality audit | Name what reader behaviour would have added: which pages people give up on, and whether the fix is the page or its title. |
| Neither | **Do not fabricate a queue.** A text-quality audit over the docs, unranked, with every intent-related finding labelled a hypothesis | "Ranking by what readers actually did needs behavioural data this workspace does not collect. Here is what you would get with it: a five-line weekly queue ordered by readers affected, each naming the fix and its expected effect. Here is what I can do today: a text-quality audit, unranked." |

In the bottom tier, keep facts and hypotheses visibly separated. "This title is 74 characters" is a fact. "This title is a label, not a search intent" is a hypothesis. A reader who cannot tell which is which discounts both. Ask the user for the primary keyword per page and mark their answer as theirs.

Never fabricate a position, an impression count or a query to fill a gap.

## What the answer-engine layers actually do

Some platforms generate structured data behind opt-in switches that default to off. When they are off, a page still ships basic markup, but the most citable structure is withheld — and auditing frontmatter without checking the switches misses the biggest lever available.

| Layer | What it adds when on | Why it matters |
|---|---|---|
| Indexing | Base indexing signals, sitemap inclusion, meta reinforcement | Gets the page into the index at all |
| Authorship | A real person as author instead of the organisation | Engines weight authored content higher |
| Answer markup | Q&A and numbered procedures promoted into `FAQPage` / `HowTo` / speakable markup | The strongest citation lever — assistants and AI search results lift these straight into answers |

Rule of thumb: a site getting meaningful assistant-crawler traffic with the answer layer off is almost always the top finding of the whole run. But the switch and the content go together — enabling it on prose with no genuine Q&A or procedure produces nothing at best and invalid markup at worst. Flag the switch *and* check the content supports it.
