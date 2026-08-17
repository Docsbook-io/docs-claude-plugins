---
name: docs-enable-translation
description: Enable AI auto-translation for a Docsbook workspace across up to 15 languages in one command. Validates inputs, checks the workspace plan, enables the requested languages, switches translation mode to auto, and optionally registers a Slack webhook that fires when each translation batch completes. Requires PRO plan.
metadata:
  version: 1.0.0
  category: automation
  mode: platform
  requires_docsbook_mcp: true
  requires_plan: pro
  uses_mcp_tools:
    - list_workspaces
    - get_workspace
    - update_languages
    - set_translation_mode
    - register_webhook_translation_completed
  produces_files:
    - AGENTS.md
  keywords: [translate, i18n, multilang, localization, auto-translation]
---

# docs-enable-translation — Enable AI auto-translation via Docsbook MCP

## Workflow

1. **Verify the connection** — probe that the platform is reachable. If it fails, print the MCP connection command and exit gracefully without error.
2. **Validate inputs** — confirm the language list is non-empty and contains only codes from the 15 supported languages. If a Slack webhook URL is provided, confirm it is a valid `https://hooks.slack.com/` URL.
3. **Check plan** — resolve which workspace you are operating on and read its current configuration, including its plan. If the plan is below PRO, stop and print an upgrade prompt. Do not proceed to write any settings.
4. **Enable languages** — call `update_languages` with the validated language set.
5. **Switch translation mode** — call `set_translation_mode` with `mode: auto` so Docsbook translates new and changed pages on every push.
6. **Register Slack webhook (optional)** — if a Slack URL was provided, generate a random HMAC secret and call `register_webhook_translation_completed`. Surface the secret to the user once.
7. **Update AGENTS.md** — append or replace a managed `## Docsbook Translation` section in `AGENTS.md` documenting the enabled languages, mode, and notification status.
8. **Report** — print a summary of what was applied and next steps.

## Guardrails

- Never enable translation on a workspace below PRO plan — stop after plan check, do not attempt `update_languages`.
- Never reuse a previously shown HMAC secret — generate a fresh one for each registration.
- When updating `AGENTS.md`, use marker-based replace semantics: only touch the `## Docsbook Translation` section; do not modify content above or below it.
- The Slack webhook URL must start with `https://hooks.slack.com/`; reject any other URL scheme.
- Supported language codes: `en, es, fr, de, pt, it, ru, zh, ja, ko, ar, hi, tr, pl, nl`. Reject anything outside this set.

## MCP Tools

| Tool | Purpose |
|------|---------|
| *(resolve the workspace and read its configuration)* | Verify the connection; read the plan and current settings |
| `update_languages` | Enable the requested language set |
| `set_translation_mode` | Switch mode to `auto` |
| `register_webhook_translation_completed` | Wire Slack notification on batch completion |

## Acceptance Criteria

- [ ] Platform connection verified before any mutation
- [ ] Invalid language codes rejected before any API call
- [ ] Workspace plan checked; execution halted cleanly if below PRO
- [ ] Languages enabled and translation mode set to `auto`
- [ ] Slack webhook registered with a freshly generated secret when URL provided
- [ ] HMAC secret surfaced to user exactly once
- [ ] `AGENTS.md` updated with a managed translation section
- [ ] Summary output includes enabled languages, mode, and notification status
