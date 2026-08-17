---
name: docs-create
description: Turn a URL or repo into a live docs site in one command. Full end-to-end pipeline — detects the source (website, code, or Mintlify/GitBook/Docusaurus), generates structured Markdown, publishes to GitHub, and configures the Docsbook workspace. Minimal questions, maximum output.
metadata:
  version: 1.2.0
  category: creation
  mode: authoring
  requires_docsbook_mcp: false
  keywords: [create, pipeline, generate, docs, new]
---

# docs-create — End-to-end docs pipeline

## Docsbook chat agent (in-app)

When this skill is read by the Docsbook /chat agent — the environment where agent-engine tools (`crawl_website`, `create_workspace`, `generate_doc_site`, `commit_docs`, `update_branding`, `set_option`) are available — map the workflow onto those tools instead of the CLI steps below, and follow the auto-mode contract:

- **Pipeline:** `crawl_website(url)` → `create_workspace` (custom_name from the crawl's `suggested_name`) → ONE `generate_doc_site` call passing `site_context` (digest of crawled pages) and `source_branding` (the crawl's brand tokens) → it generates all pages in parallel, applies branding, and publishes.
- **Every visible step is a TOOL CALL, never narrated text.** The engine emits one chip per crawled page (`crawl_page`), per generated file (`write_doc_page`), and for the publish step (`publish_docs`). Do not stream progress as prose like "Wrote README.md (1.1k chars)" — the user must see real tool calls.
- **Branding is part of creation, not a follow-up.** Source brand tokens (accent color, font, logo, favicon, site name) are applied verbatim during generation. If the crawl found no tokens, derive branding immediately — never leave the site generic and never invent a default accent.
- **Auto-mode ON (the default):** zero questions. Decide everything yourself for maximum wow: crawl, generate, publish to Docsbook hosting, apply source branding, and immediately enable the recommended free features — SEO, GEO, AEO, AI chat — via `set_option`. Do not ask for confirmation at any step; the payoff is a fully branded, fully configured live site in one turn.
- **Auto-mode OFF:** the user kept control — pause at checkpoints with `ask_user` (one per turn): (1) proposed page structure, (2) branding palette derived from detected signals, (3) which features to enable after publish. Mirror `/docs-create-interactive`.

## Workflow

1. Ask at most 1 question before starting: the source URL/repo (if missing). The GitHub account comes from `gh auth status` when present; if absent, the pipeline still runs the crawl and stops cleanly with the path printed.
   - **Project name — never invent it.** Derive the project/site name in this priority order: (1) the source website's brand name (from its `<title>` / `og:site_name`); (2) the GitHub repo name (the part after `owner/`); (3) if neither source exists or the name is unclear, **ask the user** what to name the project. Do not synthesize a random or placeholder name. This name is used for the output folder and the workspace display name.
2. **Ask about content enrichment.** Before the crawl, ask the user which marketing-driven pages to add on top of the core docs — competitor comparisons (`blog/<you>-vs-<competitor>.md`), educational topic cluster (`learn/`), glossary + use-cases (`glossary/`, `use-cases/`), migration guides (`migrate-from-<competitor>.md`). Multi-select; skipping is a valid answer. If competitor-vs or migration is chosen, ask for a comma-separated competitor list or leave blank to auto-detect from the crawl.
3. Detect the source type using the `/docs-detect-source` logic — route to `website` (`/docs-from-site`), `github-code-repo` (`/docs-from-code`), or a docs platform (`/docs-from-docs`). Each route reads the source, decides the structure, and writes the pages itself — the intelligence lives in these skills, not in a helper tool.
4. Build core docs using the appropriate sub-skill. **Simultaneously extract branding signals from the SOURCE** — read its `<meta name="theme-color">`, `og:image`, favicon, title, and any inline `--accent` CSS tokens; for code repos also scan the README for explicit hex values or brand color mentions. Store every signal you found (or explicitly note when none was found). Never invent an accent color when no signal exists.
5. **First-run enrichment.** Apply `/docs-first-run-enrichment` so the first thing the user sees is a sellable, on-brand site and not a bare skeleton — it auto-brands from the step 4 signals and generates a **foldered, multi-section structure (hero, getting-started, concepts, `features/`, `guides/`, `use-cases`, `faq`, reference — target 10–18 real pages, folders become the nav sub-header)** instead of a flat handful of thin pages. **Announce what you are applying:** before generating, tell the user in one short line which writing sub-skills you are using for high-quality, conversion-oriented docs — `docs-audience` (reader fit), `docs-style-tone` (tighten prose), `docs-content-types` (Diátaxis structure), `docs-seo` (rankability) — and actually apply each of them while writing the pages, so the user sees the orchestration and the output reads like sales-grade docs.
6. **Enrich (only if step 2 selected any category).** Generate 3–5 pages per chosen category on top of the crawled folder. Never fabricate competitors or terms — skip a section silently if inputs are insufficient. Enrichment failure does not block publish — core docs still ship.
7. **Preview + confirm.** Before publishing, print the folder tree (including enriched folders) and excerpts from up to 3 representative pages plus one enriched page if available. Ask the user before pushing — never silently create a GitHub repo.
8. Publish the generated folder to GitHub using the `/docs-publish` logic — only if `gh` is authenticated. Otherwise stop with `status: crawl_only` and instructions to run `/docs-publish <path>` after `gh auth login`.
9. **Confirm workspace settings, then configure** the Docsbook workspace using `/docs-setup-workspace`. Show what will be applied (branding, UI, AI, SEO, languages) and let the user accept all, decline, or pick sections. **Branding runs by default and always leads with the detected SOURCE brand signals from step 4** — present the derived palette (accent, muted, foreground, background, theme) built from those signals before showing other settings, so the user sees real brand options and not generic placeholders. If MCP is available, apply branding via `/docs-branding` before any other workspace config, using the signals collected in step 4 as the DERIVE input. If no signal was detected (noted in step 4), run `/docs-branding` anyway — let it ask the user for a reference URL or color rather than skipping or inventing. Skip gracefully if MCP is unavailable — print connection instructions but do not fail the pipeline.
10. Report the local path, GitHub URL (if published), Docsbook URL (if configured), core page count, enriched page count by section, and detected source type.

