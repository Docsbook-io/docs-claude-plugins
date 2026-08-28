---
description: Configure a Docsbook workspace via MCP — branding, UI, AI, SEO, languages
allowed-tools: Agent, Read
skill: docs-manage
---

# /docsbook:run-docs-setup-workspace — configure Docsbook workspace via MCP

Thin orchestrator. Spawns the `docs-workspace-configurator` subagent (Sonnet, pinned) which talks to the Docsbook MCP server registered by this plugin (`https://docsbook.io/api/mcp/server`).

## Arguments

- `$ARGUMENTS[0]` — `owner/repo` (required)
- `$ARGUMENTS[1]` — local path to `docs-output/<name>` (optional; needed to read `_branding.json`)
- `$ARGUMENTS[2]` — source website URL (optional; added as a "Website" header link)

## Run

Invoke the `docs-workspace-configurator` subagent with input:

```json
{"owner":"<owner>","repo":"<repo>","path":"<path-or-empty>","sourceUrl":"<url-or-empty>"}
```

Expected return — strict JSON:

```json
{"status":"ok","workspaceId":"ws_...","docsbookUrl":"https://docsbook.io/owner/repo","applied":["branding","ui","navigation"],"planGated":["ai","seo","languages"],"warnings":[]}
```

## After configuration

```
✅ Workspace configured!
📚 Docsbook: <docsbookUrl>

Applied: <applied>
Plan-gated (upgrade to enable): <planGated>
```

## Failure handling

- `{"status":"mcp_unavailable","instructions":[...]}` → print instructions verbatim. Most common cause: Docsbook MCP not authenticated yet.
- `{"status":"error","reason":"workspace_not_found","retryAfterSeconds":60}` → tell the user Docsbook is still indexing the repo and to retry in a minute.
- Tips and rationale (UI preset, MCP probe order, Free vs PRO gating) live in the [`docs-setup-workspace` skill](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-manage/references/site-config.md).
