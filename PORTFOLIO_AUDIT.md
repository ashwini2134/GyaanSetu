# Portfolio System Audit

> **Status**: Read-only audit completed
> **Date**: 2026-07-15
> **Scope**: Backend (routes, services, workers, Prisma model) + Frontend (pages, components, data flow)

---

## 1. Architecture Overview

The Portfolio module consists of:

| Layer | File(s) | Purpose |
|---|---|---|
| **Prisma Model** | `backend/prisma/schema.prisma` (line 493) | `StudentPortfolio` table; JSON columns for courses, projects, certificates, skills, screenshots |
| **API Routes** | `backend/src/routes/portfolio.ts` | REST endpoints: `GET /api/portfolio`, `PATCH /api/portfolio`, `POST /api/portfolio/sync` |
| **Updater Lib** | `backend/src/lib/portfolioUpdater.ts` | Shared `updatePortfolio()` called from workers/services to atomically add entries |
| **AI Review Service** | `backend/src/services/aiReviewService.ts` (line 160) | Calls `updatePortfolio()` when a project is approved |
| **Certificate Worker** | `backend/src/workers/certificateWorker.ts` | Calls `updatePortfolio()` when a certificate is issued |
| **Capstone Worker** | `backend/src/workers/capstoneReviewWorker.ts` (line 40) | Calls `updatePortfolio()` when capstone is approved |
| **Admin Test Routes** | `backend/src/routes/admin/testing.ts` | Simulation endpoints that write to portfolio |
| **Profile Page** | `frontend/src/pages/ProfilePage.tsx` | Only frontend page — shows stats + external link, does NOT fetch `StudentPortfolio` data |

---

## 2. Data Model (`StudentPortfolio`)

```prisma
model StudentPortfolio {
  id           String   @id @default(cuid())
  studentId    String   @unique
  courses      Json     @default("[]")
  certificates Json     @default("[]")
  projects     Json     @default("[]")
  skills       Json     @default("[]")
  screenshots  Json     @default("[]")
  updatedAt    DateTime @updatedAt
}
```

**Observations:**
- All mutable data is stored as **JSON columns** — no relational normalization.
- No custom portfolio URL/template/theme fields on this model (those live on the `User` model as `portfolioUrl`).
- No `isPublic` / `visibility` toggle on the portfolio itself.
- No `templateId`, `layout`, `colorScheme`, or `customization` fields.
- Skills are stored as a flat `string[]` with duplicates prevented via `Set` in the updater.

---

## 3. API Endpoints

### `GET /api/portfolio` — Get portfolio
- Creates an empty portfolio if none exists (auto-create on read).
- Returns the full JSON blob (courses, projects, certificates, skills, screenshots).

### `PATCH /api/portfolio` — Update skills & screenshots
- Schema accepts `skills: string[]` and `screenshots: { projectId, url, caption? }[]`.
- Only updates those two fields — does NOT allow manual editing of courses/projects/certificates.

### `POST /api/portfolio/sync` — Full sync from DB
- Queries `Progress` (completed), `IssuedCertificate`, `Project` (completed), `Submission` (passed).
- Auto-generates skills from course slugs and project IDs via a hardcoded `techMap`.
- **CAUTION**: Does NOT deduplicate — re-sync will overwrite courses/projects/certificates with fresh queries. Dedup is only in `portfolioUpdater.ts`'s incremental path.

---

## 4. Data Flow

### 4.1 Project Approved (AI Review)
```
aiReviewService.ts (line 160)
  └─ updatePortfolio(studentId, 'projects', { projectId, title, isCapstone })
      └─ portfolioUpdater.ts: upsert portfolio → push to items[] → dedup by projectId → add skills from PROJECT_SKILLS map
```

### 4.2 Capstone Approved
```
capstoneReviewWorker.ts (line 40)
  └─ updatePortfolio(studentId, 'projects', { projectId, title, isCapstone: true })
      └─ portfolioUpdater.ts: same as above + adds 'Capstone Project' skill
```

### 4.3 Certificate Issued
```
certificateWorker.ts (line 66 / line 114)
  └─ updatePortfolio(studentId, 'certificates', { courseId, title, certNumber })
      └─ portfolioUpdater.ts: dedup by certNumber or courseId
```

