# Fraylon LMS — Platform Readiness Audit

**Date:** June 24, 2026
**Auditor:** Comprehensive automated audit across 6 phases
**Source:** Full codebase analysis (backend, frontend, schema, deployment config)

---

## 1. Platform Readiness Score

| Category | Score | Status |
|---|---|---|
| Student Journey | 7.5/10 | Functional with UX gaps |
| Admin Journey | 8/10 | Comprehensive, minor polish needed |
| Data Integrity | 6/10 | Race conditions and consistency gaps |
| Permissions & Auth | 8.5/10 | Two unguarded endpoints found |
| Production Readiness | 5/10 | Significant gaps |
| Feature Inventory | 7/10 | Stale/deprecated artifacts present |

### Overall: 7/10 — Near production-ready but with blocking issues

---

## 2. Critical Issues (Blocking Production)

### C1. Assessment answer key exposed (backend/src/routes/assessments.ts:108)
`GET /questions/:category/:subsection` has **zero authentication** — no `requireAuth`, no session check. Anyone can retrieve the full assessment question bank including `correctAnswer` values for every question. Students can trivially pre-fetch answer keys before taking any assessment.

### C2. Assessment submission allows impersonation (backend/src/routes/assessments.ts:145)
`POST /submit` has **zero authentication** and accepts `userId` directly from the request body. An attacker can craft requests to submit fraudulent assessment results (pass or fail) for any user in the system. There is no verification that the caller owns the `userId`.

### C3. .env file contains production GROQ_API_KEY and is committed (/.env:2)
The `.env` file (not gitignored at the root level despite being listed) contains a production `GROQ_API_KEY`. If this is a production API key, it is exposed in the repository. This is a security incident.

### C4. LectureProgress ↔ Progress desynchronization (backend/src/routes/progress.ts:196-388)
Two systems track lecture completion with no cross-reconciliation:
- `PATCH /progress/lecture/:courseSlug/:lectureId` marks sections complete in `LectureProgress` but does not update `Progress.status`
- `POST /progress/lecture` marks `Progress.status = "COMPLETED"` without verifying `LectureProgress` sections
- Courses endpoint uses magic number `6` to infer completion from section count (courses.ts:52)
- Result: students can see conflicting completion states between course overview and analytics

### C5. External certificate API call has no compensating transaction (certificationService.ts:174-202)
If the Certs API call succeeds but the local `prisma.issuedCertificate.create()` fails, the certificate exists externally but is not recorded in the LMS. The unique constraint on `userId_courseSlug` prevents retrying. Manual reconciliation is required. No compensating transaction exists.

---

## 3. High Priority Issues

### H1. Non-atomic writes cause partial data loss (progressTrackingService.ts:16-71)
`recordQuizAttempt` and `completeLecture` both commit data before `awardXp` runs. If `awardXp` throws (e.g., from the TOCTOU race on unique constraint), the primary operation is persisted but XP/streak updates are lost. The two operations should be wrapped in a Prisma transaction.

### H2. TOCTOU race in awardXp (gamificationService.ts:18-25)
Two concurrent requests with the same `userId`+`actionId` can both pass the `findUnique` check and then one hits the unique constraint violation (`P2002`), throwing an unhandled error that causes the entire transaction to roll back. This triggers 500 errors under any real concurrency.

### H3. Missing indexes on common query patterns (schema.prisma)
- `Progress(userId, status)` — leaderboard, stats, certification eligibility
- `Progress(courseSlug)` — course-scoped queries
- `XpTransaction(createdAt)` — period-based leaderboard queries
- `QuizAttempt(userId)` — user stats
- `LectureProgress(userId, courseSlug, lectureId)` — section-level lookups

All of these are full sequential scans at scale.

### H4. Most admin pages have silent error handling (8 of 11 pages)
`AdminAssessmentsPage`, `AdminAutomationsPage`, `AdminCertificationsPage`, `AdminContentPage`, `AdminCoursesPage`, `AdminNotificationsPage`, `AdminProjectsPage`, `AdminSettingsPage` — all use completely silent `catch {}` blocks with no user-visible error feedback. Failures are invisible.

### H5. overallProgress is client-trusted with no validation (backend/src/routes/progress.ts:81-91)
`POST /progress/overall` accepts any `overallProgress` number from the client and writes it directly to the User model. A malicious or buggy client can set arbitrary values, corrupting student progress display.

