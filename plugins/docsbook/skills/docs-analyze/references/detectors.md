# Content detectors — what is wrong with the page itself

Run only the detectors that can explain the failure mode phase 2 established. Running all of them on every page produces a report nobody reads.

Independent detectors run in parallel. Anything needing the whole graph — orphans, broken links, duplicate titles, translation parity — runs after the graph is built. Deduplicate across detectors: a line flagged twice is reported once, at the higher severity, naming both.

None of these detectors edits a file. They report.

---

## Page type (Diátaxis)

Classify first, then check. Never flag a page for violating rules of a type it is not. Confirm any naming convention the project uses (`/guides/` = how-to, `/concepts/` = explanation) before flagging navigation.

The four types and what breaks each:

**Tutorial** — learning-oriented, one guaranteed path, imperative, hands-on. Breaks on: alternatives ("alternatively, you can…"), theory mid-task, full parameter tables, undeclared assumed knowledge, an open-ended outcome.

**How-to** — task-oriented, assumes competence, handles variation ("if X, do Y"). Breaks on: teaching foundations mid-task, listing every option without guiding a choice, a rigid single path.

**Reference** — information-oriented, consulted not read, machine-like consistency, neutral, complete. Breaks on: narrative prose between entries, missing entries, inconsistent format, opinions about which option to prefer.

**Explanation** — understanding-oriented, discusses rather than instructs, may be opinionated about trade-offs. Breaks on: step-by-step instructions, complete parameter lists, runnable code, no conceptual depth.

One page covering the same topic in all four types is a defect. One topic across four pages, one per type, is correct.

| Severity | Problem |
|---|---|
| critical | No identifiable type — no consistent goal or audience |
| high | Tutorial offers alternative paths; reference reads as narrative; how-to teaches foundations; tutorial assumes undeclared knowledge |
| medium | Tutorial title is a noun; explanation carries numbered instructions; how-to has no variation handling |
| low | One large page serving two distinct audiences; tutorial missing prerequisites or "what you'll learn" |

---

## Structure and frontmatter

Cheap, deterministic, runs on every page.

- **Frontmatter** — `title` present, 50–60 characters, unique, search-intent (starts with a verb or question), keyword near the start, not stuffed. `description` present, 130–160 characters, active voice, a complete sentence, outcome-focused. Optionally `last_reviewed`.
- **Headings** — one H1, generated from the title (no `# Title` in the body). H2 → H3 → H4 in sequence, never skipping. Siblings unique. Descriptive out of context. Never used for visual sizing. Question-style H2s where the section answers one.
- **Prerequisites** — tutorials declare them before step 1, with specific versions ("Node.js 18+", not "some experience"), plus a "what you'll learn" line at the top, not buried.
- **Code blocks** — language tagged on every fence. Output separated from input. Lines short enough not to scroll. Commands complete and copy-pasteable. Placeholders obviously fake (`YOUR_API_KEY`, never `key123`). No real secrets, ever.
- **Density** — reference pages complete; tutorials split beyond ~2000 words; every H2 carries real content; paragraphs 4–5 sentences maximum; comparisons in tables, not prose.
- **Callouts** — warnings precede the action they warn about. More than three callouts on a page is noise. Type matches content. No "Note:" typed as plain prose.

| Severity | Problem |
|---|---|
| critical | Missing `title`; duplicate title across pages; multiple H1 in the body |
| high | Missing `description`; heading level skip; untagged code block; tutorial with no prerequisites |
| medium | Title over 60 or under 30 chars; description over 160; title is a label with no verb; warning after its action |
| low | No `last_reviewed`; placeholder that does not look like a placeholder |

---

## Style and register

Ask whether the project has a style guide and audit against it; use these defaults otherwise. Sample pages of different types first, to calibrate before flagging specifics.

- **Voice** — active by default. Second person. Imperative for instructions. Present tense. First person plural only for opinions, and only in explanation pages.
- **Filler and marketing** — flag for review, not automatic removal: "simply", "just", "easily" (condescending to a stuck reader); "powerful", "robust", "flexible", "seamlessly", "effortlessly" (empty); "of course", "obviously", "naturally" (excluding); "please note that", "in order to", "utilize", "leverage", "make sure to" (verbose).
- **Sentences** — under 25 words on average, one idea each, main clause first. Paragraphs 2–4 sentences. Three or more parallel items become a list.
- **Headings** — sentence case, descriptive not clever, parallel structure among siblings.
- **Terminology** — one term per concept, matching the product's own UI label. Define at first use. Product names exact. Precise technical synonyms in appropriate contexts are not inconsistency.