### 4.4 Manual Sync (API)
```
POST /api/portfolio/sync
  └─ Queries all completed Progress, IssuedCertificate, Project, Submission
  └─ Generates skills from hardcoded techMap
  └─ Upserts entire portfolio at once (overwrites arrays)
```

**Key Gap**: The incremental path (`updatePortfolio`) and the full-sync path (`POST /sync`) use different dedup/merge strategies. The sync endpoint overwrites arrays entirely rather than merging.

---

## 5. Frontend Integration

### Current State: **No frontend portfolio view exists**

The frontend code for the Portfolio module is **entirely absent**:

| Feature | Status |
|---|---|
| Portfolio page (`/portfolio`) | ❌ Does not exist |
| Portfolio API consumer (GET/PATCH/sync) | ❌ Never called from frontend |
| Skills display from `StudentPortfolio` | ❌ Not rendered anywhere |
| Projects list from portfolio | ❌ ProfilePage shows stats from `displayStats`, not from portfolio |
| Certificates from portfolio | ❌ CertificatesPage reads `IssuedCertificate` directly, not portfolio |
| Portfolio settings/editor | ❌ Does not exist |

### What the Profile Page actually shows:
- **Stats** (courses completed, projects built, etc.) — from `displayStats` derived from Progress/Project models
- **Projects list** — rendered from `useGamification()` hook's `projectsData` with user progress
- **Social links** — external GitHub, LinkedIn, Portfolio URL (stored on `User` model)
- **Settings** — edit name, bio, avatar, URLs, visibility, theme

The `StudentPortfolio` data is **never fetched** anywhere in the frontend.

---

## 6. Skills Pipeline

### Source Mapping (`portfolioUpdater.ts`)

**Course → Skills:**
| Course Slug | Skills Added |
|---|---|
| `python` | Python, Programming Fundamentals, Problem Solving |
| `fundamentals-of-ai` | AI/ML, Python, Machine Learning, Search Algorithms |

**Project → Skills (`portfolioUpdater.ts`):**
| Project ID | Skills Added |
|---|---|
| `search_visualizer` | Search Algorithms, BFS, DFS, A*, Heuristics, Python |
| `inference_engine` | Propositional Logic, Inference, Model Checking, Knowledge Representation, Python |
| `text_classifier` | Machine Learning, NLP, TF-IDF, k-NN, Model Evaluation, Python |
| `csp_solver` | CSP, Backtracking, AC-3, Constraint Propagation, Optimization, Python |