### H6. Register page has overly generic error messaging (Register.tsx:23-27)
All registration failures show: *"Could not register. Email may already be in use."* This is misleading for network errors, validation errors, or server errors. Login.tsx is a positive example with granular error handling.

### H7. Vite base path hardcoded to "/" (vite.config.ts:11)
The `base: "/"` setting assumes root-level deployment. If deployed to a subpath (e.g., GitHub Pages `https://yuvaraj-dudukuru.github.io/LMS`), all asset paths will break. The package.json `homepage` field suggests `/LMS` subpath deployment is intended, but vite.config.ts does not use it.

---

## 4. Medium Priority Issues

### M1. Assessment UI silently fails on load (AssessmentsSection.tsx:403-416)
`fetchProgress` catches errors but only logs to `console.error` — no user error state or banner. API failures are invisible to students on the assessments page.

### M2. Projects page has no loading or error states (Projects.tsx)
No spinner during `useProjectStatus()` loading. No error state. Users see all projects as "Not Started" until the hook resolves, then they snap to their real status.

### M3. Leaderboard silently fails (LeaderboardPage.tsx:162-172)
Error handler silently sets empty array, so `catch {}` displays "No Rankings Yet" — indistinguishable from a legitimate empty leaderboard. Network failures are invisible.

### M4. avgQuizScore averages ALL attempts (certificationService.ts:99-101)
Certification eligibility averages every quiz attempt including failed retries, rather than using best score per quiz. A student who retakes a quiz and scores lower drags their average down, potentially blocking certification.

### M5. PracticeSubmission is limited to one per lecture (schema.prisma:357-359)
`@@unique([userId, courseId, lectureId])` restricts students to a single practice submission per lecture. Submit again and it overwrites. No versioning.

### M6. `Settings` nav link goes to ProfilePage (App.tsx:496-499)
In the routes, `/settings` renders `<ProfilePage />`. The nav link in Shell.tsx:248 says "Settings" but the page shows profile (portfolio) content. This is confusing — users expect actual settings.

### M7. ProfilePage has 4 placeholders hidden behind comments (ProfilePage.tsx:334-339)
*"Preferences"*, *"Connections"*, *"Privacy"*, and another tab are commented out with `// 🚫 Hidden until [...] backend is ready`. This suggests incomplete features the user might expect.

### M8. Course content loaded from static JSON files, not DB (api.ts:78-169)
Course structure (lectures, problems, quizzes) is loaded from `frontend/public/data/*.json` files. The admin content editor also writes to these files. This means:
- On a server with multiple replicas, file-based content changes don't propagate
- No content versioning or audit trail
- Vercel deployments with `git-based` builds won't reflect runtime content edits

### M9. No 404 page or error boundary (App.tsx:505-508)
All unmatched routes redirect to `/`. React error boundaries exist in `ErrorBoundary.tsx` but are not used in `App.tsx` — any component crash shows a blank page or white screen.

### M10. Hardcoded constants for course structure (courses.ts:8-11, certificationService.ts:10-19)
`COURSE_LECTURE_COUNTS` and `COURSE_PROBLEM_COUNTS` are hardcoded maps in TypeScript. Curriculum changes require code deploys. Adding a course requires modifying source code.

### M11. `LMS/` directory is a stale nested clone (root LMS/)
A full nested git repo `LMS/` exists at the root with its own `.git`, content, and frontend — likely an old snapshot or accidental clone. Adds confusion and wasted space.

### M12. Multiple root-level Python/generation scripts (root directory)
Numerous one-off Python scripts (`fix_*.py`, `update_*.py`, `generate_*.py`, etc.) clutter the root. These appear to be data migration/content generation scripts that are no longer needed.

---

## 5. Technical Debt List

### Schema & Data Model
- TD1. `lectureId` is String throughout schema but parsed as Number in certificationService.ts:95 — brittle for non-numeric lecture IDs
- TD2. `XpTransaction.actionId` is optional but unique composite — empty string vs null behavior differs; "" bypasses the duplicate guard
- TD3. `Submission` model has `@@unique([userId, problemId])` — one submission per problem per user, no retry support
- TD4. `Progress` and `LectureProgress` are separate tables with no FK relationship — querying course progress requires multiple round-trips
- TD5. `AssessmentQuestion` has `options` as `String[]` — fixed-length arrays make MCQ expansion awkward
- TD6. No course/lecture tables — slugs and IDs are string references with no referential integrity

