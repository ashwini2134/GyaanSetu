# Vision Alignment Audit — Admin Restructuring Report

**Date:** June 24, 2026
**Vision:** One admin, 1000+ students, fully autonomous operation. Admin creates content only.

---

## 1. Current Admin Navigation Map

```
Admin (sidebar)
├── Review Queue            {actions: approve/reject/resolve}
├── Student Management      {actions: suspend/activate}
├── Courses                 {read-only}
├── Admin Panel             {actions: approve/issue, stats}
├── Notifications           {actions: send broadcast}
├── Projects                {read-only submissions + templates}
├── Practice Exercises      {full CRUD}
├── Assessments             {read-only}
├── Certifications          {actions: issue/revoke}
├── Content                 {course/lecture CRUD}
├── Reports                 {read-only analytics}
├── Automations             {actions: bulk run}
│
├── QA Center               {checklist + validate}
└── Settings                {site config}
```

**Total: 14 navigable pages** for a single admin.

---

## 2. Page Classification Against New Vision

### Content Creation — Belongs in Content Studio

| Page | What Migrates | Notes |
|---|---|---|
| **Content** (AdminContentPage) | Course CRUD, lecture management | Core of Content Studio — course library, create/edit/delete courses and lectures |
| **Practice Exercises** (AdminPracticeExercisesPage) | Exercise CRUD, editor, analytics, connectivity validation | Per-lecture content — belongs in Course Editor's practice tab |
| **QA Center** (QACenter) | Course health score, validation checklist, review notes | Belongs as a "Readiness" tab in Course Editor (per-course, not standalone) |

### Operations Monitoring — Read-Only, Keep Visible

| Page | What Stays | Notes |
|---|---|---|
| **Reports** (AdminReportsPage) | All 6 analytics tabs + CSV export | Core analytics — no actions, pure visibility. This is the Operations Monitor. |
| **Courses** (AdminCoursesPage) | Course enrollment stats, per-course student progress | Merge into Content Studio as a per-course "Analytics" tab |
| **Projects** (AdminProjectsPage) | Submissions list, template browser, stats | Templates become Content Creation (belongs in Course Editor). Submissions become a read-only Operations Monitor item since auto-approval removes the need for manual review. |
| **Assessments** (AdminAssessmentsPage) | Attempt stats, completion rates | Read-only. Merge into Content Studio as a per-course analytics view. |
| **Student Profile** (StudentProfilePage) | Individual student progress, activity, certs | Read-only. Keep as a drill-down from Operations Monitor. |

### Automation Candidate — Functions Become Event-Driven / Cron

| Page | Manual Action | Future Behavior |
|---|---|---|
| **Automations** — Issue All Certificates | Admin clicks "Run" | Event-driven: student completes all requirements → system checks eligibility → issues certificate automatically |
| **Automations** — Suspend Inactive | Admin clicks "Run" | Cron job runs daily: suspend students inactive 30+ days, send warning before suspension |
| **Review Queue** — Approve Project | Admin reviews and clicks "Approve" | AI evaluates project against rubric: passes → auto-approve, fails → feedback to student. Only edge cases enter queue. |
| **Review Queue** — Inactive Student Flags | Admin marks as "resolved" | Automatic: cron suspends, no review needed. Remove from queue. |
| **Certifications** — Issue to Student | Admin clicks "Issue" per student | Fully automatic on eligibility event |
| **Certifications** — Revoke | Admin clicks "Revoke" with reason | Keep as limited manual action for edge cases |

### Settings — Standalone

| Page | Classification | Notes |
|---|---|---|
| **Settings** (AdminSettingsPage) | Settings | Site name, maintenance mode, registration toggle. Belongs in a settings section, accessible from Content Studio header. |

### Remove — No Longer Needed in Their Current Form

| Page | Why Remove | What Replaces It |
|---|---|---|
| **Admin Page** (AdminPage, the dashboard) | Duplicates functionality from Reports, Review Queue, Student Directory, and Certifications. The "pending reviews" and "issue certs" tabs are manual actions that become automated. | Content Studio becomes the admin landing page. Critical stats shown in Content Studio header. |
| **Review Queue** (ReviewQueuePage) | Project reviews become AI-evaluated. Inactive student flags become automated. No manual queue items should exist at steady state. | Remove entirely. If needed, a minimal "Needs Review" counter visible from Operations Monitor. |
| **Student Directory** (StudentDirectoryPage) | Suspend/activate becomes automated. Browsing all students is an operational concern, but at 1000+ scale with no manual actions needed, a directory has no purpose. | Student lookup can be done from Operations Monitor analytics (top performers, at-risk, etc.). Remove standalone page. |
| **Notifications** (AdminNotificationsPage) | System sends all notifications automatically. Admin broadcast is a content concern (announcements are content). | Move announcement capability into Content Studio as a course-level feature (e.g., "Post Update to Enrolled Students"). |
| **Certifications** (AdminCertificationsPage) | Issue/revoke tabs become automated. Analytics tab duplicates AdminReportsPage. | Analytics moves to Operations Monitor. Issue/revoke pages removed. |
| **Automations** (AdminAutomationsPage) | All automations become event-driven or cron-scheduled. No button-pushing needed. | Remove entirely. |
| **QA Center** (QACenter) | QA checklist moves into Content Studio Course Editor as a "Readiness" tab. | Remove standalone page. |

