# Goals and funnels — declaring what the docs were supposed to achieve

A **goal** is one thing you want a reader to do. A **funnel** is an ordered route through several of them. Together they are the only place the owner states what the documentation is *for*; every other number reports what readers did, and none of them can say whether that was the point.

This is configuration, not content. It belongs to the `platform` half of this skill: it changes what the site measures, never what a page says. Reading the results afterwards — and deciding what they mean — is `docs-analyze`, in `../../docs-analyze/references/goal-signals.md`.

**Nothing here is a one-way door.** Goals are matched *retroactively* against history already recorded, so a goal declared today fills its chart immediately instead of starting from zero. Declare one, look at it, archive it if it says nothing. That is the opposite of instrumentation that only counts forward, and it is why the right posture is to iterate rather than to design perfectly first.

---

## 1. Choosing what to measure

### Look before declaring

Three things, in this order, before naming a single goal:

1. **What is already declared.** A workspace that already has goals has a decision in it. Adding a fifth without reading the four is how a list becomes a log.
2. **The traffic volume for the period.** It sets how many goals the site can support at all, and whether a funnel will have a denominator worth reading.
3. **How visits currently end, and what readers already do.** A goal is a statement about the gap between that and what should happen. Without the first half you are declaring a wish.

Then get the **page tree with its heading anchors**. Section goals match anchors, so the outline is the menu of goals available without adding any tracking whatsoever.

### One macro, a few micro

A **macro-conversion** changes revenue: a click out to the app, the pricing page or signup; a demo booked. A **micro-conversion** is evidence a reader is moving toward it: reaching the pricing section, copying the install command, asking the assistant.

**Declare exactly one macro goal and 2–4 micro goals that plausibly lead to it.** The micro goals exist to *localise a failure* in the macro one. They are not targets of their own, and optimising one in isolation is how a site ends up with a rising "reached pricing" line and a falling revenue line — a common outcome, not a hypothetical.

**Above about six goals the list stops ranking anything and becomes a log.** The limit is statistical: a typical docs workspace sees a couple of hundred human visits in thirty days, so a goal firing for 5% of them produces roughly ten events a month. Its line is flat against the axis, its row reads "not enough data" most weeks, and it dilutes attention from the goals that carry signal. Declaration warns past that point — archive one before adding another.

### The four kinds, and what each actually matches

| Kind | Matches | Declare it for |
|---|---|---|
| `section` | a heading came into view | "scrolled as far as pricing", "reached the auth section" |
| `event` | one of the events the docs already emit | copied code, asked the assistant, gave feedback |
| `page` | a **page view** of a path | "opened the quickstart" |
| `outbound` | a click leaving for a host | the macro goal, almost always |

Three things worth knowing before picking one:

- **`section` is how scroll depth exists here.** The heading-view event already fires when a heading enters the viewport, so a "scrolled as far as pricing" goal needs nothing added to the docs — it needs a heading with an `id`, which the page already has. This is the cheapest goal kind and the most under-used.
- **`outbound` matches by HOST, not URL.** `/pricing` and `/pricing?utm=launch` are one destination; you never enumerate URLs.
- **`page` is a page view and nothing else.** A reader who scrolled past a link to `/pricing` has not reached `/pricing`, and the matcher agrees.

An `event` goal can be **scoped to a path**, which is how one event becomes two goals: "copied the quickstart snippet" and "copied the auth snippet" are different facts about the reader, and merging them hides which page does the work.

### Naming

Name a goal for **what the reader did**, past tense, lowercase with underscores: `reached_pricing`, `copied_install`, `clicked_to_app`, `asked_about_limits`.

Never put a path, an id, an email or a query string in the name. Two reasons, both real: one goal per URL is a log rather than a ranking, and an address in a goal name travels into exports and chat replies. Declaration warns on it. The path belongs in the matcher; the name belongs to the behaviour.

The name is also the **handle** — funnel steps refer to goals by name, and a name already in use is refused rather than merged. Pick it as though it is permanent, because for every funnel built on it, it is.

### When a goal carries money

Attach a value **only if you can defend the number.**

- A macro goal can carry the real average sale.
- A micro goal can only carry an *expected* value: the average sale multiplied by the share of readers who reach that point **and** go on to buy. If that share is unknown, the value is unknown.

Leaving the value empty is a real answer and usually the better one: every money figure derived from that goal stays switched off rather than displaying an invented one. **A value of zero is refused outright** — `$0` renders as a measurement, and "worth nothing" is a different claim from "nobody said."

---

## 2. Designing the funnel

### Order is the whole point

A visit counts as reaching step N only if it hit steps 1..N **in sequence**. Counting each step independently — "how many visits saw the pricing page at all" — is the classic funnel bug: it credits step 3 to readers who never touched steps 1 and 2 and reports a conversion rate for a journey nobody made.

State the consequence to the owner, because it is the check that catches a broken implementation: **reordering the steps must change the numbers.** If it does not, something is counting events instead of ordered visits.

