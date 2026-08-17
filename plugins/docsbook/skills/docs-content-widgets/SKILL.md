---
name: docs-content-widgets
description: Turn flat markdown sections into rich rendered blocks — card grids for hub pages, accordions for troubleshooting and FAQ lists — using invisible HTML-comment markers that keep the source readable as ordinary markdown on GitHub and everywhere else. Use when a page reads as a wall of links or a long stack of headed sections.
metadata:
  version: 1.0.0
  category: creation
  mode: platform
  accelerated_by:
    - docsbook-mcp      # list_content_widgets returns the live widget catalog + exact markdown contract
  uses_mcp_tools:
    - list_content_widgets
  keywords: [widgets, cards, accordion, layout, hub-page, faq, troubleshooting, presentation]
---

# docs-content-widgets — Rich Blocks Inside Markdown

## The idea

A content widget marks a region of **ordinary markdown** to be rendered as a UI block:

```markdown
<!-- widget:cards -->

## Start Here

- [Overview](./overview.md) — What this product is and why it matters {compass}
- [Getting Started](./quick-start.md) — How to begin in 3 minutes {rocket}

<!-- /widget -->
```

Two properties make this safe to use anywhere:

- **The source stays plain markdown.** HTML comments are invisible in every markdown reader — on GitHub, in an editor preview, in `cat`. A reader who never sees the rendered site still sees a correct, complete page with the same headings and the same links.
- **It degrades, never hides.** An unknown widget name, a missing closing marker, or a renderer that doesn't exist yet leaves the content as normal markdown. Nothing between the markers can ever disappear from the page.

Never put JSON, YAML, or configuration between the markers. The region must read as meaningful prose on its own — the widget is a presentation upgrade applied on top, not a data format.

## Workflow

1. **Get the live catalog.** Call `list_content_widgets` if a Docsbook MCP connection is available — it returns every widget with its exact markdown contract and a copy-pasteable example. This is the source of truth; widget names and contracts change as renderers are added. Without MCP, use the reference table below and expect it to lag.
2. **Find candidate pages.** Look for the two shapes below (*When to reach for one*). Do not scan for pages that "could look nicer" — scan for these specific structures.
3. **Check the region already reads well.** If the underlying markdown is weak — link lists with no descriptions, headings that don't say anything — fix the content first. A widget makes bad structure more visible, not less.
4. **Wrap, don't rewrite.** Add the two marker lines. Changing the words, the headings, or the link order is a separate edit with its own justification.
5. **Verify both renderings.** Confirm the page still reads correctly as raw markdown (that's what GitHub and every AI crawler see), and that the rendered block groups the content the way you intended.

## When to reach for one

| Page shape | Widget | Signal |
|---|---|---|
| A hub that points readers elsewhere | `cards` | Several `##`/`###` sections, each holding a list of links with short descriptions. Docs home pages, section landing pages, "where to go next" blocks, example galleries. |
| Long reference the reader scans | `accordion` | Many sibling headings, each independent, each with a short body. Troubleshooting lists, FAQ sections, per-option details, feature tours. |

**Do not use a widget when:**

- The page is read start-to-finish. A tutorial, a concept explainer, or a step-by-step guide loses its thread when chopped into cards or collapsed rows.
- Sections depend on each other. Collapsing step 3 of a sequence hides information the reader needs at step 4.
- There are fewer than three items. Two cards is a worse-looking list.
- The content is the page's primary substance. Never collapse what the reader came for — an accordion is for material they scan past.

## Widget reference

The MCP catalog is authoritative. This table is the offline fallback.

### `cards`

Renders link lists as a responsive grid of cards.

- Each heading becomes a small uppercase group label above its grid. Headings are optional — omit them for one ungrouped grid.
- Each list item becomes one card.
- `- [Title](/href) — Description.` → linked card: link text is the title, the text after the dash is the description.
- End an item with `{icon-name}` to give the card a Lucide icon: `- [Quickstart](/qs) — Get going fast. {rocket}`. Kebab-case Lucide names. An unknown name is dropped silently — the card renders without an icon and the braces never reach the page.
- An item without a link renders as a non-clickable card; without a dash, a title-only card.
- Paragraphs between a heading and its list pass through as intro prose.

### `accordion`

Renders headed sections as collapsible rows, all collapsed initially. Native `<details>`, so it works without JavaScript.

- Each heading becomes one row; everything under it until the next heading of the same level becomes the body.
- Any markdown works inside a row — lists, tables, code blocks with syntax highlighting.
- Content before the first heading renders above the accordion as an intro.
- Rows start closed, so headings must carry enough meaning for a reader to choose without opening them. `DNS not updating` works; `Problem 1` does not.

## Guardrails

- **Markers go on their own line**, with a blank line separating them from the content.
- **Never nest widgets.** An outer range containing another marker is left as plain markdown.
- **One widget per region.** Wrapping an entire long page in a single widget is almost always wrong — pick the section that has the right shape.
- **Do not add a widget to make a thin page look substantial.** Three links in a grid is still three links; the fix is content.
- **Check the raw markdown after editing.** If the region no longer reads correctly without the renderer, the edit went too far.

## Output

Report per page:

- Path, widget applied, and the line range wrapped.
- Which signal from *When to reach for one* matched.
- Any page you considered and rejected, with the reason — a rejected candidate is a useful finding.
