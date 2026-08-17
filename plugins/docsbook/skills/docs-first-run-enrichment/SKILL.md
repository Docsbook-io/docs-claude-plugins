---
name: docs-first-run-enrichment
description: Make a freshly-generated docs site rich and on-brand instead of a bare skeleton. Bundles two passes in sequence — (1) auto-brand from the source project's real signals (README, website theme-color, og:image, logo/favicon, repo name), and (2) enriched-structure generation that produces a multi-section site (getting-started, concepts, guides, reference, hero/landing) from audience, style-tone, content-type, and navigation heuristics. Run during first-generation, before publishing. Pair with docs-create.
metadata:
  version: 1.0.0
  category: creation
  mode: refactor
  accelerated_by:
    - docsbook-mcp      # read workspace branding & apply derived branding, if a Docsbook workspace is connected
  keywords: [first-run, branding, enrichment, multi-section, hero, auto-brand, generation, sellable]
---

# docs-first-run-enrichment — Rich + Auto-Branded First Generation

The problem this skill solves: a freshly-generated docs site produced by bare defaults looks like a skeleton — one or two thin pages, no visible brand, generic typography. This skill runs **before** the docs are published and wires two passes together so the first thing the user sees is a sellable site, not a stub.

**Pass 1 — auto-brand from the source.** Extract real brand signals from whatever the user gave as source (URL, GitHub repo, description). Apply the derived branding to the workspace if one is connected; otherwise write the values into the docs config / theme files. No invented colors.

**Pass 2 — enriched structure generation.** Decide on a multi-section outline derived from what the crawl found, then generate each section with the right content type (Diátaxis-aware), audience fit, style/tone, and navigation links wired between pages.

---

## When to use this skill

Load it automatically during first-time docs generation:
- The user gave a GitHub repo URL, a website URL, or a product description.
- The docs have not been published yet for this workspace.
- auto-mode is ON or the user chose this skill from the skill-selection question.

Skip it (or skip Pass 1 only) when:
- The workspace already has human-set branding — do not overwrite it.
- A second or later generation run (enrichment is additive, not restorative).
- The user explicitly said "skip branding" or "minimal / bare output".

---

## Pass 1 — Auto-brand from the source

### 1.1 Collect brand signals

Gather these in order; stop once you have enough (anchor color + name):

| Source | What to pull | How |
|---|---|---|
| Source **website URL** | `theme-color` meta, `og:image`, `<title>` / `og:site_name`, favicon `href` | Fetch the product's website and extract these branding signals |
| **GitHub repo** | README brand mentions (hex codes, "our teal/blue/…"), `package.json` `name` + `description`, social preview image | Read the repo's README and metadata for brand signals (file read / GitHub API) |
| Workspace **current branding** | `accent_color`, `logo_url`, `icon_url`, `custom_name` — anything already set by a human | Read current workspace branding, if a Docsbook workspace is connected |
| **Logo/icon URL** | Dominant non-neutral color | Describe by hex from the visible hue if the URL is an SVG/PNG you can read |

Record every signal with its source string. A missing signal is noted as missing — never filled with a guess.

### 1.2 Derive the palette (one pass, no ask)

On first-run, apply the best available palette silently (no `ask_user`). The user will see the result immediately; they can refine it after. Follow the methodology from `docs-branding`:

1. **Anchor color** = site `theme-color` → logo dominant color → README hex → none (skip color update if no signal).
2. **Light-mode accent** = anchor color, sanity-checked for WCAG 2.1 AA (≥ 4.5:1 against white). If it fails, lighten the lightness until it passes; keep the hue.
3. **Muted companion** = same hue, saturation dropped to ~20 %, lightness pushed toward the background. Not a second accent.
4. **Dark-mode accent** = anchor with lightness raised to stay legible on near-black (target 4.5:1 against `#0b0d10`).
5. **Foreground / background** = `#111827` / `#ffffff` light; `#e5e7eb` / `#0b0d10` dark — unless the brand uses a tinted surface.
6. **Font** = leave unchanged unless the repo README or website CSS explicitly names a Google Font.
7. **custom_name** = site brand name → GitHub repo name (the part after `/`). Only set if not already set.

Apply the derived branding to the workspace (if a Docsbook workspace is connected); otherwise write the derived fields into the docs config / theme files. Echo what was set and from which signal.

### 1.3 Logo / favicon

If `og:image` or a favicon URL was found during the crawl:
- Set `icon_url` to the favicon URL (prefer a 32×32 or 64×64 `.png` over `.ico`).
- Set `logo_url` to `og:image` only if it looks like a product logo (not a screenshot or card image — heuristic: ≤ 512 px tall, no text overlay detected).

If neither is available, skip — do not fabricate URLs.

---

## Pass 2 — Enriched multi-section structure

