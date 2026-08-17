---
name: docs-release-announce
description: Wire up release announcements for a Docsbook workspace. Registers a Docsbook webhook on release events and generates a GitHub Actions workflow that dispatches notifications to Slack and/or email when a new release is published. Requires PRO plan.
metadata:
  version: 1.0.0
  category: automation
  mode: platform
  requires_docsbook_mcp: true
  requires_plan: pro
  uses_mcp_tools:
    - list_workspaces
    - register_webhook_content_indexed
  produces_files:
    - .github/workflows/docsbook-release-announce.yml
  keywords: [release, announce, slack, email, webhook, notifications]
---

# docs-release-announce — Announce new releases to Slack and/or email

## Workflow

1. **Verify the connection** — probe that the platform is reachable and resolve which workspace you are operating on. If it fails, print the MCP connection command and exit gracefully.
2. **Validate inputs** — confirm that at least one notification channel is selected. Validate that a Slack URL starts with `https://hooks.slack.com/` when Slack is selected; validate that an email address is well-formed when email is selected.
3. **Register the release webhook** — generate a fresh HMAC secret and register a webhook that fires when a new release is published on the workspace repository. Surface the secret to the user once.
4. **Generate the handler workflow** — produce a GitHub Actions workflow file configured for the selected channels. The workflow triggers on the `release: published` event and dispatches notifications using secrets stored in the repository.
5. **Write the workflow file** — place it at `.github/workflows/docsbook-release-announce.yml`, creating the directory if needed. Overwrite if the file already exists.
6. **Report** — print the workflow path, selected channels, and the names of the repository secrets the user must configure.

## Guardrails

- Require at least one channel — Slack or email; reject a call with neither.
- Never hardcode channel credentials in the workflow file — always reference repository secrets.
- If the webhook registration tool is not available on the connected MCP server, fall back to wiring the workflow directly against GitHub's native `release: published` event and note the fallback clearly.
- Generate a fresh HMAC secret on every run; never reuse a previously shown value.

## MCP Tools

| Tool | Purpose |
|------|---------|
| *(resolve the workspace and read its configuration)* | Verify the connection before any registration |
| `register_webhook_content_indexed` | Register a release event webhook on the workspace |

## Acceptance Criteria

- [ ] Platform connection verified before any registration
- [ ] At least one channel validated before any file is written
- [ ] Webhook registered with a freshly generated HMAC secret
- [ ] HMAC secret surfaced to the user exactly once
- [ ] Workflow file written to `.github/workflows/docsbook-release-announce.yml`
- [ ] Workflow references channel credentials via repository secrets, not inline values
- [ ] Output includes workflow path, selected channels, and required secret names
