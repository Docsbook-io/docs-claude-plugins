---
name: docs-audience-enricher
description: Reasons about who your buyers are, how they enter the product, and who you compete with — then enriches your private product source-of-truth (a README/specs tree, a product-marketing context file, or any markdown knowledge base) so future growth work has richer ground to stand on. Runs three lenses — segment (JTBD, watering holes, buying triggers per ICP segment), funnel (every entry path, its friction, how complete it is), competitor (live changes, new entrants, fresh counter-arguments) — grounded in real analytics via the docs-insights pipeline where data exists, simulated only where it does not. Proposes and appends; never touches product code or client docs. Produces an insight JSON report consumable by downstream actor agents.
metadata:
  version: 1.0.0
  category: growth
  mode: audit
  requires_plan: pro
  requires_docsbook_mcp: true
  uses_mcp_tools:
    - get_analytics
    - get_page_journeys
    - query_events
    - get_failed_searches
    - get_popular_searches
    - get_workspace
  produces_files:
    - .docsbook/insights/<timestamp>__docs-audience-enricher.json
    - .docsbook/insights/<timestamp>__docs-audience-enricher.md
    - .docsbook/insights/latest/docs-audience-enricher.json
  output_schema: https://docsbook.io/schemas/insight.schema.json
  pipeline_subagents:
    - segment-analyst
    - funnel-analyst
    - competitor-analyst
  keywords: [growth, icp, segments, persona, funnel, entry-points, competitors, jtbd, source-of-truth, distribution]
---

# docs-audience-enricher — Think about your buyers, then enrich the memory

Most product knowledge bases describe **what** the product is. Very few describe **who** enters it, **how** they enter, and **who** they compare it to — and the parts that do exist go stale the moment they're written.

This skill closes that gap. It reads your product source-of-truth and your real analytics, reasons across three growth lenses, and **appends** what it learns back into the source-of-truth so the next analysis (and the next human) starts from richer ground. It is the "prepare the soil" step before any opportunity-mapping or experiment-planning work.

**It proposes and writes knowledge. It never changes the product, the client docs, or any code.**

## When to run