### 2.1 Decide the section outline

Before generating any pages, check whether the project already declares a **Call To Action URL** — the one page these docs are meant to drive readers to (on Docsbook it is the workspace's Call To Action URL, set from the Branding tab or during onboarding, and it comes back with the workspace's configuration). If it is set, it is the destination for the site's conversion actions, it overrides any CTA you would otherwise infer from the crawl, and it belongs in the header as a filled button (`update_navigation` `header_links` with `color`). `docs-sales-conversion` Step 0 is the full rule; the point here is to read it **before** the first page is written, not after, since every hero and every "Next steps" section below depends on it.

Then derive the structure from what the crawl returned:

| Signal | Sections to include |
|---|---|
| GitHub repo with README + source code | Hero, Getting Started, Core Concepts, `guides/` (2–5), `features/` (3–6), `use-cases`, `faq`, API Reference |
| Website with marketing copy | Hero, Getting Started, Core Concepts, `features/` (3–6), `guides/` (2–5), `use-cases` (1–4), `faq` |
| Plain description / idea only | Hero, Getting Started, Core Concepts, `features/` (3–5), `use-cases` (1–3), `faq` |
| Existing docs site (Mintlify, GitBook, etc.) | Mirror the source structure (its folders → sub-header); add missing Diátaxis types + `faq`/`use-cases` if absent |

**Target for a "sellable" first generation — a foldered, multi-section site, not a flat handful of pages.** Aim for **10–18 substantive leaf pages grouped into folders** when the source supports it; scale down only when the source genuinely has little content (a well-scoped 8-page site beats 15 stubs, and 3 solid pages beat 5 thin ones). Include:

- **index.md / README.md** — hero / overview: value-prop sentence, quick-start CTA, 3-column feature highlights *(always)*
- **getting-started.md** — tutorial: prerequisites, install/setup steps, first "hello world" moment *(always)*
- **concepts.md** or `concepts/` — explanation: what the product is, key mental models, how the pieces fit *(always)*
- `features/<feature>.md` (3–6) — benefit-first feature pages, one per real marketed capability
- `guides/<topic>.md` (2–5) — how-to: concrete, outcome-oriented tasks
- **use-cases.md** or `use-cases/` (1–4) — job stories: "X uses this to do Y, getting Z"
- **faq.md** — 6–10 real Q&A that kill an unsold visitor's objections *(effectively always — it is also the AEO lever, see 2.5)*
- `<domain>/` folders (e.g. `integrations/`, `security/`, `api/`) — cluster pages where the product has these areas
- **reference.md** / `api-reference.md` — reference tables *(if an API/CLI/config surface exists)*

**Folders are the point.** Group leaf pages under a handful of meaningful top-level folders — those folder names are what the workspace expands into a navigation **sub-header**, which is what makes the site read as real documentation instead of a file dump. A flat list of 5 files does not sell.

Do NOT generate a section if the crawl found no relevant content for it, and never pad with empty placeholder pages "for later" — only sections backed by real content.

### 2.2 Generate each section with Diátaxis discipline

For every page, follow the content-type rule for that section:

**Hero / index page (not a pure Diátaxis type — landing)**
- Opening sentence: product name + one-line value prop derived from the crawl (not invented).
- 3-column feature highlights: each feature is a real detected capability, not a generic placeholder.
- "Get started in 5 minutes" CTA linking to getting-started.md — and, when the project has a Call To Action URL, one conversion action pointing there too (the reader who is evaluating rather than installing needs somewhere to go).
- No marketing adjectives ("powerful", "robust", "seamlessly") — describe specifics.

**Getting Started (tutorial)**
- Prerequisites section at the top with specific versions.
- Numbered steps; every step has a command or a UI action + its expected output.
- "What you'll learn" header before step 1.
- Ends with a "Next steps" section linking to concepts.md and the first guide.

**Concepts / Core Concepts (explanation)**
- No steps, no commands — pure explanation of the mental model.
- Headers are noun phrases, not imperatives.
- Ends with links to the relevant how-to guides.

**Guide (how-to)**
- Goal stated in the title: "How to [do X]".
- Numbered steps, goal-first.
- No background theory — link to concepts for that.
- Ends with "Related: [concept page], [next guide]".

**Reference (reference)**
- Tabular: command / endpoint / parameter → description → example.
- Present tense, no narrative prose.

**Feature page (benefit-first, one per real capability)**
- Headline = the outcome the reader gets, not the feature name ("Never lose context between tools", not "Sync engine").
- Body = how it works + one piece of proof/example pulled from the source.
- Ends with a CTA to getting-started or the related guide.

**Use-case page (job story)**
- Framed as a concrete scenario: who, the job to be done, the outcome ("A solo founder uses X to Y, so that Z").
- Grounded in a real audience the source addresses — never a fabricated persona.

