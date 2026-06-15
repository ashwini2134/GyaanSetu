# Project Experience Architecture

## 1. Philosophy

Projects are not coding problems. A coding problem has one right answer, tests for correctness, and a pass/fail outcome. A project is a mini-application: the student writes code, the system renders the output as a visual experience, and completion is based on meaningful criteria.

Every project follows the same lifecycle:

```
[Landing] → [Building (Run loop)] → [Submission] → [Completion]
```

---

## 2. Student Journey

### 2.1 Landing (Before First Run)

The student opens a project from the lecture page. They see:

- **Left Panel:** Project Overview (one-line description + difficulty/XP/time), a static example preview card showing what the final result looks like (rendered via the same VisualPreview component but with sample data), the Build Checklist (all unchecked), and Project Skills badges.
- **Right Panel:** A blank code editor with starter comments, a placeholder Visual Preview saying *"Run your project to see a live preview"*, an empty console, and the action bar at the bottom.

The student has not written any code yet. No test has run. The page is in a welcoming, low-pressure state.

Emotion: *"I see what I'm building. I understand the goal. Let me try."*

### 2.2 First Run

The student writes some code and clicks **Run Project** (or presses Ctrl+Enter).

**What happens (in order):**

1. The code is executed by the simulation engine — the raw stdout is captured.
2. The raw output is fed to the project's parser, which extracts structured data.
3. The Visual Preview re-renders with the parsed data as an animated visual simulation (character cards, game board, checklist, etc.).
4. The static analysis checklist re-runs against the code — items that match are checked off.
5. The dynamic tests run in the background — results appear in the console.
6. **No XP is awarded. No completion state is saved. No overlay appears.**

The student sees their code come to life in the preview. They can iterate: tweak code, run again, see the preview update.

Emotion: *"I wrote code and it turned into something visual. I can see my progress."*

### 2.3 Iteration Loop

The student runs multiple times:

- Each run regenerates the preview with the latest output.
- Each run updates the checklist as more items pass.
- The student uses the AI Mentor (chat, hints, code review) for help.
- The student can test with custom input via the Input tab.
- **Run is always safe.** No penalty, no commitment, no XP.

Emotion: *"I'm experimenting. I can see what works. I'm getting closer."*

### 2.4 Submission

When the student believes they are done, they click **Submit Project**.

**What happens (in order):**

1. The same dynamic tests run again.
2. **If tests pass:**
   - XP is awarded (added to `fa_total_xp`).
   - Project is marked complete in localStorage.
   - Concepts are recorded as practiced.
   - Lecture progress is updated.
   - A completion overlay appears with a success animation and "Continue to Summary" button.
3. **If tests fail:**
   - No XP, no completion, no overlay.
   - Failure analysis is shown in the AI Mentor tab.
   - The student can fix their code and retry.

Submission is a **committed action**. It is the only way to earn credit.

Emotion (success): *"I built something real. I earned the XP. I can see my progress update."*  
Emotion (failure): *"I know what's wrong. I'll fix it and try again."*

### 2.5 Completion Overlay

After successful submission, an overlay appears:

- Large checkmark animation
- "Project Completed" heading
- List of concepts practiced
- XP awarded notice
- "Continue to Summary" button → navigates to lecture summary page

The overlay is dismissible only via the button. It appears once per project.

### 2.6 Returning to a Completed Project

If the student reopens a completed project:

- The completion overlay does NOT reappear.
- The left panel shows a "Completed" badge.
- The editor loads the saved draft code.
- The student can still Run (preview updates) and Submit (will re-award XP — current behavior, should be idempotent).

---

## 3. State Machine

### 3.1 State Definitions

