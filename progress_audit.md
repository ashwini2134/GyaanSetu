# Task 3 Pre-Implementation Audit — Progress Tracking Migration

## Executive Summary

Three progress systems currently coexist:

| System | File | Storage | Status |
|--------|------|---------|--------|
| **A — Legacy** | `frontend/src/api.ts` | `localStorage` (keys: `fa_*`) | Deprecated with warnings |
| **B — Current** | `frontend/src/hooks/useProgress.ts` | In-memory cache + backend API (SQLite) | Active primary system |
| **C — Fraylon** | `frontend/src/progress.ts` | `localStorage` (keys: `fraylon_*`) | Active gamification layer |

The Prisma schema (`prisma/schema.prisma`) defines a PostgreSQL-backed `Progress` model but is **not used at runtime**. The actual backend runs on SQLite via `node:sqlite` with tables `lecture_progress`, `project_submissions`, and `user_activities`.

---

## 1. Progress Data Flow

### 1.1 User Visits a Section

**File:** `frontend/src/pages/LecturePage.tsx`
**Function called:** `markSectionVisited(sectionId)` (line 230, 232)

```
LecturePage.tsx
  └─ useProgress().markSectionVisited(id)
       ├─ updateProgress() → writeCache() → dispatchEvent('lms:progress-change')
       ├─ POST /api/progress/lecture/section  (fire-and-forget, .catch() swallows errors)
       └─ if sectionId !== 'quiz'/'problems':
            import('../progress').then(m => m.completeAction('section', ...))
                 ├─ awardXp(10, 'Section Completed') → localStorage 'fraylon_xp'
                 └─ checkAchievements()
```

**Data updated:**
- In-memory cache: `sections[sectionId].visited = true`, `lastSection = sectionId`
- Backend SQLite: `lecture_progress.sections_json` merged, `lecture_progress.last_section` set
- localStorage `fraylon_xp` +10
- localStorage `fraylon_completed_actions` deduplicated

**Components depending on this data:** `ProgressWidget.tsx` (visited count), `LessonSidebar.tsx` (visited indicator), `LecturePage.tsx` (page status map)

---

### 1.2 User Completes a Practice Exercise

**File:** `frontend/src/pages/LecturePage.tsx`
**Functions called:** `markPracticeAttempted(id)` → `markPracticeCompleted(id)` (lines 405–411)

```
LecturePage.tsx
  └─ useProgress().markPracticeAttempted(id)
       └─ updateProgress() → sections[id].practiceAttempted = true
  └─ useProgress().markPracticeCompleted(id)
       └─ updateProgress() → sections[id].practiceCompleted = true
       └─ tryAutoCompleteLecture(slug, num, totalSec, totalProbs, hasQuiz, hasProject)
            └─ checkLectureCompletion()
                 ├─ reads in-memory cache
                 └─ if all conditions met: lectureCompleted = true, writeCache()
```

**Data updated:**
- In-memory cache: `sections[id].practiceAttempted`, `sections[id].practiceCompleted`
- **No backend API call** for practice (only cache)
- Auto-complete lecture check runs synchronously

**Components depending on this data:** `ProgressWidget.tsx` (practice completed count), `LecturePage.tsx` (completion overlay)

---

### 1.3 User Completes a Problem

**File:** `frontend/src/pages/LecturePage.tsx` (line 496) / `CodingProjectPage.tsx` (line 355)
**Function called:** `markProblemCompleted(problemId)` / `markProjectCompletedDirect(slug, num, projectId)`

```
LecturePage.tsx:
  └─ useProgress().markProblemCompleted(problemId)
       ├─ updateProgress() → problemsCompleted.push(problemId)
       ├─ POST /api/progress/lecture/problem  (fire-and-forget)
       └─ import('../progress').then(m => m.completeAction('problem', ...))
            ├─ awardXp(20, 'Problem Solved') → localStorage 'fraylon_xp'
            └─ checkAchievements()

CodingProjectPage.tsx:
  ├─ saveCompletedProject(slug, projectId, true) → localStorage 'fa_completed_projects'
  ├─ markProjectCompletedDirect(slug, num, projectId) → readAll/writeAll
  ├─ POST /api/progress/lecture/problem  (via recordProjectCompletion)
  └─ import('../progress').then(m => m.completeAction('project', ...))
```

