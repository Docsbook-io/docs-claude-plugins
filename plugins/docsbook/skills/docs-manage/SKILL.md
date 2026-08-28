---
name: docs-manage
description: The rulebook for writing documentation and for running the site it lives on. Two halves - how to write or change a page (page type, structure, style, audience, retrieval, conversion, presentation) and how to configure the site (identity, navigation, reading affordances, discovery, assistant, languages, domain, access, and the goals and funnels that declare what a reader was supposed to do), including what each feature actually gives a reader and when it is worth turning on. Load it before writing a line, and whenever an analysis has told you what is wrong and you need to know what to do about it. Use when asked to write, rewrite, edit, restyle or restructure docs, or to configure, brand, set up navigation, enable features, turn on search or the assistant, track a conversion, set up goals or a funnel, measure whether readers do what they should, настроить сайт, переписать страницу, настроить цели и воронку.
metadata:
  version: 1.1.0
  category: management
  mode: orchestrator
  requires_docsbook_mcp: false
  measures:
    - goal_completion_rate
    - funnel_completion_rate
  metric_dictionary: ../../metrics/metric-dictionary.json
  uses_mcp_tools:
    - create_goal
    - create_funnel
    - mark_path_as_funnel_step
    - delete_goal
  accelerated_by:
    - markdown-lsp      # heading/section-level search — lets you inspect real chunk boundaries cheaply
    - docsbook-mcp      # apply site configuration, declare goals and funnels, and read the live widget catalog, if a workspace is connected
  keywords: [write, rewrite, edit, authoring, style, tone, structure, diataxis, retrieval, aeo, geo, conversion, cta, widgets, branding, navigation, configure, settings, features, enable, languages, domain, goals, funnel, conversion-tracking, measurement, activation, переписать, настроить-сайт, цели, воронка]
---

# docs-manage — What the page says, and what the site does

Two halves of one job. **Content** decides what a page says and how it says it. **Configuration** decides what the site around that page does for a reader. Both are here because they fail together: a beautifully written FAQ with the answer-markup layer switched off is invisible to assistants, and a switched-on assistant over a page nobody can read is a faster route to the wrong answer.

This skill is a rulebook, not an investigation. It never goes looking for what is wrong — that is `docs-analyze`. It never invents pages that do not exist — that is `docs-create`. It answers one question: *given that this needs writing or configuring, what exactly does it say and what exactly gets turned on?*

## Companion skills

| Skill | Boundary |
|---|---|
| `docs-analyze` | Finds and diagnoses. When it hands over a finding, `references/fix-playbooks.md` maps it to the change. Never audit from here — noticing a defect on a neighbouring page while writing means noting it and moving on. |
| `docs-create` | Owns pages that do not exist. Loads this skill's rules before writing its first line. |
| `docs-automate` | Owns anything that should keep happening without being asked. Configuring a feature is here; watching it stay configured is there. |

## The two halves, and their modes

| Half | Mode | What it may do |
|---|---|---|
| Writing a new page | `authoring` | Produce a page that is already correct. **Never repair an old one.** |
| Changing an existing page | `refactor` | Rewrite preserving meaning and URL. **Never invent a new page.** |
| Configuring the site | `platform` | Change settings, never content. |
| Declaring what to measure | `platform` | Define goals and funnels. Changes what the site observes, never what a page says. |

These do not blur. Mixing them is how "write one page" becomes a rewrite nobody asked for, and how an audit quietly starts editing.

## Half one — content

Read the reference that matches what you are doing. Do not restate their rules elsewhere; load them.

| You are | Read |
|---|---|
| Writing or rewriting any page | `references/writing-rules.md` — page type, structure, style, audience, next steps, links, accessibility, and the 60-second check before committing |
| Making a page findable and quotable by assistants and search | `references/retrieval.md` — passage-level writing, what the evidence actually supports, and the popular tactic that measurably backfires |
| Making the docs ask for the sale | `references/conversion.md` — monetization model → conversion pattern, the CTA ladder, the commercial facts you must never invent |
| Turning a flat section into a rendered block, or fixing images and diagrams | `references/presentation.md` |
| Acting on a finding `docs-analyze` handed you | `references/fix-playbooks.md` |

Five rules hold across all of them, and everything else is detail:

1. **One page, one type, one reader.** Decide the page's type before writing a word; it decides structure, tone, and what is off-limits.
2. **Every section must survive being quoted alone.** Paste it into an empty file: does it still say what it is about and answer completely? Assistants score passages, not pages, and so do readers who land mid-page from a search.
3. **Never invent a fact.** Not a price, a limit, an SLA, a statistic, a quotation, a competitor, a customer, or a route like `/signup` that nobody observed. A missing number is "contact sales" or an omission — never a plausible guess.
4. **Never end in a dead end.** Every page closes with a next step or a related link. Evaluation pages carry exactly one conversion action; reference pages carry none.
5. **Cut the filler and the marketing adjectives on sight.** "Simply", "just", "easily" read as contempt to a stuck reader. "Powerful", "robust", "seamless" carry no information. Replace with a number or delete.

