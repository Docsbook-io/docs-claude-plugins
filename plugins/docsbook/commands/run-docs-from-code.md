---
description: Extract a code repository into a Markdown docs folder with API surface and configuration
allowed-tools: Agent, Read
---

# /docsbook:run-docs-from-code — extract a code repo into Markdown docs

Thin orchestrator. Spawns the `docs-code-crawler` subagent (Haiku, pinned) which clones the repo, splits the README, enumerates the public API, and writes structured Markdown.

## Arguments

- `$ARGUMENTS[0]` — GitHub URL (`github.com/owner/repo` or `https://...`) or local path (required)
- `$ARGUMENTS[1]` — output name (optional; derived from the repo basename)

If no source is provided, ask the user before proceeding.

## Run

Invoke the `docs-code-crawler` subagent with input:

```json
{"source":"<source>","name":"<name or derived slug>","sourceUrl":"<source>"}
```

Expected return — strict JSON:

```json
{"status":"ok","path":"docs-output/<name>","pages":18,"projectType":"node","branding":{"favicon":"https://github.com/owner.png"},"warnings":[]}
```

## After the extract

Print the result and suggest next steps:

```
✅ Docs written to <path> (<pages> pages, type: <projectType>)

Next:
  /docsbook:run-docs-publish <path>       — push to GitHub
  /docsbook:run-docs-setup-workspace ...  — configure Docsbook
  /docsbook:run-docs-create               — run all stages in one command
```

## Failure handling

- `{"status":"error","reason":"clone_failed"}` → print `hint` and `detail`. Suggest `gh auth login` for private repos.
- `{"status":"error","reason":"no_readme"}` → tell the user the repo has no usable README and suggest passing a different source or running `/docsbook:run-docs-from-site <url>` if a marketing site exists.
- Tips and rationale (project-type detection, API enumeration per language, secret scrubbing) live in the [`docs-from-code` skill](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-from-code/SKILL.md). Read it if you need to tune behaviour.
