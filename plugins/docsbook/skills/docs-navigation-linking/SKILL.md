---
name: docs-navigation-linking
description: Fix the dead ends and orphan pages in your docs. Walks the full doc graph to find broken internal links, pages nothing links to, generic anchor text ("click here"), over-deep hierarchies and missing next-step links between related pages. Cross-file — requires the whole graph, not one page.
metadata:
  version: 1.0.0
  category: analysis
  mode: audit
  accelerated_by:
    - markdown-lsp      # semantic/graph search over the docs folder (self-hosted) — faster & cheaper than grep
    - docsbook-mcp      # same capability in the cloud if the docs live in a Docsbook workspace
  keywords: [navigation, links, orphan, broken-links, anchor, hierarchy]
---

# docs-navigation-linking — Navigation and Linking Analysis

## Workflow

1. **Gather the docs** — get the list of pages in scope and read their content. If a semantic/graph search tool over the markdown is available (self-hosted `markdown-lsp`, or a connected Docsbook workspace), prefer it — faster and cheaper than scanning files; otherwise read the files directly with `grep`/`find`. Prioritize Tier 1 pages (quick-start, pricing, auth, install) first. This skill requires the full doc graph — do not run on a single page in isolation.
2. **Build link sets** — extract all `href` values from every page; compare to the full page list to identify orphans and broken links.
3. **Apply checklist** — check internal links, orphan pages, anchor text quality, navigation hierarchy, next steps / cross-references, and external links.
4. **Produce report** — return one JSON issue object per finding, sorted by severity.

