---
name: docs-create-interactive
description: Same as /docs-create, but with you in the loop. Pauses at six checkpoints — source detection, structure review, content enrichment, branding, languages, domain — so you can adjust before publishing. Use when you want full control over what ships.
metadata:
  version: 1.1.0
  category: creation
  mode: authoring
  requires_docsbook_mcp: false
  keywords: [create, interactive, pipeline, checkpoints, customize]
---

# docs-create-interactive — Guided docs pipeline with checkpoints

> **Docsbook chat agent (in-app):** this is the flow the /chat agent follows when auto-mode is OFF — surface each checkpoint as an `ask_user` question (one per turn): source confirmation, page structure, branding palette (from detected source signals), features to enable (SEO, GEO, AEO, AI chat). With auto-mode ON use `/docs-create` instead: no questions, everything applied automatically.

## Workflow

1. Run `/docs-detect-source` logic. Show the detected type and wait for user confirmation before continuing. Re-run if the user points to a different source.
2. Plan the full file structure — foldered and multi-section (see `/docs-first-run-enrichment`): hero, getting-started, concepts, `features/`, `guides/`, `use-cases`, `faq.md`, reference where applicable. Target 10–18 real pages when the source supports it; scale down only for genuinely thin sources. Display the proposed tree and wait for approval or modification requests. Apply changes before generating any files.
3. **Content enrichment checkpoint.** Ask the user which marketing-driven categories to add on top of the core docs:
   - `competitor-vs` — `blog/<you>-vs-<competitor>.md` for "X vs Y" / "X alternative" searches. Highest-intent SEO traffic.
   - `educational` — `learn/` topic cluster teaching the domain (not the product). Top-of-funnel content with a soft CTA at the end. Strong AI-citation candidate.
   - `glossary-usecases` — `glossary/` for "what is <term>" featured snippets and AI Overviews; `use-cases/` for persona/scenario pages that convert better than feature pages.
   - `migration` — `migrate-from-<competitor>.md` capturing users actively churning from competitors.
   Multi-select. If `competitor-vs` or `migration` is picked, also confirm the competitor list (auto-detected from the crawl, with the user able to add/remove). Confirm the page count per section (default 4, allowed 3–5). Skipping is valid.
4. Extract branding (accent color, background, theme scheme, favicon). Show detected values and let the user override before writing the branding file.
5. Before publishing, confirm the GitHub owner and repo name. Propose a name derived from the source (site brand or source repo name) — never a made-up or placeholder name; if none can be derived, ask the user outright. Update if the user provides a different name.
6. Before configuring Docsbook, ask which optional features to enable (AI chat, multi-language, custom domain, SEO). Apply only the selected ones.
7. Report the outcome with a summary of every choice made at each checkpoint — including which enrichment categories ran and how many pages each produced.

## Guardrails

- Never skip a checkpoint — each pause is intentional and must wait for explicit user input.
- If the user types a different source at checkpoint 1, re-run detection instead of assuming.
- At checkpoint 3, never fabricate competitors or glossary terms — if the crawl produced no evidence, surface that to the user and let them decide whether to type names manually or skip the section.
- Apply only features the user explicitly selected at checkpoint 6; do not enable extras silently.
- If MCP is unavailable at the Docsbook step, print connection instructions and continue — do not block the final report.

## Acceptance Criteria

- [ ] Each of the 6 checkpoints reached and acknowledged by the user
- [ ] File structure reflects any modifications requested at checkpoint 2
- [ ] Enrichment categories selected at checkpoint 3 produced 3–5 pages each (or were explicitly skipped)
- [ ] Branding file contains user-confirmed values
- [ ] GitHub repo name matches what was confirmed at checkpoint 5
- [ ] Only user-selected Docsbook features are enabled
- [ ] Final report includes a summary of all choices made, including per-section enrichment counts