Expected register by type: tutorial encouraging; how-to efficient and preamble-free; reference neutral and precise; explanation conversational but authoritative.

| Severity | Problem |
|---|---|
| high | Same concept under different names; passive voice in an instruction; "simply"/"just"/"easily" in a tutorial or how-to |
| medium | Sentence over 40 words; marketing adjective with no specifics; mixed "you" and "the user"; heading not in sentence case |
| low | "Please note that"; "utilize"; undefined abbreviation at first use |

---

## Audience fit

Read the page's stated prerequisites and its type *before* flagging vocabulary. Jargon is only a finding when it is undefined **and** the stated prerequisites do not cover it.

- Every page states who it is for, explicitly or by type. Prerequisites are specific. Assumed knowledge matches what was declared.
- Technical terms defined at first use; abbreviations expanded; product-specific terms explained on beginner pages.
- Beginner pages: every command explained, expected output shown, error handling included, no "just".
- Expert pages: no hand-holding, no re-explaining the product, dense is fine, edge cases documented.
- A page may serve two levels if the sections are clearly separated by headers. Without separation, it is mixed-audience.

| Severity | Problem |
|---|---|
| critical | Beginner tutorial uses expert terms with no definition |
| high | Prerequisites claim no experience while content assumes coding; one page serves beginner and expert with no break; abbreviation unexpanded at first use |
| medium | Product term undefined on a beginner page; reference page over-explains basics; tutorial assumes an unlinked prior tutorial |
| low | No "who this is for" on an ambiguous page; examples too complex for the stated level |

---

## Links and navigation (needs the whole graph)

Never run on a single page. The root index is expected to have no inbound links — exclude it from orphan detection. Ask before making outbound HTTP requests to check external links.

Orphan detection: `all_pages − linked_pages − {homepage}`.

- Every referenced page exists; anchor links resolve to real headings; relative paths used consistently.
- Every page has at least one inbound link.
- Anchor text describes the destination — never "click here", "read more", "here", "this link", never a bare URL.
- Hierarchy at most three levels for most content. Tier 1 pages reachable in one click.
- Tutorials end with "Next steps". How-tos link to the reference for commands they use. Reference links back to a demonstrating guide. Concept pages link to the tutorial that applies them.
- External links prefer official sources over blog posts that disappear.

| Severity | Problem |
|---|---|
| critical | Broken internal link; broken anchor |
| high | Orphan page; "click here" anchor text; hierarchy deeper than four levels |
| medium | Tier 1 page not in top navigation; tutorial with no "Next steps"; bare URL as anchor text |
| low | External link to an unstable source; thematically adjacent pages never cross-linked |

---

## Accessibility (WCAG 2.1 AA, from markdown source)

Contrast ratios and keyboard behaviour depend on the rendered theme and are out of scope — note them, do not flag them. Empty alt is correct for decorative images; flag only when the context implies the image is informative.

- **Images** — informative images have alt; decorative ones have empty alt; alt never starts with "image of"/"screenshot of"; alt describes content not filename; ≤125 characters; complex diagrams get a text alternative in the body; no critical information exists only inside an image.
- **Headings** — one H1, sequential levels, unique siblings, descriptive out of context, never used for sizing.
- **Links** — meaningful out of context; identical anchor text goes to the same place; new-tab links labelled.
- **Lists** — numbered for sequences, bulleted for sets, parallel grammar.
- **Tables** — header row present, never used for layout, no merged cells, a caption or preceding sentence explaining what they show.
- **Code** — language tagged; output separated; inline code in backticks rather than distinguished by colour.
- **Media** — captions or subtitles, audio description for important visuals, no autoplay, a transcript or written summary.
- **Prose** — sentences under 25 words, paragraphs 2–4 sentences, abbreviations expanded, no meaning conveyed by colour alone.
- **Markup hygiene** — markdown over raw HTML; correct ARIA when HTML is unavoidable; emoji never used as functional status indicators (screen readers read their names aloud).

| Severity | Problem |
|---|---|
| critical | Informative image with no alt; multiple H1 |
| high | Alt starting "image of"; "click here"; heading skip; untagged code block; video with no captions or transcript |
| medium | Generic alt ("Screenshot", "Diagram"); paragraphs over six sentences; colour-only meaning; table with no header row |
| low | Raw HTML where markdown exists; emoji as a functional indicator |

---

## Media

Skip entirely if the pages reference no media. Physical checks (byte size, dimensions, file age) need local access — note them as skipped otherwise.

Formats: PNG or WebP for UI screenshots (never JPG — it degrades text), WebP or JPG for photos, GIF or MP4 under five seconds for short animation, an external embed for longer video, Mermaid in markdown for diagrams, SVG for logos.

