# Applying the fix

Phases 1–4 changed nothing. This is the only crossing point, and the user owns it.

## Ask where the change lands

If the user has not already said, ask — once, with these options, before writing anything:

| Route | What happens | When it fits |
|---|---|---|
| **Pull request** | Create a branch, make the edits, open a PR whose description carries the finding, the evidence and the expected effect | The docs live in a reviewed repository. Mandatory for anything touching prices, limits, or claims about other companies |
| **Approve in chat** | Show the before and after per change; apply only what is approved | A handful of changes, a person present, no review process worth the ceremony |
| **Direct update** | Write straight to the source | The user explicitly asked, the changes are mechanical, and they are reversible |

Do not guess. A direct write into a repository somebody reviews is not a small mistake, and a pull request nobody wanted adds a week of latency to a one-line fix.

If the answer is a pull request, one PR per coherent group of findings, not one per line. The description says which number is expected to move and by when, so the next run can check it.

Some findings never take the direct route regardless of what the user picked: a wrong price, a claim about a partner or a competitor, or a deprecation notice. Those are proposals for a human even when everything else is being applied automatically. Say so rather than silently making an exception.

## Who writes the words

This skill decides **which** pages change and **why**. `docs-manage` decides **what they say** — page type, structure, register, retrieval shape, conversion pattern. Load it and write to its rules rather than improvising, and rather than restating them here.

## Rules for the edit itself

- **Preserve meaning and preserve URLs.** A rewrite that changes what a page is about forfeits the ranking it was supposed to protect. If a title change implies the slug should change, flag the redirect requirement rather than silently breaking links.
- **Never create a page here.** A gap goes to `docs-create`, with the evidence and a draft outline attached.
- **Never rewrite a body when the finding was about a title.** If the body is also wrong, that is a separate, larger and more expensive finding — note it and move on. Mixing the two destroys the one thing that made the title fix worth doing: it was cheap.
- **One recommendation per page per run.** If a page needs a title rewrite, a restructure and a merge, ship the title and re-measure. Bundled changes make the next run unable to say which one worked.
- **Ship the replacement verbatim.** A proposed title, a proposed description, and the opening sentence — paste-ready. Never "improve the title" or "consider something like".
- **Never edit a price, and never rewrite a claim about another company.** Propose the corrected sentence; a human decides what to assert.
- **Deprecated content gets a banner and a migration path, never deletion.**
- **A merge or split decision belongs to a human.** Two pages cannibalising one query get flagged, not merged.

## Record the baseline

Before the change lands, write down for each affected page: the numbers today, the window they came from, the date, and the one number you expect to move with a horizon. Search effects take weeks to appear; behavioural effects need a full window. Without a written baseline the next run cannot tell a real improvement from a seasonal one, and the loop this skill exists to close stays open.

## Then offer the automation

A finding you have now made twice is a monitor waiting to be created. When the same class of problem recurs — a price drifting after every pricing change, translations falling behind, a page going stale between releases — say so once at the end and offer `docs-automate`. Do not set anything up mid-run.
