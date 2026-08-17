---
name: docs-structure-templates
description: Catch malformed pages before reviewers do. Checks each page for frontmatter completeness, heading hierarchy, prerequisites section, code block language tags and length — and reports issues as machine-readable JSON without editing files. Cheap, deterministic, runs on every page.
metadata:
  version: 1.0.0
  category: analysis
  mode: audit
  accelerated_by:
    - markdown-lsp      # semantic/graph search over the docs folder (self-hosted) — faster & cheaper than grep
    - docsbook-mcp      # same capability in the cloud if the docs live in a Docsbook workspace
  keywords: [structure, frontmatter, templates, headings, formatting]
---

# docs-structure-templates — Structure and Formatting Analysis

## Workflow

1. **Gather the docs** — get the list of pages in scope (with metadata) and read their frontmatter and content structure. If a semantic/graph search tool over the markdown is available (self-hosted `markdown-lsp`, or a connected Docsbook workspace), prefer it — it's faster and cheaper than scanning files; otherwise read the files directly with `grep`/`find`. Prioritize Tier 1 pages (quick-start, pricing, auth, install) first.
2. **Apply checklist** — check frontmatter fields, heading hierarchy, prerequisites and setup sections, code blocks, page length/density, and callout usage.
3. **Produce report** — return one JSON issue object per finding, sorted by severity.

## Guardrails

- Do not edit any documentation files — surface findings only.
- Confirm with the user which frontmatter fields are required for this project (some projects have custom fields beyond `title` and `description`).
- A page type determines which sections are required — don't flag a reference page for missing prerequisites.
- Do not modify the `docs-content-types` skill's output — classify page type there, not here.

## Inputs

This skill needs two things, by whatever means are available:
- **The list of pages in scope** — a docs folder, a sitemap, or a doc graph.
- **The content of each page** — read on demand.

