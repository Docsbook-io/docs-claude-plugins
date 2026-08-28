---
name: docs-automate
description: Set up the things that should keep happening without anyone remembering to do them - drift guards that catch documentation falling behind the code, the site or any other source of truth, and that catch a content change breaking or outgrowing the goals and funnels the docs are measured by; event handlers and webhooks; CI checks on pull requests; alerts; and standing monitors over search, answer-engine, analytics and funnel signals. Always starts by asking what you actually want watched and offering concrete options rather than assuming. Use when asked to automate, monitor, watch, set up alerts, notify us when, add a CI check, keep docs in sync, catch drift, check our goals still work after a rewrite, wire a webhook, автоматизировать, следить за, настроить алерты.
metadata:
  version: 1.1.0
  category: automation
  mode: orchestrator
  requires_docsbook_mcp: false
  measures:
    - traffic
    - search_position
    - search_impressions
    - organic_ctr
    - zero_result_rate
    - ai_answer_rate
    - ai_satisfaction
    - dead_end_rate
    - self_serve_resolution_rate
    - funnel_completion_rate
    - goal_completion_rate
    - content_health_score
  metric_dictionary: ../../metrics/metric-dictionary.json
  accelerated_by:
    - markdown-lsp      # semantic search over the docs — the drift routes depend on it
    - docsbook-mcp      # event registration and live signals, if a workspace is connected
  produces_files:
    - .github/workflows/*.yml
    - .docs-sync.json
    - AGENTS.md
  keywords: [automation, monitor, alert, webhook, drift, sync, ci, github-actions, pre-push, watcher, notify, scheduled, goals, funnel, measurement-drift, автоматизация, алерты, следить]
---

# docs-automate — Make it keep happening

Everything here exists because someone would otherwise have to remember. Documentation falls behind code, a translation goes stale, a page slips off the first page of results, an assistant starts failing on a topic — and nobody notices until a reader does.

**Every route through this skill starts with the same thing: a conversation about what you actually want.** Not a menu of features, and not an assumption. Automation that watches the wrong thing is worse than none, because it produces noise that trains everyone to ignore the channel — and the next alert, the one that mattered, gets ignored with it.

## Companion skills

| Skill | Boundary |
|---|---|
| `docs-analyze` | Finds what is wrong **now**. This skill makes the finding arrive on its own **next time**. A monitor is worth creating once you have found something twice. |
| `docs-manage` | Owns what a fixed page says and what a setting does. A drift route that rewrites a page writes to its rules. Configuring a feature is there; keeping it configured is here. |
| `docs-create` | Owns pages that do not exist. A monitor never writes one. |

## Phases and their modes

| Phase | Mode | What it may do |
|---|---|---|
| 1. Interview | `audit` | Asks. Writes nothing. |
| 2. Design | `audit` | Proposes the setup, with its costs and its failure modes. |
| 3. Install | `platform` | Writes workflow files, registers handlers, changes settings. |
| 4. Prove | `platform` | Fires a test, checks it arrived, and reports the result honestly. |
| 5. Run | `refactor` (drift routes only) | Rewrites drifted pages, under the guardrails in `references/drift.md`. |

## Workflow

### 1. Interview — ask before proposing anything

Do not open with a list of what is available. Open with what is going wrong, then map it. The full question set, with the follow-ups that matter, is in `references/setup-interview.md`. The spine of it:

1. **What went wrong that made you ask?** A concrete incident beats any abstract goal, and it names the trigger better than a menu can.
2. **What should happen when it happens again?** A message somewhere, an issue filed, a pull request opened, a check that fails, a page fixed automatically. These are wildly different levels of trust and they cost wildly different amounts.
3. **Who acts on it, and where do they already look?** An alert into a channel nobody reads is a channel nobody reads. If the team lives in issues, file issues.
4. **How often is too often?** Get the threshold and the quiet hours now, not after the first noisy week.
5. **What must never happen automatically?** Ask explicitly. Pushing to a public remote, changing a price, blocking a push — each needs to be named as allowed or not.

Then **offer two or three concrete options**, each with what it catches, what it costs, and how it fails. Never a single take-it-or-leave-it setup, and never a list of everything the platform can do.

### 2. Design — say what it will and will not catch

Before writing a file, state:

- **The trigger** — the exact event or schedule, and the threshold with the sample floor under it (`references/monitoring.md`).
- **The action** — what happens, and whether a human is in the loop before anything changes.
- **The blind spot** — what this setup will miss. Every monitor has one, and an unstated blind spot reads as full coverage.
- **The failure mode** — what happens when the source is unreachable, the plan gate refuses, or the event never fires. Silence must never be indistinguishable from health.
- **The noise estimate** — roughly how often this will fire given the current numbers. If the honest answer is "several times a day", the threshold is wrong and this is the moment to fix it.

Get agreement on that before installing.

### 3. Install

Pick the routes the interview settled on:

| Route | What it is | Reference |
|---|---|---|
| **Drift** | Docs falling behind code, the live site, a pricing page, or any other source of truth | `references/drift.md` |
| **Measurement drift** | A content change that broke what a goal matches, or shipped something no goal measures — checked on the same push | `references/drift.md` |
| **Events** | Something happens on the platform and a handler reacts | `references/events.md` |
| **CI** | A check on every pull request, or a guard before every push | `references/workflows.md` |
| **Monitors** | A standing watch over search, answer-engine, reader-behaviour or funnel signals, with an alert when a threshold trips | `references/monitoring.md` |
| **Tuning loops** | A recurring pass that adjusts something — the assistant's instructions, a translation set — from real failure signal | `references/monitoring.md` |

Install what was agreed and nothing else. An extra "while I was here" automation is a change nobody signed off on.

### 4. Prove it works

An automation that was installed but never fired is indistinguishable from one that is broken.

- **Fire a test** through the real path — the event, the workflow, the alert — and confirm it arrived where it was supposed to.
- **When a dependency is not live yet** (an event the platform does not emit, a channel not yet connected), say so explicitly and leave what you wrote in place. A handler that is ready before its event exists is useful; a handler silently deleted because registration failed is not.
- **Surface any secret exactly once**, and say where it must be stored.
- **Never claim a feature is on because the write that enabled it succeeded.** Check the thing that actually observes it.

### 5. Hand over

Report, in one message: what now runs, on what trigger, with what threshold; where it reports and who owns it; what it will not catch; what the user must still do by hand (store a secret, connect a channel, merge the workflow); and how to turn it off.

That last one is not a courtesy. An automation nobody knows how to disable gets worked around instead, and the workaround is always worse.

## Guardrails

- **Never install anything before the interview.** Even when the request names the exact automation, confirm the trigger, the destination and the threshold. The named request is usually the symptom.
- **Never set up an automation the user did not agree to.** Adjacent-and-obviously-useful is still unrequested.
- **A public, outward-facing action always needs consent** — pushing to a shared remote, opening a pull request on someone else's repository, sending to a channel, posting anywhere a third party sees it. The local half is safe; the outward half is asked for by name, with the target named.
- **Never block a developer's push by default.** Warn. Blocking is opt-in, set explicitly in the repository's own configuration.
- **Never fail loudly on a plan gate or an unreachable dependency, and never fail silently either.** Record it, keep what was already written, and continue with the rest of the run.
- **Never fabricate a command, a URL, a version or a limit** in generated content or generated configuration. Ground every concrete claim in the diff, the repository's own metadata, or the existing page. When unsure, link the source instead of guessing.
- **Never hardcode a credential in a generated file.** Reference a stored secret. Generate a fresh signing secret per registration and never reuse one you have shown before.
- **Never let a guard silently re-point a goal or a funnel step.** A re-pointed matcher produces one series spanning a definition change — plausible and no longer comparable. Propose it, with the date the comparison restarts.
- **Never report a broken matcher as a conversion problem.** A goal matching nothing is a measurement defect; naming it as reader behaviour sends someone to rewrite a page that was never at fault.
- **Never alert on a sample too thin to mean anything.** Every threshold carries a volume floor — see `references/monitoring.md`.
- **Never let a monitor rewrite content on its own** beyond the drift routes' explicit guardrails, and never let any route touch a price, a claim about another company, or a deprecation notice without a human.
- **Never delete a partially-written file when a later step fails.** It is useful the moment the dependency lands.
- **One automation per problem.** Two monitors watching the same signal produce two alerts and half the trust.

## Acceptance criteria

- [ ] The interview ran, and the trigger, destination, threshold, quiet hours and forbidden actions are all recorded answers rather than assumptions.
- [ ] Two or three concrete options were offered, each with what it catches, what it costs and how it fails.
- [ ] The design was stated before installation, including the blind spot, the failure mode and the noise estimate.
- [ ] Only what was agreed was installed.
- [ ] Every outward-facing action was consented to by name, with its target named.
- [ ] A test fired through the real path, and its result was reported honestly — including "the dependency is not live yet".
- [ ] Any secret was surfaced once, with where to store it; no credential is inline in a generated file.
- [ ] Nothing partially written was deleted on a later failure.
- [ ] The handover names what runs, what it misses, what the user must still do, and how to turn it off.
