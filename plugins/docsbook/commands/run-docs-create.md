---
description: Full pipeline — crawl a URL (or research from scratch when no source), optionally enrich with marketing pages, publish to GitHub, configure the Docsbook workspace
allowed-tools: Agent, Read, Write, Bash, AskUserQuestion
skill: docs-create, docs-manage
---

# /docsbook:run-docs-create — full crawl → enrich → publish → configure pipeline

End-to-end orchestrator. Detects the source type (or absence of one), picks the right builder subagent, optionally enriches with marketing-driven pages, then chains publish + configure:

1. **Source detection** (inline, no subagent — see Step 1) routes to one of:
   - `docs-site-crawler` (Haiku) — for marketing websites
   - `docs-code-crawler` (Haiku) — for GitHub source code repos
   - `docs-platform-importer` (Haiku) — for existing docs on Mintlify / GitBook / Docusaurus / Nextra / VitePress / Starlight
   - `docs-from-scratch` (Sonnet) — **when the user has no source yet**, only a topic. Researches 3–5 competitors and writes original docs following domain conventions.
2. `docs-content-enricher` (Haiku, optional) — adds competitor comparisons, educational topic cluster, glossary + use-cases, and migration guides on top of the crawled docs
3. `docs-publisher` (Haiku) → creates GitHub repo and pushes
4. `docs-workspace-configurator` (Sonnet) → applies branding/UI/AI/SEO/GEO/AEO via Docsbook MCP

This command does not contain any crawl, git, or MCP logic itself — it only routes the source, then passes outputs of one subagent into the input of the next.

This command also reads and writes Claude memory at key checkpoints (see "Memory usage" below) so future `/docs-*` sessions can skip re-asking the user about their project, niche, competitors, and the docs they've already built.

## Arguments

- `$ARGUMENTS[0]` — source: website URL, GitHub repo URL, or local path (**optional** — if omitted, the command falls into the no-source flow and asks for a topic)
- `$ARGUMENTS[1]` — output name / repo basename (optional; derived from source or topic)
- `$ARGUMENTS[2]` — `owner` for GitHub (optional; defaults to authenticated gh user)

## Memory usage

Before Step 0, read the user's project memory directory (path is in `CLAUDE.md` under `auto memory` — typically `~/.claude/projects/<project-slug>/memory/`):

- Check `MEMORY.md` for entries tagged with `project_docsbook_*`, `feedback_docs_style_*`, `reference_docs_workspace_*`. Read any matching file.
- If a project memory entry already describes the user's topic/problem/differentiator/audience, **pre-fill** those into the no-source flow so you don't ask the user again. Surface it as: `Using your saved project context: <topic> for <audience>. Edit? [y/N]`.
- If a feedback memory entry describes docs-style preferences (tone, length, structure), apply them silently to whichever subagent runs.

During and after the pipeline, write memories at the points marked **[memory]** in the steps below. Use the format from the user's global memory instructions (one file per memory + index entry in `MEMORY.md`). Never write secrets, GitHub tokens, or anything ephemeral.

## Pre-flight

Run `gh auth status`. Capture the result as `ghReady` (true/false) but **do not stop** if it fails — the crawl step works without it and the user gets to see their docs locally before being asked to authenticate. Only the publish step needs `gh`.

## Step 0 — No-source flow basics (skip if `$ARGUMENTS[0]` is set)

If `$ARGUMENTS[0]` is empty, the user wants docs but has nothing to crawl. Collect what's needed to do research-based generation, then route to `docs-from-scratch` in Step 1.

This step collects only what's **specific to no-source** (topic + name + audience + competitor hints). The `problem` and `differentiator` questions are shared with URL/repo flows and live in Step 0.1 below.

First check project memory for saved context (see "Memory usage" above). If one exists, ask:

```
I have your saved project context:
  Topic:           <topic>
  Audience:        <audience>

Use this? [Y/edit/new]
```

