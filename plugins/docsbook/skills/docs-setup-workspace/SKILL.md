---
name: docs-setup-workspace
description: Configure a fresh Docsbook workspace from one command. Wires branding, UI toggles, AI chat, SEO, languages and custom domain via Docsbook MCP — the natural follow-up to /docs-publish. Falls back to printed setup instructions if MCP isn't connected.
metadata:
  version: 2.1.0
  category: publishing
  mode: platform
  requires_docsbook_mcp: true
  requires_plan: free
  uses_mcp_tools:
    - list_workspaces
    - get_workspace
    - create_workspace
    - update_branding
    - update_ui_settings
    - update_navigation
    - update_seo
    - update_geo
    - update_aeo
    - update_languages
    - update_ai_settings
    - update_domain
  keywords: [setup, workspace, branding, configure, docsbook, mcp]
---

# docs-setup-workspace — Configure a Docsbook workspace via MCP

Configuration is not a checklist of flags to flip — it is what turns a published folder into a site that **feels like the product's own documentation**. Approach each setting by its purpose (what it does for an unsold visitor), and apply the *maximum* the connected plan allows. Everything here is available to the connected agent through the Docsbook MCP; reach for the whole arsenal, not just branding.

## Workflow

1. Confirm the platform connection is up. If it fails for non-auth reasons, print the MCP connection command and exit gracefully.
2. Resolve which workspace you are operating on and read its current configuration. Check whether the workspace already exists before creating one — Docsbook auto-indexes repos within seconds of a push.
3. Read branding values from `_branding.json` (or the signals collected during generation) if present. Never fall back to an invented accent color — if no signal exists, skip the color rather than shipping a generic default.
4. Apply settings in priority order, each toward its purpose: **navigation** (Free, always) → **branding** (Free) → **UI affordances** (Free) → **SEO/GEO/AEO/AI/languages** (plan-gated). The Free three alone already lift the site well above a raw README — never stop after just branding.
5. **SEO/GEO/AEO (plan-gated) — content *and* the switch together.** Enable the flags themselves, not just titles/descriptions: the flag is what makes the platform emit rich JSON-LD (and `FAQPage`/`HowTo` for AEO). Enabling AEO on prose with no Q&A/step sections adds nothing — so this pairs with the FAQ/use-case content the generator wrote. If the underlying tool only writes content with no enable toggle, tell the user those need enabling manually. Never assume a flag is already on.
6. **AI chat (plan-gated) — the highest-leverage affordance.** A live "Ask AI" over the docs lets an unsold visitor get an answer instead of hunting through pages — it is the single strongest wow-factor of a great docs site. Configure it, and derive 3 suggested questions from the *actual pages just created* (from H1s / the quick-start / setup pages) — never generic ones like "What is this product?". Skip a field silently only if the tool has no slot for it.
7. Catch each plan-gated failure individually; record it in the result but do not abort the rest of the run.
8. **Verify on the rendered page, not in the config response.** A successful write tells you the store accepted the value — it does not tell you a visitor sees it. If any browsing capability is available in the session, open the public URL (cache-busting query param if the platform offers one) and confirm what you are about to claim: brand colors and logo present, navigation tabs present, and — if you enabled AI chat — **ask it one real question and read the answer**. A settings call that returns 200 while the page renders defaults or the chat refuses to answer is the normal failure mode here, and it is invisible from the config side. With no browsing available, re-read the workspace, compare it against what you sent, and report the site as *unverified* — never imply visual confirmation you did not do. See *Verifying the result* for what each mismatch means.
9. Report which sections were applied, which were plan-gated (and what enabling them would add), which were **verified on the live page**, and any warnings. When you tell a user a feature is on, that claim must come from the rendered page — not from the write that enabled it.

## Guardrails

- Never abort the whole run on a plan-limit (402) error — branding, UI, and navigation still apply on Free.
- **Never stop after branding.** The Free trio (branding + UI affordances + navigation) is the minimum that makes a site feel real — apply all three every run, then reach for the plan-gated ones.
- Set `defaultTheme` to `"system"` if the source had a theme toggle; otherwise pin to the detected scheme.
- Always set navigation (sub-header + social links + back-link to source) even on Free — high-value and always available.
- Enable AEO/GEO/SEO flags only where the content supports them — pair the AEO flag with real FAQ/step content, don't blind-enable on bare prose (invalid schema can be penalized).
- Never overwrite human-set branding already on the workspace — read it first; if an accent is already set (non-null, non-default), skip the color update and say so.
- MCP transport is HTTP (hosted), not stdio — do not confuse it with local MCP servers.
- If the workspace is not yet indexed after creation, retry once after a short wait before reporting failure.

