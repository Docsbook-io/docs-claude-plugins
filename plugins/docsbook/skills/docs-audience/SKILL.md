---
name: docs-audience
description: Find out where your docs talk past their reader. Detects vocabulary mismatch, undeclared prerequisites, mixed-audience pages and jargon density against the stated reader profile — so junior devs stop bouncing on senior-level pages.
metadata:
  version: 1.0.0
  category: analysis
  mode: audit
  accelerated_by:
    - markdown-lsp      # semantic/graph search over the docs folder (self-hosted) — faster & cheaper than grep
    - docsbook-mcp      # same capability in the cloud if the docs live in a Docsbook workspace
  keywords: [audience, persona, jargon, prerequisites, vocabulary]
---

# docs-audience — Audience Targeting Analysis

## Workflow

1. **Gather the docs** — get the list of pages in scope and read their content. If a semantic/graph search tool over the markdown is available (self-hosted `markdown-lsp`, or a connected Docsbook workspace), prefer it — it's faster and cheaper than scanning files; otherwise read the files directly with `grep`/`find`. Prioritize Tier 1 pages (quick-start, pricing, auth, install) first.
2. **Identify stated audience** — before flagging vocabulary issues, read each page's stated prerequisites, "who this is for" sections, and content type signals.
3. **Apply checklist** — check audience declaration, vocabulary and jargon, beginner-page conventions, expert-page conventions, and mixed-audience red flags.
4. **Produce report** — return one JSON issue object per finding, sorted by severity. Group issues by page.

## Guardrails

- Do not edit any documentation files — surface findings only.
- Flag jargon only when it is undefined *and* the stated prerequisites do not cover it. Precise technical terms are not a problem if the audience is declared correctly.
- A single page may legitimately serve both beginner and expert sections if they are clearly separated with headers — flag as mixed-audience only when no separation exists.
- Ask the user to confirm the primary audience and assumed knowledge level before deep-diving.

## Inputs

This skill needs two things, by whatever means are available:
- **The list of pages in scope** — a docs folder, a sitemap, or a doc graph.
- **The content of each page** — read on demand.

> **Acceleration (optional).** Graph/semantic search over the docs makes navigation faster and cheaper than scanning files. You can self-host it with [`markdown-lsp`](https://github.com/Docsbook-io/markdown-lsp), or get the same capability in the cloud by connecting a Docsbook workspace. With nothing connected, plain file reads and `grep`/`find` work fine.

## Checklist

### Audience Declaration

- [ ] **Page states who it's for** — explicitly or via content type (tutorial = beginner, reference = anyone who knows the product)
- [ ] **Prerequisites are specific** — "Node.js 18+" not "some programming experience"
- [ ] **Assumed knowledge matches stated prerequisites** — if you say "no prerequisites", introduce every term
- [ ] **Page type signals audience** — tutorial = guided beginner, reference = expert lookup

### Vocabulary and Jargon

- [ ] **Technical terms are defined at first use** — inline or via a link
- [ ] **Abbreviations are spelled out** on first mention: "CLI (Command Line Interface)"
- [ ] **No undefined acronyms** beyond the declared knowledge level
- [ ] **Code concepts match audience level** — a beginner tutorial shouldn't use async/await without explaining it
- [ ] **Product-specific terms are defined** — "workspace", "doc graph", "reindex" explained when first introduced

### Beginner Pages (tutorials, getting started)

- [ ] **Step-by-step, no assumed shortcuts** — if a beginner must open a terminal, say "open your terminal"
- [ ] **Every command explained** — not just "run the command", but what it does
- [ ] **Expected output shown** — beginner needs to know if they're on track
- [ ] **Error handling included** — "if you see X, it means Y, do Z"
- [ ] **No "just" or "simply"** — implies ease the reader may not feel
- [ ] **Glossary links** for terms beyond beginner level

### Expert Pages (reference, advanced how-to)

- [ ] **No hand-holding in reference pages** — get to the information fast
- [ ] **Assume knowledge of the product** — don't explain what a workspace is in the API reference
- [ ] **Dense information is acceptable** — experts scan, they don't read linearly
- [ ] **Edge cases documented** — experts need the full picture including exceptions

### Mixed-Audience Signals (red flags)

- [ ] No single page mixes "open your terminal for the first time" with "configure the idempotency key"
- [ ] Navigation groups similar-level content together
- [ ] If a page must serve multiple audiences, it has clear section headers per audience

## What to Look For

| Severity | Problem | Detection |
|---|---|---|
| `critical` | Beginner tutorial uses expert terms with no definition | Jargon appears before any explanation |
| `high` | Prerequisites say "no experience needed" but content assumes coding knowledge | Mismatch between stated prereqs and actual content level |
| `high` | Single page serves beginner and expert simultaneously | "For beginners... For advanced users..." in same page |
| `high` | Abbreviation used without expansion at first mention | `CLI`, `API`, `SSO` with no prior definition |
| `medium` | Product term introduced without definition | "workspace", "doc graph" appear with no explanation on a beginner page |
| `medium` | Reference page over-explains basics | "First, what is an API?" in a reference section |
| `medium` | Tutorial assumes prior tutorial was read without linking it | "As we set up in the previous tutorial..." |
| `low` | No explicit "who this is for" on ambiguously-typed pages | Page type is unclear from title and content |
| `low` | Examples use too-complex data for the stated audience | Beginner tutorial uses a complex multi-step nested example |

## Output Format

```json
{
  "file": "docs/quick-start.md",
  "line": 34,
  "severity": "critical",
  "rule": "beginner-page-undefined-jargon",
  "found": "Line 34: 'Configure the webhook endpoint to handle idempotent requests.' — This is a getting-started page for new users, but 'idempotent' is undefined and not in the stated prerequisites.",
  "suggestion": "Either: (1) Remove idempotency handling from the quick-start (link to advanced guide), or (2) Add a plain-English explanation: 'Configure the webhook endpoint — this ensures the same event isn't processed twice if your server receives it more than once.'"
}
```

```json
{
  "file": "docs/guides/authentication.md",
  "line": 1,
  "severity": "high",
  "rule": "mixed-audience-page",
  "found": "Page starts with a step-by-step beginner guide (lines 1-60) then switches to an advanced section on token rotation and HMAC signature verification (lines 61-120) without a clear audience break.",
  "suggestion": "Split into two pages: (1) 'Set up authentication' — beginner how-to ending at OAuth token, and (2) 'Advanced authentication' — expert guide for token rotation and HMAC. Link between them."
}
```

```json
{
  "file": "docs/api/endpoints.md",
  "line": 5,
  "severity": "medium",
  "rule": "reference-over-explains",
  "found": "Lines 5-20 explain what an API endpoint is and how HTTP requests work. This is a reference page — readers consulting it already know this.",
  "suggestion": "Remove the HTTP basics explanation. Start directly with the endpoint table. Link to an external resource for readers who need HTTP basics."
}
```

## Acceptance Criteria

- [ ] Every page in scope has a declared or inferred audience level (beginner / expert / mixed).
- [ ] All critical and high findings include a specific, actionable suggestion.
- [ ] No jargon is flagged as an issue when the stated prerequisites already cover it.
- [ ] Output is valid JSON per the format above, one object per finding.

## Related Skills

- `docs-content-types` — content type determines expected audience
- `docs-style-tone` — tone adjustments per audience level
- `docs-structure-templates` — prerequisites section structure
- `docs-analyze` — orchestrator