- Monthly, or before any growth-strategy / opportunity-mapping pass.
- After a launch that may have brought a new kind of user.
- When the source-of-truth has obvious blank spots (empty "deep dives", a stale competitor table, an entry-funnel that's a list of channels but never a tested path).

## Inputs

This skill is **product-agnostic**. It needs to know two things, passed by the caller (a wrapper command supplies them; otherwise ask):

| Input | What it is | Docsbook example | Generic example |
|---|---|---|---|
| `SOT_DIR` | The private product knowledge base to read and enrich | `README.md` + `specs/` | `.agents/product-marketing.md` (single file), or `docs-internal/` |
| `WORKSPACE` | Docsbook workspace for real analytics (optional) | `42` or `Docsbook-io/docs` | omit → simulation-only mode |

Optional:

| Input | Default | Meaning |
|---|---|---|
| `DISTRO_DIR` | _(none)_ | Folder of collected, LLM-enriched distribution signals (e.g. `.distro/_media/`) — real posts/threads from where the audience hangs out, tagged with an analyst layer (`signal_type`, `icp_segment`, `jtbd`, `watering_hole`, `pain_quote`, `competitor_mentioned`, routed by `analyst_for`). Each lens reads its own slice for grounded, citable off-site signal. Omit → lenses reason without external signal. |
| `LENSES` | `segment,funnel,competitor` | Which of the three lenses to run |
| `PERIOD` | `30d` | Analytics window for the funnel lens |
| `FUNNEL_FOCUS` | _(none)_ | A channel to weight extra — e.g. `mcp` to stress-test the AI-agent / MCP entry path |

## Data-first principle

**Real data beats imagination.** Before any lens reasons, it looks for evidence in this order:

1. **Existing insight reports** — read `.docsbook/insights/latest/*.json` if present (funnel/utm/cohort runs already done by `docs-insights`). Reuse them; don't re-pull. *(on-site behavior)*
2. **Distribution signals** — if `DISTRO_DIR` is set, each lens reads its own slice (segment → `analyst_for=segment`, competitor → `analyst_for=competitor`, funnel → `analyst_for=funnel`) for measured *off-site* signal: real posts with verbatim `pain_quote`, recurring `watering_hole`, and named `competitor_mentioned`, each citable by `url`. This is the strongest grounding for watering holes, voice-of-customer JTBD, and competitor deltas.
3. **Fresh analytics** — if `WORKSPACE` is set and no recent report covers what a lens needs, the lens drives the **docs-insights pipeline** (the `analytics-collector` → `analytics-clusterer` chain) for the slice it needs, rather than calling MCP tools directly. This keeps one analytics path in the codebase.
4. **Simulation** — only where no data can exist yet (a brand-new channel, the clarity of MCP onboarding for a non-developer, a competitor's unshipped roadmap). Simulated reasoning is **always labelled** `evidence_basis: "simulated"` in its finding and in the prose it writes, so a human can tell a measured claim from a reasoned guess.

A lens must never present a simulated claim as if it were measured. When in doubt, label it simulated and lower its `confidence`.

## Workflow

1. **Resolve inputs** — confirm `SOT_DIR` exists and is readable. If `WORKSPACE` is given and looks like `owner/repo`, note it for the lenses (they resolve the id through the pipeline). Read the source-of-truth index (`README.md` in `SOT_DIR`, or the single file) to learn its structure and house style.

2. **Read the funnel contract** — if the SOT defines an entry funnel or a "do not contradict this" rule (Docsbook's `go-to-market.md` does), read it first and pass it to every lens as a hard constraint. **No lens may propose anything that contradicts the stated funnel.**

3. **Run the three lenses** (in parallel — they read independently). Each is a pinned subagent:

   | Lens | Subagent | Reads | Produces |
   |---|---|---|---|
   | **Segment** — "who are our buyers, really" | `segment-analyst` | ICP/persona section of SOT + the product's own docs + cohort/journey data + `DISTRO_DIR` `analyst_for=segment` signals | Per-segment deep dive: JTBD, watering holes, buying triggers, the entry path that segment actually uses |
   | **Funnel** — "every way in, and how good each is" | `funnel-analyst` | The funnel/GTM section + funnel/UTM analytics + `DISTRO_DIR` `analyst_for=funnel` signals + (simulated) walk of each entry path | Per-entry-point: the path, its friction, a coverage score (0–100%), what would measure it |
   | **Competitor** — "what changed, who's new" | `competitor-analyst` | The competitor section + `DISTRO_DIR` `analyst_for=competitor` signals + web research | A freshness delta: price/feature changes, new entrants, new counter-arguments |

   Each lens returns (a) a list of findings conforming to `insight.schema.json`, and (b) a **proposed enrichment block** — the markdown it suggests appending to a specific SOT file, with a target file + anchor.

4. **Reconcile & dedupe** — merge findings across lenses. A claim surfaced by two lenses (e.g. segment says "MCP users are developers who never see the landing page" and funnel says "the MCP entry path is untested") is reported once and cross-linked.

5. **Append to the source-of-truth** — for each proposed enrichment block, write it into the target SOT file **additively** (see *Writing into the source-of-truth* below). Never rewrite or delete human-authored prose.

6. **Emit the report** — write the standard insight JSON + a human-readable `.md` sibling under `.docsbook/insights/`. The JSON's `suggested_actions` are the bridge to the next stage (an opportunity-mapper, an experiment-planner, a human).

7. **Hand off for publishing** — the skill writes files on disk only. Persisting/publishing the enriched SOT is the caller's job (in Docsbook, the enriched `README.md`/`specs/` are committed in the parent repo). Print which SOT files changed so the caller can sync them.

## Writing into the source-of-truth (the most important guardrail)

This memory is hand-curated and valuable. The skill is **additive and reversible**:

- **Fill blanks first.** If the SOT has an explicit placeholder (Docsbook's `icp.md` has a `## Deep dives` section ending in `_(empty — to be filled in collaboratively)_`), replace the placeholder line with generated content under it. This is the cleanest case.
- **Append, never overwrite.** For sections that already have human prose, add a new clearly-marked subsection beneath — do not edit the existing lines.
- **Mark every generated block** so a human can audit, trust, or delete it. Wrap each block:

  ```markdown
  <!-- BEGIN docs-audience-enricher · <lens> · <ISO-date> · evidence:<measured|mixed|simulated> -->
  … generated content …
  <!-- END docs-audience-enricher -->
  ```

- **A re-run replaces its own previous block** (matched by the marker) rather than stacking duplicates. Human prose between markers is never touched.
- **Ground every concrete claim.** Numbers, prices, competitor features, traffic shares must trace to: an analytics report, the SOT itself, the product's docs, or a cited web source. No fabricated metrics. If a claim can't be grounded, write it as an open question, not a fact.

## What each lens catches (examples)

| Lens | Example enrichment it would append |
|---|---|
| **Segment** | "**No-code creators (Make/Zapier/n8n)** — JTBD: *ship a credible-looking template with instructions so buyers trust it*. Watering holes: Make community forum, r/nocode, Zapier subreddit. Buying trigger: a refund/complaint about unclear setup. Entry path they actually use: free plan → custom domain (not GitHub login). `evidence: simulated`." |
| **Funnel** | "**MCP / llms.txt entry path** — coverage **35%**. Path: an agent discovers a skill → reads its SKILL.md → hits the MCP server → OAuth. Friction: the word *MCP* never appears on the landing page; a non-developer agent operator has no on-ramp. Measure with: agent tool-call events grouped by first-touch. `evidence: mixed`." |
| **Competitor** | "**GitBook** dropped its starter tier to $X/mo on <date> (source: …) — weakens the 'saves ~$200/mo' line for solo users; strengthens it for teams. New entrant **<name>** launched <date>, AI-docs angle, no MCP. `evidence: measured`." |

## Guardrails

- **PRO minimum** (the funnel lens reads analytics; the segment lens reads cohorts where available). With a Free workspace, analytics-dependent claims fall back to simulation and are labelled as such; the skill still runs and still enriches.
- **Never contradict the stated funnel** in the SOT. It is a hard constraint, not a suggestion.
- **Never edit product code, the public/client docs, or any file outside `SOT_DIR`** (besides its own report under `.docsbook/insights/`).
- **No fabricated competitors, prices, or metrics.** Cite or label-simulated.
- **Does not create cron agents, schedules, or new tooling.** Proposing automation is a separate, later concern; this skill only enriches knowledge and reports findings.
- **Human prose is sacrosanct.** Only content inside this skill's own markers may be rewritten on a re-run.

## Output for downstream consumption

The insight JSON's `findings[].suggested_actions[]` are written so a later stage (opportunity-mapper, experiment-planner, or a human triaging the report) can act without re-deriving context:

- `add_to_todo` — for an under-covered entry point worth a dedicated test (e.g. "build an MCP onboarding walk-through for non-developers"). Pre-filled with the lens's reasoning.
- `investigate_manually` — for a competitor change that needs a human pricing/positioning decision.
- `invoke_skill` — only when the next step is itself a well-scoped skill (e.g. a docs gap that `docs-gap-finder` should pick up). Never auto-invokes; just suggests.

Every `suggested_action` carries `auto_apply_safe: false` for anything that changes positioning or spend — these are proposals for a human, by design.

## Acceptance criteria

- [ ] `SOT_DIR` read; its structure and house style respected in generated prose.
- [ ] Stated entry funnel (if any) read first and passed to all lenses as a hard constraint; no proposal contradicts it.
- [ ] Each requested lens ran and returned findings + a proposed enrichment block with a target file/anchor.
- [ ] Real analytics used where available (existing insight reports reused; pipeline driven for missing slices); simulation used only where no data can exist, and every simulated claim is labelled `evidence_basis: "simulated"`.
- [ ] All SOT writes are additive and wrapped in `docs-audience-enricher` markers; no human-authored line edited or deleted; an explicit placeholder is filled rather than appended-after.
- [ ] Every concrete number/price/feature traces to a source or is written as an open question.
- [ ] A re-run replaces its own prior marked blocks instead of duplicating them.
- [ ] Insight JSON validates against `insight.schema.json`; human `.md` sibling written; the list of changed SOT files printed for the caller to sync.

## Arguments

| Argument | Type | Default | Description |
|---|---|---|---|
| `sot_dir` | string | required | Path to the product source-of-truth to read and enrich |
| `workspace` | string | _(none)_ | Docsbook workspace id or `owner/repo` for real analytics |
| `distro_dir` | string | _(none)_ | Path to collected distribution signals (`.distro/_media/`); each lens reads its `analyst_for` slice |
| `lenses` | string | `segment,funnel,competitor` | Comma list of lenses to run |
| `period` | string | `30d` | Analytics window for the funnel lens |
| `funnel_focus` | string | _(none)_ | A channel to weight extra (e.g. `mcp`) |

## Related skills

- `docs-funnel-mapper` — the measured funnel this skill reasons on top of
- `docs-visitor-cohort` — the behavioral cohorts the segment lens consumes
- `docs-utm-analyzer` — entry-side data for the funnel lens
- `docs-gap-finder` — a frequent downstream target of this skill's suggestions
- `docs-strategy-plan` — consumes an enriched source-of-truth to plan structure
