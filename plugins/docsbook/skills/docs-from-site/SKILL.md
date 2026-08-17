---
name: docs-from-site
description: Spin up a rich, conversion-grade Markdown docs site from any product website URL — even one with no existing docs. Reads the live site (rendering JS first), extracts real content, and produces a multi-section, foldered site (overview, getting-started, concepts, features, guides, use-cases, FAQ, reference) — then publishes and configures the Docsbook workspace so the first thing a new visitor sees sells the product. Use when the user provides a website URL, site URL, or pastes a link and says "from website", "import site", "from URL", "from a live site", "recreate this site's docs", "copy this link", "повтори документацию по ссылке", or "сделай доки по этому сайту".
metadata:
  version: 3.0.0
  category: creation
  mode: authoring
  requires_docsbook_mcp: false
  accelerated_by:
    - docsbook-mcp      # publish pages and apply branding/UI/nav/SEO/AI, if a Docsbook workspace is connected
  keywords: [crawl, website, site, extract, markdown, generate, website-url, from-website, site-url, url, import-site, product-site, live-site, recreate-site-docs, copy-link, повтори-документацию-по-ссылке, from-link]
---

# docs-from-site — Build a rich docs site from a product website

Goal: turn a product URL into a site that reads like **production documentation a competitor would envy** — not a flat dump of scraped pages. A new visitor who is not yet sold should land on it, understand the value in one screen, and find a clear path deeper. The bar is a foldered, benefit-first site with an FAQ and use-cases, wired into a navigation graph — not "README + one thin page".

The intelligence lives in **this skill**, not in a helper tool. Read the site yourself, decide the structure yourself, write the pages yourself, then delegate only *publishing and configuration* to whatever docs platform is connected.

---

## Why the usual crawl fails (read before you fetch)

Most modern product sites are JavaScript SPAs. A plain HTTP fetch of `/`, `/docs`, `/features`, `/blog/<slug>` returns an empty HTML shell or a 404 — the real content is behind JS render. If you fetch flat HTML and the `<main>` is thin, you will silently fall back to *inventing* generic content, which is exactly the failure mode that produces a bland site.

**So: render first.** Use a real browser (headless / automation) to load each page and read the rendered `<main>` / `<article>`. Fall back to a plain HTTP fetch only for pages that are already static (a classic server-rendered marketing page). Never write a page from a shell you could not actually read — skip it and note why.

---

## Workflow

### 1. Map the site
- Fetch `/sitemap.xml` first for the URL list. If missing, discover links from the homepage (rendered) and the header/footer nav.
- **Take the project name from the site's brand** — its `<title>` or `og:site_name`, normalized (drop taglines like " — Docs", " | Home"). Use it for the output folder and the workspace display name. Never invent a name; if the brand is unreadable, ask the user.
- **Find their existing docs — it is the best source.** Check `/docs`, `/documentation`, `/help`, `/guides`, `/api`, `/faq`, and product-relevant `/blog` guides. If the product already has a docs site (Mintlify / GitBook / Docusaurus / a `docs.*` or `help.*` subdomain), walk *its* structure — that sidebar is your ready-made folder skeleton, and mirroring it changes the job from "invent docs" to "reproduce their docs, better."

### 2. Read the real content (render, don't guess)
- Prioritize doc-relevant paths (`/docs`, `/features`, `/faq`, `/guides`, relevant `/blog`) over marketing fluff. Cap at ~50 pages; sites with hundreds of URLs are mostly blog noise.
- Hard-exclude auth/commerce paths: `/login`, `/signup`, `/auth`, `/checkout`, `/cart`.
- For each page, take the rendered `<main>` / `<article>` text (strip `<header>`, `<footer>`, `<nav>`, `<aside>` chrome) and any *explanatory* images (absolute URL, `![alt](url)`) — skip decorative ones.
- Every claim, feature, and example in the output **must** come from what you actually read. Do not invent capabilities the site does not mention.

