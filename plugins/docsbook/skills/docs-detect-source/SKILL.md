---
name: docs-detect-source
description: Identify what kind of docs source you have in one call. Detects website URLs, code repositories, and existing platforms (Mintlify, GitBook, Docusaurus, Nextra) so the right builder is picked. Used internally by /docs-create or directly when you're not sure where to start.
metadata:
  version: 1.0.0
  category: creation
  mode: audit
  requires_docsbook_mcp: false
  keywords: [detect, source, mintlify, gitbook, docusaurus, platform]
---

# docs-detect-source — Identify and route a docs source

## Workflow

1. Inspect the input: classify as a plain URL, a GitHub repo URL, or a local path.
2. For a plain URL — fetch the page and look for platform signals in HTML meta tags, CDN links, and domain name. If no platform matches, classify as a generic website.
3. For a GitHub repo URL — fetch root contents via the GitHub API and look for known config files (`mint.json`, `SUMMARY.md`, `docusaurus.config.js`, `.vitepress/`, `astro.config.*`, etc.). If only a README and source directory are present, classify as a code repo.
4. For a local path — inspect the directory structure for the same config file signals.
5. Map the detected type to a downstream skill and report both.

## Guardrails

- For *detection* (platform signals in meta tags / CDN links), a plain HTTP fetch of the raw HTML is enough — those signals live in the shell. But note: a non-empty HTML shell does **not** mean the content is there. Most product sites are JS SPAs whose `<main>` is empty until rendered, so the downstream builder (`/docs-from-site`) must render with a browser to read real content — do not let a 200 with populated `<head>` fool the content pass into skipping the render.
- A single ambiguous signal is not enough — require at least one platform-specific config file or meta tag before assigning a platform type.
- If detection is inconclusive, default to `website` / `/docs-from-site` rather than blocking.
- Never mutate the source; detection is read-only.

## Skill Routing

| Detected type | Downstream skill | Subagent |
|---|---|---|
| `website` | `/docs-from-site` | `docs-site-crawler` (Haiku) |
| `github-code-repo` | `/docs-from-code` | `docs-code-crawler` (Haiku) |
| Any recognized docs platform | `/docs-from-docs` | `docs-platform-importer` (Haiku) |

## Acceptance Criteria

- [ ] Input classified into exactly one type without prompting the user
- [ ] Platform identified from signals (meta tags, config files, domain) rather than guessing
- [ ] Downstream skill name reported alongside the detected type
- [ ] Inconclusive inputs default to `website` gracefully
