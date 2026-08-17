---
name: docs-pr-check
description: Add a CI gate to every pull request that checks whether code changes are accompanied by documentation updates, validates frontmatter in changed markdown files, and detects broken internal links. Generates a ready-to-use GitHub Actions workflow file.
metadata:
  version: 1.0.0
  category: automation
  mode: platform
  requires_docsbook_mcp: false
  requires_plan: free
  produces_files:
    - .github/workflows/docsbook-docs-check.yml
  keywords: [pr, ci, github-actions, lint, frontmatter, broken-links]
---

# docs-pr-check — CI gate for documentation hygiene on pull requests

Generates a GitHub Actions workflow that runs on every pull request and enforces three documentation quality checks: code-to-docs change ratio, frontmatter validity, and internal link integrity.

## Workflow

1. **Receive configuration** — accept the `block_on_broken_links` flag (default `false`) that controls whether broken links fail the build or are reported as warnings only.
2. **Render the workflow file** — produce a GitHub Actions workflow configured with the supplied settings. The workflow triggers on `pull_request` and runs three jobs.
3. **Write to the repository** — place the workflow at `.github/workflows/docsbook-docs-check.yml`, creating the directory if it does not exist. Overwrite if the file already exists.
4. **Report** — print the output path, the effective `block_on_broken_links` value, and a reminder to commit and open a PR to activate the check.

## Guardrails

- Do not modify any existing workflow files other than `docsbook-docs-check.yml`.
- The workflow must use `continue-on-error: true` on the broken-links job when `block_on_broken_links` is `false`; only set it to `false` (blocking) when the flag is explicitly `true`.
- Never run the checks against the base branch — only the changed files in the PR diff.
- Frontmatter validation must not fail on missing optional fields; only required fields (`title`, `description`) trigger an error.

## Acceptance Criteria

- [ ] Workflow file written to `.github/workflows/docsbook-docs-check.yml`
- [ ] `block_on_broken_links` value reflected correctly in the generated workflow
- [ ] Workflow triggers on `pull_request` events only
- [ ] Three check jobs present: code-vs-docs ratio, frontmatter validation, internal links
- [ ] Broken-links job uses `continue-on-error` when `block_on_broken_links` is `false`
- [ ] Output message includes file path, flag value, and commit reminder