**FAQ (`faq.md`)**
- 6–10 genuine questions an evaluating visitor actually asks (pricing model, limits, privacy, supported tools, how it differs from alternative) — each a short H2 question + a direct answer.
- Answers eliminate objections; keep them concrete, no hedging.

### 2.3 Style and tone pass (inline, not a separate step)

Apply while writing each page:
- Active voice, second person ("you"), imperative for instructions.
- No filler: no "simply", "just", "easily", "powerful", "robust".
- Consistent terminology: if the product calls it a "workspace" in the README, call it a "workspace" in every page — never "project", "space", or "repo" interchangeably.
- Each page has YAML frontmatter: `title` (50–60 chars, search-intent), `description` (130–160 chars, active voice, includes outcome).

### 2.4 Navigation links (wired at generation time)

Every page must:
- Link to at least one other page in the site (no orphans).
- Have a "Next steps" or "Related" section at the bottom.
- Use descriptive anchor text ("Read the concepts guide" not "click here").

The index / hero page links to every section. Every leaf page links back to the hero and to at least one sibling. Top-level folders map to the navigation sub-header — so the folder split *is* part of the navigation design, not just file layout.

### 2.5 Why FAQ + use-cases matter twice (AEO)

The FAQ and use-case pages are not filler — they carry the most citable structure on the site. When the platform's AEO layer is on, it turns Q&A into `FAQPage` and numbered procedures into `HowTo` structured data, which is exactly what ChatGPT / Perplexity / Google AI Overviews lift into their answers. Enabling the AEO flag on prose with no Q&A/step sections produces nothing — so the FAQ content and the switch go together (the workspace configurator flips the flag; this pass writes the content it needs). That is why `faq.md` is effectively mandatory even when the source has no explicit FAQ — synthesize it from what the product clearly answers.

---

## Guardrails

- **Never invent brand colors, logos, or product names.** If no signal exists, skip that field.
- **Never overwrite human-set branding** already on the workspace. Read the current workspace branding first (if a workspace is connected); if `accent_color` is already set (non-null, non-default `#000000`), skip the color update and say so.
- **Never generate placeholder content** ("Lorem ipsum", "Company Name", "Add description here"). Every sentence must come from or be derivable from the crawled content. If the crawl was too thin to write a page, skip that page and note it.
- **First-run only.** This skill applies to brand-new workspaces or first-time generation. Do not re-apply Pass 1 (branding) on a subsequent run unless the user explicitly asks for a re-brand.
- **No `ask_user` in Pass 1 or Pass 2** on the auto-mode path. The whole point is silent enrichment that shows results without asking. If auto-mode is OFF, surface a single summary ask_user at the end: "I've applied these branding values and generated a foldered N-page site (features, guides, use-cases, FAQ) — approve to commit or adjust first?"
- **Do not fail the pipeline** if a signal is missing. A missing logo URL means no `icon_url` update, not an error. Missing anchor color means color update is skipped, not an error.

---

## Inputs

- **Branding signals** — derive them: fetch the product site (theme color, og:image, logo) and read the repo's README/metadata. Do not invent values.
- **Current workspace branding** — read it if a workspace is connected, to avoid overwriting what the user set.

> **Acceleration (optional).** If a Docsbook workspace is connected, the derived branding can be applied to it directly. Without it, write the values into your docs config / theme files.

---

## Output contract

After running both passes, report in a single message:

```
Auto-brand applied:
  • custom_name: <value> (from <source>)
  • accent_color: <hex> (from <source>, WCAG ratio <n>:1 ✓)
  • muted_color: <hex>
  • icon_url: <url> (from <source>) [or: skipped — no favicon found]
  • logo_url: <url> [or: skipped]

Generated structure (foldered — folders become the nav sub-header):
  • index.md — hero/overview
  • getting-started.md — tutorial (N steps)
  • concepts.md — explanation
  • features/<feature>.md ×K — benefit-first
  • guides/<topic>.md ×K — how-to
  • use-cases.md — job stories
  • faq.md — N Q&A (feeds FAQPage/AEO)
  • reference.md — reference [if API/CLI]
  [list every page with type + line count; total N pages across M folders]

Ready to commit. [If auto-mode OFF: approve or adjust before committing.]
```

---

## Related Skills

- `docs-branding` — interactive branding with user confirmation; use when refining brand AFTER first generation
- `docs-create` — full end-to-end pipeline; this skill is the enrichment + branding layer inside it
- `docs-structure-templates` — audit structure AFTER generation
- `docs-style-tone` — audit prose AFTER generation
- `docs-content-types` — audit Diátaxis classification AFTER generation
- `docs-navigation-linking` — audit link graph AFTER generation
