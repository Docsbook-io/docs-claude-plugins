# Original research — the data the product already has and never publishes

Every other lens in this catalogue asks what the documentation **says**. This one asks what the product **knows**. Operating a product generates numbers nobody outside the company can obtain at any price: how often each error actually fires, which of forty config options anyone ever changes, how fast a version is adopted, which integration in the directory is installed and which is decoration. That data sits in production systems, gets looked at once during an incident, and is never published — because publishing it was nobody's job and no signal in the audit is capable of complaining about its absence.

The absence is invisible for the same structural reason a missing page is invisible: a benchmark that was never run has no URL, no impressions and no rank. But it fails one step earlier than the opportunity audit's blind spot. `opportunity-audit.md` finds a job the product serves and the docs never framed; this lens finds an **asset the company is already holding and does not know is an asset** — a table that exists in a warehouse today, that a journalist would link, a model would quote, and a competitor cannot answer, because they do not have the numbers.

What it costs to leave it there is specific. Every other content investment in this skill competes on execution — a better tutorial than a rival's, a sharper title than the one ranking above you — and both sides can copy both. A number only you can produce cannot be competed with; it is the one asset class in the audit where the moat is structural rather than editorial. Meanwhile the demand is permanent: assistants and search engines resolve *"how common is X"* and *"what do most teams do"* constantly, and route those questions to whoever published a defensible figure. Companies holding the data lose those citations to analysts who surveyed 200 people badly.

This pass proposes. It never publishes, never queries a production database, and never decides that a dataset is safe to release. **A human with authority over the data decides**, every time, and the pass is structured so that decision is cheap to make and impossible to skip.

## Exclusive claim and boundaries

| This lens owns | This lens does NOT own → owner |
|---|---|
| First-party operating data that appears nowhere in the docs, and the finding that it is publishable | Verifying third-party claims **already in** the docs against their sources → `references/external-checks.md` |
| The publishability gate: privacy, identifiability, competitive and contractual limits on releasing a number | Whether a page's existing numbers are stale → `external-checks.md` (prices, versions, quoted limits) |
| Asset design for a research page — benchmark, index, state-of-X, dataset, longitudinal series | Whether the audience for that asset exists at all → `opportunity-audit.md` (capability → job → user) |
| The statistical disclosure a published number must carry | What the page's prose says, its register, retrieval shape and CTA → `docs-manage` |
| Citability engineering: one headline number, method, stable URL, machine-readable table | Enabling the answer-markup and authorship switches that carry it → `docs-manage` |
| The recurring re-run as a condition of publishing at all | Running that cadence → `docs-automate` |
| A dataset's second life as a query tool | Designing and scoping that tool → the free-tools perspective |
| A dataset's second life as something people link to | Pitching it, outreach, link acquisition → the backlinks / digital-PR perspective |
| Writing none of it | The page itself → `docs-create` |

The boundary with `external-checks.md` is the one that gets blurred, so state it in the report: that reference verifies **claims that are in the docs and came from outside**; this lens publishes **data that is outside the docs and came from inside**. Opposite direction, opposite failure mode, and a finding filed under the wrong one gets the wrong severity and the wrong owner.

## When this pass earns its place

- **The product has been in production long enough to have distributions** — roughly two release cycles, or any window where a version, an error or a config choice has moved.
- **The docs already state a fact whose distribution is unpublished** — a documented rate limit, a default value, an error table, a version matrix. Each of those sentences is the public half of a private dataset.
- **The measurable queue is short and the site is still small.** A research asset creates demand that no rewrite of existing pages can create.
- **The category has no accepted number** and every article cites the same four-year-old survey. That is a vacancy, and it is filled once.
- **Not when** the data cannot clear §1 — a dataset whose smallest cell identifies a customer is not a thin asset, it is an incident, and no amount of aggregation proposed in an audit makes that call. Also **not** as a substitute for a measured failure: a page losing readers today outranks the best research proposal here, every time.

## Evidence tiers

This pass runs in two tiers at once, and collapsing them is how a proposal becomes a fabrication.

| Stage | Tier | Vocabulary | Rule |
|---|---|---|---|
| Inventory — what data plausibly exists | `hypothesis` | `capability` / `inferred` / `speculative`, as in `opportunity-audit.md` | Every row names the surface it was read from, or the person who confirmed it |
| Any figure quoted from the docs platform — reader searches, questions, routes, rankings | `measured` | dated window, absolute counts | Only for data this skill can actually read |
| Any figure from the product's own systems | Neither, until someone queries it | — | Recorded as **not yet measured**, with the query that would settle it |

