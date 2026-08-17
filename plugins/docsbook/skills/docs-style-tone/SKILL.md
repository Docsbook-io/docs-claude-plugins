---
name: docs-style-tone
description: Tighten the prose of your docs without rewriting by hand. Flags passive voice, filler words, marketing adjectives, runaway sentences, missing second person and inconsistent terminology — and returns issues per page without touching the files. Pair with /docs-create or /docs-analyze.
metadata:
  version: 1.0.0
  category: analysis
  mode: audit
  accelerated_by:
    - markdown-lsp      # semantic/graph search over the docs folder (self-hosted) — faster & cheaper than grep
    - docsbook-mcp      # same capability in the cloud if the docs live in a Docsbook workspace
  keywords: [style, tone, voice, passive, filler, writing, terminology]
---

# docs-style-tone — Style and Tone Analysis

## Workflow

1. **Gather the docs** — get the list of pages in scope and read their content. If a semantic/graph search tool over the markdown is available (self-hosted `markdown-lsp`, or a connected Docsbook workspace), prefer it — it's faster and cheaper than scanning files; otherwise read the files directly with `grep`/`find`. Prioritize Tier 1 pages (quick-start, pricing, auth, install) first. Sample a few pages across different types (tutorial, reference, how-to) to calibrate general style before flagging specifics.
2. **Apply checklist** — check voice and person, filler and marketing words, sentence length and structure, headings, and terminology consistency. Apply tone expectations per page type.
3. **Produce report** — return one JSON issue object per finding, sorted by severity.

