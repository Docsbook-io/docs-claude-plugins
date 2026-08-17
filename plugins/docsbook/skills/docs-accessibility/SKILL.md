---
name: docs-accessibility
description: Catch a11y issues in your docs before users hit them. Audits markdown for WCAG 2.1 AA violations a screen reader actually cares about — missing alt text, broken heading hierarchy, vague link anchors, captions and code-block language. Returns a prioritized fix list per page.
metadata:
  version: 1.0.0
  category: analysis
  mode: audit
  accelerated_by:
    - markdown-lsp      # semantic/graph search over the docs folder (self-hosted) — faster & cheaper than grep
    - docsbook-mcp      # same capability in the cloud if the docs live in a Docsbook workspace
  keywords: [accessibility, a11y, wcag, alt-text, headings, screen-reader]
---

# docs-accessibility — Accessibility Analysis (WCAG 2.1 AA)

## Workflow

1. **Gather the docs** — get the list of pages in scope and read their content. If a semantic/graph search tool over the markdown is available (self-hosted `markdown-lsp`, or a connected Docsbook workspace), prefer it — it's faster and cheaper than scanning files; otherwise read the files directly with `grep`/`find`. Prioritize Tier 1 pages (quick-start, pricing, auth, install) first.
2. **Apply checklist** — scan each page for the three big categories: alt text, heading hierarchy, and anchor text. Then cover lists, tables, code blocks, video, and text readability.
3. **Produce report** — return one JSON issue object per finding, sorted by severity.

## Guardrails

- Contrast ratios and runtime keyboard behavior depend on the rendered theme — these require a live browser check and are out of scope for this skill.
- This skill covers only what is detectable from markdown source.
- Do not edit any documentation files — surface findings only.
- Target WCAG 2.1 AA by default; ask before applying stricter AAA criteria.
- Empty alt (`![]()`) is correct for decorative images — flag only when the surrounding context implies the image is informative.

## Inputs

This skill needs two things, by whatever means are available:
- **The list of pages in scope** — a docs folder, a sitemap, or a doc graph.
- **The content of each page** — read on demand.

