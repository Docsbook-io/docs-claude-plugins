---
description: Register a Docsbook content.outdated webhook and generate a GitHub Actions workflow that converts each stale-content notification into a GitHub Issue in the documentation repository.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, mcp__plugin_docsbook_docsbook__get_workspace, mcp__plugin_docsbook_docsbook__list_workspaces, mcp__plugin_docsbook_docsbook__register_webhook_content_outdated
argument-hint: [--threshold-days 180]
---

# /docsbook:run-docs-stale-watcher — turn stale-content alerts into GitHub Issues

Registers a Docsbook `content.outdated` webhook and generates `.github/workflows/docsbook-stale-handler.yml`, a GitHub Actions workflow that opens a GitHub Issue for every page Docsbook flags as stale.

## Plan guard

This command needs the **PRO+** plan to call `register_webhook_content_outdated`. Before doing any writes, resolve the workspace's plan via `get_workspace`. If it's below PRO+, stop immediately and print exactly:

> "docs-stale-watcher needs the PRO+ plan to use `register_webhook_content_outdated`. Upgrade at https://docsbook.io/billing"

Do not write the workflow file or attempt registration when the gate fails.

## Workflow

1. **Verify the connection.** Probe that the Docsbook MCP platform is reachable and resolve the target workspace (via `list_workspaces` / `get_workspace`). If this fails, print the MCP connection command and exit gracefully — do not treat it as a hard error.

2. **Resolve staleness threshold.** Parse `$ARGUMENTS` for `--threshold-days <N>`. Default to `180` days if not provided.

3. **Generate the handler workflow.** Build a GitHub Actions workflow that fires on `repository_dispatch` with `event_type: docsbook.content.outdated`. For each page path in the payload, it opens a GitHub Issue linking back to the source file and explaining the staleness criterion that triggered it (last-updated older than the configured threshold).

4. **Write the workflow file** at `.github/workflows/docsbook-stale-handler.yml`, creating the directory if needed, overwriting if it already exists.

5. **Register the webhook.** Generate (or reuse a freshly generated) HMAC secret. Call `register_webhook_content_outdated` with a target URL pointing at this repository's `dispatches` endpoint (`repos/{owner}/{repo}/dispatches`).

6. **Report.** Print the workflow path, the webhook target URL, the effective staleness threshold, instructions for handling the HMAC secret, and a note that webhook delivery depends on the Docsbook backend actually emitting `content.outdated` events.

## Guardrails

- If `register_webhook_content_outdated` returns `not_implemented` or `plan_restricted`, surface the error verbatim and stop — do **not** delete the workflow file already written to disk.
- Never delete a partially written workflow file on webhook registration failure.
- Webhook delivery depends on the Docsbook backend emitting `content.outdated` events — make this dependency explicit in the final report.
- Keep the HMAC secret instruction clear: the user must add it as a repository secret to verify incoming payloads.
