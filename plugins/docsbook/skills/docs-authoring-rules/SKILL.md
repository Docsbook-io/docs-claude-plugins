---
name: docs-authoring-rules
description: The compact rulebook to load BEFORE you write a new documentation page — not after. One pass over page type, structure, retrieval, style, audience, next-step and links, so the page ships without the defects the audit skills keep finding. Use whenever you are about to author or draft a new page, section or generated docs set. This is a guardrail, not an audit — it never analyzes or repairs existing pages.
metadata:
  version: 1.0.0
  category: creation
  mode: authoring
  keywords: [authoring, guardrail, before writing, new page, writing rules, diataxis, style guide, checklist, drafting, write it right the first time]
---

# docs-authoring-rules — Get It Right While Writing

**Mode: authoring guardrail.** Three modes exist and they must not blur:

| Mode | Trigger | Output | Forbidden |
|---|---|---|---|
| audit | docs exist, something is wrong | a report | changing anything |
| refactor | docs exist and are bad | edits that preserve meaning | inventing new pages |
| **authoring guardrail (this)** | you are about to write | a page that is already correct | **fixing old pages** |

Notice a defect on a *neighbouring* page while writing? Note it and move on.
Repairing it belongs to `docs-style-tone` / `docs-structure-templates` /
`docs-navigation-linking` in audit or refactor mode. Mixing modes is how "write
one page" becomes a rewrite nobody asked for.

**Load this before the first line of a new page** — drafting a page or section
from scratch, generating a docs set, expanding an outline into prose. Not for
reviewing something already written; the audits do that better, and this rulebook
has no findings format on purpose.

---

## 1. Decide the page type first

Pick exactly one Diátaxis type before writing a word. The type decides structure,
tone and what is off-limits.

- **Tutorial** (learning) — one guaranteed path, imperative steps, a stated start
  and end state. No alternatives: "you can also use the CLI" belongs in a how-to.
- **How-to** (task) — one real goal, competent reader, may branch ("if X, do Y").
  No teaching foundations mid-task; link out instead.
- **Reference** (information) — same shape for every entry, complete, neutral.
  No narrative, no "which one should I pick".
- **Explanation** (understanding) — why and how it works, trade-offs, opinions
  allowed. No numbered procedures, no full parameter tables.
- **One page = one type.** Four pages on one topic, one per type, is correct; one
  page covering the topic four ways is the defect audits flag most.