**Data updated:**
- In-memory cache: `problemsCompleted[]` pushed, `projectCompleted: true`, `projectId`
- Backend SQLite: `lecture_progress.problems_completed_json` appended
- localStorage `fa_completed_projects` (legacy)
- localStorage `fraylon_xp` +20, `fraylon_completed_actions`, `fraylon_stats`

**Components depending on this data:** `LecturePage.tsx` (problem status icons, completion), `ProgressWidget.tsx` (problems count), `CoursePage.tsx` (progress bar), `Dashboard.tsx` (stats)

---

### 1.4 User Completes a Quiz

**File:** `frontend/src/pages/QuizPage.tsx` (line 89) / `frontend/src/pages/LecturePage.tsx` (line 454)
**Function called:** `markQuizCompleted(score, total)`

```
QuizPage.tsx / LecturePage.tsx
  └─ useProgress().markQuizCompleted(score, total)
       ├─ updateProgress() → quizScore = score, quizCompleted = true
       ├─ POST /api/progress/lecture/quiz  (fire-and-forget)
       ├─ if score/total >= 0.6:
       │    import('../progress').then(m => m.completeAction('quiz', ...))
       │         ├─ awardXp(30, 'Quiz Passed')
       │         └─ checkAchievements()
       └─ Also: saveCompletedQuiz(slug, lectureNum, score) → localStorage 'fa_completed_quizzes' (legacy)
```

**Data updated:**
- In-memory cache: `quizCompleted: true`, `quizScore: score`
- Backend SQLite: `lecture_progress.quiz_completed`, `lecture_progress.quiz_score`
- localStorage `fa_completed_quizzes` (legacy)
- localStorage `fraylon_xp` +30, `fraylon_completed_actions`, `fraylon_stats`

**Components depending on this data:** `LecturePage.tsx` (quiz badge/score), `ProgressWidget.tsx` (quiz indicator), `CoursePage.tsx` (quiz completed flag)

---

### 1.5 User Completes a Lecture

**File:** `frontend/src/pages/LecturePage.tsx` (line 700–701)
**Function called:** `markLectureCompleted()` (via SummaryCard `onNext`)

```
LecturePage.tsx (SummaryCard.onNext)
  └─ tryAutoCompleteLecture(...)  [runs check]
  └─ useProgress().markLectureCompleted()
       ├─ updateProgress() → lectureCompleted = true, handsOnTaskCompleted = true
       ├─ POST /api/progress/lecture/complete  (fire-and-forget)
       └─ import('../progress').then(m => m.completeAction('lecture', ...))
            ├─ awardXp(50, 'Full Lecture Completed')
            └─ checkAchievements()
```

**Auto-completion** (via `checkLectureCompletion` at `useProgress.ts:89–114`):
```js
conditions: allSectionsVisited && quizDone && problemsDone && projectDone && summaryReached
```

**Data updated:**
- In-memory cache: `lectureCompleted: true`, `handsOnTaskCompleted: true`
- Backend SQLite: `lecture_progress.lecture_completed`, `lecture_progress.hands_on_task_completed`
- localStorage `fraylon_xp` +50, `fraylon_stats.lecturesCompleted++`
- Event `lms:progress-change` dispatched (triggers `CoursePage.tsx` re-render)

**Components depending on this data:** `LecturePage.tsx` (lecture complete state), `CoursePage.tsx` (lecture status/lock), `Dashboard.tsx` (stats), `LessonSidebar.tsx` (unlock status)

---

## 2. API Impact Analysis

### All Files Reading/Writing Progress Data

