---
name: docs-from-docs
description: Import existing documentation from Mintlify, GitBook, Docusaurus, Nextra, or VitePress into a clean docs-output/<name>/ folder ready for Docsbook. Preserves structure and content; normalises platform-specific syntax to plain Markdown. Use when migrating away from another docs platform.
metadata:
  version: 1.0.0
  category: creation
  mode: authoring
  requires_docsbook_mcp: false
  keywords: [import, migrate, mintlify, gitbook, docusaurus, nextra, vitepress, platform]
---

# docs-from-docs — Import from another docs platform

This skill is the executor — read the source platform, mirror its structure, normalise the syntax, and publish. Because you are migrating an existing docs site, the folder structure is already there: reproduce it faithfully (its nav → the sub-header). The one enrichment worth adding is a `faq.md` / `use-cases` page if the source lacks one — it kills evaluation objections and feeds the AEO layer.

## Workflow

0. **Name the project — don't invent it.** Take the name from the source repo name, the existing docs site's brand (`<title>` / `og:site_name`), or the platform config's title field. Use it for the `docs-output/<name>/` folder and the workspace display name. If none is readable, ask the user — never use a placeholder.
1. **Identify the platform.** Read the repo root for the marker file:

   | Marker | Platform |
   |---|---|
   | `mint.json` / `docs.json` | Mintlify |
   | `SUMMARY.md` at root | GitBook |
   | `docusaurus.config.js` / `.ts` | Docusaurus |
   | `theme.config.tsx` + Next.js | Nextra |
   | `.vitepress/config.*` | VitePress |
   | `astro.config.*` + `@astrojs/starlight` | Starlight |

2. **Read the navigation.** Each platform stores nav differently — `mint.json#navigation`, `SUMMARY.md`, `docusaurus.config.js#sidebars`, `.vitepress/config.ts#themeConfig.sidebar`. Build a flat list of `{label, sourcePath}` entries in display order.

3. **Copy and normalise pages.** For every entry, read the source `.md` / `.mdx` and write to `docs-output/<name>/<derived-path>.md`. Drop platform-specific frontmatter keys that don't translate; keep `title`, `description`, `slug`. Convert:
   - Mintlify `<Card>`, `<CardGroup>`, `<Accordion>`, `<Note>` → plain Markdown headings + lists, callouts as `> **Note:** ...`
   - Docusaurus `<Tabs>`, `<TabItem>` → headings (`### Tab name`) with content underneath
   - GitBook `{% hint %}` → `> **Hint:** ...`; `{% tabs %}` → headings
   - Nextra `<Callout>` → `> **Note:** ...`
   - Strip every `import` line at the top of `.mdx` files; Docsbook renders plain Markdown.

4. **Rewrite internal links.** Replace platform-specific paths (e.g. Docusaurus `/docs/intro`) with relative paths between output files. Leave external `https://` links untouched.

5. **Carry over assets.** Copy any `static/`, `public/`, or `images/` directories referenced by the imported pages into `docs-output/<name>/_assets/` and update image src accordingly.

6. **Write `_branding.json`.** Pull `colors.primary` / `theme.accent` from the platform config. If absent, leave `accentColor` out so the workspace configurator skips the branding step.

7. **Preview + confirm.** Print the folder tree and excerpts from up to 3 representative pages. Ask before publishing: "Does this look right? Type **yes** to publish, or describe what to change." (Auto-mode may skip the ask.)

8. **Publish — one atomic commit.** Apply `/docs-publish` logic: if a Docsbook workspace is connected, create it for the source `owner/repo` and commit all pages together; if your git host is authenticated and the user confirmed, push there. If neither is available, stop cleanly with `status: crawl_only`, print the local path and the follow-up publish command. Do not error.

9. **Configure the workspace.** Apply `/docs-setup-workspace` unconditionally after a successful publish — branding (from `_branding.json`), UI affordances, the nav sub-header from the mirrored folders, and plan-gated SEO/AEO/GEO/AI where allowed. This is a competitor-migration pitch ("moved your docs off Mintlify — here's the difference"), so the AI chat and affordances are the visible upgrade. If MCP is unreachable, print the connection command and exit cleanly.

## Guardrails

- Never lose content. If a custom component cannot be normalised, paste its inner text verbatim and add `> **TODO:** original used <ComponentName>, may need styling tweak.`
- Preserve heading hierarchy — do not flatten H3s into H2s to "look cleaner".
- Hard-skip `.mdx` files that are pure React (no markdown text) — log to `warnings`, don't error.
- Keep slugs URL-stable: if the original was `/docs/getting-started/installation`, write to `getting-started/installation.md`, not `installation.md`.
- When committing into an existing repo, write to the repo **root** (or an existing `docs/` folder if present) — never add a new top-level `docs/` wrapper for a fresh repo. The project name comes from the source, not a guess.
- Active voice, second person — but only when rewriting your own additions. Imported content stays as-is.

## Acceptance Criteria

- [ ] Platform identified from marker file before any conversion runs
- [ ] Navigation reproduced in the output folder structure
- [ ] Platform-specific MDX components normalised to plain Markdown
- [ ] Internal links rewritten to relative paths between output files
- [ ] Referenced images copied into `_assets/`
- [ ] `_branding.json` carries the platform's accent color when present, otherwise omits it
- [ ] A `faq.md` / use-cases page added if the source had none
- [ ] Preview (tree + excerpts) printed before any publish prompt
- [ ] All pages published in one atomic commit (or `crawl_only` with local path + follow-up command)
- [ ] `/docs-setup-workspace` applied after publish — branding, UI affordances, nav sub-header, plan-gated SEO/AEO/GEO/AI where allowed