```
                    ┌─────────────────────────────────────┐
                    │           BEFORE_RUN                │
                    │  - Left panel shows Overview +      │
                    │    What You Will Create (example)   │
                    │  - Checklist shows initial state    │
                    │  - Preview shows placeholder        │
                    │  - Editor contains starter code     │
                    │  - Console shows "No tests run"     │
                    └──────────┬──────────────────────────┘
                               │ Run Project
                               ▼
                    ┌─────────────────────────────────────┐
                    │           DURING_RUN                │
                    │  - Console: "Running your code..."  │
                    │  - Preview: empty/loading           │
                    │  - Run button: disabled/loading     │
                    │  - Duration: < 1 second (static)    │
                    └──────────┬──────────────────────────┘
                               │ Execution complete
                               ▼
                    ┌─────────────────────────────────────┐
                    │           AFTER_RUN                 │
                    │  - Preview: rendered visual output  │
                    │  - Checklist: updated with results  │
                    │  - Console: test results (pass/fail)│
                    │  - Submit button: enabled           │
                    │  - NEVER marks complete             │
                    └──────────┬──────────────────────────┘
                               │ Submit Project
                               ▼
                    ┌─────────────────────────────────────┐
                    │           SUBMIT                    │
                    │  - Runs same tests as Run           │
                    │  - On pass:                         │
                    │    ✓ Award XP                       │
                    │    ✓ Mark project complete          │
                    │    ✓ Update concepts                │
                    │    ✓ Show completion overlay        │
                    │    ✓ Update lecture progress        │
                    │  - On fail: same as AFTER_RUN fail  │
                    └─────────────────────────────────────┘
```

### 3.2 State Transitions

| Transition | Trigger | Side Effects |
|---|---|---|
| BEFORE_RUN → DURING_RUN | Click "Run Project" or Ctrl+Enter | Set status to running, clear previous output |
| DURING_RUN → AFTER_RUN | Execution completes | Update preview, update checklist, show test results |
| AFTER_RUN → DURING_RUN | Click "Run Project" again | Re-execute, regenerate preview |
| AFTER_RUN → SUBMIT | Click "Submit Project" | Re-run tests, check pass/fail |
| SUBMIT → (completion overlay) | All tests pass | Award XP, mark complete, redirect |
| SUBMIT → AFTER_RUN (fail) | Tests fail | Show failure, enable retry |

### 3.3 Invariants

- **Run never awards XP.** Run is for experimentation and preview.
- **Submit always re-runs tests.** Run results are not cached into Submit.
- **Checklist updates on both Run and Submit.**
- **Preview is always regenerated on Run.** Never stale.
- **Completion overlay only appears once per project.** State persisted in localStorage.

### 3.4 Run vs Submit: Explicit Rules

| Rule | Run Project | Submit Project |
|---|---|---|
| **Primary purpose** | Experimentation, preview, iteration | Final validation, earning credit |
| **Executes code** | Yes (captures stdout for Visual Preview) | Yes (captures stdout for Visual Preview) |
| **Runs tests** | Yes (shown in console, never blocks) | Yes (determines pass/fail) |
| **Updates checklist** | Yes | Yes |
| **Updates Visual Preview** | Yes | Yes (last preview shown) |
| **Awards XP** | **Never** | **Always** (on pass) |
| **Marks project complete** | **Never** | **Always** (on pass) |
| **Shows completion overlay** | **Never** | **Always** (on pass) |
| **Updates lecture progress** | **Never** | **Always** (on pass) |
| **Records concepts** | **Never** | **Always** (on pass) |
| **Can be clicked multiple times** | Yes (infinite) | Yes (until pass, then idempotent) |
| **Button style** | Blue primary | Green success |
| **Keyboard shortcut** | Ctrl+Enter | Ctrl+Shift+Enter |

**Enforcement:**

```
if (action === 'run'):
  execute_code()
  run_tests()           // console only
  update_checklist()
  update_preview()
  // STOP — no XP, no completion, no overlay

if (action === 'submit'):
  execute_code()
  const result = run_tests()
  update_checklist()
  update_preview()
  if (result.passed):
    award_xp()
    mark_complete()
    show_overlay()
    update_lecture_progress()
```

**Why this separation exists:**

- Run is for **learning** — safe experimentation encourages trying new approaches.
- Submit is for **accountability** — it carries weight and signals completion.
- If Run could complete a project, students would spam Run until it passes by luck.
- If Submit had no unique reward, students would never commit to finishing.

---