#### `frontend/src/hooks/useProgress.ts` (401 lines)
| What it does | Read from DB? | Write to DB? | Complexity |
|---|---|---|---|
| In-memory cache of `LectureProgress` per `(courseSlug, lectureNumber)` | Already reads via `GET /progress/lecture/:slug/:num` on mount | Already writes via individual POST endpoints | **Low** — already DB-backed, needs cache removal |
| `writeCache()` dispatches `lms:progress-change` event | N/A | N/A | **Low** — event pattern can remain |
| `checkLectureCompletion()` auto-completes lectures | No — reads cache | No — writes cache | **Medium** — needs to become DB-aware |
| `markSectionVisited()` — dual-writes to cache + backend | N/A | Already writes POST | **Low** |
| `markPracticeAttempted/Completed()` — cache only | N/A | No backend call exists | **Medium** — needs new API or merge with section |
| `markQuizCompleted()` — dual-writes | N/A | Already writes POST | **Low** |
| `markProblemCompleted()` — dual-writes | N/A | Already writes POST | **Low** |
| `markLectureCompleted()` — dual-writes | N/A | Already writes POST | **Low** |
| `getCourseProgress()` — reads cache | No (reads cache) | No | **High** — data may be stale from cache |
| `getCourseStats()` — reads cache | No (reads cache) | No | **High** — data may be stale from cache |
| `isLectureUnlocked()` — reads cache | No (reads cache) | No | **Low** — logic stays, just change data source |
| `subscribeToProgressChanges()` — custom event | N/A | N/A | **Low** — event stays |
| `markProjectCompletedDirect()` — reads/writes cache | No | No (called from coding project page) | **Medium** — should call backend |

#### `frontend/src/api.ts` (766 lines)
| What it does | Read from DB? | Write to DB? | Complexity |
|---|---|---|---|
| `getCompletedProjects()` — reads `fa_completed_projects` (legacy) | No | No | **Low** — deprecated, remove |
| `saveCompletedProject()` — writes `fa_completed_projects` (legacy) | No | No | **Low** — deprecated, remove |
| `getCompletedQuizzes()` — reads `fa_completed_quizzes` (legacy) | No | No | **Low** — deprecated, remove |
| `saveCompletedQuiz()` — writes `fa_completed_quizzes` (legacy) | No | No | **Low** — deprecated, remove |
| `getStreak()` — reads `fa_streak_*` (legacy) | No | No | **Low** — deprecated, remove |
| `updateStreak()` — writes `fa_streak_*` (legacy) | No | No | **Low** — deprecated, remove |
| `getTotalXp()` — reads `fa_total_xp` (legacy) | No | No | **Low** — deprecated, remove |
| `addXp()` — writes `fa_total_xp` (legacy) | No | No | **Low** — deprecated, remove |
| `getSubmissionHistory()` — reads `fa_submission_history` | No | No | **Medium** — used by `Dashboard.tsx` heatmap |
| `recordSubmission()` — writes `fa_submission_history` | No | No | **Low** — deprecated, remove |
| `getDailyMissions()` — reads `fa_daily_missions_<date>` | No | No | **Low** — deprecated, remove |
| `updateDailyMissions()` — writes localStorage | No | No | **Low** — deprecated, remove |

#### `frontend/src/progress.ts` (306 lines) — Fraylon Gamification
| What it does | Read from DB? | Write to DB? | Complexity |
|---|---|---|---|
| `getTotalXp()` — reads `fraylon_xp` | No | No | **High** — needs backend XP integration |
| `getUnlockedAchievements()` — reads `fraylon_achievements` | No | No | **High** — needs backend achievements table |
| `getStreakData()` — reads `fraylon_streak` | No | No | **Medium** — backend already computes streak |
| `getStats()` — reads `fraylon_stats` | No | No | **High** — needs backend summary endpoint |
| `completeAction()` — awards XP, updates stats | No | No | **High** — needs backend API for XP/achievements |
| `awardXp()` — writes `fraylon_xp` | No | No | **High** — migrate to backend XP system |
| `checkAchievements()` — localStorage | No | No | **High** — migrate to backend achievements |
| `useGamification()` — React hook, reads all of above | No | No | **High** — must read from backend summary API |

#### `backend/src/routes/progress.ts` (191 lines)
| What it does | Read from DB? | Write to DB? | Complexity |
|---|---|---|---|
| `GET /api/progress/me` — full summary | Yes (SQLite) | No | **Low** — already works |
| `GET /api/progress/lecture/:slug/:num` — single lecture | Yes (SQLite) | No | **Low** — already works |
| `POST /api/progress/lecture/section` — mark visited | No | Yes (SQLite) | **Low** — already works |
| `POST /api/progress/lecture/quiz` — record quiz | No | Yes (SQLite) | **Low** — already works |
| `POST /api/progress/lecture/problem` — mark problem done | No | Yes (SQLite) | **Low** — already works |
| `POST /api/progress/lecture/complete` — mark lecture done | Yes (reads to validate) | Yes (SQLite) | **Low** — already works (but missing `project` check) |
| `POST /api/progress/project` — project submission | No | Yes (SQLite) | **Low** — already works |
| `GET /api/progress/leaderboard` — top 20 | Yes (SQLite) | No | **Low** — already works |