Sizes: PNG under 500 KB, GIF under 2 MB, total media per page under 5 MB, no video files committed.

Filenames: kebab-case, descriptive of content not position, no spaces, no capture timestamps.

Screenshots: cropped to the relevant area, no personal data, no visible timestamps, the important area highlighted, one consistent theme across the set. Screenshots on pages untouched for 180+ days in an actively developed product are very likely stale.

Diagrams: prefer Mermaid — it renders automatically, versions in git, and updates in a pull request without design software. Keep the editable source next to any exported image. Converting an existing PNG diagram is a recommendation; ask before flagging it as an issue.

| Severity | Problem |
|---|---|
| critical | Informative image with no alt |
| high | PNG over 1 MB; generic filename; committed video file; JPG used for a UI screenshot; uncropped full-browser screenshot |
| medium | GIF over 2 MB; screenshot on a page untouched for 180+ days; static diagram that could be Mermaid; video with no caption note |
| low | Timestamp in a filename; screenshot with no highlight |

---

## Freshness and maintenance

Whole-tree work, not a single-page review. Confirm the staleness threshold — default 90 days for Tier 1 pages, 365 for the rest — and confirm which pages are Tier 1.

- No "coming soon" older than 30 days. No past date presented as a future promise. No TODO / FIXME / XXX in published docs. No "in beta" on something that shipped. Version numbers current.
- Deprecated pages carry a banner at the top, not buried, plus a **specific** migration path ("use `newMethod()`, see [guide]", never "use the new API"). Deprecated content stays for at least one major release. Internal links to it note the deprecation. Old URLs redirect.
- Ownership: `last_reviewed` on technical pages, an owner somewhere (CODEOWNERS, frontmatter, a registry), Tier 1 reviewed within 90 days.
- Code/docs consistency where local access exists: endpoints in docs exist in the routes, CLI commands work on the current version, examples are at least syntactically valid.

With local access these are cheap:

```bash
# stale pages
find docs -name '*.md' -mtime +90 -printf '%T@ %p\n' | sort -n | head -20
# leftover markers
grep -rnE '\b(TODO|FIXME|XXX|HACK)\b' docs/
# deprecated with no migration path
grep -rln -i "deprecated\|no longer supported" docs/ | while read f; do
  grep -qiE "use instead|replaced by|migration|migrate|see \[" "$f" || echo "$f — no migration path"
done
```

Without local files, read the same signals from page content and any `last_updated` metadata the source provides, and say which file-age checks were skipped.

| Severity | Problem |
|---|---|
| critical | TODO/FIXME in published docs; "coming soon" older than 90 days; Tier 1 page untouched for 180+ days |
| high | Past date as a future promise; an old version referenced prominently; deprecated with no migration path |
| medium | No `last_reviewed`; any page untouched for 365+ days; a documented endpoint that does not exist |
| low | "Beta" on a GA feature; no owner attribution anywhere |

Deprecated content is flagged for a banner and a migration path — **never** for immediate deletion.

---

## Translations

Skip entirely when one language is in scope. Confirm the source-of-truth language before flagging parity.

- Language codes are ISO 639-1 (`en`, `ru`, `zh`), regional variants IETF (`zh-CN`, `pt-BR`). A default is explicitly set.
- Parity is priority-based. Tier 1 (home, quick start, pricing, auth, privacy/terms) is always translated and never more than 30 days behind source. Tier 2 (top pages by traffic, onboarding, troubleshooting) when possible. Tier 3 (deep reference, edge-case guides, changelog) may stay in one language.
- A missing translation falls back to the source language with a banner — never a 404.
- Navigation, buttons and UI strings are translated; a non-source sidebar showing source-language labels is a defect. The language switcher is reachable from any page.
- **Code is never translated** — only surrounding prose and code comments. A translated string value or a comment that breaks JSON is a high-severity error. Brand and product names are never translated.
- Dates, numbers and currency follow the locale. RTL languages set direction and mirror directional imagery.
- A stale translation is worse than no translation. Anything more than 90 days behind carries an "may be outdated" banner.
- Multilingual discovery: `hreflang` per version, self-referential, `x-default` on the fallback, canonical pointing at the page itself rather than the source language, all versions in the sitemap.

| Severity | Problem |
|---|---|
| critical | Tier 1 page missing in an enabled language; source-language labels in a translated sidebar |
| high | Non-ISO language code; Tier 1 translation 90+ days behind; translated code breaking syntax; missing translation returning 404 |
| medium | `hreflang` missing; date format not localised; UI screenshot in another language with no note |
| low | Brand name translated; register too formal or informal for the language |
