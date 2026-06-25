# Content Studio — Architecture & Redesign Proposal

**Date:** June 24, 2026
**Status:** Design proposal — not yet implemented
**Goal:** Transform the Admin from an operator into a content creator

---

## Executive Summary

The current Content Management architecture was designed for two hand-crafted courses (Python, CS50AI). Content is stored as flat JSON files on disk, course structure is defined by hardcoded TypeScript constants, and there is no blueprint or scaffolding system.

The Content Studio redesign moves all content into the database, introduces first-class Blueprint entities for rapid course generation, creates a visual Learning Flow Builder, implements a publishing lifecycle (Draft → Beta → Published → Archived), and automates all operational tasks (certifications, project approval, eligibility) so the admin only creates content.

---

## 1. Current Architecture Problems

| Problem | Impact |
|---|---|
| Content stored as files on disk (`frontend/public/data/`) | Not portable to serverless/multi-replica deployments. Admin edits don't persist in ephemeral environments. |
| Course structure defined by hardcoded TypeScript constants (`COURSE_LECTURE_COUNTS`, `COURSE_PROBLEM_COUNTS`) | Adding a course requires a code deploy. Constants must be updated manually or things break. |
| No blueprint/template system | Each lecture must be manually assembled from scratch. No reuse of proven learning structures. |
| No course lifecycle states | No Draft/Beta/Published workflow. Courses are either visible or not. No controlled rollout. |
| No content versioning | Admin overwrites content files directly. No audit trail, no rollback. |
| Admin manually reviews all projects | Doesn't scale to 1000+ students. Projects with passing validation should auto-approve. |
| Certificate issuance requires manual admin trigger | Doesn't scale. Eligibility is deterministic — should be fully automatic. |
| Two separate content systems (filesystem for courses, DB for projects) | Fragmented architecture. Admin must work in two systems. |
| Admin automations page requires button clicks | Should be event-driven, not admin-triggered. |

---

## 2. Content Studio Architecture

### 2.1 High-Level Structure

```
Content Studio
│
├── Course Library          ← All courses, any status
├── Blueprint Library       ← Reusable learning structure templates
├── Draft Courses           ← Not yet visible to students
├── Beta Courses            ← Visible with "under construction" banner
├── Published Courses       ← Official, fully available
└── Archived Courses        ← No new enrollments, existing students retain access
```

### 2.2 Course Lifecycle

```
Draft ──→ Beta ──→ Published ──→ Archived
  │          │          │             │
  │          │          │             └── Can be re-published
  │          │          │
  │          │          └── Can be sent back to Draft for edits
  │          │
  │          └── Students see "🚧 Beta" banner, can enroll, content may change
  │
  └── Only visible to Admin in Content Studio
```

### 2.3 Core Principle: Admin Creates Content, System Does Everything Else

| Activity | Who | How |
|---|---|---|
| Create/edit courses | **Admin** | Content Studio UI |
| Create/edit blueprints | **Admin** | Blueprint Library UI |
| Create/edit content blocks | **Admin** | Course Editor (rich text + block editor) |
| Track student progress | **System** | Automatic via student actions |
| Validate projects | **System** | AI + constraint-based auto-validation |
| Approve capstones | **System** | AI evaluation against defined rules |
| Check certification eligibility | **System** | Automatic on every progress event |
| Issue certificates | **System** | Event-driven when all conditions met |
| Update analytics | **System** | Real-time aggregation queries |
| Monitor student activity | **System** | Review Queue auto-populates |
| Send notifications | **System** | Event-driven on milestones |
| Update leaderboards | **System** | Real-time from XP data |
| Detect at-risk students | **System** | Review Queue auto-populates |

---

## 3. Blueprint System

### 3.1 What a Blueprint Defines

A Blueprint is a reusable learning structure template. It defines the structural skeleton of a course without content.

```typescript
interface Blueprint {
  id: string;              // e.g., "python-standard", "ai-standard", "blank"
  name: string;            // "Python Standard", "AI Standard"
  description: string;
  blocks: BlueprintBlock[];// Ordered list of block types per lecture
  defaultLectureCount: number;
  completionRules: CompletionRuleConfig;
  category: string;        // "programming", "ai", "general"
}
```

