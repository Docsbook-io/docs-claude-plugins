---
name: docs-content-types
description: Stop mixing tutorials with reference. Classifies each page against the Diátaxis framework (tutorial / how-to / reference / explanation), flags misclassified or hybrid pages, and reports structural violations — the #1 reason users can't find answers in your docs.
metadata:
  version: 1.0.0
  category: analysis
  mode: audit
  accelerated_by:
    - markdown-lsp      # semantic/graph search over the docs folder (self-hosted) — faster & cheaper than grep
    - docsbook-mcp      # same capability in the cloud if the docs live in a Docsbook workspace
  keywords: [diataxis, tutorial, how-to, reference, explanation, content-type]
---

# docs-content-types — Content Type Analysis (Diátaxis)

## Workflow

1. **Gather the docs** — get the list of pages in scope and read their content. If a semantic/graph search tool over the markdown is available (self-hosted `markdown-lsp`, or a connected Docsbook workspace), prefer it — it's faster and cheaper than scanning files; otherwise read the files directly with `grep`/`find`. Prioritize Tier 1 pages (quick-start, pricing, auth, install) first.
2. **Classify each page** — determine what Diátaxis type the page *is* (tutorial / how-to / reference / explanation), then check whether it follows that type's rules correctly.
3. **Produce report** — return one JSON issue object per finding; group by page.

