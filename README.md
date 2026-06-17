# Fraylon Academy — LMS

A fully static, frontend-only Learning Management System built for Fraylon Technologies. Hosts Harvard CS50 Python and CS50 AI courses with an embedded Socratic tutor called **Fraylon Mentor**. No backend or database required — everything runs in the browser.

**Live site:** https://yuvaraj-dudukuru.github.io/LMS/

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite 6 |
| Styling | Tailwind CSS 4 |
| Routing | React Router DOM 7 |
| Markdown | react-markdown + remark-gfm |
| Auth | localStorage (base64 JWT, no server) |
| Data | Static JSON files served from `public/data/` |
| Deployment | GitHub Pages via GitHub Actions |

---

## Features

- **Register / Login** — client-side auth stored in `localStorage`. No server needed; accounts persist in the browser.
- **Dashboard** — lists all available courses with descriptions and links.
- **Course page** — shows all lectures and problems for a course, grouped by week.
- **Lecture page** — renders lecture notes from Markdown (`notes.md`) using `react-markdown` with GitHub Flavored Markdown support.
- **Problem page** — three-panel layout:
  - **Left panel** — problem description, `check50` slug, and expandable common-mistakes list.
  - **Center panel** — in-browser code editor (textarea) with Tab indentation, auto-indent on Enter, and Ctrl+Enter to submit.
  - **Right panel** — Fraylon Mentor chat. The mentor responds with Socratic questions, never direct answers. Chat history is persisted per-problem in `localStorage`.
- **Collapsible sidebar** — shows all courses with expandable week/problem navigation. Highlights the active problem.
- **Fully offline-capable** — once loaded, the app works without any network calls (data is bundled in the static deploy).

---

## Directory Structure

```text
LMS/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions: build + deploy to gh-pages
├── content/                    # Source content (Markdown notes, problem JSON)
│   └── cs50ai/
├── docs/                       # Vite build output — deployed to gh-pages
│   ├── index.html
│   ├── 404.html                # SPA redirect workaround for GitHub Pages
│   ├── assets/                 # Compiled JS + CSS bundles
│   └── data/                   # Static JSON + Markdown served as API
│       ├── courses.json
│       └── cs50ai/
│           ├── lectures.json
│           └── lecture_N/
│               ├── problems.json
│               └── notes.md
└── frontend/                   # React source
    ├── public/                 # Copied verbatim into docs/ on build
    │   ├── 404.html
    │   ├── logo.svg
    │   └── data/               # Source of truth for all course data
    ├── src/
    │   ├── main.tsx            # Entry point; BrowserRouter with basename
    │   ├── App.tsx             # Route definitions
    │   ├── Shell.tsx           # App shell: sticky header + collapsible sidebar
    │   ├── auth.tsx            # AuthContext (localStorage-backed)
    │   ├── api.ts              # Static data layer (fetches JSON, no backend)
    │   └── pages/
    │       ├── Login.tsx
    │       ├── Register.tsx
    │       ├── Dashboard.tsx
    │       ├── CoursePage.tsx
    │       ├── LecturePage.tsx
    │       └── ProblemPage.tsx
    ├── index.html
    ├── vite.config.ts
    └── package.json
```

---

## Local Development

### Prerequisites

- Node.js 18+
- npm

### Run the dev server

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The dev server uses `/` as the base path so no environment variable is needed.

### Build for production

```bash
cd frontend
$env:VITE_BASE_PATH = "/LMS/"   # PowerShell
npm run build
```

Output goes to `docs/`. Commit the `docs/` directory and push to `main` to trigger a deployment.

---

## Data Layer

There is no backend. All course data is served as static files from `docs/data/` (built from `frontend/public/data/`).

### File structure

| File | Description |
|---|---|
| `data/courses.json` | Array of `{ slug, title, description }` — the top-level course list |
| `data/{slug}/lectures.json` | Array of `{ number, label, title }` — lecture manifest for a course |
| `data/{slug}/lecture_N/problems.json` | Array of problem objects for that lecture week |
| `data/{slug}/lecture_N/notes.md` | Lecture notes rendered on the Lecture page |

