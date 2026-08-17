---
name: docs-imagine
description: "Generate a complete, conversion-optimised docs site from a product name or idea alone — no URL, no repo needed. Invents the right pages, messaging, and structure for your product, then publishes and configures the Docsbook workspace automatically. Use when the user says imagine docs, create docs for X, придумай документацию, invent docs, make up docs, from scratch, no source, for better selling, marketing-grade docs, wow me, or provides only a product name with no URL."
metadata:
  version: 1.0.0
  category: creation
  mode: authoring
  accelerated_by:
    - docsbook-mcp      # create the workspace and apply branding/UI/navigation, if you publish through Docsbook
  keywords:
    - imagine
    - invent
    - idea
    - scratch
    - from-scratch
    - no-source
    - selling
    - conversion
    - marketing
    - придумай
    - придумать
    - generate
    - design
    - wow
    - make-up
    - product-name
    - just-an-idea
---

# docs-imagine — Generate conversion-focused docs from a product idea

## Workflow

1. **One question maximum.** If the user already provided a product name or concept in their message, extract it and proceed immediately. Otherwise ask exactly one question: "What is your product? (name + one-liner)". Never ask a second question before generating — infer everything else from the product concept and context.
   - Infer the product category, likely audience, and tone from the name/description. State what you inferred ("I'm treating this as a SaaS developer tool — generating accordingly. Correct me if I'm off.") and proceed.

2. **Compose the content plan inline** (no `docs-plan.md` file). For the given product, decide on a page set optimised for conversion and clarity:
   - `README.md` / `index.md` — hero overview: what it is, who it is for, the core promise in one sentence, CTA
   - `getting-started.md` — quickstart: shortest path to first win (under 5 minutes by convention)
   - 3–5 feature pages under `features/` — each a benefit-first page: headline = the outcome the user gets, body = how it works + proof, ends with a CTA
   - `use-cases/` (1–3 pages) — concrete job stories: "X uses this to do Y, getting Z"
   - `faq.md` — 6–10 frequently asked questions with answers that eliminate objections
   - `blog/` or `learn/` (optional, 1 page) — one educational or comparison piece if the product category benefits from it

3. **Write `_branding.json`** alongside the docs folder. Source the product name and a domain-appropriate accent color suggestion from the product concept — do NOT default to `#6366f1`. If no confident color exists for the domain, leave `accentColor` absent so the workspace configurator skips the branding step rather than picking a default.

4. **Generate all Markdown files** into `docs-output/<product-slug>/`. Apply conversion copywriting throughout:
   - Benefit-first headings (outcome the user gets, not the feature name)
   - Active voice, second person
   - No filler words ("just", "simply", "easily", "obviously")
   - Every page ends with a next-step CTA pointing to the logical next page or action
   - Apply `/docs-content-types`, `/docs-structure-templates`, `/docs-style-tone`, `/docs-branding`, `/docs-media`, and `/docs-seo` conventions by reference — do not inline-duplicate their rules

5. **Preview.** Print a folder tree of `docs-output/<product-slug>/` and show excerpts (first 20–30 lines) from 2–3 representative pages (hero + one feature + FAQ). Ask the user to confirm or give feedback before publishing: "Does this look right? Type **yes** to publish, or describe what to change."

6. **Publish.** Apply `/docs-publish` logic:
   - If `gh` is authenticated and the user confirmed, commit and push the generated docs to GitHub (via `git`/`gh`, or your publishing step).
   - If `gh` is NOT authenticated or the user is not connected to Docsbook MCP, stop cleanly: print the local path and the command `/docs-publish <path>` to run after `gh auth login`. Do not error — this is a valid stopping point (`status: crawl_only`).

7. **Configure the workspace.** Apply `/docs-setup-workspace` unconditionally after a successful publish:
   - Wire branding, UI, and navigation on your publishing platform (e.g. a connected Docsbook workspace), or write them into your docs config.
   - If the MCP transport is unreachable, print the connection command and exit cleanly — do not abort the overall pipeline; the local folder and GitHub URL are already delivered.

8. **Final report.** Print all three outcomes:
   - Local path: `docs-output/<product-slug>/`
   - GitHub URL (if published)
   - Docsbook site URL (if workspace configured)

## Guardrails

- Ask at most ONE upfront question (the product name/topic). Infer everything else — do not ask about audience, tone, color, page count, or structure.
- Never invent competitor names or real-world facts. If a comparison or migration section is requested and no names were given, ask once or omit the section entirely.
- Never use `#6366f1` (or any other hardcoded default) as the accent color. Leave `accentColor` absent when no domain-appropriate color is deterministic.
- Do NOT hand off to `/docs-strategy-plan`. This skill generates content immediately — it is not a planning skill.
- Workspace setup is MANDATORY after a successful publish — it is what makes the user see how the live site looks. Skip only if MCP transport is unreachable (print instructions instead).
- Never silently create a GitHub repo — always show a preview and receive a confirm signal first.
- The content must be conversion-focused from first draft — marketing-grade language, not placeholder copy.

## Acceptance Criteria

- [ ] Single upfront question (product name/topic) — zero if already provided in the message
- [ ] All pages generated in `docs-output/<product-slug>/` with at least README, getting-started, 3 feature pages, and FAQ
- [ ] `_branding.json` written (accentColor absent or domain-appropriate, never default purple)
- [ ] Preview (folder tree + page excerpts) shown before the publish prompt
- [ ] User confirm received before any GitHub repo creation
- [ ] Published to GitHub when `gh` is authenticated and user confirms; `crawl_only` status with local path otherwise
- [ ] `/docs-setup-workspace` executed unconditionally after publish (unless MCP transport is unreachable)
- [ ] Final report shows all three URLs (local path / GitHub URL / Docsbook site URL)
