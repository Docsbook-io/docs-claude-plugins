---
name: docs-media
description: Find the bloated images and stale screenshots dragging your docs down. Scans every image, video and diagram referenced from markdown — bad formats, oversized files, missing alt text, screenshots older than the current UI — and returns a fix list per file.
metadata:
  version: 1.0.0
  category: analysis
  mode: audit
  accelerated_by:
    - markdown-lsp      # semantic/graph search over the docs folder (self-hosted) — faster & cheaper than grep
    - docsbook-mcp      # same capability in the cloud if the docs live in a Docsbook workspace
  keywords: [media, images, screenshots, videos, diagrams, alt-text]
---

# docs-media — Media Analysis

## Workflow

1. **Gather the docs** — get the list of pages in scope and read their content. If a semantic/graph search tool over the markdown is available (self-hosted `markdown-lsp`, or a connected Docsbook workspace), prefer it — faster and cheaper than scanning files; otherwise read the files directly with `grep`/`find`. Prioritize Tier 1 pages (quick-start, pricing, auth, install) first.
2. **Check scope** — if no image or video references are found in the page content, skip this skill.
3. **Apply checklist** — from the page content / graph: detect missing alt text, generic filenames, missing captions. For physical file checks (size, age, dimensions), note that local repo access is required.
4. **Produce report** — return one JSON issue object per finding, sorted by severity. Note which checks required local access and were skipped.

## Guardrails

- Do not edit any documentation files — surface findings only.
- Physical file checks (size in KB, file age, image dimensions) require local repo access — note when these are skipped.
- Skip this skill entirely if no media references are found in the doc content.
- Empty alt (`![]()`) is correct for decorative images — flag only when surrounding context implies the image is informative.
- Converting PNG diagrams to Mermaid is a recommendation, not a requirement — ask the user before flagging as an issue.

## Inputs

This skill needs two things, by whatever means are available:
- **The list of pages in scope** — a docs folder, a sitemap, or a doc graph.
- **The content of each page** — read on demand.