The whole inventory is `hypothesis` and says so once, up front. **A distribution the pass did not query does not exist**: writing "roughly 70% of users leave the default" because it seems likely produces exactly the artefact this lens exists to create, except false, and false is worse than absent because it will be cited. Where a shape genuinely matters to the proposal, write the query, not the answer.

## 1. The publishability gate — run before you enumerate

The gate comes first, before a single candidate is written down, and the reason is sunk cost: a pass that spends an hour building a beautiful inventory will argue it through the gate afterwards. Knowing the disqualifiers first also shapes what is worth enumerating at all.

| Gate | Disqualifying shape | Why |
|---|---|---|
| Individual privacy | Any row traceable to a person, or a free-text field they wrote | Aggregate first or drop it; a re-identifiable release is not retractable |
| Customer identifiability | A cell small enough that one customer is the cell — a segment with three accounts, a top-N list, a chart with a visible outlier | "Aggregated" does not mean anonymous. Whoever recognises themselves has been published without consent |
| Contractual limits | Enterprise agreements, DPAs, or terms that never contemplated publishing usage data | The default in most contracts is silence, and silence is not permission |
| Competitive sensitivity | Absolute revenue, churn, total customer counts, per-account volumes | Ratios and distributions usually publish where absolutes never do |
| Regulatory scope and consent | Health, financial, biometric or children's data, residency regimes, or data collected to run the service being reused to market it | Not an audit decision in any form; a lawful basis for one purpose is not a lawful basis for the other |

Each candidate leaves the gate in exactly one state: **clear** · **clear if transformed** (name the transformation — aggregation floor, bucketing, k-anonymity threshold, opt-in only) · **blocked** · **needs a decision** (name whose: legal, security, the data owner). The report never rewrites "needs a decision" into "clear", and it never presents the pass's own reading of a contract as an answer.

> Candidate: error-code frequency across all workspaces. **Clear if transformed** — publish rates per 10,000 requests with a floor of 50 workspaces per bucket, never counts per account. Deciding party: platform owner.

## 2. Inventory — enumerate from the surface, never from assumed access

The pass can read the docs, the product's public surface and the docs platform. It cannot read the production database, and pretending otherwise is how a queue fills with datasets that turn out not to exist. So work from the surface backwards: **every documented fact is the public half of a private distribution**, and that inference is honest because the documented fact proves the system measures the thing.

| Surface you can actually read | Dataset it implies exists | Who holds it |
|---|---|---|
| A documented rate limit or quota | The distribution of real usage against it, and how many ever hit it | Platform team |
| A troubleshooting page listing error codes | Frequency ranking of every code, and time-to-resolution per code | Observability / support |
| A config reference with defaults | Which options anyone changes, to what, and which are dead | Product telemetry |
| A version matrix or upgrade guide | The adoption curve per version, and the long tail that never upgrades | Release / registry data |
| An integrations directory | Installs per integration — the ranking almost never matches the nav order | Marketplace |
| A performance claim in a README | The full benchmark harness and every result behind that one number | Engineering |
| A pricing or plan page | Distribution of plan and feature usage, in ratios | Billing (gate §1 applies hardest here) |
| The docs themselves | What readers search for and fail to find, what they ask the assistant, which routes they walk | **Already available to this skill** |

That last row is the one dataset this pass can reach without asking anyone, and it is genuinely proprietary: nobody outside knows what people search inside your documentation. Failed searches, unanswered assistant questions and the routes readers walk are a dated first-party corpus of the whole category's confusion — the default candidate when every other row needs a person. For every other row, output a **request**, not a number: the question, the query that would answer it, the team that holds it, and what the answer would unlock.

## 3. Asset classes — and which ones sustain

The class decides the maintenance bill, so choose it before anything is drafted.

| Class | What it is for | Sustains or one-shot |
|---|---|---|
| Benchmark | A defensible number for "how fast / cheap / accurate" | Sustains — re-run per release, and the diff is itself news |
| State-of-X report | What the whole population does, once a year | Sustains only as an edition series; a single edition ages into a liability |
| Index or ranking on a cadence | Who is where, right now | Sustains hardest — the cadence is the reason people return and link |
| Methodology page | How the number was produced, in enough detail to be attacked | Permanent; changes only when the method does |
| Public dataset | The rows themselves, for people wanting their own cut | Sustains if versioned; a one-off dump rots and gets cited forever |
| Teardown | What one real case actually shows | One-shot by nature — a series turns it into a cadence |
| Longitudinal series | What changed over time | Sustains and compounds; the only class that is worth more every year and impossible to enter late |

