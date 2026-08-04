---
description: Wire up release announcements for a Docsbook workspace. Registers a Docsbook webhook on release events and generates a GitHub Actions workflow that dispatches notifications to Slack and/or email when a new release is published.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, mcp__docsbook__get_workspace, mcp__docsbook__list_workspaces, mcp__docsbook__register_webhook_content_indexed
argument-hint: --slack <url> | --email <address>
---

# /docs-release-announce — announce releases to Slack and/or email

Registers a Docsbook webhook that fires on release events and generates `.github/workflows/docsbook-release-announce.yml`, a GitHub Actions workflow that dispatches a notification to Slack and/or email whenever a new release is published.

## Plan guard

This command needs the **PRO** plan to use `register_webhook_content_indexed`. Before registering anything, resolve the workspace's plan via `get_workspace`. If it's below PRO, stop immediately and print exactly:

> "docs-release-announce needs the PRO plan to use `register_webhook_content_indexed`. Upgrade at https://docsbook.io/billing"

## Workflow

1. **Verify the connection.** Probe that the Docsbook MCP platform is reachable and resolve the target workspace. If this fails, print the MCP connection command and exit gracefully.

2. **Validate inputs.** Parse `$ARGUMENTS` for `--slack <url>` and/or `--email <address>`. Confirm at least one notification channel was selected — reject the call with neither. If Slack is selected, validate the URL starts with `https://hooks.slack.com/`. If email is selected, validate it's a well-formed address.

3. **Register the release webhook.** Generate a fresh HMAC secret. Register a webhook that fires when a new release is published (via `register_webhook_content_indexed`).

4. **Generate the handler workflow.** Build a GitHub Actions workflow configured for the selected channels, triggered on the `release: published` event, dispatching notifications using secrets stored in the repository (never inline credentials).

5. **Write the workflow file** at `.github/workflows/docsbook-release-announce.yml`, creating the directory if needed, overwriting if it already exists.

6. **Report.** Print the workflow path, the selected channels, and the names of the repository secrets the user must configure.

## Guardrails

- Require at least one channel — Slack or email; reject the call with neither.
- Never hardcode channel credentials in the workflow file — always reference repository secrets.
- If the webhook registration tool isn't available on the connected MCP server, fall back to wiring the workflow directly against GitHub's native `release: published` event, and note the fallback clearly in the report.
- Generate a fresh HMAC secret on every run; never reuse a previously shown value.
