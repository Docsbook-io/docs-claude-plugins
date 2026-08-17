---
name: docs-sales-conversion
description: Make generated documentation sell instead of merely inform. Classifies the product's monetization model from real signals (crawled pricing page, repo, description), then applies the matching conversion pattern — a pricing page and plan-comparison table when the product charges, a persistent "start free" CTA ladder when the funnel opens with free access, a self-host-vs-cloud split for open-source products. Every page gets a next action; no page dead-ends. Use during first generation and whenever docs read informative but never ask for the sale.
metadata:
  version: 1.0.0
  category: creation
  mode: refactor
  accelerated_by:
    - docsbook-mcp      # live widget contracts; the workspace's existing branding and links
  uses_mcp_tools:
    - list_content_widgets
  keywords: [sales, conversion, cta, pricing, funnel, monetization, plans, free-tier, upgrade, trial]
---

# docs-sales-conversion — Docs That Ask for the Sale

Documentation is the highest-intent surface a product has: the visitor reading it is already trying to succeed with the product. Most generated docs waste that — they explain the product perfectly and never tell the reader what to do next, never name the price, never mention that there is a free tier at all.

This skill fixes that in one pass. It is a **content** skill: it decides which pages exist, what each page's closing action is, and how the money story is told. It never invents prices, plans, or limits.

---

## Step 0 — Read the CTA the owner already set (do this first)

Before classifying anything, ask the platform whether this project already has a declared call to action. On Docsbook that is the **Call To Action URL** (Branding tab) — it comes back with the workspace's configuration, and is saved by `update_branding(cta_url: …)`. Any other platform: whatever field records "the page this documentation should drive readers to".

**When it is set, it wins over anything you infer.** The owner typed it; a `/pricing` page you found by crawling is a guess about their funnel, and their answer is not. Concretely:

- Every page's primary CTA points **there**, unless a page has an obviously better-matching destination already observed on the source (a docs-internal next step, an install command for an OSS install page).
- The classification in Step 1 still runs — the CTA tells you *where* to send the reader, not *how* the product makes money — but a CTA whose URL is a pricing/plans page is itself a strong `paid` or `free_first` signal, and one pointing at a demo/contact form is a strong `sales_led` signal.
- It belongs in the **header as a button**, not only in the prose: on Docsbook, `update_navigation` with a `header_links` entry whose `color` is the workspace accent renders it as a filled button. One such entry, not several — a header with three buttons has no CTA.
- Do not restate it on every page or in every paragraph. One deliberate placement per page, at the point where the reader has just gotten what they came for.

**When it is not set**, derive the CTA from the source as Steps 1-3 describe, and — if the derivation is unambiguous (a single obvious pricing/signup/demo URL observed on the source) — **save it back** with `update_branding(cta_url: …)` so the chat, the header and later generations all use the same destination. If it is ambiguous, ask the owner rather than guessing; a wrong CTA saved as the project's goal is worse than an empty field.

---

## Step 1 — Classify the monetization model

Before writing a single page, decide which of four models the product runs on. Derive it from real signals only:

| Signal to look for | Where |
|---|---|
| A `/pricing`, `/plans`, `/#pricing` page or nav link | crawled site, sitemap, nav links |
| Currency amounts, `/mo`, `/year`, "per seat", "per user" | crawled page text |
| "Free plan", "Free tier", "Start free", "No credit card" | crawled page text, hero CTA |
| "Get a demo", "Contact sales", "Talk to us", "Book a call" | primary CTA text |
| An OSS licence + install command, no payment surface anywhere | repo, README |
| "Cloud" / "Managed" / "Enterprise" next to a self-host guide | site nav, README |

Then pick exactly one:

