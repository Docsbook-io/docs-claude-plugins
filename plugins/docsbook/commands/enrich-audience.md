---
description: Reason about who buys the product, how they enter it, and who competes — across three lenses (segment / funnel / competitor) — then append what's learned back into a product source-of-truth. Proposes and enriches knowledge; never touches product code or client docs.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Agent, mcp__plugin_docsbook_docsbook__get_workspace, mcp__plugin_docsbook_docsbook__list_workspaces
argument-hint: --sot-dir <path> [--workspace <id|owner/repo>] [--lenses segment,funnel,competitor] [--period 30d] [--funnel-focus mcp]
---

# /enrich-audience — prepare the growth soil

Runs the `docs-audience-enricher` skill: three growth lenses reason over your product source-of-truth + real analytics, then **append** their findings back into the knowledge base so the next growth pass starts richer. Read-and-enrich only — it changes no product code and no client docs.

This is the generic, product-agnostic entry point. For Docsbook itself, the repo's local `/enrich-audience` wrapper pre-fills `--sot-dir about/` and the workspace; everywhere else, pass `--sot-dir` explicitly.

## Step 0 — Resolve inputs

Parse arguments:

- `--sot-dir <path>` **(required)** — the private knowledge base to read and enrich (`about/`, `.agents/product-marketing.md`, `docs-internal/`, …).
- `--workspace <id|owner/repo>` *(optional)* — Docsbook workspace for real analytics. Omit → simulation-only mode (still runs).
- `--distro-dir <path>` *(optional)* — folder of collected, LLM-enriched distribution signals (`.distro/_media/`) the lenses ground in. Omit → lenses run without external signal. Verify it exists; if it doesn't, treat as `none`.
- `--lenses <list>` *(default `segment,funnel,competitor`)* — which lenses to run.
- `--period <30d|14d|7d>` *(default `30d`)* — analytics window for the funnel lens.
- `--funnel-focus <channel>` *(optional)* — a channel to stress-test harder (e.g. `mcp`).

If `--sot-dir` is missing, ask for it and stop. Verify the path exists and is readable.

## Step 1 — Load the source-of-truth contract

1. Read the SOT index (`<sot-dir>/README.md` or the single file) to learn structure + house style.
2. Locate the relevant files: the ICP/persona file, the funnel/GTM file, the competitor file. (For `about/`: `icp.md`, `go-to-market.md`, `competitors.md`.)
3. **Read the entry-funnel rule** if one exists (`go-to-market.md` has a "do not contradict this funnel" block). Capture it verbatim — it's a hard constraint for every lens.

## Step 2 — Run the three lenses (parallel)

Invoke the pinned subagents in a single message so they run concurrently — they read independently:

| Lens | Subagent |
|---|---|
| segment | `segment-analyst` |
| funnel | `funnel-analyst` |
| competitor | `competitor-analyst` |

Pass each its input contract (see the agent files). Give every lens the verbatim `FUNNEL_CONSTRAINT` and the path to `.docsbook/insights/` so it can reuse existing analytics reports. **Also pass `DISTRO_DIR` (the resolved `--distro-dir`, or `none`) to every lens** — each reads its own slice via `read-distro-signals.js` (segment → `analyst_for=segment`, competitor → `analyst_for=competitor`, funnel → `analyst_for=funnel`). Only run the lenses named in `--lenses`.

**Real data first:** if a lens needs a funnel/UTM/cohort slice that isn't already in `.docsbook/insights/latest/`, and `--workspace` is set, run the matching docs-insights skill (`/docs-funnel`, `/docs-utm`, `/docs-cohort`) first, then hand its report path to the lens. Never have lenses call analytics MCP tools directly — keep one analytics path.

## Step 3 — Reconcile

Collect each lens's `{ findings, enrichment }`. Merge findings; a claim raised by two lenses is reported once and cross-linked (e.g. "MCP path untested" from funnel ↔ "MCP users never see the landing" from segment).

## Step 4 — Append to the source-of-truth

For each lens's `enrichment` block, write it into its `target_file` **additively**:

- If `placeholder_to_replace` is set (an empty stub like `_(empty — to be filled in collaboratively)_`), replace exactly that line with the generated content.
- Otherwise append a new subsection under the named `anchor`.
- Wrap every written block in markers so it's auditable and a re-run replaces (not duplicates) it:

  ```
  <!-- BEGIN docs-audience-enricher · <lens> · <ISO-date> · evidence:<measured|mixed|simulated> -->
  …
  <!-- END docs-audience-enricher -->
  ```

- **Never edit or delete human-authored lines.** Only content inside existing `docs-audience-enricher` markers may be replaced.

## Step 5 — Emit the report

Write the standard insight JSON + `.md` sibling under `.docsbook/insights/` (`<timestamp>__docs-audience-enricher.{json,md}` + refresh `latest/`). The JSON validates against `<plugin-root>/../docs-insights/schemas/insight.schema.json`.

## Step 6 — Report what changed (do NOT publish)

Print:
- the list of SOT files that were appended to,
- the headline per lens,
- the path to the report.

**Do not commit or push.** Persisting the enriched SOT is the caller's responsibility. In the Docsbook repo, the `repo-sync` subagent commits `about/`; elsewhere the user decides. State this explicitly at the end.

## Rules

1. **Read-and-enrich only.** No product code, no client docs, nothing outside `--sot-dir` (besides the report).
2. **Never contradict the SOT's stated funnel.**
3. **No fabricated metrics, prices, or competitors** — cite or label `simulated`.
4. **No cron agents, no schedules, no new tooling** — this command enriches knowledge and reports; proposing automation is a separate concern.
5. **Additive & reversible writes** — human prose is never touched; re-runs replace their own marked blocks.
6. **Match the SOT's house style** so enrichment reads like one author.