> **The JSON is a machine format, not an answer.** It exists so an orchestrator (`docs-analyze`) or a host application can consume the findings — the `action` and `constraints` fields are instructions for a tool, not prose for a person. NEVER paste this JSON into a chat reply or hand it to a human as "the report": a wall of `"severity": "high"` reads as a system error and buries the one line that mattered. When a person asked for the audit, present the findings the way a human editor would — the worst problem first, named in plain language, with the before/after — and offer to apply the fixes. If your host has a way to render changes for approval (a diff or review UI, e.g. Docsbook's `propose_changes`), that is the answer; the JSON stays under it.

## Guardrails

- Do not edit any documentation files — surface findings only.
- This skill is cross-file: orphan detection requires the full graph. Never run on a single page in isolation.
- The root index/home page is expected to have no inbound links from docs — exclude it from orphan detection.
- Checking external link validity requires HTTP requests — ask the user before making outbound calls.
- Confirm Tier 1 pages with the user before flagging navigation accessibility as medium vs. high severity.

## Inputs

This skill needs two things, by whatever means are available:
- **The list of pages in scope** — a docs folder, a sitemap, or a doc graph.
- **The content of each page** — read on demand.

> **Acceleration (optional).** Graph/semantic search over the docs makes navigation faster and cheaper than scanning files. You can self-host it with [`markdown-lsp`](https://github.com/Docsbook-io/markdown-lsp), or get the same capability in the cloud by connecting a Docsbook workspace. With nothing connected, plain file reads and `grep`/`find` work fine.

## Checklist

### Internal Links

- [ ] **All referenced pages exist** in the doc graph — no broken internal links
- [ ] **Relative paths are consistent** — avoid mixing `/docs/` absolute paths with `../` relative paths
- [ ] **Anchor links (`#section`) resolve** — the heading they target exists on the page
- [ ] **Linked pages are relevant** — links add value, not just bulk

### Orphan Pages

- [ ] **Every page has at least one inbound link** from another doc page
- [ ] **Exception:** root index/home page (expected to have no inbound from docs)
- [ ] **Orphan detection:** pull all `href` values from every page, compare to full page list

### Anchor Text Quality

- [ ] **No "click here"**, "read more", "here", "this link", "this page"
- [ ] **Anchor text describes the destination** — "see the authentication guide" not "see here"
- [ ] **No full URLs as anchor text** — `https://example.com/long-path` → use descriptive text
- [ ] **Consistent naming** — if the target page is called "Custom domain setup", call it that in all links to it

### Navigation Hierarchy

- [ ] **Maximum 3 levels deep** for most content (sidebar: section → subsection → page)
- [ ] **Tier 1 pages are accessible in 1 click** from homepage or top navigation
- [ ] **Related pages are grouped** — all guides together, all reference together
- [ ] **No dead-end pages** — every page has a "next step" or at minimum returns to a parent

### Next Steps and Cross-References

- [ ] **Tutorials end with "Next steps"** linking to related how-to guides
- [ ] **How-to guides link to related reference pages** for the commands they use
- [ ] **Reference pages link back** to the how-to or tutorial that demonstrates them
- [ ] **Concept pages link to the tutorial** that puts the concept into practice

### External Links

- [ ] **External links are stable** — prefer official documentation, not blog posts that may disappear
- [ ] **No broken external links** — check periodically; flag pages with external links in the report
- [ ] **External links open in a new tab** (if controlled at markdown level) or are explicitly labeled

## Orphan Detection Pattern

Using the doc graph (the page tree + links):

1. Build a set of all page paths: `all_pages = {page.path for page in graph}`
2. Build a set of linked pages: `linked = {href for page in graph for href in page.links}`
3. Orphans: `all_pages - linked - {homepage}`

## What to Look For

| Severity | Problem | Detection |
|---|---|---|
| `critical` | Broken internal link — referenced page does not exist | Compare link hrefs to doc graph pages |
| `critical` | Broken anchor link — heading does not exist on target page | Parse anchors vs. actual headings |
| `high` | Orphan page — no inbound links | Find pages with zero references in graph |
| `high` | "Click here" / "read more" anchor text | grep `\[click here\|\[read more\|\[here\]` |
| `high` | Navigation depth > 4 levels | Count levels in doc graph tree |
| `medium` | Tier 1 page (quick-start, pricing) not in top navigation | Not reachable in 1 click from homepage |
| `medium` | Tutorial has no "Next steps" section | Missing at end of tutorial pages |
| `medium` | Full URL used as anchor text | grep for `\[https://` |
| `low` | External link to unstable source (blog post, forum) | Non-official domain in external links |
| `low` | Related pages not cross-linked | Thematically adjacent pages with no links between them |

## Output Format

```json
{
  "file": "docs/guides/advanced-auth.md",
  "line": null,
  "severity": "high",
  "rule": "orphan-page",
  "found": "docs/guides/advanced-auth.md has no inbound links from any other documentation page. It is unreachable through navigation — only discoverable via direct URL or search.",
  "suggestion": "Add a link from docs/guides/authentication.md: 'For token rotation and HMAC signatures, see [Advanced authentication](../advanced-auth.md)'. Also add to the sidebar navigation."
}
```

```json
{
  "file": "docs/quick-start.md",
  "line": 67,
  "severity": "critical",
  "rule": "broken-internal-link",
  "found": "Line 67: [Connect your GitHub repo](../setup/github-integration.md) — the target file docs/setup/github-integration.md does not exist in the doc graph.",
  "suggestion": "Either: (1) Restore the missing page, or (2) Update the link to the correct path. Check git history for a rename or deletion."
}
```

```json
{
  "file": "docs/api/workspaces.md",
  "line": 23,
  "severity": "high",
  "rule": "poor-anchor-text",
  "found": "Line 23: 'For more information, [click here](../guides/workspaces.md).' — 'click here' provides no context about the destination.",
  "suggestion": "Replace with descriptive anchor: 'See the [workspace configuration guide](../guides/workspaces.md) for full details.'"
}
```

```json
{
  "file": "docs/tutorials/first-deploy.md",
  "line": null,
  "severity": "medium",
  "rule": "missing-next-steps",
  "found": "Tutorial 'Deploy your first site' ends abruptly with no 'Next steps' section. Users who complete it have no guided path forward.",
  "suggestion": "Add a 'Next steps' section at the end: '## Next steps\\n- [Set up a custom domain](../guides/custom-domain.md)\\n- [Enable AI chat](../guides/ai-chat.md)\\n- [View your analytics](../analytics/overview.md)'"
}
```

## Acceptance Criteria

- [ ] The full doc graph has been used — orphan detection covers all pages, not a sample.
- [ ] All broken internal links include the exact file path and target that does not exist.
- [ ] External link checks are either completed or explicitly noted as skipped (no outbound calls without user confirmation).
- [ ] Output is valid JSON per the format above, one object per finding.

## Related Skills

- `docs-seo` — orphan pages have no inbound links = SEO problem too
- `docs-accessibility` — anchor text quality is an a11y requirement
- `docs-maintenance` — broken links are a maintenance issue
- `docs-analyze` — orchestrator