Detours are tolerated — a reader who wanders off between two steps and comes back still counts as continuing. The order is a constraint on sequence, not on adjacency.

### Step 1 broad, last step real

**Start broad.** Most docs readers arrive deep — on `/docs/api/webhooks`, from a search engine or an AI answer — and almost nobody starts at the index. A funnel only counts visits that entered at step 1, so a step 1 of "viewed `/docs/`" excludes the majority of the audience before measuring anything, and reports a denominator describing a rare visitor. Make step 1 *any docs visit*. Declaration warns when step 1 is a single page.

**End on a real outcome.** A funnel whose last step is a scroll or a section view measures attention, and no decision follows from it. The last step should be the thing that changes revenue — usually an outbound click to the product host. Declaration warns on this too.

A funnel whose first and last steps are both micro-conversions is a reading report wearing a funnel's clothes.

### How many steps

**Three to five.** Beyond eight, declaration refuses.

The reason is multiplicative: five steps at a healthy 50% each leaves 3% at the end; eight leaves 0.4%. Every added step shrinks the final denominator and adds one more place for a definition error to hide. Docs sites carry less traffic than the ecommerce flows the industry's 5–8 range was set for, so the low end is the right default here, not the middle.

If the route genuinely has more steps, **split it into two funnels** — §3 is the split that almost always applies.

### The conversion window

The window bounds how long after step 1 a later step still counts. **Leave it empty and the visit itself is the boundary — the honest default for docs**: a reader who returns a week later is a new visit, not a slow conversion.

If you do set one, the method is a lookup, not an estimate: **the 90th percentile of observed time-to-convert among readers who did convert, rounded up to a natural unit.** The per-conversion list reports that p90 directly. Too short truncates real conversions; too long lets unrelated later behaviour glue itself to an old step 1 — "she read the quickstart in March and signed up in June, so the quickstart converted her."

🔴 **A window longer than the plan retains can never complete.** It reports permanent drop-off that is an artefact of the plan, not of the docs. Declaration clamps the window to what is retained and says so — relay that, because the funnel the owner asked for and the funnel they got are then different funnels. On the free tier retention is a single day, which makes any multi-day window meaningless there; read the actual limit from what the clamp reports rather than assuming a tier.

There is a subtler version of the same trap: **a window as long as retention makes the most recent bucket always look worse**, because the newest entrants have not had their full window yet. Keep the window comfortably shorter than retention so a closed cohort is never compared against an open one.

---

## 3. The two docs funnels

Documentation serves two different jobs, and merging them is the most common design error in this whole reference. They have different entrants, different timescales, and different people who would fix a problem — so a merged funnel produces one number neither of them can act on.

### A. Evaluation — "should we adopt this"

The reader is deciding. One session to a few days.

```
1. any docs visit                          (event: page view)
2. reached a capability or price section   (section: #pricing / #limits / #security)
3. clicked through to the product          (outbound: app.theirdomain.com)   ← macro
```

Three steps. Whoever writes the comparison and positioning pages owns a fix.

### B. Implementation — "make it work"

The reader has already decided. Minutes to days, with long gaps.

```
1. landed on the quickstart        (page: /docs/quickstart)
2. copied the install command      (event: code copied, scoped to that page)
3. reached the configure section   (section: #configuration)
4. reached first success           (section: #your-first-request)
```

Four steps, and the one case where a multi-day window is defensible — "I will come back after lunch" is the norm here. Whoever wrote the quickstart owns a fix.

Note this funnel ends on a **product** event, not a business one. Its revenue shows up later, which is exactly the case where a value is set by the expected-value method in §1 or not at all.

### Why "landing → problem → solution → pricing" does not transfer

That sequence assumes the visitor enters at the top and descends. Documentation breaks the assumption structurally: readers enter deep, re-enter at different depths across days, and the sidebar makes every page reachable from every other. The marketing-site shape is valid *upstream* of the docs. The docs-side motion is the reverse — the reader arrives with a question, gets it answered, and only then becomes reachable by a call to action.

Which is the rule worth remembering: **the outbound step belongs after an engagement step, never directly after the entry step.**

---

## 4. What declaration refuses, and what it only warns about

Every one of these is returned at the moment of writing, and **every one is relayed to the owner verbatim.** They name a specific defect in a specific definition; summarising them into "there were some warnings" throws away the entire value. A refusal means nothing was written; a warning means it was written and is worth looking at.

### Refused — nothing was saved

| What happened | Why it is refused rather than warned |
|---|---|
| No name, or nothing to match | There is no goal to save. |
| An event the docs do not emit | The goal could never fire, and a goal that never fires is visually identical to a goal with 100% drop-off. The owner would go looking for a UX problem that does not exist. |
| A value of zero | `$0` renders as a measurement. Empty is the way to say "nobody declared a value". |
| The name is already taken | Names are the handle funnels refer to a goal by. The fix is a different name or an edit to the existing goal — never a retry of the same name. |
| A funnel with fewer than two steps | With one step there is no transition to measure. That is a goal. |
| A funnel past eight steps | The tail is meaningless whatever the site. Split it. |
| A step naming a goal that does not exist | A funnel silently dropping a step reports a **better** conversion rate than the real route — the one failure mode a funnel must never have. |
| A window of zero or less | Empty means "the visit", which is a real answer. Zero is not. |

