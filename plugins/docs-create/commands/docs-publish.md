---
description: Push a local docs folder to a new public GitHub repository
allowed-tools: Agent, Read, Bash
---

# /docs-publish — push local docs folder to GitHub

Thin orchestrator. Spawns the `docs-publisher` subagent (Haiku, pinned) which runs `git init`, `gh repo create`, and pushes over HTTPS with a gh token.

## Arguments

- `$ARGUMENTS[0]` — path to docs folder (required, e.g. `docs-output/example`)
- `$ARGUMENTS[1]` — `owner/repo` (optional; defaults to authenticated gh user + folder basename + `-docs`)

If path is missing, look for `docs-output/` in cwd and ask which folder to publish.

## Pre-flight

Run `gh auth status` once. If it fails, stop here and tell the user to run `gh auth login` — don't even spawn the subagent.

## Run

Invoke the `docs-publisher` subagent with input:

```json
{"path":"<path>","owner":"<owner>","repo":"<repo>","description":"<from README first line>","private":false}
```

Expected return — strict JSON:

```json
{"status":"ok","githubUrl":"https://github.com/owner/repo","docsbookUrl":"https://docsbook.io/owner/repo","markdownFiles":12,"hasBranding":true,"warnings":[]}
```

## After the push

```
✅ Published!
🐙 GitHub:   <githubUrl>
📚 Docsbook: <docsbookUrl>

Next: /docs-setup-workspace <owner>/<repo>
```

## Failure handling

- `{"status":"error","reason":"repo_exists"}` → ask for a different repo name.
- `{"status":"error","reason":"gh_missing"}` → print `manualSteps` from the response.
- `{"status":"error","reason":"push_failed"}` → surface `detail` to the user; do NOT silently fall back to SSH.
- Tips and rationale (HTTPS vs SSH, `gh repo create --source` pitfalls) live in the [`docs-publish` skill](https://github.com/Docsbook-io/docs-skills/blob/main/skills/docs-publish/SKILL.md).
