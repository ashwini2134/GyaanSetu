# Fraylon LMS — Deployment Checklist

**Version:** 3.0.0
**Platform:** Railway
**Architecture:** Two-process (Web API + Background Worker)

---

## Pre-Deployment Build Checks

- [ ] `npm run build` passes with zero TypeScript errors (`tsc --noEmit`)
- [ ] `cd frontend && npm run build` completes without errors
- [ ] All 70 automated tests pass: `cd backend && npm test`
- [ ] No unauthenticated destructive endpoints in `src/app.ts`

---

## Railway Services Configuration

### Service 1 — Web API

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Start command | `npm run start:web` |
| Environment variable | `DISABLE_WORKERS=true` |
| Health check path | `/api/health` |
| Health check timeout | 30s |
| Restart policy | `on_failure`, max 5 retries |

### Service 2 — Background Worker

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Start command | `npm run start:worker` |
| Environment variable | _(none — workers enabled by default)_ |
| Health check | Not required (non-HTTP process) |
| Restart policy | `on_failure`, max 5 retries |

> **Do NOT** use `npm start` or `npm run start` on Railway. Use `start:web` for web, `start:worker` for worker.

---

## Required Environment Variables

Set these in Railway's environment variable panel for **both** services:

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Railway sets automatically) | `postgresql://user:pass@host:5432/db` |
| `REDIS_URL` | Redis connection string (Railway sets automatically) | `redis://default:pass@host:6379` |
| `JWT_ACCESS_SECRET` | 32+ character random string | `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | 32+ character random string (different from above) | `openssl rand -hex 32` |
| `FRONTEND_URL` | Deployed frontend URL for CORS | `https://your-frontend.vercel.app` |
| `NODE_ENV` | Runtime environment | `production` |

---

## Optional Environment Variables

Set these to enable additional features:

| Variable | Feature | Fallback Behavior |
|---|---|---|
| `GOOGLE_AI_API_KEY` | AI project/capstone review | Mock mode: always returns `passed=true, score=95` |
| `CERTS_APP_URL` | External certificate service | Issues certificate locally to DB |
| `CERTS_BEARER_TOKEN` | External certificate service auth | Required if `CERTS_APP_URL` is set |
| `RESEND_API_KEY` | Email delivery via Resend | Falls back to SMTP |
| `SMTP_HOST` | Email delivery via SMTP | No email delivery if both Resend and SMTP missing |
| `SMTP_PORT` | SMTP port | Defaults to 587 |
| `SMTP_USER` | SMTP username | — |
| `SMTP_PASS` | SMTP password | — |
| `SMTP_FROM` | From address for emails | `noreply@fraylon.academy` |
| `GITHUB_CLIENT_ID` | GitHub OAuth | OAuth login disabled |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth | — |
| `GITHUB_CALLBACK_URL` | GitHub OAuth redirect | — |
| `GOOGLE_CLIENT_ID` | Google OAuth | OAuth login disabled |
| `GOOGLE_CLIENT_SECRET` | Google OAuth | — |
| `GOOGLE_CALLBACK_URL` | Google OAuth redirect | — |
| `LINKEDIN_CLIENT_ID` | LinkedIn OAuth | OAuth login disabled |
| `LINKEDIN_CLIENT_SECRET` | LinkedIn OAuth | — |
| `LINKEDIN_CALLBACK_URL` | LinkedIn OAuth redirect | — |
| `GROQ_API_KEY` | Chat/mentor feature | Chat disabled |

---

## Database Setup

### First Deployment (new database)
```bash
npx prisma migrate deploy
```
This applies all migrations in `prisma/migrations/` non-destructively.

### Schema Changes (subsequent deployments)
```bash
npx prisma migrate deploy
```
Never run `prisma db push --accept-data-loss` in production — it can silently drop columns.

### Seed Data (one-time, run via `railway run` against the target service so the production `DATABASE_URL` is used)
```bash
npx tsx scripts/migrate-lessons-to-db.ts   # courses, lessons, quizzes, projects (from frontend/public/data)
npx tsx src/seeds/seed_milestones.ts       # portfolio/certification project templates
npx tsx scripts/seed_projects.ts
npm run seed:assessments                  # assessment/quiz question bank
npm run seed:drag-drop                    # drag-and-drop exercises
npx tsx src/seeds/practiceExercises.ts     # AI-mentor practice exercise prompts
```

> `migrate-lessons-to-db.ts` deletes and re-inserts `Lesson`/`Quiz`/`CourseProject` rows for each course before reseeding — safe for populating a fresh DB, but will overwrite any content that was hand-edited directly in production. Do not run `clear_projects.js` against production; it unconditionally deletes `project_submissions`.

---

## BullMQ Queues

The following queues must be served by the Worker process:

| Queue | Worker | Concurrency |
|---|---|---|
| `quizGrading` | `quizGradingWorker` | 5 |
| `capstoneReview` | `capstoneReviewWorker` | 2 |
| `project-review` | `projectReviewWorker` | 2 |
| `certificate` | `certificateWorker` | 3 |
| `notification` | `notificationWorker` | 10 |

The Worker process exits with a fatal error if `REDIS_URL` or `DATABASE_URL` is not set.

---

## Post-Deployment Verification

Run these checks after each deployment:

```bash
# 1. Health check
curl https://your-api.railway.app/api/health
# Expected: { "status": "ok" }

# 2. Database connectivity (admin-only endpoint)
curl -H "Authorization: Bearer <admin_token>" https://your-api.railway.app/api/admin/health

# 3. Certificate verification endpoint (public)
curl https://your-api.railway.app/api/certifications/verify/NONEXISTENT
# Expected: 404 { "valid": false }
```

---

## Rollback Plan

1. Railway supports instant rollback to the previous deployment via the dashboard
2. Database: `prisma migrate deploy` is additive-only — no automatic rollback needed
3. If a migration must be reversed, create a new migration that undoes the change

---

## Known Non-Blocking Warnings

| Warning | Action Required |
|---|---|
| Frontend JS chunks > 500KB (Vite build warning) | None — runtime performance is acceptable; code-split in Phase 4 |
| In-flight duplicate submission guard is TOCTOU under extreme concurrency | None — sequential flow works; add DB unique constraint in Phase 4 if needed |
| `sqlite3` in `dependencies` | Not used; remove in next dependency cleanup |