## Guardrails

- Never ask more than 2 questions before starting: the source and the enrichment categories. Derive everything else from context.
- `gh` is optional for the crawl step. Only the publish step requires it — if missing, surface that as a clean stopping point, not an error.
- Always show a real preview (tree + page excerpts) before publish — a one-line summary is not enough for users to decide.
- Always confirm workspace settings before applying — `update_languages` in particular enables 4 languages by default and surprises users.
- If MCP is unavailable at step 8, print setup instructions and exit cleanly — do not abort the whole pipeline.
- Output folder / project name is derived from the source (site brand → repo name), never invented. If no source name can be determined, ask the user — do not fall back to a random or placeholder name. Only prompt about a derived name if there is a genuine collision.
- When committing into an existing repo (rather than publishing a fresh one), write pages to the **repository root** — `README.md`, `getting-started.md`, `guides/…` — unless the repo already has a `docs/` folder, in which case respect that existing structure. Never wrap a fresh repo's pages in a new top-level `docs/` directory.
- **Never push a default accent color** (`#6366f1` or any other) when branding extraction failed — the branding pass MUST run with `/docs-branding` (which asks for a reference) rather than silently applying a generic default.
- Never fabricate competitors, glossary terms, or product features during enrichment. If the crawler produced no evidence, skip that section and record the reason.
- **Branding is mandatory, not optional** — even when no signals are detected, the `/docs-branding` skill runs at step 8 to derive from a user-supplied reference, because a generic branding output is worse than an un-branded one.

## Acceptance Criteria

- [ ] Source type detected without manual input
- [ ] Project name taken from the site brand or repo name — or the user is asked — never invented
- [ ] User chooses enrichment categories (or skips) before the crawl runs
- [ ] Docs folder is foldered and multi-section — 10–18 real pages when the source supports it (fewer only for genuinely thin sources), including a `faq.md` and ≥1 use-case; never a flat README + one thin page
- [ ] `/docs-first-run-enrichment` applied — foldered structure with folders mapped to the nav sub-header, and the writing sub-skills (docs-audience, docs-style-tone, docs-content-types, docs-seo) were announced to the user and applied during generation
- [ ] If enrichment was selected, 3–5 pages per category exist on disk; skipped sections have a recorded reason
- [ ] Preview (tree + page excerpts, including enriched pages when present) printed before any publish prompt
- [ ] Pipeline completes without `gh` when GitHub is not authenticated (status `crawl_only`)
- [ ] GitHub repo created and pushed successfully when `gh` is available and user confirms
- [ ] Branding signals from the source were collected at step 4 (or noted as absent) and presented at step 8 — never a generic default accent
- [ ] `/docs-branding` was run at step 8 using the detected SOURCE brand signals as the DERIVE input — not skipped, not applied silently with defaults
- [ ] Workspace configuration is confirmed by the user before applying
- [ ] Docsbook workspace configured for the selected sections (or setup instructions printed if MCP unavailable)
- [ ] Final report shows local path, GitHub URL (if published), Docsbook URL (if configured), and enrichment counts by section
