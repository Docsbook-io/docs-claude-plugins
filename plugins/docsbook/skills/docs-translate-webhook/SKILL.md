---
name: docs-translate-webhook
description: Bypass Docsbook's built-in AI translator and delegate translation work to a custom external service over webhooks. Switches the workspace to external translation mode, registers a translation.requested webhook, and scaffolds a handler function the user deploys with their own translation logic. Requires PRO+ plan.
metadata:
  version: 1.0.0
  category: automation
  mode: platform
  requires_docsbook_mcp: true
  requires_plan: pro_plus
  uses_mcp_tools:
    - list_workspaces
    - get_workspace
    - set_translation_mode
    - register_webhook_translation_requested
  produces_files:
    - api/docsbook-translate.ts
  keywords: [translate, webhook, external, custom, pipeline, tms, i18n]
---

# docs-translate-webhook — Wire an external translation pipeline via webhook

## Workflow

1. **Verify the connection** — probe that the platform is reachable. If it fails, print the MCP connection command and exit gracefully.
2. **Validate plan and inputs** — resolve which workspace you are operating on and read its current configuration, including its plan. If the plan is below PRO+, stop and print an upgrade prompt. Validate that the webhook URL is `https://` (reject `http://` and non-URLs). Confirm the runtime flavor (`vercel` or `express`; default `vercel`).
3. **Switch translation mode** — call `set_translation_mode` with `mode: external`. This stops Docsbook's built-in translator and causes it to emit `translation.requested` events instead.
4. **Register the webhook** — generate a fresh HMAC secret and call `register_webhook_translation_requested` with the provided URL. Capture the `callback_url` from the response for use in the handler. Surface the HMAC secret to the user once.
5. **Scaffold the handler** — produce a handler file for the selected runtime that verifies the HMAC signature, invokes the user's translation logic (as a TODO placeholder), and POSTs results back to the callback URL.
6. **Write the handler file** — place it at the configured output path (default `api/docsbook-translate.ts` for Vercel, `src/routes/docsbook-translate.ts` for Express). Create parent directories if needed. Overwrite if the file already exists.
7. **Report** — print the webhook URL, HMAC secret, handler path, and the next steps the user must complete before the pipeline goes live.

## Guardrails

- Reject `http://` webhook URLs — only `https://` is accepted.
- Never hardcode the HMAC secret inside the generated handler file — always reference an environment variable (`DOCSBOOK_WEBHOOK_SECRET`).
- Never call `set_translation_mode` before plan validation passes — switching to `external` on a workspace without PRO+ disables translation entirely.
- The generated handler must include HMAC signature verification as a non-optional step before processing any payload.
- If the MCP response does not include a `callback_url`, default to `https://docsbook.io/api/translations/callback` in the handler.

## MCP Tools

| Tool | Purpose |
|------|---------|
| *(resolve the workspace and read its configuration)* | Verify the connection; read the plan and settings |
| `set_translation_mode` | Switch mode to `external` |
| `register_webhook_translation_requested` | Register the outbound webhook and obtain callback URL |

## Acceptance Criteria

- [ ] Platform connection verified before any mutation
- [ ] PRO+ plan confirmed; execution halted cleanly if below PRO+
- [ ] Webhook URL validated as `https://` before registration
- [ ] Translation mode switched to `external`
- [ ] Webhook registered with a freshly generated HMAC secret
- [ ] HMAC secret surfaced to the user exactly once; never embedded in handler file
- [ ] Handler file scaffolded with HMAC verification and TODO translation logic
- [ ] Handler file written to the correct path for the selected runtime
- [ ] Output includes webhook URL, secret instructions, handler path, and next steps
