---
description: Crawl a product URL into a Markdown docs folder with branding extracted
allowed-tools: Agent, Read
---

# /docs-from-site — crawl a website into Markdown docs

Thin orchestrator. Spawns the `docs-site-crawler` subagent (Haiku, pinned) which does the actual crawl.

## Arguments

- `$ARGUMENTS[0]` — website URL (required)
- `$ARGUMENTS[1]` — output name (optional; derived from the hostname when absent)

If no URL is provided, ask the user before proceeding.

## Run

Invoke the `docs-site-crawler` subagent with input:

```json
{"url":"<url>","name":"<name or derived slug>","sourceUrl":"<url>"}
```

Expected return — strict JSON:

```json
{"status":"ok","path":"docs-output/<name>","pages":12,"branding":{...},"warnings":[]}
```

## After the crawl

Print the result and suggest next steps:

```
✅ Docs written to <path> (<pages> pages)
🎨 Branding detected: accent <accentColor>, scheme <detectedScheme>

Next:
  /docs-publish <path>       — push to GitHub
  /docs-setup-workspace ...  — configure Docsbook
  /docs-create               — run all three in one command
```

## Failure handling

- `{"status":"error","reason":"fetch_failed"}` → print the warning, do not retry with a different agent. Suggest checking the URL or DNS.
- Tips and rationale (writing rules, page caps, branding regex) live in the [`docs-from-site` skill](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-from-site/SKILL.md). Read it if you need to tune behaviour.
