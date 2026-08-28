# Sources — the four routes into creation

Detection is read-only and never mutates the source. Each route below ends at the same place: a set of files on disk plus a record of what could not be read and why.

## Detecting which route to take

| Input shape | Check | Route |
|---|---|---|
| Plain URL | HTML meta tags, CDN links, domain | **site**, unless a platform marker appears |
| `github.com/<owner>/<repo>` | Root contents for marker files | **code** if only README + source dirs; **migration** on a marker |
| Local path | Same marker files on disk | as above |
| Product name only | — | **idea** |

Platform markers:

| Marker | Platform |
|---|---|
| `mint.json` / `docs.json` | Mintlify |
| `SUMMARY.md` at root | GitBook |
| `docusaurus.config.js` / `.ts` | Docusaurus |
| `theme.config.tsx` + Next.js | Nextra |
| `.vitepress/config.*` | VitePress |
| `astro.config.*` + `@astrojs/starlight` | Starlight |

A single ambiguous signal is not a detection. Inconclusive input defaults to **site**.

---

## Route: site

### Why the naive crawl fails

Most modern product sites are JavaScript SPAs. A plain HTTP fetch of `/`, `/docs`, `/features`, `/blog/<slug>` returns an empty shell or a 404 — the real content is behind the render. A skill that fetches flat HTML and finds a thin `<main>` will silently fall back to *inventing* generic content. That is the single failure mode that produces a bland site.

**Render first.** Use a real browser to load each page and read the rendered `<main>` / `<article>`. Fall back to a plain fetch only for pages that are already server-rendered. Never write a page from a shell you could not read — skip it and note why.

Detection is the exception: platform signals live in the HTML shell, so a plain fetch is enough to *route*. It is never enough to *read*.

### Steps

1. **Map the site.** `/sitemap.xml` first. If missing, discover links from the rendered homepage and the header/footer nav.
2. **Find their existing docs — it is the best source.** Check `/docs`, `/documentation`, `/help`, `/guides`, `/api`, `/faq`, and product-relevant `/blog` paths, plus `docs.*` and `help.*` subdomains. If a docs site already exists, walk *its* structure: that sidebar is a ready-made folder skeleton, and mirroring it turns "invent docs" into "reproduce their docs, better".
3. **Read the real content.** Prioritise doc-relevant paths over marketing fluff. Cap at ~50 pages. Hard-exclude `/login`, `/signup`, `/auth`, `/checkout`, `/cart`. Take the rendered `<main>` / `<article>` text, stripping `<header>`, `<footer>`, `<nav>`, `<aside>`. Keep explanatory images as absolute-URL `![alt](url)`; skip decorative ones.
4. **Collect brand signals** — see `product-audit.md`, "Brand signals".

Every claim, feature and example in the output must come from what you actually read.

---

## Route: code

1. **Resolve the repo.** Shallow-clone a remote URL into a temp directory; work in place for a local path. The project name is the `<repo>` part after `owner/`.
2. **Detect the project type** from root files: `package.json` (Node/TS), `pyproject.toml` / `setup.py` (Python), `go.mod` (Go), `Cargo.toml` (Rust), `*.csproj` (.NET). On conflict, prefer the signal whose `lib` / `src` / `pkg` directory exists.
3. **Turn the README into a benefit-first hero** — lead with what the project does, who it is for, and the outcome. Not "Installation". Split long top-level sections (`## Installation`, `## Usage`, `## API`) into dedicated pages under `getting-started/`, `guides/`, `api/`.
4. **Enumerate the public API surface.** Node/TS: `package.json#exports` plus the entry files. Python: `__all__` of the top package. Go: exported identifiers per top-level package. One Markdown file per module or package under `api/`.
5. **Pull in examples.** `examples/`, `samples/`, `demo/` → `guides/<example>.md`, using each subfolder's README or a generated one.
6. **Read configuration.** `.env.example`, `config/*.example.*`, `docker-compose.yml` → `guides/configuration.md`, with descriptions taken from adjacent comments.
7. **Add `concepts.md`** when the project has a non-trivial mental model, and `faq.md` (6–10 Q&A synthesised from README and issues: how it compares, its limits, its requirements).

Do not invent API documentation. A function with no docstring gets its signature plus `TODO: describe what this does`. Group by package, never one page per file. Never commit secrets.

---

## Route: migration

The folder structure already exists — reproduce it faithfully. Its nav becomes the sub-header. The one enrichment worth adding is an FAQ or use-case page when the source has none.

1. **Identify the platform** from the marker table above.
2. **Read the navigation** — `mint.json#navigation`, `SUMMARY.md`, `docusaurus.config.js#sidebars`, `.vitepress/config.ts#themeConfig.sidebar`. Build a flat ordered list of `{label, sourcePath}`.
3. **Copy and normalise.** Keep `title`, `description`, `slug`; drop frontmatter keys that do not translate. Convert:
   - Mintlify `<Card>`, `<CardGroup>`, `<Accordion>`, `<Note>` → headings + lists; callouts as `> **Note:** …`
   - Docusaurus `<Tabs>` / `<TabItem>` → `### Tab name` headings with content underneath
   - GitBook `{% hint %}` → `> **Hint:** …`; `{% tabs %}` → headings
   - Nextra `<Callout>` → `> **Note:** …`
   - Strip every `import` line at the top of `.mdx` files.
4. **Rewrite internal links** to relative paths between output files. Leave external `https://` links alone.
5. **Carry over assets.** `static/`, `public/`, `images/` referenced by imported pages → `_assets/`, with image sources updated.
6. **Record the platform's accent colour** if its config declares one; omit the field otherwise.

Never lose content: a component that cannot be normalised keeps its inner text verbatim plus `> **TODO:** original used <ComponentName>, may need styling tweak.` Preserve heading hierarchy — do not flatten H3s into H2s to look cleaner. Keep slugs URL-stable: `/docs/getting-started/installation` becomes `getting-started/installation.md`, not `installation.md`. Pure-React `.mdx` files with no prose are skipped into `warnings`, not errored on. Imported prose stays as written; the active-voice rules apply only to sentences you add.

---

## Route: idea

No source exists, so the constraint inverts: invent the **pages**, never the **facts**.

1. **One question maximum.** If the message already carries a product name or concept, use it. Otherwise ask exactly one: "What is your product? (name + one-liner)". Infer category, audience and tone, state what you inferred, and proceed. Do not ask about colour, page count, structure or tone.
2. **Compose the page set inline** — no separate plan file. A hero, a getting-started, 3–5 benefit-first feature pages, 1–3 use-cases, an FAQ of 6–10 objection-killing Q&A, and optionally one educational or comparison piece where the category rewards it.
3. **Write conversion-grade from the first draft** — marketing-grade language, not placeholder copy. Every page ends with a next-step action.

Never invent competitor names or real-world facts. If a comparison or migration section is wanted and no names were given, ask once or omit the section. Never fall back to a default accent colour — omit the field when no colour is deterministic for the domain.

This route does not hand off to a planning interview. It generates.
