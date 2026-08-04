---
description: Add a CI gate to every pull request that checks whether code changes are accompanied by documentation updates, validates frontmatter in changed markdown files, and detects broken internal links. Generates a ready-to-use GitHub Actions workflow file.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
argument-hint: [--block-on-broken-links]
---

# /docs-pr-check — CI gate for docs drift on every PR

Generates `.github/workflows/docsbook-docs-check.yml` — a GitHub Actions workflow that runs on every pull request and checks three things: whether code changes came with a proportional docs change, whether changed markdown files have valid frontmatter, and whether any internal links broke. No Docsbook MCP connection needed — this is a pure local file generator.

## Workflow

1. **Receive configuration.** Parse `$ARGUMENTS` for `--block-on-broken-links`. If present, `BLOCK_ON_BROKEN_LINKS=true`; otherwise default `BLOCK_ON_BROKEN_LINKS=false`.

2. **Render the workflow file.** Build a GitHub Actions workflow triggered on `pull_request`, with three jobs:
   - **code-vs-docs change ratio** — computes the ratio of changed code files to changed doc files in the PR diff and surfaces it as a check annotation (informational, never blocks).
   - **frontmatter validation** — for every changed `.md` file, validate only the required fields `title` and `description` are present. Missing optional fields must never fail the job.
   - **internal link check** — scans changed markdown for internal links and flags any that resolve to a non-existent path.

3. **Write to `.github/workflows/docsbook-docs-check.yml`.** Create the `.github/workflows/` directory if it doesn't exist. Overwrite the file if it already exists.

4. **Report.** Print the output path, the effective `block_on_broken_links` value, and a reminder that the workflow only activates once committed and a PR is opened against the branch that has it.

## Guardrails

- Do not modify any existing workflow files other than `docsbook-docs-check.yml`.
- Set `continue-on-error: true` on the broken-links job when `block_on_broken_links` is false; only make it blocking (`continue-on-error: false`) when the flag is explicitly true.
- Never run checks against the base branch — only against files changed in the PR diff.
- Frontmatter validation must not fail on missing optional fields; only the required fields (`title`, `description`) may trigger an error.
