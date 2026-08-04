---
description: Bypass Docsbook's built-in AI translator and delegate translation work to a custom external service over webhooks. Switches workspace to external translation mode, registers a translation.requested webhook, scaffolds a handler function the user deploys with their own translation logic.
allowed-tools: Bash, Read, Write, Edit, mcp__docsbook__get_workspace, mcp__docsbook__list_workspaces, mcp__docsbook__set_translation_mode, mcp__docsbook__register_webhook_translation_requested
argument-hint: <webhook-url> [--runtime vercel|express]
---

# /docs-translate-webhook — delegate translation to your own service

Switches a Docsbook workspace to external translation mode, registers a `translation.requested` webhook pointing at your service, and scaffolds a handler function you deploy with your own translation logic.

## Plan guard

This command needs the **PRO+** plan to use `set_translation_mode` / `register_webhook_translation_requested`. The plan check happens **after** input validation but **before** the mode switch — see step 2. If below PRO+, stop and print exactly:

> "docs-translate-webhook needs the PRO+ plan to use `set_translation_mode`/`register_webhook_translation_requested`. Upgrade at https://docsbook.io/billing"

## Workflow

1. **Verify the connection.** Probe that the Docsbook MCP platform is reachable. If this fails, print the MCP connection command and exit gracefully.

2. **Validate plan and inputs.** Resolve the workspace and read its config, including plan. If below PRO+, stop and print the upgrade prompt above. Validate the webhook URL from `$ARGUMENTS` is `https://` (reject `http://` and anything that isn't a well-formed URL). Confirm the runtime flavor — `vercel` or `express`, defaulting to `vercel` if `--runtime` is not passed.

3. **Switch translation mode.** Call `set_translation_mode` with `mode: external`. This stops Docsbook's built-in translator and causes it to emit `translation.requested` events instead.

4. **Register the webhook.** Generate a fresh HMAC secret. Call `register_webhook_translation_requested` with the provided URL. Capture the `callback_url` from the response. Surface the secret once.

5. **Scaffold the handler.** Build a handler file for the selected runtime that verifies the HMAC signature, invokes the user's translation logic as a `TODO` placeholder, and POSTs results back to the callback URL.

6. **Write the handler file** at the configured output path — default `api/docsbook-translate.ts` for Vercel, `src/routes/docsbook-translate.ts` for Express. Create parent directories if needed. Overwrite if it already exists.

7. **Report.** Print the webhook URL, the HMAC secret, the handler path, and the next steps before the pipeline goes live.

## Guardrails

- Reject `http://` webhook URLs — only `https://` is accepted.
- Never hardcode the HMAC secret inside the generated handler file — always reference the env var `DOCSBOOK_WEBHOOK_SECRET`.
- Never call `set_translation_mode` before plan validation passes — switching to `external` on a workspace without PRO+ disables translation entirely.
- The generated handler **must** include HMAC signature verification as a non-optional step before processing any payload.
- If the MCP response doesn't include a `callback_url`, default to `https://docsbook.io/api/translations/callback` in the handler.