- **Title matches the type**: how-to starts with a verb ("Set up a custom
  domain"); explanation reads "How authentication works"; reference is a noun
  label ("API endpoints").

## 2. Structure

- **Frontmatter carries `title` and `description`.** Title 50–60 chars, unique
  across the docs, phrased as intent — *not* `Authentication` but `How to
  authenticate API requests`. Description 130–160 chars, a complete active
  sentence naming the outcome.
- **One H1, and it comes from `title`** — do not open the body with `# Title`.
- **Never skip a heading level.** H2 → H3 → H4. H2 → H4 breaks screen-reader and
  keyboard navigation.
- **Headings make sense out of context** and are sentence case: "Set up a custom
  domain", not "Set Up A Custom Domain" and not "Getting fancy".
- **Tutorials open with prerequisites**, versioned and specific — "Node.js 18+",
  not "Node.js installed". Put them above step 1, never mid-page.
- **Every fenced code block declares a language** (` ```bash `, ` ```json `).
  Separate the command from its output into two blocks. Placeholders look fake by
  design: `YOUR_API_KEY`, never `key123`, and never a real token.
- **Keep it scannable**: paragraphs 2–4 sentences, a table for any comparison of
  3+ columns, at most ~3 callouts per page, and a warning always *before* the
  action it warns about. Split a tutorial past ~2000 words.

## 3. Write so a single section can be quoted

An AI assistant retrieves and ranks **passages**, not pages. A section that only
makes sense after the three above it loses before the reader ever sees it.

- **Name the subject in full inside each section.** "To rotate it, call…" is
  unretrievable — nothing in it says which product or that it is an API key.
- **Answer in the first 60 words after the heading**, then elaborate. Do not open
  with background: "Before we get into rotation, it's worth understanding…" is
  the answer arriving too late.
- **One question per section.** A section answering three competes weakly for all
  three — split it.
- **Apply the quote test**: paste the section into an empty file. Does it still
  say what it is about and answer completely? If not, rewrite it now.
- **Give one extractable fact where you honestly have it** — a limit, a timeout,
  a price, or a one-sentence definition ("A *workspace* is a documentation site
  with its own domain, members and billing").
- **Never invent a number, limit, price, quote or source** to make a passage
  quotable. Omit it and say it is not stated — a wrong limit repeated by an
  assistant is worse than silence.
- **Keep natural synonym variety** ("API key", "token", "credentials"). Writing
  as a human would is the point; cramming query strings scores *below* it.

## 4. Style

- **Active voice, second person, present tense.** "Docsbook returns an error",
  not "an error is returned". "You" — not "the user", not "we" (except for an
  explicit recommendation in an explanation page).
- **Imperative for every instruction.** "Click Save", not "You should click Save".
- **Cut the fillers on sight**: *simply, just, easily, of course, obviously,
  please note that*. They read as contempt to a reader who is stuck.
- **Cut the marketing adjectives**: *powerful, robust, flexible, seamless,
  effortless, revolutionary*. Replace with a number or delete. Before: "a
  powerful indexing engine" → After: "indexes a 500-page repo in under 30
  seconds".
- **Shorten the verbose**: "in order to" → "to", "utilize" → "use", "leverage" →
  "use", "make sure to" → "ensure".
- **One idea per sentence, under 25 words.** Three or more parallel items become
  a list, not an "and" chain.
- **One name per concept, for the whole page and the whole docs set.** If the UI
  says "workspace", never write "project". Product names are spelled exactly.
- **Match tone to type**: tutorial encouraging, how-to efficient, reference
  neutral, explanation conversational but authoritative.

## 5. Audience

- **Name the reader before writing**, explicitly or through the page type, and
  write to that one reader for the whole page.
- **Declare prerequisites, then honour them.** If the page says "no experience
  needed", every term in it must be introduced. Unstated assumed knowledge is the
  most expensive defect on a getting-started page.
- **Expand every abbreviation at first use** — "CLI (command line interface)" —
  and define product-specific terms the first time they appear.
- **Do not mix levels on one page.** "Open your terminal for the first time" and
  "configure the idempotency key" cannot share a reader. Split, or separate with
  explicit per-audience headings.
- **Do not over-explain in reference.** A reader in the API table already knows
  what an API is; starting with basics wastes their scan.

## 6. Do not end in a dead end

Every page owes the reader somewhere to go. The conversion minimum costs one
section.

- **Close every page with `## Next steps` or `## Related`** and at least one
  internal link. A page ending on its last instruction is a page readers leave.
- **Point forward by type**: tutorial → how-to, how-to → reference, reference →
  the guide that demonstrates it, explanation → the tutorial that applies it.
- **Evaluation pages (hero, features, use-cases, pricing, FAQ) carry one
  conversion action** — exactly one primary ask. Competing CTAs convert worse.
- **No CTA on reference pages.** A reader in a parameter table wants `Related`
  links, not a pitch; a tutorial converts by working, not by selling.
- **Never state a price, plan, limit or SLA you did not read from the source.**
  Unknown price is "Contact sales" or a link — never a plausible guess.
- **Link to a route that exists.** Do not invent `/signup`; use a URL observed on
  the product or an internal doc path.

## 7. Links and accessibility

- **Every new page gets at least one inbound link** from an existing page, added
  in the same change. A page nobody links to is an orphan the moment you save it.
- **Anchor text describes the destination**: "see the authentication guide", never
  "click here", "read more" or a bare URL. Screen readers list links out of
  context, and so do readers who scan.
- **Link targets must resolve** — the file and the `#anchor` both exist when you
  commit.
- **Alt text on every informative image**, describing content and not the file:
  "Workspace settings with the API key field highlighted", ≤125 chars, never
  starting with "image of". Decorative images take empty alt `![]()`.
- **No information that lives only inside an image**, and no meaning carried by
  colour alone — "the red fields" needs "the required fields (shown in red)".
- **Numbered lists for sequences, bullets for sets, header rows on every table.**

---

## The 60-second self-check before you commit the page

- [ ] I can name this page's Diátaxis type, and nothing on it belongs to another type.
- [ ] `title` and `description` exist, are unique, sized, and read as reader intent.
- [ ] Headings descend without skipping; there is exactly one H1, from frontmatter.
- [ ] Every code block has a language; prerequisites are versioned (if a tutorial).
- [ ] Each section passes the quote test standalone and answers in its first 60 words.
- [ ] No filler, no marketing adjective, no passive instruction, one term per concept.
- [ ] Every term is either defined here or covered by the stated prerequisites.
- [ ] The page ends with a next step, and any commercial fact came from the source.
- [ ] Something links **to** this page, and every link **from** it resolves.
- [ ] Every informative image has alt text; nothing is conveyed by colour alone.

Any unchecked box is a defect being born. Fix it now — it is an order of
magnitude cheaper here than in the audit queue.

---

## Related skills

This skill produces a page, not a report. It neither replaces the skills below
nor duplicates their output — do not run them from here.

- **Verify after the fact** what this prevents: `docs-content-types`,
  `docs-structure-templates`, `docs-style-tone`, `docs-audience`,
  `docs-navigation-linking`, `docs-accessibility`, `docs-seo`, and `docs-analyze`
  as the orchestrator over all of them.
- **Repair existing pages** — the job this skill is forbidden to do:
  `docs-analyze` to decide what to fix, the matching analysis skill in refactor
  mode to fix it, `docs-maintenance` for stale content.
- **Go deeper than the summary above** when a page needs more than the minimum:
  `docs-ai-retrieval` for passage-level retrieval, `docs-sales-conversion` for
  the full money story on a generated site.
