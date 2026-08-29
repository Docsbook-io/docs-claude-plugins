# Audit router — which lens fires, and why that one

An audit that runs every check produces a document nobody reads. An audit that runs one check produces a confident answer to a question nobody asked. This file is the decision procedure between those two failures: given what the user asked and what evidence actually exists, which perspectives load, in what order, and where their findings merge.

It is not a menu. It is the reasoning the skill performs before it looks at a single page, and it holds three rules that every route obeys:

> **1. Route on the shape of the question and the evidence in hand — never on the topic word in it.**
> "Our SEO is bad" is not a route to an SEO lens. It is a symptom with at least four possible owners, and the word "SEO" is the least informative thing in the sentence.
>
> **2. A lens earns its load only if it can find something no already-selected lens can.**
> Every perspective declares an exclusive claim. Two lenses whose claims overlap produce the same finding twice, at two severities, and the reader trusts neither.
>
> **3. Measured beats inferred, at every level.**
> This governs which lens runs first, which finding ranks higher, and which one wins when they disagree. A page failing on real traffic outranks the best-argued opportunity, always.

## Step 0 — Is this docs-analyze's job at all?

Before routing a lens, confirm the request is analysis. The test is the verb, not the topic:

| The user is asking | Skill | Why not this one |
|---|---|---|
| What is wrong, why did it change, what should we fix first | `docs-analyze` | — |
| Write this, rewrite this, restyle this, configure the site, set up goals | `docs-manage` | It owns every writing and configuration rule; this skill decides *which* page changes, never *what it says* |
| Build docs that do not exist, migrate off another platform | `docs-create` | A page that does not exist cannot be audited |
| Make this keep happening, watch for it, alert us | `docs-automate` | A finding you keep re-finding is a monitor, not an audit |

A request that spans two runs them in order and says so. A request that spans four was not scoped — ask which one they want first.

## Step 1 — What shape is the question?

Five shapes, and each opens a different door. The shape is what the user wants to be true when the run finishes, not what they typed.

| Shape | Sounds like | Opens with |
|---|---|---|
| **Diagnostic** | "traffic dropped", "nobody converts", "why do readers leave" | Phase 1 in full. The numbers pick the lens; you do not. |
| **Triage** | "audit our docs", "what should we fix first" | Phase 1, then the two or three lenses the shortlist's dominant signals point at. |
| **Conformance** | "is our GEO set up", "check our internal linking", "are we trustworthy" | The one lens that owns it, plus phase 1 to say whether it matters here. |
| **Demand** | "what are we missing", "which pages should we write", "who else could use this" | The forward-reasoning lenses. Phase 1 only to demote anything already ranking. |
| **Expansion** | "where else could we go", "should we do vertical X" | The terminal lens, and only after its named inputs exist. |

**A conformance question with no numbers behind it is the most common misroute in this skill.** "Check our internal linking" gets answered with a graph report, the graph is fine, and the actual problem — that nobody arrives at the cluster in the first place — goes unexamined. Run phase 1 anyway, briefly, and say whether the lens they named is where their problem lives. If it is not, say that first and then answer the question they asked.

## Step 2 — What evidence exists?

Evidence gates honesty, and a lens run above its tier produces fiction with a confident tone. Establish the tier once, state it once at the top per `references/metrics.md`, and never re-raise it mid-report.

| Tier | You have | Lenses that run at full strength |
|---|---|---|
| **T3 — connected workspace + search data** | Rankings, reader behaviour, routes, failed searches, assistant questions, goals and funnels | All of them |
| **T2 — behaviour, no search data** | On-site behaviour, searches, questions; no positions or impressions | Everything except the search-position half of search-intent; semantic-seo runs corpus-internally |
| **T1 — the files only** | A docs folder, a repository, a public site | The corpus-shape and forward-reasoning lenses; anything traffic-dependent degrades or is skipped and said to be skipped |

Rule: **skip loudly, never silently.** A lens that cannot run at its tier is named once, with what it would have added, and dropped. A lens that runs anyway on data it does not have is the single most expensive failure this router prevents.

## Step 3 — The routing table

One row per perspective. `Fires when` is a condition, not a topic; if the condition is not met, the lens does not load, however relevant its name sounds.

| Perspective | Fires when | Exclusive claim — the finding only it produces | Tier |
|---|---|---|---|
| `opportunity-audit.md` (capability map, pinned) | New site, thin numbers, or a shipped capability the docs never framed as a job | A job, audience or workflow with no page at all — invisible in every number | `hypothesis` |
| `perspectives/jobs-to-be-done.md` | Readers arrive and do not commit; a job is "covered" and still does not convert | The belief a reader must hold to switch, and the earliest rung no page carries | mixed |
| `perspectives/semantic-seo.md` | Pages rank shallowly across a whole topic, or the corpus mentions a field without owning it | A concept absent from the vocabulary entirely — no page to detect it on | corpus-internal |
| `perspectives/search-intent.md` | Impressions without clicks; a page ranks and the wrong readers arrive | A page that ranks and is the wrong *shape* for the question | `measured` + manual `hypothesis` |
| `perspectives/programmatic-seo.md` | The same question repeats with one variable changed | A demand pattern only visible across a page family, never page by page | mixed |
| `perspectives/free-tools.md` | Readers ask "what will X be for my values"; pages carry manual worked examples | A need whose correct answer is a widget, not a paragraph | `hypothesis` |
| `perspectives/original-research.md` | The product generates data nobody outside can obtain | An unpublished first-party asset the company is sitting on | `capability` |
| `perspectives/geo-ai-search.md` | Assistant crawlers are reading pages, or a question is being answered without a visit | The reader who got their answer and never arrived; the structurally uncitable page | mixed |
| `perspectives/competitors.md` | Evaluation-stage readers leave; a rival is named in the request or in reader questions | What the market documents that you do not, and what you own and undersell | `hypothesis`, dated |
| `perspectives/user-language.md` | Failed searches, unanswered assistant questions, or any "we have the page and nobody finds it" | The right page, unreachable because it is in the company's words | `measured` |
| `perspectives/content-architecture.md` | The corpus grew past the tree it was designed for; readers land and cannot orient | A defect present in no single page and only visible across all of them | mixed |
| `perspectives/internal-linking.md` | Orphans, dead ends, or clusters that traffic never crosses between | Topology — islands, sinks, missing edges — that per-page link checks cannot see | mixed |
| `perspectives/eeat-trust.md` | Money, credentials or risk are involved; the docs are correct and not believed | A corpus that is factually right and still not trusted | mixed |
| `perspectives/backlinks-digital-pr.md` | Asked about authority or links; or a linkable-asset candidate surfaced elsewhere | Whether anything here is worth citing, and which earned links are being wasted | `hypothesis`, hard-capped |
| `perspectives/market-expansion.md` | Everything in the current market is understood and the question is "where next" | Which candidate market survives its gates, and what entering costs in pages | `speculative` → decision |