### 3.2 Blueprint Block Types

Each lecture in a blueprint is composed of blocks. These map directly to the existing lesson.json block types plus course-level constructs:

| Block Type | Description | Required Fields |
|---|---|---|
| `lecture` | Lecture content (sections + blocks) | Sections array |
| `practice` | Practice exercise (AI or Coding) | Type: "ai" \| "coding" |
| `quiz` | Quiz with questions | Question count |
| `problems` | Coding problems | Problem count |
| `assessment` | Subsection assessment | Category, subsection ref |
| `project` | Project assignment | Project template ref |

### 3.3 Built-in Blueprints

**Python Blueprint** (14 lectures):
```
Lecture → Practice → Quiz → Problems → [Project]
```

**AI Blueprint** (10 lectures):
```
Lecture → AI Practice → Quiz → Assessment → [Project]
```

**Blank Blueprint**:
```
Lecture (admin adds blocks manually)
```

### 3.4 Blueprint Generation

When an admin creates a course from a blueprint:
1. Blueprint blocks are cloned into the course
2. Each lecture gets empty content containers based on the block types
3. Admin fills in content using the Course Editor
4. The blueprint remains unchanged — it is reusable for future courses

---

## 4. Database Schema Changes

### 4.1 New Models

```prisma
// ── Blueprint ─────────────────────────────────────────────
model Blueprint {
  id          String   @id @default(uuid())
  name        String
  description String   @default("")
  category    String   @default("general")   // programming, ai, general
  isBuiltIn   Boolean  @default(false)        // system blueprints cannot be deleted

  // Blocks define the lecture structure
  blocks      BlueprintBlock[]

  // Default settings when applied to a new course
  defaultLectureCount Int     @default(10)
  completionRules     Json?   // CompletionRuleConfig

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model BlueprintBlock {
  id          String   @id @default(uuid())
  blueprintId String
  blueprint   Blueprint @relation(fields: [blueprintId], references: [id], onDelete: Cascade)

  sortOrder   Int      // position in the lecture
  blockType   String   // "lecture" | "practice" | "quiz" | "problems" | "assessment" | "project"
  config      Json?    // type-specific config (e.g., practice type: "ai"|"coding", question count)

  @@unique([blueprintId, sortOrder])
}

// ── Course (replacing filesystem storage) ─────────────────
model Course {
  id          String   @id @default(uuid())
  slug        String   @unique
  title       String
  description String   @default("")
  thumbnail   String?  // URL or uploaded asset

  difficulty  String   @default("beginner")  // beginner, intermediate, advanced
  category    String   @default("programming")
  language    String   @default("Python")
  estimatedDuration String?  // e.g., "8 weeks", "self-paced"

  status      String   @default("draft")     // draft, beta, published, archived
  blueprintId String?
  blueprint   Blueprint? @relation(fields: [blueprintId], references: [id])

  // Publishing
  publishedAt DateTime?
  betaAt      DateTime?
  archivedAt  DateTime?

  // Completion rules (can override blueprint defaults)
  completionRules Json?

  lectures    CourseLecture[]
  enrollments CourseEnrollment[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// ── Course Lecture (replacing lectures.json + lecture_N/ directories) ──
model CourseLecture {
  id          String   @id @default(uuid())
  courseId     String
  course       Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)

  number      Int      // position in the course
  title       String
  slug        String?  // URL-friendly identifier

  // Content stored as JSON — flexible like filesystem but queryable
  lesson      Json?    // full lesson.json content (sections, blocks)
  quiz        Json?    // quiz questions array
  problems    Json?    // problems array
  projectRef  String?  // references a ProjectTemplate id

  // Practice exercise relationship
  practiceExerciseId String?
  practiceExercise   PracticeExercise? @relation(fields: [practiceExerciseId], references: [id])

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([courseId, number])
}

// ── Course Enrollment ─────────────────────────────────────
model CourseEnrollment {
  id         String   @id @default(uuid())
  userId     String
  courseId    String
  course     Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  enrolledAt DateTime @default(now())
  droppedAt  DateTime?

  @@unique([userId, courseId])
}
```