One-shot classes are legitimate; the trap is publishing one **shaped** like a sustaining one. "2026 State of X" with no committed second edition is a countdown to embarrassment, while the same data published as a dated teardown promises nothing. Choose the honest shape at proposal time — it is the one decision here that a later rewrite cannot fix.

## 4. Statistical honesty — what the number does not say

A published number with a hidden selection bias becomes the thing everyone cites, and the correction never travels. The original page can be updated; the two hundred articles quoting it cannot. That asymmetry is why the disclosure is not an appendix — it is part of the asset, and a proposal without it is not ready.

Four questions decide whether a figure may be published at all:

- **Sample, how it was drawn, and the population it generalises to.** Every row in the window, or a sample drawn how? Self-selection is the usual killer — opt-in telemetry describes the users who left telemetry on, skewing to defaults, newer accounts and the less regulated. Hosted customers are not self-hosted users and paying accounts are not the market, so name the population in the sentence, not in a footnote.
- **The confounders.** Survivorship (churned accounts are not in the table), instrumentation changed mid-window, bots and internal traffic, seasonality, a default that changed and moved the distribution with it.
- **What the number does NOT say.** Correlation stated as cause is the failure everyone makes: "teams using the API retain better" is a sentence about who adopts APIs, not about what APIs do.

Every research page carries this block, and the pass hands it over pre-filled to `docs-create`:

```
What this measures:  <the metric, in one sentence, in the reader's words>
Population:          <who is in it, and explicitly who is not>
How drawn:           <census of the window / sample and its method>
Window:              <dates, with the as-of date>
n:                   <absolute counts, per cell where cells are shown>
Excluded:            <what was dropped, how many, and why>
Confounders:         <the ones that could move the headline>
This does not say:   <the two conclusions a reader will jump to>
Method:              <link to the methodology page>
Re-run:              <cadence, and the date of the next edition>
```

Sample floors apply exactly as in `references/metrics.md`: below them, publish the absolute count and withhold the percentage. A rate computed on twelve observations, published, gets quoted without its twelve.

## 5. Citability engineering — what makes a page the thing that gets quoted

A research page fails for mechanical reasons far more often than for weak data. Five requirements, and each one has a failure it prevents:

- **One headline number, stated plainly in a complete sentence, near the top.** "Median cold start is 340 ms across 4,812 deployments" is quotable; a chart with no sentence is not. A model quoting the page needs a span it can lift.
- **A methodology section on the same domain**, detailed enough that a hostile reader could reproduce or attack it. Unattackable numbers are unciteable numbers — the journalist's first question is how you got it.
- **One stable, canonical URL that never moves.** Cite-magnets accumulate links over years; a URL carrying a year in its path splits them across editions. Date the edition **on the page**, archive prior editions at their own permalinks, and keep the citation target fixed.
- **A machine-readable version of the table** next to the prose — CSV or JSON at a stable path — so anyone can recompute rather than retype. This is also what makes the numbers survive being read by a machine at all.
- **A visible date and the next re-run date.** A number with no date is treated as undated, which is to say ignored.

The structured-markup and authorship switches that carry this into an answer engine are `docs-manage`'s configuration. Name the requirement, hand it over, do not describe the switch.

> Candidate: config-option adoption. Headline: *"Of 41 configurable options, 6 are changed by more than 5% of workspaces; 19 have never been changed by anyone."* Assets: one methodology page, one CSV, and a defect list for the 19 — which is separately a rewrite queue for `docs-manage`, because an option nobody sets is usually an option nobody understands.

## 6. Refresh — the cadence is the product

A "2024 State of X" page in 2026 does not merely age; it actively signals abandonment, and it does so on the exact page that was supposed to prove authority. Anything published under a class marked *sustains* comes with a committed re-run date, an owner, and a rule for what happens if the re-run slips — usually a dated banner rather than silence.

The recurring re-run is `docs-automate`'s work and is proposed **at the same time as the asset**, never afterwards: a proposal without its cadence is a proposal to publish a liability, so this pass hands both over together or neither.

## 7. Reuse — one dataset, four assets