## 4. Component Architecture

### 4.1 Top-Level Layout (CodingProjectPage)

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER: Breadcrumb, Lecture nav, Project title, meta bar   │
├──────────────────────┬──────────────────────────────────────┤
│  LEFT PANEL (45%)    │  RIGHT PANEL (55%)                   │
│                      │                                      │
│  ┌────────────────┐  │  ┌────────────────────────────────┐  │
│  │ Overview       │  │  │  Editor Controls (language,    │  │
│  │ (description,  │  │  │  project tools dropdown)       │  │
│  │  difficulty,   │  │  ├────────────────────────────────┤  │
│  │  XP, time)     │  │  │  CODE EDITOR                  │  │
│  ├────────────────┤  │  │  (textarea + syntax highlight) │  │
│  │ What You Will  │  │  ├────────────────────────────────┤  │
│  │ Create         │  │  │  VISUAL PREVIEW                │  │
│  │ (example       │  │  │  (output-driven renderer)      │  │
│  │  preview card) │  │  ├────────────────────────────────┤  │
│  ├────────────────┤  │  │  CONSOLE                       │  │
│  │ Build Checklist│  │  │  (tabs: Results/Output/Mentor/ │  │
│  │ (dynamic ✓/□)  │  │  │        Input)                  │  │
│  ├────────────────┤  │  ├────────────────────────────────┤  │
│  │ Project Skills │  │  │  ACTION BAR                    │  │
│  │ (badges only)  │  │  │  [Save Draft] [Run] [Submit]  │  │
│  ├────────────────┤  │  └────────────────────────────────┘  │
│  │ Reference      │  │                                      │
│  │ Materials      │  │                                      │
│  │ (<details>)    │  │                                      │
│  └────────────────┘  │                                      │
└──────────────────────┴──────────────────────────────────────┘
```

### 4.2 Component Responsibilities

| Component | Responsibility |
|---|---|
| `CodingProjectPage` | State machine owner. Orchestrates data flow between sub-components. |
| `VisualPreview` | Receives raw output string + project ID. Parses output, renders visual representation. Pure component (deterministic from props). |
| `ProjectChecklist` | Receives project ID + code string. Runs static checks. Renders checklist with progress. |
| `ProjectOverview` | Receives metadata (description, difficulty, XP, time). Renders the overview card. |
| `ProjectExamplePreview` | Receives project ID. Generates example output on mount. Renders VisualPreview inline. |
| `ProjectSkills` | Receives concepts array. Renders badge list. |
| `ConsolePanel` | Manages tabs (Test Results, Execution Output, AI Mentor, Custom Input). |
| `EditorPanel` | Code textarea, syntax highlighting, line numbers, lint warnings. |

---

## 5. Universal Simulation Engine

### 5.1 Problem

Currently `runPythonMock()` is a pattern-matching interpreter that handles basic Python constructs. It has limited scope (variables, print, input, basic loops). It is not a real Python runtime.

### 5.2 Design

The Universal Simulation Engine (USE) has three tiers:

```
┌─────────────────────────────────────────────────────────┐
│  Tier 1: In-Browser Mock (current runPythonMock)        │
│  - Good enough for output parsing                       │
│  - Handles: assignment, print(), input(), f-strings,    │
│             basic if/else, while/for loops              │
│  - Fast (synchronous, no network)                       │
│  - For projects with simple I/O patterns                │
│  - LIMITATION: no real Python execution                 │
├─────────────────────────────────────────────────────────┤
│  Tier 2: Pyodide / WebAssembly Python                   │
│  - Full Python interpreter in browser                   │
│  - Required for projects needing real computation       │
│  - Slower initial load (~10MB WASM)                     │
│  - Async execution, stdout capture                      │
│  - For advanced projects (data analysis, visualizations)│
├─────────────────────────────────────────────────────────┤
│  Tier 3: Server-Side Execution (future)                 │
│  - POST code to backend API, return stdout              │
│  - Required for security (file I/O, network)            │
│  - For production deployment with real Python env       │
│  - Adds latency, requires auth                          │
└─────────────────────────────────────────────────────────┘
```

### 5.3 Execution Interface

```typescript
interface ExecutionResult {
  stdout: string;
  stderr: string;
  error: string | null;
  duration: number; // ms
}

