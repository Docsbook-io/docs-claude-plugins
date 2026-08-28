# Writing for retrieval, not for reading

An assistant answering a question about your product does not open your page and read it. It decomposes the question into sub-queries, retrieves candidate **passages** from many pages, reranks them, fits the survivors into a context window, and generates an answer citing some of them. Your page competes as a bag of independent chunks, several times over, against passages from other sites.

Two consequences drive everything here:

1. **The chunk is the unit, not the page.** A section that only makes sense after the three above it loses at retrieval, because it is scored alone.
2. **There are two stages and they pull in opposite directions.** Getting *retrieved* is a similarity problem: does this passage look like the answer to that sub-query? Getting *cited once retrieved* is an extractability problem: can the model lift a clean claim out of it? Optimising only for the second is the most common and most expensive mistake — see step 5.

## What the evidence actually supports

Be honest about tiers, and be equally explicit when reporting to a user.

| Tier | Meaning | Examples |
|---|---|---|
| **Strong** | Robust across studies and engines | Topical relevance and position dominate everything else; passage-level competition; self-contained chunks |
| **Moderate** | Real but conditional — helps once retrieved, varies by query type | Adding statistics, quotations, cited sources; answer-first structure |
| **Weak / contested** | Cheap to do, unproven at scale | A machine-readable index file at the site root; exhaustive FAQ markup on non-FAQ pages |
| **Negative** | Measurably backfires | Keyword stuffing; body rewrites tuned purely for quotability |