### Problem object schema

```json
{
  "id": "indoor-voice",
  "title": "Indoor Voice",
  "description": "Problem statement shown in the left panel...",
  "check50_slug": "cs50/problems/2024/python/indoor",
  "difficulty": "Easy",
  "common_mistakes": [
    "Using print(input().lower()) without storing the variable"
  ]
}
```

`difficulty` is optional (`"Easy"`, `"Medium"`, or `"Hard"`). `common_mistakes` is optional; omit the key or pass an empty array to hide the section.

### Adding a new course

1. Add an entry to `frontend/public/data/courses.json`.
2. Create `frontend/public/data/{slug}/lectures.json`.
3. For each lecture, create `frontend/public/data/{slug}/lecture_N/problems.json` and optionally `notes.md`.
4. Run `npm run build` (with `VITE_BASE_PATH=/LMS/`) and commit `docs/`.

### Adding a new problem

Add an object to the relevant `problems.json` file. No rebuild is needed if you edit `docs/data/` directly for a quick test, but always keep `frontend/public/data/` as the source of truth and rebuild before committing.

---

## Deployment

Deployment is fully automated via GitHub Actions.

### How it works

1. Push to `main`.
2. The workflow (`.github/workflows/deploy.yml`) runs `npm run build` inside `frontend/` with `VITE_BASE_PATH=/LMS/`.
3. Vite outputs to `docs/`, which includes the compiled app and all files from `frontend/public/` (data, 404.html, logo).
4. The `peaceiris/actions-gh-pages` action pushes `docs/` to the `gh-pages` branch.
5. GitHub Pages serves the `gh-pages` branch at `https://yuvaraj-dudukuru.github.io/LMS/`.

### SPA routing on GitHub Pages

GitHub Pages returns a 404 for any URL that isn't a real file. `docs/404.html` catches these requests and redirects them to `index.html` via a query-string encoding trick. `index.html` then restores the original path and React Router takes over.

### Manual deploy (without CI)

```bash
cd frontend
$env:VITE_BASE_PATH = "/LMS/"
npm run build
# commit docs/ and push to main
git add ../docs
git commit -m "chore: rebuild"
git push origin main
```

---

## Auth

Authentication is entirely client-side.

- **Registration** stores a hashed password and user record in `localStorage`.
- **Login** verifies the hash and issues a base64-encoded token (30-day expiry).
- **Session** is read on every page load; expired tokens are cleared automatically.
- **No data leaves the browser.** Accounts only exist in the browser that created them.

---

## Courses

### CS50 AI (`cs50ai`)

Harvard's Introduction to Artificial Intelligence with Python. Seven weeks covering:

| Week | Topic |
|---|---|
| 0 | Search |
| 1 | Knowledge |
| 2 | Uncertainty |
| 3 | Optimization |
| 4 | Learning |
| 5 | Neural Networks |
| 6 | Language |

---

## Fraylon Mentor

The Mentor panel is visible on every problem page. It responds to student questions with Socratic prompts — it guides thinking without giving away answers.

Current behavior: the mentor picks a response from a set of Socratic questions based on the student's message and current code. Chat history is saved to `localStorage` and restored when the student returns to the same problem.

To extend the mentor with a real LLM (e.g. Claude), replace the `chat` function in `frontend/src/api.ts` with a call to your backend or a serverless function.

---

## Code Editor

The center panel on the problem page is a plain `<textarea>` with editor-like keyboard shortcuts:

| Key | Action |
|---|---|
| Tab | Insert 4 spaces |
| Enter | Preserve current indentation level |
| Ctrl+Enter / Cmd+Enter | Submit code |

Submissions are stored in `localStorage` and shown below the editor. The submission output is a placeholder message — connect a real runner to execute and grade code.

---

*Fraylon Technologies · May 2026*