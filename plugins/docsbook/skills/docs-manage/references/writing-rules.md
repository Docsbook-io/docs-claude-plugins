# Writing rules — get it right while writing

Load this **before the first line** of a new page, and before any rewrite. It is a guardrail, not an audit: it has no findings format on purpose. Noticing a defect on a neighbouring page while writing means noting it and moving on — repairing it is a separate job with its own justification.

## 1. Decide the page type first

Pick exactly one type before writing a word. The type decides structure, tone, and what is off-limits.

- **Tutorial** (learning) — one guaranteed path, imperative steps, a stated start and end state. No alternatives: "you can also use the CLI" belongs in a how-to.
- **How-to** (task) — one real goal, a competent reader, may branch ("if X, do Y"). No teaching foundations mid-task; link out instead.
- **Reference** (information) — the same shape for every entry, complete, neutral. No narrative, no "which one should I pick".
- **Explanation** (understanding) — why and how it works, trade-offs, opinions allowed. No numbered procedures, no full parameter tables.

**One page, one type.** Four pages on one topic — one per type — is correct. One page covering the topic four ways is the defect audits flag most.

**The title matches the type.** A how-to starts with a verb ("Set up a custom domain"). An explanation reads "How authentication works". A reference is a noun label ("API endpoints").

## 2. Structure

- **Frontmatter carries `title` and `description`.** Title 50–60 characters, unique across the docs, phrased as intent — not `Authentication` but `How to authenticate API requests`. Description 130–160 characters, a complete active sentence naming the outcome.
- **One H1, and it comes from `title`.** Do not open the body with `# Title`.
- **Never skip a heading level.** H2 → H3 → H4. A jump to H4 breaks screen-reader and keyboard navigation.
- **Headings make sense out of context** and are sentence case: "Set up a custom domain", not "Set Up A Custom Domain" and not "Getting fancy". Sibling headings are unique and parallel in structure.
- **Tutorials open with prerequisites**, versioned and specific — "Node.js 18+", not "Node.js installed" — above step 1, never mid-page, with a "what you'll learn" line before them.
- **Every fenced code block declares a language.** Separate the command from its output into two blocks. Placeholders look fake by design: `YOUR_API_KEY`, never `key123`, and never a real token.
- **Keep it scannable.** Paragraphs 2–4 sentences. A table for any comparison of three or more columns. At most about three callouts per page, and a warning always *before* the action it warns about. Split a tutorial past roughly 2000 words.

## 3. Write so a single section can be quoted

An assistant retrieves and ranks **passages**, not pages. A section that only makes sense after the three above it loses before the reader ever sees it.

- **Name the subject in full inside each section.** "To rotate it, call…" is unretrievable — nothing in it says which product, or that it is an API key.
- **Answer in the first 60 words after the heading**, then elaborate. "Before we get into rotation, it's worth understanding…" is the answer arriving too late.
- **One question per section.** A section answering three competes weakly for all three — split it.
- **Apply the quote test.** Paste the section into an empty file. Does it still say what it is about and answer completely? If not, rewrite it now.
- **Give one extractable fact where you honestly have it** — a limit, a timeout, a price, or a one-sentence definition ("A *workspace* is a documentation site with its own domain, members and billing").
- **Never invent a number, limit, price, quotation or source** to make a passage quotable. Omit it and say it is not stated — a wrong limit repeated by an assistant is worse than silence.
- **Keep natural synonym variety** ("API key", "token", "credentials"). Writing as a human would is the point; cramming query strings scores *below* it.

`retrieval.md` goes deeper when a page needs more than this minimum.

## 4. Style

- **Active voice, second person, present tense.** "The service returns an error", not "an error is returned". "You" — not "the user", and not "we" except for an explicit recommendation on an explanation page.
- **Imperative for every instruction.** "Click Save", not "You should click Save".
- **Cut the fillers on sight:** *simply, just, easily, of course, obviously, naturally, please note that*. They read as contempt to a reader who is stuck.
- **Cut the marketing adjectives:** *powerful, robust, flexible, seamless, effortless, revolutionary*. Replace with a number or delete. "A powerful indexing engine" → "indexes a 500-page repo in under 30 seconds".
- **Shorten the verbose:** "in order to" → "to", "utilize" → "use", "leverage" → "use", "make sure to" → "ensure".
- **One idea per sentence, under 25 words.** Three or more parallel items become a list, not an "and" chain. Lead with the main clause.
- **One name per concept**, for the page and for the whole docs set. If the interface says "workspace", never write "project". Product names are spelled exactly.
- **Match tone to type:** tutorial encouraging, how-to efficient and preamble-free, reference neutral, explanation conversational but authoritative.

