---
description: Run a full documentation audit — all applicable checks — and return one prioritized report. Orchestrates the docs-auditor subagent per check, aggregates and deduplicates findings across checks, and never edits a file.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Agent, mcp__plugin_docsbook_docsbook__get_workspace, mcp__plugin_docsbook_docsbook__list_workspaces
argument-hint: [path-or-full] [--workspace <id>] [--only content-types,seo,accessibility] [--skip i18n]
---

# /docsbook:run-docs-analyze — full audit run

Runs every applicable check against the given scope (a page, a folder, or the full `docs/` tree) and produces one unified, prioritized report. Read-only: this command never edits a doc page, never opens an Issue (unless `gap-finder` is included and the user explicitly asked for issues), never changes a setting.

## Step 1 — Resolve scope and workspace

- `SCOPE` = the path argument, or `full` if omitted (whole docs tree).
- `WORKSPACE` = `--workspace` argument, or `none` if the project has no connected Docsbook workspace. If a workspace looks connected, call `get_workspace` once to confirm and read its `plan`.
- Honor `--only <check,check>` to restrict the run to a subset; `--skip <check,check>` to exclude specific checks from the default full set.

## Step 2 — Pick applicable checks

Default set (all 17, unless narrowed by `--only`/`--skip`):

```
content-types, structure-templates, style-tone, audience, navigation-linking,
accessibility, media, maintenance, i18n, seo, ai-retrieval, trust-audit,
pricing-consistency, competitor-gap, gap-finder, rank-recovery, title-rewriter
```

Drop automatically, with a one-line note in the final report explaining why:

- `i18n` — if the workspace has only one language enabled (or no workspace is connected to check).
- `title-rewriter` — if the workspace plan is below PRO (needs `get_search_zero_click`).
- `rank-recovery` — if no `get_search_rankings` data is reachable (no workspace, or plan doesn't cover it) — falls back to a note that this check requires live search position data, not a hard skip.
- `competitor-gap` — if no competitor URL was given and the user didn't ask for a competitive comparison in this run.

## Step 3 — Identify Tier 1 pages

If SCOPE is `full` or a folder, flag pages likely to be Tier 1 (quick-start, pricing, authentication, installation) from the doc graph or folder listing. These get audited first regardless of check order — pass them as a hint in each check's `SCOPE` when the check supports page-level prioritization.

## Step 4 — Fan out

Spawn one `docs-auditor` Agent call per check, **in parallel** for checks that don't depend on the full graph, **sequentially after Step 4a** for the two that do:

**4a — sequential first** (each needs the full doc graph, not one page):
- `navigation-linking`
- `i18n` (if not dropped)

**4b — parallel** (independent, single message with multiple Agent tool uses):
- `content-types`, `structure-templates`, `style-tone`, `audience`, `accessibility`, `media`, `maintenance`, `seo`, `ai-retrieval`, `trust-audit`, `pricing-consistency`, `competitor-gap` (if included), `gap-finder`, `rank-recovery` (if included), `title-rewriter` (if included)

For each check, invoke `docs-auditor` with:

```
CHECK: <check-name>
SCOPE: <resolved-scope>
WORKSPACE: <id-or-owner/repo-or-none>
OUTPUT: <tmp-path>/<check-name>.json
```

Capture the final `FINDINGS_JSON:` path it prints. If a check fails (no `FINDINGS_JSON:` line, or invalid JSON), record the failure and **continue with the remaining checks** — one broken check must not block the others.

## Step 5 — Aggregate and deduplicate

Read each check's `findings[]` (skip re-reading `skipped`/`notes` into the summary unless empty-handed). Merge cross-check duplicates — the same file/line flagged by two checks (e.g. missing alt text = `accessibility` + `seo`) is reported once under the higher severity, with both check names noted.

## Step 6 — Produce the final report

```markdown
# Documentation Analysis Report
**Scope:** {scope}
**Workspace:** {workspace or "none — text-only audit"}
**Date:** {date}
**Checks run:** {count} ({list}) · **Checks skipped:** {count} ({list with reasons})

## Summary
| Severity | Count |
|---|---|
| Critical | N |
| High | N |
| Medium | N |
| Low | N |

## Critical Issues
{list critical findings with file, check, suggestion}

## High Priority Issues
{list high findings}

## Recommendations by Area
### Content Quality
### SEO & AI Retrieval
### Accessibility & i18n
### Trust & Pricing
### Growth (gap-finder / rank-recovery / title-rewriter / competitor-gap)

## Quick Wins (fixable in < 30 min)
{low-effort, high-impact items — title-rewriter and structure-templates findings usually land here}
```

## Rules

1. **No destructive operations.** This command never edits doc pages, never changes settings. `gap-finder` may open GitHub Issues only if the user explicitly asked for that in this run (`--open-issues`).
2. **Continue past one broken check.** A single `docs-auditor` failure must not abort the run.
3. **Cross-check duplicates merge once**, under the higher severity, noting every check that flagged it.
4. **Ask before assuming Tier 1 pages** if SCOPE is `full` and no doc graph or sitemap is available — defaults may not match the project.
5. **Exit 0 if at least one check succeeded; exit 1 only if every check failed.**
