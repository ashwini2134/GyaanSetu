# Admin Experience Restructure Plan

**Date:** June 24, 2026
**Vision:** Autonomous Learning Platform. Admin creates content. System runs everything else.

---

## 1. Current Page Inventory & Classification

| # | Page | Current Purpose | K | M | A | R | Rationale |
|---|---|---|---|---|---|---|---|
| 1 | **Content** | Course/lecture CRUD (filesystem) | ✓ | | | | Core content creation. Becomes Content Studio Course Library. |
| 2 | **Practice Exercises** | Exercise CRUD, analytics, connectivity check | ✓ | | | | Content. Moves inside Course Editor (per-course practice tab). |
| 3 | **Courses** | Course enrollment stats (read-only) | | ✓ | | | Merges into Content Studio as per-course Analytics tab. |
| 4 | **Reports** | Analytics dashboard (6 tabs) | | ✓ | | | Becomes Analytics section (standalone, top-level). |
| 5 | **Projects** | Submission list + template browser | | ✓ | | | Templates → Content Studio. Submissions → read-only in Analytics. |
| 6 | **Assessments** | Assessment attempt stats (read-only) | | ✓ | | | Merges into Content Studio per-course + Analytics cross-course. |
| 7 | **QA Center** | Course health checklist + validation | | ✓ | | | Merges into Content Studio Course Editor → Readiness tab. |
| 8 | **Review Queue** | Approve/reject projects, resolve flags | | | ✓ | | Project review → AI-evaluated. Inactive flags → cron. Remove page. |
| 9 | **Student Management** | List/suspend/activate students | | | ✓ | | Suspend → cron. Activate → auto on login. Directory → Operations Monitor drill-down. |
| 10 | **Certifications** | Issue/revoke certs + analytics | | | ✓ | | Issue → event-driven. Analytics → Analytics section. Revoke → Settings (edge case). |
| 11 | **Notifications** | Send broadcast + view history | | | ✓ | | System sends all notifications. Broadcasts → course-level announcements in Studio. |
| 12 | **Automations** | Bulk issue certs, suspend inactive | | | ✓ | | Replaced by cron + event-driven pipeline. Remove page. |
| 13 | **Admin Panel** | Dashboard with pending actions | | | | ✓ | Replaced by Content Studio landing + Analytics overview. |
| 14 | **Settings** | Site name, maintenance, registrations | | ✓ | | | Kept. Expanded to include AI, cert, branding, security, integrations. |

**K = Keep, M = Merge, A = Automate, R = Remove**

---

## 2. Future Admin Sidebar

```
┌─────────────────────────────────────┐
│  Content Studio                     │  ← Primary workspace, landing page
│  ├ Course Library                   │
│  ├ Draft Courses                    │
│  ├ Beta Courses                     │
│  ├ Published Courses                │
│  ├ Archived Courses                 │
│  └ Blueprint Library                │
│                                     │
│  Analytics                          │  ← Read-only awareness
│  ├ Learning Analytics               │
│  ├ Assessment Analytics             │
│  ├ Project Analytics                │
│  ├ Certification Analytics          │
│  └ Student Analytics                │
│                                     │
│  Operations Monitor                 │  ← Exceptions & failures only
│                                     │
│  Settings                           │  ← Platform configuration
│  ├ General                          │
│  ├ AI Evaluation                    │
│  ├ Certificates                     │
│  ├ Automation                       │
│  ├ Branding                         │
│  ├ Security                         │
│  └ Integrations                     │
└─────────────────────────────────────┘
```

**Total: 4 top-level items** (down from 14). Admin navigates primarily within Content Studio.

---

## 3. Content Studio Architecture

### Navigation Structure

```
Content Studio
│
├── Course Library              All courses in a unified view
│   └── Filters: Status | Difficulty | Category | Search
│
├── Create New Course           5-step wizard
│   ├── Step 1: Course Info     Name, description, thumbnail, difficulty, duration, category
│   ├── Step 2: Blueprint       Choose: Python | AI | Blank | Clone existing
│   ├── Step 3: Learning Flow   Visual builder: add/reorder/remove blocks per lecture
│   ├── Step 4: Rules           Completion rules (pre-filled from blueprint)
│   └── Step 5: Review          Summary → Create (saves as Draft)
│
├── Draft Courses               Filtered view: status = draft
├── Beta Courses                 Filtered view: status = beta
├── Published Courses            Filtered view: status = published
├── Archived Courses             Filtered view: status = archived
│
└── Blueprint Library           Manage reusable learning structures
    ├── Python Blueprint        Built-in
    ├── AI Blueprint            Built-in
    ├── Blank Blueprint         Built-in
    └── [Custom Blueprints]     Admin-created
```