The controlled study behind the moderate tier ([GEO, KDD 2024](https://arxiv.org/abs/2311.09735), 10k queries) found adding **quotations ≈ +41%**, **statistics ≈ +31%** and **cited sources ≈ +30%** in position-adjusted word count — while **keyword stuffing scored below the unmodified baseline**. A 2026 survey of 45 studies ([arXiv 2607.14035](https://arxiv.org/abs/2607.14035)) found these gains are conditional on already being retrieved, that only 3 of 54 method–domain combinations replicated as significantly positive on an independent benchmark, and — critically — that body-only optimisation **reduced top-20 retrieval presence by about 9%**.

Treat every moderate-tier tactic as a garnish on a passage that already earns its retrieval, never as a substitute. **Never promise a citation-rate lift.** No reviewed technique shows a stable, cross-platform causal effect on organic discoverability.

## 1. Get the real questions, verbatim

The retrieval query is a *question*, usually in the reader's words, not your feature's name. Optimising against invented questions is what makes docs "AI-optimised" and still uncited.

Sources, best first:

1. **The site's own assistant logs and failed searches** — the literal strings people typed. Two things matter: the questions the assistant could not answer, and the searches that returned nothing. This beats any keyword tool because the phrasing is real.
2. **Support tickets and community threads** — the same value, more noise.
3. **Sub-query decomposition** — for each real question, write the 3–8 sub-questions an engine would fan out into. "How do I deploy X to production?" fans into build configuration, environment variables, custom domain, rollback. Each needs a passage that answers it *alone*.

Write the list down before touching content. Every chunk you write should map to at least one question on it. Mapping to none is fine — it just is not a retrieval target, so do not spend optimisation effort there.

## 2. Make every section a standalone chunk

The highest-leverage step, and the one that is unambiguously supported.

A retrievable chunk:

- **Names its subject in full.** Chunks are scored without their parent heading in many pipelines, so "it" and "this" pointing outside the chunk destroy relevance.
- **Answers one question.** One idea per block, 2–4 lines.
- **Repeats the entity, not the keyword.** Restating the product or feature name naturally in each section is entity grounding and it helps. Cramming query strings is stuffing and it scored *below* baseline. The difference is whether a human reads it as normal prose.
- **Survives the quote test.** Copy the section into a blank file. Without the rest of the page, does it still state what it is about and give a correct, complete answer?

Apply the quote test literally. It catches more real problems than any checklist.

### The heading is the query, not the topic

Headings are chunk boundaries in most splitters and carry disproportionate weight in matching.

- Prefer the reader's question form where the section answers a question: `## How do I rotate an API key?` beats `## Key rotation`.
- Keep them literal and unclever: `## Troubleshooting 403 errors` beats `## When things go wrong`.
- **Do not turn every heading into a question.** Reference tables, concept explanations and API listings are not questions. Forcing question form on them is the same cargo cult as forcing FAQ markup onto prose.

## 3. Answer first, in the first 60 words

After a question-shaped heading, the first paragraph is the complete answer, standalone, no preamble. Then elaborate.

**Bad**

```markdown
## How do I rotate an API key?

Before we get into rotation, it's worth understanding how the authentication
model works. Keys are scoped per workspace, and…
```

**Good**

```markdown
## How do I rotate an API key?

Rotate an API key in **Workspace settings → API keys → Rotate**. The old key
keeps working for 24 hours, so running deployments do not break. Rotation does
not change the workspace ID or any webhook URLs.

Rotation is scoped to a single workspace…
```

The good version answers the sub-query completely inside one chunk, names the entity, and states the non-obvious consequence — which is the part an assistant will quote.

This applies to page openers too: say what the page is and what the reader will be able to do, in the first two sentences. Never open with history or a welcome.

## 4. Give the model something extractable

Once a passage is in context, these raise the odds it is quoted rather than paraphrased away. Moderate tier — real, conditional, worth doing where honest.

- **Concrete numbers** — limits, timeouts, sizes, rates, versions, prices. "The upload limit is 50 MB per file on the free plan and 2 GB on the paid one" is far more quotable than "generous upload limits".
- **Definitional sentences** — one sentence that literally defines the term. Models lift these verbatim.
- **Comparison tables** — structured, self-labelling rows survive chunking well and answer "X vs Y" sub-queries directly. Every row must be readable without the surrounding prose.
- **Sourced claims** — link the authoritative source when stating a standard, a specification, or third-party behaviour.

Hard constraint: **never invent a statistic, a limit, a price or a quotation to satisfy this step.** Fabricated evidence is the documented failure mode of this whole field. If a number is not known, omit it and say so — a wrong limit in an assistant's answer is worse than no answer.

## 5. Do not wreck retrieval while polishing for citation

The most expensive mistake, and the one almost no guide mentions.

Rewriting body copy to be maximally quotable — tightening, condensing, stripping "redundant" background — removes exactly the terminology diversity that makes a passage match varied sub-queries. In the measured case that cost about 9% of top-20 presence and about 16% of post-rerank top-10 presence, to buy a citation gain on the smaller set that still got through.

- **Add, do not replace.** Introduce the definition, the number, the table *alongside* existing prose. Do not delete the paragraph that happens to contain the synonym someone will search with.
- **Keep natural synonym variety.** Readers ask about "API key", "token", "credentials", "secret". A passage mentioning the realistic variants matches more sub-queries. That is not stuffing — it is how a human would write it anyway.
- **Never trade breadth for polish on a page that already gets assistant traffic.** Check the page's traffic and crawler user agents first, and treat a well-retrieved page as load-bearing.

## 6. Make the surface machine-readable

Content wins retrieval; the surface decides whether a crawler ever sees it. Verify, do not assume.

- **Server-rendered HTML.** If content only appears after client-side JavaScript, most assistant crawlers will not see it. Fetch the page plainly and grep for a sentence from the body — this catches more silent failures than anything else here.
- **Crawler access.** Check `robots.txt` for the assistant crawlers by name. Blocking them is a legitimate business decision, but it must be a *decision* — a blanket block nobody remembers making is a common cause of "we're never cited".
- **Structured data where it is genuine.** Answer markup on real Q&A and real procedures. Where the platform has switches for it, enabling them is high-leverage — but pair the switch with the content it needs (`site-config.md`).
- **A machine-readable index file at the site root** — weak tier. Adoption is concentrated in developer-tool docs; some assistant vendors say they read it, at least one search vendor says it will not. It costs an hour. Ship it, and attribute no outcome to it.
- **Freshness.** Visible update dates and real revision. Freshness weighting varies sharply by model and shifts between versions; treat it as hygiene, not a lever.

## 7. Measure honestly, or say you cannot

Reporting a citation win from a single prompt is noise, not evidence.

- **Repetition is mandatory.** The same prompt on the same engine returns substantially different sources run to run — measured overlap of 0.34–0.42 within 24 hours. Use **7–8 repetitions per prompt minimum**.
- **Engines do not agree.** Citation overlap between two versions of the *same* model family was measured at 7%. Never generalise from one engine to "AI".
- **Search rank is not a proxy.** Roughly half of assistant-cited domains do not rank in the main search engine at all — AI Overviews is the exception, where about 76% of citations also sit in the top 10.
- **What to actually track:** crawler hits from assistant user agents in server logs, referral traffic from assistant domains, and — where the tooling exists — the site's own unanswered-question rate falling.

If asked "did this work?", the honest answer is usually "assistant referrals and crawler fetches moved / did not move" — not a citation-rate number.

## Issue vocabulary

When reporting retrieval findings, use these and always carry the evidence tier: `chunk_not_self_contained`, `answer_not_first`, `heading_not_query_shaped`, `multi_question_section`, `no_extractable_evidence`, `keyword_stuffed`, `client_rendered_only`, `crawler_blocked`, `stale_undated`.

A report presenting a weak-tier suggestion with the same confidence as a strong-tier one is how this field became a cargo cult.
