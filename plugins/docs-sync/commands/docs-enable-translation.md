---
description: Enable AI auto-translation for a Docsbook workspace across up to 15 languages in one command. Validates inputs, checks plan, enables requested languages, switches translation mode to auto, optionally registers a Slack webhook.
allowed-tools: Bash, Read, Write, Edit, mcp__docsbook__get_workspace, mcp__docsbook__list_workspaces, mcp__docsbook__update_languages, mcp__docsbook__set_translation_mode, mcp__docsbook__register_webhook_translation_completed
argument-hint: --languages es,fr,de [--slack-webhook <url>]
---

# /docs-enable-translation — turn on AI auto-translation

Enables AI auto-translation for a Docsbook workspace across the languages you list, switches the workspace to `auto` translation mode, and optionally registers a Slack webhook for completion notifications.

## Plan guard

This command needs the **PRO** plan to use `update_languages` / `set_translation_mode`. The plan check happens **after** input validation but **before** any write — see step 3. If below PRO, stop and print exactly:

> "docs-enable-translation needs the PRO plan to use `update_languages`/`set_translation_mode`. Upgrade at https://docsbook.io/billing"

## Workflow

1. **Verify the connection.** Probe that the Docsbook MCP platform is reachable. If this fails, print the MCP connection command and exit gracefully, without error.

2. **Validate inputs.** Parse `$ARGUMENTS` for `--languages <comma-separated codes>` and optional `--slack-webhook <url>`.
   - Confirm the language list is non-empty and every code is one of the 15 supported: `en, es, fr, de, pt, it, ru, zh, ja, ko, ar, hi, tr, pl, nl`. Reject anything outside this set.
   - If a Slack webhook URL is provided, confirm it's a valid `https://hooks.slack.com/` URL.

3. **Check plan.** Resolve the workspace and read its config, including plan. If below PRO, stop and print the upgrade prompt above. **Do not proceed to write settings.**

4. **Enable languages.** Call `update_languages` with the validated language set.

5. **Switch translation mode.** Call `set_translation_mode` with `mode: auto`.

6. **Register Slack webhook (optional).** If a Slack URL was provided, generate a fresh random HMAC secret and call `register_webhook_translation_completed`. Surface the secret once.

7. **Update `AGENTS.md`.** Append or replace a MANAGED `## Docsbook Translation` section documenting the enabled languages, the mode, and notification status. This is a marker-based replace — only touch that section, never content above or below it.

8. **Report.** Print a summary of what was applied and the next steps.

## Guardrails

- Never enable translation on a workspace below PRO — stop after the plan check, do not attempt `update_languages`.
- Never reuse a previously shown HMAC secret — generate a fresh one per registration.
- `AGENTS.md` edits use marker-based replace semantics only.
- The Slack webhook URL must start with `https://hooks.slack.com/`; reject any other scheme.
- Supported language codes are exactly: `en, es, fr, de, pt, it, ru, zh, ja, ko, ar, hi, tr, pl, nl`. Reject anything outside this set.
