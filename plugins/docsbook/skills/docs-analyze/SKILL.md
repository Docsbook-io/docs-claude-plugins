---
name: docs-analyze
description: Run a full audit of your documentation in one command. Orchestrates 10 specialized analyses — content type, structure, style, audience, links, SEO, a11y, i18n, media, maintenance — and returns a single prioritized report you can hand to the writer. Works on one page, a folder, or the entire docs/ tree.
metadata:
  version: 1.0.0
  category: analysis
  mode: audit
  accelerated_by:
    - markdown-lsp      # semantic/graph search over the docs folder (self-hosted) — faster & cheaper than grep
    - docsbook-mcp      # same capability in the cloud if the docs live in a Docsbook workspace
  keywords: [audit, review, analysis, quality, orchestrator, documentation]
---

# docs-analyze — Documentation Analysis Orchestrator

## Workflow

1. **Gather the docs** — get the list of pages in scope and read their content. If a semantic/graph search tool over the markdown is available (self-hosted `markdown-lsp`, or a connected Docsbook workspace), prefer it — faster and cheaper than scanning files; otherwise read the files directly with `grep`/`find`. Prioritize Tier 1 pages (quick-start, pricing, auth, install) first.
2. **Identify Tier 1 pages** — flag quick-start, pricing, authentication, and installation pages for priority analysis.
3. **Run sub-skills in parallel** — spawn independent Agent calls for `docs-content-types`, `docs-structure-templates`, `docs-style-tone`, `docs-audience`, `docs-seo`, `docs-accessibility`, `docs-maintenance`. Run `docs-navigation-linking` and `docs-i18n` sequentially (they depend on the full graph and workspace language settings).
4. **Aggregate and deduplicate** — collect JSON issues from all skills; merge cross-cutting findings (e.g. missing alt = a11y + SEO — report once under higher severity, note both skills).
5. **Produce final report** — output a prioritized markdown report with severity summary, critical issues, recommendations by area, and quick-win list.

## Guardrails

- Do not edit any documentation files — surface findings only.
- Do not run `docs-i18n` if only one language is enabled in workspace settings.
- A cross-skill finding (same line flagged by two skills) is reported once under the higher severity.
- Ask the user to confirm Tier 1 pages before starting — defaults may not match the project.
- If you rely on a cached doc index, make sure it is fresh before proceeding rather than analyzing stale data silently.

## Inputs

This skill needs two things, by whatever means are available:
- **The list of pages in scope** — a docs folder, a sitemap, or a doc graph.
- **The content of each page** — read on demand.