### 4.2 Changes to Existing Models

```prisma
// ── IssuedCertificate ── (already updated with status/revoke fields)
// NO CHANGE needed — already has status, revokedAt, revokeReason, metadata

// ── Progress ──
// Add courseId foreign key (currently uses string courseSlug)
model Progress {
  // ... existing fields ...
  courseId    String?  // NEW: link to Course table
  course      Course?  @relation(fields: [courseId], references: [id])

  // Keep courseSlug for backward compatibility during migration
}

// ── LectureProgress ──
// Add courseId + lectureId foreign keys
model LectureProgress {
  // ... existing fields ...
  courseId    String?
  course      Course?       @relation(fields: [courseId], references: [id])
  lecture     CourseLecture? @relation(fields: [courseId, lectureId], references: [courseId, number])
}

// ── AssessmentProgress ──
// Add assessment configuration support for course-linked assessments
// Assessor for auto-evaluation
model AssessmentConfig {
  id            String   @id @default(uuid())
  courseId       String?
  course         Course?  @relation(fields: [courseId], references: [id])
  lectureId      String?
  lecture        CourseLecture? @relation(fields: [lectureId], references: [id])

  category      String
  subsection    String
  passingScore  Int      @default(60)  // percentage
  maxAttempts   Int?     // null = unlimited
  aiEvaluated   Boolean  @default(false)

  // AI evaluation rules
  evaluationPrompt String?  // system prompt for AI grader
  evaluationRules  Json?    // [string] constraint list
}
```

### 4.3 Migration Strategy

**Phase 1 — Dual-write (backward compatible):**
- New Course model is created alongside existing filesystem
- Admin Content Studio writes to DB **and** syncs to filesystem
- Student API reads from DB first, falls back to filesystem

**Phase 2 — Cutover:**
- All content migrated from filesystem to DB
- Filesystem becomes read-only, then removed
- `COURSE_LECTURE_COUNTS` and `COURSE_PROBLEM_COUNTS` removed — computed from DB

**Phase 3 — Cleanup:**
- Filesystem content directories removed from repo
- `adminContent.ts` routes updated to use DB exclusively
- Old progress records migrated from `courseSlug` strings to `courseId` foreign keys

---

## 5. API Changes

### 5.1 New Content Studio Endpoints

```
# Blueprints
GET    /api/admin/studio/blueprints            # List all blueprints
POST   /api/admin/studio/blueprints            # Create blueprint
GET    /api/admin/studio/blueprints/:id        # Get blueprint with blocks
PUT    /api/admin/studio/blueprints/:id        # Update blueprint
DELETE /api/admin/studio/blueprints/:id        # Delete (non-built-in only)
POST   /api/admin/studio/blueprints/:id/duplicate  # Clone blueprint

# Courses (DB-backed, replaces filesystem CRUD)
GET    /api/admin/studio/courses               # List all courses with status filter
POST   /api/admin/studio/courses               # Create course (requires blueprintId)
GET    /api/admin/studio/courses/:id           # Full course with lectures
PUT    /api/admin/studio/courses/:id           # Update course metadata
DELETE /api/admin/studio/courses/:id           # Delete course

# Course Lifecycle
POST   /api/admin/studio/courses/:id/publish   # Draft → Beta or Beta → Published
POST   /api/admin/studio/courses/:id/archive   # Published → Archived
POST   /api/admin/studio/courses/:id/unarchive # Archived → Published
POST   /api/admin/studio/courses/:id/duplicate # Clone entire course

# Lectures
GET    /api/admin/studio/courses/:id/lectures           # List lectures
POST   /api/admin/studio/courses/:id/lectures           # Add lecture (with blueprint block type)
PUT    /api/admin/studio/courses/:id/lectures/:num      # Update lecture metadata
DELETE /api/admin/studio/courses/:id/lectures/:num      # Delete lecture
PUT    /api/admin/studio/courses/:id/lectures/reorder   # Reorder lectures

# Lecture Content
GET    /api/admin/studio/courses/:id/lectures/:num/lesson   # Get lesson content
PUT    /api/admin/studio/courses/:id/lectures/:num/lesson   # Save lesson content
GET    /api/admin/studio/courses/:id/lectures/:num/quiz     # Get quiz
PUT    /api/admin/studio/courses/:id/lectures/:num/quiz     # Save quiz
GET    /api/admin/studio/courses/:id/lectures/:num/problems # Get problems
PUT    /api/admin/studio/courses/:id/lectures/:num/problems # Save problems

# Learning Flow Builder
GET    /api/admin/studio/courses/:id/flow       # Get current block structure
PUT    /api/admin/studio/courses/:id/flow       # Save modified flow (blocks reordered)
```

