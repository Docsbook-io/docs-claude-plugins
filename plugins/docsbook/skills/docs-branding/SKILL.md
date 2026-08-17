---
name: docs-branding
description: Set a Docsbook workspace's brand — accent/muted colors (light + dark), Google Font, theme, logo, icon, name — by deriving values from real signals instead of inventing them. Pulls the source site's theme-color and og:image, the dominant color of the logo or icon, branding already on the workspace, and brand mentions in the README, then proposes contrast-checked palettes and asks the user to choose. Never writes a value the user did not confirm. Pair with /docs-create, /docs-setup-workspace, /docs-style-tone, or /docs-analyze.
metadata:
  version: 1.1.0
  category: creation
  mode: platform
  requires_docsbook_mcp: true
  uses_mcp_tools:
    - list_workspaces
    - get_workspace
    - update_branding
  keywords: [branding, colors, palette, logo, theme, font, accent, design]
---

# docs-branding — Derive a brand, advise, then ask

This skill exists because agents reach for `#3b82f6` and `Arial` the moment branding comes up. They invent. The whole point here is the opposite: **DERIVE → ADVISE → ASK DYNAMICALLY**. Find the brand signals that already exist, turn each one into a concrete, defensible recommendation, and put a real choice in front of the user before touching anything.

## Workflow

1. **Connect and read current state** — resolve which workspace you are operating on and read its existing branding (accent/muted colors for light + dark, `base_foreground`/`base_background`, `font_family`, `default_theme`, `logo_url`, `icon_url`, `custom_name`). Whatever is already set is a brand signal, not a blank slate — treat it as the starting point and the thing you must respect, not overwrite blindly.

2. **DERIVE — collect brand signals from what already exists. Never invent.** Gather evidence from every source available before forming an opinion:
   - **Source site** (if the docs came from a website or one is known): fetch its HTML and read `<meta name="theme-color">`, `<meta property="og:image">`, favicon, and any inline CSS custom properties / `--accent` style tokens. The site's `theme-color` is the single strongest signal of the intended accent.
   - **Logo / icon** (`logo_url`, `icon_url`, or a file the user provides): determine the dominant non-neutral color. This is the brand's anchor color — describe it by hex.
   - **Workspace** already-set values from step 1 — an accent already chosen by a human outranks anything you would derive.
   - **README / repo**: brand name, tagline, any explicit color mentions ("our signature teal", hex codes in a style section).
   - Record each signal with its source. If a signal is missing, note it as missing — do not fill the gap with a guess.

3. **ADVISE — turn each derived fact into a concrete recommendation.** Tie every suggestion to evidence, e.g. *"The site's `theme-color` is `#1E40AF` and the logo sits in the same blue family, so a blue accent (`#1E40AF` light / `#3B82F6` dark) is the honest match."* Then build out the full palette from the anchor color using the methodology below:
   - **Build the full palette from one brand color** (see *Deriving a palette*) — accent → a muted companion (desaturated / neutral, not a second loud color) → `base_foreground` / `base_background`.
   - **Light + dark, always** — derive dark-mode variants (lightened accent so it stays legible on a dark background; near-black background, off-white foreground). A palette that only covers light mode is incomplete.
   - **Check contrast (WCAG 2.1 AA)** — foreground-on-background ≥ 4.5:1; accent used as a link/button against its background sufficiently contrasting. Adjust lightness until it passes; report the ratios.
   - **Fit industry and audience** — let the segment nudge the choice (fintech → restrained blue-greys; dev-tools → high-contrast, often dark-first; consumer → warmer, friendlier). Pick a Google Font in the same spirit (geometric sans for product/dev, humanist sans for consumer) — and only if the user wants to change it.

4. **ASK DYNAMICALLY — build the question from what you derived, and always offer three kinds of choice.** Never present a single take-it-or-leave-it value. Every branding question gives the user: **(a) pick** one of 2–3 derived palettes with their real hex values shown; **(b) type your own** value; **(c) send a reference** — a site URL or a screenshot — which you then run back through step 2 to derive from. See *The dynamic question pattern* for the exact shape.

5. **Apply only after the user chooses** — call `update_branding` with exactly the fields the user confirmed, nothing extra. Echo back what was written. If the user picked only an accent, write only accent fields; leave font, theme, logo untouched unless they were part of the choice.

6. **Report** — list every field written with its final value and the signal it came from, the WCAG ratios for the chosen palette, and any signal that was missing (so the user knows what was guessed-from-context vs. derived-from-evidence — there should be none of the former).

## Guardrails

