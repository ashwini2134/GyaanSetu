# Contributing to Fraylon Academy LMS

Three people work on this repo: Yuvaraj (lead) and two interns (Ashwini, Priyanka). This document is the agreement on how we work together so we don't step on each other.

## The rules (short version)

1. **Never push directly to `main`.** Everything goes through a Pull Request.
2. **Branch off `main` for every change.** Use the naming convention below.
3. **One PR needs one reviewer** before merge. CODEOWNERS auto-assigns the right person.
4. **Never commit build artifacts.** `docs/`, `frontend/dist/`, `frontend/docs/`, `.vite/` are all gitignored. The CI builds them; you don't.
5. **Keep PRs small.** A PR that changes 50 files is two PRs that should have been opened separately.

## Branch naming

| Prefix      | Use for                          | Example                            |
|-------------|----------------------------------|------------------------------------|
| `feat/`     | New feature or page              | `feat/quiz-page-keyboard-shortcuts`|
| `fix/`      | Bug fix                          | `fix/sidebar-overflow-mobile`      |
| `content/`  | Course notes, problems, quizzes  | `content/cs50ai-lecture-3`          |
| `chore/`    | Tooling, deps, CI, docs          | `chore/upgrade-vite-7`             |
| `docs/`     | README / CONTRIBUTING / comments | `docs/add-mentor-architecture`     |

## Day-to-day workflow

```bash
# Start a new piece of work
git checkout main
git pull origin main
git checkout -b content/cs50ai-lecture-3

# ... do your work, commit as you go ...

git push -u origin content/cs50ai-lecture-3

# Open the PR via the GitHub web UI, fill out the template, request a review
```

After the PR is merged, delete your branch (GitHub offers a button — use it).

## What needs to land before this workflow is enforced

These are one-time setup steps **Yuvaraj** must do in the GitHub UI after this PR merges:

- [ ] Settings → Branches → add rule for `main`:
  - [ ] Require a pull request before merging
  - [ ] Require approvals: 1
  - [ ] Require review from Code Owners
  - [ ] Do not allow bypassing the above settings
  - [ ] Restrict pushes that create matching branches
- [ ] Settings → General → enable "Automatically delete head branches" after PR merge
- [ ] Verify Actions has `contents: write` permission so the deploy workflow can push to `gh-pages`

Until branch protection is enabled, the rules above are honour-system — please follow them anyway.

## Repo layout

- `frontend/` — React + Vite app. The whole UI lives here.
- `frontend/public/data/` — course content. JSON manifests + Markdown notes + per-problem folders. **This is what content PRs change.**
- `content/` — legacy duplicate of `frontend/public/data/`. Don't add new content here; use `frontend/public/data/`. (We'll delete `content/` later.)
- `.github/workflows/deploy.yml` — builds the frontend and publishes to the `gh-pages` branch on every push to `main`.

## Adding course content (the most common PR)

To add a problem to CS50 AI lecture 3:

1. `git checkout -b content/cs50ai-lecture-3-problems`
2. Create `frontend/public/data/cs50ai/lecture_3/problems.json` (look at `lecture_2/problems.json` as a template).
3. If the lecture has notes, add `frontend/public/data/cs50ai/lecture_3/notes.md`.
4. Make sure `frontend/public/data/cs50ai/lectures.json` lists lecture 3 (it does — check).
5. `npm install && npm run dev` in `frontend/`, open the lecture in the browser, verify it loads.
6. Commit, push, open PR. Tag `@7227Yuvaraj` and the content owner from CODEOWNERS.

## Style

- Don't add files just to scaffold. If you're not using a component, don't commit it.
- Don't commit `node_modules/`, lockfiles for tools we don't use, or auto-generated build output.
- Don't reformat unrelated code in a PR. Reformat-only PRs are fine; mixing is not.

## Testing

We use [Vitest](https://vitest.dev/) for our testing framework. Tests are co-located with the files they test (e.g. `api.test.ts` for `api.ts`).
To run the tests, navigate to the `frontend` folder and run:
```bash
npm run test
```
All new utility functions or features should have accompanying unit tests.

## Mentor Architecture

The AI Mentor feature is currently implemented entirely on the frontend via a local mock in `api.ts` (the `chat` method).
- **Current Behavior:** It detects common Python mistakes using simple pattern matching on `_studentCode` (e.g. checking for missing colons or explicit boolean comparison). If no specific mistake is caught, it responds with a randomly selected Socratic hint.
- **Future Integration:** To integrate a real LLM (like Gemini or OpenAI):
  1. Replace the local `chat` method logic with a `fetch` call to a backend endpoint.
  2. Send the `problemId`, the user's `message`, their `_studentCode`, and the `existing` chat history as context in the prompt.
  3. Ensure the LLM system prompt enforces a Socratic teaching style, just like the current hardcoded hints do.

## When in doubt

Ask in the team chat before opening the PR. Cheaper than a contentious review.
