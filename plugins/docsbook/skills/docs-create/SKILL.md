---
name: docs-create
description: Create documentation that did not exist before — from a product website, a code repository, another docs platform you are migrating off, or nothing but a product name. Runs one pipeline: audit the product and the source, decide the structure, write the pages, preview, publish. Use when the user says create docs, generate docs, from this URL, from this repo, migrate from Mintlify/GitBook/Docusaurus, import our docs, imagine docs, we have no docs, we have no repo, without GitHub, сделай документацию, повтори документацию по ссылке, придумай документацию.
metadata:
  version: 3.1.0
  category: creation
  mode: orchestrator
  requires_docsbook_mcp: false
  accelerated_by:
    - markdown-lsp      # graph/semantic search over an existing docs tree — faster than walking files
    - docsbook-mcp      # publish pages and configure the live site, if a workspace is connected
  produces_files:
    - docs-output/<name>/**
    - docs-plan.md
  keywords: [create, generate, new-docs, from-url, from-site, from-repo, from-github, migrate, migration, import, mintlify, gitbook, docusaurus, nextra, vitepress, imagine, from-scratch, product-audit, no-docs, no-repo, no-github, without-github, hosted, сделай-документацию, придумай-документацию]
---

# docs-create — Bring documentation into existence

One skill for every way documentation gets created: from a live site, from code, from another platform (migration), or from an idea alone. The four differ only in **where the truth comes from**. Everything after that — auditing the product, choosing the structure, writing the pages, previewing, publishing — is the same pipeline, and it lives here.

**The intelligence lives in this skill, not in a helper tool.** Read the source yourself, decide the structure yourself, write the pages yourself. Delegate only publishing and configuration to whatever platform is connected.

## Companion skills

| Skill | Its job here |
|---|---|
| `docs-manage` | The writing rulebook. Load it **before** writing the first page — page types, structure, style, retrieval, conversion — and the site/feature configuration used at the publish step. |
| `docs-analyze` | Runs **after** docs exist. Do not audit your own fresh output with this skill; hand it over. |
| `docs-automate` | Wires the drift guards and monitors once the docs are live. Offer it at the end, never run it mid-pipeline. |

## Phases and their modes

An orchestrator crosses modes only at declared boundaries. These are the boundaries:

| Phase | Mode | May it write? |
|---|---|---|
| 1. Product & source audit | `audit` | Reports only. May write `docs-plan.md` and additive blocks in a private source-of-truth. |
| 2. Structure decision | `audit` | Nothing on disk except the plan. |
| 3. Generation | `authoring` | Writes new pages. Never repairs pages it did not create. |
| 4. Preview & publish | `platform` | Publishes what phase 3 wrote. Changes no content. |

## Workflow

### 0. Route the input

Classify what you were given, then read the matching section of `references/sources.md`:

| Input | Route |
|---|---|
| Product/marketing URL | **site** — render the pages, read real content |
| `github.com/<owner>/<repo>` or a local code path | **code** — README, tree, exported API, examples |
| A repo or URL carrying a docs-platform marker | **migration** — mirror the structure, normalise syntax |
| A product name or one-liner, no source | **idea** — invent the pages, never invent the facts |

One ambiguous signal is not a detection. Require a platform-specific config file or meta tag before routing to **migration**; when nothing is conclusive, default to **site** rather than blocking. A populated `<head>` does not mean the content is there — most product sites are JS shells, so the content pass renders before it reads.

**Name the project, never invent it.** In priority order: the site brand (`<title>` / `og:site_name`, taglines stripped) → the repo name after `owner/` → the platform config's title. If none is readable, ask. A placeholder name is not an acceptable fallback.

### 1. Audit the product and the source

Before deciding a single page, establish who the docs are for and what the product actually claims. This is the phase most generation skips, and it is why generated docs read like a file dump. Full method in `references/product-audit.md`; the short version:

- **Who enters, how, and against whom** — segments and their jobs-to-be-done, every entry path, the competitors the product is measured against.
- **Monetization model** — free / open-source / self-serve SaaS / sales-led. This decides whether the site needs a pricing page, a CTA ladder, or neither.
- **Call-to-action destination** — read it *before* the first page is written; every hero and every "Next steps" block depends on it. An explicitly configured CTA destination beats any CTA you would infer.
- **Brand signals** — accent colour, colour scheme, logo (wordmark) vs icon (favicon), font, social links. Record each with its source; record a missing one as missing. Never invent a colour.

Ask the discovery questions from `references/product-audit.md` only when the source cannot answer them. One question at a time, and skip any question the source already answered.

Interactive runs pause here for confirmation. Auto runs state what they inferred in one line ("treating this as a self-serve developer tool — correct me if I'm off") and continue.

### 2. Decide the structure

Derive the outline from what you found, then group leaf pages into **folders by meaning**. Folders are not cosmetic: they become the site's navigation sub-header, and that is the difference between real documentation and a flat file list.

Target **10–18 substantive leaf pages** when the source supports it. A well-scoped 8-page site beats 15 stubs; three solid pages beat five thin ones. Never create a placeholder page "for later". The page-set table, the per-type content rules, and the link-graph requirements are in `references/structure.md`.

An FAQ (6–10 genuine Q&A) and at least one use-case page are effectively mandatory. They kill an evaluating reader's objections *and* they are the structure that answer engines lift into citations — see the AEO note in `references/structure.md`.

Print the proposed tree. Interactive runs wait for approval and apply edits before generating anything.

### 3. Generate

Load `docs-manage` and write to its rules rather than restating them: page type per page, frontmatter, heading discipline, active voice, retrieval-friendly passages, the conversion pattern that matches the monetization model from phase 1. Tell the user in one line which rule sets you are applying, then apply them.

Decide the full page list *before* writing, so every page knows its real neighbours and can link to them accurately.

Non-negotiable, on every page: frontmatter `title` (50–60 chars, search-intent) and `description` (130–160 chars, active voice, states the outcome); benefit-first headings; active voice, second person; no filler ("simply", "just", "easily", "powerful", "robust", "seamless"); real product facts only — never `example.com`, never a capability the source did not show.

**Everything must trace to something you read.** A source too thin to support a page means skip the page and record why. It never means invent.

### 4. Preview, publish, configure

- Print the folder tree and excerpts from up to three representative pages plus the FAQ.
- Ask before publishing: "Does this look right? Type **yes** to publish, or describe what to change." Auto-mode may skip the ask; a silent repo creation is never acceptable.
- **Pick the transport before you look for a repository.** With the Docsbook MCP connected, the platform hosts the docs repository itself: `create_workspace` with **no** `repo_full_name` (pass `custom_name`), then `write_docs` with every page in one call. The user needs no GitHub account, no connected GitHub app and no repository of their own. A repository of theirs is an *option* (`repo_full_name: "owner/repo"`), never a precondition. Only with no platform connected does publishing mean git and a GitHub remote.
- Publish **all** pages in one atomic commit, not one file per commit. If no publishing transport is authenticated at all, stop cleanly with `status: crawl_only`, the local path, and the follow-up command. That is a valid ending, not an error.
- Configure the live site through `docs-manage` — branding from the phase-1 signals, reading affordances, the nav sub-header built from your folders, and the discovery/AI settings the plan allows. A published-but-unconfigured site undersells the work.
- **Declare the goals and the funnel the phase-1 audit already named.** That audit writes down the goals and a 3–5 step path per segment, and on almost every run they stay prose in a report: the site ships, and three months later nobody can say whether it worked, because nothing was ever declared as success. Turning them into real measurement is one step through `docs-manage`'s `references/goals-funnels.md`, and it is cheap here in a way it never is later — the person who decided what the site was for is still in the room.
- Report: local path, repository URL, live site URL, page count by folder, and every section skipped with its reason.

Details for each step: `references/publish.md`.

## Guardrails

- **Never invent.** Not brand colours, not competitors, not glossary terms, not capabilities, not metrics, not a project name. A missing signal is recorded as missing and the dependent field is skipped.
- **Never overwrite human-set branding or human-authored prose.** Enrichment is additive. Writes into a private source-of-truth go inside skill-owned markers, and a re-run replaces its own prior block rather than stacking duplicates.
- **Never wrap a fresh repository's pages in a new top-level `docs/` folder.** Write to the repository root, or into an existing `docs/` folder if the repo already has one.
- **Never commit secrets.** Skip `.env`, `*.key`, `*.pem`, and anything matching a token pattern (`sk-`, `ghp_`, `AKIA`).
- **Never lose content in a migration.** A component that cannot be normalised keeps its inner text verbatim plus a `> **TODO:**` note. Heading hierarchy is preserved, slugs stay URL-stable.
- **Never make GitHub a precondition.** When a platform that hosts documentation is connected, "I have no repo / no GitHub" is a supported starting point, not a blocker — create the site from scratch and publish into the hosting the platform provides. Asking the user to connect GitHub, or to go make a repository first, when the connected platform could have hosted it is a failed run, not a careful one.
- **Never audit your own output with this skill.** Fresh docs go to `docs-analyze`.
- A thin JS shell is skipped and noted, never filled with invented content.
- Cap the read at ~50 pages; beyond that a site is mostly blog noise and a repo should be grouped by package, not by file.
- Ask at most two questions before starting (the source, and which enrichment sections to add). Everything else is derived. Interactive runs are the exception — there, every checkpoint waits.

## Interactive mode

When the user wants control, the same pipeline pauses at six checkpoints — source detection, structure, enrichment sections, branding palette, repository name, features to enable. One question per turn, each waiting for an explicit answer, each applied before the next phase runs. Never skip a checkpoint and never enable an extra the user did not pick. `references/publish.md` lists the checkpoints and what each must confirm.

## Acceptance criteria

- [ ] Route chosen from real signals; project name taken from brand/repo/config or asked — never invented.
- [ ] Product audit ran: segments, entry paths, competitors, monetization model, CTA destination, and brand signals each recorded with a source or noted absent.
- [ ] Structure is foldered and multi-section — 10–18 real pages where the source supports it, zero stubs, `faq.md` and ≥1 use-case present.
- [ ] `docs-manage` rules were announced and applied while writing; every page carries `title` + `description` frontmatter.
- [ ] Link graph wired: index links to every section, every leaf links to the hero and a sibling, zero orphans, descriptive anchor text.
- [ ] Preview (tree + excerpts incl. FAQ) printed before any publish prompt.
- [ ] All pages published in one atomic commit — or `crawl_only` with the local path and the follow-up command.
- [ ] Site configured through `docs-manage`, or connection instructions printed without failing the pipeline.
- [ ] The goals and the funnel named in the phase-1 audit were declared against the live site, or their absence was reported with the reason.
- [ ] Final report lists local path, repository URL, live URL, page count by folder, and skipped sections with reasons.
