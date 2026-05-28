---
description: Full pipeline — crawl a URL, optionally enrich with marketing pages, publish to GitHub, configure the Docsbook workspace
allowed-tools: Agent, Read, Bash, AskUserQuestion
---

# /docs-create — full crawl → enrich → publish → configure pipeline

End-to-end orchestrator. Detects the source type, picks one of three pinned builder subagents, optionally enriches with marketing-driven pages, then chains publish + configure:

1. **Source detection** (inline, no subagent — see Step 1) routes to one of:
   - `docs-site-crawler` (Haiku) — for marketing websites
   - `docs-code-crawler` (Haiku) — for GitHub source code repos
   - `docs-platform-importer` (Haiku) — for existing docs on Mintlify / GitBook / Docusaurus / Nextra / VitePress / Starlight
2. `docs-content-enricher` (Haiku, optional) — adds competitor comparisons, educational topic cluster, glossary + use-cases, and migration guides on top of the crawled docs
3. `docs-publisher` (Haiku) → creates GitHub repo and pushes
4. `docs-workspace-configurator` (Sonnet) → applies branding/UI/AI/SEO via Docsbook MCP

This command does not contain any crawl, git, or MCP logic itself — it only routes the source, then passes outputs of one subagent into the input of the next.

## Arguments

- `$ARGUMENTS[0]` — source: website URL, GitHub repo URL, or local path (required)
- `$ARGUMENTS[1]` — output name / repo basename (optional; derived from source)
- `$ARGUMENTS[2]` — `owner` for GitHub (optional; defaults to authenticated gh user)

If no source is provided, ask the user.

## Pre-flight

Run `gh auth status`. Capture the result as `ghReady` (true/false) but **do not stop** if it fails — the crawl step works without it and the user gets to see their docs locally before being asked to authenticate. Only the publish step needs `gh`.

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

## Step 1 — Detect source, then crawl

Classify the source inline (no subagent — this is cheap):

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

3. **Local path** → if it contains any marker above → `docs-platform-importer`; if it contains `package.json` / `pyproject.toml` / `go.mod` / `Cargo.toml` → `docs-code-crawler`; otherwise refuse with `Local path doesn't look like a code repo or docs platform. Pass a URL instead.`

Invoke the chosen subagent with the input shape it expects:

- `docs-site-crawler`: `{"url":"<url>","name":"<name>","sourceUrl":"<url>"}`
- `docs-code-crawler`: `{"source":"<github-url-or-path>","name":"<name>","sourceUrl":"<source>"}`
- `docs-platform-importer`: `{"source":"<github-url-or-path>","name":"<name>","sourceUrl":"<source>"}`

Print the routing decision before the call: `Detected: <type> → invoking <subagent>`.

If the chosen subagent returns `{"status":"error",...}`, surface the `reason` and `hint` verbatim and stop — nothing downstream can run without a docs folder. For `docs-site-crawler` `spa_no_ssr` / `bot_blocked` errors, suggest re-running with the GitHub repo URL if the user has one (`/docs-create https://github.com/<owner>/<repo>`).

Capture `path` from the response for the next step.

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
4. If `ghReady` is false: print `⚠️  gh not authenticated — run \`gh auth login\` then \`/docs-publish <path>\` to publish.` and **stop here cleanly** with `status: crawl_only`. Do not ask about publishing.
5. If `ghReady` is true: ask `Publish to GitHub as <owner>/<repo>? [y/N]`. On no, stop with the path printed so the user can edit and run `/docs-publish` later.

## Step 3 — Publish

Invoke `docs-publisher` with:

```json
{"path":"<path>","owner":"<owner>","repo":"<repo>","description":"<derived>","private":false}
```

Capture `githubUrl` and `docsbookUrl`. On error, print and stop — the workspace step needs the repo to exist.

## Step 4 — Confirm workspace settings, then configure

Before invoking the configurator, print the settings about to be applied and ask for confirmation:

```
Docsbook workspace will be configured:
  • Branding: accent <accentColor>, scheme <detectedScheme>
  • UI: standard preset (theme toggle, breadcrumbs, copy button, page feedback)
  • Navigation: + "Website" header link → <sourceUrl>
  • AI chat: enabled (PRO-gated)
  • SEO: enabled (PRO-gated)
  • Languages: en, zh, ja, ru (PRO-gated)

Apply all? [Y/n/customize]
```

- On `Y` (or empty): proceed with the full payload below.
- On `n`: skip Step 4 entirely; print `Workspace not configured — run /docs-setup-workspace <owner>/<repo> later.` and jump to Final output.
- On `customize`: ask which sections to enable as a comma-separated list (`branding,ui,navigation,ai,seo,languages`). Pass only the chosen sections in a new `sections` field.

Invoke `docs-workspace-configurator` with:

```json
{"owner":"<owner>","repo":"<repo>","path":"<path>","sourceUrl":"<url>","sections":["branding","ui","navigation","ai","seo","languages"]}
```

This is the only Sonnet step in the chain — it deals with stateful MCP writes and plan-gated errors.

If the configurator returns `{"status":"mcp_unavailable",...}`, do not treat it as a hard failure — the docs are already live on GitHub. Print the MCP setup instructions and mark this step as skipped.

## Final output

Pick the variant that matches how far the pipeline got.

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

Omit the `Enrich:` line if no enrichment ran.

**Crawl only (no `gh` or user declined publish):**

```
✅ Docs ready at <path> (<pages> core + <enrichedPages> marketing pages).

Next:
  gh auth login                   # if not yet authenticated
  /docs-publish <path>            # push to GitHub
  /docs-setup-workspace <o>/<r>   # configure Docsbook
```

**Published but workspace skipped or MCP unavailable:**

```
✅ Published.
🐙 GitHub:    <githubUrl>
📚 Docsbook:  <docsbookUrl>

Workspace not configured. To configure later:
  <instructions from configurator response, verbatim>
```

## Knowledge references

- [`docs-from-site` skill](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-from-site/SKILL.md) — website crawl tips, writing rules
- [`docs-from-code` skill](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-from-code/SKILL.md) — code-repo extraction rules, API enumeration per language
- [`docs-from-docs` skill](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-from-docs/SKILL.md) — platform-by-platform MDX normalisation tables
- [`docs-publish` skill](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-publish/SKILL.md) — HTTPS vs SSH, `gh repo create` pitfalls
- [`docs-setup-workspace` skill](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-setup-workspace/SKILL.md) — MCP probe order, plan-gated calls
- [`docs-create` skill](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-create/SKILL.md) — overall pipeline rationale
- `docs-content-enricher` agent (local) — generates competitor/vs, learn/, glossary/, use-cases/, and migration pages on top of crawled docs. Honest tone, real evidence only, never fabricates competitors or terms.
