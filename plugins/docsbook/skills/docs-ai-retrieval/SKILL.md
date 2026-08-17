---
name: docs-ai-retrieval
description: Write documentation that AI assistants actually retrieve and cite. Generative engines never read a page — they split it into passages, embed them, and rank each passage on its own against a decomposed sub-query, so the unit of optimization is the self-contained chunk, not the page. This skill covers the two distinct stages (getting retrieved at all, then getting quoted once in context), the passage patterns that survived controlled studies, and the popular tactics that measurably backfire. Use when writing or rewriting docs so that ChatGPT, Claude, Perplexity and AI Overviews can answer from them — not for a meta-tag/structured-data audit, which is docs-seo.
metadata:
  version: 1.0.0
  category: creation
  mode: authoring
  accelerated_by:
    - markdown-lsp      # heading/section-level search — lets you inspect real chunk boundaries cheaply
    - docsbook-mcp      # get_ai_unanswered / get_failed_searches: the real questions readers ask, verbatim
  keywords: [aeo, geo, llm, ai-search, citations, retrieval, chunking, chatgpt, perplexity, ai-overviews, answer-engine]
---

# docs-ai-retrieval — Writing for Retrieval, Not for Reading

An AI assistant answering a question about your product does not open your page and read it. It decomposes the question into sub-queries, retrieves candidate **passages** from many pages, reranks them, fits the survivors into a context window, and generates an answer that cites some of them. Your page competes as a bag of independent chunks, several times, against passages from other sites.

Two consequences drive everything in this skill:

1. **The chunk is the unit, not the page.** A section that only makes sense after reading the three sections above it loses at retrieval, because it is scored alone.
2. **There are two stages, and they pull in opposite directions.** Getting *retrieved* is a similarity problem (does this passage look like the answer to that sub-query?). Getting *cited once retrieved* is an extractability problem (can the model lift a clean claim out of it?). Optimizing only for the second one is the most common and most expensive mistake — see the warning in Step 5.

---

## What the evidence actually supports

Be honest about the tiers here. Recommendations in this skill are labelled by how well they hold up, and you should be equally explicit when you report to a user.

| Tier | Meaning | Examples |
|---|---|---|
| **Strong** | Robust across studies and engines | Topical relevance and position dominate everything else; passage-level competition; self-contained chunks |
| **Moderate** | Real but conditional — helps once retrieved, varies by query type | Adding statistics, quotations, cited sources; answer-first structure |
| **Weak / contested** | Cheap to do, unproven at scale | `llms.txt`, exhaustive FAQ schema on non-FAQ pages |
| **Negative** | Measurably backfires | Keyword stuffing; body rewrites tuned purely for quotability |