| Model | Recognized by | Conversion job |
|---|---|---|
| `paid` | Visible prices/plans, purchase or trial CTA | Make the price legible and the plan choice obvious |
| `free_first` | Free plan / free tier / "start free" is the primary entry, paid tiers exist or are implied | Get the reader to start now; place the upgrade trigger where the limit is felt |
| `open_source` | Install/self-host is the primary path; managed/cloud offer may exist | Reduce install friction, then present cloud as the "when you outgrow this" option |
| `sales_led` | No public prices; "contact sales" / "book a demo" is the only CTA | Qualify and route to the demo, never fabricate a price |

**If the signals are ambiguous or absent, choose `free_first`** — it is the only model whose pattern (a clear next action on every page) is safe when the money story is unknown, because it never states a price.

Record the classification and the signal it came from. State it in the output summary — a wrong guess must be visible and correctable, not silent.

---

## Step 2 — Apply the pattern for that model

### `paid` — the price must be findable in one click

- Generate a **`pricing.md`** page. It contains a plan-comparison table (plan | price | what it's for | key limits) built **only** from prices found on the source. If a plan's price was not found, write `Contact sales` — never a guessed number.
- The hero page states the entry price or the free-trial terms in the first screen of text.
- `faq.md` must answer, in this order: what does it cost, is there a free trial, what happens when I hit a limit, can I cancel, what counts as a seat/unit.
- Every feature page names which plan the feature is on, when that is known from the source.

### `free_first` — the CTA ladder

- Every page ends with an action, and the action escalates with reader intent:
  - Hero / concepts → **"Start free — no credit card"**
  - Getting started / guides → **"Create your first <primary object>"**
  - Feature pages → **"Try <feature> on the free plan"**
  - Use-cases → **"Start with the <matching-use-case> setup"**
- Name the free tier's real limits where the source states them. A limit is the upgrade trigger — mention it where the reader would hit it (in the guide that uses the quota), not only on a pricing page.
- Generate `pricing.md` **only if** the source exposes paid tiers. Otherwise fold the money question into `faq.md` ("Is it free?" answered honestly from the source).

### `open_source` — friction first, cloud second

- The hero's primary CTA is the install command; the secondary is the hosted/cloud offer, when one exists.
- Generate `guides/self-hosting.md` when the source documents deployment.
- Add a "Self-host vs Cloud" comparison table (who each is for, what you operate yourself, what's included) — only from what the source states.
- Never push the paid cloud in a tutorial. The conversion happens on the comparison and in the FAQ.

### `sales_led` — qualify, then route

- Primary CTA everywhere: **"Book a demo"** / **"Talk to sales"** — matching the wording the source itself uses.
- `use-cases.md` carries the weight: each job story ends with the demo CTA framed for that segment.
- `faq.md` answers procurement questions the source supports: security, SSO, data residency, onboarding, support SLA. Never invent an answer — omit the question instead.
- Never state or approximate a price. "Pricing depends on team size — talk to sales" is the honest answer.

---

## Step 3 — Rules that hold for every model

1. **No dead ends.** Every page closes with a `## Next steps` or `## Related` section containing at least one internal link and, on evaluation-stage pages (hero, features, use-cases, pricing, FAQ), one conversion action.
2. **One primary CTA per page.** A page with three competing asks converts worse than one with a single clear one. Secondary links go in `Next steps`, not as buttons.
3. **Benefit before mechanism.** A feature page headline is the outcome ("Ship docs without a deploy step"), not the component name ("Sync engine").
4. **Objections belong in the FAQ, answered flatly.** No hedging, no "it depends" without the following sentence saying what it depends on.
5. **Never fabricate commercial facts.** Prices, plan names, limits, SLAs, customer names, logos, and counts come from the source or do not appear. A missing price is `Contact sales`; a missing customer story is an omitted section.
6. **No hype adjectives.** "powerful", "seamless", "robust", "revolutionary", "simply", "just", "easily" — cut. Specifics convert; adjectives don't.
7. **The CTA links somewhere real.** Use a URL found on the source (its signup/pricing/demo page) or an internal doc path. Never invent a route like `/signup` that was not observed.

---

## Step 4 — Pages this adds to a generated site

On top of the standard structure (see `docs-first-run-enrichment`), this skill contributes:

| Page | When | Content |
|---|---|---|
| `pricing.md` | `paid` always; `free_first` if paid tiers exist | Plan comparison table + what to pick + upgrade/downgrade rules |
| `use-cases.md` | always | Job stories, each ending in the model's CTA |
| `faq.md` | always | Objection-killers ordered by how early they block a purchase |
| `guides/self-hosting.md` | `open_source` with deployment docs | Install path, then the cloud comparison |

---

## Step 5 — Render the money pages as widgets

Conversion pages are scanned, not read. Where the platform supports content widgets (`docs-content-widgets`), wrap:

- the plan comparison in a `cards` grid when plans are few and each needs a one-line pitch;
- the FAQ in an `accordion` so an evaluating reader scans questions and opens only theirs;
- the getting-started path in a `stepper` so "how long until value" is visually countable.

The markdown between the markers must read correctly on its own — the widget is presentation, never data.

---

## Step 6 — Three traps that look solved but aren't

These come from a real run against a product whose prices are public, where every rule above was already in place and the docs still shipped wrong numbers.

**The pricing page is not where the crawler goes.** It is routinely absent from a sitemap index (which lists `blog/`, `docs/`, `legal/` and not `/pricing`), and a breadth-first crawl with a page budget fills up with blog posts before reaching it. Request `/pricing` and `/plans` explicitly instead of hoping to discover them, and read them before anything else.

**Reading the pricing page is not the same as reading its prices.** The per-plan table is usually the *last* thing in the document, behind a volume slider and a feature-comparison matrix; the first currency amount on the page is typically an add-on, thousands of characters earlier. If you excerpt or summarize the page, anchor on the last amount, not the first, and confirm you can see every plan's number before writing a table. A page you fetched but whose prices you never saw looks exactly like a page with no prices — and produces a confident "Contact sales" for a product that publishes a price.

**"No facts observed" is when invention is most likely, not least.** With nothing to copy, a page brief that asks about pricing and limits reads as permission to answer from general knowledge, and the number that comes out is plausible and wrong (a free tier stated as 1,000/month when it is 3,000/month). When no figures were observed, the rule must be absolute: no price, no quota, no seat count, no trial length — describe the shape of the offer and link to the product's pricing page.

**A copied CTA link is usually a broken one.** `[Get started](/signup)` is correct on the product's own site and a 404 in docs served from another domain. Rewrite root-relative product paths onto the source's origin, and leave internal doc links and anchors alone.

---

## Guardrails

- **This skill never edits product code, pricing config, or billing.** It writes documentation content only.
- **It never states a price that was not observed on the source.**
- **It does not add a CTA to reference pages** (API tables, config options). A reader deep in reference does not want a pitch; give them `Related` links instead.
- **It does not turn a tutorial into a landing page.** Conversion pressure belongs on evaluation-stage pages; tutorials convert by working.
- If the classification is `sales_led` but the source clearly shows self-serve signup, prefer `free_first` — the observable path beats the stated one.

---

## Output contract

Report in one message:

```
Monetization model: <paid|free_first|open_source|sales_led> (signal: <what proved it>)
Primary CTA: "<text>" → <url or internal path>
Conversion pages: pricing.md [or: skipped — no prices on source], use-cases.md, faq.md, ...
Per-page closing actions: <page> → <CTA>, ...
Not stated (no source signal): <prices|limits|SLA|...>
```

---

## Related Skills

- `docs-first-run-enrichment` — structure + branding for a first generation; this skill layers the money story onto it
- `docs-content-widgets` — how to render the pricing/FAQ regions as blocks
- `docs-audience` — who the reader is; a CTA aimed at the wrong reader is worse than none
- `docs-seo` — the FAQ this skill writes is also the AEO surface
- `docs-style-tone` — the no-hype prose rules this skill depends on