### Course Editor (per-course view)

When admin opens a course from any library view:

```
Course Editor: [Course Title]
│
├── Overview          Course metadata, status badge (Draft/Beta/Published/Archived),
│                     publish button, duplicate, archive, delete
│
├── Lectures          Ordered list. Each lecture: title, block types shown as pills.
│                     Add/reorder/remove lectures. Click to edit.
│   └── Lecture N Editor
│       ├── Lesson      Block-based editor: sections → blocks (explanation, analogy,
│       │               code_example, practice, reflection, text, think_of)
│       ├── Quiz        Question editor: add/reorder/remove quiz questions
│       ├── Problems    Problem editor: add coding problems with tests
│       └── Preview     Student view of the lecture
│
├── Practice           Per-lecture practice exercise config (AI or Coding type)
│                      Reuses existing PracticeExercise CRUD UI
│
├── Assessments        Per-course assessment config (category, subsection, passing score,
│                      AI evaluation toggle, max attempts)
│
├── Projects           Project assignment: link to ProjectTemplate + auto-evaluation rules
│
├── Capstone           Capstone config: AI evaluation prompt, test cases, passing criteria
│
├── Rules              Completion rules: min lectures, min practice, quiz pass %,
│                      assessment pass %, project required, capstone required,
│                      certification enabled, auto-issue toggle
│
├── Readiness          QA checklist (moved from QACenter): 6 items per course,
│                      validation runner, health score
│
├── Analytics          Per-course student stats: enrollment, progress, completions,
│                      drop-offs, avg time per lecture
│
└── Settings           Course slug, visibility, enrollment type (open/invite)
```

---

## 4. Analytics Architecture

### Top-Level Navigation

```
Analytics
│
├── Learning Analytics      Per-course lecture completion rates, practice pass rates,
│                           hint usage, avg time, failure reasons
│
├── Assessment Analytics    Pass rates, hardest/easiest subsections, category breakdowns,
│                           retake statistics
│
├── Project Analytics       Completion rates, avg completion time, most-attempted
│                           templates, auto-approval rate, AI evaluation distribution
│
├── Certification Analytics By-course totals, monthly trends, conversion rate,
│                           eligibility funnel
│
└── Student Analytics       Top performers, most active, at-risk, behind schedule,
│                           near-certification
```

All analytics are **read-only**. No action buttons. CSV export per section.

This is the existing `AdminReportsPage.tsx` — rebranded and promoted to top-level nav.

---

## 5. Operations Monitor Architecture

### Purpose

Not for daily use. Admin visits this page only when something fails.

### Content

```
Operations Monitor
│
├── Automation Failures          Certificate issuance errors, AI evaluation failures,
│                                notification delivery failures
│   └── Each entry: timestamp, error type, affected user, retry status, manual retry button
│
├── Service Status               Backend health, database connectivity, external API status
│   └── Certs API, AI provider, SMTP, database
│
├── Failed Certificates          Certs API returned error, DB write failed, etc.
│   └── Retry | Skip | View details
│
├── Failed AI Evaluations        Project/capstone AI couldn't evaluate
│   └── Manual evaluate | Requeue | Skip
│
├── Queued Retries               Items waiting for retry
│
└── System Log                   Recent error events (last 24h), filterable by severity
```

### Design Principles

- **Empty by default** — a healthy system shows no items
- **Red counter badge** on nav when items exist
- **Each item has: Retry, Dismiss, View Details**
- No content creation, no student management, no analytics

---

## 6. Settings Architecture

### Top-Level Navigation

```
Settings
│
├── General           Site name, maintenance mode, allow registrations, default language
│
├── AI Evaluation     Default evaluation prompt, provider selection (Groq/OpenAI/Anthropic),
│                     fallback behavior, confidence threshold for auto-approval
│
├── Certificates      Auto-issuance toggle, cert template selection, expiring cert policy,
│                     Certs API connection status + test button
│
├── Automation        Cron schedule configuration, inactivity threshold (days),
│                     warning period before suspension, retry limits
│
├── Branding          Logo, favicon, primary color, footer text, custom domain
│
├── Security          Allowed email domains, rate limiting, session duration,
│                     OAuth provider enable/disable
│
└── Integrations      Certs App URL + bearer token, SMTP config, AI API keys,
│                     webhook endpoints
```

Current `AdminSettingsPage.tsx` is the starting point — expand to include all these sections.

---

## 7. Automation Implementation Plan

### Event-Driven (Real-Time)