### 3. Extract branding signals from the source
Collect (record each with its source, note any as missing — never guess):
- **Accent / theme color** — `<meta name="theme-color">`, `:root` CSS custom properties (`--accent`, `--primary`, `--color-primary`), or the dominant non-neutral hue of the logo.
- **Color scheme** — from background luminance; look for a theme-toggle element to decide between pinning the scheme or `system`.
- **Logo vs icon are DIFFERENT fields** — the logo is the horizontal wordmark banner in the header (`logo_url`); the icon is the square favicon (`icon_url`). Never put a favicon into `logo_url` — a square icon there hides the product name. If there is only a favicon and no horizontal logo, leave `logo_url` empty and rely on `custom_name` + `icon_url`.
- **Font** — only if the site CSS explicitly names a web font.
- **Social links** — GitHub, X/Twitter, Discord, LinkedIn, YouTube, Slack. These usually live in the footer, not the header — read the footer markup.

### 4. Decide the structure (dynamic, foldered — not a fixed count)
Derive the outline from what you found, then group leaf pages into **folders by meaning** so the site reads as real documentation. A flat list of 5 files does not sell; a foldered site with a sub-header does.

**Target 10–18 substantive leaf pages** (fewer only if the source genuinely has little content — a well-scoped 8-page site beats 15 stubs). Include these when the source supports them:

| Page / folder | Type | Include when |
|---|---|---|
| `README.md` / `index.md` | hero / overview | always — the selling front door |
| `getting-started.md` | tutorial | always |
| `concepts.md` or `concepts/` | explanation | always — the mental model |
| `features/<feature>.md` (3–6) | benefit-first feature pages | the site markets distinct capabilities |
| `guides/<task>.md` (2–5) | how-to | concrete tasks exist |
| `use-cases.md` or `use-cases/` (1–4) | job stories | real audiences/scenarios are visible |
| `faq.md` | 6–10 Q&A | **almost always — see AEO note below** |
| `<domain>/` (e.g. `integrations/`, `security/`, `api/`) | domain clusters | the product has these areas |
| `reference.md` or `api-reference.md` | reference (tables) | an API/CLI/config surface exists |

- **Top-level folders become the sub-header.** Group leaf pages under a handful of meaningful folders (`features/`, `guides/`, `integrations/`, …); those folder names are what the workspace expands into a navigation sub-header, which is what makes the site look "real" instead of a file dump.
- Do **not** create empty placeholder pages "for later" — only sections with real content.

### 5. Write each page — conversion-grade, apply the writing skills
Before writing, load **`docs-first-run-enrichment`** and apply it — this is mandatory, not "if you have time." It carries the auto-brand pass and the multi-section, Diátaxis-aware, link-wired generation discipline. Apply the writing conventions from `docs-content-types` (right type per page), `docs-style-tone` (tighten prose), `docs-audience` (reader fit), and `docs-seo` (rankability + AI citability) as you write — do not inline-duplicate their rules.

Non-negotiables for every page:
- **YAML frontmatter** — `title` (50–60 chars, search-intent) + `description` (130–160 chars, active voice, states the outcome). This is the base of SEO/GEO; without it pages do not rank.
- **Benefit-first headings** — the outcome the reader gets, not the feature name. The hero opens with the value proposition ("One X for every Y you use"), never "Installation".
- **Active voice, second person ("you"), imperative** for steps, present tense.
- **No filler** — never "simply", "just", "easily", "powerful", "robust", "seamless(ly)". No marketing adjectives on the hero — describe specifics.
- **Real content only** — product name, real features, real competitors. Never `example.com` or placeholder company names.

### 6. Wire the navigation graph (at generation time)
- The index/hero links to every top-level section.
- Every leaf page links back to the hero **and** to at least one sibling, with descriptive anchor text ("Read the concepts guide", not "click here").
- Zero orphan pages. Every page ends with a "Next steps" or "Related" block.
- Because pages should cross-link accurately, decide the full page list *first*, then write — so each page knows its real neighbors.

### 7. FAQ + use-cases are the highest-leverage "wow" (AEO)
An FAQ page (6–10 genuine Q&A) and use-case job stories do double duty: they answer an unsold visitor's real objections, **and** they are what the platform's AEO layer turns into `FAQPage` / `HowTo` structured data — the single strongest lever for getting cited by ChatGPT / Perplexity / Google AI Overviews. Enabling the AEO flag on prose with no Q&A/step sections adds nothing; the content and the switch go together (see `docs-seo`). This is why the FAQ page is effectively mandatory.

### 8. Preview + confirm
Print the folder tree (including folders) and excerpts from up to 3 representative pages plus the FAQ. Ask before publishing: "Does this look right? Type **yes** to publish, or describe what to change." (Auto-mode may skip the ask — see the entry-point skill.)