> **The JSON is a machine format, not an answer.** It exists so an orchestrator (`docs-analyze`) or a host application can consume the findings — the `action` and `constraints` fields are instructions for a tool, not prose for a person. NEVER paste this JSON into a chat reply or hand it to a human as "the report": a wall of `"severity": "high"` reads as a system error and buries the one line that mattered. When a person asked for the audit, present the findings the way a human editor would — the worst problem first, named in plain language, with the before/after — and offer to apply the fixes. If your host has a way to render changes for approval (a diff or review UI, e.g. Docsbook's `propose_changes`), that is the answer; the JSON stays under it.

## Guardrails

- Do not edit any documentation files — surface findings only.
- Ask whether the project has a style guide before starting — analyze against that if yes, use defaults if no.
- Flag passive voice in instructions; passive in reference pages may be intentional — ask the user about the strictness level.
- "Simply", "just", "easily" — flag for review, not removal — context determines whether they're condescending.
- Terminology inconsistency is only a problem when the same concept has multiple names — precise technical synonyms used in appropriate contexts are not flagged.

## Inputs

This skill needs two things, by whatever means are available:
- **The list of pages in scope** — a docs folder, a sitemap, or a doc graph.
- **The content of each page** — read on demand.

> **Acceleration (optional).** Graph/semantic search over the docs makes navigation faster and cheaper than scanning files. You can self-host it with [`markdown-lsp`](https://github.com/Docsbook-io/markdown-lsp), or get the same capability in the cloud by connecting a Docsbook workspace. With nothing connected, plain file reads and `grep`/`find` work fine.

## Checklist

### Voice and Person

- [ ] **Active voice is the default** — "The system returns an error" → "Docsbook returns an error"
- [ ] **Second person ("you")** — not third person ("the user") or first person plural ("we recommend")
- [ ] **Imperative for instructions** — "Click Save" not "You should click Save"
- [ ] **Present tense** — "This returns a JSON object" not "This will return a JSON object"
- [ ] **First person plural is acceptable** for opinions only — "We recommend using X" in explanation pages

### Filler and Marketing Words

Words to flag (not ban — context matters, but flag for review):

| Word/Pattern | Why It's a Problem |
|---|---|
| "simply", "just", "easily" | Condescending when reader is stuck |
| "powerful", "robust", "flexible" | Empty marketing words with no specifics |
| "seamlessly", "effortlessly" | Promises that may not match user experience |
| "of course", "obviously", "naturally" | Excludes readers who don't find it obvious |
| "please note that" | Filler before a note — use a callout instead |
| "in order to" | Replace with "to" |
| "utilize" | Replace with "use" |
| "leverage" | Replace with "use" |
| "make sure to" | Replace with "ensure" or remove |

### Sentence Length and Structure

- [ ] **Sentences under 25 words** on average
- [ ] **Paragraphs 2-4 sentences** — no wall-of-text paragraphs
- [ ] **One idea per sentence** — split compound sentences when they contain two distinct ideas
- [ ] **Lists for 3+ parallel items** — not a run-on sentence with "and" connectors
- [ ] **Lead with the main clause** — avoid burying the key information at the end

### Headings

- [ ] **Sentence case** — "Set up a custom domain" not "Set Up A Custom Domain"
- [ ] **No click-bait headings** — "You won't believe how easy this is" has no place in docs
- [ ] **Descriptive, not clever** — "Configuration options" not "Getting fancy"
- [ ] **Parallel structure** in sibling headings — all nouns, or all verb phrases, not mixed

### Terminology Consistency

- [ ] **Single term for each concept** — pick one and stick to it
- [ ] **Define terms at first use** — especially abbreviations and jargon
- [ ] **Product names are exact** — "Docsbook" not "docsbook", "DocBook", or "docs book"
- [ ] **No synonyms for the same UI element** — if it's called "workspace" in the UI, call it "workspace" everywhere

### Tone by Page Type

| Type | Expected Tone |
|---|---|
| Tutorial | Encouraging, supportive — "You've just created your first workspace!" |
| How-to guide | Efficient, task-focused — no preamble, get to the steps |
| Reference | Neutral, precise — no personality, just facts |
| Explanation | Conversational but authoritative — "Here's why this matters..." |

## What to Look For

| Severity | Problem | Detection |
|---|---|---|
| `high` | Terminology inconsistency — same concept, different words | grep for "workspace\|project\|repo" in same context |
| `high` | Passive voice in instructions | "is clicked", "should be set", "will be returned" |
| `high` | "simply" / "just" / "easily" in a how-to or tutorial | grep pattern |
| `medium` | Sentence over 40 words | Word count per sentence |
| `medium` | Marketing adjectives without specifics | "powerful", "robust", "seamless" |
| `medium` | Second-person inconsistency — mixed "you" and "the user" | grep pattern |
| `medium` | "In order to" (verbose) | Replace with "to" |
| `medium` | Heading not in sentence case | Capital letters in non-proper nouns |
| `low` | "Please note that" filler | Replace with a callout |
| `low` | "Utilize" instead of "use" | Direct replacement |
| `low` | Undefined abbreviation at first use | Scan for abbreviation patterns |

## Output Format

```json
{
  "type": "condescending_filler",
  "severity": "high",
  "skill": "docs-style-tone",
  "location": "docs/quick-start.md#line-23",
  "found": "'Simply click the Connect button and you're done.' — 'simply' implies the task is trivial, which feels dismissive when a user is stuck.",
  "suggestion": "Remove 'Simply': 'Click the Connect button to finish setup.'",
  "action": "remove_filler_word",
  "constraints": {
    "word": "simply"
  }
}
```

```json
{
  "type": "passive_voice_in_instruction",
  "severity": "high",
  "skill": "docs-style-tone",
  "location": "docs/guides/authentication.md#line-45",
  "found": "'The API key should be added to the .env file' — passive voice buries who does the action.",
  "suggestion": "Use active imperative: 'Add the API key to your .env file:'",
  "action": "rewrite_to_active_voice",
  "constraints": {}
}
```

```json
{
  "type": "terminology_inconsistency",
  "severity": "high",
  "skill": "docs-style-tone",
  "location": "docs/api/workspaces.md",
  "found": "Page uses 'workspace' (lines 1-30) and 'project' (lines 31-60) to refer to the same concept.",
  "suggestion": "Use 'workspace' consistently throughout, matching the UI label.",
  "action": "normalize_terminology",
  "constraints": {
    "canonical_term": "workspace",
    "replace": ["project"]
  }
}
```

```json
{
  "type": "marketing_adjective",
  "severity": "medium",
  "skill": "docs-style-tone",
  "location": "docs/concepts/architecture.md#line-8",
  "found": "'Docsbook's powerful indexing engine...' — 'powerful' adds no information.",
  "suggestion": "Replace with a specific claim: 'Docsbook's indexing engine processes a 500-page repo in under 30 seconds', or remove the adjective entirely.",
  "action": "replace_with_specific_claim",
  "constraints": {}
}
```

## Acceptance Criteria

- [ ] Every page in scope has been scanned — no pages silently skipped.
- [ ] All high findings include a specific before/after suggestion.
- [ ] Terminology issues list the canonical term and all variants found.
- [ ] Output is valid JSON per the format above, one object per finding.

## Related Skills

- `docs-content-types` — tone expectations differ per content type
- `docs-audience` — vocabulary level is a style decision
- `docs-accessibility` — plain language is also an accessibility concern
- `docs-analyze` — orchestrator