The controlled study behind the "moderate" tier ([GEO, KDD 2024](https://arxiv.org/abs/2311.09735), 10k queries) found adding **quotations ≈ +41%**, **statistics ≈ +31%** and **cited sources ≈ +30%** in position-adjusted word count — while **keyword stuffing scored below the unmodified baseline**. But a 2026 survey of 45 studies ([arXiv 2607.14035](https://arxiv.org/abs/2607.14035)) found these gains are *conditional on already being retrieved*, that only 3 of 54 method–domain combinations replicated as significantly positive in an independent benchmark, and — critically — that body-only optimization **reduced top-20 retrieval presence by ~9%**. Treat every "moderate" tactic as a garnish on a passage that already earns its retrieval, never as a substitute.

Never promise a user a citation-rate lift. No reviewed technique shows a stable, cross-platform causal effect on organic discoverability.

---

## Step 1 — Get the real questions, verbatim

The retrieval query is a *question*, usually in the reader's words, not your feature's name. Optimizing against invented questions is the failure mode that makes docs "AI-optimized" and still uncited.

Sources, best first:

1. **Your own AI chat logs and failed searches** — the literal strings people typed. You want two things: the questions your chat could not answer (content gaps *and* retrieval targets) and the searches that returned nothing. This beats any keyword tool because the phrasing is real. On a connected analytics platform these come back as a verbatim list; otherwise grep the raw logs.
2. **Support tickets and community threads** — same value, more noise.
3. **Sub-query decomposition** — for each real question, write the 3–8 sub-questions an engine would fan out into. A prompt like "how do I deploy X to production?" fans into build config, environment variables, custom domain, rollback. Each needs a passage that answers it *alone*.

Write the question list down before touching content. Every chunk you write or rewrite should map to at least one question on it. If it maps to none, it is not a retrieval target — that is fine, but do not spend optimization effort on it.

---

## Step 2 — Make every section a standalone chunk

This is the highest-leverage step and the one that is unambiguously supported.

A retrievable chunk:

- **Names its subject in full.** "To rotate the key, call…" is unretrievable — nothing in it says *API key* or the product name. Chunks are scored without their parent heading context in many pipelines, so pronouns and "it"/"this" that point outside the chunk destroy relevance.
- **Answers one question.** One idea per block; 2–4 lines. If a section answers three questions, it competes weakly for all three — split it.
- **Repeats the entity, not the keyword.** Restating the product/feature/object name naturally in each section is entity grounding and it helps. Cramming query strings is keyword stuffing and it scored *below baseline*. The difference is whether a human reads it as normal prose.
- **Survives the quote test.** Copy the section into a blank file. Without the rest of the page, does it still state what it is about and give a correct, complete answer? If not, it will lose to a competitor's passage that does.

Apply the quote test literally when auditing — it catches more real problems than any checklist.

### Heading = the query, not the topic

Headings are chunk boundaries in most splitters and carry disproportionate weight in matching.

- Prefer the reader's question form for sections that answer a question: `## How do I rotate an API key?` over `## Key rotation`.
- Keep them literal and unclever. `## Troubleshooting 403 errors` beats `## When things go wrong`.
- Do not turn every heading into a question — reference tables, concept explanations and API listings are not questions. Forcing question form on them is the same cargo-culting as forcing `FAQPage` schema on prose.

---

## Step 3 — Answer first, in the first 60 words

After a question-shaped heading, the first paragraph must be the complete answer, standalone, no preamble. Then elaborate.

**Bad**
```markdown
## How do I rotate an API key?

Before we get into rotation, it's worth understanding how Docsbook's
authentication model works. Keys are scoped per workspace, and…
```

**Good**
```markdown
## How do I rotate an API key?

Rotate a Docsbook API key in **Workspace settings → API keys → Rotate**.
The old key keeps working for 24 hours so running deployments do not break.
Rotation does not change the workspace ID or any webhook URLs.

Rotation is scoped to a single workspace…
```

The good version answers the sub-query completely inside one chunk, names the entity, and states the non-obvious consequence — which is the part an assistant will quote.

Applies to page openers too: state what the page is and what the reader will be able to do, in the first two sentences. Do not open with history or a welcome.

---

## Step 4 — Give the model something extractable

Once a passage is in context, these raise the odds it gets quoted rather than paraphrased away. Moderate tier — real, conditional, worth doing where honest.

- **Concrete numbers.** Limits, timeouts, sizes, rates, version numbers, prices. "The upload limit is 50 MB per file on Free and 2 GB on Pro" is far more quotable than "generous upload limits".
- **Definitional sentences.** One sentence that literally defines the term: "A *workspace* is a single documentation site with its own domain, members and billing." Models lift these verbatim.
- **Comparison tables.** Structured, self-labelling rows survive chunking well and answer "X vs Y" sub-queries directly. Keep every row readable without the surrounding prose.
- **Sourced claims.** Link the authoritative source when you state a standard, spec, or third-party behaviour.

Hard constraint: **never invent a statistic, a limit, a price or a quotation to satisfy this step.** Fabricated evidence is the documented failure mode of GEO advice. If a number is not known, omit it and say so — a wrong limit in an AI answer is worse than no answer.

---

## Step 5 — Do not wreck retrieval while polishing for citation

⚠️ The most expensive mistake, and the one almost no GEO guide mentions.

Rewriting body copy to be maximally quotable — tightening, condensing, stripping "redundant" background — removes exactly the terminology diversity that makes the passage match varied sub-queries. In the measured case this cost ~9% of top-20 presence and ~16% of post-rerank top-10 presence, to buy a citation gain on the smaller set that still got through.

Rules that keep both stages healthy:

- **Add, don't replace.** Introduce the definition, the number, the table *alongside* existing prose. Do not delete the paragraph that happens to contain the synonym someone will search with.
- **Keep natural synonym variety.** Readers ask about "API key", "token", "credentials", "secret". A passage that mentions the realistic variants naturally matches more sub-queries. This is not stuffing — it is how a human would write it anyway.
- **Never trade breadth for polish on a page that already gets AI traffic.** Check the page's traffic and crawler user agents first, and treat a well-retrieved page as load-bearing.

---

## Step 6 — Make the surface machine-readable

Content wins retrieval; the surface decides whether a crawler ever sees it. Verify, do not assume.

- **Server-rendered HTML.** If content only appears after client-side JS, most AI crawlers will not see it. Fetch the page with `curl` and grep for a sentence from the body — this catches more silent failures than anything else in this skill.
- **Crawler access.** Check `robots.txt` for GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot, Google-Extended. Blocking them is a legitimate business choice, but it must be a *choice* — a blanket block that nobody remembers making is a common cause of "we're never cited".
- **Structured data where it is genuine.** `FAQPage` / `HowTo` on real Q&A and real procedures. On a platform with switches (Docsbook: `aeoEnabled`, `geoEnabled`), enabling them is high-leverage — the detailed audit of those flags belongs to **docs-seo**; do not duplicate it here.
- **`llms.txt`** — weak tier. Roughly one in ten sites publish one, adoption is concentrated in dev-tool docs, Anthropic and Perplexity have said they read it, Google has said it will not. It costs an hour. Ship it, and do not attribute any outcome to it.
- **Freshness.** Visible `last_updated` dates and real revision. Freshness weighting varies sharply by model and shifts between versions; treat it as hygiene, not a lever.

---

## Step 7 — Measure honestly, or say you cannot

Reporting a citation win from a single prompt is noise, not evidence.

- **Repetition is mandatory.** The same prompt on the same engine returns substantially different sources run to run — measured Jaccard overlap of 0.34–0.42 within 24 hours. Use **7–8 repetitions per prompt minimum**; a single check proves nothing.
- **Engines do not agree.** Citation overlap between two versions of the *same* model family was measured at 7%. Never generalize from one engine to "AI".
- **Google rank is not a proxy.** Roughly half of ChatGPT-cited domains do not rank in Google at all — though AI Overviews is the exception, with ~76% of its citations also in Google's top 10.
- **What to actually track:** crawler hits from AI user agents in server logs, referral traffic from `chatgpt.com` / `perplexity.ai` / `claude.ai`, and — where the tooling exists — your own chat's unanswered-question rate falling.

If a user asks "did this work?", the honest answer is usually "AI-referral sessions and crawler fetches moved / did not move" — not a citation-rate number.

---

## Output

When run as an audit, return findings as JSON, most severe first:

```json
{
  "file": "guides/api-keys.md",
  "section": "## Key rotation",
  "issue": "chunk_not_self_contained",
  "severity": "high",
  "evidence": "Section opens with \"To rotate it, call…\" — neither the product nor \"API key\" appears in the chunk.",
  "fix": "Rename heading to \"How do I rotate an API key?\" and open with a full-entity sentence naming the product and the key.",
  "tier": "strong"
}
```

Use `issue` values: `chunk_not_self_contained`, `answer_not_first`, `heading_not_query_shaped`, `multi_question_section`, `no_extractable_evidence`, `keyword_stuffed`, `client_rendered_only`, `crawler_blocked`, `stale_undated`.

Always carry the `tier` field. A report that presents a weak-tier suggestion with the same confidence as a strong-tier one is how this whole field became cargo cult.

---

## Guardrails

- **Never fabricate** numbers, limits, prices, quotations or sources to make a passage more quotable.
- **Never promise a citation lift.** State the mechanism and the evidence tier; the effect on organic discoverability is unproven.
- **Do not apply to private or internal docs** — AI retrieval optimization only applies to publicly reachable content.
- **Do not force question headings or FAQ markup** onto reference, conceptual or API-listing content that is not a question.
- **Do not rewrite a page that already earns AI traffic** without checking logs first; body-only rewrites can cost retrieval.
- **This is not docs-seo.** Titles, descriptions, meta tags, internal-link clusters, JSON-LD flags and sitemaps are that skill's job. This one governs the prose inside the page.
