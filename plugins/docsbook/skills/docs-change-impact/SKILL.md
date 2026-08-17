---
name: docs-change-impact
description: Checks whether a documentation change that already shipped actually helped — comparing how visits went on the edited pages against the pages nobody touched, before and after the commit. Answers "did that rewrite work", "was the restructure worth it", "should we do more of this", and closes the loop that every other docs audit leaves open by recommending edits and never looking back. Use before repeating a kind of change you have made before, after acting on an audit's recommendation, and in a retro on a docs push. Reports what the evidence supports; it edits nothing.
metadata:
  version: 1.0.0
  category: observability
  mode: audit
  requires_plan: pro
  measures:
    - dead_end_rate
    - self_serve_resolution_rate
    - time_to_first_value
    - traffic
  metric_dictionary: ../../metrics/metric-dictionary.json
  accelerated_by:
    - docsbook-mcp
  uses_mcp_tools:
    - get_page_diff_impact
    - get_change_history
    - get_metric_timeseries
    - get_doc_outline
  keywords: [change impact, did it work, before and after, retro, measure edit, causality, control group, regression, docs experiment, evidence, post-mortem, rollback]
---

# docs-change-impact

Every other skill in this catalog runs in one direction. It finds something
wrong, recommends a change, and stops. Nothing goes back afterwards to ask
whether the change helped — so the same recommendation can be made twice, with
the same confidence, on the same page, and nobody is any wiser the second time.

That open loop has a specific cost. Teams keep doing the kind of edit that feels
productive — splitting long pages, adding "next steps" blocks, rewriting intros
— with no idea which of those ever moved anything. And a change that made things
*worse* is indistinguishable from one that did nothing, because both look like
"we shipped it and moved on".

This skill closes the loop. It takes a change that already shipped and asks a
narrow, checkable question: **did visits to the pages you edited go better than
visits to the pages you did not?**

**Mode: audit.** It produces a verdict and evidence. It changes no content — the
decision about what to do with the answer is the human's, and the most valuable
finding this skill produces ("that did nothing, stop doing it") is not an edit at
all.

## When to run

- **Before repeating a kind of change.** The highest-value moment. You are about
  to restructure six more pages the way you restructured one last month — check
  what the first one did first.
- **After acting on an audit's recommendation.** Any skill here can tell you a
  page has a dead-end problem. Only this one tells you whether your fix worked.
- **In a retro on a docs push.** Which of the twelve commits actually mattered
  is not knowable from the diff.
- **When a metric moved and a docs change is the suspect.** Confirm or clear it
  rather than assuming.
- **Not** for a change that shipped in the last day or two. There is no "after"
  yet, and reading one that has barely started filling is how a random Tuesday
  becomes a strategy.

## Before you start

- **A before-after difference is not an effect.** Docs traffic moves for reasons
  that have nothing to do with you: a release, a launch, a link from somewhere
  big, a holiday, a ranking change. Any read that looks only at the edited pages
  will confidently credit your edit with all of it.
- **The pages you did not touch are the control, and they are the point.** If
  dead ends fell on the edited pages *and fell just as much everywhere else*,
  your edit is not the reason. The comparison that matters is edited-versus-
  untouched, never before-versus-after alone.
- **Volume and quality are different questions.** More visits to a page you
  rewrote might mean the rewrite drew people in — or that it now ranks for
  something it cannot answer. "Did the visits go WELL" is the question here;
  traffic is context for it, not the answer.
- **Small numbers cannot be rescued by a percentage.** A page that went from 9
  visits to 12 has no story in it. Where the sample is thin, report the raw
  outcome counts and say the question cannot be answered yet.
- **Some changes are not measurable and never will be.** A commit older than the
  visit-data window has no reconstructable "before". Say so plainly — an
  unmeasurable change reported as a neutral one quietly becomes evidence that
  the change did nothing.
- **One commit is weak evidence; a pattern across similar commits is strong.**
  Prefer to answer "does this KIND of edit work here" over "did this one commit
  work", whenever there is more than one instance to look at.

## Workflow

1. **Pick the change, and say what you expected it to do.**
   Start from the shipped commits that touched documentation, and choose the one
   whose effect you actually want to know. Write down the prediction *before*
   looking at any number: "splitting this page should cut dead ends on it". A
   hypothesis stated afterwards fits whatever the data did, and it always fits.

2. **Establish what was measurable at all.**
   Check that the change is old enough to have an after-window and recent enough
   that its before-window is still visible. If either side is missing, stop and
   report that — a verdict built on half a comparison is worse than no verdict,
   because it gets quoted without its caveat.

3. **Compare the edited pages against the untouched ones, both windows.**
   For each side, the outcome mix of visits — how many ended in the reader
   getting what they came for, how many ended in a dead end — plus how long it
   took readers to reach something of value. The same four numbers for both
   groups; anything less is not a comparison.

4. **Subtract the site trend before saying anything.**
   The number you report is not "dead ends fell 8 points". It is "dead ends fell
   8 points on the edited pages while falling 7 everywhere else, so about 1 point
   is attributable and that is inside the noise". Do this arithmetic explicitly
   in the report, so a reader can disagree with it.

5. **Deliver one of four verdicts, and no others.**

   - **It worked.** The edited pages improved meaningfully more than the control.
     Say what to repeat, and on which pages next.
   - **It did nothing distinguishable.** Whatever moved, moved everywhere. This
     is the most common answer and the most useful — it is the one that stops a
     team investing in a ritual.
   - **It made things worse.** The edited pages did worse than the control. Say
     so directly, and recommend reading the page again before repeating that
     kind of change.
   - **Cannot tell.** Sample too thin, window incomplete, or data does not reach
     back far enough. A real verdict, not a failure.

6. **Check whether the edited page was read at all.**
   A page nobody visited in either window cannot show an effect no matter how
   good the edit was. That is a finding in its own right — you fixed something no
   reader reaches — and it points at navigation and search, not at the page.

7. **Report the evidence, not the conclusion alone.**
   Per change: the commit and what it touched, the prediction from step 1, both
   windows for both groups with raw counts beside every rate, the trend-adjusted
   difference, the verdict, and the caveats that apply. A reader who cannot
   re-derive your verdict from your own report has been asked to take it on
   faith.

## What this skill catches

| Pattern | What it looks like | Why it matters |
|---|---|---|
| **The ritual that does nothing** | A kind of edit the team keeps making, whose pages track the site average every time | Weeks of work with no effect, repeated because nobody ever checked |
| **The regression nobody noticed** | Dead ends rose on the edited pages while the rest of the site held steady | A "cleanup" that removed something readers were relying on |
| **The false win** | Metrics improved right after a change — and improved just as much on every untouched page | Credited to the edit, becomes the template for the next ten, none of which do anything |
| **The invisible fix** | An edited page with almost no visits in either window | The content problem was never the bottleneck; discovery was |
| **The unmeasurable claim** | A change too old for a before-window, cited in a retro as a success | An unfalsifiable claim hardens into team folklore |

## Related skills

- **docs-health-triage** ranks what to fix next; this skill checks whether the
  last thing you fixed helped. Run triage to choose the work, this to close it.
- **docs-dead-end-hunter**, **docs-rank-recovery** and **docs-title-rewriter**
  all recommend edits. Any of them is a reason to come back here afterwards.
- **docs-maintenance** and **docs-sync** ask whether content is *correct*. This
  skill asks whether a change to it *worked* — a page can be accurate and still
  fail its readers.