interface ExecutionEngine {
  execute(code: string, input: string): Promise<ExecutionResult>;
  isAvailable(): boolean;
  name: string;
}
```

### 5.4 Output Parsing Contract

Every project defines an `OutputParser` that transforms `stdout` into structured data for rendering:

```typescript
interface OutputParser<T> {
  /** Parse raw stdout into typed data */
  parse(stdout: string): T;

  /** Fallback renderer when stdout is empty or unparseable */
  fallback(): React.ReactNode;
}

interface ProjectRenderer<T> {
  /** Render parsed data as a React tree */
  render(data: T): React.ReactNode;
}
```

### 5.5 Parser Examples

| Project | Parser Strategy | Produces |
|---|---|---|
| story_generator | Regex for named/age/color/hobby, rest = story | `{ name, age, color, hobby, storyLines }` |
| shopping_list | Line-by-line, detect [x] markers | `{ items: { name, purchased }[] }` |
| contact_book | Label:value pairs, accumulate by name | `{ contacts: { name, phone, email }[] }` |
| grade_tracker | Subject:score lines, extract avg/letter | `{ grades: { subject, score }[], avg, letter }` |
| rock_paper_scissors | Parse "You chose X, Computer chose Y, Result" | `{ rounds: { player, computer, result }[], scores }` |
| multiplication_explorer | Split by whitespace, first row = header | `{ grid: string[][] }` |
| text_analyzer | label: value pairs | `{ metrics: { label, value }[] }` |

### 5.6 Simulation Requirements

#### 5.6.1 Principle

The Visual Preview must never display raw text output. Every project's simulation must transform stdout into a meaningful, interactive-feeling visual representation.

**What is NOT a simulation:**
```
Program Output:
Once upon a time, there was a person named Maya.
At 22 years old, Maya loved the color blue...
```

**What IS a simulation:**
```
┌─────────────────────────────────────────┐
│  Character Profile                      │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐ │
│  │ Name │  │ Age  │  │ Color│  │ Hobby│ │
│  │ Maya │  │ 22   │  │ Blue │  │ Art  │ │
│  └──────┘  └──────┘  └──────┘  └──────┘ │
│  ┌─────────────────────────────────────┐ │
│  │ Once upon a time...                 │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

#### 5.6.2 Per-Project Simulation Specifications

**Story Generator — Animated Narrative View**

| Requirement | Detail |
|---|---|
| Character card | 4-field grid (name, age, color, hobby) with field-specific icons and border colors |
| Story panel | Decorative card with gradient border, animated paragraph reveal (staggered fade-in) |
| Empty state | "Run your code to generate a story..." |
| Animation | Cards scale in, paragraphs fade up, divider slides left |
| Visual tone | Warm amber/rose, paper-like texture, serif-adjacent styling |

Simulates: *a storybook or character profile page*

---

**Rock Paper Scissors — VS Combat View**

| Requirement | Detail |
|---|---|
| Score board | Centered layout: You (emerald) VS Computer (red), large numeric scores |
| Round cards | Each round: player choice icon ↔ VS label ↔ computer choice icon, with result badge (Won/Lost/Tie) |
| Choice icons | Distinct SVG icons for rock, paper, scissors (not text) |
| Result coloring | Green border for wins, red for losses, amber for ties |
| Empty state | "Run your code to play the game..." |

Simulates: *a fighting game versus screen or scoreboard*

---

**Shopping List — Dynamic List Builder**

| Requirement | Detail |
|---|---|
| Checklist cards | Each item as a row with checkbox, item name, purchased styling |
| Progress bar | Visual bar showing purchased/total ratio, or progress dots |
| Item count | "N items · M purchased" summary header |
| Purchased state | Strikethrough text + muted colors for completed items |
| Empty state | "Run your code to build your shopping list..." |

Simulates: *a grocery list app or task manager*

---