| Workflow | Trigger | Action |
|---|---|---|
| Certificate issuance | Student completes last requirement | Check eligibility → Issue via Certs API → Store locally → Notify student |
| Project approval | Student submits project | AI evaluates → Pass: auto-approve, XP, notify → Fail: feedback, allow retry |
| Capstone approval | Student submits capstone | AI evaluates → Pass: auto-approve, mark course complete, check cert → Fail: feedback |
| Portfolio update | Certificate issued | Regenerate portfolio PDF → Update portfolio page |
| Progress tracking | Any student action | Automatic (already works) |
| Leaderboard update | Any XP transaction | Automatic (already works) |
| Notifications | Any system event | Automatic (already works) |

### Cron-Driven (Daily)

| Workflow | Schedule | Action |
|---|---|---|
| Inactivity suspension | Daily 3 AM | Flag students inactive >30d → Send warning → After 7 more days → Suspend |
| Certificate retry | Daily 2 AM | Retry failed certificate issuances (up to 3 attempts) |
| AI evaluation retry | Daily 2 AM | Requeue failed AI evaluations |
| At-risk detection | Daily 8 AM | Find students behind schedule → Send encouragement notification |
| Analytics refresh | Hourly | Recompute cached analytics aggregates |
| Cleanup expired data | Weekly | Remove old tokens, stale queue items |

---

## 8. Migration Plan

### Phase 1 — Navigation Restructure (Week 1)

Current sidebar → New sidebar:

| Action | Items |
|---|---|
| **Remove** | Admin Panel dashboard, Review Queue, Automations |
| **Rename** | Reports → Analytics, Content → Content Studio |
| **Merge** | Student Management → StudentProfilePage as drill-down from Analytics; Courses → Content Studio per-course tab |
| **Add** | Operations Monitor (empty placeholder), Settings (expand) |

Implementation:
1. Update `Shell.tsx` sidebar — remove 7 items, rename 2, add 1
2. Update `App.tsx` routes — redirect removed pages to Content Studio
3. Remove `AdminPage.tsx` dashboard as the landing page (Content Studio becomes landing)
4. Disable action buttons on pages pending automation (hide approve/reject/issue/suspend)

### Phase 2 — Automation Backend (Weeks 2-4)

1. Implement AI project evaluation service
2. Implement AI capstone evaluation service
3. Implement event-driven certificate issuance
4. Implement cron jobs (inactivity, retry, at-risk)
5. Update `project.ts` — auto-approve on AI pass
6. Remove `/admin/automations` endpoints — let admin routes 404
7. Remove manual action endpoints (`/admin/approve`, `/admin/issue`, etc.)

### Phase 3 — Content Studio Build (Weeks 4-8)

1. DB models (Course, CourseLecture, Blueprint, BlueprintBlock)
2. Blueprint library CRUD
3. Course creation wizard (5 steps)
4. Course Editor with block-based content editing
5. Publishing workflow (Draft → Beta → Published → Archived)
6. Migrate existing filesystem content to DB
7. Remove `adminContent.ts` filesystem routes

### Phase 4 — Analytics & Operations Monitor (Week 9)

1. Rebrand Reports → Analytics, promote to top-level nav
2. Build Operations Monitor with error feeds + retry buttons
3. Expand Settings with all config sections
4. Remove stale dependencies (old admin pages, unused routes)

---

## 9. Sidebar Transition

### Before (14 items)

```
├── Review Queue        ← remove (automated)
├── Student Management  ← remove (automated)
├── Courses             ← merge into Content Studio
├── Admin Panel         ← remove (replaced)
├── Notifications       ← remove (automated)
├── Projects            ← merge (templates → Studio)
├── Practice            ← merge into Content Studio
├── Assessments         ← merge into Content Studio
├── Certifications      ← remove (automated)
├── Content             ← rename → Content Studio
├── Reports             ← rename → Analytics
├── Automations         ← remove (automated)
├── QA Center           ← merge into Content Studio
└── Settings            ← keep, expand
```

### After (4 items)

```
├── Content Studio      ← primary workspace
├── Analytics           ← read-only awareness
├── Operations Monitor  ← exceptions only
└── Settings            ← platform config
```

---

## 10. Summary

| Metric | Before | After |
|---|---|---|
| Sidebar items | 14 | 4 |
| Admin action pages | 10 (approve/reject/issue/suspend) | 0 |
| Read-only pages | 4 | 2 (Analytics + Operations Monitor) |
| Content creation pages | 2 (Content + Practice) | 1 (Content Studio, unified) |
| Manual workflows | 7+ | 0 |
| Automation triggers | 2 (clicked by admin) | 10+ (event + cron) |
| Admin role | Operator + Creator | Creator only |
