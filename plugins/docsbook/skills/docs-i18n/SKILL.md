---
name: docs-i18n
description: Stop letting translations rot silently. Audits multilingual docs for content parity across languages, ISO 639-1 correctness, hreflang tags, navigation translation, date/number localization and out-of-date pages — across the 15 languages Docsbook supports. Skipped automatically if only one language is enabled.
metadata:
  version: 1.0.0
  category: analysis
  mode: audit
  accelerated_by:
    - markdown-lsp      # semantic/graph search over the docs folder (self-hosted) — faster & cheaper than grep
    - docsbook-mcp      # same capability in the cloud + language settings, if the docs live in a Docsbook workspace
  keywords: [i18n, translation, localization, multilingual, hreflang, languages]
---

# docs-i18n — Internationalization Analysis

## Workflow

1. **Check language setup** — find which languages are enabled and which pages exist per language. If the docs are published on a platform with language settings (e.g. a Docsbook workspace), read them from there; otherwise infer from the folder structure (e.g. `docs/en`, `docs/fr`) or frontmatter. If only one language is in scope, skip this skill entirely.
2. **Gather the docs** — get the list of pages across all languages and read their content. If a semantic/graph search tool over the markdown is available (self-hosted `markdown-lsp`, or a connected Docsbook workspace), prefer it — faster and cheaper than scanning files; otherwise read the files directly with `grep`/`find`.
3. **Apply checklist** — check language configuration, content parity by tier, navigation/UI translation, translation content rules, format localization, RTL handling, translation freshness, and SEO for multilingual.
4. **Produce report** — return one JSON issue object per finding, sorted by severity.

## Guardrails

- Do not run this skill if only one language is enabled — exit early with a note.
- Confirm the source-of-truth language (usually English) with the user before flagging parity gaps.
- Content parity is priority-based: Tier 1 pages must be translated; Tier 3 can stay English-only.
- A stale translation is worse than no translation — flag staleness even if the page exists.
- Code inside code blocks is never translated — only surrounding prose and code comments. Flag translated code as an error.
- Brand and product names (e.g., "Docsbook", "GitHub") are never translated.

## Inputs

This skill needs two things, by whatever means are available:
- **The list of pages in scope** — a docs folder, a sitemap, or a doc graph.
- **The content of each page** — read on demand.

