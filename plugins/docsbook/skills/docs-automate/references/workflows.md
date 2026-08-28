# CI checks and repository hooks

The two places a check can run before a problem reaches a reader: on the developer's machine before a push, and in CI on a pull request. They catch different things and fail in different ways.

| | Pre-push hook | Pull-request check |
|---|---|---|
| Catches | Drift, before it leaves the machine | Everything, including what came from a branch nobody ran the hook on |
| Speed | Must be seconds, or it gets bypassed | Can afford a minute |
| Failure | Warns by default; blocking is opt-in and set in the repo's own config | A red check, in the place review already happens |
| Blind spot | Anyone who has not installed it, and `--no-verify` | Changes that never go through a pull request |

Most teams want the pull-request check first and the hook second.

## The pull-request check

Three checks earn their place, and they are cheap:

1. **Code changed without docs changing.** Not a hard rule — plenty of changes need no documentation — so this is a warning that prompts a sentence in the PR, never a block.
2. **Frontmatter validity on changed markdown.** Required fields present and sized. **Never fail on a missing optional field**, or the check becomes something people learn to skip.
3. **Internal link integrity.** Broken links and dead anchors in the changed files.

Rules for generating it:

- **Trigger on pull requests only**, and run against the **changed files in the diff** — never the base branch, and never the whole tree, or the first run drowns in pre-existing findings and gets disabled.
- **Blocking is a parameter, not a default.** Where the caller has not asked for blocking, the link job continues on error and reports. Only make it fail the build when that was asked for explicitly.
- **Write one file, and touch no other workflow.** Overwriting the file this skill owns is fine; editing a workflow somebody else wrote is not.
- **Report the path, the effective settings, and the reminder that it activates on merge.** A workflow file sitting unmerged on a branch does nothing, and that is a surprisingly common ending.

## The pre-push hook

- **Offer it once**, on the first drift run, and never nag again.
- **Exit fast and silent when nothing relevant changed.** A hook that pauses on every push gets removed within a week.
- **Warn by default.** Blocking a colleague's push at a bad moment costs more trust than the drift costs, and the repository's own configuration is where blocking gets turned on.
- **Never fail silently.** If the dependency the hook needs is unreachable, print one line and let the push through.

## Event handler workflows

A workflow triggered by an external dispatch rather than by a code change. The shape:

- Trigger on the repository-dispatch event type the handler sends.
- For each item in the payload, take one action — file an issue linking to the source file, post a message, open a pull request.
- **One action per distinct thing**, never one per event, or a busy day produces forty issues about the same page.
- Reference every credential as a stored secret; never inline.
- Where the platform's event does not exist yet, wire the workflow against the closest native repository event as a documented fallback, and say clearly which one it is running on.

## Generation rules

- **Never hardcode a credential.** Repository secrets, by name, with the names listed in the report.
- **Never generate a command, URL or version you did not read** from the repository or the diff.
- **Overwrite only the file this skill owns.** Its name should make ownership obvious.
- **Create the directory if it does not exist**, and say where the file landed.
- **List what the user must still do by hand** — store the secret, connect the channel, merge the branch. The automation is not live until those are done, and saying so is the difference between a working setup and a believed one.