## MCP Tools — reach for the whole arsenal, each toward its purpose

Plan column: **Free** applies on any connected workspace; **PRO+** is plan-gated (apply if allowed, otherwise tell the user what it would add). "Purpose" is the *why for an unsold visitor*, not the mechanics.

| Tool | Plan | Purpose (what it does for the reader) |
|------|------|---------|
| *(resolve the workspace and read its current settings)* | Free | Verify the connection; know the current values so you never overwrite human-set ones |
| `create_workspace` | Free | Create the workspace for `owner/repo` if it does not exist |
| `update_branding` | Free | **Docs read as a continuation of the product**, not a sandbox — accent, logo (≠ favicon), icon, theme from the source. Also carries `cta_url` (see below) |
| `update_branding(cta_url:)` | Free | **The docs have a goal** — the one page readers should end up on (pricing, demo, signup). Read it first; if the owner already set one it is the destination for every CTA you write, and it belongs in the header as a filled button via `update_navigation`. Save one only when the source makes it unambiguous |
| `update_ui_settings` | Free | **Production affordances** — copy-page, feedback widget, breadcrumbs, on-page TOC, search. This is what makes a site feel GitBook/Mintlify-class, not a raw README |
| `update_navigation` | Free | **No dead ends** — sub-header from the top-level folders, social links in the header, back-link to the source site, and the CTA as a header link with `color` set so it renders as a filled button (exactly one such link) |
| `update_seo` | PRO+ | **Indexability** — real titles/descriptions AND the SEO flag on, so pages actually rank |
| `update_geo` | PRO+ | **AI Overviews** — direct-answer-first content signals so Google's AI surface can lift the page |
| `update_aeo` | PRO+ | **Citability in LLM answers** — emits `FAQPage`/`HowTo` from the FAQ/use-case content; the strongest lever for ChatGPT/Perplexity citations |
| `update_ai_settings` | PRO+ | **Live "Ask AI"** over the docs — removes the "go find it yourself" barrier; suggested questions derived from the real pages, never generic |
| `update_languages` | PRO+ | Multilingual reach (enables 4 languages by default — confirm outside auto-mode) |
| `update_domain` | PRO+ | Custom domain — the docs live under the product's own brand |

## Verifying the result

Configuration writes and rendered pages fail independently. Check the page itself, and read each mismatch as a specific diagnosis rather than a reason to retry the same call.

| Symptom on the live page | What it actually means | What to do |
|---|---|---|
| **Every** branded field is default (not one — all of them) | The page is not resolving to the workspace you configured. Usually an identifier-normalization mismatch: the public URL resolves a lowercased owner/repo while the record was stored with the source's original casing | Compare the casing in the URL against the stored record before suspecting cache. Retrying the write cannot fix this |
| One field is stale, the rest applied | CDN cache on a public page | Wait briefly, hard-reload once. Do not re-send the write with different values |
| A field is correct in the stored config but wrong on the page | Render-layer bug, not a config problem | Stop. Report it plainly and move on — blind retries with other values will not help, and shipping a silent mismatch is worse |
| AI chat is enabled but answers "out of budget" / refuses | Enabling the chat and **funding** it are separate concerns. A plan grant can set the plan flag while leaving the usage balance the chat meters against at zero | Check the balance/quota field, not just the enabled flag. Verify with a real question before claiming the chat works |
| A plan-gated call is refused while reporting your plan as sufficient | Contradictory gate (e.g. refuses with `current_plan` already at or above `required_plan`) | Do not retry — it is a platform bug, not a grant failure. Skip the optional field, note it, and continue |
| Chat answers, but the content is generic for the domain | The index is fresh or thin, so the model leans on priors | Do not claim answer accuracy you have not checked. Say the chat is live; do not oversell what it knows |

**Landing tab.** When the source is a whole repository, the default entry point may list root-level files (`TODO`, agent instructions, internal notes) alongside real docs. That reads as careless to the person you are showing it to. Point the entry at the actual documentation folder if the navigation tool supports opening a folder's first page, and say which tab is the clean one.

## Acceptance Criteria

- [ ] Platform connection verified before any workspace mutation
- [ ] Existing workspace detected rather than double-created
- [ ] Branding applied (from file or sensible defaults)
- [ ] UI settings applied with standard preset
- [ ] Navigation section applied on every run regardless of plan
- [ ] SEO/GEO/AEO flags enabled (not just content fields), if the tool supports it
- [ ] AI chat custom questions derived from actual created pages, not invented
- [ ] Plan-gated failures recorded but do not block the result
- [ ] Result lists applied sections, plan-gated sections, and warnings