- `Y` (default): proceed with saved values.
- `edit`: ask the questions below pre-filled with saved answers.
- `new`: start fresh.

If no saved context (or user chose `new`/`edit`), use `AskUserQuestion` for each of the questions below.

1. **Topic** (required):
   ```
   What does your project do? (one sentence)
   Example: "AI email assistant for B2B sales teams"
   ```
   If the answer is shorter than 10 chars or generic ("an app", "a tool"), re-ask once with: `Be more specific — what does it do and who is it for?`. After a second vague answer, stop with: `Topic too vague to research competitors. Try again with a clearer description.`

2. **Name** (optional — skip allowed):
   ```
   Project name? (used for the repo and docs folder)
   Leave blank to derive from topic.
   ```
   If blank, slug it from the topic: lowercase, kebab-case, ≤30 chars, drop stopwords (`for`, `a`, `the`, `of`).

3. **Audience** (optional — derive from topic if skipped):
   ```
   Who is this for? (one phrase, optional)
   Example: "B2B sales reps", "indie hackers", "data engineers"
   ```

4. **Competitor hints** (optional — `docs-from-scratch` will research more):
   ```
   Any competitors you already know about? (comma-separated, optional)
   ```

Capture all answers. Print the routing decision: `No source provided → researching competitors and generating docs from scratch.` Continue to Step 0.1.

## Step 0.1 — Positioning questions (ALL routes — no-source AND URL/GitHub/platform)

This step runs for **every** route, not just no-source. The reason: `problem` and `differentiator` are the foundation for the README opening, the quick-start hook, the AI chat system prompt, the SEO meta description, and the competitor pages. Bad answers here = generic docs no matter which builder agent runs.

For URL/repo flows, we can't reliably extract these from marketing copy (sites usually lead with feature lists, not pain or leverage), so we ask the user directly **before crawl** — that way the builder agent has them in hand and can shape the docs around them from the start, rather than re-writing afterward.

First check project memory (see "Memory usage"). If a `project_docsbook_*` entry has `problem` and `differentiator`, ask:

```
I have your saved positioning:
  Problem:         <problem>
  Differentiator:  <differentiator>

Use this? [Y/edit/skip]
```

- `Y` (default): proceed with saved values.
- `edit`: ask the two questions below pre-filled.
- `skip`: set `problem: null`, `differentiator: null` and continue (generic docs; agent does its best).

If no saved context (or user chose `edit`/`skip`), use `AskUserQuestion`. Both are recommended but skippable.

1. **Problem** (recommended — drives README/positioning):
   ```
   What real problem does it solve? (one sentence — the pain users feel TODAY without your product)
   Example: "Sales reps spend 3+ hours/day writing cold emails that get 1% reply rates."

   Leave blank to skip (agents will derive from <source/topic>).
   ```
   If the user gave an answer shorter than 15 chars, doesn't describe a pain, or just restates the topic ("it helps with emails"), re-ask once: `That describes what the product is, not the pain. What goes wrong for users without it?`. After a second vague answer, accept whatever they give but flag `warnings: ["problem_vague — generic positioning"]` later. If empty → `problem: null`.

2. **Differentiator** (recommended — point of leverage vs competitors):
   ```
   What do you do that existing solutions DON'T? (one sentence — your point of leverage)
   Example: "We learn each prospect's last 5 LinkedIn posts and tailor the opener — Apollo just uses templates."

   Leave blank to skip (agents will derive a tentative one from competitor research, marked TODO).
   ```
   If the user answers "I don't know" or leaves it blank: print `OK — I'll derive a tentative differentiator from competitor research and mark it TODO. You can edit later in the workspace.` and set `differentiator: null`.

Store both as `problem` and `differentiator` (each may be a string or `null`). These get passed to **every** builder agent in Step 1 (so the agent shapes the README/quick-start lead from the start, rather than us rewriting after the crawl) and to the AI system prompt + SEO description generator in Step 3.5.

**[memory]** Write/update the project memory now with the collected positioning:

