# Structure — deciding the page set before writing a page

## The page set

Derive it from what the source actually offered. Include a row only when there is real content behind it.

| Page / folder | Type | Include when |
|---|---|---|
| `README.md` / `index.md` | hero / overview | always — the selling front door |
| `getting-started.md` | tutorial | always |
| `concepts.md` or `concepts/` | explanation | always — the mental model |
| `features/<feature>.md` (3–6) | benefit-first feature page | the source markets distinct capabilities |
| `guides/<task>.md` (2–5) | how-to | concrete tasks exist |
| `use-cases.md` or `use-cases/` (1–4) | job stories | real audiences or scenarios are visible |
| `faq.md` | 6–10 Q&A | almost always — see AEO below |
| `<domain>/` (`integrations/`, `security/`, `api/`) | cluster | the product has that area |
| `reference.md` / `api-reference.md` | reference | an API, CLI or config surface exists |

Starting points by source shape:

| Source | Sections |
|---|---|
| Repo with README + code | hero, getting-started, concepts, `guides/`, `features/`, use-cases, faq, API reference |
| Marketing website | hero, getting-started, concepts, `features/`, `guides/`, use-cases, faq |
| Idea or description only | hero, getting-started, concepts, `features/`, use-cases, faq |
| Existing docs site | mirror its structure; add the missing page types and faq/use-cases if absent |

**Target 10–18 substantive leaf pages** where the source supports it. Scale down for genuinely thin sources — a well-scoped 8-page site beats 15 stubs. Never pad with empty placeholders.

## Folders are the navigation

Group leaf pages under a handful of meaningful top-level folders. Those folder names are what the platform expands into a navigation sub-header, and that sub-header is what makes a site read as documentation rather than a file listing. A flat list of five files does not sell, however good each file is.

## Optional enrichment sections

Offer these once, as a multi-select, before the crawl. Skipping is a valid answer. Each produces 3–5 pages.

| Section | What it is | Why it earns its place |
|---|---|---|
| `competitor-vs` | `blog/<you>-vs-<competitor>.md` | "X vs Y" and "X alternative" are the highest-intent searches in the category |
| `educational` | `learn/` cluster teaching the domain, not the product | Top-of-funnel, with a soft action at the end; the strongest citation candidate |
| `glossary-usecases` | `glossary/` for "what is <term>"; `use-cases/` per persona | Definition pages win featured snippets; use-case pages convert better than feature pages |
| `migration` | `migrate-from-<competitor>.md` | Captures readers actively leaving a competitor |

If `competitor-vs` or `migration` is chosen, confirm the competitor list — auto-detected from the source, with the user free to add or remove. Never fabricate a competitor or a glossary term: no evidence means skip the section and record the reason. Enrichment failing never blocks the publish; the core docs still ship.

## What each page type must be

The full rulebook lives in `docs-manage`. This is the per-section shape the generator commits to:

**Hero / index** — opens with the product name and a one-line value proposition taken from the source. Three feature highlights, each a real detected capability. A "get started" action, plus one conversion action pointing at the CTA destination for the reader who is evaluating rather than installing. No marketing adjectives; describe specifics.

**Getting started (tutorial)** — prerequisites with specific versions at the top, a "what you'll learn" line before step 1, numbered steps where every step has a command or UI action *and* its expected output, ending in "Next steps" linking to concepts and the first guide.

**Concepts (explanation)** — no steps, no commands. Noun-phrase headings. Ends with links to the how-to guides that use these ideas.

**Guide (how-to)** — the goal in the title, numbered steps, goal-first. No background theory; link to concepts for that. Ends with "Related".

**Reference** — tabular. Command / endpoint / parameter → description → example. Present tense, no narrative.

**Feature page** — the headline is the outcome the reader gets, not the feature name ("Never lose context between tools", not "Sync engine"). Body is how it works plus one piece of proof from the source. Ends with an action.

**Use-case page** — a concrete job story: who, the job to be done, the outcome. Grounded in an audience the source actually addresses.

**FAQ** — 6–10 questions an evaluating reader genuinely asks: pricing model, limits, privacy, supported tools, how it differs from the alternative. Each an H2 question with a direct answer. Answers eliminate objections and do not hedge.

## The link graph, wired at generation time

- The index links to every top-level section.
- Every leaf page links back to the hero **and** to at least one sibling.
- Zero orphans. Every page ends with "Next steps" or "Related".
- Descriptive anchor text — "Read the concepts guide", never "click here".

This is why the full page list is decided before the first page is written: a page can only link to a neighbour it knows exists.

## Why FAQ and use-cases count twice (AEO)

The FAQ and use-case pages carry the most citable structure on the site. A platform's answer-engine layer turns Q&A into `FAQPage` and numbered procedures into `HowTo` structured data — exactly what assistants and AI search results lift into their answers. Flipping that switch on prose with no Q&A and no step sections produces nothing: the content and the setting go together. That is why `faq.md` is effectively mandatory even when the source has no explicit FAQ — synthesise it from what the product plainly answers, and never from what it does not.