The expensive part is the gate, the query and the disclosure. Once those exist, the same dataset yields several assets at a fraction of the cost, and the proposal should say which of them are in scope:

| Derived asset | What it adds | Owner |
|---|---|---|
| The report page | The headline number and its method | `docs-create` writes, `docs-manage` shapes |
| A tool that queries the dataset | Repeat visits, and a reason to return between editions | The free-tools perspective |
| A comparison or ranking cut | A second headline from the same rows | This lens, same gate, same disclosure |
| A chart others embed | A citation attached to every embed | `docs-manage`, for placement and attribution |
| The outreach that earns the links | Distribution, which the page does not do by itself | The backlinks / digital-PR perspective |

Propose the reuse chain, hand each link to its owner, and do not design the tool or write the pitch here.

## Output

Hand back, in this order, `hypothesis` labelled throughout, cut to five candidates:

**A.** The one-line statement of tier and what could not be read. · **B.** Inventory table — surface, implied dataset, holder, gate state. · **C.** Gate outcomes, with every *blocked* and *needs a decision* named and routed to a person. · **D.** Up to five candidates that cleared, each with: asset class, sustaining or one-shot, headline number as a **query not an answer**, the pre-filled disclosure block, the citability requirements, and the re-run cadence. · **E.** The reuse chain per candidate. · **F.** Everything below the cut as one line with a count.

Then: the page to `docs-create`; its shape, register and structured-data configuration to `docs-manage`; the re-run to `docs-automate`; the tool to the free-tools perspective; the outreach to the backlinks / digital-PR perspective. This pass writes nothing.

## Guardrails

- **Never state a distribution, rate or count from the product's own systems that this run did not read.** Write the query instead. An invented figure in a research proposal is the one output of this skill that survives correction and gets cited for years.
- **Never declare a dataset publishable.** The pass proposes; a named human with authority over the data decides. "Legal will probably be fine with it" is not a gate state.
- **Never publish a cell that one customer could recognise as themselves** — top-N lists, small segments, visible outliers. Aggregation is not anonymisation, and a re-identification cannot be withdrawn.
- **Never propose a competitor benchmark run on your own harness** without routing it to a human first: it is a credibility and occasionally a legal exposure, and comparisons against what a competitor **claims** belong to `external-checks.md` anyway.
- **Never verify or correct an existing third-party claim here.** That is `external-checks.md`'s territory, and duplicating it means one finding reported twice at two severities.
- **Never propose a research asset for an audience this pass invented.** Whether anyone wants the number is `opportunity-audit.md`'s question, and a benchmark nobody was asking for is the most expensive page in the catalogue.
- **Never let a research proposal outrank a measured failure on real traffic.** Everything here is hypothesis tier, including the good ones.
- **Never publish a sustaining class without its cadence and owner.** An abandoned annual report damages authority more than never having published.
- **Do not attach a search volume, an estimated backlink count or a traffic forecast to a proposed asset.** This skill cannot buy those numbers, and inventing them to justify a proposal is the same sin as inventing the data itself.
- **Do not write the page, the tool, the chart or the pitch.** `audit` mode, like every phase 1–4 pass.

## Acceptance criteria

- [ ] The gate in §1 was applied before any candidate was written down, and every candidate carries exactly one gate state: clear / clear if transformed / blocked / needs a decision.
- [ ] Every *needs a decision* names the person or function who decides, and none was upgraded to *clear* by this pass.
- [ ] The inventory names, for each row, the surface it was read from and the team that holds the data — no row assumes access this run did not have.
- [ ] The whole pass is labelled `hypothesis` once, up front; any figure quoted from the docs platform is separately labelled `measured` with its window and absolute counts.
- [ ] No number from the product's own systems appears as an answer; each is written as the query that would settle it.
- [ ] Every candidate names its asset class and whether it sustains or is one-shot, and no one-shot is shaped as an edition series.
- [ ] Every candidate carries a pre-filled disclosure block including the population it does **not** generalise to and the two conclusions a reader would wrongly draw.
- [ ] Every candidate carries all five citability requirements, with a canonical URL that does not encode the edition.
- [ ] Every sustaining candidate carries a re-run cadence and an owner, handed to `docs-automate` in the same report.
- [ ] The reuse chain is stated per candidate, with the tool routed to the free-tools perspective and the outreach to the backlinks / digital-PR perspective.
- [ ] Queue cut to five, everything below the cut is one line with a count, and nothing was written, created or published by this pass.