---

## 3. Future Admin Navigation

```
Content Studio                     ← Admin landing page, primary workspace
│
├── Course Library                  All courses, any status
│   ├── Draft
│   ├── Beta
│   ├── Published
│   └── Archived
│
├── Blueprint Library               Reusable learning structures
│   ├── Python Blueprint
│   ├── AI Blueprint
│   ├── Blank
│   └── [Custom]
│
├── Course Editor (per course)      Full content workspace
│   ├── Overview                    Course info, status, publishing
│   ├── Lectures                    Block-based lesson editor
│   ├── Practice                    Practice exercise config
│   ├── Quizzes                     Quiz question editor
│   ├── Problems                    Coding problem editor
│   ├── Assessments                 Assessment configuration
│   ├── Projects                    Project assignment + template ref
│   ├── Capstone                    Capstone config
│   ├── Rules                       Completion rules, certification
│   ├── Readiness                   QA checklist, validation
│   ├── Analytics                   Per-course student progress + metrics
│   └── Settings                    Course-level settings
│
├── Operations Monitor              Read-only awareness
│   ├── Overview                    Key metrics, active students, etc.
│   ├── Students                    Top performers, at-risk, behind
│   ├── Courses                     Cross-course comparison
│   ├── Certifications              Issuance trends, conversion
│   └── Activity                    Recent platform activity
│
└── Settings                        Platform-level config
    ├── General                     Site name, maintenance, registrations
    └── System                      Info, environment
```

**Navigation count: 3 main sections** (Content Studio, Operations Monitor, Settings) instead of 14.

The admin sidebar shows only:
```
Content Studio     ← (default, opens by default)
Operations Monitor ← (read-only awareness)
Settings           ← (platform config)
```

---

## 4. Manual Workflows Mapped to Automation

### 4.1 Project Approval (Manual → AI-Evaluated)

**Before:** Admin reviews each project submission, clicks approve/reject in Review Queue.

**After:** AI evaluates project against:
- Project template constraints (from `ProjectTemplate`)
- Code quality and requirements matching
- Test case execution results

Result:
- **Pass** → status = COMPLETED, XP awarded, student notified, certification eligibility checked
- **Fail** → status = NEEDS_REVISION, specific feedback sent to student
- **Unsure** → enters admin queue (rare edge cases only)

### 4.2 Capstone Evaluation (Client-side → AI-Evaluated)

**Before:** Client-side Python transpiler + regex checks. No server-side validation possible — students can bypass.

**After:** Server-side AI evaluation:
- Static analysis against requirements
- Dynamic test execution (server-side Python sandbox)
- AI review for code quality, correctness, completeness
- Consolidated pass/fail with detailed feedback

### 4.3 Certificate Issuance (Manual → Event-Driven)

**Before:** Admin checks eligibility, clicks "Issue" per student or uses bulk automation.

**After:** On every progress event:
1. Student completes lecture/project/capstone
2. System checks if ALL course conditions met
3. If yes → issue certificate via Certs API
4. Store result in IssuedCertificate
5. Notify student with download link
6. Update portfolio with new cert

### 4.4 Student Suspension (Manual → Cron)

**Before:** Admin runs "Suspend Inactive Students" automation.

**After:** Daily cron job:
1. Find students with lastActiveAt > 30 days
2. Send warning notification: "You haven't been active in 30 days. Log in to keep your account active."
3. After 7 more days of inactivity → auto-suspend
4. Notification: "Your account has been suspended due to inactivity. Contact admin to reactivate."

### 4.5 Broadcast Notifications (Manual → Content-Driven)

**Before:** Admin composes and sends notifications from Notifications page.

**After:** Admin writes "Course Updates" as part of course management (announcements). System sends to enrolled students when course content changes or admin publishes an update. Notifications are always contextual — never broadcast.

---

## 5. Content Studio Scope

### What Lives Inside Content Studio

