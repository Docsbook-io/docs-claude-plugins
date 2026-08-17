---
name: docs-tune-ai-chat
description: Improve the AI chat system prompt of a Docsbook workspace using real negative feedback and unanswered questions from the last 30 days. Clusters failure patterns by topic, proposes a minimally invasive prompt update, shows a before/after diff, and applies the change only after explicit user confirmation. Requires PRO plan.
metadata:
  version: 1.0.0
  category: automation
  mode: platform
  requires_plan: pro
  requires_docsbook_mcp: true
  uses_mcp_tools:
    - list_workspaces
    - get_workspace
    - get_negative_feedback
    - get_ai_unanswered
    - set_chat_system_prompt
  keywords: [ai, chat, tuning, feedback, system-prompt, rag, quality]
---

# docs-tune-ai-chat — Tune AI chat system prompt from real feedback

## Workflow

1. **Verify connection and plan** — resolve which workspace you are operating on and read its current configuration; confirm it is on PRO or PRO+. On Free plan, stop and print an upgrade prompt. Confirm with the user that they want to modify the system prompt before proceeding.
2. **Collect the failure signal** — gather the chat conversations readers rated badly and the questions the assistant could not answer, over the last 30 days. For the rated-badly ones, keep the user question, the AI answer, and any free-text reason given; for the unanswered ones, the interactions where the assistant explicitly said it didn't know or retrieval returned nothing useful.
3. **Cluster by topic** — group the combined signal into 3–8 topic clusters. For each cluster, record a label, item count, up to three sample questions, and a one-sentence description of the inferred failure mode.
4. **Generate a prompt update** — read the current `system_prompt`. Produce a minimally invasive replacement that keeps all existing brand voice, persona, and refusal rules intact, and adds explicit guidance for the top 3–5 clusters. Cap the result at 1,500 tokens.
5. **Show the diff** — render a before/after diff with annotations mapping each changed chunk back to the cluster that motivates it.
6. **Apply on confirmation** — call `set_chat_system_prompt` only after the user explicitly confirms. Accept `yes`, `no`, or `edit`; on `edit`, loop back to the diff step with the user's revised version.
7. **Report** — confirm the update was applied, include the timestamp, and suggest a re-tune date 3 weeks out.

## Guardrails

- **Never call `set_chat_system_prompt` without explicit `yes` from the user.** This is a destructive write that replaces the prompt for all chat sessions on the workspace.
- Never invent feedback clusters — only use the signal actually returned by the platform. If both sources are empty, stop and tell the user there is nothing to tune yet.
- Do not strip existing brand or persona instructions unless an instruction is directly causing the identified failure pattern.
- Proposed prompts over 1,500 tokens must be compressed before showing the diff — longer prompts degrade chat quality.
- Do not tune on fewer than 5 combined signal items — surface this as "not enough data" rather than speculating.

## MCP Tools

| Need | Purpose |
|------|---------|
| *(resolve the workspace and read its configuration)* | Verify the connection; read the plan and the current system prompt |
| *(chat conversations readers rated badly, last 30 days)* | The half of the signal where the answer existed but was wrong or unhelpful |
| *(questions the assistant could not answer, last 30 days)* | The half of the signal where retrieval or knowledge came up empty |
| `set_chat_system_prompt` | Apply the confirmed new system prompt |

## Acceptance Criteria

- [ ] Connection and PRO plan verified before any data collection
- [ ] User consent for the write operation obtained before starting
- [ ] Badly rated conversations and unanswered questions collected for a 30-day window
- [ ] At least 5 combined signal items present before clustering; otherwise halts with "not enough data"
- [ ] Clusters produced with label, count, sample questions, and inferred failure mode
- [ ] Proposed prompt is 1,500 tokens or fewer
- [ ] Before/after diff shown with per-chunk cluster annotations
- [ ] `set_chat_system_prompt` called only after explicit `yes`
- [ ] `edit` loop works — user can revise before confirming
- [ ] Result includes confirmation, timestamp, and suggested re-tune date
