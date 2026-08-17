---
name: docs-strategy-plan
description: Guided interview that turns "I have no docs and don't know where to start" into a concrete plan — what pages to write, for whom, in what order. Use when the user says "help me create documentation", "help me with docs", "what should I document", "I need docs", "docs from scratch", "documentation strategy", "docs roadmap", or when the project has no existing docs. Asks about product, goals, audience; derives roles and funnels; outputs docs-plan.md + prioritized backlog. Run BEFORE /docs-create.
metadata:
  version: 1.0.0
  category: planning
  mode: audit
  requires_docsbook_mcp: false
  keywords: [planning, strategy, interview, roadmap, information-architecture, funnel, roles, discovery]
---

# docs-strategy-plan — Documentation Strategy Planning

## Workflow

1. **Parse context** — if the user provided a URL or short pitch, fetch and pre-fill what you can; confirm rather than asking cold. Otherwise open with: "Give me one sentence: what is the product?"
2. **Run discovery interview** — one question at a time, max two if tightly coupled. Cover product (name, one-liner, source of truth, maturity), goals (onboarding, SEO, support deflection, sales enablement, AI citability, etc.), and audience roles. Reflect back what you heard after each block.
3. **Derive funnels** — for each confirmed role, sketch a 3–5 step funnel from entry to success. For top-of-funnel goals (SEO, AI citability), awareness pages should be about the space, not the product.
4. **Synthesize the plan** — write `docs-plan.md` with product summary, goals, roles and funnels, information architecture, and a prioritized content backlog.
5. **Hand off** — print a 5-line summary to chat with the top 3 pages to ship first and the suggested next command.

## Guardrails

- One question at a time — don't dump a survey. Wait for the answer, react to it, then ask the next thing.
- Skip questions whose answer you already have from provided context.
- Cap P0 pages at 5–7 — teams won't ship more than that in the first plan.
- Do not conflate blog and docs structurally unless the user explicitly wants `/learn`.
- Do not recommend AI chat, multi-language, or custom domain — that is `/docs-setup-workspace`'s job.
- Do not generate any docs files other than `docs-plan.md`.
- If the user already knows exactly what pages they want, skip this skill — go straight to `/docs-create`.

## MCP Tools

| Tool | Purpose |
|------|---------|
| None required | This skill is a guided interview — no Docsbook MCP tools needed |

> If the user already has published docs (a folder, a sitemap, or a connected Docsbook workspace), optionally read the existing page tree first to see what's there and skip redundant questions.

## Checklist

### Phase 1 — Product

- [ ] Product name confirmed
- [ ] One-liner (what it does and for whom) captured
- [ ] Source of truth identified: URL / GitHub repo / existing docs / nothing yet
- [ ] Maturity level: pre-launch / early (<100 users) / growing (100–10k) / scaled (10k+)

### Phase 2 — Goals

- [ ] At least one goal selected: onboarding, support deflection, SEO, AI citability, sales enablement, education, developer reference, trust/compliance
- [ ] One-line follow-up captured for each selected goal (makes it actionable)
- [ ] Unexplored goals explicitly surfaced if not volunteered

### Phase 3 — Audience and Roles

- [ ] 2–3 confirmed roles (proposed, not asked cold)
- [ ] For each role: entry point, current knowledge, job to be done, success exit

### Phase 4 — Funnels

- [ ] Funnel table per role: Entry → Awareness → Evaluation → Activation → Retention
- [ ] Top-of-funnel awareness pages (if SEO/education goal) are about the space, not the product

### Phase 5 — Blog / Evergreen (if top-of-funnel goal selected)

- [ ] Cadence vs. one-time evergreen library decided
- [ ] `/blog` vs `/learn` placement chosen with recommendation given
- [ ] 5–10 evergreen topic seeds proposed (pillar / cluster / one-off)

### Phase 6 — Output: docs-plan.md

```markdown
# Documentation plan — <product>

## Product
<one-liner, maturity, source-of-truth links>

## Goals
- <goal> — <one-line success metric>
- ...

## Roles & funnels
### <Role 1>
- Entry: ...
- Funnel: Awareness → Evaluation → Activation → Retention
- Pages needed:
  - <slug> — <purpose> — <which goal it serves>

### <Role 2>
...

## Information architecture
<top-level nav, one bullet per section, with the role(s) it serves>

## Content backlog (prioritized)
| # | Page | Type | Role | Goal | Priority | Effort |
|---|------|------|------|------|----------|--------|
| 1 | Getting Started | tutorial | Developer | Onboarding | P0 | S |
| 2 | <space concept> | explainer | Searcher | SEO / AI | P1 | M |
| ... |

Priority: P0 = ship first, P1 = next, P2 = nice to have.
Effort: S / M / L.

## Recommended next steps
1. Run `/docs-create <source>` to scaffold from the existing source — it'll cover ~X of the P0 pages.
2. Manually draft these P0 pages that have no source: <list>.
3. For top-of-funnel content, see `/content-strategy` and `/ai-seo`.
4. Re-run `/docs-strategy-plan` in 3 months to re-prioritize against analytics.
```

## Acceptance Criteria

- [ ] `docs-plan.md` is written to the current directory.
- [ ] The plan contains at least 3 roles (or a reasoned explanation of why fewer), a prioritized backlog, and a recommended next step.
- [ ] No docs files other than `docs-plan.md` are created.
- [ ] A 5-line summary is printed to chat with the top 3 P0 pages and the next suggested command.

## When to Use

- Project has no documentation yet and the user isn't sure what to write.
- Product owner says "docs would be nice" but can't name the pages.
- Team wants docs to serve more than getting-started (SEO, sales funnel, education, support deflection).
- Before `/docs-create` if the source signal alone is too thin to produce a meaningful structure.

## Related Skills

- `docs-create` — scaffold pages from the plan output
- `docs-analyze` — audit existing docs quality
- `docs-gap-finder` — identify missing pages from real user signals
- `docs-setup-workspace` — configure Docsbook workspace features