### Backend Code
- TD7. `certs/lib/cert-body.ts` had to be fixed to avoid "no template yet" error — the external certs app has hardcoded template expectations
- TD8. `POST /admin/push-db` endpoint in app.ts:55-63 executes `prisma db push` from within the running server — dangerous in production
- TD9. Course content management writes to filesystem (`adminContent.ts`) — not compatible with containerized/serverless deployments
- TD10. `getCourseUserIds` does `DISTINCT` on Progress table (gamificationService.ts:167-173) — could be replaced with a course enrollment concept

### Frontend Code
- TD11. `api.ts:220-268` — client-side mentor chat uses hardcoded 600ms delays and heuristic lecture numbering (`Math.floor(problemIndex / 5)`)
- TD12. `getBadges` and `getBadgesWithProgress` are hardcoded in api.ts — not fetched from any backend, so badge progress is always stale
- TD13. `deprecated` comment on getLeaderboard (api.ts:487) — the function still exists and returns empty array; consumers may still call it
- TD14. Practice exercises previously lived in `frontend/src/data/practiceExercises.ts` (deleted) — ensure no stale imports remain
- TD15. `Projects.tsx` imports static `projectsData` from `data/projectsData` — these should come from the backend API for consistency

### Build & Config
- TD16. Prisma schema generates for PostgreSQL (`prisma/schema.prisma:7`) but `.env.example` and `startup logic` reference SQLite (`DATABASE_PATH=./data/lms.db`)
- TD17. Root `package.json` duplicates Prisma dependencies that also exist in `backend/package.json`
- TD18. `frontend/package.json` includes `playwright` as a production dependency (line 19) when it's likely only for testing
- TD19. `backend/package.json` includes `sqlite3` as a dependency when the schema uses PostgreSQL
- TD20. Multiple `.env` files — root `.env` has local postgres + GROQ key, backend has no `.env` but reads from `../../.env`

---

## 6. Deployment Risks

| Risk | Severity | Details |
|---|---|---|
| **API key in repo** | CRITICAL | `GROQ_API_KEY` in `.env` at root is committed. Git history preserves it even if removed. |
| **File-based content not portable** | HIGH | Admin content editor writes to disk files. Vercel serverless functions can't persist writes. Container restart loses content edits. |
| **Prisma schema targets PostgreSQL but legacy SQLite paths exist** | MEDIUM | Schema says `provider = "postgresql"` but `.env.example` shows `DATABASE_PATH=./data/lms.db` (SQLite path pattern). Misconfiguration risk. |
| **No database migration workflow** | MEDIUM | `start.sh` uses `prisma db push --accept-data-loss` — this is destructive. No proper migration pipeline. |
| **Vite base path mismatch** | MEDIUM | `base: "/"` in vite.config.ts conflicts with `homepage: "https://yuvaraj-dudukuru.github.io/LMS"` — assets will 404 on Vercel. |
| **Missing environment variable documentation** | MEDIUM | `CERTS_APP_URL` and `CERTS_BEARER_TOKEN` used in certificationService.ts:169 but undocumented in `.env.example`. |
| **No health check beyond /api/health** | LOW | No dependency health check (DB connectivity, external API status). |
| **NODE_ENV hardcoded default** | LOW | `config.ts:21` defaults to development if unset. Production deployments must explicitly set this. |

---

## 7. Recommended Fix Order

### Immediate (Blocking)
1. **C3** — Rotate GROQ_API_KEY, remove from .env, add .env to `.gitignore` at the correct level, purge from git history
2. **C1** — Add `requireAuth` to `GET /questions/:category/:subsection` and filter `correctAnswer` from non-admin responses
3. **C2** — Add `requireAuth` to `POST /submit`, use `req.user!.id` instead of body `userId` (with admin override check)

### Week 1 (Critical)
4. **C4** — Add cascade logic: upserting the last LectureProgress section should auto-complete the Progress record
5. **C5** — Swap order in `issueCertForStudent`: create local record first, then call external API. Add retry/reconciliation logic.
6. **H1** — Wrap `recordQuizAttempt` and `completeLecture` in Prisma transactions so XP awards are atomic with the primary write
7. **H2** — Catch `P2002` in `awardXp` and treat as no-op. Consider `upsert` pattern instead of read-then-write.
8. **H7** — Fix `vite.config.ts` base path to support subpath deployment or document the constraint

