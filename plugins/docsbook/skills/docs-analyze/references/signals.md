# Behavioural detectors — what readers actually did

These read reader behaviour rather than page text. Each answers a different question; pick the ones that can explain the failure mode, not all of them.

Every one of them reports absolute counts beside every rate, respects the sample floors in `metrics.md`, and quotes the reader verbatim wherever a reader's own words exist.

---

## Dead ends — who left with nothing

A dead end is a visit where the reader demonstrably tried — searched, asked the assistant, or opened three or more pages — and produced no sign of getting what they came for. It is the closest thing to direct evidence that documentation is failing, and unlike bounce rate it never counts someone who never engaged.

1. Establish the headline outcome mix for the period, with raw counts. Too small a sample stops the analysis; a fabricated percentage destroys trust in everything else in the report.
2. Rank the pages readers gave up on, ignoring anything flagged as terminal success.
3. **Read the journeys, not just the counts.** For the top three, pull the individual visits that ended there. The step *before* the exit is usually the real problem: a reader who lands on billing, searches twice and leaves is telling you something different from one who arrives from the quick start and stops dead.
4. Label each as missing / unhelpful / unfindable — the three failure modes need three different fixes.

Output: a ranked list of imperative fixes ("Rewrite /billing: 14 readers searched and left"), each carrying its evidence, not a dashboard of numbers.

## Routes and funnels — where they fall out

The classic funnel question applied to docs: 60% land on the quick start, 40% reach billing, 5% take the action. Where did the rest go?

Cluster the recurring multi-step paths readers actually walked and compute how many reach a page that matters. Flag high-volume, low-completion paths. Also flag the **broken journey**: a transition the doc graph implies — page A links to page B — that no session in the period took. That is usually an anchor-text problem, not a content one.

Watch for the detour: when the top route is "landing → search → …", readers are bypassing the navigation, which is a discoverability finding about the sidebar, not about any page.

Conversion pages are inferred from the graph plus action labels; if the site uses unusual labels, say so in the report rather than letting the inference pass silently.

## Question clusters — what people ask

Group every question put to the assistant into themed topics, including the ones it **answered** — that is what makes this deeper than a gap list. For each cluster, check whether an existing page directly answers it:

| Coverage | Diagnosis | Fix |
|---|---|---|
| No page covers it | **content gap** | Hand to `docs-create` with a draft outline |
| A page covers it well, the assistant missed it | **retrieval failure** | Not content. The assistant's retrieval or its instructions — `docs-automate` |
| A page covers it and answers well | healthy | Note it and leave it alone |

Sorting by coverage × question count finds the highest-value retrieval fix in one step.

## Rejected searches — the page was right there

The failure no zero-result report will ever show: the reader typed a query, search worked, results appeared, and they read the titles and left without opening one. That points at eight words on a row, not at page bodies — an order of magnitude cheaper to fix than writing anything.

1. Collect queries where results were returned and nothing was opened. Group by meaning, not exact string: "reset password", "forgot password" and "password recovery" are one query with three spellings, and splitting them hides the frequency that justifies the fix.
2. Reconstruct what the reader saw: run the query yourself and write down the result list in order, with the exact titles. You are judging whether the right page's title, read cold in a list of five, looks like the answer.
3. Diagnose exactly one of three: **wrong words** (right page, different vocabulary), **wrong impression** (accurate but reads as jargon or a codename), **genuinely absent** (nothing in the list answers it — hand it to `docs-create`, do not rewrite).
4. Check the snippet-answered case first. A short factual query whose answer was visible without clicking is a quiet success, not a failure. Exclude it and say why.

**The principle:** a title is written in the reader's words, not the product's. Feature names are decided by people who already know what the feature does; queries are typed by people who do not. When they disagree, the reader is right by definition. The rejected queries are that vocabulary, written down, with a frequency count attached.

Patterns worth knowing:

| Pattern | Example fix |
|---|---|
| Query is a verb, title is a noun phrase | "Webhook Configuration Reference" → **"Send events to your server with webhooks"** |
| Title is the internal codename | "Atlas Sync" → **"Keep two workspaces in sync"** |
| Title states the concept, reader arrives with the symptom | "Authentication Overview" → **"Fix 401 and 403 errors when calling the API"** |
| Bare noun that could mean anything | "Limits" → **"Rate limits, file size caps and how to raise them"** |
| Several near-identical rows, so nothing is chosen | "Billing" / "Billing FAQ" → **"Change your plan or payment method"** / **"Refunds, invoices and failed payments"** |
| Good title, boilerplate first line | Replace "This page describes the configuration options available." with the answer's first sentence |

A title that over-promises turns a non-click into a dead end, which is worse. If the proposed title promises something the page does not deliver, the diagnosis was wrong.

## The striking-distance band — already visible, not yet winning

Pages at positions 5–20 have won the expensive part: crawled, indexed, judged relevant, shown to real people. What is missing is looking like the answer in a result list. Moving a page from 9 to 4 is a title and an opening paragraph; getting a new page to 9 is months.