**Project → Skills (sync endpoint's `techMap`):**
| Project ID | Skills Added |
|---|---|
| `student_management` | Python, SQLite, CLI, OOP |
| `expense_tracker` | Python, Data Analysis, Pandas, CSV |
| `quiz_app` | Python, Web Development, Flask, REST APIs |
| `todo_list` | Python, Data Structures, OOP, File I/O |

**Issues:**
1. **Two separate skill maps** exist — `COURSE_SKILLS`/`PROJECT_SKILLS` in `portfolioUpdater.ts` and `techMap` in `portfolio.ts`. They cover DIFFERENT project IDs.
2. The sync endpoint's `techMap` only covers 4 Python projects. AI course projects (`search_visualizer`, `inference_engine`, `text_classifier`, `csp_solver`) are only in `portfolioUpdater.ts`.
3. No skill from the sync path populates skills for AI courses (only Python courses).
4. No XP-based or AI-inferred skill extraction — all skills are hand-mapped.

---

## 7. Features Inventory

### ✅ Existing
- Backend API with auto-create, get, patch, and sync
- Incremental portfolio updater with dedup and race-condition handling (P2002 fallback)
- Auto-skill generation from courses and projects
- Certificate-to-portfolio integration
- Project (including capstone) → portfolio integration
- Admin test simulation endpoints
- Prisma model with studentId uniqueness constraint

### ❌ Missing / Incomplete
- **No frontend portfolio page** — biggest gap
- No public/private portfolio toggle
- No shareable portfolio URL (the `portfolioUrl` on User is an *external* link)
- No portfolio template/theme customization
- No way to reorder or hide portfolio entries
- No portfolio export (PDF/resume generation)
- No search/discovery of other students' portfolios
- No portfolio analytics (views, clicks)
- No image/screenshot upload for project entries
- No skill endorsement or verification badges
- No integration with the Resume builder (`/api/resume`) — that endpoint reads `portfolioUrl` from User, not from `StudentPortfolio`
- No frontend call to `POST /api/portfolio/sync` — users have no way to trigger a sync

---

## 8. Code Quality Assessment

### Strengths
- `portfolioUpdater.ts` handles concurrent create race conditions (P2002 fallback on upsert)
- Dedup logic prevents duplicate entries in incremental path
- Course/project skill extraction is centralized in the updater
- Zod validation on PATCH endpoint
- Uses `@unique` constraint on `studentId` for safe upsert
- TypeScript throughout

### Issues / Risks
- **JSON columns** — no referential integrity, no type safety at DB level, cannot query/filter by course/project ID
- **Two divergent skill maps** — `COURSE_SKILLS`/`PROJECT_SKILLS` vs `techMap` — will produce different skill sets depending on which code path runs
- **No frontend consumer** — the entire backend API is dead code from the user's perspective
- **`any` casts everywhere** — `items: any[]`, `portfolio as any`, `Array.from(skills) as any` — TypeScript is essentially bypassed
- **Sync overwrites arrays** — `POST /sync` replaces courses/projects/certificates entirely instead of merging
- **No pagination** — portfolio could grow large (many projects, courses)
- **Hardcoded skill maps** — new courses/projects require code changes to appear in skills
- **No error boundary** — if any update fails, the entire portfolio write fails

---

## 9. Security & Permissions

- All portfolio endpoints require authentication (`requireAuth`)
- Portfolio is scoped to the authenticated user's `studentId` — no admin override
- No role-based access for viewing other users' portfolios
- No rate limiting on PATCH or sync endpoints

---

## 10. Quick Wins

| # | Win | Effort | Impact |
|---|---|---|---|
| 1 | Create a frontend portfolio page (`/portfolio`) that fetches `GET /api/portfolio` and renders courses, projects, certificates, and skills | Medium | High |
| 2 | Add a "Sync Portfolio" button on dashboard/profile that calls `POST /api/portfolio/sync` | Low | High |
| 3 | Unify the two skill maps into a single source of truth | Low | Medium |
| 4 | Remove `any` casts and add proper types for portfolio JSON data | Low | Medium |
| 5 | Add a portfolio visibility toggle (`isPublic`) to the model | Low | Medium |
| 6 | Add a shareable portfolio URL like `/portfolio/:userId` | Medium | High |
| 7 | Integrate portfolio data into the resume builder | Medium | Medium |

---

## 11. Portfolio Readiness Score

| Category | Score (/10) | Notes |
|---|---|---|
| Backend Architecture | 7/10 | Solid incremental updater, race-condition handling; JSON columns are a concern |
| API Completeness | 6/10 | CRUD works but no pagination, filtering, or public access |
| Data Model | 5/10 | JSON all the things; no relations, no visibility, no customization |
| Frontend Integration | 0/10 | Entirely missing — no page, no components, no API calls |
| Skills Pipeline | 5/10 | Works for known courses/projects but hardcoded and duplicated |
| Data Flow | 7/10 | Workers/services correctly call updater; dedup works |
| Code Quality | 4/10 | `any` casts, duplicated skill maps, no types for JSON data |
| Customization | 1/10 | No templates, themes, reordering, or personalization |
| Security | 7/10 | Auth required, user-scoped; no rate limiting or RBAC for public access |
| Missing Features | 2/10 | No public sharing, no export, no search, no analytics |

### Overall Score: **44 / 100**

### Redesign Priorities

**P0 (Blocking):**
1. Build frontend portfolio page — without it the entire module is invisible
2. Add sync trigger from frontend so users can populate their portfolio

**P1 (High):**
3. Normalize JSON columns into relational tables (or at least add TypeScript types)
4. Unify skill maps
5. Add public portfolio view with visibility toggle

**P2 (Nice-to-have):**
6. Portfolio customization (templates, themes, reordering)
7. Portfolio export (PDF)
8. Portfolio analytics (views, skill endorsements)
