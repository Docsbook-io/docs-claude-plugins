---
name: docs-generate-agents-md
description: Give every AI agent in your repo the same context about your docs. Reads your Docsbook workspace and writes an AGENTS.md at repo root so Claude Code, Cursor, Codex, Copilot and Gemini CLI all start each session knowing the docs URL, languages, AI-chat conventions and available @docs-skills commands.
metadata:
  version: 1.0.0
  category: publishing
  mode: platform
  requires_plan: free
  accelerated_by:
    - docsbook-mcp      # read workspace settings & doc graph directly, if a Docsbook workspace is connected
  produces_files:
    - AGENTS.md
  keywords: [agents.md, system prompt, onboarding, agent context, docsbook, mcp, setup]
---

# docs-generate-agents-md — Generate AGENTS.md from a Docsbook workspace

## Workflow

1. Gather the workspace settings. If a Docsbook workspace is connected, read them directly; otherwise derive them from local files (docs config, repo) or ask the user.
2. Collect: docs URL (custom domain or computed), docs path, enabled languages, AI chat status, and plan tier. If a workspace is expected but does not exist, instruct the user to run `/docs-setup-workspace` first.
3. Read the doc tree / page list — from a graph tool if a workspace is connected, or by walking the docs folder — to extract top-level folder structure and total page count. If it is unavailable, continue with an empty structure — the template handles missing data.
4. Render the AGENTS.md template using the collected data: site URL, owner/repo, docs path, languages, AI-chat status, folder structure summary.
5. Write the file to the repo root. If AGENTS.md already exists, locate the managed section by its markers and replace only that section. If no markers exist, append under them. Never touch content outside the markers.
6. Report the file path, Docsbook URL, languages, and AI chat status. Remind the user to commit the file.

## Guardrails

- Never overwrite content outside the managed section markers.
- If the workspace is missing, do not attempt to create it — redirect to `/docs-setup-workspace`.
- If the doc tree is unavailable (no workspace connected, plan restriction, or empty folder), continue with an empty structure rather than aborting.
- The file is written to the repo root, not to the docs folder.

## Inputs

- **Workspace settings** — docs URL, enabled languages, AI-chat status, plan tier. Read them from a connected Docsbook workspace, or derive them from local config / ask the user.
- **Doc tree** — top-level folder structure and page count, from a graph tool or by walking the docs folder.

> **Acceleration (optional).** If a Docsbook workspace is connected, the settings and doc graph can be read directly. Without it, generate AGENTS.md from local files. Pairs with the sibling `/docs-setup-workspace`.

## Acceptance Criteria

- [ ] MCP transport verified before reading workspace
- [ ] Workspace settings read without prompting the user
- [ ] Doc graph retrieved or gracefully skipped on failure
- [ ] AGENTS.md written to repo root (or managed section updated)
- [ ] Content outside managed markers left untouched
- [ ] User reminded to commit the file