---

## 3. Frontend Refactor Scope

### 3.1 Hooks That Need Modification

| Hook | File | Changes Required |
|---|---|---|
| `useProgress` | `frontend/src/hooks/useProgress.ts` | Remove in-memory cache as source of truth; make backend API the single source; keep `lms:progress-change` event for reactivity; remove `readAll()`/`writeAll()` references (lines 372–385 have dead code) |
| `useGamification` | `frontend/src/progress.ts` | Replace localStorage reads with backend `GET /api/progress/me` summary; keep as a consumer hook only |

### 3.2 Components That Need Modification

| Component | File | Changes Required |
|---|---|---|
| `LecturePage.tsx` | `frontend/src/pages/LecturePage.tsx` | `tryAutoCompleteLecture` calls (lines 226, 238, 409, 458, 500) — these use cache; need DB-based equivalent or backend-calculated status |
| `CoursePage.tsx` | `frontend/src/pages/CoursePage.tsx` | Replace `getCourseProgress()` (cache) with backend `GET /api/progress/me?courseSlug=X`; remove `getCompletedProjects()` |
| `Dashboard.tsx` | `frontend/src/pages/Dashboard.tsx` | Replace `getCourseStats()` + `useGamification()` with single backend summary; remove `getSubmissionHistory()` for heatmap (needs new endpoint) |
| `QuizPage.tsx` | `frontend/src/pages/QuizPage.tsx` | Minimal change — already uses `markQuizCompleted` which calls backend |
| `CodingProjectPage.tsx` | `frontend/src/pages/CodingProjectPage.tsx` | Remove `saveCompletedProject()` (localStorage); replace `markProjectCompletedDirect` with backend API call |
| `InteractiveProjectPage.tsx` | `frontend/src/pages/InteractiveProjectPage.tsx` | Same as `CodingProjectPage.tsx` |
| `ProjectPage.tsx` | `frontend/src/pages/ProjectPage.tsx` | Remove `getCompletedProjects()` usage (line 4, 17, 23, 45, 81) |
| `ProgressWidget.tsx` | `frontend/src/components/lesson/ProgressWidget.tsx` | Already receives `progress` as prop — no change needed if data source changes upstream |
| `LessonSidebar.tsx` | `frontend/src/components/lesson/LessonSidebar.tsx` | Already receives `progress` as prop — no change needed |
| `SummaryCard.tsx` | `frontend/src/components/lesson/SummaryCard.tsx` | Purely presentational — no change needed |

### 3.3 Functions That Need Modification

| Function | File | Changes Required |
|---|---|---|
| `readCache()` / `writeCache()` | `frontend/src/hooks/useProgress.ts` | Remove — backend is single source of truth |
| `defaultProgress()` | `frontend/src/hooks/useProgress.ts` | Keep as fallback for unauthenticated users |
| `checkLectureCompletion()` | `frontend/src/hooks/useProgress.ts` | Migrate to backend-only (already validated in `POST /lecture/complete` route) |
| `getCourseProgress()` | `frontend/src/hooks/useProgress.ts` | Replace with backend `GET /api/progress/me` |
| `getCourseStats()` | `frontend/src/hooks/useProgress.ts` | Replace with backend summary response |
| `completeAction()` | `frontend/src/progress.ts` | Replace with backend-managed XP/achievements |
| `awardXp()` | `frontend/src/progress.ts` | Move to backend, fire via API |
| `handleDailyLogin()` | `frontend/src/progress.ts` | Move to backend streak system |
| All `fa_*` functions | `frontend/src/api.ts` | Remove entirely (already marked deprecated) |

### 3.4 Custom Events Currently Used