> **The JSON is a machine format, not an answer.** It exists so an orchestrator (`docs-analyze`) or a host application can consume the findings — the `action` and `constraints` fields are instructions for a tool, not prose for a person. NEVER paste this JSON into a chat reply or hand it to a human as "the report": a wall of `"severity": "high"` reads as a system error and buries the one line that mattered. When a person asked for the audit, present the findings the way a human editor would — the worst problem first, named in plain language, with the before/after — and offer to apply the fixes. If your host has a way to render changes for approval (a diff or review UI, e.g. Docsbook's `propose_changes`), that is the answer; the JSON stays under it.

## Guardrails

- Do not edit any documentation files — surface findings only.
- Classify first, then check — do not flag structure violations before establishing the page type.
- A single page that covers the same topic across all four types is a problem; a single topic appearing in four separate pages (one per type) is correct.
- Confirm with the user whether the project uses a naming convention for types (e.g., `/guides/` = how-to, `/concepts/` = explanation) before flagging navigation issues.

## Inputs

This skill needs two things, by whatever means are available:
- **The list of pages in scope** — a docs folder, a sitemap, or a doc graph.
- **The content of each page** — read on demand.

> **Acceleration (optional).** Graph/semantic search over the docs makes navigation faster and cheaper than scanning files. You can self-host it with [`markdown-lsp`](https://github.com/Docsbook-io/markdown-lsp), or get the same capability in the cloud by connecting a Docsbook workspace. With nothing connected, plain file reads and `grep`/`find` work fine.

## Checklist

### Tutorial — Learning-Oriented

**Goal:** Guide a beginner through a task, building confidence and skill.

- [ ] Step-by-step, hands-on — reader follows along in real time
- [ ] Narrator is in control — exact commands, exact files, no choices
- [ ] Safe path — outcome is guaranteed if steps are followed
- [ ] Has a clear start state (prerequisites) and end state (what was achieved)
- [ ] Teaches by doing, not by explaining theory
- [ ] Uses imperative: "Click Save" not "You should click Save"
- [ ] No alternative paths ("you can also do X") — pick one path

**Red flags in tutorials:**
- Explaining why something works (→ move to explanation)
- "Alternatively, you can..." (→ move to how-to)
- Full parameter tables (→ move to reference)
- Assumes knowledge not declared as prerequisite
- Open-ended outcome with no concrete result

**Good tutorial title pattern:** "Build your first workspace" / "Get started in 5 minutes"

---

### How-To Guide — Task-Oriented

**Goal:** Help a competent user accomplish a specific real-world task.

- [ ] Assumes the reader has basic knowledge
- [ ] Focuses on one specific goal
- [ ] Can handle variation: "if X, do Y; if Z, do W"
- [ ] Skips the "why" — reader already knows
- [ ] Starts with the goal outcome, not a learning journey
- [ ] Title starts with a verb: "Configure", "Set up", "Enable", "Migrate"

**Red flags in how-to guides:**
- Teaching foundational concepts mid-task (→ link to tutorial or explanation)
- Listing every option without guiding toward a choice (→ reference)
- A single rigid path with no variation handling
- Prerequisites explained in detail (→ link to tutorial instead)

**Good how-to title pattern:** "Set up a custom domain" / "Enable multi-language support"

---

### Reference — Information-Oriented

**Goal:** Give accurate, complete, structured information. Consulted, not read linearly.

- [ ] Machine-like consistency — same structure for every entry
- [ ] No prose narrative — pure information
- [ ] Complete — covers all options, parameters, return values
- [ ] Neutral — no opinions, no guidance on what to choose
- [ ] Easy to scan — tables, definition lists, consistent formatting
- [ ] Accurate above all else — wrong reference = broken integrations

**Red flags in reference pages:**
- Tutorial-style narrative ("now let's look at...")
- Missing parameter entries (incomplete table)
- Inconsistent format between similar entries
- Opinions about which option to prefer (→ how-to or explanation)
- Long prose paragraphs between data entries

**Good reference title pattern:** "API endpoints" / "Configuration options" / "CLI commands"

---

### Explanation — Understanding-Oriented

**Goal:** Help the reader understand a concept, architecture, or decision.

- [ ] Discusses, doesn't instruct
- [ ] Answers "why" and "how does it work" — not "how to do it"
- [ ] Provides context and background
- [ ] May cover history, trade-offs, alternatives
- [ ] Can be opinionated — explain reasoning behind decisions
- [ ] Connects concepts across the documentation

**Red flags in explanation pages:**
- Step-by-step instructions (→ move to how-to)
- Complete parameter lists (→ move to reference)
- Code the reader is supposed to run (→ move to tutorial)
- No conceptual depth — just restating what things do

**Good explanation title pattern:** "How authentication works" / "Architecture overview" / "Understanding workspaces"

## What to Look For

| Severity | Problem | Detection Signal |
|---|---|---|
| `critical` | Page has no identifiable type — chaotic mix | No consistent goal, no coherent audience |
| `high` | Tutorial contains alternative paths | "alternatively", "another option", "you can also" |
| `high` | Reference page has tutorial-style prose | Long paragraphs between data entries |
| `high` | How-to guide teaches foundational concepts | "First, let's understand what X is..." |
| `high` | Tutorial assumes undeclared knowledge | Technical terms appear without introduction |
| `medium` | Tutorial title is a noun, not action-oriented | Title doesn't start with verb or learning phrase |
| `medium` | Explanation page contains step-by-step instructions | Numbered list with imperative verbs |
| `medium` | How-to has rigid single path, no variation | No conditional logic, no "if X, do Y" |
| `low` | Large page that serves two distinct audiences | Should be split into two pages |
| `low` | Tutorial missing prerequisites / "what you'll learn" section | No setup checklist at top |

## Output Format

```json
{
  "type": "mixed_content_type",
  "severity": "high",
  "skill": "docs-content-types",
  "location": "docs/guides/authentication.md",
  "found": "Page starts as a tutorial (step-by-step setup) but includes a full parameter reference table at the end. These serve different audiences at different moments.",
  "suggestion": "Split into: (1) 'Set up authentication' — how-to for the steps, and (2) 'Authentication reference' — reference page for all parameters. Link between them at the bottom of each.",
  "action": "split_page",
  "constraints": {
    "into": ["how-to", "reference"]
  }
}
```

```json
{
  "type": "tutorial_branching",
  "severity": "high",
  "skill": "docs-content-types",
  "location": "docs/quick-start.md#line-45",
  "found": "'Alternatively, you can use the CLI instead of the UI.' — tutorials should not offer alternatives; pick the best beginner path.",
  "suggestion": "Remove the alternative. Move CLI instructions to a separate how-to: 'Create a workspace via CLI'. Link to it at the end of the tutorial.",
  "action": "remove_alternative_path",
  "constraints": {}
}
```

```json
{
  "type": "explanation_contains_instructions",
  "severity": "medium",
  "skill": "docs-content-types",
  "location": "docs/concepts/workspaces.md#line-67",
  "found": "Lines 67-89 contain numbered step-by-step instructions inside a concept explanation page. Readers looking for concepts are disrupted by procedural steps.",
  "suggestion": "Extract the steps into a how-to: 'Create your first workspace'. Replace them here with a link: 'To create a workspace, see [Create your first workspace](...)'",
  "action": "extract_to_new_page",
  "constraints": {
    "target_type": "how-to"
  }
}
```

## Acceptance Criteria

- [ ] Every page in scope is assigned one of the four Diátaxis types (or flagged as unclassifiable).
- [ ] All high/critical findings include the specific line or section causing the violation.
- [ ] Output is valid JSON per the format above, one object per finding.
- [ ] No page is flagged for violations of a type it was not classified as (e.g., a reference page is not flagged for missing prerequisites).

## Related Skills

- `docs-structure-templates` — heading hierarchy within each type
- `docs-style-tone` — tone differs per type (tutorial = encouraging, reference = neutral)
- `docs-audience` — audience targeting per type
- `docs-navigation-linking` — navigation should group by type
- `docs-analyze` — orchestrator that runs all skills
