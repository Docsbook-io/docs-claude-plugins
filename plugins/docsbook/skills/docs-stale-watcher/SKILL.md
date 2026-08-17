---
name: docs-stale-watcher
description: Register a Docsbook content.outdated webhook and generate a GitHub Actions workflow that converts each stale-content notification into a GitHub Issue in the documentation repository. Keeps docs maintenance visible in the team's normal issue triage flow. Requires BUSINESS plan — registering any webhook does.
metadata:
  version: 1.0.0
  category: automation
  mode: platform
  requires_docsbook_mcp: true
  requires_plan: business
  uses_mcp_tools:
    - list_workspaces
    - register_webhook_content_outdated
  produces_files:
    - .github/workflows/docsbook-stale-handler.yml
  keywords: [stale, outdated, watcher, webhook, issue, maintenance, freshness]
---

# docs-stale-watcher — Turn stale-content events into GitHub Issues

## Workflow

1. **Verify the connection** — probe that the platform is reachable and resolve which workspace you are operating on. If it fails, print the MCP connection command and exit gracefully.
2. **Resolve staleness threshold** — accept a configurable number of days (default 180). Pages untouched for longer than this threshold will trigger an event.
3. **Generate the handler workflow** — produce a GitHub Actions workflow that fires on `repository_dispatch` with `event_type: docsbook.content.outdated`. For each page path in the payload, the workflow opens a GitHub Issue linking to the source file and explaining the staleness criterion.
4. **Write the workflow file** — place it at `.github/workflows/docsbook-stale-handler.yml`, creating the directory if needed. Overwrite if the file already exists.
5. **Register the webhook** — generate or use the provided HMAC secret and call `register_webhook_content_outdated` with the target URL pointing to the GitHub repository dispatches endpoint.
6. **Report** — print a summary of the workflow path, webhook target, staleness threshold, secret handling instructions, and a note about the backend dependency.

## Guardrails

- If `register_webhook_content_outdated` returns a `not_implemented` or `plan_restricted` error, surface the error verbatim and stop — do not delete the workflow file already written to disk.
- Never delete a partially written workflow file on webhook registration failure — the file is useful once the backend ships the event.
- The webhook delivery depends on the Docsbook backend emitting `content.outdated` events. Make this dependency explicit in the output so the user understands the file is ready but events may not arrive yet.
- Keep the HMAC secret instruction clear: the user must add it as a repository secret to verify incoming payloads.

## MCP Tools

| Tool | Purpose |
|------|---------|
| *(resolve the workspace and read its configuration)* | Verify the connection before any mutation |
| `register_webhook_content_outdated` | Register the content.outdated webhook on the workspace |

## Acceptance Criteria

- [ ] Platform connection verified before any mutation
- [ ] Staleness threshold applied (default 180 days or user-supplied value)
- [ ] Workflow file written to `.github/workflows/docsbook-stale-handler.yml`
- [ ] Workflow triggers on `repository_dispatch` with the correct `event_type`
- [ ] Webhook registered with an HMAC secret; secret surfaced once to the user
- [ ] Registration failure (`not_implemented` / `plan_restricted`) reported verbatim without deleting the workflow file
- [ ] Backend dependency noted clearly in the output
- [ ] Output includes workflow path, webhook target, threshold, and secret instructions