**Contact Book — Contact Cards View**

| Requirement | Detail |
|---|---|
| Contact cards | Each contact as a card: avatar circle (first letter), name, phone, email |
| Phone/email icons | Inline SVG icons for phone and email fields |
| Contact count | "N contacts" summary header |
| Empty state | "Run your code to build your contact book..." |

Simulates: *a phone contacts app or address book*

---

**Grade Tracker — Report Card Dashboard**

| Requirement | Detail |
|---|---|
| Progress bars | Per-subject: label, score, animated fill bar (color-coded: green ≥ 80, amber ≥ 60, red < 60) |
| Summary cards | Average score card + letter grade card in a side-by-side layout |
| Empty state | "Run your code to generate your grade report..." |

Simulates: *a student portal grade dashboard*

---

**Multiplication Table — Grid Explorer**

| Requirement | Detail |
|---|---|
| Grid layout | Monospace grid with alternating row colors |
| Header row | Teal-colored first row (the multiplier header) |
| Cell styling | Right-aligned text, subtle border between cells |
| Empty state | "Run your code to generate the table..." |

Simulates: *a spreadsheet or multiplication chart*

---

**Number Guessing Game — Attempt Tracker**

| Requirement | Detail |
|---|---|
| Attempt cards | Each guess as a row: result-coded (correct = green bold, too high/low = orange, welcome = muted) |
| Attempt counter | Show "N attempts" at the top |
| Empty state | "Run your code to play the game..." |

Simulates: *a game log or attempt history*

---

**Unit Converter — Conversion Result Card**

| Requirement | Detail |
|---|---|
| Result card | Large centered card with the conversion result in bold cyan text |
| Decorative container | Rounded card with subtle border, centered layout |
| Empty state | "Run your code to see the conversion..." |

Simulates: *a calculator result screen*

---

**Text Analyzer — Metrics Dashboard**

| Requirement | Detail |
|---|---|
| Metric cards | 2-column grid of metric cards: label (uppercase tracking) + large value |
| Staggered animation | Cards animate in sequence |
| Empty state | "Run your code to see analysis..." |

Simulates: *an analytics dashboard*

---

**Personal Diary — Journal Timeline**

| Requirement | Detail |
|---|---|
| Entry cards | Each entry: date (amber header), title, content in a card with amber left border |
| Vertical timeline | Cards stacked vertically with consistent spacing |
| Empty state | "Run your code to see diary entries..." |

Simulates: *a blog or journal timeline*

#### 5.6.3 Simulation Contract

Every simulation must:

1. **Parse** stdout into structured data (via project-specific parser).
2. **Render** a visual component from that data (never raw text).
3. **Handle empty output** with a descriptive placeholder that includes "Run your code" phrasing.
4. **Animate** with subtle staggered reveals (fade-in, scale-in) using CSS keyframe animations.
5. **Respect `prefers-reduced-motion`** by disabling animations when the user prefers it.
6. **Be hidden by default** and only appear after Run is clicked.
7. **Be deterministic** — same stdout always produces the same visual.

#### 5.6.4 Rejected Approaches

| Approach | Why Rejected |
|---|---|
| Displaying raw console output in the preview | Feels like a terminal, not an application |
| Using emoji as icons | Unprofessional appearance |
| HTML canvas/WebGL rendering | Over-engineered for text-based projects; increases complexity |
| Real-time execution (keypress-by-keypress) | Adds latency without pedagogical value |
| Pre-rendered static images per project | Not driven by student code; defeats the purpose |

---

## 6. Project Definition Template

Every project must define a `ProjectDefinition` that completely describes its behavior:

```typescript
interface ProjectDefinition {
  /** Unique slug matching directory name */
  id: string;

  /** Metadata for display */
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedTime: string;
  tags: string[];
  xp: number;
  concepts: string[];
  learningGoal: string;

  /** Static checks for build checklist */
  checklist: ChecklistItem[];

  /** Default input for Run without custom input */
  defaultInput: string;

  /** Example code that produces representative output */
  exampleCode: string;

  /** Example input for exampleCode */
  exampleInput: string;

  /** Parser: raw stdout → structured data */
  parser: OutputParser<unknown>;

  /** Renderer: structured data → React tree */
  renderer: ProjectRenderer<unknown>;

  /** Static analysis tests (current tests.js contract) */
  runTests(code: string): { passed: boolean; message: string };
}
```

