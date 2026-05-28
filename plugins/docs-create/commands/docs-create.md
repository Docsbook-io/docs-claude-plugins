---
description: Full pipeline — crawl a URL, publish to GitHub, configure the Docsbook workspace
allowed-tools: Agent, Read, Bash
---

# /docs-create — full crawl → publish → configure pipeline

End-to-end orchestrator. Chains three pinned subagents:

1. `docs-site-crawler` (Haiku) → produces `docs-output/<name>/` + `_branding.json`
2. `docs-publisher` (Haiku) → creates GitHub repo and pushes
3. `docs-workspace-configurator` (Sonnet) → applies branding/UI/AI/SEO via Docsbook MCP

This command does not contain any crawl, git, or MCP logic itself — it only passes outputs of one subagent into the input of the next.

## Arguments

- `$ARGUMENTS[0]` — website URL (required)
- `$ARGUMENTS[1]` — output name / repo basename (optional; derived from hostname)
- `$ARGUMENTS[2]` — `owner` for GitHub (optional; defaults to authenticated gh user)

If no URL is provided, ask the user.

## Pre-flight

Run `gh auth status`. If it fails, stop and tell the user to run `gh auth login` first — the publish step will fail without it.

## Step 1 — Crawl

Invoke `docs-site-crawler` with:

```json
{"url":"<url>","name":"<name>","sourceUrl":"<url>"}
```

If result is not `{"status":"ok",...}`, surface the error and stop — nothing downstream can run without a docs folder.

Capture `path` from the response for the next step.

## Step 2 — Confirm before publish

Print a one-line summary (`<pages> pages crawled to <path>, branding: <accent> <scheme>`). **Ask the user to confirm before publishing** — `/docs-create` should never silently push a fresh GitHub repo. If the user says no, stop with the path printed so they can edit and run `/docs-publish` manually.

## Step 3 — Publish

Invoke `docs-publisher` with:

```json
{"path":"<path>","owner":"<owner>","repo":"<repo>","description":"<derived>","private":false}
```

Capture `githubUrl` and `docsbookUrl`. On error, print and stop — the workspace step needs the repo to exist.

## Step 4 — Configure workspace

Invoke `docs-workspace-configurator` with:

```json
{"owner":"<owner>","repo":"<repo>","path":"<path>","sourceUrl":"<url>"}
```

This is the only Sonnet step in the chain — it deals with stateful MCP writes and plan-gated errors.

If the configurator returns `{"status":"mcp_unavailable",...}`, do not treat it as a hard failure — the docs are already live on GitHub. Print the MCP setup instructions and mark this step as skipped.

## Final output

```
✅ Done.
🐙 GitHub:    <githubUrl>
📚 Docsbook:  <docsbookUrl>

Crawl:     <pages> pages
Publish:   <markdownFiles> markdown files
Workspace: applied <applied>; plan-gated <planGated>
```

## Knowledge references

- [`docs-from-site` skill](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-from-site/SKILL.md) — crawl tips, writing rules
- [`docs-publish` skill](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-publish/SKILL.md) — HTTPS vs SSH, `gh repo create` pitfalls
- [`docs-setup-workspace` skill](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-setup-workspace/SKILL.md) — MCP probe order, plan-gated calls
- [`docs-create` skill](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-create/SKILL.md) — overall pipeline rationale