### Week 2 (High)
9. **H4** — Add user-visible error banners to all 8 admin pages that silently catch errors
10. **H3** — Add indexes: `Progress(userId, status)`, `Progress(courseSlug)`, `XpTransaction(createdAt)`, `QuizAttempt(userId)`, `LectureProgress(userId, courseSlug, lectureId)`
11. **H5** — Validate `overallProgress` server-side: clamp to 0-100 range, or compute from actual progress records
12. **H6** — Improve Register.tsx error handling to distinguish error types (network, duplicate, validation)
13. **M1** — Add error state and banner to AssessmentsSection for failed API calls
14. **M2** — Add loading spinner and error boundary to Projects page

### Week 3 (Medium)
15. **M4** — Change `avgQuizScore` to use best score per unique quizId, not average of all attempts
16. **M6** — Create proper Settings page or redirect to a profile settings section
17. **M8** — Evaluate: migrate content to DB or implement file sync for multi-replica deployments
18. **M9** — Wrap App.tsx in ErrorBoundary and create a proper 404 page
19. **M10** — Move course constants to DB or config file, not TypeScript source
20. **M11** — Remove stale `LMS/` nested clone from root

### Week 4 (Debt & Polish)
21. **M12** — Clean up root-level one-off scripts, move to `scripts/archive/`
22. **TD8** — Remove `POST /admin/push-db` from production code
23. **TD16** — Remove SQLite references from config files, ensure PostgreSQL-only path
24. **TD18/19** — Audit dependencies: move playwright to devDeps, remove sqlite3 if unused
25. **TD11-15** — Address stale/deprecated frontend code paths
26. **M5** — Consider multiple practice submissions per lecture with versioning

---

## Feature Inventory Summary

| Feature | Status | Notes |
|---|---|---|
| **Authentication** | ✅ Complete | JWT + refresh tokens + OAuth (GitHub/LinkedIn/Google) + password reset |
| **Course Browsing** | ✅ Complete | Course catalog, per-course lecture listing |
| **Lectures** | ✅ Complete | Content rendering, section tracking, progress |
| **Quizzes** | ✅ Complete | Per-lecture quizzes, auto-grading, pass/fail tracking |
| **Problems (Coding)** | ✅ Complete | Code editor, test runner, submission, mentor chat |
| **Projects** | ✅ Complete | Project templates, workspace, task tracking, approval workflow |
| **Practice Exercises** | ✅ Complete | AI-practice + Coding, admin config, analytics |
| **Assessments (Skill)** | ✅ Complete | Multi-category assessments, progress tracking, analytics |
| **Certifications** | ✅ Complete | Eligibility check, issuance, revocation, Certs app sync |
| **Leaderboard** | ✅ Complete | Weekly/monthly/all-time with XP breakdown |
| **Streaks** | ✅ Complete | Login streak tracking, milestones, streak multiplier on XP |
| **Badges/Achievements** | 🟡 Partial | Hardcoded client-side badge definitions; no backend integration |
| **Daily Missions** | ✅ Complete | Generate/store/redeem daily missions |
| **Notifications** | ✅ Complete | In-app + notification prefs + admin broadcast |
| **Admin Dashboard** | ✅ Complete | Stats, students, courses, projects overview |
| **Admin Content** | ✅ Complete | Course/lecture CRUD via filesystem |
| **Admin Students** | ✅ Complete | Directory, profile, activity timeline, activate/suspend |
| **Admin Projects** | ✅ Complete | Project review, approval/rejection, template management |
| **Admin Practice** | ✅ Complete | Full CRUD, analytics, connectivity validation |
| **Admin Assessments** | ✅ Complete | List/stats views |
| **Admin Certifications** | ✅ Complete | Issue, revoke, trends, analytics |
| **Admin Reports** | ✅ Complete | 6-tab analytics dashboard with CSV export |
| **Admin Automations** | ✅ Complete | Bulk cert issuance, bulk suspension |
| **Admin Notifications** | ✅ Complete | Send broadcast, view log, read/unread stats |
| **Admin Settings** | ✅ Complete | Site name, maintenance mode, registration toggle |
| **Review Queue** | 🟡 Partial | Read-only queue with resolve/reject; no pagination, history, or CRUD |
| **Profile Page** | 🟡 Partial | Core working; 4 placeholders for Preferences/Connections/Privacy |
| **Landing Page** | ✅ Complete | Marketing page with animations |

### Legend
- ✅ Complete — Fully implemented with real data
- 🟡 Partial — Functional but with known gaps
- ❌ Missing — Not implemented
