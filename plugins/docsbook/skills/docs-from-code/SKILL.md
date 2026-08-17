---
name: docs-from-code
description: Build Markdown docs from a GitHub URL or code repository — README, source tree, exported APIs, examples, comments. Use when the user provides a GitHub URL, repo URL, or says "from GitHub", "from repo", "import repo". Produces docs-output/<name>/ then publishes to GitHub and configures the Docsbook workspace automatically.
metadata:
  version: 1.1.0
  category: creation
  mode: authoring
  requires_docsbook_mcp: false
  keywords: [code, repo, github, source, generate, api, readme, github-url, from-github, github-link, repository-url, repo-url, import-repo]
---

# docs-from-code — Build docs from a code repository

The intelligence lives in **this skill** — read the repo, decide the structure, and write the pages yourself; delegate only publishing and configuration to the connected docs platform. Aim for a foldered, benefit-first site (a developer evaluating the repo should see *why* to use it, not just an API dump), not a flat README split.

## Workflow

1. **Resolve the repo.** Accept `github.com/<owner>/<repo>` or a local path. For GitHub URLs, use `gh repo clone --depth 1` into a temp directory; for local paths, work in place.
   - Take the **project name from the repo name** (the `<repo>` part after `owner/`), not from a guess. Use it for the `docs-output/<name>/` folder and the workspace display name. If you're working from an unnamed local path with no clear name, ask the user rather than inventing one.
2. **Detect the project type.** Inspect root files: `package.json` (Node/TS), `pyproject.toml` / `setup.py` (Python), `go.mod` (Go), `Cargo.toml` (Rust), `*.csproj` (.NET). Pick the strongest signal; on conflict, prefer the one with a `lib` / `src` / `pkg` directory.
3. **Extract the README spine into a benefit-first hero.** Convert the root `README.md` into `docs-output/<name>/README.md` — but lead with a value-prop sentence (what the project does + who it's for + the outcome), not "Installation". Split long top-level sections (`## Installation`, `## Usage`, `## API`) into dedicated pages under `getting-started/`, `guides/`, `api/`. Add a `concepts.md` when the project has a non-trivial mental model, and a `faq.md` (6–10 Q&A synthesized from the README/issues: how it compares, limits, requirements) — these are what make the docs read as a product, and the FAQ feeds the AEO layer.
4. **Enumerate the public API surface.** For Node/TS: read `package.json#exports` and the entry files; for Python: read `__all__` from the top package; for Go: list exported identifiers from each top-level package. Generate one Markdown file per module / package under `api/`.
5. **Pull in examples.** If `examples/`, `samples/`, or `demo/` exists, copy each subfolder's README (or generate one from the file tree) into `guides/<example>.md`.
6. **Read configuration docs.** Look for `.env.example`, `config/*.example.*`, `docker-compose.yml` — generate a `guides/configuration.md` listing variables with descriptions pulled from adjacent comments.
7. **Write `_branding.json`.** Source: `package.json#author`, GitHub repo description, repo avatar from `https://github.com/<owner>.png`. No accent color is detected here — leave `accentColor` absent so the workspace configurator skips the branding step rather than picking a default.
8. **Preview.** Print the folder tree and excerpts from up to 3 representative pages. Ask the user to confirm before publishing: "Does this look right? Type **yes** to publish, or describe what to change."
9. **Publish.** Apply `/docs-publish` logic — if `gh` is authenticated and the user confirmed, push to GitHub. If `gh` is NOT authenticated, stop cleanly with `status: crawl_only`, print the local path and the command `/docs-publish <path>` to run after `gh auth login`. Do not error.
10. **Configure the workspace.** Apply `/docs-setup-workspace` unconditionally after a successful publish — wire branding, UI, navigation, and plan-gated settings via Docsbook MCP. If the MCP transport is unreachable, print the connection command and exit cleanly; the local folder and GitHub URL are already delivered.
11. **Final report.** Print the local path, GitHub URL (if published), and Docsbook site URL (if workspace configured).

## Guardrails

- Never commit secrets — skip `.env`, `*.key`, `*.pem`, anything matching common token patterns (`sk-`, `ghp_`, `AKIA`).
- Cap output at ~50 pages. If the repo has 200 source files, group by package, not by file.
- Active voice, second person, sentence-case headings, no filler words. Tag every code block with the language inferred from the file extension.
- Do not invent API documentation. If a function has no docstring / comment, list its signature only and add `TODO: describe what this does`.
- The project name comes from the repo name, never invented — ask the user when it can't be determined.
- When committing into an existing repo, write pages to the repo **root** (`README.md`, `getting-started/…`, `guides/…`, `api/…`), or into an existing `docs/` folder if the repo already has one. Never wrap a fresh repo's pages in a new top-level `docs/` directory.
- Use relative links between pages (`./guides/configuration.md`, not `https://...`).
- Always run `/docs-setup-workspace` after publish — do not skip unless MCP transport is unreachable.

## Acceptance Criteria

- [ ] Project type identified from root config files
- [ ] README split into structured pages without losing content
- [ ] Public API surface enumerated with one page per module / package
- [ ] Examples and configuration captured as separate pages when sources exist
- [ ] `_branding.json` written without a fabricated accent color
- [ ] No secrets present in the output folder
- [ ] Preview (tree + page excerpts) printed before any publish prompt
- [ ] Published to GitHub (or `crawl_only` status printed with local path and instructions)
- [ ] Docsbook workspace configured (or setup instructions printed if MCP unavailable)

