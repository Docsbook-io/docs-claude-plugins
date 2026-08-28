# Goals and funnels — reading the owner's own intent

Every other detector in this skill reports what readers did. Goals and funnels are the only place the **owner** stated what readers were supposed to do, which makes them the only signals that can say a site is failing *at its purpose* rather than merely changing.

That is also what makes them the easiest signals in the skill to misread. A goal is a definition somebody wrote, and a definition can be wrong in ways a pageview count cannot. **Before a goal number becomes a finding, it has to survive the question "could this definition ever have produced a different number?"** Section 1 is that question; skip it and the audit produces confident advice about reader behaviour that is actually a description of a typo in an anchor.

Declaring goals and funnels is not this skill's job — that is configuration, in `../../docs-manage/references/goals-funnels.md`. This one only reads them.

---

## 0. When to bring goals into an audit

Not every run needs them. Reach for them when:

- The question is about **conversion, activation, revenue or "why don't they sign up"** — nothing else in the skill answers it.
- A behavioural finding needs a **denominator with intent behind it**. "31% dead-end rate" is a fact about everybody; "of readers who reached the pricing section, 8% clicked through" is a fact about buyers.
- The owner is asking **whether a change worked**, and the change was meant to move a specific behaviour. A goal is the pre-declared success criterion, which is the only kind that cannot be chosen after the fact.
- A finding is about a **route** rather than a page — the funnel localises it to one transition, which no page-level detector can do.

Skip them when the question is findability, content quality, accessibility or freshness. A goal has nothing to say about whether a page is well written, and reaching for one anyway produces a paragraph of irrelevant numbers that buries the finding that mattered.

And when **nothing is declared at all**, that is itself the finding, reported once and without an upsell: the site has no stated definition of success, so no run of this skill can say whether it is succeeding. Read the routes readers actually walk instead — that needs no hypothesis — and hand the declaration over to `docs-manage`.

---

## 1. Before believing any number

Four checks, in this order. Each one is cheap and each one has, on its own, invalidated an entire audit.

**1. Does the matcher still resolve?** A section goal on a renamed anchor, a page goal on a moved path, an outbound goal on a host the calls to action no longer point at — all of them save fine and match nothing. **A goal that cannot fire is visually identical to a goal with 100% drop-off.** The distinguisher is history: a goal that fired last month and reads zero now is a change in the docs or the readers; a goal that has never fired is a definition. Resolve the matcher against the docs as they are now before writing a word about readers.

**2. Was the definition edited inside the window?** A goal or funnel changed mid-window is two measurements drawn as one line. Note the date and start the comparison after it; never draw a single conclusion across it.

**3. Is the denominator real?** A funnel is a hypothesis about a path, and **most readers are not on it.** The share of all visits that enter step 1 is itself a number worth quoting: a funnel describing 4% of traffic cannot carry a site-wide conclusion, however clean its transitions look.

**4. Is the sample above the floor?** Percentages are withheld per step below about 30 visits into it, and time percentiles below about 5 conversions. Where the surface withholds a rate, report the count — do not helpfully compute the percentage yourself. Every figure here is an estimate regardless: visitors are identified by a hashed IP, so corporate NAT merges readers into one and a mobile network splits one across many.

---

## 2. The four surfaces, and what each cannot answer

| Surface | Answers | Does **not** answer |
|---|---|---|
| **Goal totals and trend** | Is this behaviour becoming more or less common | Whether it causes anything. A micro goal rising while the macro falls means the micro-conversion got easier, not that the site got better |
| **Funnel** | Which single transition loses the most people | What most visitors do — they are not in this funnel |
| **Visitor list** | Who is evaluating you right now, and how far each got | How many people. **Read this list; do not count it** |
| **Per-conversion journeys** | The shape of the decision — how long it takes | What caused it. The source is **last touch** and systematically over-credits whatever was clicked last, which on a docs site is usually Direct |

Two habits that follow from the table:

- **Compare a goal only to itself last period.** There is no docs-funnel industry benchmark; anyone quoting one is quoting an ecommerce number from a checkout flow with a cart in it.
- **Read the worst transition, not the smallest step.** The last step is almost always the smallest and says nothing. The transition is where the route breaks.

### What a drop-off should look like

There is no universal healthy rate, but the expectation is keyed to what the step **asks of the reader**:

| The step asks them to… | Expect to lose | Alarming |
|---|---|---|
| keep reading — next page, next heading; costs nothing | 20–50% | over 70% |
| act inside the page — open search, ask the assistant, copy code | 50–80% | over 95% |
| leave for another site — the macro step | 90–99% | — |

