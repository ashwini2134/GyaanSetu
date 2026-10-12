# Changelog

All notable changes to Fraylon LMS are documented here.

---

## [3.0.0] — 2026-07-04 — Phase 3: Automated Student Pipeline

### Added
- Automated quiz grading via `quizGrading` BullMQ queue (concurrency 5)
- Lesson unlock automation: passing a quiz creates the next `Progress` record automatically
- AI project review pipeline via `project-review` BullMQ queue (Google Gemini)
- AI capstone review pipeline via `capstoneReview` BullMQ queue
- Certificate eligibility checker (`certificationService.ts`) with 5-condition gate
- Automated certificate issuance via `certificate` BullMQ queue (concurrency 3)
- Public certificate verification endpoint: `GET /api/certifications/verify/:certNumber`
- LinkedIn share URL generation: `POST /api/certifications/:certNumber/share`
- SVG digital badge generation: `GET /api/certifications/:certNumber/badge`
- Portfolio auto-update on project approval, capstone approval, and cert issuance
- Inactivity notification cron (daily 09:00) for students inactive > 3 days
- Unified `sendNotification()` service for in-app + email delivery
- Email delivery via Resend (primary) with SMTP/Nodemailer fallback
- Notification worker (`notification` queue, concurrency 10)
- Mock AI mode when `GOOGLE_AI_API_KEY` is empty (safe for tests/staging)
- Local certificate fallback when external cert API is not configured
- Phase 3 automated test suite: 70 tests (acceptance + stress + adversarial)

### Fixed
- `unlockNextLesson()`: lectureId lookup mismatch caused silent unlock failure for all quizzes
- Inactivity cron: sent wrong payload format to notification worker (missing `to/subject/body`)
- `StudentPortfolio` concurrent create race condition (P2002) under concurrent completions
- `IssuedCertificate.certNumber` collision when multiple students complete at same millisecond
- `ZodError` returned HTTP 500 instead of 400 (global error handler didn't handle Zod)
- Unauthenticated `/api/admin/push-db` endpoint removed (could trigger destructive DB migration)
- Unauthenticated `/api/test-db` debug endpoint removed

### Security
- Removed two unauthenticated debug endpoints from production build
- All admin routes protected with `requireAuth` + `requireRole('admin')`
- Certificate ownership verification before share/template update actions
- AI review content validation rejects `eval`, `exec`, `os.system` patterns

### Changed
- `package.json` version: `1.0.0` → `3.0.0`
- `start` script: replaced `prisma db push --accept-data-loss` with `prisma migrate deploy` (non-destructive)
- `railway.toml` `startCommand` confirmed as `npm run start:web` (safe, workers disabled)

### Removed
- `src/scratch.ts` — development Zod test script
- `test-branding.js` — debug script for branding settings
- `output.log` — empty log file
- `test-results/` — vitest CI output directory

---

## [2.0.0] — Phase 2: Admin Content Studio & Course Infrastructure

### Added
- Admin Content Studio with course, lesson, and exercise management
- Phase 2.5 admin routes: courses, lessons, exercises, quiz, projects, versions, beta, operations
- Branding settings with dynamic theming
- AI configuration management
- Email template management
- Roles and integrations management
- Background job monitor and operations dashboard
- CS50 AI with Python course (JSON-based lecture content)
- Python 2.0 premium course (14 lectures, scroll-driven progressive reveal)
- Practice exercises system with drag-and-drop, hierarchy, AI conversation, path builder, BFS/DFS
- Assessment system with AI interview practice and mock tests
- Portfolio and resume builder
- Push notifications infrastructure
- Email digest system
- Analytics dashboard

---

## [1.0.0] — Phase 1: Core LMS Foundation

### Added
- User authentication (email/password + GitHub/Google/LinkedIn OAuth)
- JWT access + refresh token flow
- Course progress tracking (`Progress` model with `courseSlug + lectureId`)
- Quiz attempt recording (`QuizAttempt`)
- XP and achievement gamification
- Streak tracking
- Daily missions
- In-app notification system
- Code drafts (per-user, per-lecture)
- Chat/mentor system
- Project submission workflow
- PostgreSQL via Prisma ORM
- Redis via BullMQ for background jobs
- Railway deployment configuration (web + worker two-process split)
