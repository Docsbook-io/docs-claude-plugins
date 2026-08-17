---
name: docs-question-clusterer
description: Clusters every user question asked to the AI chat into themed topic groups, then cross-references against the doc graph to label each cluster as content_gap (no doc covers it) or ai_chat_failure (doc exists but chat couldn't surface it). Goes deeper than docs-gap-finder by including answered-but-not-helpful questions. Requires PRO plan.
metadata:
  version: 1.1.0
  category: observability
  mode: audit
  measures:
    - ai_answer_rate
    - zero_result_rate
    - ai_satisfaction
    - search_ctr
  metric_dictionary: ../../metrics/metric-dictionary.json
  requires_plan: pro
  accelerated_by:
    - docsbook-mcp
    - markdown-lsp
  produces_files:
    - .docsbook/insights/<timestamp>__docs-question-clusterer.json
    - .docsbook/insights/<timestamp>__docs-question-clusterer.md
    - .docsbook/insights/latest/docs-question-clusterer.json
  output_schema: https://docsbook.io/schemas/insight.schema.json
  pipeline_subagents:
    - analytics-collector
    - analytics-clusterer
    - analytics-reporter
    - insights-archivist
  keywords: [questions, ai-chat, gap, clustering, themes, coverage, rag]
---

# docs-question-clusterer — Group every user question and label what's missing

`docs-gap-finder` already exists and finds **what to write next** from the demand signals that came back empty — searches that returned nothing, questions the assistant could not answer — set against what readers ask for most. This skill is **deeper**:

- It also includes the questions the assistant **did** answer, not only the ones it failed on.
- For each cluster, it computes a `coverage_score` against the doc graph — *did an existing page directly answer this?* If yes, the cluster becomes `ai_chat_failure` (doc exists, chat can't surface it = retrieval/prompt problem), not `content_gap` (write a new doc).

This distinction matters because the two failures need different actions:

| Distinction | Action |
|---|---|
| `content_gap` | `invoke_skill: docs-create` with a draft outline. |
| `ai_chat_failure` | `invoke_skill: docs-tune-ai-chat` — fix retrieval/prompt, not content. |

## When to run

- Bi-weekly.
- After any AI chat configuration change.
- After writing new docs — verify the new docs reduced AI chat failures.

## Workflow

Standard four-stage docs-insights pipeline. Slice = `questions`. See [`docs-utm-analyzer`](../docs-utm-analyzer/SKILL.md) for canonical step-by-step.

- **Collector:** every question readers put to the assistant — the ones it answered and the ones it could not — plus the answers readers rated badly, the searches that returned nothing, and the queries readers run most. Anything else that captures a reader asking for something in their own words belongs here too.
- **Clusterer:** LLM-clusters all questions/queries into 3–8 themes by topic. For each cluster, computes `coverage_score` = fraction of cluster questions for which the existing doc graph contains a page whose title/H1 matches.
- **Reporter:** maps coverage_score → finding type as above.

## What this skill catches

| Pattern | Example finding |
|---|---|
| **`content_gap`** (no page covers it) | 17 questions about "how to test webhook locally without ngrok". No doc page mentions local testing. → `invoke_skill: docs-create` with draft outline. |
| **`ai_chat_failure`** (page exists, chat misses it) | 9 questions about "set custom logo", page `docs/design/style/branding.md` covers it perfectly. AI couldn't find it. → `invoke_skill: docs-tune-ai-chat`. |
| **Coverage signal** (positive) | 30 questions about "pricing", page `docs/pricing.md` answers ≥ 80% well. → `info`, validate. |

## Guardrails

- PRO plan minimum — question-level AI chat data is available from PRO up; PRO+ is not required for this skill.
- Cluster size minimum = 5 questions. Below that, exit a cluster as too small.
- Be careful not to overlap with existing skills:
  - `docs-gap-finder` — narrower (only the demand that came back empty, plus top queries). This skill *augments* it with answered-but-failed signal.
  - `docs-tune-ai-chat` — only acts on badly-rated answers and questions the assistant could not answer. This skill produces structured findings, then *delegates* to it via `suggested_actions`.

## Output for downstream consumption

Each cluster finding's `suggested_actions[]`:

- `invoke_skill: docs-create` (for `content_gap`) — pre-filled prompt names the cluster topic + sample questions + draft outline.
- `invoke_skill: docs-tune-ai-chat` (for `ai_chat_failure`) — pre-filled prompt names the existing page that should have answered.
- `open_github_issue` for both, as a fallback paper trail.

## Acceptance criteria

Same shape as `docs-utm-analyzer`. Coverage score is reported per cluster so the actor can sort by impact (`high coverage_score × high question_count = highest-value AI-chat fix`).

## Arguments

| Argument | Type | Default | Description |
|---|---|---|---|
| `workspace` | string | required | id or `owner/repo` |
| `period` | string | `30d` | `14d` / `30d` |
| `min_cluster_size` | number | `5` | Drop clusters below this |

## Related skills

- `docs-gap-finder` — narrower, complementary
- `docs-tune-ai-chat` — likely downstream action for `ai_chat_failure` findings
- `docs-create` — likely downstream action for `content_gap` findings