- **Never invent a color or a font.** No `#3b82f6`-from-nowhere, no `Arial`/`Inter` default just to fill the slot. Every proposed value traces to a derived signal or to the user's own input. If you have no signal at all, your job is to *ask for one* (a reference URL/screenshot), not to make one up.
- **Always ASK before writing.** `update_branding` runs only after the user has explicitly chosen. No silent application, no "I went ahead and set it."
- **Contrast is mandatory, not optional.** Do not offer or apply a palette whose body text fails WCAG 2.1 AA (≥ 4.5:1). If the brand's literal color fails on white, propose the nearest passing shade and say so.
- **Respect branding already set.** A human-chosen accent on the workspace is a decision — surface it, build around it, and only change it if the user asks. Do not "improve" existing branding unprompted.
- **Always cover light and dark.** Never ship an accent without its dark-mode companion and a foreground/background pair that works in both schemes.
- **Three choices, every time.** A branding question that doesn't offer pick / type-your-own / send-a-reference is incomplete — the user must always be able to steer.

## MCP Tools

| Tool | Purpose |
|------|---------|
| *(resolve the workspace and read its configuration)* | Find the target workspace; read current branding + logo/icon URLs as derive signals |
| `mcp__docsbook__update_branding` | Write only the user-confirmed color / font / theme / logo fields |

The `update_branding` fields you can set: `accent_color`, `accent_color_dark`, `muted_color`, `muted_color_dark`, `base_foreground`, `base_foreground_dark`, `base_background`, `base_background_dark`, `font_family` (Google Font name), `default_theme` (`light`/`dark`/`system`), `theme_toggle`, `background_glow`, `logo_url`, `icon_url`, `custom_name`, `cta_url`. All available on the Free plan.

`cta_url` is not a visual setting and does not follow the palette rules below: it is the **Call To Action URL**, the one page the docs should drive readers to (pricing, demo booking, signup). Read it before writing content or touching the header — when it is set, it is the destination for the site's CTA, and it belongs in the header as a link with `color` set (via `update_navigation`) so it renders as a filled button rather than one more nav item. Only ever write it from a URL the user named or one the source makes unambiguous; the same "ask before writing" rule below applies.

## Logo and icon are different slots — do not cross-fill them

They look interchangeable and are not. Getting this wrong quietly breaks the header.

- **Logo** — the horizontal wordmark in the header (usually mark + product name as text). Only ever put a real horizontal logo here.
- **Icon** — the square favicon for the browser tab and the small header glyph.

**Never put a square favicon into the logo slot.** The square image takes the logo's place and the product name disappears from the header, so the site reads as less branded than if you had set no logo at all. When the source has only a square mark: leave the logo empty, set the icon, and set the display name — the header then renders the name as text beside the small icon, which is the correct look.

Two more checks before you write an image URL:

- **Verify the URL is publicly fetchable and actually an image** (200, `content-type: image/*`). An image behind a framework's on-the-fly optimizer or a path that returns an HTML shell will silently render as nothing.
- **Match the theme to the source.** A light product site whose docs open dark reads as someone else's site. Pin the detected scheme rather than leaving it to `system`, and only offer a theme toggle if the source has one. If the stored theme is correct but the page still renders the other scheme, that is a render-layer bug — report it, do not keep rewriting the field.

## Deriving a palette from a logo or site

The goal is a complete, balanced palette from a single anchor color — not a rainbow.

1. **Find the anchor.** Priority: the site's `theme-color` → the dominant non-neutral color of the logo/icon → an explicit hex in the README. This becomes the **light-mode accent**.
2. **Sanity-check the accent for UI use.** It will be used for links and buttons. If it is too light to read as a link on a white background, darken it until it passes (see contrast). Keep the hue; move only the lightness.
3. **Derive the muted companion.** `muted_color` is the quiet secondary — borders, secondary text, subtle backgrounds. Take the accent's hue, drop saturation hard (toward a grey-tinted neutral), nudge lightness toward the background. It should read as "the same brand, turned down", never as a second accent competing for attention.
4. **Set foreground / background.** Default to a near-black foreground (`#111`–`#1a1a1a`) on a white/near-white background (`#fff`–`#fafafa`) for light mode — unless the brand explicitly runs a tinted surface.
5. **Pick the font (only if changing it).** Map a Google Font to the brand's character; never swap an existing font without the user asking.

## Building light + dark

Every field has a `_dark` twin. Derive the dark scheme from the light one rather than inventing a separate palette:

- **`accent_color_dark`** — lighten/brighten the light accent so it stays vivid and legible on a dark surface (a mid-blue that pops on white often disappears on near-black; raise its lightness).
- **`base_background_dark`** — near-black, not pure `#000` (e.g. `#0b0d10`–`#141414`); pure black crushes shadows and feels harsh.
- **`base_foreground_dark`** — off-white, not pure `#fff` (e.g. `#e6e6e6`–`#f2f2f2`); pure white on near-black causes halation.
- **`muted_color_dark`** — same desaturated-companion logic, tuned for the dark surface.
- **`default_theme`** — `"system"` when the source had a theme toggle or no clear preference; pin to `light`/`dark` only when the brand is unambiguously one.

