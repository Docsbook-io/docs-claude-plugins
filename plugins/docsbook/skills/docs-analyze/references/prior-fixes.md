# Has this ever worked? — closing the loop

Most documentation analysis runs in one direction: find something wrong, recommend a change, stop. Nothing goes back afterwards to ask whether the change helped, so the same recommendation gets made twice, with the same confidence, on the same page, and nobody is any wiser the second time.

That open loop has a specific cost. Teams keep making the kind of edit that feels productive — splitting long pages, adding "next steps" blocks, rewriting intros — with no idea which of those ever moved anything. And a change that made things *worse* is indistinguishable from one that did nothing, because both look like "we shipped it and moved on".

## When this phase is worth the most

- **Before repeating a kind of change.** You are about to restructure six more pages the way you restructured one last month. Check the first one first.
- **After acting on any recommendation.** Any analysis can tell you a page has a problem. Only this tells you whether your fix worked.
- **In a retro on a docs push.** Which of the twelve commits mattered is not knowable from the diff.
- **When a metric moved and a docs change is the suspect.** Confirm or clear it rather than assuming.
- **Not** for a change that shipped in the last day or two. There is no "after" yet, and reading one that has barely started filling is how a random Tuesday becomes a strategy.

## The rules that make the answer mean anything

- **A before-after difference is not an effect.** Docs traffic moves for reasons that have nothing to do with you: a release, a launch, a link from somewhere big, a holiday, a ranking change. Any read that looks only at the edited pages confidently credits your edit with all of it.
- **The pages you did not touch are the control, and they are the point.** If dead ends fell on the edited pages *and fell just as much everywhere else*, your edit is not the reason.
- **Volume and quality are different questions.** More visits to a page you rewrote might mean the rewrite drew people in — or that it now ranks for something it cannot answer. The question here is whether the visits went *well*; traffic is context for it, not the answer.
- **Small numbers cannot be rescued by a percentage.** A page that went from 9 visits to 12 has no story in it.
- **Some changes are not measurable and never will be.** A change older than the data window has no reconstructable "before". An unmeasurable change reported as a neutral one quietly becomes evidence that the change did nothing.
- **One change is weak evidence; a pattern across similar changes is strong.** Prefer answering "does this KIND of edit work here" over "did this one commit work", whenever there is more than one instance.

## Method

1. **Pick the change and state the prediction first.** Write down what you expected it to do — "splitting this page should cut the number of readers who give up on it" — *before* looking at any number. A hypothesis stated afterwards fits whatever the data did, and it always fits.
2. **Establish what was measurable at all.** The change must be old enough to have an after-window and recent enough that its before-window is still visible. If either side is missing, stop and report that: a verdict built on half a comparison gets quoted without its caveat.
3. **Compare edited pages against untouched pages, in both windows.** The same numbers for both groups — the outcome mix of visits, and how long readers took to reach something of value. Anything less is not a comparison.
4. **Subtract the site trend explicitly.** The number you report is not "dead ends fell 8 points". It is "dead ends fell 8 points on the edited pages while falling 7 everywhere else, so about 1 point is attributable, and that is inside the noise". Do the arithmetic in the report so a reader can disagree with it.
5. **Check whether the edited page was read at all.** A page nobody visited in either window cannot show an effect no matter how good the edit was. That is a finding of its own — you fixed something no reader reaches — and it points at navigation and search, not at the page.

## Four verdicts, and no others

- **It worked.** The edited pages improved meaningfully more than the control. Say what to repeat, and on which pages next.
- **It did nothing distinguishable.** Whatever moved, moved everywhere. This is the most common answer and the most useful — it is the one that stops a team investing in a ritual.
- **It made things worse.** Say so directly, and read the page again before repeating that kind of change.
- **Cannot tell.** Sample too thin, window incomplete, or the data does not reach back far enough. A real verdict, not a failure.

## What this catches

| Pattern | What it looks like | Why it matters |
|---|---|---|
| **The ritual that does nothing** | A kind of edit the team keeps making, whose pages track the site average every time | Weeks of work with no effect, repeated because nobody checked |
| **The regression nobody noticed** | Dead ends rose on the edited pages while the rest of the site held steady | A "cleanup" that removed something readers relied on |
| **The false win** | Metrics improved right after a change — and improved just as much on every untouched page | Credited to the edit, becomes the template for the next ten, none of which do anything |
| **The invisible fix** | An edited page with almost no visits in either window | The content was never the bottleneck; discovery was |
| **The unmeasurable claim** | A change too old for a before-window, cited in a retro as a success | An unfalsifiable claim hardens into team folklore |

## When there is no prior change to compare

Say so, and **record a baseline now** — the pages you are about to change, the numbers on them today, the date, and the prediction. That baseline is what makes the next run able to judge this one, and writing it costs a minute.