| Feature | Current Location | New Location |
|---|---|---|
| Course CRUD | AdminContentPage | Course Library |
| Lecture CRUD | AdminContentPage | Course Editor → Lectures |
| Lesson content editor | Does not exist (raw JSON) | Course Editor → Lectures → Block Editor |
| Quiz editor | Does not exist (raw JSON) | Course Editor → Quizzes |
| Problems editor | Does not exist (raw JSON) | Course Editor → Problems |
| Practice exercise config | AdminPracticeExercisesPage | Course Editor → Practice |
| Assessment config | Does not exist (hardcoded CATEGORY_STRUCTURE) | Course Editor → Assessments |
| Project assignment | AdminProjectsPage (templates) | Course Editor → Projects |
| Capstone config | Does not exist (hardcoded 4 projects) | Course Editor → Capstone |
| Completion rules | Does not exist (hardcoded constants) | Course Editor → Rules |
| Course publishing | Does not exist | Course Library → Publish workflow |
| Course duplication | Does not exist | Course Library → Duplicate |
| Blueprint CRUD | Does not exist | Blueprint Library |
| QA readiness | QACenter (standalone) | Course Editor → Readiness |
| Per-course analytics | AdminCoursesPage | Course Editor → Analytics |

### What Stays Outside Content Studio

| Feature | New Location | Reason |
|---|---|---|
| Cross-course analytics | Operations Monitor | Admin needs to see the whole platform, not one course |
| Student risk lists | Operations Monitor | At-risk, behind-schedule, inactive — system-wide view |
| Certification trends | Operations Monitor | Across all courses |
| Platform settings | Settings | Not course-specific |
| System info | Settings | Not course-specific |

---

## 6. Operations Monitor Scope

Transform AdminReportsPage into the Operations Monitor — the admin's awareness dashboard.

### Tabs

**Overview**
- Active students (last 7 days)
- New enrollments (this week)
- Certificates issued (this week)
- Courses with recent completions
- Quick stats (total students, total courses, engagement rate)

**Students**
- Top performers (by XP, this month)
- Most active (last 7 days)
- At-risk (inactive 14+ days, behind schedule)
- Recently certified
- Near-certification (within 2 lectures of completion)
- Student search (for drill-down to StudentProfilePage)

**Courses**
- Cross-course enrollment comparison
- Completion rates per course
- Average progress per course
- Active learners per course

**Certifications**
- Issuance trends (monthly)
- Conversion rate (eligible → issued)
- By-course breakdown
- Revocation rate

**Activity**
- Timeline of recent platform events
  - New enrollments
  - Course completions
  - Certificates issued
  - Projects auto-approved
  - Capstones auto-evaluated
- Filterable by event type

---

## 7. Backend Route Restructuring

### Routes to Remove

| Route | Reason |
|---|---|
| `POST /admin/automations/issue-all-certificates` | Replaced by event-driven auto-issuance |
| `POST /admin/automations/suspend-inactive` | Replaced by cron job |
| `POST /projects/admin/approve/:projectId` | Replaced by AI auto-validation |
| `POST /projects/admin/reject/:projectId` | Replaced by AI auto-feedback |
| `POST /certifications/admin/issue` | Replaced by event-driven auto-issuance |
| `POST /certifications/revoke` | Keep as limited manual operation |
| `GET /admin/students` | Student lookup from Operations Monitor analytics |
| `POST /admin/students/:userId/activate` | Auto-reactivation on login |
| `POST /admin/students/:userId/suspend` | Replaced by cron |
| `GET /admin/review-queue` | No manual queue items |
| `PATCH /admin/review-queue/:id` | No manual queue items |
| `POST /admin/push-db` | Dangerous in production |

### Routes to Add

| Route | Purpose |
|---|---|
| `POST /api/system/validate-project` | AI project evaluation |
| `POST /api/system/evaluate-capstone` | AI capstone evaluation |
| `POST /api/system/check-and-issue-certificate` | Event-driven cert issuance |
| `GET /api/system/jobs/status` | Cron job health check |
| `PUT /api/admin/studio/courses/:id/publish` | Course lifecycle |
| `PUT /api/admin/studio/courses/:id/archive` | Course lifecycle |
| `POST /api/admin/studio/courses/:id/duplicate` | Course cloning |

### Routes to Keep (Unchanged)

| Route | Purpose |
|---|---|
| `GET /api/admin/analytics/*` | All analytics endpoints (Operations Monitor) |
| `GET /api/admin/stats` | Overview stats |
| `GET /api/admin/reports/*` | Growth and overview reports |
| `GET /api/admin/settings` | Read settings |
| `PUT /api/admin/settings` | Write settings |
| `GET /api/admin/projects/templates` | Template browsing (read-only) |
| `POST /api/admin/notifications/send` | Keep for course-level announcements |
| `GET /api/admin/notifications` | Notification history |

