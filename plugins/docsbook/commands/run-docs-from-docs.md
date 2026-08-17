---
description: Import existing docs from Mintlify, GitBook, Docusaurus, Nextra, VitePress, or Starlight
allowed-tools: Agent, Read
---

# /docsbook:run-docs-from-docs — import an existing docs platform into Markdown

Thin orchestrator. Spawns the `docs-platform-importer` subagent (Haiku, pinned) which identifies the platform, reads its navigation, copies every page, and normalises MDX components to plain Markdown.

## Arguments

- `$ARGUMENTS[0]` — GitHub URL or local path containing the docs platform config (required)
- `$ARGUMENTS[1]` — output name (optional; derived from the source)

If no source is provided, ask the user before proceeding.

## Run

Invoke the `docs-platform-importer` subagent with input:

```json
{"source":"<source>","name":"<name or derived slug>","sourceUrl":"<source>"}
```

Expected return — strict JSON:

```json
{"status":"ok","path":"docs-output/<name>","pages":42,"platform":"mintlify","branding":{"accentColor":"#6366f1","favicon":"/favicon.svg"},"warnings":[]}
```

## After the import

Print the result and suggest next steps:

```
✅ Imported <pages> pages from <platform> → <path>

Next:
  /docsbook:run-docs-publish <path>       — push to GitHub
  /docsbook:run-docs-setup-workspace ...  — configure Docsbook
  /docsbook:run-docs-create               — run all stages in one command
```

If `warnings` contains broken-link or unknown-component entries, surface the count so the user knows there is a TODO list inside the output.

## Failure handling

- `{"status":"error","reason":"platform_unknown"}` → print `hint` verbatim. List the supported platforms. Suggest `/docsbook:run-docs-from-code <repo>` for plain code repos.
- Tips and rationale (per-platform MDX normalisation tables, link rewriting, asset migration) live in the [`docs-from-docs` skill](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-from-docs/SKILL.md). Read it if you need to tune behaviour.