- File: `project_docsbook_<name>.md` (use `name` from Step 0 for no-source flow; for URL/repo, derive `<name>` from the source's repo basename or hostname).
- Frontmatter: `name: docsbook-project-<name>`, `description: User's docs project: <topic or source> for <audience>`, `metadata.type: project`
- Body: lead with the topic / source URL. Add `**Problem:** <problem>` and `**Differentiator:** <differentiator>` on their own lines if non-null (these are load-bearing for downstream copywriting). Skip the lines entirely if null — do not write `**Problem:** null`. Then `**Why:**` (user is building docs via /docsbook:run-docs-create) and `**How to apply:**` (when the user runs any /docs-* command, default to this project unless they say otherwise; use problem+differentiator as the opening hook in any generated README/quick-start).
- Add a one-line entry to `MEMORY.md` index.

Skip the write silently if an identical entry already exists. Update the existing entry if details changed.

## Step 0.25 — Decide output path

Before Step 0.5 (enrichment) and Step 1 (crawl), pick where the docs folder will live. This replaces the previous hardcoded `docs-output/<name>/` default, which surprised users by creating a folder inside their own project.

Run this detection inline (no subagent):

1. **Read cwd state** — `pwd` to get the path, then `ls -A` to see what's in it.
2. **Decide default `outputPath`:**

   | cwd state | Default `outputPath` |
   |---|---|
   | Empty directory (no files/folders or only `.git`, `.gitignore`) | `./` |
   | cwd basename contains `doc` / `docs` / `documentation` (case-insensitive) | `./` |
   | cwd has `package.json` / `pyproject.toml` / `go.mod` / `Cargo.toml` (looks like a code repo) AND no existing `docs/` | `./docs/` |
   | cwd has an existing `docs/` folder | `./docs/` (will write **alongside** existing files; agent must not delete pre-existing files) |
   | Source is a remote GitHub URL and cwd is unrelated (e.g. user is in their own dotfiles) | `docs-output/<name>/` |
   | Anything ambiguous | Ask via `AskUserQuestion` |

3. **Confirm with the user** — only if the default is ambiguous (mixed signals, e.g. cwd has both source code and a `docs/` folder, or cwd basename is unclear). Use `AskUserQuestion` with three options: detected default (recommended), `./`, alternative path. Skip the question when the default is obvious.

4. Print the decision before continuing:
   ```
   Output path: <outputPath>  (cwd: <pwd>)
   ```

Store as `outputPath`. **Pass it to every downstream subagent** in their input JSON (replacing the old hardcoded `docs-output/<name>/`). Subagents that previously wrote to `docs-output/<name>/` will now write to `<outputPath>` directly.

If `outputPath` is `./` or `./docs/` and the folder already contains markdown files, warn the user before crawl:
```
⚠️  <outputPath> already contains <N> markdown files. New files will be added alongside — existing files will not be overwritten unless they have the same path.
Continue? [Y/n]
```

## Step 0.5 — Ask about content enrichment

Before crawling, ask the user what extra marketing-driven content to generate on top of the core docs. This affects what the crawler collects (competitor mentions, domain terminology) and what the enricher writes after the crawl. Always ask — never enrich silently.

Use `AskUserQuestion` with one multi-select question and these four options plus a skip path:

```
What else should I add beyond core docs? (skip if just core)

[ ] Competitor comparison posts (3–5)
    blog/<you>-vs-<competitor>.md — catches "X vs Y" / "X alternative" searches.
    Highest-intent SEO traffic. Competitors fund your funnel.

[ ] Educational topic cluster (3–5)
    learn/ — top-of-funnel content teaching your domain, not your product.
    Each page ends with a soft CTA. AI engines love explanatory content for citations.

[ ] Glossary + Use-cases (3–5 each)
    glossary/ for "what is <term>" featured snippets + AI Overviews.
    use-cases/ for persona/scenario pages (better conversion than feature pages).

[ ] Migration guides (3–5)
    migrate-from-<competitor>.md — catches users actively churning. Very high intent.
```

Capture the selected categories as `enrichSections` (array of strings using these slugs: `competitor-vs`, `educational`, `glossary-usecases`, `migration`). If the user picks nothing, `enrichSections = []` and Step 1.5 is skipped entirely.

If `competitor-vs` or `migration` is selected, ask a quick follow-up via `AskUserQuestion` (text via "Other" path): "Which competitors should I compare against? (comma-separated, or leave blank to auto-detect)". Store as `competitorsHint` (array, possibly empty). The enricher does its own detection if this is blank.

**Memory shortcut:** if a `project_docsbook_<name>_research.md` memory exists from a prior run, pre-fill `competitorsHint` from it and tell the user: `Using competitors from your saved research: <list>. Override? [y/N]`. If they say `y`, ask the question normally.

If the no-source flow ran in Step 0 and `docs-from-scratch` returned a `competitors` list, pass that as `competitorsHint` to the enricher automatically — no need to re-ask.

## Step 1 — Detect source, then crawl (or research from scratch)

Classify the source inline (no subagent — this is cheap):

0. **No source** (came from Step 0) → route to **`docs-from-scratch`**.

1. **GitHub URL** matching `https?://github.com/<owner>/<repo>` or `github.com/<owner>/<repo>` → fetch the repo root via `gh api repos/<owner>/<repo>/contents` (or list a local clone if already present). Look for **docs-platform markers** first:

   | Marker file in repo root | Platform → route |
   |---|---|
   | `mint.json` / `docs.json` (with `name` + `navigation`) | mintlify → `docs-platform-importer` |
   | `SUMMARY.md` and no other config | gitbook → `docs-platform-importer` |
   | `docusaurus.config.js` / `.ts` / `.mjs` | docusaurus → `docs-platform-importer` |
   | `theme.config.tsx` + `nextra` in `package.json` | nextra → `docs-platform-importer` |
   | `.vitepress/config.*` | vitepress → `docs-platform-importer` |
   | `astro.config.*` + `@astrojs/starlight` | starlight → `docs-platform-importer` |

   No marker → route to **`docs-code-crawler`** (treat as a code repo).

2. **Plain URL** (anything else) → route to **`docs-site-crawler`**.

3. **Local path** → if it contains any marker above → `docs-platform-importer`; if it contains `package.json` / `pyproject.toml` / `go.mod` / `Cargo.toml` → `docs-code-crawler`; otherwise refuse with `Local path doesn't look like a code repo or docs platform. Pass a URL instead, or omit the argument to generate from a topic.`

Invoke the chosen subagent with the input shape it expects. **Always include `outputPath`** (from Step 0.25) and the positioning fields **`problem`** + **`differentiator`** (from Step 0.1) — every agent uses them to shape the README/quick-start lead. Pass them as `null` when the user skipped:

- `docs-from-scratch`: `{"topic":"<topic>","problem":<problem>,"differentiator":<differentiator>,"name":"<name>","audience":"<audience>","competitorsHint":<array>,"language":"en","outputPath":"<outputPath>"}`
- `docs-site-crawler`: `{"url":"<url>","name":"<name>","sourceUrl":"<url>","problem":<problem>,"differentiator":<differentiator>,"outputPath":"<outputPath>"}`
- `docs-code-crawler`: `{"source":"<github-url-or-path>","name":"<name>","sourceUrl":"<source>","problem":<problem>,"differentiator":<differentiator>,"outputPath":"<outputPath>"}`
- `docs-platform-importer`: `{"source":"<github-url-or-path>","name":"<name>","sourceUrl":"<source>","problem":<problem>,"differentiator":<differentiator>,"outputPath":"<outputPath>"}`

Print the routing decision before the call: `Detected: <type> → invoking <subagent>`.

If the chosen subagent returns `{"status":"error",...}`, surface the `reason` and `hint` verbatim and stop — nothing downstream can run without a docs folder. For `docs-site-crawler` `spa_no_ssr` / `bot_blocked` errors, suggest re-running with the GitHub repo URL if the user has one (`/docsbook:run-docs-create https://github.com/<owner>/<repo>`). For `docs-from-scratch` `topic_too_vague` / `no_competitors_found`, surface the hint and stop.

Capture `path` from the response for the next step.

**[memory]** If `docs-from-scratch` ran and returned a `research` object (or wrote `<path>/_research.json`), write a `project` memory capturing the competitor set and domain terminology. This prevents future runs from re-researching the same niche:

- File: `project_docsbook_<name>_research.md`
- Frontmatter: `metadata.type: project`, `description: Researched competitor set and domain terms for <name>`
- Body: list competitors (with URLs), top domain terms, tone signals. `**Why:**` (research output from /docsbook:run-docs-create, expensive to regenerate). `**How to apply:**` (reuse for /docs-content-enricher competitors, for AI chat tuning, for future /docsbook:run-docs-create runs on the same project).
- Link to the project memory via `[[docsbook-project-<name>]]`.

Skip silently if an identical entry exists. Update if competitors changed.

## Step 1.5 — Enrich content (only if `enrichSections` is non-empty)

Skip this step entirely if `enrichSections = []`.

Invoke `docs-content-enricher` with:

```json
{
  "path": "<path>",
  "name": "<name>",
  "sourceUrl": "<source-url>",
  "sections": <enrichSections>,
  "competitors": <competitorsHint>,
  "pagesPerSection": 4
}
```

Print before the call: `Enriching with: <sections joined by ", "> — generating up to <pagesPerSection × len(sections)> pages.`

After it returns, surface a one-line summary per section:

```
Enrichment results:
  competitor-vs:     <n> pages → blog/
  educational:       <n> pages → learn/
  glossary-usecases: <n> pages → glossary/, use-cases/
  migration:         <n> pages → migrate-from-*.md
```

If the enricher returns `{"status":"ok"}` with non-empty `skipped`, print the skipped reasons verbatim — do not fail the pipeline; the core docs are still good to publish.

If the enricher returns `{"status":"error",...}`, print the `hint` and **continue** to Step 2 with the un-enriched docs. Enrichment is a nice-to-have, not a blocker.

## Step 2 — Preview, then confirm before publish

Print a real preview so the user can decide with eyes open, not blind:

1. Run `tree <path> -L 2 --noreport` (or `find <path> -maxdepth 2 -type f | sort` if `tree` is missing). Print the tree verbatim — this now includes any enriched folders (`blog/`, `learn/`, `glossary/`, `use-cases/`, `migrate-from-*.md`).
2. Pick up to 3 representative pages — `README.md` first, then the largest two `.md` files. If enrichment ran, also print the first 15 lines of one enriched page (pick the first one from `generated.competitor-vs` or whatever non-empty section comes first). Each excerpt as a fenced block prefixed with the relative path.
3. Print the one-line summary (`<pages> core pages + <enriched> marketing pages, branding: <accent> <scheme>, favicon: <yes/no>`).
4. If `ghReady` is false: print `⚠️  gh not authenticated — run \`gh auth login\` then \`/docsbook:run-docs-publish <path>\` to publish.` and **stop here cleanly** with `status: crawl_only`. Do not ask about publishing.
5. If `ghReady` is true: ask a single yes/no confirmation before pushing. Docsbook always reads from GitHub — there is no "Docsbook only" path that skips GitHub.

   Print this verbatim (substitute values), then ask:

   ```
   Ready to publish:

   → github.com/<owner>/<repo>   (public repo, created now)
   → docsbook.io/<owner>/<repo>  (live docs site, configured automatically)

   Crawled by Google. Cited by ChatGPT / Perplexity / Gemini. Free plan.

   Publish now? [yes / no]   (default: yes)
   ```

   If the user answers `no` or `local`: stop with `status: crawl_only` and print `Docs saved at <path>. Run /docsbook:run-docs-publish <path> when ready.`
   If the user answers `yes`: set `publishMode = "public"` and continue to Step 3 with `private: false`.

## Step 3 — Publish

Invoke `docs-publisher` with:

```json
{"path":"<path>","owner":"<owner>","repo":"<repo>","description":"<derived>","private":<publishMode === "private">}
```

Capture `githubUrl` and `docsbookUrl`. On error, print and stop — the workspace step needs the repo to exist.

**[memory]** Write a `reference` memory pointing at the created repo and docs URLs, so future `/docs-*` sessions know where the user's published docs live:

- File: `reference_docs_repo_<name>.md`
- Frontmatter: `metadata.type: reference`, `description: Published docs for <name> — GitHub repo and Docsbook URL`
- Body: list `githubUrl`, `docsbookUrl`, and the local path. One sentence on when to look here (e.g. "When the user asks about updating, redeploying, or fixing the docs for <name>, this is the canonical location").
- Link via `[[docsbook-project-<name>]]`.

## Step 3.5 — Generate workspace settings (pre-fill for Step 4)

Before showing the confirm-block in Step 4, derive concrete values for everything the configurator will push. Generating them HERE (in the orchestrator, with access to research + folder structure) means the user sees real previews — not placeholders — and the configurator stays a thin executor.

Build these in memory, do not write to disk yet:

1. **Subheader folders** (`subheaderFolders`) — read top-level directories of `<path>`. Whitelist user-facing folders, drop infrastructure:
   - **Include:** `guides/`, `api/`, `reference/`, `blog/`, `learn/`, `glossary/`, `use-cases/`, `tutorials/`, `concepts/`, `integrations/`, `migration/` (only if they exist AND have ≥1 `.md`)
   - **Always include:** "Home" → `/` (first slot)
   - **Drop:** anything starting with `.` or `_`, and `assets/`, `images/`, `examples/` (raw files, not pages)
   - Cap at 6 items. If user has >6 candidate folders, take the first 6 alphabetically.
   - Render as: `[{label:"Home",url:"/"},{label:"Guides",url:"/guides"},{label:"API",url:"/api"},...]` — labels are Title-Cased from the folder name.

2. **AI custom questions** (`aiCustomQuestions`) — 4 starter-questions a new visitor might ask. Generate from:
   - The topic + `problem` + JTBD (from `_research.json` if `docs-from-scratch` ran, otherwise from the user's Step 0 / 0.1 answers + the crawled README/landing intro)
   - The names of the top 3 guides/pages by size

   Each question must be specific (not "What is this?") and answerable from the docs. Examples for a sales-email product:
   - "How do I import my prospect list from Apollo?"
   - "What's the deliverability score and how is it calculated?"
   - "Can I A/B test subject lines?"
   - "How do I export sequences as CSV?"

   If you cannot derive 4 concrete questions (no research, no guides), generate 2 generic ones tagged with the topic and warn `aiCustomQuestions: ["fallback — only 2 generic questions, refine in workspace"]`.

3. **AI system prompt** (`aiSystemPrompt`) — one short paragraph that primes the chatbot with positioning, audience, and tone. Template:

   ```
   You are the documentation assistant for <name>, <topic>.

   Your users are <audience>. They come to the docs to <primary JTBD from research or topic>.

   <name>'s point of leverage vs alternatives: <differentiator or "see /blog comparison posts">.

   Tone: <toneSignals joined> — match the voice of the docs themselves. Never invent product features. If the answer isn't in the docs, say so and link to the closest page.
   ```

   Substitute every `<...>` with real values. If `differentiator` is null (user skipped in Step 0.1), drop that sentence entirely instead of leaving a placeholder.

4. **SEO / GEO / AEO toggles** — three independent booleans, all default `true` (the user can flip them in Step 4):
   - `enableSeo` — sitemap, robots, page meta, OG tags. Almost always wanted.
   - `enableGeo` — Generative Engine Optimization: structured AI-friendly content, llms.txt, citation hooks. Almost always wanted.
   - `enableAeo` — Answer Engine Optimization: FAQ schema, featured-snippet shaped paragraphs, voice-search structure. Wanted unless docs are highly technical/API-only.

   Pre-fill `seoTitle` as `<name> — <topic shortened to ≤60 chars>` and `seoDescription` as `<problem in plain language, ≤155 chars>`. `topic` comes from Step 0 (no-source) or is derived from the crawled `<title>` / repo description; `problem` comes from Step 0.1 for all routes. If `problem` is null, fall back to the README.md first paragraph.

Store all of the above in scope for Step 4.

## Step 4 — Confirm workspace settings, then configure

Print **one big confirm-block** with all the pre-filled values from Step 3.5 so the user sees exactly what will land in the workspace. No mystery, no plan-gated surprises hidden inside the configurator.

```
Docsbook workspace will be configured:

  Branding
    • Accent color: <accentColor>
    • Scheme: <detectedScheme> (theme toggle: <yes/no>)
    • Favicon: <yes/no>

  UI (standard preset)
    • Theme toggle, breadcrumbs, prev/next, copy button, page feedback, search button

  Subheader navigation
    <list of subheaderFolders as "  → Label (url)">

  AI chat
    • Enabled (PRO-gated)
    • System prompt:
        <aiSystemPrompt — print first 200 chars + "..." if longer>
    • Custom starter questions:
        <list aiCustomQuestions as "  → "question"">

  SEO / GEO / AEO  (all PRO-gated)
    • SEO  [<X> enable]   title: <seoTitle>
                         desc:  <seoDescription>
    • GEO  [<X> enable]   llms.txt + AI citation hooks
    • AEO  [<X> enable]   FAQ schema + featured-snippet structure

  Languages (PRO-gated)
    • en, zh, ja, ru

  Source link
    • Header link "Website" → <sourceUrl>  (skipped if no source)

Apply all? [Y/n/customize]
```

- On `Y` (or empty): proceed with the full payload below.
- On `n`: skip Step 4 entirely; print `Workspace not configured — run /docsbook:run-docs-setup-workspace <owner>/<repo> later.` and jump to Final output.
- On `customize`: ask the user what to change via a follow-up `AskUserQuestion` with these toggles:
  - Disable SEO / GEO / AEO individually
  - Edit AI system prompt (open the rendered prompt in a text response, accept new text)
  - Edit AI custom questions (same)
  - Replace subheader folders (accept comma-separated label:url pairs)
  - Drop a whole section (`branding`, `ui`, `navigation`, `ai`, `seo`, `languages`)

  Apply the user's edits to the payload and re-print the updated confirm-block. Loop until they say `Y` or `n`.

Invoke `docs-workspace-configurator` with:

```json
{
  "owner": "<owner>",
  "repo": "<repo>",
  "path": "<path>",
  "sourceUrl": "<url>",
  "sections": ["branding","ui","navigation","ai","seo","geo","aeo","languages"],
  "subheaderFolders": <subheaderFolders>,
  "aiSystemPrompt": "<aiSystemPrompt>",
  "aiCustomQuestions": <aiCustomQuestions>,
  "seo": {"enabled": <enableSeo>, "title": "<seoTitle>", "description": "<seoDescription>"},
  "geo": {"enabled": <enableGeo>},
  "aeo": {"enabled": <enableAeo>}
}
```

This is the only Sonnet step in the chain — it deals with stateful MCP writes and plan-gated errors.

If the configurator returns `{"status":"mcp_unavailable",...}`, do not treat it as a hard failure — the docs are already live on GitHub. Print the MCP setup instructions and mark this step as skipped.

**[memory]** If the configurator returned a workspace ID or applied any settings successfully, extend the existing `reference_docs_repo_<name>.md` memory with the workspace ID and which sections were applied. Do not create a separate file — keep all "where it lives" facts in one entry.

## Final output

Pick the variant that matches how far the pipeline got. If the no-source flow ran, replace "Crawl:" with "Research:" and surface the competitor count.

**Full pipeline (publish + workspace applied):**

```
✅ Done.
🐙 GitHub:    <githubUrl>
📚 Docsbook:  <docsbookUrl>

Crawl:     <pages> pages
Enrich:    <enrichedPages> marketing pages (<enrichSections joined>)
Publish:   <markdownFiles> markdown files
Workspace: applied <applied>; plan-gated <planGated>
```

**Full pipeline, no-source variant:**

```
✅ Done.
🐙 GitHub:    <githubUrl>
📚 Docsbook:  <docsbookUrl>

Research:  <competitorCount> competitors analysed (<competitor list>)
Generate:  <pages> pages written
Enrich:    <enrichedPages> marketing pages (<enrichSections joined>)
Publish:   <markdownFiles> markdown files
Workspace: applied <applied>; plan-gated <planGated>

⚠️  Some pages contain TODO markers — review and fill in product-specific details before sharing publicly.
```

Omit the `Enrich:` line if no enrichment ran. Omit the TODO warning if `docs-from-scratch` reported no TODOs.

**Crawl only (no `gh` or user declined publish):**

```
✅ Docs ready at <path> (<pages> core + <enrichedPages> marketing pages).

Next:
  gh auth login                   # if not yet authenticated
  /docsbook:run-docs-publish <path>            # push to GitHub
  /docsbook:run-docs-setup-workspace <o>/<r>   # configure Docsbook
```

**Published but workspace skipped or MCP unavailable:**

```
✅ Published.
🐙 GitHub:    <githubUrl>
📚 Docsbook:  <docsbookUrl>

Workspace not configured. To configure later:
  <instructions from configurator response, verbatim>
```

## Memory: capturing style feedback

If during the pipeline the user **corrects** the docs style ("don't use emojis", "make it shorter", "drop the marketing tone", "no competitor pages") or **confirms** a non-obvious choice ("yes, keep the migration guides — that's exactly what I wanted"), write a `feedback` memory:

- File: `feedback_docs_style.md` (one shared file across projects — append, don't fork per-project)
- Frontmatter: `metadata.type: feedback`, `description: User preferences for docs style and enrichment choices`
- Body for each rule: lead with the rule, then `**Why:**` (quote the user's reason if given), then `**How to apply:**` (which step in /docsbook:run-docs-create or which subagent input this should pre-fill).

If a `feedback_docs_style.md` memory already exists, **read it before Step 0.5** and use it to:
- Pre-select enrichment options the user has previously approved
- Adjust the subagent inputs (e.g. add `"toneOverrides": ["no_emojis"]`)

Never offer to save a memory the user did not actually express. A single "Y/N" on a prompt is not feedback unless the user added a reason.

## Knowledge references

- [`docs-from-site` skill](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-create/references/sources.md) — website crawl tips, writing rules
- [`docs-from-code` skill](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-create/references/sources.md) — code-repo extraction rules, API enumeration per language
- [`docs-from-docs` skill](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-create/references/sources.md) — platform-by-platform MDX normalisation tables
- [`docs-publish` skill](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-create/references/publish.md) — HTTPS vs SSH, `gh repo create` pitfalls
- [`docs-setup-workspace` skill](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-manage/references/site-config.md) — MCP probe order, plan-gated calls
- [`docs-create` skill](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-create/SKILL.md) — overall pipeline rationale
- `docs-content-enricher` agent (local) — generates competitor/vs, learn/, glossary/, use-cases/, and migration pages on top of crawled docs. Honest tone, real evidence only, never fabricates competitors or terms.
- `docs-from-scratch` agent (local) — when no source URL/repo exists, takes a project topic and researches 3–5 competitors via WebSearch+WebFetch, then writes original docs following the domain's conventions. Marks product-specific claims with TODO so the user can fill them in once the product exists.