> **Acceleration (optional).** Graph/semantic search over the docs makes navigation faster and cheaper than scanning files. You can self-host it with [`markdown-lsp`](https://github.com/Docsbook-io/markdown-lsp), or get the same capability in the cloud by connecting a Docsbook workspace. With nothing connected, plain file reads and `grep`/`find` work fine.

## Checklist

### File Formats

| Content type | Recommended format | Notes |
|---|---|---|
| UI screenshot | PNG (or WebP) | Sharp text; never JPG for UI |
| Photo / illustration | WebP > JPG | Natural images |
| Short animation | GIF or MP4 | ≤ 5 seconds |
| Long video | YouTube/Loom embed | > 5 seconds — do not commit video files |
| Architecture diagram | Mermaid in markdown | Code-first, versions in git |
| Logo / icon | SVG | Scalable, no quality loss |

- [ ] **PNG for UI screenshots** — not JPG (JPG degrades text rendering)
- [ ] **GIF only for short animations** — ≤ 5 seconds, ≤ 2 MB
- [ ] **No video files committed** to the repo — use YouTube, Loom, or Vimeo embeds
- [ ] **Mermaid preferred over static PNG** for diagrams and flowcharts

### File Size (local repo check)

- [ ] **PNG screenshot < 500 KB**
- [ ] **GIF < 2 MB**
- [ ] **Total media per page < 5 MB**
- [ ] **No MP4/MOV files** committed to repo

```bash
# Find large media files
find . -type f \( -name '*.png' -o -name '*.jpg' -o -name '*.gif' -o -name '*.mp4' \) -size +500k -exec ls -lh {} \;
```

### File Names (detectable from markdown links)

- [ ] **kebab-case** — `workspace-settings-api-keys.png`
- [ ] **Descriptive** — name describes content, not position: not `screenshot1.png`, `image.png`, `Screenshot 2024-01-15.png`
- [ ] **No spaces or special characters** in file names
- [ ] **No timestamps** in file name — content description, not capture date
- [ ] **Prefix by type** optionally — `ui-`, `diagram-`, `icon-`

### Alt Text (detectable from markdown)

- [ ] **All informative images have alt** — `![alt](image.png)` not `![](image.png)`
- [ ] **Decorative images have empty alt** — `![](decoration.png)`
- [ ] **Alt describes content** — "Workspace settings with API key field" not "Screenshot"
- [ ] **Alt is not "image of" / "screenshot of"** — screen reader already announces it
- [ ] **Length ≤ 125 characters** — longer descriptions go in the body

### UI Screenshots

- [ ] **Cropped to the relevant area** — not the full browser window with chrome
- [ ] **No personal data** — use test accounts, placeholder names/emails
- [ ] **No timestamps visible** on the screenshot itself (they go stale)
- [ ] **Important area is highlighted** — box, arrow, or highlight overlay
- [ ] **Consistent theme** — all screenshots in light mode OR all in dark mode

### Screenshot Freshness (local repo check)

Screenshots older than 180 days in an actively developed product are very likely stale:

```bash
# Screenshots older than 180 days
find . -name '*.png' -mtime +180 -exec ls -lh {} \;
```

From the page content / graph: check `last_updated` of pages containing screenshots (from graph metadata if available) — if a page hasn't been updated in 180+ days and contains screenshots, flag for manual review.

### Videos

- [ ] **Captions/subtitles** on all videos
- [ ] **Transcript or summary** in the page text
- [ ] **Not auto-play**
- [ ] **Described in text before the embed** — what the video shows, how long it is
- [ ] **Hosted externally** — YouTube, Loom, Vimeo — not committed as a file

### Diagrams

- [ ] **Mermaid in markdown** for flowcharts, architecture, ER diagrams:
  ````
  ```mermaid
  graph LR
    GitHub --> Docsbook
    Docsbook --> CDN
    CDN --> Users
  ```
  ````
- [ ] **Source file saved** alongside PNG export — `.excalidraw`, `.drawio` — so diagrams can be updated
- [ ] **Text alternative** for complex diagrams that can't be Mermaid
- [ ] **Readable in both light and dark mode**

## What to Look For

| Severity | Problem | Detection |
|---|---|---|
| `critical` | Informative image with no alt | `![]()` in markdown |
| `high` | PNG > 1 MB | `find` by size (local) |
| `high` | Generic filename — `screenshot1.png`, `image.png` | Regex on image links in markdown |
| `high` | Video file committed to repo (> 5 MB) | `find *.mp4 *.mov` (local) |
| `high` | JPG used for UI screenshot | `.jpg` extension on UI images |
| `high` | Full browser screenshot (not cropped) | Width > 1500px (local exif/identify) |
| `medium` | GIF > 2 MB | `find` by size (local) |
| `medium` | Screenshot on a page not updated in 180+ days | Page `last_updated` + image presence |
| `medium` | Static PNG diagram that could be Mermaid | PNG with architecture/flow content |
| `medium` | Video without caption note | No "captions" / "transcript" near embed |
| `low` | Timestamp in filename | Regex `\d{4}-\d{2}-\d{2}` in filename |
| `low` | Missing highlight on screenshot | No mention of highlight/annotation |

## Output Format

```json
{
  "file": "docs/quick-start.md",
  "line": 34,
  "severity": "critical",
  "rule": "image-missing-alt",
  "found": "Line 34: ![](screenshots/setup.png) — informative image with no alt text.",
  "suggestion": "Add descriptive alt: '![Docsbook workspace creation form with GitHub repo URL field](screenshots/setup.png)'"
}
```

```json
{
  "file": "docs/guides/api-setup.md",
  "line": 67,
  "severity": "high",
  "rule": "generic-filename",
  "found": "Line 67: ![Settings panel](screenshots/screenshot1.png) — filename 'screenshot1.png' is not descriptive and will be impossible to identify when the folder has many screenshots.",
  "suggestion": "Rename to a descriptive kebab-case name: 'screenshots/api-settings-key-field.png'. Update the link in the markdown."
}
```

```json
{
  "file": "docs/architecture.md",
  "line": 12,
  "severity": "medium",
  "rule": "diagram-could-be-mermaid",
  "found": "Line 12: ![System architecture](architecture.png) — static PNG diagram. Hard to keep updated without design tools.",
  "suggestion": "Convert to Mermaid:\n```mermaid\ngraph LR\n  GitHub --> Docsbook\n  Docsbook --> CDN\n  CDN --> Users\n```\nMermaid renders automatically, versions in git, and updates in a PR without design software."
}
```

## Acceptance Criteria

- [ ] Every image reference in scope has been checked for alt text and filename quality.
- [ ] Physical file size and age checks are either run (local access) or explicitly noted as skipped with a reason.
- [ ] Skill exits early with a clear message if no media references are found.
- [ ] Output is valid JSON per the format above, one object per finding.

## Related Skills

- `docs-accessibility` — alt text is an a11y requirement
- `docs-maintenance` — stale screenshots are a maintenance issue
- `docs-seo` — descriptive filenames and alt text help SEO
- `docs-analyze` — orchestrator
