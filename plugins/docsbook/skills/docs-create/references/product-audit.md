# Product audit — know the buyer before you write the page

Documentation that reads like a file dump is almost always documentation written before anyone asked who it is for. This phase answers four questions, and every one of them changes the output: **who enters, how they enter, who they compare you to, and how the product makes money.**

The phase is `audit` mode. It reports. The only files it may write are `docs-plan.md` and additive, marked blocks inside a private product source-of-truth.

## Evidence order

Reason in this order, and never present a lower tier as a higher one:

1. **Existing analysis reports.** If a prior run left findings on disk, reuse them rather than re-deriving.
2. **The source itself** — the site, the repo, the docs being migrated. This is the strongest ground for claims about the product.
3. **Real analytics**, when a workspace with history is connected. This is the only tier that can tell you which entry path people actually use.
4. **Reasoned simulation**, only where no data can exist yet — a channel that just launched, a competitor's unshipped roadmap.

Label every simulated claim as simulated, in the finding and in any prose it produces. A reader must be able to tell a measured claim from a reasoned guess. When in doubt, label it simulated and lower the confidence.

## Lens 1 — Segments: who the buyers actually are

For each segment the source addresses:

- **Job to be done**, in the reader's words, not the product's.
- **Where they already are** — the forums, communities and search phrasings they use. This is what the top-of-funnel pages must match.
- **Buying trigger** — the event that turns a browser into an evaluator.
- **Entry path they actually use**, which is often not the one the marketing site assumes.

Two or three real segments beat five invented ones. A persona the source does not address is a fabrication.

## Lens 2 — Entry paths: every way in, and how good each one is

List every path a reader can arrive by — organic search, a repo README, a package registry, a shared link, an agent or MCP client, a docs link from the app, a comparison article. For each:

- The actual sequence of steps from first touch to first value.
- The friction in it: a term that appears nowhere on the landing page, a step that assumes a tool the reader does not have.
- A coverage score (0–100%) for how well documentation supports that path today.
- What would measure it, so `docs-analyze` can pick it up later.

If the product declares an entry funnel or a positioning rule anywhere in its own knowledge base, **read it first and treat it as a hard constraint.** No page you propose may contradict it.

## Lens 2b — Capabilities and the jobs they unlock

A segment list says who arrives. It does not say what the product lets them finish, and a plan built only on segments produces a page per feature — which is how generated docs end up as a file dump with better headings.

Before the structure decision, walk the chain once: **capability → job → user → workflow → outcome**. Translate every feature into the action it performs ("webhook" → "start a process the moment something happens"), then ask which jobs that action finishes, for whom, and what the result is worth. Combinations matter more than individual capabilities: *API + filtering + export* is six different use cases for six different audiences, and each of them types something different into a search box.

This is what the mandatory use-case page and the FAQ get written from, and it is what stops the plan from covering only technical intent while nobody problem-aware ever finds the product.

`docs-analyze/references/opportunity-audit.md` is the full method — ten job classes, four audience axes, the coverage matrix, the scoring. Load it here when the plan needs more than two or three use-case pages, or when the product's capabilities clearly serve audiences the source never addresses. Its one hard rule applies with full force at creation time: **a capability the source did not show does not exist**, and no page may be planned for it.

## Lens 3 — Competitors: who you are measured against

- Who the source itself names, and who the segments actually compare against — these differ more often than not.
- What changed recently: pricing, a feature that closed a gap, a new entrant.
- The counter-arguments a reader arrives with.

Every price, feature and limit must trace to a cited source or be written as an open question. Never a fabricated number. A competitor comparison built on stale facts is worse than none — see the freshness rules in `docs-analyze`.

## Monetization model — what the site has to do

Classify from real signals (pricing page, repo licence, product description), then let the classification decide the shape of the site:

| Model | What the docs must carry |
|---|---|
| Open source, no paid tier | Contribution path, install matrix, no CTA ladder |
| Free tool, paid upgrade | Clear limits of free, one honest upgrade page, upgrade CTA at the moment the limit is felt |
| Self-serve SaaS | Pricing page, plan comparison, an activation path per plan, CTA on every leaf page |
| Sales-led | Use-case and proof pages, "book a demo" as the terminal action, no invented pricing |

Guessing here is expensive: a CTA ladder on an open-source project reads as spam, and a missing one on self-serve SaaS leaves money on the table. If the signals conflict, ask.

## Call-to-action destination — read it before page one

If the project declares a single destination its docs exist to drive readers to, that destination wins over anything you would infer from the source, and it belongs in the site header as a filled button. Read it **before** the first page is written: every hero and every "Next steps" block depends on it. Discovering it after generation means rewriting every page.

## Brand signals

