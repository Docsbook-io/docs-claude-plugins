---
name: docs-publish
description: Push a local docs folder to GitHub in one step. Handles git init, commit, gh repo create and push — no Docsbook MCP required. Designed as the natural next step after /docs-from-site, /docs-from-code or /docs-from-docs.
metadata:
  version: 2.0.0
  category: publishing
  mode: platform
  requires_docsbook_mcp: false
  keywords: [publish, github, git, commit, push, repo]
---

# docs-publish — Push a local docs folder to GitHub

The actual work is done by the **`docs-publisher`** subagent (Haiku, pinned model).

## Workflow

1. Run `gh auth status` as the first step. If it fails, return manual instructions and exit — do not attempt to recover.
2. Derive the repo name from the folder name (which upstream skills set from the site brand or source repo — not a guess). If the folder name looks placeholder-ish or generic (e.g. `docs-output`, `untitled`, a timestamp), ask the user for a real name instead of publishing under it. Also ask if there is a genuine collision with an existing repo on their account.
3. If the folder is not already a git repo, run `git init` and make an initial commit. If `.git` already exists, skip init and reuse the current branch.
4. Create a new public GitHub repo without `--source`. Add the remote manually, then push `main`.
5. Use HTTPS with the `gh auth token` for the push, not SSH.
6. Report the GitHub URL, computed Docsbook URL, file count, and any warnings.

## Guardrails

- Never overwrite an existing repo — if the name is taken, bail with a clear error.
- Never push over SSH as a fallback; HTTPS with the gh token is the only supported transport.
- If `gh` is not installed, return the equivalent manual `git` and `gh` commands rather than failing silently.
- Keep `_branding.json` in the repo — it is consumed by downstream workspace configuration.

## Acceptance Criteria

- [ ] `gh auth status` verified before any git operation
- [ ] Repo name derived automatically; user only prompted on collision
- [ ] Repo created as public with no force-push
- [ ] Push completed over HTTPS using the gh token
- [ ] GitHub URL and Docsbook URL reported in the result
