# The setup interview

Automation that watches the wrong thing is worse than none: it produces noise, the noise trains everyone to ignore the channel, and the next alert — the one that mattered — is ignored with it. The interview costs three minutes and it is the difference.

**Rules for running it:** one question at a time, reacting to each answer before the next. Skip anything the request already answered. Never open with a catalogue of what the platform can do — that turns a diagnosis into shopping.

## The five questions

### 1. What went wrong that made you ask?

The most useful question and the one most often skipped. A concrete incident — "we shipped a rename and the docs said the old name for a month", "a customer quoted a price we changed in March", "our chat kept saying it didn't know about SSO" — names the trigger better than any menu.

If the answer is abstract ("we want better docs hygiene"), push once for the last time it actually hurt. If nothing comes back, that is a real answer too: it means there is no incident to design against, and the honest recommendation is usually a single cheap CI check plus one monitor, not a suite.

### 2. What should happen when it happens again?

These differ by an order of magnitude in trust and in cost. Offer them explicitly:

| Response | What it means | Costs |
|---|---|---|
| **Tell someone** | A message into a channel or an inbox | Cheapest. Does nothing on its own; someone must act |
| **File it** | An issue in the tracker, in the normal triage flow | Survives being ignored for a week. Needs someone to triage |
| **Propose a fix** | A pull request with the change already made | Highest value per incident, needs review, and needs the change to be safely derivable |
| **Fail the check** | A red pull request or a blocked push | The only one that genuinely prevents the problem. Also the only one that can stop a colleague's work at a bad moment |
| **Fix it silently** | Applied with no human in the loop | Reserve for mechanical, reversible changes. Never for prices, claims about other companies, or anything outward-facing |

Most requests that arrive as "block it" actually want "propose a fix". Ask.

### 3. Who acts on it, and where do they already look?

An alert into a channel nobody reads is a channel nobody reads. Find the surface the team already uses — a chat channel, the issue tracker, the pull request itself, an inbox — and put it there. Never create a new surface for an automation, and never route to two surfaces "so it definitely gets seen": duplicate alerts halve the attention each gets.

Also get the **owner**. An alert nobody owns is an alert everybody assumes someone else is handling.

### 4. How often is too often?

Ask before installing, not after the first noisy week:

- **The threshold.** What size of change is worth a message? A five-place ranking drop on one page is noise; the same drop across a section is not.
- **The floor.** Below what volume should it stay quiet regardless? (`monitoring.md` has the defaults.)
- **The cadence.** Immediate, daily digest, or weekly? Most signals here move slowly and a digest beats an interrupt. Reserve immediate for things that are broken right now.
- **Quiet hours and days.** A weekend alert on a metric that moves weekly is pure cost.
- **The stop rule.** How many times can this fire about the same thing before it stops repeating itself?

### 5. What must never happen automatically?

Ask it as its own question rather than inferring it. Name the candidates:

- Pushing to a shared or public remote.
- Opening or merging a pull request.
- Changing anything readers see without review.
- Blocking a push or failing a build.
- Sending anywhere outside the team.
- Touching prices, plans, limits, or claims about other companies.

Whatever comes back is a hard constraint on everything installed in this run, and it goes into the handover so the next person knows.

## Then offer options, not a recommendation

Two or three concrete setups, each with three lines: **what it catches**, **what it costs**, **how it fails**. Never a single take-it-or-leave-it, and never everything at once.

```
Three ways to catch the rename problem. Pick one, or tell me what to change.

(a) Pre-push drift check — warn only
    Catches:  a renamed symbol whose docs page still says the old name, before it ships
    Costs:    a few seconds on every push; occasional false positives you dismiss
    Fails:    silently, if the search index is down — you get a warning line, not a block

(b) Pull-request check
    Catches:  the same drift, plus malformed frontmatter and broken internal links
    Costs:    a CI job per PR; a red check when it finds something
    Fails:    loudly and in the right place, but only for changes that go through a PR

(c) Weekly drift digest into your issue tracker
    Catches:  accumulated drift across the whole repo, including what (a) and (b) missed
    Costs:    one issue a week, which someone has to triage
    Fails:    quietly — a week where nothing is filed looks the same as a week with no drift,
              unless we file an explicit "nothing found" note

Most teams with your shape start with (b) and add (c) after a month.
```

That last line is a recommendation, and it is welcome — after the options, not instead of them.

## When the answer is "don't automate this yet"

Say so. Two cases come up often:

- **It has happened once.** A single incident is not a pattern, and a monitor built for it will mostly report nothing. Note what to watch for, and offer to set it up if it recurs.
- **The underlying thing is broken, not drifting.** Automating a notification about a page that is simply wrong postpones fixing the page. Hand it to `docs-analyze` and offer the monitor afterwards.

Recommending against a setup is a real outcome of this interview, not a failure of it.