When a drop is alarming there are exactly three candidate causes, and they need three different fixes: **the link** (the path from the previous step is not discoverable, or is broken), **the promise** (the previous page led them to expect something else), or **the page** (the step's own content fails). Check the link first — it is the cheapest to verify, and a step whose link 404s will absorb unlimited content effort and never move.

---

## 3. Reading the pair, not the number

Almost every goal number is ambiguous alone. The disambiguation is always a second signal, and these are the pairs that carry it.

| What you see | Read it with | Because |
|---|---|---|
| A goal total | The funnel it sits in | A total says how often; only the transition says where they were lost getting there |
| Macro goal | The micro goals under it | Both up is real. Micro up, macro flat is a reachability change, not a selling improvement |
| Goal completions | Traffic | Completions falling while traffic rises is a **mix change**, not a quality drop. Judge the rate, then find where the new traffic enters |
| Funnel completion | Dead-end rate | A clean funnel beside a high dead-end rate means the docs convert the readers who already knew what they wanted and fail everyone else |
| Funnel completion | The routes readers actually walked | Low completion while some *other* route is frequent and succeeds means readers found a better path than the declared one. Adopt theirs |
| A conversion count | Its median and p90 time | Minutes means one session and an on-page fix. Days means they leave and come back, and being remembered matters more than any rewrite |
| Any goal | Its own last period | The only valid comparison there is |

---

## 4. Worked readings

Each of these is the same class of number producing a different conclusion depending on what sits beside it. They are the shapes worth recognising; the numbers are illustrative.

### A. The leak is upstream of where it looks

```
1. any docs visit      1,600
2. reached pricing       210   (−87%)
3. clicked to app         97   (−54%)   ← worst transition: 1 → 2
```

**Naive read:** 6% end-to-end, the pricing page is not converting, rewrite it.
**Actual read:** of readers who reach the price, more than four in ten click through. That is a *good* conversion, and rewriting the pricing page is work spent on the part that already works. Only 13% of readers ever reach the price at all.
**Do:** check the link (is the pricing section linked from the pages readers actually land on), then the promise (do those pages suggest there is a paid product), then the page (is the section so far down that nobody scrolls to it). In that order — cheapest first.

### B. The same funnel, inverted

```
1. any docs visit      1,600
2. reached pricing     1,100   (−31%)
3. clicked to app         38   (−97%)   ← worst transition: 2 → 3
```

**Naive read:** the funnel works until the end, so the product must be too expensive.
**Actual read:** the reach is excellent and the ask fails. Price is one candidate and the weakest one to assume, because two cheaper explanations come first: there may be **no call to action** at the point of interest, or the reader arrives at the price already knowing something disqualifies them — a missing integration, a limit, a licence.
**Do:** read what those readers searched for and asked the assistant *before* reaching the price. Rejections are usually written down in the reader's own words somewhere in the run.

### C. Micro goals rising, macro flat

```
reached_pricing    +180% over the quarter
copied_install      +90%
clicked_to_app        +2%
```

**Naive read:** engagement is up, revenue will follow.
**Actual read:** the micro-conversions got *easier to reach* — the anchor moved up the page, or the section landed in the navigation. Nothing says more of the right readers are arriving.
**Do:** check whether the pages carrying those anchors were restructured in the period, and check whether traffic mix changed. Treat this as a warning that the micro goals have stopped being evidence and become a target — which is the failure mode declaring them was supposed to prevent.

### D. A healthy goal inside a collapsing funnel

```
funnel `evaluation` completion:  1.1%
goal `clicked_to_app` total:     840 completions, steady
```

**Naive read:** the funnel says the site is broken.
**Actual read:** the goal is fine, so readers *are* converting — they are simply not doing it along the declared route. The funnel is measuring a hypothesis that most converters do not follow.
**Do:** work backwards from the visits that ended well and read which entry pages actually lead to success. This is a **navigation finding**, not a content one: the fix is to promote the route readers found, not to push the one that was designed. Then re-declare the funnel to match reality, and note the date so the two are never compared as one series.

### E. A step at exactly 100%

```
1. any docs visit          2,400
2. reached the overview    2,390   (−0.4%)
3. copied install            310   (−87%)
```

**Naive read:** step 2 is healthy.
**Actual read:** step 2 is not measuring anything. An anchor sitting above the fold, or a heading rendered in the sidebar on every page, fires for everyone who loads a page — so the step adds a flat segment and no information, and it inflates the step count while shrinking nothing.
**Do:** drop the step, or move it to an anchor deeper in the page that a reader has to actually arrive at. Any step that loses under a few percent is a candidate for the same reading.

### F. Two funnels, opposite verdicts

```
funnel `evaluation`      completion 4.2%   (healthy for a docs site)
funnel `implementation`  completion 0.6%   worst transition: copied install → reached configure
```

**Naive read:** conversion is fine, do nothing.
**Actual read:** the docs sell well and onboard badly. This is the shape that shows up as churn one or two billing cycles later, and it will never appear in a traffic report. The two funnels exist separately precisely so this cannot average out into "fine".
**Do:** treat it as an activation defect owned by whoever wrote the quickstart, not as a marketing problem. Check whether the configure step is reachable from the install step at all — a missing "next" link between two pages produces exactly this.

### G. Completions flat, traffic up

```
traffic          +140%
goal completions   +4%
```

**Naive read:** the docs got worse under load.
**Actual read:** a mix change. A new source is sending readers with a different intent — a link aggregator, an AI answer citing one page, a campaign. The rate fell because the denominator changed, not because anything on the site did.
**Do:** judge the rate per entry page and per source before touching anything. If the new traffic enters on one page and leaves, that page is now a top-of-funnel page and needs a route onward — a content job — not a repair.

### H. A one-day spike

```
goal `clicked_to_app`: 3 completions/day, then 214 in one day, then 4
```

**Naive read:** something worked; find it and do it again.
**Actual read:** almost always one of three things, and none of them is a conversion improvement — an automated client, one visitor whose hashed identity split or merged, or a genuine referral burst that carried no intent.
**Do:** read the individual visits behind that day before it enters the report. A spike quoted as a finding and later explained as a crawler costs more credibility than the finding was worth.

### I. Median minutes, p90 days

```
goal `clicked_to_app`: median 6 min, p90 9 days
```

**Naive read:** average time to convert is a few hours.
**Actual read:** there is no average reader here. The distribution is two populations — readers who arrived ready and readers who evaluated for over a week — and any mean lands in the empty valley between them, describing a visitor who does not exist. **Quote both numbers, never one.**
**Do:** the two halves need different work. The fast half is served by an on-page call to action; the slow half is served by being *findable again* — a page worth bookmarking, a name they can search for, a reason to return. If the window was set shorter than that p90, part of the slow half is being cut off and the funnel is understating itself.

### J. The funnel improved right after the rewrite

**Naive read:** the rewrite worked.
**Actual read:** unknown, until edited pages are compared against untouched ones across both windows. Docs traffic moves for reasons that have nothing to do with the edit, and before-versus-after alone cannot separate them. This is the phase every other audit skips — the method is in `prior-fixes.md` and it applies to goals exactly as it does to traffic.
**Do:** give one of the four verdicts and no others: it worked, it did nothing distinguishable, it made things worse, cannot tell. If the goal was declared *after* the edit, its retroactive history covers the pre-edit period too — which makes this comparison available immediately, and is the one case where a goal declared late is as good as one declared early.

### K. The most recent days always look worse

**Naive read:** conversion is trending down.
**Actual read:** a window artefact. When the conversion window is long relative to the period, the newest entrants have not had their full window yet, so the latest bucket compares an open cohort against closed ones and is guaranteed to look worse.
**Do:** exclude the trailing period equal to the window before reading a trend, and say that you did.

---

## Guardrails

- **Never report a zero as reader behaviour** until the matcher has been resolved against the docs as they are now. This is the single most expensive mistake available in this reference.
- **Never quote a funnel rate without the share of traffic that entered step 1.** A rate without its coverage reads as a fact about the site.
- **Never compare a funnel to another site's numbers.** The only valid comparison is this funnel last period.
- **Never draw one conclusion across a definition change.** A funnel edited mid-window is two funnels.
- **Never present the visitor list as a count**, and never present the last-touch source as attribution — describe it as a hint, every time it is quoted.
- **Never convert a goal value into revenue on the owner's behalf.** A declared value is their assumption; label it as theirs. A null value is not zero, and money derived from a null-valued goal is invented.
- **Never recommend optimising a micro goal on its own.** It exists to localise a failure in the macro one; promoting it to a target is how a site gets a rising engagement line and a falling revenue line.
- **Do not declare or edit goals from an audit.** Noticing that measurement is missing or broken is a finding; changing it is `docs-manage`, after the apply gate.