| Event | Dispatched In | Listened By | Action |
|---|---|---|---|
| `lms:progress-change` | `writeCache()` in `useProgress.ts` | `useProgress()` hook, `subscribeToProgressChanges()` in `CoursePage.tsx`, `Dashboard.tsx` | **Keep** — but dispatch after successful backend API response instead of cache write |
| `fraylon:progress:update` | `emit()` in `progress.ts` | `useGamification()` hook | **Keep** — but back it by backend data |
| `fa:logout` | `authClient.ts` | Auth flow | Unrelated — keep |
| `storage` (native) | Browser (other tabs) | `useProgress()` hook | **Keep** — cross-tab sync |

---

## 4. LocalStorage Removal Plan

### Phase 1: Current State (Dual-write, cache as source of truth)

```
User Action
  │
  ├─► useProgress.ts: updateCache() ──► dispatchEvent('lms:progress-change')
  │       │
  │       └─► Components re-render from cache
  │
  ├─► POST /api/progress/* (fire-and-forget, errors swallowed)
  │
  └─► progress.ts: localStorage (fraylon_*) ──► dispatchEvent('fraylon:progress:update')
```

**localStorage keys still in use:**
- `fraylon_xp`, `fraylon_xp_history`, `fraylon_completed_actions`
- `fraylon_achievements`, `fraylon_streak`, `fraylon_stats`, `fraylon_overall_progress`
- `fa_completed_projects`, `fa_completed_quizzes`, `fa_total_xp`
- `fa_streak_count`, `fa_last_submission_date`, `fa_submission_history`
- `fa_daily_missions_<date>`, `fa_chat`
- `fa_code_<projectId>` (code drafts — keep, separate concern)

### Phase 2: Temporary Hybrid (DB writes, cache reads, localStorage fallback)

**Changes:**
1. Make backend `POST` calls await instead of fire-and-forget — use response to update cache
2. `checkLectureCompletion()` calls the backend to validate + get authoritative result
3. `readCache()` becomes a loading state + backend response cache (not source of truth)
4. `getCourseProgress()`/`getCourseStats()` call `GET /api/progress/me` instead of reading cache
5. `getTotalXp()` in `progress.ts` reads from backend `/api/progress/me` response
6. `completeAction()` still awards XP client-side but also calls `POST /api/progress/xp/award`

**Risks in this phase:**
- **Performance:** Every page load fetches progress from backend — add loading skeletons
- **Offline:** No offline progress tracking (all data now requires backend)
- **Race conditions:** Parallel `POST` requests could produce stale `sections_json` merges — the backend `upsertLectureProgress` already handles `JSON` merge correctly
- **Dashboard heatmap:** `getSubmissionHistory()` reads localStorage — needs new `GET /api/progress/activity-history` endpoint

### Phase 3: Final State (DB-only)

**Changes:**
1. Remove `readCache()`/`writeCache()` entirely from `useProgress.ts` — keep only `fetchLectureProgress()` as the data source
2. Remove all `fa_*` localStorage keys from `frontend/src/api.ts`
3. Remove `fraylon_*` localStorage keys from `frontend/src/progress.ts`
4. `progress.ts` becomes a thin consumer that only reads from backend summary API
5. `Dashboard.tsx` fetches activity history from backend for the heatmap
6. `useProgress()` hook becomes: fetch from backend → cache response in React state → re-render on `lms:progress-change`

**Remaining localStorage (not progress-related):**
- `fa_token` — auth token (keep)
- `fa_code_<projectId>` — code drafts (keep, separate concern)
- `fa_chat` — chat history (keep, separate concern)

---

## 5. Recommended API Endpoints

