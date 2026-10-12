# Fraylon LMS — Phase 3 Release Notes

**Version:** 3.0.0
**Release Date:** 2026-07-04
**Status:** Production Ready

---

## Overview

Phase 3 delivers the complete automated student pipeline: from quiz submission through certificate issuance. Every step from answering a quiz to receiving a verified certificate now runs without any manual admin intervention.

---

## New Features

### 1. Automated Quiz Grading Pipeline
- Quiz submissions are graded instantly via the `quizGrading` BullMQ queue
- Per-question scoring with configurable points and explanations
- Results stored as `QuizAttempt` records with score, pass/fail, and per-question feedback
- Attempt limit enforced (max 3 per lecture) — returns 403 on excess attempts
- In-app notification sent on every quiz result

### 2. Lesson Unlock Automation
- Passing a quiz automatically unlocks the next lecture in `Progress` table
- Resolves `courseSlug` from both direct slug (`python`, `fundamentals-of-ai`) and DB course IDs (cuid lookup)
- Uses upsert to prevent duplicate unlock records under concurrency
- Fallback to `StudentProgress` DB table for legacy lesson records

### 3. AI Project Review Pipeline
- Project submissions enter `project-review` BullMQ queue as `PENDING`
- Google Gemini AI reviews code for correctness, completeness, and quality
- Returns structured feedback: `{ passed, score, strengths, improvements, nextSteps }`
- In-flight guard: 409 returned if student resubmits while a review is in progress
- 3-submission limit enforced — returns 403 after exhausting attempts
- Mock mode: triggered automatically when `GOOGLE_AI_API_KEY` is empty (always returns `{ passed: true, score: 95 }` for safe testing)

### 4. AI Capstone Review Pipeline
- Capstone submissions processed via `capstoneReview` BullMQ queue
- Same AI review flow as project review, scoped to the final lecture's project
- Approval marks `projectCompleted = true` on the last `Progress` record — unlocking certificate eligibility

### 5. Certificate Issuance Pipeline
- Certificate eligibility check validates all conditions:
  - All lectures completed (`Progress.status = COMPLETED`)
  - All practice sections completed (`practiceCompleted = true`)
  - All quizzes attempted (`QuizAttempt` records present for every lecture)
  - Minimum problem submission count met
  - Capstone project approved (`projectCompleted = true` on final lecture)
- Idempotency: `@@unique([userId, courseSlug])` on `IssuedCertificate` prevents double-issuance
- Cert number format: `CERT-{SLUG}-{timestamp}-{studentId.slice(-6)}` — guarantees uniqueness under concurrency
- Falls back to local issuance when external cert API (`CERTS_APP_URL`) is not configured
- Portfolio updated with certificate entry on issuance
- Achievement notification sent to student

### 6. Certificate Public Verification
- Public endpoint `GET /api/certifications/verify/:certNumber` — no auth required
- Returns: `{ valid, certNumber, recipientName, courseSlug, issuedAt, avgScore, capstoneTitle, templateId, viewCount, shareCount }`
- Returns `{ valid: false }` with 404 for unknown cert numbers
- Increments `viewCount` on each verification call
- LinkedIn share URL generation via `POST /api/certifications/:certNumber/share`
- SVG badge generation via `GET /api/certifications/:certNumber/badge`

### 7. Portfolio Auto-Update
- `updatePortfolio()` called after project approval, capstone approval, and certificate issuance
- Deduplication: skips entries already present in `StudentPortfolio.projects/certificates`
- Auto-generates skill tags from course and project data (e.g., completing `quiz_app` adds Flask, REST APIs)
- Race condition safe: uses upsert + P2002 catch-and-retry pattern

### 8. Inactivity Notification Cron
- Runs daily at 09:00 via `node-cron`
- Identifies students inactive for more than 3 days
- Sends in-app notification + queues email via `notification` BullMQ queue
- Uses correct `sendNotification()` payload format — email worker receives `{ to, subject, body, link, html }`