> **Acceleration (optional).** Graph/semantic search over the docs makes navigation faster and cheaper than scanning files. You can self-host it with [`markdown-lsp`](https://github.com/Docsbook-io/markdown-lsp), or get the same capability in the cloud by connecting a Docsbook workspace. With nothing connected, plain file reads and `grep`/`find` work fine.

## Checklist

### Images and Alt Text

- [ ] **All informative images have alt text** — `![alt](image.png)` not `![](image.png)`
- [ ] **Decorative images use empty alt** — `![](decoration.png)` — screen reader skips them
- [ ] **Alt does not start with "image of", "picture of", "screenshot of"** — screen readers already announce it's an image
- [ ] **Alt describes the content, not the file** — "Workspace settings with API key highlighted" not "settings.png"
- [ ] **Alt is 1-2 sentences, ≤ 125 characters** — longer descriptions go in the body text
- [ ] **Complex diagrams have a text alternative** in the body below the image
- [ ] **No critical information exists only inside an image** — text in images is not readable by screen readers

### Heading Hierarchy

- [ ] **One H1 per page** — generated from frontmatter title; do not add `# Title` in body
- [ ] **Levels are sequential** — H2 → H3 → H4, never H2 → H4
- [ ] **Sibling headings are unique** within a section
- [ ] **Headings are descriptive out of context** — a screen reader user jumping to a heading understands where they are
- [ ] **Headings are not used for visual styling** — don't use H4 just to make text smaller

### Links

- [ ] **Anchor text is meaningful out of context** — screen readers can list all links on a page
- [ ] **No "click here", "read more", "here", "this", "this link"**
- [ ] **Duplicate anchor text goes to the same destination** — two "Download" links should not go to different places
- [ ] **External links that open in a new tab are labeled** — "(opens in new tab)" or an icon with aria-label

### Lists

- [ ] **Numbered lists for sequential steps** — screen readers announce "list of 5 items, item 1..."
- [ ] **Bullet lists for unordered items** — not a paragraph with "and" connectors
- [ ] **Parallel grammatical structure** within a list

### Tables

- [ ] **Header row present** — in markdown: first row followed by `|---|` separator
- [ ] **Tables are not used for layout** — only for tabular data
- [ ] **No merged cells** — markdown tables don't support them; avoid the need for them
- [ ] **A caption or preceding paragraph** explains what the table shows

### Code Blocks

- [ ] **Language is specified** — ` ```bash `, ` ```json `, ` ```ts ` — enables screen reader context
- [ ] **Output is separated** from input in a distinct code block
- [ ] **Inline code in backticks** — not distinguished by color alone

### Video and Media

- [ ] **All videos have captions or subtitles**
- [ ] **Audio descriptions** for important visual information in videos
- [ ] **No auto-play** video or audio
- [ ] **A text alternative** exists for video content (transcript or written summary)

### Text Readability

- [ ] **Sentences under 25 words** on average
- [ ] **Paragraphs 2-4 sentences**
- [ ] **Abbreviations expanded** at first use — "MCP (Model Context Protocol)"
- [ ] **Jargon defined** inline or linked to glossary
- [ ] **No meaning conveyed by color alone** in prose — "the red fields" needs "the required fields (shown in red)"

### Markdown Hygiene

- [ ] **Use markdown syntax** instead of raw HTML where possible
- [ ] **If HTML elements are used** (e.g., `<details>`, `<summary>`), verify ARIA attributes are correct
- [ ] **Emoji are not used as functional indicators** — screen readers read emoji names aloud ("thumbs up emoji"), which disrupts flow when used as checkmarks or status icons

## What to Look For

| Severity | Problem | Detection |
|---|---|---|
| `critical` | Informative image without alt text | `![]()` pattern |
| `critical` | Multiple H1 in page body | Count `^# ` lines |
| `high` | Alt starts with "image of" / "picture of" | Regex on alt text |
| `high` | "click here" / "read more" anchor text | Grep pattern |
| `high` | Heading level skip (H2 → H4) | Parse heading sequence |
| `high` | Code block without language specifier | ` ``` ` with no language |
| `high` | Video without captions/transcript mentioned | iframe/video without caption note |
| `medium` | Generic alt: "Screenshot", "Diagram", "Image" | Regex on alt text |
| `medium` | Long paragraphs (> 6 sentences) | Sentence count |
| `medium` | Color-only meaning in prose | "red", "green" as sole indicators |
| `medium` | Table without header row | Parse table structure |
| `low` | Raw HTML used where markdown equivalent exists | `<div>`, `<span>` in content |
| `low` | Emoji used as functional indicator | Emoji at start of list items or as status |

## Output Format

```json
{
  "file": "docs/guides/setup.md",
  "line": 23,
  "severity": "critical",
  "rule": "image-missing-alt",
  "found": "Line 23: ![](screenshots/settings.png) — informative image with no alt text. Screen readers cannot describe it.",
  "suggestion": "Add descriptive alt: '![Workspace settings page with API key field highlighted at the top](screenshots/settings.png)'. If purely decorative, confirm with empty alt and no surrounding context that depends on it."
}
```

```json
{
  "file": "docs/api/errors.md",
  "line": 45,
  "severity": "medium",
  "rule": "color-only-meaning",
  "found": "Line 45: 'Red items in the log output indicate errors.' — meaning is conveyed by color only. Users with color blindness cannot distinguish them.",
  "suggestion": "Add a non-color indicator: 'Items prefixed with [ERROR] are shown in red in the log output.' or 'Error items (marked with ✕ and shown in red)...'"
}
```

```json
{
  "file": "docs/tutorials/first-deploy.md",
  "line": 67,
  "severity": "high",
  "rule": "heading-skip",
  "found": "H2 'Configuration' (line 45) is followed by H4 'Advanced options' (line 67), skipping H3. Screen reader navigation by heading becomes disorienting.",
  "suggestion": "Change H4 to H3, or add an intermediate H3 'Configuration sections' to group the content logically."
}
```

## Acceptance Criteria

- [ ] Every page in scope has been scanned — no pages silently skipped.
- [ ] All critical and high findings include a specific, actionable suggestion.
- [ ] The report distinguishes issues detectable from markdown (in scope) from runtime issues (contrast, keyboard behavior) — out of scope items are noted, not flagged as findings.
- [ ] Output is valid JSON per the format above, one object per finding.

## Related Skills

- `docs-seo` — alt text and heading hierarchy overlap with SEO
- `docs-style-tone` — plain language is also an accessibility concern
- `docs-media` — detailed media file analysis
- `docs-analyze` — orchestrator