Collect these with their source. Record a missing one as missing — never as a guess.

| Signal | Where it comes from |
|---|---|
| Accent / theme colour | `<meta name="theme-color">`, `:root` custom properties (`--accent`, `--primary`, `--color-primary`), or the dominant non-neutral hue of the logo |
| Colour scheme | Background luminance; a theme-toggle element means prefer `system` over a pinned scheme |
| Logo vs icon | **Different fields.** The logo is the horizontal wordmark in the header; the icon is the square favicon. A favicon in the logo field hides the product name. Only a favicon and no wordmark means leave the logo empty and rely on the name plus the icon. |
| Font | Only when the site CSS explicitly names a web font |
| Social links | GitHub, X, Discord, LinkedIn, YouTube, Slack — usually in the footer markup, not the header |

Palette derivation, contrast checking and how these get applied belong to `docs-manage`. This phase only collects.

## Discovery interview — when the source cannot answer

Ask only what the source did not already tell you. One question at a time, reacting to each answer before the next. Reflect back what you heard after each block.

- **Product** — name, one-liner, source of truth, maturity (pre-launch / early / growing / scaled).
- **Goals** — onboarding, support deflection, search traffic, AI citability, sales enablement, education, developer reference, trust and compliance. Take a one-line success measure for each chosen goal, and surface the goals they did not volunteer.
- **Audience** — propose two or three roles from what you read rather than asking cold; confirm each one's entry point, current knowledge, job to be done, and what success looks like.
- **Funnels** — for each confirmed role, a 3–5 step path from entry to success. Where a top-of-funnel goal is selected, the awareness pages are about the problem space, not the product.

**These two are not report prose — they are the definitions the site gets measured by.** The goals and the funnel written here are handed to `../../docs-manage/references/goals-funnels.md` at publish and declared against the live site. Write them so that step is possible: a goal is one thing a reader does that something observable can match — a section they reach, an action they take in the page, a destination they leave for — and a funnel is those goals in the order they happen, starting broad and ending on the thing that changes revenue. A goal phrased as an internal aspiration ("build trust") cannot be declared, and a funnel starting at the index page describes a reader almost nobody is.

Cap the first plan at 5–7 P0 pages. No team ships more than that, and a plan nobody finishes is a plan nobody trusts.

## Output: `docs-plan.md`

```markdown
# Documentation plan — <product>

## Product
<one-liner, maturity, source-of-truth links, monetization model>

## Goals
- <goal> — <one-line success measure>

## Segments & funnels
### <Segment>
- Entry: …
- Funnel: Awareness → Evaluation → Activation → Retention
- Friction: …
- Pages needed:
  - <slug> — <purpose> — <goal it serves>

## Competitors
| Name | How we are compared | Fact | Source / open question |

## Information architecture
<top-level nav, one bullet per section, with the segment it serves>

## Content backlog (prioritized)
| # | Page | Type | Segment | Goal | Priority | Effort |
Priority: P0 ship first, P1 next, P2 nice to have. Effort: S / M / L.

## Brand signals
| Signal | Value | Source | or: absent |
```

Print a five-line summary to chat: the top three P0 pages and the next command.

## Enriching a private source-of-truth

When the product keeps its own knowledge base (a README plus specs tree, a product-marketing file, any markdown base), this phase may append what it learned so the next run starts from richer ground.

- **Fill explicit blanks first.** A placeholder line marked as empty is replaced with content under it — the cleanest case.
- **Append, never overwrite.** Sections with human prose get a new marked subsection beneath. Existing lines are not edited.
- **Mark every generated block** so a human can audit, trust or delete it:

  ```markdown
  <!-- BEGIN docs-create:product-audit · <lens> · <ISO-date> · evidence:<measured|mixed|simulated> -->
  … generated content …
  <!-- END docs-create:product-audit -->
  ```

- **A re-run replaces its own prior block**, matched by the marker, rather than stacking duplicates. Human prose between markers is never touched.
- Never write outside the source-of-truth directory, and never touch product code or published docs from this phase.

## Acceptance criteria for the phase

- [ ] Segments, entry paths and competitors each recorded with an evidence tier, and simulated claims labelled.
- [ ] A stated entry funnel or positioning rule, where one exists, was read first and contradicted by nothing proposed.
- [ ] Capability → job → user chain walked at least once, and every planned use-case page traces to a capability the source actually showed.
- [ ] Monetization model classified from real signals, and the site shape follows from it.
- [ ] CTA destination resolved before generation started.
- [ ] Brand signals recorded with sources, absences recorded as absences.
- [ ] Every number, price and competitor fact traces to a source or is written as an open question.
- [ ] Writes into a private source-of-truth are additive, marked, and a re-run replaced its own block.