### 9. Publish — one atomic commit
Write **all** pages in a single publish step, not one at a time. If a Docsbook workspace is connected, create it for the source `owner/repo` and commit every file together. If your publishing path is a git host and it is authenticated, push there. If neither is available, stop cleanly with `status: crawl_only`, print the local path, and the follow-up command to publish later. Do not error.

### 10. Configure the workspace — apply the full arsenal with intent
Apply **`docs-setup-workspace`** unconditionally after a successful publish. The point is not to flip flags — it is to make the site *feel* like a product's own docs. Each setting has a purpose (only the branding/UI/navigation ones are Free; SEO/GEO/AEO/AI/languages are plan-gated — apply what the plan allows, and tell the user what the paid ones would add):
- **Branding** → the docs read as a continuation of the product, not a sandbox. Apply the accent/logo/icon/theme you collected in step 3.
- **UI settings** → production affordances: copy-page, feedback widget, breadcrumbs, on-page TOC. These are what make a site feel GitBook/Mintlify-class rather than a raw README.
- **Navigation** → sub-header from the top-level folders + social links in the header + a back-link to the source site. No dead ends.
- **SEO** → real titles/descriptions AND the flag on, so pages are actually indexable.
- **AEO / GEO** → citability in LLM answers and AI Overviews — the reason the FAQ/use-case content exists.
- **AI chat** → a live "Ask AI" over the docs removes the "go find it yourself" barrier for an unsold visitor (the strongest wow-factor of a great docs site). Derive its suggested questions from the real pages just created, never generic ones.

### 11. Final report
Print the local path, GitHub URL (if published), Docsbook site URL (if configured), page count by folder, and any sections skipped (with the reason).

---

## Guardrails

- **Render before you read.** Browser/automation first; plain HTTP fetch only for pages whose `<main>` is already populated server-side. A thin shell means skip-and-note, never invent.
- Hard-exclude auth and commerce paths from the crawl.
- Cap at ~50 pages — the rest is usually blog noise.
- The project name comes from the site brand, not a guess — ask the user if it can't be read.
- Foldered structure with a sub-header, not a flat list. Target 10–18 real pages; never pad with stubs.
- FAQ (6–10 Q&A) and at least one use-case are effectively mandatory — they are the AEO lever and the objection-killers for unsold visitors.
- `logo_url` ≠ `icon_url`. Never put a favicon in the logo field.
- Write in active voice, second person, sentence-case headings. No filler words. Tag every code block with a language. Relative links between pages.
- One atomic publish commit for all pages — not one file per commit.
- Always run `docs-setup-workspace` after publish (unless the publishing transport is unreachable) — a published-but-unconfigured site looks generic and undersells.
- Never invent competitors, glossary terms, or capabilities the source did not show. Skip a section and record the reason instead.

## Acceptance Criteria

- [ ] Site mapped from sitemap or rendered link discovery; existing docs (if any) mirrored as the skeleton
- [ ] Pages read from **rendered** `<main>`, not a JS shell; unreadable pages skipped with a reason, not invented
- [ ] Auth/commerce paths excluded
- [ ] Branding signals collected (accent, scheme, logo≠icon, font, social) with sources — or noted missing
- [ ] Structure is foldered with a sub-header; 10–18 real pages (or fewer only when the source is genuinely small), zero stubs
- [ ] `faq.md` (6–10 Q&A) and ≥1 use-case page present when the source supports them
- [ ] `docs-first-run-enrichment` applied; `docs-content-types`/`docs-style-tone`/`docs-audience`/`docs-seo` conventions applied while writing
- [ ] Every page has frontmatter (title + description); benefit-first headings; no filler
- [ ] Navigation graph wired — index→all, leaf→hero+sibling, zero orphans, descriptive anchors
- [ ] Preview (tree + excerpts incl. FAQ) printed before any publish prompt
- [ ] All pages published in one atomic commit (or `crawl_only` with local path + follow-up command)
- [ ] `docs-setup-workspace` applied with intent — branding, UI affordances, nav sub-header, and plan-gated SEO/AEO/GEO/AI where allowed
- [ ] Final report lists local path, GitHub URL, Docsbook URL, page count by folder, and skipped sections