1. Pull the band with position, impressions, clicks and queries, for a dated window.
2. For each page, take the queries carrying the most impressions — not the one the author had in mind — read the page, and answer in plain words: *is this page about that query?* Quote the query verbatim.
3. **Split into two piles, and this is the step that saves the money:**
   - **Wrong intent** — the page ranks for something it does not answer. No rewrite will save it. The honest output is a content-gap note for `docs-create`, and this page should stop competing for that query.
   - **Right intent, weak pitch** — the page genuinely answers, and the result listing does not say so. This is the queue: cheap, low-risk, reversible.
   - A page whose queries split across both piles is trying to be two pages. Say so instead of averaging it into one recommendation.
4. Rank by **impressions × distance still to close to the top three**, not by position. A page at 15 with thousands of impressions beats a page at 6 with forty. Show the arithmetic. Break ties toward the smaller fix.
5. For each queued page: a proposed title, a proposed description, and the one-sentence direct answer the first paragraph should open with. Never "improve the title".
6. Record the baseline — position and impressions at rewrite time. Search effects take weeks, and without a written baseline the next run cannot tell a real improvement from a seasonal one.

Never change a page's URL or its subject: both forfeit the ranking this whole exercise is built on. Never promise a position — you can promise a better pitch to people already being shown the page; ranking is the search engine's decision.

Also worth catching here: **cannibalisation**, two URLs ranking for the same query and splitting the signal. Flag it; the merge decision is a human's.

## Engagement — interest or confusion

Five minutes on a page means two opposite things: careful reading of something that matters, or a reader who cannot work out what the page is telling them. The reliable disambiguator is negative feedback on the same page.

| Dwell | Negative feedback | Reading |
|---|---|---|
| Well above the site median | any | **Problem** — high severity. They keep re-reading because something is not clear |
| Well above the site median | none | **Signal** — genuine interest. Consider expanding, do not "fix" |
| Well below the median | any | **Problem** — short and disliked |
| Around the median | several | **Problem** — medium |
| Very low dwell, no feedback | — | Likely a title or discoverability problem, not content |

The median is computed from this site, not from any global norm: every doc set has its own attention pattern. Never recommend deleting a page on dwell time alone.

## Actions and links — dead calls to action

Two failure modes: an action that gets impressions and few clicks, and a page that gets traffic and no outgoing clicks at all.

Compare each action's click-through against the median for the same label **on this site**. Flag where it falls well below with enough impressions to matter. Revenue-bearing actions rank above informational ones.

A low rate can be legitimate — an explanation page is not supposed to convert. When in doubt, report it as medium rather than high, and say what would settle it. Common shapes: the action is buried or badly worded; the wrong action on the wrong page (a sign-up prompt on a page whose readers already signed up); a genuinely terminal page that should either link onward or be redirected.

## Campaign traffic — promise versus reality

Campaign-tagged traffic arriving on a page that answers a different question bounces in seconds. Map tagged entries against landing pages and find where the promise and the page disagree: high bounce on a specific campaign, a campaign with traffic and no conversions, a campaign landing on a 404 or the root. The successful ones matter too — say what made them work so it can be repeated.

Never include raw referrer query strings in the report.

## Reader cohorts — which kind of reader fails

Page-level analytics say which page does badly. Cohorts say which *kind* of reader fails, which is usually what product and marketing need. Take the most active anonymous readers, pull each one's timeline, and cluster into a handful of named behavioural patterns — a reader who visits pricing and leaves negative feedback without converting; one who repeatedly reads the same integration page without ever acting; one with wide coverage, long dwell and no negative signals.

Labels are descriptive and lowercase-kebab, never numeric. Report direction of travel, never headcounts: identifiers are anonymous and merge or split with the network. Never include user agents, IPs, or referrer strings.

## Buying stage — who is deciding, and what stops them

Every other report answers "which page fails". This one answers "which reader fails, and at what point in deciding to pay". The same sentence about rate limits is a lost sale from someone evaluating and a support ticket from a customer; aggregated by topic they are indistinguishable, and the pricing objection disappears into a cluster of API questions.

1. **Get the stage split first** — evaluating, asking about price, integrating, needing support — in counts and shares. The distribution is itself the first finding.
2. **Decide who the docs actually serve.** If pre-purchase conversations are a small minority, the docs are a support surface, not a sales surface, and that is a headline finding: the product is spending its highest-intent page real estate on people who already paid. If a stage is absent entirely, say so and give the likeliest reason — an absent pricing stage in a product that charges money is a signal, not a clean bill.
3. **Extract the blocker, not the topic.** The question is never "what was this about"; it is *what did this reader need to know before they could stop hesitating, and did they get it*. Sort into **unanswered** (asked and hit a wall — the strongest evidence available), **answered badly** (an answer existed and did not settle it), **answered but insufficient** (the fact is present, the reassurance is not).
4. **Name the missing page.** If one already covers the ground, the problem is framing or findability and the fix is a rewrite, not a new page.

**The competitive pass**, done separately and last. When a reader names another product mid-conversation, they have handed you what they are comparing you against, in their own words, at the moment of deciding. Record who, in what context — **comparison** (they are choosing; a positioning page is missing), **migration** (they have chosen and are blocked on mechanics; the highest-value context in the whole report), **complaint** (a feature-gap report from someone who wanted to buy; check whether the capability exists and is merely undocumented before escalating it to the roadmap) — and which page's absence left it unresolved.

Report only competitors readers actually named, never the ones the team worries about. **Never characterise a competitor's pricing, limits or features from these conversations** — a reader's description of a rival is hearsay, often stale and sometimes wrong. Record what the reader believes, attributed to the reader; verifying it belongs to the external checks.