### 5.2 Automation Endpoints (System, Not Admin)

```
# Auto-certification (event-driven, no admin trigger)
POST /api/system/check-eligibility             # Internal: called on progress events
POST /api/system/issue-certificate             # Internal: called when eligible

# Auto-project validation
POST /api/system/validate-project              # Internal: AI evaluation of project submission
POST /api/system/evaluate-capstone             # Internal: AI evaluation of capstone

# Scheduled jobs (internal, non-admin-facing)
GET  /api/system/jobs/issue-pending-certificates  # Cron: retry failed issuances
GET  /api/system/jobs/suspend-inactive            # Cron: auto-suspend after 30d
GET  /api/system/jobs/send-reminders              # Cron: at-risk/behind notifications
```

### 5.3 Student-Facing Changes

```
# Courses — now reads from DB
GET  /api/courses              # List published courses (was filesystem)
GET  /api/courses/:slug        # Course detail with lectures (was filesystem)
GET  /api/courses/:slug/lecture/:num  # Single lecture content (was filesystem)

# Enrollment
POST /api/courses/:slug/enroll  # Student enrolls in a course
GET  /api/courses/:slug/enrollment  # Check enrollment status

# Course status flags returned in course data
{ "status": "published" | "beta", "isBeta": true/false }
```

---

## 6. Automation Architecture

### 6.1 Event-Driven Pipeline

Instead of admin clicking buttons, the system reacts to domain events:

```
Student completes lecture
  → XP awarded (existing)
  → Check if all lectures done (new: event)
  → If yes → Check eligibility (new: event)
  → If eligible → Issue certificate (new: automatic)

Student submits project
  → AI evaluates against constraints (new)
  → If pass → Auto-approve, award XP (new)
  → If fail → Notify student with feedback (new)

Student submits capstone
  → AI evaluates against rules (existing client-side + new server-side)
  → If pass → Auto-approve, mark course complete (new)
  → If fail → Notify student with specific feedback (improved)

Daily cron:
  → Suspend students inactive >30 days (existing, automated)
  → Retry failed certificate issuances (new)
  → Send at-risk notifications (improved)
```

### 6.2 Project Auto-Validation

Replace manual admin review with AI-based evaluation:

```
Student submits project (PATCH /projects/:projectId/complete)
  → Project status → "PENDING_VALIDATION" (not PENDING_REVIEW)
  → System calls AI evaluator with:
      - Project specification (from ProjectTemplate)
      - Student's submission (githubUrl, description, code)
      - Validation rules (from template)
  → AI returns: { passed: boolean, feedback: string, score: number }
  → If passed:
      - Status → "COMPLETED"
      - XP awarded (150)
      - Notification sent
      - Check course completion → check certification
  → If failed:
      - Status → "NEEDS_REVISION"
      - Feedback shared with student
      - Student can resubmit (up to N attempts)
```

### 6.3 Capstone AI Evaluation (Server-Side)

Move from client-only Python transpiler evaluation to hybrid:

```
Student submits capstone
  → Client-side validation runs (existing)
  → If client passes, submit to server
  → Server AI evaluator runs:
      1. Static analysis (student code meets requirements)
      2. Test case execution (existing, server-side)
      3. AI review (code quality, completeness, best practices)
  → Returns consolidated result
  → If all pass: auto-approve, mark course complete, check certification
```