> **Acceleration (optional).** Graph/semantic search over the docs makes navigation faster and cheaper than scanning files. You can self-host it with [`markdown-lsp`](https://github.com/Docsbook-io/markdown-lsp), or get the same capability in the cloud by connecting a Docsbook workspace. With nothing connected, plain file reads and `grep`/`find` work fine.

## Available Analysis Skills

| Skill | Scope | When to Use |
|---|---|---|
| `docs-content-types` | Per-page Diátaxis classification | Content is mixed or confusing |
| `docs-structure-templates` | Frontmatter, headings, code blocks | New docs or structural audit |
| `docs-style-tone` | Voice, filler words, terminology | Writing quality review |
| `docs-audience` | Vocabulary mismatch, assumed knowledge | Onboarding issues, user complaints |
| `docs-navigation-linking` | Broken links, orphan pages, anchor text | Navigation complaints, post-restructure |
| `docs-seo` | Title, description, topic clusters | SEO audit, traffic drop |
| `docs-accessibility` | Alt text, heading hierarchy, WCAG 2.1 AA | A11y audit, compliance |
| `docs-i18n` | Language parity, stale translations, hreflang | Adding languages, i18n audit |
| `docs-media` | Images, screenshots, diagrams, file names | Media quality review |
| `docs-maintenance` | Stale content, deprecated pages, TODO/FIXME | Quarterly audit |

## Checklist

### Step 1 — Gather the docs

Get the tree of pages in scope by whatever means are available — a graph/search tool over the markdown, or a plain walk of the docs folder. Then read the content of the pages you need on demand, addressing each by its link or path.

If a tool returns the tree as a compact tree notation (e.g. TOON), it looks like this:
```
docs/
  quick-start.md [Quick Start] @quick-start
    #installation @quick-start/installation
    #configuration @quick-start/configuration
  guides/
    custom-domain.md [Custom Domain] @guides/custom-domain
      #dns-setup @guides/custom-domain/dns-setup
```
Use the per-page references (e.g. `@quick-start`) to read individual pages/sections; with a plain folder walk, the file path serves the same role.

If there are no docs yet, generate them first — see `/docs-create`.

### Step 2 — Identify Tier 1 pages

From the doc graph, flag pages likely to be Tier 1:
- Quick start / Getting started
- Pricing / Plans
- Authentication / Login
- Installation / Setup

These get audited first regardless of scope.

### Step 3 — Run analysis skills in parallel

Spawn Agent calls in a single message for independent skills:

```
Agent(docs-content-types)       → classify each page type
Agent(docs-structure-templates) → check frontmatter, headings
Agent(docs-style-tone)          → check voice and clarity
Agent(docs-audience)            → check vocabulary level
Agent(docs-seo)                 → check title, description, links
Agent(docs-accessibility)       → check alt text, headings, captions
Agent(docs-maintenance)         → check stale content, TODOs
```

Run sequentially when one depends on another:
- `docs-navigation-linking` needs the full doc tree (from Step 1)
- `docs-i18n` needs the workspace language settings first, if available

### Step 4 — Aggregate results

Collect JSON issues from all skills. Deduplicate cross-skill findings (e.g., missing alt = both a11y + SEO issue — report once under the higher severity, note both skills).

### Step 5 — Produce the final report

```markdown
# Documentation Analysis Report
**Repository:** {user}/{repo}
**Date:** {date}
**Pages analyzed:** {count}

## Summary
| Severity | Count |
|---|---|
| Critical | N |
| High | N |
| Medium | N |
| Low | N |

## Critical Issues
{list critical issues with file, rule, suggestion}

## High Priority Issues
{list high issues}

## Recommendations by Area
### Content Quality
### SEO
### Accessibility
### Maintenance

## Quick Wins (fixable in < 30 min)
{low-effort, high-impact items}
```

## Output Format

Each sub-skill returns JSON issues. The orchestrator aggregates them:

```json
[
  {
    "type": "missing_frontmatter_title",
    "severity": "critical",
    "skill": "docs-structure-templates",
    "location": "docs/quick-start.md",
    "found": "No title in frontmatter. Page has no <title> tag and will not rank in search.",
    "suggestion": "Add to frontmatter: title: 'Get Started with Docsbook in 30 Seconds'",
    "action": "add_frontmatter_field",
    "constraints": {
      "field": "title",
      "max_length": 60
    }
  },
  {
    "type": "image_missing_alt",
    "severity": "high",
    "skill": "docs-accessibility",
    "location": "docs/guides/custom-domain.md#line-34",
    "found": "![](screenshots/dns-settings.png) — informative image with no alt text.",
    "suggestion": "Add descriptive alt: '![DNS settings panel showing CNAME record for custom domain](screenshots/dns-settings.png)'",
    "action": "add_alt_text",
    "constraints": {
      "max_length": 125
    }
  }
]
```

## Task-Specific Questions

When invoked directly, ask:

1. **Which skills to run?** All, or specific areas (SEO / a11y / maintenance / style)?
2. **Tier 1 pages** — which pages are most business-critical for this project?
3. **Threshold for stale content** — 90 days, 180 days, or custom?
4. **Languages in scope** for i18n check (if multiple languages enabled)?
5. **Output format** — terminal report, GitHub issue list, or JSON file?

## Acceptance Criteria

- [ ] All enabled sub-skills have run and returned results (or been explicitly skipped with a reason).
- [ ] Final report groups issues by severity with counts in the summary table.
- [ ] Cross-skill duplicates are merged — no issue appears twice for the same file/line.
- [ ] At least one Quick Win item is identified (or explicitly noted that none exist).

## Related Skills

- `docs-content-types` — Diátaxis page type analysis
- `docs-structure-templates` — frontmatter and heading structure
- `docs-style-tone` — voice, clarity, filler words
- `docs-audience` — vocabulary mismatch, knowledge level
- `docs-navigation-linking` — broken links, orphan pages
- `docs-seo` — title, description, topic clusters
- `docs-accessibility` — WCAG 2.1 AA from markdown source
- `docs-i18n` — multilingual parity and freshness
- `docs-media` — images, screenshots, diagrams
- `docs-maintenance` — stale content, deprecated pages