## Half two — configuration

`references/site-config.md` is the capability catalog: what each site feature actually does for a reader, in what order to apply them, what a plan gate really costs, and how to verify a setting took effect on the rendered page rather than in the response that accepted it.

Measurement is the second half of configuring a site, and the half that is usually skipped: a site nobody declared a goal for cannot be judged against its own purpose by any later audit. `references/goals-funnels.md` is that rulebook.

| You are | Read |
|---|---|
| Turning something on, branding it, naming it or wiring it up | `references/site-config.md` |
| Declaring what a reader was supposed to do, and the ordered route to it | `references/goals-funnels.md` |
| Checking whether a content change just broke or outgrew what is measured | `references/goals-funnels.md` §5 |

The catalog is written by **capability, not by product**. Platforms name these things differently and the set changes on their release cycle, not this skill's — so read the live settings and the live catalog of what this platform offers, match by purpose, and never reach for a field name from memory. A name hard-coded here would send you looking for something that has been renamed, or leave the best-fitting capability unused because nothing here mentions it.

Four rules govern every configuration change:

1. **Read the current state first.** Anything a human already set is a decision, not a blank slate. Build around it; never overwrite it unprompted.
2. **Never invent a value.** No default accent colour, no font picked to fill a slot. No signal means ask for one — a reference URL, a screenshot, a hex — not make one up.
3. **A content-dependent switch and its content go together.** Enabling answer markup on prose with no genuine Q&A or procedure produces nothing at best and invalid markup at worst.
4. **Verify on the rendered page, not in the write that accepted it.** A settings call returning success while the page renders defaults is the normal failure mode here, and it is invisible from the configuration side. If you cannot verify, report the site as unverified rather than implying a confirmation you did not make.
5. **A structural content change can silently invalidate a measurement.** A renamed anchor, a moved page or a redirected call to action leaves the goal pointing at nothing — and a goal that matches nothing looks exactly like readers refusing to convert. After any change of that shape, resolve every matcher against the docs as they now are, and ask whether what you just shipped is measured at all. `references/goals-funnels.md` §5.

## Guardrails

- **Do not audit from here.** A defect noticed while writing gets noted, not fixed. Repair belongs to `docs-analyze` deciding what to fix and this skill executing it — in that order.
- **Do not create pages from here.** Expanding an approved outline is authoring; deciding that a page should exist is `docs-create`.
- **Preserve meaning and preserve URLs** on every rewrite. A title change implying a slug change means flagging the redirect, not silently breaking links.
- **Never fabricate a commercial fact**, and never state a price you did not read from the source in this run.
- **Never rewrite a claim about another company.** Propose the corrected sentence; a human decides what to assert about a partner or a rival.
- **Never overwrite human-authored prose or human-set configuration.** Additive edits go in marked blocks; a re-run replaces its own block rather than stacking.
- **Never promise a citation lift or a search position.** State the mechanism and its evidence tier.
- **Do not apply retrieval work to private or internal docs.** It only applies to publicly reachable content.
- **Do not rewrite a page that already earns assistant traffic** without checking first — body-only rewrites measurably cost retrieval.
- **Do not bundle changes.** One coherent change per page per pass, so its effect stays measurable.
- **Never declare a goal the owner did not ask for.** A goal states what the business wants; inventing one and then reporting against it produces a confident answer to a question nobody asked.
- **Never summarise what a declaration refused or warned about.** Those messages name a specific defect in a specific definition, and "there were some warnings" throws away all of it.
- **Archive a goal, never delete one to tidy up.** A funnel that silently loses a step reports a *better* conversion rate than the real route.
- **Do not read goal results from here and call it an analysis.** Declaring measurement is this skill; interpreting what it says is `docs-analyze`.

## Acceptance criteria

- [ ] The page's type was decided before writing, and nothing on it belongs to another type.
- [ ] Frontmatter `title` and `description` present, sized, unique, and phrased as reader intent.
- [ ] Every section passes the quote test and answers in its first 60 words.
- [ ] No filler, no marketing adjective, no passive instruction, one term per concept.
- [ ] Every commercial or third-party fact traces to a source read in this run, or is absent.
- [ ] The page ends with a next step; evaluation pages carry exactly one conversion action and reference pages carry none.
- [ ] Something links to the page, every link from it resolves, and every informative image has alt text.
- [ ] Configuration read the current state first and overwrote nothing a human set.
- [ ] Every content-dependent switch was paired with the content it needs.
- [ ] Every applied setting was verified on the rendered page, or explicitly reported unverified.
- [ ] Any goal or funnel declared has one macro goal, a broad first step and a business outcome last, and every refusal or warning was relayed verbatim.
- [ ] After a structural content change, every matcher was resolved against the current docs, and the question of whether the new content is measured at all was asked.
