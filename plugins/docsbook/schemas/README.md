# Insight schema — contract between analyzer and actor agents

This folder is the **stable contract** between two generations of agents:

1. **Analyzer agents** (today) — read Docsbook MCP analytics, produce one JSON file per run conforming to [`insight.schema.json`](insight.schema.json).
2. **Actor agents** (next phase) — read those JSON files, dispatch on `findings[].suggested_actions[].action_type`, and execute the work (open Issues, edit pages, update AI prompt, etc.).

> The schema is the API. Adding fields is fine. Removing or renaming fields is a breaking change — bump `schema_version`.

## Where reports live

```
<repo-root>/.docsbook/insights/
├── .config.json                                  # written by /docs-insights-setup
├── 2026-05-28T08-00-00Z__docs-utm-analyzer.json
├── 2026-05-28T08-00-00Z__docs-funnel-mapper.json
├── 2026-05-28T08-00-00Z__docs-engagement-analyzer.json
└── latest/                                       # symlinks to the most recent file per skill
    ├── docs-utm-analyzer.json
    └── ...
```

Filename format: `<iso-timestamp>__<skill-name>.json` (colons in the timestamp are replaced with `-` so the name is filesystem-safe on Windows).

### Why files, not stdout or Issues

We considered three options:

| Option | Why we rejected it |
|---|---|
| Subagent stdout only | No history, no diffing across runs, hard for cron jobs to pick up. |
| GitHub Issues only | Findings are noisy and per-action — Issues fit *actions*, not *raw signals*. Mixing both pollutes the tracker. |
| **JSON files in `.docsbook/insights/`** (chosen) | Gitable, diffable, durable, readable by any agent with `Read`, supports `find` / `jq` from a workflow, and decouples analysis cadence from action cadence. |

Issues and PRs are downstream of these files, opened by the actor agent.

## Minimal valid report

```json
{
  "schema_version": 1,
  "generated_at": "2026-05-28T08:00:00Z",
  "skill": { "name": "docs-utm-analyzer", "version": "1.0.0", "model": "sonnet" },
  "workspace": { "id": 42, "owner_repo": "docsbook-io/example", "plan": "pro_plus" },
  "period": { "from": "2026-04-28T00:00:00Z", "to": "2026-05-28T00:00:00Z", "label": "30d" },
  "findings": []
}
```

An empty `findings` array is valid and means "I ran cleanly and found nothing actionable" — useful as a heartbeat for cron-driven runs.

## Reading the report — actor agent quick guide

Pseudo-code for a future actor:

```ts
const report = JSON.parse(readFile(".docsbook/insights/latest/docs-utm-analyzer.json"))

if (report.schema_version !== 1) {
  exit("Unsupported insight schema — upgrade actor")
}

for (const finding of report.findings) {
  if ((finding.confidence ?? 1) < 0.5) continue
  for (const action of finding.suggested_actions ?? []) {
    switch (action.action_type) {
      case "open_github_issue":      await openIssue(finding, action); break
      case "edit_page":              await invoke("docs-editor", action.prompt, action.target); break
      case "update_ai_chat_prompt":  await invoke("docs-tune-ai-chat", action.prompt); break
      case "invoke_skill":           await invoke(action.skill_to_invoke, action.prompt); break
      case "add_to_todo":            await appendTodo(finding, action); break
      case "notify_slack":           await postSlack(finding, action.target); break
      // ...
    }
  }
}
```

## Invariants analyzers MUST hold

1. **Stable `id`** — `<skill>:<kind>:<slug>`. The slug should hash the underlying entity (page path, query string, visitor cohort) so re-running the skill on the same workspace produces the same id. This lets the actor diff "what's new since last run."
2. **`evidence` is self-contained** — the actor MUST NOT need to re-call MCP to understand why this finding exists. Put numbers in `metrics`, paths in `pages`, examples in `samples`.
3. **No PII** — `samples` of `visitor_id` are fine (anonymous random IDs). Never embed IP addresses, emails, or referrer query strings that may contain emails/tokens.
4. **Cap `samples` at 20** — for token budgets in downstream agents.
5. **No prose outside the JSON** — the file is consumed as data, not as a Markdown document. Use a sibling `.md` file for the human-readable report if you need one.

## Versioning

- `schema_version: 1` — initial.
- Field additions are non-breaking (downstream agents ignore unknown fields).
- Field removal or enum-value removal is breaking → bump `schema_version`.
- Enum additions are non-breaking, but downstream actors SHOULD have a `default: investigate_manually` branch in their dispatch.

## Related

- Schema file: [`insight.schema.json`](insight.schema.json)
- Skills that produce reports: [`docs-skills/skills/observability/`](https://github.com/Docsbook-io/docs-skills/tree/main/skills/observability)
- Setup: run `/docs-insights-setup` from this plugin.
