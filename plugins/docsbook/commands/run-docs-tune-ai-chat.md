---
description: Improve the AI chat system prompt of a Docsbook workspace using real negative feedback and unanswered questions from the last 30 days. Clusters failure patterns by topic, proposes a minimally invasive prompt update, shows a before/after diff, applies only after explicit user confirmation.
allowed-tools: Bash, Read, mcp__plugin_docsbook_docsbook__get_workspace, mcp__plugin_docsbook_docsbook__list_workspaces, mcp__plugin_docsbook_docsbook__get_negative_feedback, mcp__plugin_docsbook_docsbook__get_ai_unanswered, mcp__plugin_docsbook_docsbook__set_chat_system_prompt
argument-hint: [--workspace <id>]
---

# /docsbook:run-docs-tune-ai-chat — tune the AI chat prompt from real failure signal

Reads the last 30 days of badly-rated chat conversations and unanswered questions for a Docsbook workspace, clusters the failure patterns by topic, and proposes a minimally invasive system-prompt update. Shows a before/after diff and applies it only after you explicitly say yes.

## Plan guard

This command needs the **PRO** plan to use `get_negative_feedback` / `get_ai_unanswered` / `set_chat_system_prompt`. Before collecting any signal, resolve the workspace's plan via `get_workspace`. If it's below PRO, stop immediately and print exactly:

> "docs-tune-ai-chat needs the PRO plan to use `get_negative_feedback`/`get_ai_unanswered`/`set_chat_system_prompt`. Upgrade at https://docsbook.io/billing"

## Workflow

1. **Verify connection and plan.** Resolve the workspace (parse `--workspace <id>` from `$ARGUMENTS` if given, else use the default/only workspace via `list_workspaces`). Read the current chat config and confirm the plan is PRO or PRO+. On Free, stop and print the upgrade prompt above. If the plan check passes, confirm with the user that they want to modify the live system prompt before proceeding to collect signal.

2. **Collect the failure signal.** Gather badly-rated chat conversations (`get_negative_feedback`) and unanswered questions (`get_ai_unanswered`) for the last 30 days.
   - For badly-rated conversations: capture the user question, the AI's answer, and the free-text reason for the negative rating.
   - For unanswered questions: capture interactions where the assistant said it didn't know, or retrieval returned nothing.

3. **Cluster by topic.** Group the combined signal into 3–8 topic clusters. Each cluster gets: a label, an item count, up to 3 sample questions, and a one-sentence inferred failure mode.

4. **Generate a prompt update.** Read the current system prompt (`get_chat_system_prompt` if available, otherwise from workspace config). Produce a minimally invasive replacement that keeps **all** existing brand voice / persona / refusal rules intact, adding explicit guidance only for the top 3–5 clusters. Cap the result at 1500 tokens.

5. **Show the diff.** Present a before/after diff with annotations mapping each changed chunk back to the cluster that motivates it.

6. **Apply on confirmation.** Call `set_chat_system_prompt` **only** after the user explicitly says yes. Accept yes / no / edit:
   - yes → apply immediately.
   - no → stop, no write.
   - edit → loop back to the diff step using the user's revised version as the new candidate.

7. **Report.** Confirm the update was applied, include the timestamp, and suggest a re-tune date three weeks out.

## Guardrails

- **NEVER** call `set_chat_system_prompt` without an explicit "yes" from the user — this is a destructive write that replaces the prompt for **all** chat sessions on the workspace.
- Never invent feedback clusters — only use signal actually returned by the platform. If both `get_negative_feedback` and `get_ai_unanswered` come back empty, stop and tell the user there's nothing to tune yet.
- Do not strip existing brand/persona instructions unless an instruction is directly causing the identified failure pattern.
- Prompts over 1500 tokens must be compressed before showing the diff.
- Do not tune on fewer than 5 combined signal items — surface this as "not enough data" rather than speculating.