## WCAG 2.1 AA contrast checklist

Compute the contrast ratio (relative luminance per WCAG 2.1) for each pair and report the number:

- [ ] **Body text** — `base_foreground` on `base_background` ≥ **4.5:1** (light scheme).
- [ ] **Body text (dark)** — `base_foreground_dark` on `base_background_dark` ≥ **4.5:1**.
- [ ] **Accent as link/button text** — accent against the surface it sits on is distinguishable and, where it carries text, meets AA (≥ 4.5:1 for normal text, ≥ 3:1 for large/UI).
- [ ] **Accent (dark)** — `accent_color_dark` on `base_background_dark` clears the same bar.
- [ ] **Muted text** — if `muted_color` is used for readable secondary text, it also needs ≥ 4.5:1; if it is only borders/decoration, ≥ 3:1 is fine.

If a brand's literal color fails, keep the hue and shift lightness until it passes, then tell the user the exact shade you moved to and why.

## Industry and audience fit

Use the segment to break ties between otherwise-valid palettes — never to override a real signal:

| Segment | Tendency | Notes |
|---|---|---|
| Fintech / enterprise | Restrained blue-greys, navy, low saturation | Trust and calm over flash; muted companion does a lot of work |
| Dev-tools / infra | High contrast, often dark-first | Engineers default to dark themes — make dark mode first-class; consider `default_theme: "dark"` or `"system"` |
| Consumer / creator | Warmer, friendlier, a touch more saturated | Personality is allowed; still pass contrast |
| Healthcare / docs-heavy | Soft, high-legibility, generous neutrals | Readability beats brand expression |

Font follows the same logic: geometric/grotesque sans (e.g. Inter, Geist) for product/dev surfaces, humanist sans for consumer warmth, a serif only when the brand already signals editorial. Propose, don't impose — and only when the user wants the font changed.

## The dynamic question pattern

Build the question from the derived signals, and always present all three escape hatches. Example for accent color, where the site's `theme-color` was `#1E40AF` and the logo is in the same blue:

```
I derived your brand from real signals:
  • Source site theme-color: #1E40AF (strongest signal)
  • Logo dominant color: #2547C0 (same blue family)
  • Workspace currently has no accent set

Here are two contrast-checked palettes built from that blue. Pick one,
type your own, or send a reference and I'll derive from it.

(a) PICK a derived palette
    1) "Brand blue"  — accent #1E40AF / dark #3B82F6 · muted #64748B / dark #475569
                       fg #111827 on bg #FFFFFF (7.0:1 ✓) · dark fg #E5E7EB on #0B0D10 (12.6:1 ✓)
    2) "Calm slate"  — accent #2547C0 / dark #5B7CFA · muted #6B7280 / dark #4B5563
                       fg #111827 on bg #FAFAFA (6.8:1 ✓) · dark fg #ECECEC on #141414 (12.1:1 ✓)

(b) TYPE YOUR OWN
    Give me a hex for the accent (e.g. #0F766E) and I'll build the full light+dark
    palette around it and check contrast before applying.

(c) SEND A REFERENCE
    Paste a website URL or drop a screenshot whose look you want, and I'll derive
    the theme-color / dominant colors from it and propose a palette.

Nothing is applied until you choose.
```

Reuse this shape for font and theme questions too: derive what you can, show 2–3 concrete options with their evidence, offer type-your-own, and offer send-a-reference. Apply only the user's pick.

## Acceptance Criteria

- [ ] No branding value is written without explicit user confirmation — `update_branding` is never called speculatively.
- [ ] Every proposed value traces to a derived signal (site theme-color, logo/icon dominant color, existing workspace branding, or README) or to the user's own input — nothing invented.
- [ ] Contrast is checked: the chosen palette passes WCAG 2.1 AA (body text ≥ 4.5:1) in both light and dark, with ratios reported.
- [ ] The proposed palette covers light **and** dark (accent, muted, foreground, background — each with its `_dark` twin).
- [ ] The branding question offered all three choices: pick a derived palette / type your own / send a reference.
- [ ] Existing human-set branding was surfaced and respected, not overwritten without being asked.
- [ ] Final report lists each written field, its value, its source signal, the WCAG ratios, and any missing signal.

## Related Skills

- `docs-create` — full create pipeline; this skill is the branding step done right
- `docs-style-tone` — brand voice in prose, the verbal counterpart to visual branding
- `docs-analyze` — audit orchestrator; run after branding to check the whole site
- `docs-setup-workspace` — configures the rest of the workspace (UI, AI, SEO) around the brand