### 6.4 Scheduled Jobs Infrastructure

```typescript
// Using a simple cron-based approach (node-cron or similar)
// No queue system needed at 1000-student scale

schedule('0 2 * * *', async () => {
  // 2 AM daily: issue certificates for newly eligible students
  await issuePendingCertificates();
});

schedule('0 3 * * *', async () => {
  // 3 AM daily: suspend inactive students
  await suspendInactiveStudents(30);
});

schedule('0 8 * * *', async () => {
  // 8 AM daily: send at-risk notifications
  await sendAtRiskNotifications();
});
```

---

## 7. Course Creation Workflow

### Step-by-step (Admin UX)

```
1. Admin clicks "Create New Course"
   → Step 1: Course Information form
     - Name, Description, Thumbnail, Difficulty, Duration, Category

2. Admin clicks "Next"
   → Step 2: Choose Blueprint
     - Shows Blueprint Library cards
     - Options: "Python Blueprint", "AI Blueprint", "Blank Course", "Clone Existing"
     - Each card shows: name, lecture count, block structure preview

3. Admin selects blueprint, clicks "Next"
   → Step 3: Learning Flow Builder (initial state from blueprint)
     - Visual vertical timeline
     - Each row = one lecture with its block types shown as colored pills
     - Admin can:
       • Add block (dropdown: lecture/practice/quiz/problems/assessment/project)
       • Remove block (x button)
       • Reorder blocks (drag and drop)
     - Real-time "Lecture N" labels update automatically

4. Admin clicks "Next"
   → Step 4: Completion Rules (pre-filled from blueprint)
     - Minimum Lecture Completion: [___] (default: all)
     - Minimum Practice Completion: [___] (default: all)
     - Quiz Passing Score: [___]% (default: 70)
     - Assessment Passing Score: [___]% (default: 60)
     - Project Required: [toggle]
     - Capstone Required: [toggle]
     - Certification Enabled: [toggle]

5. Admin clicks "Create Course"
   → Course created in Draft status
   → Lectures generated from blueprint with empty content containers
   → Redirect to Course Editor

6. Course Editor (the main workspace)
   → Tabs: Overview | Lectures | Practice | Quizzes | Problems | Assessments | Projects | Capstone | Rules | Analytics | Settings
   → Admin fills in each lecture's content using block-based editor
   → Auto-save with version history
```

---

## 8. Course Editor Design

### 8.1 Block-Based Content Editor

Replace raw JSON editing with a visual block editor:

```
Lecture N Editor
├── Section 1
│   ├── Block: Explanation (editable title + body + bullets)
│   ├── Block: Code Example (editable title + code + output)
│   ├── Block: Practice (editable instructions + starter code + solution)
│   └── Block: Reflection (editable question + answer)
├── Section 2
│   ├── Block: Analogy (editable emoji + title + text)
│   └── Block: Think Of (editable analogy + visualization)
└── Add Section [+]
```

Each block type has a dedicated editor form. Block types are the existing 7 types:
`explanation`, `analogy`, `think_of`, `code_example`, `practice`, `reflection`, `text`

### 8.2 Content Library (Reusable Blocks)

Admin can save individual blocks or sections to a Content Library and reuse them across courses. This is a stretch goal for later.

---

## 9. Publishing Workflow

```
Draft (invisible to students)
  │
  │ Admin clicks "Publish to Beta"
  ▼
Beta (visible to students with banner)
  │  Students can see content but know it may change
  │  Progress is tracked
  │  No certificates issued from Beta courses
  │
  │ Admin clicks "Publish"
  ▼
Published (full release)
  │  Students can enroll
  │  Certificates available
  │  Analytics tracked
  │
  │ Admin clicks "Archive"
  ▼
Archived (no new enrollments)
    Existing students retain access
    Can be re-published
```

### Beta Banner

When a student accesses a Beta course, they see:

```
┌─────────────────────────────────────────────────────┐
│ 🚧 This course is currently in Beta                 │
│ Content may change. Your progress will be saved.    │
│ Report issues or suggest improvements to your admin.│
└─────────────────────────────────────────────────────┘
```