## 5. Audience

- **Name the reader before writing**, explicitly or through the page type, and write to that one reader for the whole page.
- **Declare prerequisites, then honour them.** If the page says "no experience needed", every term in it must be introduced. Unstated assumed knowledge is the most expensive defect on a getting-started page.
- **Expand every abbreviation at first use** — "CLI (command line interface)" — and define product-specific terms the first time they appear.
- **Do not mix levels on one page.** "Open your terminal for the first time" and "configure the idempotency key" cannot share a reader. Split, or separate with explicit per-audience headings.
- **Do not over-explain in reference.** A reader in the API table already knows what an API is; starting with basics wastes their scan.
- **Beginner pages** explain every command, show expected output, and include error handling ("if you see X, it means Y, do Z").
- **Expert pages** get to the information fast, assume product knowledge, and document the edge cases.

## 6. Do not end in a dead end

Every page owes the reader somewhere to go. The minimum costs one section.

- **Close every page with `## Next steps` or `## Related`** and at least one internal link. A page ending on its last instruction is a page readers leave.
- **Point forward by type:** tutorial → how-to, how-to → reference, reference → the guide that demonstrates it, explanation → the tutorial that applies it.
- **Evaluation pages** (hero, features, use-cases, pricing, FAQ) carry **exactly one** conversion action. Competing calls to action convert worse than one clear one; secondary links go in "Next steps", not as buttons.
- **No call to action on reference pages.** A reader in a parameter table wants related links, not a pitch. A tutorial converts by working, not by selling.
- **Never state a price, plan, limit or SLA you did not read from the source.** An unknown price is "contact sales" or a link — never a plausible guess.
- **Link to a route that exists.** Do not invent `/signup`; use a URL observed on the product or an internal doc path. A root-relative product path copied into docs served from another domain is a 404 — rewrite it onto the source's origin, and leave internal links and anchors alone.

## 7. Links and accessibility

- **Every new page gets at least one inbound link** from an existing page, added in the same change. A page nobody links to is an orphan the moment you save it.
- **Anchor text describes the destination:** "see the authentication guide", never "click here", "read more", or a bare URL. Screen readers list links out of context, and so do readers who scan. Identical anchor text must go to the same place.
- **Link targets resolve** — the file and the `#anchor` both exist when you commit.
- **Alt text on every informative image**, describing content rather than the file: "Workspace settings with the API key field highlighted", 125 characters or fewer, never starting with "image of". Decorative images take empty alt.
- **No information lives only inside an image**, and no meaning is carried by colour alone — "the red fields" needs "the required fields (shown in red)".
- **Numbered lists for sequences, bullets for sets, a header row on every table.** Tables are for tabular data, never for layout, and carry a caption or a preceding sentence saying what they show.
- **Videos carry captions and a transcript or written summary**, and never autoplay.
- **Emoji are never functional indicators.** Screen readers read their names aloud, which turns a checkmark into noise.

## The 60-second self-check before committing

- [ ] I can name this page's type, and nothing on it belongs to another type.
- [ ] `title` and `description` exist, are unique, sized, and read as reader intent.
- [ ] Headings descend without skipping; exactly one H1, from frontmatter.
- [ ] Every code block has a language; prerequisites are versioned, if a tutorial.
- [ ] Each section passes the quote test standalone and answers in its first 60 words.
- [ ] No filler, no marketing adjective, no passive instruction, one term per concept.
- [ ] Every term is either defined here or covered by the stated prerequisites.
- [ ] The page ends with a next step, and every commercial fact came from the source.
- [ ] Something links **to** this page, and every link **from** it resolves.
- [ ] Every informative image has alt text; nothing is conveyed by colour alone.

Any unchecked box is a defect being born. Fixing it here is an order of magnitude cheaper than fixing it in a queue three months from now.