### 9. Notification System
- `sendNotification(userId, type, title, body, link?)` — unified API for all system events
- Creates `InAppNotification` record immediately (synchronous)
- Enqueues email via BullMQ `notification` queue (asynchronous)
- Email delivery via Resend (primary) or SMTP/Nodemailer (fallback)
- Notification types: `quiz_result`, `achievement`, `streak`, `review_ready`, `certificate_ready`

---

## Architecture Additions

### BullMQ Queue Infrastructure
```
quizGrading     (concurrency: 5)   — quiz grading + lesson unlock
capstoneReview  (concurrency: 2)   — capstone AI review
project-review  (concurrency: 2)   — project AI review
certificate     (concurrency: 3)   — eligibility check + cert issuance
notification    (concurrency: 10)  — email delivery
```

### Two-Process Railway Deployment
- **Web service** (`npm run start:web`): Express API, `DISABLE_WORKERS=true`
- **Worker service** (`npm run start:worker`): BullMQ workers + cron, no HTTP server

### Queue Isolation
- Producer connection (`connection` in queue definitions)
- Consumer connection (`createWorkerConnection()` in worker process)
- Prevents BullMQ v5 dual-use connection warning

---

## Bug Fixes (discovered during Phase 3 testing)

| Bug | Impact | Fix |
|---|---|---|
| `unlockNextLesson()` lectureId lookup mismatch | Lesson unlock silently broken for all quizzes | Parse numeric index from `fundamentals-of-ai-0` suffix; resolve slug from courseId |
| Inactivity cron wrong payload format | Notification worker received `{ userId, type }` instead of `{ to, subject, body }` | Replaced queue.add call with `sendNotification()` |
| `StudentPortfolio` concurrent create race condition | P2002 crash when 10+ students complete concurrently | Upsert + P2002 catch-and-retry in `portfolioUpdater.ts` |
| `IssuedCertificate.certNumber` collision | Certs fail when multiple students complete at same millisecond | Added `studentId.slice(-6)` suffix to cert number |
| `ZodError` → 500 response | All Zod validation failures returned 500 instead of 400 | Added `ZodError` handler to `errorHandler.ts` |
| Unauthenticated `/api/admin/push-db` endpoint | Any HTTP request could trigger `prisma db push --accept-data-loss` on production DB | **Removed** |

---

## Automated Test Coverage

- **70 total tests** across 3 suites — all passing
- `phase3.acceptance.test.ts` — 28 tests covering the full student journey end-to-end
- `phase3.stress.test.ts` — 10 tests covering concurrent operations (20 simultaneous quizzes, 10 concurrent certs)
- `phase3.adversarial.test.ts` — 32 tests covering security, injection, auth failures, and edge cases

---

## Known Non-Blocking Warnings

| Warning | Impact | Mitigation |
|---|---|---|
| Frontend bundle chunks > 500KB | Vite recommendation only; does not affect runtime | Code-split heavy pages in Phase 4 |
| In-flight duplicate submission guard is TOCTOU | Theoretical race under true HTTP concurrency | DB-level `@@unique([userId, projectId, status])` constraint needed for full fix; sequential flow works correctly |
| `sqlite3` listed as dependency | Legacy leftover; project uses PostgreSQL exclusively | Remove in next dependency cleanup |

---

## Environment Variables

### Required
| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string (BullMQ) |
| `JWT_ACCESS_SECRET` | JWT signing key |
| `JWT_REFRESH_SECRET` | JWT refresh key |
| `FRONTEND_URL` | CORS allowed origin |

### Optional (graceful fallback if absent)
| Variable | Purpose | Fallback |
|---|---|---|
| `GOOGLE_AI_API_KEY` | Gemini AI for project review | Mock mode (`passed: true, score: 95`) |
| `CERTS_APP_URL` + `CERTS_BEARER_TOKEN` | External cert service | Local `IssuedCertificate` creation |
| `SMTP_HOST/PORT/USER/PASS` | Email delivery | Resend or no-op |
| `RESEND_API_KEY` | Resend email delivery | SMTP fallback |
| `GROQ_API_KEY` | Chat feature | Chat disabled |