### 6.1 How Checklist Items Work

```typescript
interface ChecklistItem {
  /** Unique key within this project */
  id: string;
  /** Student-facing label */
  label: string;
  /** Predicate: does the code satisfy this requirement? */
  check: (code: string) => boolean;
}
```

Checklist items are **static analysis only** (check the source code, not execution output). This makes them instant and deterministic.

### 6.2 Example: Story Generator Definition

```typescript
{
  id: 'story_generator',
  title: 'Story Generator',
  description: 'Build a personalized story creator...',
  difficulty: 'Easy',
  estimatedTime: '20 min',
  tags: ['I/O', 'f-Strings', 'Variables'],
  xp: 50,
  concepts: ['input()', 'variables', 'print()', 'f-strings'],
  learningGoal: 'Use user input and variables to generate a story.',

  checklist: [
    { id: 'input', label: 'Ask for user name', check: c => c.includes('input(') },
    { id: 'variables', label: 'Store answers in variables', check: c => /\w+\s*=/.test(c) },
    { id: 'fstrings', label: 'Use f-strings to build story', check: c => /f['"]/.test(c) },
    { id: 'print', label: 'Print the story', check: c => /print\s*\(/.test(c) },
  ],

  defaultInput: 'Maya\n22\nblue\npainting',
  exampleCode: 'name = "Maya"\nage = "22"\n...',
  exampleInput: '',

  parser: parseStoryOutput,   // regex-based extractor
  renderer: StoryCard,        // React component

  runTests: (code) => { /* static analysis */ },
}
```

---

## 7. Project Templates

Templates define the **output rendering** and **parsing** for a category of projects. Adding a new project is: pick a template → define checklist → wire up.

### 7.1 Template: Character Profile (story_generator)

| Aspect | Detail |
|---|---|
| Parser | Extract name, age, color, hobby via regex from prose |
| Renderer | 4-field grid card + story block with decorative border |
| Visual style | Warm amber/gold tones, character card per field |

### 7.2 Template: VS Game (rock_paper_scissors, guessing_game)

| Aspect | Detail |
|---|---|
| Parser | Extract rounds, scores, outcomes |
| Renderer | Score board + round cards with choice icons + result badges |
| Visual style | Indigo/purple tones, VS divider, animated reveal |

### 7.3 Template: List/Collection (shopping_list, contact_book)

| Aspect | Detail |
|---|---|
| Parser | Line items, detect checkbox markers or label:value pairs |
| Renderer | Checklist cards or contact cards with avatars |
| Visual style | Clean card layout, check animations for toggles |

### 7.4 Template: Data Dashboard (grade_tracker, text_analyzer)

| Aspect | Detail |
|---|---|
| Parser | Extract metrics from label:value lines |
| Renderer | Metric cards grid, progress bars, summary card |
| Visual style | Green/emerald tones, bar fill animations |

### 7.5 Template: Grid/Table (multiplication_explorer)

| Aspect | Detail |
|---|---|
| Parser | Split by whitespace, detect header row |
| Renderer | Grid layout with alternating row colors |
| Visual style | Teal headers, monospace cells |

### 7.6 Template: Diary/Journal (personal_diary)

| Aspect | Detail |
|---|---|
| Parser | Extract date/title/content blocks |
| Renderer | Vertical timeline with date headers |
| Visual style | Amber side border, warm tones |

### 7.7 Template: Conversion Card (unit_converter)

| Aspect | Detail |
|---|---|
| Parser | Find line containing =, →, or ° |
| Renderer | Large centered card with result |
| Visual style | Cyan/blue tones, centered display |

---

## 8. State Persistence Contract

### 8.1 localStorage Keys