### Warned — it was saved, and it is worth acting on

| The warning | What to do about it |
|---|---|
| The name looks like it holds a path, id or address | Rename for the behaviour and move the address into the matcher. Both a cardinality problem and a privacy one — names travel into exports. |
| A value on a scroll goal, with no average price set | Either work out the expected value properly (§1) or clear it. |
| More than about six goals already | Archive one first. Past six the list stops ranking. |
| More than five funnel steps | Split into evaluation and implementation. |
| Step 1 is a single page | Broaden it to any docs visit, or accept that the funnel describes a minority of readers and say so every time it is quoted. |
| The funnel ends on a scroll or a reading signal | Ask what business event should terminate it. Usually an outbound click. |
| The window is longer than retention | It has been clamped. Decide whether the clamped funnel is still the one you wanted. |
| A step matches the same thing as an earlier step | It will be reached by everyone who reached that one — a flat 100% segment carrying no information. Remove it. |

**Archive, never delete, to tidy up.** A funnel that silently loses a step reports a better conversion rate than the real one, which is why removal is archival — and why "cleaning up" a goal that a funnel still references is the most expensive tidy in this reference.

---

## 5. Measurement drift — after the content changes

🔴 **A goal is a claim about a page that still exists.** Content moves and the declaration does not move with it, silently: a section goal keeps matching an anchor that was renamed in a rewrite, a page goal keeps pointing at a path that now redirects, a funnel keeps describing a route whose middle page was merged into another. Nothing fails. The chart keeps drawing. It just draws a flat line at zero, which reads exactly like readers refusing to convert — and the owner spends a quarter rewriting a page that was never the problem.

This is the one drift class with **no external source of truth to compare against**: the code did not change, the pricing page did not change, no link is broken. Only the declaration and the docs disagree, and nothing else in the system will ever surface it.

**So run this check whenever a change lands that could move what a goal matches.** The trigger is structural, not cosmetic — a typo fix does not need it, and these five things always do:

| What changed | What it can break |
|---|---|
| A heading renamed, removed, or its anchor changed | Every `section` goal on that anchor drops to zero |
| A page moved, merged, renamed or deleted | Every `page` goal and every funnel step on that path |
| Navigation or internal links restructured | The funnel's route still exists but nobody walks it any more |
| A call to action added, removed, or pointed at a different host | The macro `outbound` goal now measures a destination nobody clicks |
| A new page, section or conversion action shipped | Nothing breaks — but the thing you just built is unmeasured, which is the more common failure |

The check itself, in four steps:

1. **Read what is declared**, with what each goal matches. This is free on every plan; the results are the paid part, and the check does not need them.
2. **Resolve every matcher against the docs as they are now.** Does the anchor exist on a page? Does the path resolve without a redirect? Is the outbound host still the one the calls to action point at? Is the event still emitted from the page the goal is scoped to?
3. **Report a broken matcher as a finding, not as a reader problem** — this is the one that matters. A matcher that resolves to nothing is a measurement defect; naming it as a conversion problem is the mistake this whole section exists to prevent. Fix it by re-pointing the goal at the new anchor or path, which keeps the history comparable.
4. **Ask the additive question, which is the one everyone skips:** does the change that just shipped introduce something worth measuring that nothing currently measures? A new pricing section, a new quickstart, a new call to action, a new integration page with its own outbound destination. If a page was built to make readers do something, and no goal names that something, the page ships unmeasured and the next audit will have nothing to say about it.

**Two cautions on acting.** Re-pointing a matcher keeps one series that spans a definition change — note the date, and never draw a single conclusion across it. And declaring a *new* goal costs nothing and loses nothing, because matching is retroactive: the new goal arrives with its own history already filled in, so there is no reason to defer it to "next time we look at analytics".

Making this recur without anyone remembering — on a push, in CI, or on a schedule — is `docs-automate`'s job, and its drift reference carries the routing.

---

## Acceptance criteria

- [ ] What is already declared was read before anything new was proposed.
- [ ] Traffic volume and current visit outcomes were established before choosing goals — no goal declared against a wish.
- [ ] Exactly one macro goal, and between two and four micro goals that plausibly lead to it.
- [ ] Every goal is named for the behaviour, past tense, with no path, id or address in the name.
- [ ] Every value attached is defensible, or absent. No zero values, no invented expected values.
- [ ] Step 1 is broad, the last step is a business outcome, and there are between three and five steps.
- [ ] The window is empty, or is a p90 lookup that sits comfortably inside what the plan retains.
- [ ] Evaluation and implementation are separate funnels, not one merged route.
- [ ] The route was walked once as a reader before the funnel was built on it.
- [ ] Every refusal and every warning was relayed verbatim, not summarised.
- [ ] After any structural content change, every matcher was resolved against the docs as they now are, and the additive question was asked.
