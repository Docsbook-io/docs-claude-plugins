<div align="center">

# docsbook — the Claude Code plugin

**One install: the 4 documentation skills, 40 commands, 19 pinned subagents, and the Docsbook MCP server.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-plugin-orange.svg)](#install)

</div>

---

## Install

```text
/plugin marketplace add Docsbook-io/docs-claude-plugins
/plugin install docsbook@docs-claude-plugins
```

That is the whole setup. Skills, commands, subagents and the MCP server arrive together.

**Not using Claude Code?** Everything except the commands and subagents works anywhere:

```bash
npx skills add Docsbook-io/docs-skills --skill '*' --global
```

**Not sure, or want it done for you?** Paste this into any agent that speaks MCP — including ChatGPT, where there is no filesystem to install into:

```text
Set up Docsbook for me. Fetch https://docsbook.io/get-started.md and follow it.
```

---

## What you get

| | Count | Namespaced as |
|---|---|---|
| **Skills** — the documentation knowledge, as four orchestrators: `docs-create`, `docs-analyze`, `docs-manage`, `docs-automate` | 4 | `docsbook:<name>` |
| **Commands** — orchestration: fan-out pipelines, one-shot setup, per-check shortcuts | 40 | `/docsbook:<name>` |
| **Subagents** — pinned to Haiku for cheap reads, Sonnet for edits and judgement | 19 | `docsbook:<name>` |
| **MCP server** | 1 | `mcp__plugin_docsbook_docsbook__<tool>` |

### The five pipelines

| Entry point | What it does |
|---|---|
| `/docsbook:run-docs-sync` | Pre-push `code↔docs` drift detection: planner → searcher → editor → curator, each in its own worktree, merged atomically. |
| `/docsbook:run-docs-create` | Docs bootstrap from a URL, a repo, another docs platform, or nothing but an idea. Publishes to GitHub and configures the workspace. |
| `/docsbook:run-docs-analyze` | Read-only quality audit — 17 checks, prioritized JSON findings. Never edits a page. |
| `/docsbook:docs-insights` | Recurring analytics: collector → clusterer → reporter → archivist, writing schema-validated JSON into `.docsbook/insights/`. |
| `/docsbook:enrich-audience` | Growth reasoning across three lenses — segment, funnel, competitor — appended back into your knowledge base. |

### Why some commands start with `run-`

A skill and a command share one namespace, and 28 of the commands had the same name as a skill. They are not duplicates — the skill is the knowledge (`docs-sync` as a skill is 6.5 KB of rules), the command is the machinery that spends it (`docs-sync` as a command is 18.7 KB of worktrees and fan-out). Skill names are public API: `find_skill` matches on them, `npx skills add` installs by them, and Cursor and ChatGPT consume them. Command names are local to this plugin. So the commands moved.

Read `docsbook:docs-analyze` to learn what a search-signal audit looks like; run `/docsbook:run-docs-seo-audit` to have it checked.

---

## The pre-push hook

`/docsbook:run-docs-sync` can run automatically on every `git push`:

```bash
bash plugins/docsbook/scripts/install-git-hook.sh
```

It installs `.git/hooks/pre-push`. Uninstall with `rm .git/hooks/pre-push`.

| Variable | Values | Default | Effect |
|---|---|---|---|
| `DOCS_SYNC_MODE` | `warn` \| `block` \| `off` | `warn` | `warn` runs the sync, reports, never blocks. `block` exits non-zero when drift is found **or** the run fails. `off` does nothing. |
| `DOCS_SYNC_SKIP` | `1` | unset | Skip one push. Same as `off`. |

`block` mode reads a `DOCS_SYNC_DRIFT: <n>` line from the command's output. Earlier versions only checked whether the `claude` process exited non-zero, so a clean run that found ten drifted pages sailed straight through — block mode was inert on the one case it existed for.

There is deliberately **no** `PreToolUse` hook. An earlier version shipped both, which ran the sync twice per push, and the in-session one blocked by default while this README promised it never would. The git hook covers strictly more: it also fires when a human types `git push` in a terminal.

---

## How this repository fits together

```
docs-skills          the knowledge — 4 orchestrator skills, works in any agent
  └─ synced into ─→  docsbook plugin   the same 4 + commands + subagents + MCP
docsbook.io/get-started.md             the playbook that installs either one
```

Skills are **not** authored here. They live in [Docsbook-io/docs-skills](https://github.com/Docsbook-io/docs-skills) and are copied in by `scripts/sync-skills.mjs` from the commit pinned in `scripts/upstream.json` — whole skill directories, `references/` and `assets/` included, because the orchestrators route into those files and a lone `SKILL.md` installs a routing table with nothing at the end of it.

### Staying in sync

Three mechanisms, because the first two each failed once on their own:

1. **`sync-skills.mjs --check` in PR CI.** Re-runs the sync against the pin and fails if the committed tree differs by a byte, so a stale catalog cannot merge.
2. **`check-plugin.mjs`.** Fails if a command or subagent points at a skill or reference file that the synced catalog does not contain — the check that was missing when upstream collapsed 52 skills into 4 and 34 commands were left linking at deleted files.
3. **`.github/workflows/sync-upstream.yml`, hourly.** Moves the pin to `docs-skills@main`, re-runs both syncs, and commits. Nothing here depends on a person remembering that upstream released.

The pin is a **git commit, not an npm version**. It used to be `docs-skills@<version>` from npm, which reads as the safer choice and was the reason this plugin went eleven days shipping a catalog that no longer existed: docs-skills' publish workflow bumps the version *before* it publishes, so when its `NPM_TOKEN` lost publish rights the bump commits kept landing on `main` and the registry silently stopped at 1.8.29. A pin can only be as fresh as the registry it reads.

```bash
npm run sync-skills    # pull the pinned catalog in
npm run sync-mcp       # refresh the MCP tool list from the live server
npm run check          # what CI runs: sync --check, then the plugin guardrails
npm run sync-upstream  # move the pin to upstream main and re-sync everything
```

`scripts/check-plugin.mjs` enforces the things that were actually broken here: version agreement between the two manifests, MCP tool names that exist and carry the plugin namespace, no command sharing a name with a skill, every `metric_dictionary` path resolving after the flatten, and every skill or reference a command names existing in the catalog. `scripts/mcp-tools.json` is the tool allowlist, generated by `scripts/sync-mcp-tools.mjs` from the live server's own `tools/list`.

---

## Upgrading from the five old plugins

`docs-sync`, `docs-create`, `docs-audit`, `docs-insights` and `docs-growth` are replaced by this one plugin. Installed copies keep working but will never update again.

```text
/plugin uninstall docs-sync docs-create docs-audit docs-insights docs-growth
/plugin install docsbook@docs-claude-plugins
```

**Uninstall first.** Otherwise the old MCP registrations and the old `PreToolUse` hook coexist with the new plugin, and the sync runs twice per push.

Then:

1. **Re-run the hook installer.** The old `.git/hooks/pre-push` calls `/docs-sync`, a command that no longer exists — in warn mode it fails silently.
2. **Update your own settings.** Permission entries naming `mcp__plugin_docs-*_docsbook__*` no longer match; the prefix is now `mcp__plugin_docsbook_docsbook__`.
3. **Commands are renamed.** Everything is under `/docsbook:`, and the 28 that collided with a skill name gained a `run-` prefix.
4. **`/docs-translate-webhook` changed.** It used to call `register_webhook_translation_requested` — a tool that does not exist, for an event that does not exist, so the command was dead end to end. External translation mode is a workspace setting, not a typed webhook: `set_translation_mode` takes the callback URL directly. It also needs PRO, not PRO+.
5. **Webhook commands need Business.** Registering any webhook requires it. `docs-release-announce` and `docs-stale-watcher` claimed PRO and PRO+; a Pro customer passed the command's own check and then hit a refusal from the server.

---

## License

MIT