| Key | When Set | When Cleared |
|---|---|---|
| `fa_code_{projectId}` | Every keystroke + on save | Never (until explicit reset) |
| `fa_completed_projects` | On successful Submit | Only on profile reset |
| `fa_total_xp` | On successful Submit | Only on profile reset |
| `fa_{course}_lecture_{n}_completed` | On successful Submit | Never |
| `fa_last_section_{course}_{n}` | On "Continue to Summary" | Never |

### 8.2 What Must NOT Persist

- `previewOutput` — Regenerated on every Run
- `checklistResults` — Recalculated on every Run
- `output` (console) — Cleared on every Run
- `showCompletionOverlay` — Fresh per session

---

## 9. Adding a New Project

Step-by-step for adding project `xyz`:

1. Create `public/data/python/lecture_N/xyz/question.md`
2. Create `public/data/python/lecture_N/xyz/tests.js` with `runTests(code)` function
3. Add `xyz` metadata to `getProjectMetadata()` in `api.ts`
4. Add `xyz` to `PROJECT_DEFAULT_INPUTS` in `CodingProjectPage.tsx`
5. Add `xyz` checklist to `PROJECT_CHECKLISTS` in `CodingProjectPage.tsx`
6. Add `xyz` to `PROJECT_CHECKLISTS` example generation in `useEffect`
7. Add `xyz` to `VisualPreview.tsx`:
   - Add parser function (`parseXyzOutput`)
   - Add renderer component (`XyzCard`)
   - Add to `projectConfigs` (title, icon, gradient)
   - Add to `projectRenderers` (wire parser + renderer)

### 9.1 Convention Summary

| File | What to add |
|---|---|
| `api.ts` | Metadata entry (tags, time, concepts, goal) |
| `CodingProjectPage.tsx` | Default input, checklist items, example code |
| `VisualPreview.tsx` | Parser, renderer, config, renderer map |
| `data/.../question.md` | Project description |
| `data/.../tests.js` | Static analysis tests |

---

## 10. Future Considerations

### 10.1 Registry Pattern

Move all project definitions into a single registry file (`projectRegistry.ts`) to eliminate scattering across multiple files:

```typescript
const projectRegistry = new Map<string, ProjectDefinition>();
projectRegistry.set('story_generator', { ... });
projectRegistry.set('rock_paper_scissors', { ... });
```

### 10.2 Dynamic Test Result Parsing

Instead of the current checklist (which duplicates test logic), enhance `tests.js` to return granular results:

```typescript
// Current
{ passed: boolean, message: string }

// Future
{
  passed: boolean;
  message: string;
  checks: { id: string; label: string; passed: boolean }[];
}
```

This would make checklists authoritative and eliminate the parallel checklist implementation.

### 10.3 Example Output Generation

Replace the per-project hardcoded `useEffect` with a deterministic approach: each project definition includes `exampleCode` and `exampleInput`. The USE runs this code on mount and feeds the output to VisualPreview. This eliminates the need for 10 separate branches.

### 10.4 Accessibility

- VisualPreview must include `aria-label` and `role` attributes for screen readers
- Animated elements must respect `prefers-reduced-motion`
- Checklist must announce changes via `aria-live` region
- Console tabs must use proper `tabindex` and keyboard navigation

---

## 11. Appendix: Current vs Proposed State Comparison

| Aspect | Current | Proposed |
|---|---|---|
| Project definition | Spread across 5+ files | Single `ProjectDefinition` per project |
| Checklist | `PROJECT_CHECKLISTS` in CodingProjectPage.tsx | Part of `ProjectDefinition` |
| Default inputs | `PROJECT_DEFAULT_INPUTS` in CodingProjectPage.tsx | Part of `ProjectDefinition` |
| Example code | `useEffect` with 10 branches | `definition.exampleCode` run through USE |
| Parsers | In `VisualPreview.tsx` | Part of `ProjectDefinition` |
| Renderers | In `VisualPreview.tsx` | Part of `ProjectDefinition` |
| Tests | `tests.js` files | `definition.runTests` |
| State machine | Implicit (if/else chains) | Explicit enum + transition functions |
| Templates | None | 7 reusable templates |