---

## 10. Migration Strategy

### Phase 0 — Audit (done)
- Current architecture fully documented ✓
- All 668 files across 105 directories mapped ✓
- Existing schema, routes, and services understood ✓

### Phase 1 — Database Models + Dual-Write (2-3 weeks)
- Create new Prisma models (Course, CourseLecture, Blueprint, BlueprintBlock)
- Admin Content Studio writes to both DB and filesystem
- Student API reads from DB with fallback to filesystem
- No disruption to existing users

### Phase 2 — Admin Content Studio UI (3-4 weeks)
- Build the full Content Studio frontend
- Blueprint Library management
- Course creation wizard (5 steps)
- Course Editor with block-based editing
- Publishing workflow controls
- Old admin content page remains accessible

### Phase 3 — Cutover (1 week)
- Migrate all existing content from filesystem to DB
- Seed built-in blueprints from existing course structures
- Update `COURSE_LECTURE_COUNTS` to read from DB
- Remove filesystem content reading from student API
- Decommission `adminContent.ts` file-based routes

### Phase 4 — Automation (2 weeks)
- Implement event-driven certificate issuance
- Implement project auto-validation with AI
- Implement capstone server-side evaluation
- Add scheduled jobs (certificate retry, inactivity suspension)
- Remove Admin Automations page (no longer needed)

### Phase 5 — Cleanup (1 week)
- Remove filesystem content directories from repo
- Remove legacy constants (COURSE_LECTURE_COUNTS, COURSE_PROBLEM_COUNTS)
- Remove old admin pages (AdminAutomationsPage, AdminContentPage)
- Remove admin.ts automation endpoints
- Documentation update

---

## 11. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| DB-backed content has higher latency than filesystem | Add Redis caching layer for course content; filesystem was already JSON parse per request |
| Dual-write introduces complexity | Keep filesystem as read-only fallback; DB is source of truth; sync is one-directional |
| AI-based project evaluation may be inconsistent | Use structured evaluation prompts with clear rubrics; allow admin override for edge cases |
| Existing students have progress tied to `courseSlug` strings | Migration keeps `courseSlug` on Progress as a denormalized field; new Progress links to `courseId` |
| Blueprint system constrains creativity | Blank Blueprint allows fully custom structure; blueprints are editable after creation |
| Beta course data needs cleanup before publish | Add "reset student progress" option when promoting Beta → Published |

---

## 12. Appendix: Blueprint Examples

### Python Blueprint (14 lectures)

```
Lecture 1:  [Lecture] → [Practice (Coding)] → [Quiz] → [Problems (3)]
Lecture 2:  [Lecture] → [Practice (Coding)] → [Quiz] → [Problems (3)]
...
Lecture 13: [Lecture] → [Practice (Coding)] → [Quiz] → [Problems (3)]
Lecture 14: [Project]
```

### AI Blueprint (10 lectures)

```
Lecture 1:  [Lecture] → [Practice (AI)] → [Quiz]
Lecture 2:  [Lecture] → [Practice (AI)] → [Quiz]
...
Lecture 9:  [Lecture] → [Practice (AI)] → [Quiz]
Lecture 10: [Assessment] → [Project]
```

### Blank Blueprint

```
Lecture 1:  [Lecture]
Lecture 2:  [Lecture]
...
Lecture N:  [Lecture]
(Admin adds blocks per lecture as needed)
```

---

## 13. Summary of Impact

| Metric | Before | After |
|---|---|---|
| Time to create a new course | Days (manual file creation) | Minutes (blueprint + wizard) |
| Course lifecycle management | Manual filesystem operations | 5-step wizard + status transitions |
| Content storage | Filesystem (not portable) | Database (portable, queryable) |
| Blueprint reuse | None | First-class entities |
| Project approval | Manual admin review | AI auto-validation |
| Certificate issuance | Admin clicks button | Event-driven, automatic |
| Student scale limit | ~100 (admin bottleneck) | 1000+ (fully automated) |
| Course structure definition | TypeScript constants | Database-driven |
| Admin role | Operator + Creator | Creator only |