---

## 8. What the Admin Sees Day-to-Day

For a typical day with a fully autonomous system:

**Morning:** Admin opens Fraylon → lands on Content Studio Course Library. They see 4 courses (Python Draft, AI Published, New Course Beta, Future Course Draft).

**Action 1:** Opens "Future Course" (Draft) → Course Editor → Lectures tab → edits Lesson 3 content blocks. Saves. Auto-saves version.

**Action 2:** Opens "New Course" (Beta) → Readiness tab → sees green checks on all review items → clicks "Publish to Production". Course goes Published. Enrolled students get notification.

**Action 3:** Checks Operations Monitor → sees 3 certificates auto-issued yesterday, 12 active students, 1 at-risk student (flagged for low activity last 14 days).

**Action 4:** Clicks at-risk student → Student Profile → sees they completed 30% of Python course then stopped. System already sent a reminder. Admin may take no action — system handles it.

**End of day:** Admin created content. System handled everything else.

---

## 9. Page Removal Impact Analysis

| Page Removed | Data Loss | Workflow Loss | Mitigation |
|---|---|---|---|
| **AdminPage** (dashboard) | None — all data in analytics + studio | Quick overview of pending items | Content Studio header shows key metrics. Operations Monitor replaces analytics. |
| **ReviewQueuePage** | None | No manual review of projects/inactive students | AI handles projects. Cron handles inactivity. |
| **StudentDirectoryPage** | None | No searchable student list with suspend/activate | Operations Monitor lists at-risk/top/near-cert. Auto-suspend replaces manual. |
| **StudentProfilePage** | Read-only — keep in Operations Monitor | N/A | Keep as drill-down from Operations Monitor |
| **AdminCoursesPage** | None — merge per-course analytics into Content Studio | Course enrollment stats | Per-course tab in Content Studio Editor |
| **AdminNotificationsPage** | Notification history | Broadcast announcements | History moves to Operations Monitor. Course-level announcements stay in Studio. |
| **AdminProjectsPage** | None — templates move to Studio, submissions auto-approved | Template library browsing | Templates in Content Studio Course Editor |
| **AdminAssessmentsPage** | None — merge into Content Studio + Operations Monitor | Assessment stats view | In Studio per-course + Operations Monitor cross-course |
| **AdminCertificationsPage** | Issued cert list, issue/revoke actions | Manual cert management | Auto-issue. Cert list in Operations Monitor. Revoke in Settings for edge cases. |
| **AdminReportsPage** | TRANSFORM into Operations Monitor | N/A — this IS Operations Monitor | Rebrand and reorganize tabs |
| **AdminAutomationsPage** | None | Bulk run buttons | Replaced by cron + events |
| **QACenter** | QA checklist per course | Course readiness tracking | Moves to Content Studio Course Editor → Readiness tab |
| **AdminSettingsPage** | KEEP | KEEP | Unchanged |
| **QA** | QA validation runner | Course validation | Moves to Content Studio Course Editor → Readiness tab |
| **Settings** (ProfilePage) | Does not redirect to actual settings | Settings unavailable | Redirect to AdminSettingsPage |

---

## 10. Restructuring Implementation Phases

### Phase 1 — Navigation & Page Removal (1 week)
- Move Content Studio to `/admin/courses` (current AdminContentPage becomes Content Studio entry point)
- Remove from sidebar: Review Queue, Student Management, Notifications, Automations, QA Center
- Remove from router: unused page imports
- Sidebar becomes: **Content Studio** | **Operations Monitor** | **Settings**
- Old `/admin` landing page becomes Content Studio (remove AdminPage dashboard)

### Phase 2 — Automation Implementation (2 weeks)
- Implement event-driven certificate issuance
- Implement AI project evaluation
- Implement cron for inactivity suspension
- Remove admin action buttons from all pages

### Phase 3 — Content Studio Build (4 weeks)
- Blueprint system (DB models + CRUD)
- Course creation wizard (5-step)
- Course Editor with block-based content editing
- Publishing workflow (Draft → Beta → Published → Archived)

### Phase 4 — Operations Monitor (1 week)
- Rebrand AdminReportsPage as Operations Monitor
- Add student quick-lookup, activity timeline, drill-down profiles
- Remove stand-alone Student Profile page (integrate as modal/slide-over)

### Phase 5 — Cleanup (1 week)
- Remove old backend routes (admin approvals, manual issue, automations)
- Delete deprecated page files
- Update tests
- Documentation

**Total: ~9 weeks**