> **Acceleration (optional).** Graph/semantic search over the docs makes navigation faster and cheaper than scanning files. You can self-host it with [`markdown-lsp`](https://github.com/Docsbook-io/markdown-lsp), or get the same capability in the cloud by connecting a Docsbook workspace. With nothing connected, plain file reads and `grep`/`find` work fine.

> Enabling/disabling languages is a publishing-platform action (e.g. Docsbook PRO); this skill only reports parity and freshness — apply language changes where you publish.

## Checklist

### Language Configuration

- [ ] **ISO 639-1 codes used** — `en`, `es`, `ru`, `zh`, `ja` — not `english`, `russian`, `spanish`
- [ ] **Regional variants use IETF tags** — `zh-CN`, `zh-TW`, `pt-BR`, `pt-PT`
- [ ] **Default language is explicitly set**
- [ ] **All enabled languages** have at least a translated home page and quick-start

### Content Parity (Priority-Based)

**Tier 1 — always translated:**
- Home / landing page
- Quick start / Getting started
- Pricing / Plans
- Authentication
- Privacy / Terms

**Tier 2 — translate when possible:**
- Top 10 pages by traffic
- Onboarding sections
- Common errors / troubleshooting

**Tier 3 — English-only is acceptable:**
- Deep API reference
- Edge-case how-to guides
- Internal changelog

Checks:
- [ ] **All Tier 1 pages translated** to every enabled language
- [ ] **Tier 1 translations are current** — not more than 30 days behind source
- [ ] **Missing translations fall back gracefully** — show source language with a banner, not a 404

### Navigation and UI

- [ ] **All sidebar/navigation labels translated** — no mixing of English labels in a non-English sidebar
- [ ] **Buttons and UI elements translated** — Search, Next, Previous, Feedback
- [ ] **Language switcher is visible** and accessible from any page
- [ ] **Auto-detection of browser language** with manual override option

### Translation Content Rules

- [ ] **Code is NOT translated** — only surrounding prose and code comments
- [ ] **Brand and product names are NOT translated** — "Docsbook", "GitHub", "Vercel"
- [ ] **Technical terms follow a consistent strategy** — either always translate or always keep in English
- [ ] **Screenshots with UI text** — either use localized screenshots or note "UI is in English"

### Format Localization

- [ ] **Dates match locale** — `DD.MM.YYYY` for RU/DE, `MM/DD/YYYY` for EN-US, `YYYY-MM-DD` for JA/ZH
- [ ] **Numbers match locale** — `1,000.50` (EN) vs `1 000,50` (RU/FR) vs `1.000,50` (DE/ES)
- [ ] **Currency placement correct** — `€100` vs `100€` depending on locale
- [ ] **Time zones specified** for time-sensitive content

### RTL Languages (Arabic)

- [ ] **`dir="rtl"`** applied on Arabic pages
- [ ] **Directional images** (arrows →) are either mirrored or direction-neutral
- [ ] **Layout is not broken** in RTL mode

### Translation Freshness

- [ ] **Translations updated within 30 days** of source page changes for Tier 1
- [ ] **Stale translations (>90 days behind)** have a "this page may be outdated" banner
- [ ] **Translation workflow is defined** — manual, AI with review, or automated

### SEO for Multilingual

- [ ] **`hreflang` tags present** for each language version
- [ ] **Self-referential `hreflang`** — Russian page includes `hreflang="ru"` pointing to itself
- [ ] **`x-default`** points to the fallback language
- [ ] **Canonical URL on the page itself** — not pointing to the English version
- [ ] **Sitemap includes all language versions**

## What to Look For

| Severity | Problem | Detection |
|---|---|---|
| `critical` | Tier 1 page missing in an enabled language | Compare page list per language |
| `critical` | Non-English sidebar shows English labels | Check navigation translation |
| `high` | Custom language code used instead of ISO 639-1 | Check `enabled_languages` config |
| `high` | Tier 1 translation more than 90 days behind source | Compare page timestamps |
| `high` | Code comments translated, breaking syntax | Scan code blocks in translations |
| `high` | Missing translation returns 404 instead of fallback | Check fallback behavior |
| `medium` | `hreflang` tags missing | Check page metadata |
| `medium` | Date format not localized | Check date patterns in content |
| `medium` | UI screenshot in non-English docs with no note | Scan image references |
| `low` | Brand name "Docsbook" translated | Grep for translations of brand |
| `low` | Too formal or too informal register for language | Manual review |

## Output Format

```json
{
  "file": "docs/ru/",
  "line": null,
  "severity": "critical",
  "rule": "missing-tier1-translation",
  "found": "Russian language is enabled, but docs/ru/quick-start.md does not exist. Tier 1 page missing for an enabled language.",
  "suggestion": "Translate docs/en/quick-start.md → docs/ru/quick-start.md. Use your translation pipeline (AI translation, a translation service, or manual) with human review. Alternative: temporarily disable Russian until the translation is ready."
}
```

```json
{
  "file": "docs/ru/pricing.md",
  "line": null,
  "severity": "high",
  "rule": "stale-translation",
  "found": "docs/en/pricing.md was updated 2026-04-10, docs/ru/pricing.md was last updated 2026-01-15 — 115 days behind. Pricing information may be wrong in the Russian version.",
  "suggestion": "Re-translate docs/ru/pricing.md from the current English source. Prices and plans are business-critical — add to automation pipeline or release checklist."
}
```

```json
{
  "file": "docs/es/api/workspaces.md",
  "line": 42,
  "severity": "high",
  "rule": "code-comment-translated",
  "found": "Line 42: JSON code block contains Spanish text in a comment position: `\"name\": \"// nombre del workspace\"` — invalid JSON.",
  "suggestion": "In JSON blocks, comments are not valid. Move the explanation to prose before or after the block. In TypeScript/Python, only translate `//` and `#` comments, never string values."
}
```

## Acceptance Criteria

- [ ] Skill exits early with a clear message if only one language is enabled.
- [ ] All Tier 1 pages are checked for presence and freshness across every enabled language.
- [ ] Any translated code blocks are flagged as high-severity errors.
- [ ] Output is valid JSON per the format above, one object per finding.

## Related Skills

- `docs-seo` — hreflang is both i18n and SEO
- `docs-maintenance` — stale translations are a maintenance issue
- `docs-navigation-linking` — translated navigation labels
- `docs-analyze` — orchestrator