**Default set size is two to four.** One lens answers a conformance question. Two to four answer a triage. Five or more means the request was not scoped: say what you would cover in each of two runs and ask which comes first. A fifteen-lens run is not thorough, it is a document that gets skimmed and filed.

## Step 4 — Order

Order is not cosmetic. A lens run in the wrong position asks a question that a lens before it would have dissolved.

1. **Phase 1 first, always** — unless the tier says there are no numbers to read. It decides which lens is worth loading and demotes anything already ranking.
2. **Cheapest reframers next.** `user-language` and `search-intent` routinely turn "we need to write more" into "we need to rename three things". Running them after a content lens wastes the content lens.
3. **Corpus-shape before corpus-content.** `content-architecture` and `internal-linking` change what "missing" means. A page written into a broken tree is a page nobody reaches.
4. **Measured lenses before inferred ones.** Everything traffic-fed runs before anything reasoned forward from capabilities.
5. **`opportunity-audit` and the demand lenses after the measured work**, so their queue can be demoted against it rather than compete with it.
6. **`market-expansion` last, and only if its inputs exist.** It consumes the capability map, the audience map, the competitor matrix, the vocabulary table and the asset ranking. Run without them it is an opinion with a table around it.

## Step 5 — Merge

Lenses overlap at their edges by design; the overlaps are resolved here so a finding never appears twice.

| When two lenses touch | Owner | The other lens does this instead |
|---|---|---|
| A page is unreachable | `user-language` if the words are wrong, `internal-linking` if the edges are missing, `content-architecture` if the tree is wrong | Names the finding and cites the owner |
| A concept has no page | `semantic-seo` if it is absent from the vocabulary, `opportunity-audit` if it is a job with no page | The other cites it as input |
| A rival is involved | `external-checks.md` verifies a specific claim; `perspectives/competitors.md` reads the market position | Neither restates the other |
| Anything recurring | `docs-automate` | Every lens hands it over rather than proposing a manual re-run |

Deduplicate exactly as phase 2 already requires: one line reported once, at the higher severity, naming both lenses that found it. Then rank the merged queue by readers affected, with `measured` above `hypothesis` at equal size, and cut to what a week holds — five items is a plan, twenty is a backlog dump, and everything under the cut is one line with a count.

## Anti-patterns

These are the four misroutes that actually happen, each with what it costs:

- **Routing on the topic word.** "SEO check" loads a search lens; the real defect is that the product's own term appears nowhere readers type. Cost: a quarter of title rewrites against a vocabulary mismatch.
- **Running a demand lens because the numbers were disappointing.** Small traffic is a reason to check the tier, not a licence to reason forward. Cost: a content programme built on inference while a measured failure sits unfixed.
- **Loading every lens because the user said "full audit".** Cost: a report nobody finishes, and no queue anyone can act on.
- **Answering the named lens and nothing else.** They asked about linking; linking is fine; you say so and stop. Cost: a correct answer to the wrong question, and the reader concludes the audit found nothing.

## Guardrails

- **Never load a lens whose firing condition is unmet**, however precisely the user named it. Say why it does not apply, and route to what does.
- **Never run a lens above its evidence tier.** Degrade it or skip it, and say which, once.
- **Never let a lens's own priority score cross runs.** Scores rank hypotheses inside one lens; the merged queue ranks by readers affected across all of them.
- **Never present a routing decision as a finding.** "We chose these three lenses" belongs in one line at the top, not in the report body.
- **Never change route mid-run without saying so.** If phase 1 disproves the premise the user asked from, say that first, plainly, and then say what you ran instead.
- **The router decides nothing about content.** It selects lenses; `docs-manage` still owns every word that changes, `docs-create` every page that appears, `docs-automate` everything that recurs.

## Acceptance criteria

- [ ] The question's shape was named before any lens was loaded.
- [ ] The evidence tier was established once and stated once, with what a missing tier would have added.
- [ ] Between one and four lenses ran, each with its firing condition met and stated in one line.
- [ ] Any lens that could not run at this tier was named, with what it would have added, and skipped rather than degraded silently.
- [ ] Lenses ran in the router's order; nothing inferred ran before the measured work it should have been demoted against.
- [ ] Overlapping findings merged to one line at the higher severity, naming both lenses.
- [ ] The merged queue is ranked by readers affected, `measured` above `hypothesis`, and cut to five.
- [ ] If the user named a lens that turned out not to be where their problem lives, that was said first, and their question was still answered.
