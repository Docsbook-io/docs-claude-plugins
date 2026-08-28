# Presentation — rendered blocks, images, diagrams

## Rich blocks inside markdown

A content widget marks a region of **ordinary markdown** to be rendered as a UI block. The markers are HTML comments, so they are invisible in every markdown reader:

```markdown
<!-- widget:NAME -->

…ordinary markdown…

<!-- /widget -->
```

Two properties make this safe to use anywhere:

- **The source stays plain markdown.** The comments are invisible in a repository view, in an editor preview, in `cat`. A reader who never sees the rendered site still sees a correct, complete page with the same headings and the same links.
- **It degrades, never hides.** An unknown name, a missing closing marker, or a renderer that does not exist yet leaves the content as normal markdown. Nothing between the markers can disappear from the page.

Never put JSON, YAML or configuration **between** the markers. The region must read as meaningful prose on its own — the widget is a presentation upgrade applied on top, never a data format. A widget may accept layout switches **on** the opening marker (`<!-- widget:NAME cols=2 -->`); that is not a contradiction, since the marker is already invisible and the region between markers stays pure markdown.

### Read the live catalog — this reference deliberately lists no widgets

**Get the platform's live widget set before writing a single marker.** It tells you, for every widget this site actually has: its name, what it renders, when to reach for it, its exact markdown contract, and a copy-pasteable example.

There is no inventory of names here, and none should be added:

- **The set grows** on the platform's release cycle, not this skill's. Any list written here is wrong the week after it is written, and a stale list is worse than none: it teaches you to reach for four widgets when the site has eight, so the best fit is never even considered.
- **Contracts have required parts.** A widget used with a required piece missing renders *worse* than plain markdown — a card grid with no icons is a row of empty grey tiles. The live catalog is the only place those requirements are stated correctly.
- **The set is per site.** An owner can switch a widget off. A marker for a switched-off widget loses nothing, but it also does nothing — you would be reporting work you did not do.

**No catalog available?** Do not guess a name from memory or from another platform's syntax. Write the region as clean plain markdown and say in your report that widgets were skipped because the catalog was unreachable. Plain markdown is always a correct answer; an invented marker name is silently ignored, which looks exactly like success.

### Choosing one — match the shape, not the vibe

**Reach for a widget when the page's existing structure already IS the shape a widget renders.** The test: can you describe the region in one structural sentence — "several headed sections, each holding a list of links with one line of context", "many sibling headings, each independent", "an ordered procedure", "an endpoint and its parameter table", "a closing action and its link"? If yes, look for a widget whose contract consumes that shape. If you cannot describe it structurally, there is nothing to wrap.

The selection rule is about the reader, which is why it is stable while widget names are not:

- Parallel options the reader compares side by side (plans, hosting choices) want a **grid** — one tile per option, each with its own one-line pitch.
- Questions the reader scans and opens exactly one of want **collapsible rows**.
- An ordered path where "how long until value" is the real question wants a **numbered sequence**.
- The page's closing ask wants a **call-to-action block** — one per page, never two.

**Never reshape content to fit a widget.** Wrapping is additive: you add two marker lines. Changing the words, the headings, or the order is a separate edit with its own justification. A widget that requires rewriting the section is the wrong widget.

**Do not use one when:**

- The page is read start to finish. A tutorial, a concept explainer or a narrative guide loses its thread when chopped into tiles or collapsed rows.
- Sections depend on each other. Collapsing step 3 hides what the reader needs at step 4.
- There are fewer than three items. Two cards is a worse-looking list.
- The content is the page's primary substance. Never collapse what the reader came for.
- The underlying markdown is weak. A widget makes bad structure *more* visible, not less. Fix the content first.
- You are trying to make a thin page look substantial. Three links in a grid is still three links.

### Applying one

1. Read the chosen widget's contract in full — every line, including the required parts — and its example.
2. Check the region already reads well as plain markdown, before any marker.
3. **Wrap, do not rewrite.** Add the two marker lines and follow the contract completely; a partially-followed contract renders worse than no widget.
4. Use a layout switch only if the catalog documents one for that widget, and only when the default is visibly wrong for this content. An unrecognised switch is silently ignored.
5. **Verify both renderings.** The page must still read correctly as raw markdown — that is what a repository view and every crawler see — and the rendered block must group the content the way you intended.

Markers go on their own line with a blank line around them. Never nest widgets. One widget per region, no more than two per page; wrapping an entire long page in one is almost always wrong.

Report per page: the path, the widget applied, the line range wrapped, which structural shape matched, any page you considered and rejected with the reason, and whether the catalog was read live or was unreachable.

---

## Images, screenshots and diagrams

### Formats

| Content | Format | Why |
|---|---|---|
| UI screenshot | PNG or WebP | Sharp text; never JPG, which degrades it |
| Photo or illustration | WebP, then JPG | Natural images |
| Short animation | GIF or MP4, five seconds or less | |
| Longer video | An external embed | Never commit video files |
| Architecture or flow diagram | Mermaid in markdown | Code-first, versions in git, updates in a pull request without design software |
| Logo or icon | SVG | Scales without loss |

Sizes: a PNG screenshot under 500 KB, a GIF under 2 MB, total media per page under 5 MB.

### Filenames

kebab-case, descriptive of content rather than position, no spaces, no capture timestamps. `workspace-settings-api-keys.png`, never `screenshot1.png` or `Screenshot 2026-01-15.png`.

### Screenshots

Cropped to the relevant area rather than the whole browser window. No personal data — use test accounts and placeholder names. No visible timestamps, which go stale. The important area highlighted with a box, an arrow or an overlay. One consistent theme across the whole set: all light or all dark, never mixed.

Screenshots on a page untouched for 180 days in an actively developed product are very likely stale, and worth a manual look even when nothing else flags them.

### Alt text

Every informative image carries alt describing the **content**, not the file: "Workspace settings with the API key field highlighted". 125 characters or fewer; longer descriptions go in the body. Never start with "image of" or "screenshot of" — the screen reader already announced it is an image. Decorative images take empty alt so the reader skips them. Complex diagrams get a text alternative in the body, and **no critical information may exist only inside an image**.

### Diagrams

Prefer Mermaid. Keep the editable source (`.excalidraw`, `.drawio`) alongside any exported image so the diagram can be updated. Make sure it reads in both light and dark. Converting an existing static diagram is a recommendation, not a requirement — ask before treating it as a defect.

### Video

Captions or subtitles on every video, a transcript or written summary in the page text, a description before the embed saying what it shows and how long it is, audio description for important visual information, and never autoplay.