### 5.1 Existing Endpoints (already working, may need minor adjustments)

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| `GET` | `/api/progress/me?courseSlug=xx` | ✅ Working | Returns `ProgressSummary` — `lectureProgress` array may need pagination for many lectures |
| `GET` | `/api/progress/lecture/:slug/:num` | ✅ Working | Returns `{ progress: LectureProgressRecord }` |
| `POST` | `/api/progress/lecture/section` | ✅ Working | Request: `{ courseSlug, lectureNumber, sectionId, lastSection? }` |
| `POST` | `/api/progress/lecture/quiz` | ✅ Working | Request: `{ courseSlug, lectureNumber, score, total }` |
| `POST` | `/api/progress/lecture/problem` | ✅ Working | Request: `{ courseSlug, lectureNumber, problemId }` |
| `POST` | `/api/progress/lecture/complete` | ⚠️ Needs fix | Validation missing `project` check (frontend checks `projectDone`, backend doesn't) |
| `POST` | `/api/progress/project` | ✅ Working | Request: `{ courseSlug, projectId }` |
| `GET` | `/api/progress/leaderboard` | ✅ Working | Returns `{ leaderboard: [...] }` |

### 5.2 Endpoints That Need Minor Fixes

**`POST /api/progress/lecture/complete`** — Update validation to include `hasProject` check:
```typescript
const lectureCompleteSchema = lectureBaseSchema.extend({
  totalSections: z.number().int().min(0),
  totalProblems: z.number().int().min(0),
  hasQuiz: z.boolean(),
  hasProject: z.boolean(),  // ADD THIS
});
```
And in the handler, add:
```typescript
const projectDone = !body.hasProject || progress.projectCompleted || progress.handsOnTaskCompleted;
if (sectionsVisited < body.totalSections || !quizDone || !problemsDone || !projectDone) {
  // reject
}
```

### 5.3 New Endpoints Needed

| Method | Path | Purpose | Request | Response |
|--------|------|---------|---------|----------|
| `POST` | `/api/progress/practice` | Record practice completion | `{ courseSlug, lectureNumber, sectionId }` | `{ progress }` |
| `POST` | `/api/progress/xp/award` | Award XP (for `progress.ts` migration) | `{ amount, reason, actionId }` | `{ totalXp }` |
| `POST` | `/api/progress/achievement/unlock` | Unlock achievement | `{ achievementId }` | `{ ok }` |
| `GET` | `/api/progress/activity-history?days=365` | Daily activity for heatmap | Query: `days` (optional) | `{ dates: Record<string, number> }` |
| `GET` | `/api/progress/xp-history` | XP transaction log | — | `{ transactions: [...] }` |
| `POST` | `/api/progress/daily-login` | Record daily login / streak | — | `{ streak: number, xpAwarded: number }` |
| `POST` | `/api/progress/section/practice` | Mark practice in section (alternative to separate endpoint) | `{ courseSlug, lectureNumber, sectionId, practiced: boolean, completed: boolean }` | `{ progress }` |

### 5.4 Endpoint Consolidation Recommendation

Instead of adding many separate endpoints, consider enhancing the section endpoint:

**`POST /api/progress/lecture/section`** (enhanced):
```typescript
// Request
{
  courseSlug: string;
  lectureNumber: number;
  sectionId: string;
  visited?: boolean;      // default true
  practiceAttempted?: boolean;
  practiceCompleted?: boolean;
  lastSection?: string;
}
// Response
{
  progress: LectureProgressRecord;
  autoCompleted?: boolean;  // did this trigger lecture auto-completion?
}
```

This eliminates the need for a separate practice endpoint and reduces round-trips.

### 5.5 Summary API Enhancement

**`GET /api/progress/me`** (enhance response):
```typescript
{
  // Existing fields:
  lecturesCompleted: number;
  quizzesPassed: number;
  problemsSolved: number;
  projectsCompleted: number;
  xp: number;
  streak: number;
  lectureProgress: LectureProgressRecord[];

  // New fields:
  totalXp: number;                    // replaces fraylon_xp
  unlockedAchievements: string[];     // replaces fraylon_achievements
  longestStreak: number;
  xpHistory?: XpTransaction[];
  activityHistory?: Record<string, number>;  // for heatmap
}
```

---

## 6. Migration Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| **In-memory cache is source of truth** — components render from cache, not backend | High | Phase 2: After each POST, update cache from backend response. Then Phase 3: remove cache entirely |
| **`checkLectureCompletion()` runs on stale cache data** — DB may have more recent data | Medium | Move auto-completion logic to backend entirely; frontend calls `POST /lecture/complete` which validates on DB |
| **Fire-and-forget POSTs swallow errors** — user thinks data saved but it didn't | Medium | Make POSTs await; show error toast on failure |
| **Backend `lecture_progress.sections_json` merge is append-only** — no `practiceAttempted`/`practiceCompleted` in backend | Medium | Add `practiceAttempted`/`practiceCompleted` to section merge logic in `upsertLectureProgress()` |
| **Dashboard heatmap relies on localStorage** — no backend endpoint for activity history | Medium | Implement `GET /api/progress/activity-history` |
| **`progress.ts` gamification (fraylon) is entirely client-side** — data lost on logout/clear | High | Migrate XP/achievements/stats to backend; use `GET /api/progress/me` as single source |
| **Concurrent POST race conditions** — multiple tabs writing different sections | Low | Backend `upsertLectureProgress` already merges `sections_json` and `problems_completed_json` |
| **LecturePage.tsx still reads `progress.problemsCompleted.includes()` from cache** | Low | Once `useProgress` reads from backend, this resolves automatically |
| **Unlock logic uses cached `getCourseProgress()`** — stale lecture status | Medium | `getCourseProgress()` must be replaced with backend call; cache with short TTL |
| **Existing users have localStorage progress data** — migration will orphan it | Low | Acceptable — backend already has data for authenticated users who've used the app |
| **No offline support** — all progress requires authenticated backend calls | Low | Acceptable — app is online-only (auth required anyway) |

---

## 7. Implementation Estimate

| Area | Files | Estimated Effort |
|------|-------|------------------|
| **Backend route fixes** | `backend/src/routes/progress.ts` | 2–3 hours |
| **Backend service additions** (practice, XP, achievements, activity history) | `backend/src/services/progressService.ts`, `backend/src/routes/progress.ts`, `backend/src/db.ts` | 4–6 hours |
| **`useProgress.ts` refactor** — remove cache, make backend single source | `frontend/src/hooks/useProgress.ts` | 3–4 hours |
| **`progress.ts` migration** — replace localStorage with backend API | `frontend/src/progress.ts` | 3–4 hours |
| **`api.ts` cleanup** — remove deprecated `fa_*` functions | `frontend/src/api.ts` | 1 hour |
| **Component updates** — `Dashboard.tsx`, `CoursePage.tsx`, `LecturePage.tsx` | 3 files | 3–4 hours |
| **Component cleanup** — `ProjectPage.tsx`, `CodingProjectPage.tsx`, `InteractiveProjectPage.tsx` | 3 files | 2 hours |
| **Testing** — backend + frontend | `backend/tests/progress.test.ts`, manual QA | 2–3 hours |
| **Total** | ~12 files | **20–27 hours** |

---

## 8. Summary of Changes

### What Will Change
- `useProgress.ts` — remove in-memory cache as source of truth; use backend API exclusively
- `progress.ts` — convert from localStorage-based gamification to consumer of backend API
- `api.ts` — remove all deprecated `fa_*` progress functions
- `LecturePage.tsx` — update `tryAutoCompleteLecture` to work with backend validation
- `CoursePage.tsx` — use backend summary API instead of `getCourseProgress()`
- `Dashboard.tsx` — use backend data for heatmap, stats, and gamification
- `CodingProjectPage.tsx` / `InteractiveProjectPage.tsx` — remove `saveCompletedProject()`

### What APIs Are Required
- 7 existing endpoints (1 with minor fix)
- 2–3 new endpoints (activity history, enhanced section update)
- 1 enhanced endpoint (`GET /api/progress/me` with XP/achievements)

### What localStorage Dependencies Will Be Removed
- `fraylon_xp`, `fraylon_xp_history`, `fraylon_completed_actions`
- `fraylon_achievements`, `fraylon_streak`, `fraylon_stats`, `fraylon_overall_progress`
- `fa_completed_projects`, `fa_completed_quizzes`, `fa_total_xp`
- `fa_streak_count`, `fa_last_submission_date`, `fa_submission_history`
- `fa_daily_missions_<date>`

### What localStorage Will Remain
- `fa_token` — auth (keep)
- `fa_code_<projectId>` — code editor drafts (keep)
- `fa_chat` — mentor chat history (keep)

### Potential Risks Before Development
1. **Dashboard heatmap has no backend equivalent** — needs new endpoint or the heatmap breaks
2. **Backend `lecture_progress` doesn't track `practiceAttempted`/`practiceCompleted`** — needs schema/merge update
3. **`POST /lecture/complete` validation doesn't check `hasProject`** — frontend skips this check mismatch
4. **Concurrent request race on `sections_json`** — the upsert replaces the entire JSON, not merge individual section fields → must fix merge to be field-level not key-level
5. **No loading states for backend progress fetches** — add skeleton/spinner to avoid flash-of-default-data