> **Acceleration (optional).** Graph/semantic search over the docs makes navigation faster and cheaper than scanning files. You can self-host it with [`markdown-lsp`](https://github.com/Docsbook-io/markdown-lsp), or get the same capability in the cloud by connecting a Docsbook workspace. With nothing connected, plain file reads and `grep`/`find` work fine.

## Checklist

### Frontmatter

- [ ] **`title` present** — required for SEO, browser tab, and Docsbook navigation
- [ ] **`description` present** — used in SERP snippets and AI Overviews (130-160 chars)
- [ ] **Title length 50-60 characters** — longer gets truncated in search results
- [ ] **Title is search intent** — "How to set up X" not just "X"
- [ ] **Description is a complete sentence** — active voice, includes outcome
- [ ] **No duplicate titles** across pages — each page has a unique title
- [ ] **Optional: `last_reviewed`** — date for staleness tracking
- [ ] **Optional: `sidebar_position`** — for explicit ordering if needed

### Heading Hierarchy

- [ ] **One H1 per page** — generated from `title` frontmatter (do not add `# Title` in body)
- [ ] **H2 → H3 → H4 in sequence** — no skipping levels (H2 → H4 is invalid)
- [ ] **Sibling headings are unique** within a section (no two H2s with same text)
- [ ] **Headings are descriptive** out of context — a user jumping to an H2 understands where they are
- [ ] **No heading-as-decoration** — don't use H3 just to make text bigger
- [ ] **Question-style H2** for FAQs and PAA: "How does X work?" triggers People Also Ask

### Prerequisites and Setup Sections

- [ ] **Tutorial pages have a prerequisites section** before step 1
- [ ] Prerequisites list **specific versions**, not vague ("Node.js installed" → "Node.js 18+")
- [ ] **"What you'll learn"** section in tutorials — sets reader expectation
- [ ] **"What you'll need"** is at the top, not buried mid-page

### Code Blocks

- [ ] **Language is specified** on every fenced code block (` ```bash `, ` ```json `, ` ```ts `)
- [ ] **Output is separated** from input — separate code block labeled "Output" or "Result"
- [ ] **Lines are not too long** — avoid horizontal scrolling (wrap at ~100 chars)
- [ ] **Commands are complete** — reader can copy-paste and run without modification
- [ ] **Placeholder values are obvious** — `YOUR_API_KEY`, not `key123`
- [ ] **No secrets in code blocks** — use placeholder patterns, never real tokens

### Page Length and Content Density

- [ ] **Reference pages are complete** — no missing parameter entries
- [ ] **Tutorial pages are not too long** — split if over ~2000 words
- [ ] **No orphan sections** — every H2 has at least 2-3 sentences of content
- [ ] **No walls of text** — paragraphs max 4-5 sentences, then a break or list
- [ ] **Tables for comparisons** — don't describe a 5-column comparison in prose

### Notes, Warnings, and Callouts

- [ ] **Warnings precede the action** they warn about — not after the command
- [ ] **Notes are not overused** — more than 3 callouts per page = noise
- [ ] **Callout type matches content**: warning (danger), note (neutral info), tip (optional best practice)
- [ ] **No "Note:" prefix in plain text** — use a proper callout block

## What to Look For

| Severity | Problem | Detection |
|---|---|---|
| `critical` | Missing `title` in frontmatter | Check frontmatter of each page |
| `critical` | Multiple H1 in page body | Count `# ` lines in content |
| `high` | Missing `description` in frontmatter | Check frontmatter |
| `high` | Heading level skip (H2 → H4) | Parse heading sequence |
| `high` | Code block without language specifier | ` ``` ` with no language |
| `high` | Tutorial page has no prerequisites section | No "Prerequisites" or "Before you begin" heading |
| `medium` | Title over 60 characters | String length check |
| `medium` | Description over 160 characters | String length check |
| `medium` | Title is a noun label, not search intent | Title has no verb |
| `medium` | Warning appears after the action it warns about | Callout position relative to code block |
| `low` | No `last_reviewed` in frontmatter | Missing optional field |
| `low` | Placeholder values not obviously fake | `key123` instead of `YOUR_API_KEY` |

## Output Format

```json
{
  "type": "missing_frontmatter_title",
  "severity": "critical",
  "skill": "docs-structure-templates",
  "location": "docs/quick-start.md",
  "found": "No title in frontmatter. Page has no <title> tag and will not appear correctly in search results or browser tabs.",
  "suggestion": "Add to frontmatter: title: 'Get Started with Docsbook in 30 Seconds' (47 chars, includes primary keyword)",
  "action": "add_frontmatter_field",
  "constraints": {
    "field": "title",
    "max_length": 60
  }
}
```

```json
{
  "type": "heading_level_skip",
  "severity": "high",
  "skill": "docs-structure-templates",
  "location": "docs/guides/custom-domain.md#line-34",
  "found": "H2 'Configuration' (line 12) jumps directly to H4 'Advanced settings' (line 34). H3 level is skipped. Screen readers and keyboard navigation break at this point.",
  "suggestion": "Change H4 'Advanced settings' to H3, or add an intermediate H3 'Configuration options' to group the H4 sections.",
  "action": "fix_heading_level",
  "constraints": {
    "from": "h4",
    "to": "h3"
  }
}
```

```json
{
  "type": "code_block_no_language",
  "severity": "high",
  "skill": "docs-structure-templates",
  "location": "docs/api/endpoints.md#line-67",
  "found": "Fenced code block with no language specifier. Syntax highlighting is disabled; copy-paste errors are harder to spot.",
  "suggestion": "Add language specifier: change opening ``` to ```bash or ```json depending on content.",
  "action": "add_code_language",
  "constraints": {
    "options": ["bash", "json", "typescript", "python"]
  }
}
```

## Acceptance Criteria

- [ ] Every page in scope has been checked for the required frontmatter fields (confirmed with user).
- [ ] Heading hierarchy is validated for every page — skips are flagged regardless of page type.
- [ ] Code blocks without a language specifier are reported as high severity.
- [ ] Output is valid JSON per the format above, one object per finding.

## Related Skills

- `docs-content-types` — page type determines which sections are required
- `docs-seo` — frontmatter title/description overlap with SEO
- `docs-accessibility` — heading hierarchy is both structure and a11y
- `docs-analyze` — orchestrator
