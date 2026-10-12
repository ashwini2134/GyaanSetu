# AI Course Practical Workflow — Complete UX & Instructional Audit

**Course:** Artificial Intelligence Fundamentals (fundamentals-of-ai)
**Lectures:** 1–10
**Three Experiences:** Problems to Solve → Milestone Projects → Capstone Project
**Goal:** Can a first-year student with zero GitHub experience complete this without asking for help?

---

## PART 1 — Problems to Solve Audit

### Current Screen (General — applies to all lectures)

The learner sees these elements in order on the LecturePage when the section type is `problems`:

1. **Heading:** "Problems to Solve" (h2)
2. **Subheading:** "Apply what you've learned by solving these coding challenges."
3. **Counter badge:** `2/2 solved` (if any solved, shown in orange)
4. **ProblemCard components** (first 2 problems from problems.json)
5. **"Similar Questions" section** (problems 3+, with lightning bolt icon)
6. **Completion modal** when all main problems are solved

#### Each ProblemCard shows:
- **Collapsed:** Index badge, title, difficulty badge or "Solved" badge, chevron
- **Expanded:**
  - Header bar: difficulty badge, title, "Solved" indicator, close button
  - Tab bar: **description** | **hints**
  - Description tab: problem description (prose, white-space pre-line), test cases list, code editor (Monaco), Run/Submit buttons, output/result panel
  - Hints tab: bullet list of hints or generic message
  - After solving: "Similar Problems to Try (Optional)" box with auto-generated suggestions
  - Watermark overlay with student name/email (anti-copying)
  - Completion overlay: "Problem Solved ✓" (auto-hides 1.5s)

#### Submission & Feedback:
- "Run Code" executes without test cases
- "Submit Solution" runs all test cases via MiniPython interpreter
- Results show line-by-line diff with expected vs actual output
- Pass/fail per test case with character-level mismatch explanation
- All must pass for completion; no partial credit
- Draft auto-saved on every run/submit

---

### Lecture-by-Lecture Problem Inventory

#### Lecture 1 — Introduction to AI
| Problem | Title | Difficulty | Type | Tests | Hints |
|---------|-------|-----------|------|-------|-------|
| 1 | AI Daily Usage Calculator | easy | coding | 3 | 3 |
| 2 | AI/ML/DL Classifier | easy | coding | 4 | 3 |
| sim1 | AGI Timeline Predictor (Similar A) | easy | coding | 3 | 3 |
| sim2 | Simple Chatbot Rules (Similar B) | easy | coding | 3 | 2 |

#### Lecture 2 — Search Algorithms
| Problem | Title | Difficulty | Type | Tests | Hints |
|---------|-------|-----------|------|-------|-------|
| 1 | BFS Queue Simulator | easy | coding | 3 | 3 |
| 2 | Graph Representation | easy | coding | 3 | 2 |
| sim1 | DFS Stack Simulator (Similar A) | easy | coding | 3 | 3 |
| sim2 | Graph Connection Check (Similar B) | easy | coding | 3 | 2 |

#### Lecture 3 — Knowledge & Logic
| Problem | Title | Difficulty | Type | Tests | Hints |
|---------|-------|-----------|------|-------|-------|
| 1 | Logic Puzzle Solver | easy | coding | 3 | 2 |
| 2 | Daily Rules Validator | easy | coding | 3 | 2 |
| sim1 | Deductive Reasoning Checker (Similar A) | easy | coding | 3 | 2 |
| sim2 | Movie Recommendation Rules (Similar B) | easy | coding | 3 | 2 |

#### Lecture 4 — Probability & Uncertainty
| Problem | Title | Difficulty | Type | Tests | Hints |
|---------|-------|-----------|------|-------|-------|
| 1 | Simulate Coin Flips | easy | coding | 3 | 2 |
| 2 | Python Coin Simulator | easy | coding | 1 | 2 |
| sim1 | Dice Roll Experiment (Similar A) | easy | coding | 3 | 2 |
| sim2 | Python Dice Simulator (Similar B) | easy | coding | 1 | 2 |

#### Lecture 5 — Optimization
| Problem | Title | Difficulty | Type | Tests | Hints |
|---------|-------|-----------|------|-------|-------|
| 1 | Sudoku Row Validator | easy | coding | 3 | 2 |
| 2 | Hill Climbing Code | **medium** | coding | 3 | 2 |
| sim1 | Crossword Constraint Checker (Similar A) | easy | coding | 3 | 2 |
| sim2 | Simulated Annealing Concept (Similar B) | easy | coding | 3 | 2 |

#### Lecture 6 — Machine Learning (most problems)
| Problem | Title | Difficulty | Type | Tests | Hints |
|---------|-------|-----------|------|-------|-------|
| 1 | ML Workflow Validator | easy | coding | 3 | 2 |
| 2 | Simple Number Classifier | easy | coding | 3 | 2 |
| 3 | Data Cleaner (Similar A) | easy | coding | 3 | 2 |
| 4 | Age Categorizer (Similar B) | easy | coding | 3 | 2 |
| 5 | Loss Function Calculator | easy | coding | 3 | 3 |
| 6 | Single Perceptron Update | **medium** | coding | 3 | 3 |
| 7 | Margin Checker | **medium** | coding | 3 | 3 |

#### Lecture 7 — Neural Networks
| Problem | Title | Difficulty | Type | Tests | Hints |
|---------|-------|-----------|------|-------|-------|
| 1 | 3-Layer NN Simulator | easy | coding | 3 | 2 |
| 2 | Weighted Sum Calculator | easy | coding | 3 | 2 |
| sim1 | ReLU Activation Function (Similar A) | easy | coding | 3 | 2 |
| sim2 | Step Activation Function (Similar B) | easy | coding | 3 | 2 |

#### Lecture 8 — Natural Language Processing
| Problem | Title | Difficulty | Type | Tests | Hints |
|---------|-------|-----------|------|-------|-------|
| 1 | Prompt Length Checker | easy | coding | 3 | 2 |
| 2 | Tokenize Sentence | easy | coding | 3 | 2 |
| sim1 | Hallucination Filter (Similar A) | easy | coding | 3 | 2 |
| sim2 | Word Frequency Counter (Similar B) | easy | coding | 3 | 2 |

#### Lecture 9 — AI Ethics & Safety
| Problem | Title | Difficulty | Type | Tests | Hints |
|---------|-------|-----------|------|-------|-------|
| 1 | News story about AI | easy | **reflection** | 0 (20 words) | 2 |
| 2 | Medical decisions debate | easy | **reflection** | 0 (20 words) | 2 |
| sim1 | AI in Education (Similar A) | easy | **reflection** | 0 (20 words) | 2 |
| sim2 | Autonomous Vehicles Debate (Similar B) | easy | **reflection** | 0 (20 words) | 2 |

#### Lecture 10 — Final Project
| Problem | Title | Difficulty | Type | Tests | Hints |
|---------|-------|-----------|------|-------|-------|
| 1 | Project Plan Validator | **medium** | coding | 3 | 2 |
| 2 | Ethical consideration | easy | **reflection** | 0 (20 words) | 2 |
| sim1 | Milestone Tracker (Similar A) | easy | coding | 3 | 2 |
| sim2 | Bias Mitigation (Similar B) | easy | **reflection** | 0 (20 words) | 2 |

---

### Missing Information (for beginners)

1. **No "what is this" context.** The page says "Problems to Solve" but doesn't explain: these are auto-graded coding exercises, you write Python in the browser, no setup needed, no GitHub required.
2. **No example walkthrough.** A beginner doesn't see one complete problem being solved from start to finish before attempting.
3. **No explanation of test cases.** The test case labels are shown but it's not explained that these are automated checks run against their code.
4. **No "Why am I doing this?"** per problem. The problem title and description are functional but don't connect back to real-world relevance.
5. **No expected output format.** The problem description describes what to do but doesn't always make the output format crystal clear. Beginners struggle with exact whitespace/newline matching.
6. **No partial credit indicator.** Fail one test case, fail everything. No indication of "you got 2/3 right."
7. **No "hint reveal" mechanic.** Hints are immediately visible in a tab — no progressive disclosure to encourage trying first.
8. **Reflection problems use a code editor.** Lecture 9 and some of Lecture 10 require written reflection, but the interface is still the Monaco code editor with comment-like input. Very confusing.
9. **"Similar Problems to Try" are fake.** The inline suggestions after solving ("Advanced X Challenge") are string replacements, not real problems. A beginner might try to click them.
10. **No success criteria.** What does "solved" mean? All tests pass. But this isn't explained. A beginner might think "it ran without errors" means done.
11. **No submission instructions.** There's no "submit" concept — you just solve in-browser. But the word "Submit" on the button suggests something more formal.

### Beginner Questions

- What exactly should I build?
- Where do I start?
- Do I need to install Python?
- Do I need GitHub for this?
- How do I submit?
- What if my code looks different from the solution but works?
- How do I know I finished correctly?
- What do the test cases mean?
- What if I get stuck?
- Can I use outside help?
- What is "similar questions" vs main problems?
- Do I have to solve the similar ones?
- Why is my output marked wrong when it looks the same? (whitespace/newline issues)
- What happens after I solve everything?

### Ideal Screen Layout (suggested)

```
┌─────────────────────────────────────────────────────────────┐
│ Problems to Solve                        [progress: 1/2]   │
│ Practice what you learned. Write Python in your browser.   │
│ No installation or GitHub needed.                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌────────────────────────────────────────────────────┐      │
│ │ Problem 1: [Title]                                 │      │
│ │ ────────────────────────────────────────────────── │      │
│ │ │ ▶ Introduction  │  ▶ Goal  │  ▶ Hints (3)      │      │
│ │ ────────────────────────────────────────────────── │      │
│ │ What you'll build:                                  │      │
│ │ [One-line summary of what the program does]         │      │
│ │                                                     │      │
│ │ Example:                                            │      │
│ │   Input:  hello                                     │      │
│ │   Output: Too short                                 │      │
│ │                                                     │      │
│ │ Requirements:                                       │      │
│ │   • Read input                                      │      │
│ │   • Check condition                                 │      │
│ │   • Print output                                    │      │
│ │                                                     │      │
│ │ ⚠ Common mistakes:                                  │      │
│ │   • Forgetting newlines                             │      │
│ │   • Wrong comparison operator                       │      │
│ ├──────────────────────────┬─────────────────────────┤      │
│ │  Code Editor             │  Console Output          │      │
│ │  ┌────────────────────┐  │  ▶ Run to see output     │      │
│ │  │  starter code...   │  │  ✓ 2/3 tests passing    │      │
│ │  │                    │  │  ❌ Test 3 failed        │      │
│ │  └────────────────────┘  │  Expected: "Too short"  │      │
│ │                         │  Actual:   "too short"   │      │
│ │  [▶ Run]  [✓ Submit]    │  (case sensitivity)      │      │
│ └─────────────────────────┴─────────────────────────┘      │
│                                                             │
│ ┌────────────────────────────────────────────────────┐      │
│ │ ✅ Solved!  →  [Next Problem]                       │      │
│ └────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Missing Assets

- **Workflow diagram** showing how problems flow: Read → Code → Run → Submit → Feedback → Next
- **GIF/screenshot** of the Monaco editor in action
- **Example walkthrough video** (30s) showing one problem solved end-to-end
- **Test case explanation graphic** showing what happens when you submit
- **Badge/achievement** for completing all problems in a lecture

### Demo Video Recommendation

- **Length:** 45–60 seconds
- **Scenes:**
  1. Landing on Problems page (5s)
  2. Reading a problem description (10s)
  3. Writing code in the editor (15s)
  4. Running code and seeing output (10s)
  5. Submitting and seeing all tests pass (10s)
  6. Completion overlay appearing (5s)
- **Narration:** "Each lecture has practice problems. Read the description, write your Python solution, and click Submit. The system runs your code against test cases and tells you exactly what passed or failed. No setup needed — everything runs in your browser."
- **No audio required** — captions are sufficient

### Submission Flow Audit

**Current:** There is no formal submission. The learner writes code in-browser and clicks Submit, which runs test cases. "Solving" means all test cases pass. There is no GitHub, no file upload, nothing external.

**Issues for beginners:** 
- The word "Submit" sounds formal and scary
- No confirmation that results are saved
- No way to go back and review past submissions
- Reflection problems use the same code editor interface which is confusing

---

## PART 2 — Milestone Project Audit

### Current UI

The MilestonePage is a 3-step wizard:

**Step 1 — Choose Project:**
- Hero: "Milestone Challenge" badge + "Select Your Milestone" title
- Subtitle: "Demonstrate your AI knowledge. Select one of the projects below to complete and submit via GitHub."
- 9 skill tags with green checkmarks
- Project cards (1–2 per lecture) showing title, difficulty, description, skills
- Selected project details bar (time, difficulty, skills, "what you'll build")
- "Configure Requirements" button

**Step 2 — Requirements:**
- Download Starter Code button (if ZIP exists)
- Core Objective card
- Two-column grid: Technical Checklist + Expected Program Execution Flow
- "Switch Project" and "Submit Project" buttons

**Step 3 — Submit Project:**
- Project summary card
- Requirements summary card
- GitHub URL input field (validates `https://github.com/` prefix)
- Submit button with loading/success/error states
- "Back to Requirements" button

**After both projects submitted:** "All Milestones Completed" banner with auto-navigate to next lecture (1.5s)

### Lecture-to-Milestone Mapping

| Lecture | Title | Milestone Projects |
|---------|-------|-------------------|
| 2 | Search Algorithms | Degrees (BFS), Tic-Tac-Toe (Minimax) |
| 3 | Knowledge & Logic | Knights (Logic), Minesweeper (Inference) |
| 4 | Probability & Uncertainty | PageRank, Heredity |
| 5 | Optimization | Crossword (CSP) |
| 6 | Machine Learning | Shopping (KNN), Nim (Q-Learning) |
| 7 | Neural Networks | Traffic (CNN) |

**Lectures 1, 8, 9, 10 have NO milestone projects.**

### Missing Information for Beginners

1. **No GitHub setup guide.** The system assumes the learner knows how to: create a repo, push code, link their GitHub account in Settings. None of this is explained.
2. **No "what is a milestone" explanation.** Why am I doing this? How does it connect to the lecture?
3. **No example of a completed submission.** What does a good submission look like? A sample repo? A screenshot?
4. **No folder structure requirements shown.** The learner gets starter code but no instructions on how to organize their repo.
5. **No explanation of the AI review process.** After submitting, what happens? How long does it take? What's being evaluated?
6. **No visible feedback on the milestone page.** After submission, the page shows "Project submitted successfully" but no score, no feedback, no review status from the AI.
7. **No retry/resubmit mechanism in the UI.** If rejected, the learner sees no clear path to resubmit.
8. **"PENDING" counted as complete.** A submission still under review counts as "completed" for navigation purposes. Learner might proceed without knowing they were rejected.
9. **No README template.** The requirements mention README content but no template is provided.
10. **No evaluation criteria shown to the learner.** What is the AI looking for? What score do I need?

### Beginner Questions

- What exactly is a milestone project?
- Why do I need to do this?
- Do I need to install Python on my computer?
- How do I create a GitHub account?
- How do I create a repository?
- How do I push my code?
- How do I link my GitHub account in Settings?
- What folder structure should my repo have?
- What should my README contain?
- How do I know if my solution is correct before submitting?
- What happens after I submit?
- How long does the review take?
- What if my project is rejected?
- Can I resubmit?
- How many attempts do I have?
- What score do I need to pass?
- Who reviews my project — a person or AI?
- What happens if the AI review fails?
- How do milestones connect to my certificate?

### Ideal Screen Layout

```
Step 1: Choose Project
┌────────────────────────────────────────────────────────────┐
│ Milestone Challenge                                        │
│ Select Your Milestone                                      │
│ Pick a project that applies what you learned in this       │
│ lecture. Build it locally, push to GitHub, and submit.     │
├────────────────────────────────────────────────────────────┤
│ ┌────────────────────┐  ┌────────────────────┐             │
│ │ Project A          │  │ Project B          │             │
│ │ Degrees            │  │ Tic-Tac-Toe        │             │
│ │ Intermediate       │  │ Intermediate       │             │
│ │ ────────────────   │  │ ────────────────   │             │
│ │ Find shortest path │  │ Build unbeatable   │             │
│ │ using BFS          │  │ AI with Minimax    │             │
│ │                    │  │                     │             │
│ │ Skills: BFS, Graph │  │ Skills: Minimax... │             │
│ │                    │  │                     │             │
│ │ [▶ Select]         │  │ [▶ Select]          │             │
│ └────────────────────┘  └────────────────────┘             │
│                                                            │
│ ✅ Need help getting started?                              │
│   • [GitHub Setup Guide]  [How to Submit]  [FAQ]          │
└────────────────────────────────────────────────────────────┘

Step 3: Submit
┌────────────────────────────────────────────────────────────┐
│ Submit Your Project                                        │
│                                                            │
│ 1. Push your code to a GitHub repository                   │
│ 2. Enter the URL below                                     │
│ 3. The AI will review your project and give feedback       │
│                                                            │
│ GitHub Repository URL:                                     │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ https://github.com/your-username/your-repo              │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                            │
│ [Submit Project]                                           │
│                                                            │
│ ┌────────────────────────────────────────────────────┐     │
│ │ ✅ Submitted! Your project is being reviewed (5-30s)│     │
│ │ Status: ● PENDING  ● REVIEWING  ○ APPROVED          │     │
│ │                                                     │     │
│ │ What happens next: The AI checks your code against  │     │
│ │ the requirements. You'll get a score and feedback.  │     │
│ │ Come back here or check your notifications.         │     │
│ └────────────────────────────────────────────────────┘     │
│                                                            │
│ 📋 Previous submissions & feedback:                        │
│   • Attempt 1 — REJECTED (score: 45/100)                   │
│     Feedback: Missing README analysis. See details.        │
│   [Resubmit]                                               │
└────────────────────────────────────────────────────────────┘
```

### Missing Assets

- **GitHub setup guide** (step-by-step with screenshots)
- **Sample repository** showing correct folder structure
- **README template** (markdown file they can copy)
- **Submission checklist** (interactive: "Did you push? Did you write README?")
- **Progress indicator** showing which milestones are done/pending/rejected
- **AI review status dashboard** (real-time status polling with visible feedback)
- **FAQ accordion** for common questions
- **Video walkthrough** (90s) showing: create repo → push code → submit URL → see review result

### Submission Workflow Issues

1. **GitHub ownership check is fragile.** The backend extracts username from the submitted URL and compares against the linked GitHub profile. If names don't match (e.g., org repo, team repo), submission fails with no clear error.
2. **No local testing instructions.** The learner is not told how to test their code before submitting.
3. **No attempt history visible in UI.** The backend tracks 3 attempts but the frontend doesn't display this.
4. **Auto-navigate after "completion" skips feedback.** The 1.5s redirect means the learner might not see the success state.

---

## PART 3 — Capstone Project Audit

### Current UI

The CapstonePage is a 4-step wizard (steps 1-3 match Milestone, step 4 is Certificate):

**Step 1 — Choose Project:**
- 4 project options: Search Algorithm Trace, Logic Puzzle Formalization, Intro to Text Classification, CSP Problem Formulation
- One-capstone-only enforcement (can't do multiple)
- Projects range from Intermediate to Advanced, 2-4 hours each

**Step 2 — Requirements:**
- Same layout as Milestone: Core Objective, Technical Checklist, Expected Flow
- Has starter code download, features, requirements, guidelines

**Step 3 — Submit:**
- GitHub URL input only (no file upload, no video, no screenshots)
- Submits via `POST /projects/complete`

**Step 4 — Certificate:**
- "Project Passed!" screen with validation results, project summary, reward (+500 XP display)
- Certificate widget (frontend decorative only; real certs are PDF via external service)

### Key Issues Found

1. **Project ID mismatch:** Frontend projects use IDs `search_trace`, `logic_puzzle`, `ml_classifier_intro`, `csp_formulation`. Backend's `CAPSTONE_PROJECT_NAMES` and `PROJECT_SKILLS` use `search_visualizer`, `inference_engine`, `text_classifier`, `csp_solver`. Certificates will show raw IDs instead of proper names.

2. **XP display discrepancy:** Frontend shows "+500 XP" on the certificate step. Backend only awards 100 XP for capstone submission.

3. **No file/video/screenshot submission.** Only GitHub URL. A beginner expected to demonstrate a full capstone project with just a repo link — no explanation, no demo, no results.

4. **No resubmission UI.** Once submitted, the page shows success or error. No "view feedback" or "resubmit" button.

5. **No evaluation criteria visible.** The AI review rubric is hidden. The learner doesn't know what score they need or what's being judged.

6. **Stale "Certificate" step code.** Step 4 exists in the wizard but is never reached through the normal flow.

7. **No README template.** Capstone projects require extensive README documentation but no template is provided.

8. **Certificate auto-issuance vs admin review contradiction.** The auto-worker issues certificates without admin review, but the frontend says "An admin will review and issue your certificate shortly."

### Missing Information for Beginners

1. **No "what is a capstone" explanation.** Why is this the final project? How does it differ from milestones?
2. **No example capstone submission.** What does a passing project look like?
3. **No expected deliverable list.** What files should be in the repo? What format?
4. **No timeline/expectation setting.** How long should this take? When will the certificate arrive?
5. **No connection to certificate eligibility.** The learner doesn't know the 5 conditions for the certificate.

### Beginner Questions

- What is a capstone project?
- How is this different from milestone projects?
- Which project should I pick?
- Do I need to do all 4?
- What files should my repository contain?
- Do I need a README? What should it say?
- Do I need to record a video?
- Do I need to deploy my project?
- How long will the review take?
- What score do I need?
- How do I know if I passed?
- Can I redo it if I fail?
- How do I get my certificate?
- How do I download my certificate?
- Can I share my certificate on LinkedIn?

### Ideal Screen Layout

```
Step 1: Choose Project
┌────────────────────────────────────────────────────────────┐
│ 🎓 Capstone Challenge                                      │
│ Select Your Final Project                                  │
│ This is your chance to demonstrate everything you've       │
│ learned. Choose one project, build it, and submit.        │
├────────────────────────────────────────────────────────────┤
│ What to expect:                                            │
│   • Build a real project (2-4 hours)                       │
│   • Push to GitHub and submit                              │
│   • AI reviews your code and gives feedback                │
│   • Score 60+/100 to pass                                  │
│   • Pass to earn your certificate                          │
│                                                            │
│ [Beginner's Guide to Capstone Projects] [Sample Project]   │
│ [GitHub Setup] [Submission Checklist]                      │
├────────────────────────────────────────────────────────────┤
│ Project Cards (2x2 grid) — each with:                      │
│   Title | Difficulty | Time | Skills | Description         │
│   "What you'll learn" | [Select] button                    │
│                                                            │
│ ✅ Once you select a project, you cannot switch            │
└────────────────────────────────────────────────────────────┘

Step 4: Results & Certificate
┌────────────────────────────────────────────────────────────┐
│ 🎉 Congratulations!                                        │
│ Your capstone project passed with 85/100                   │
├────────────────────────────────────────────────────────────┤
│ AI Review Feedback:                                        │
│   ✅ Implementation — 25/30                                │
│   ✅ Code Quality — 20/20                                  │
│   ✅ README — 15/20                                        │
│   ✅ Analysis — 15/20                                      │
│   ✅ Concepts — 10/10                                      │
│                                                            │
│ Strengths:                                                 │
│   • Excellent heuristic explanation                        │
│   • Clean, readable code                                   │
│                                                            │
│ Suggestions:                                               │
│   • Add docstrings to functions                            │
│   • Include more edge cases in tests                       │
│                                                            │
│ ┌────────────────────────────────────────────────────┐     │
│ │        Certificate of Completion                    │     │
│ │                                                    │     │
│ │   This certifies that                               │     │
│ │   [Student Name]                                    │     │
│ │                                                    │     │
│ │   has completed                                    │     │
│ │   Artificial Intelligence Fundamentals              │     │
│ │   Capstone: Search Algorithm Trace                  │     │
│ │                                                    │     │
│ │   Issued: July 14, 2026    Avg Score: 92%          │     │
│ │                                                    │     │
│ │   [Download PDF]  [Share on LinkedIn]  [Verify]    │     │
│ └────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────┘
```

### Missing Assets

- **Sample capstone repository** (public example they can reference)
- **README template** with sections: Overview, How to Run, Approach, Results, Reflection
- **Project selection guide** ("Which project is right for you?" based on interests)
- **Submission checklist** (interactive: code pushed, README written, all requirements met)
- **Evaluation rubric** shown before submission so learner knows what's graded
- **Certificate preview** (what it looks like, how to share)
- **Video walkthrough** (2 min): project selection → building → repo setup → submission → results

---

## PART 4 — Instruction Audit

### Instruction Quality Assessment

#### Excellent
- Test case labels (e.g., "Heavy user", "Light user", "Edge case — Exactly 0") — clear, descriptive
- Problem titles (e.g., "Prompt Length Checker", "Tokenize Sentence") — self-explanatory
- Error translation messages in CodeEditor — beginner-friendly phrasing

#### Good
- Most problem descriptions — clear what to do, with sample input/output
- Hints — specific, actionable
- Milestone project guidelines — explain the "why" behind each requirement
- Capstone project guidelines — connect to lecture concepts

#### Average
- "Apply what you've learned by solving these coding challenges" — generic, no real motivation
- Reflection prompts could be more structured (e.g., bullet points to address)
- Milestone Step 3 instructions: "Push your completed project to a GitHub repository and submit the link below" — assumes GitHub knowledge

#### Poor (needs rewriting)

**Instruction 1:** "Push your completed project to a GitHub repository and submit the link below."
**Location:** MilestonePage Step 3, CapstonePage Step 3
**Problem:** Assumes the learner knows: what GitHub is, how to create an account, how to create a repo, how to push code, how to link their GitHub in Settings.
**Rewrite:** 
> "To submit, you'll need to upload your code to GitHub. Here's how:
> 1. If you don't have one, create a free GitHub account at github.com
> 2. Create a new repository (click the '+' icon → 'New repository')
> 3. Push your project code to this repository (open terminal in your project folder and run the commands GitHub shows you)
> 4. Copy your repository URL (it looks like https://github.com/your-name/your-repo)
> 5. Paste it below and click Submit
> 
> 📘 Need more help? See the [GitHub Setup Guide] or watch the [How to Submit] video."

**Instruction 2:** "Select one of the projects below to complete and submit via GitHub."
**Location:** MilestonePage Step 1, CapstonePage Step 1
**Problem:** Doesn't explain what "complete" means or what the deliverable is.
**Rewrite:**
> "Pick a project below. You'll build it on your computer using Python, upload it to GitHub, and submit the link. The AI will automatically review your code. You need to score 60/100 to pass."

**Instruction 3:** "Define variables, domains, and constraints clearly (in code or a table in README)."
**Location:** Capstone CSP project requirements
**Problem:** "Define clearly" is vague. A beginner doesn't know what "clear" looks like.
**Rewrite:**
> "Create a table in your README with three columns: Variable, Domain (possible values), and Constraints (rules). For example:
> 
> | Variable | Domain | Constraints |
> |----------|--------|-------------|
> | WA (WA) | {red, green, blue} | WA ≠ NT, WA ≠ SA |
> 
> If you prefer, you can define these directly in Python comments."

**Instruction 4:** (Implicit) "Your repository must contain one Python implementation..."
**Location:** All capstone/milestone requirements
**Problem:** No folder structure guidance.
**Rewrite:** 
> "Your GitHub repository should have this structure:
> ```
> your-repo/
> ├── main.py           # Your solution (the Python file)
> ├── README.md         # Your write-up (see template below)
> └── trace.txt         # Manual traces (if applicable)
> ```

**Instruction 5:** "Write a short README analysis..."
**Location:** Capstone Search project
**Problem:** "Short" is subjective. No structure provided.
**Rewrite:**
> "Your README should include these sections:
> 1. **Overview** (2-3 sentences): What does your program do?
> 2. **How to Run** (1-2 sentences): How do I execute your code?
> 3. **Approach** (3-5 sentences): Which algorithm did you implement and why?
> 4. **Results** (table or bullet list): What paths did each algorithm find?
> 5. **Reflection** (2-3 sentences): What did you learn? What was challenging?"

---

## PART 5 — Difficulty Audit

### Problems to Solve

| Lecture | Avg Difficulty | Expected Time | Common Mistakes | Success Rate (estimated) |
|---------|---------------|---------------|-----------------|-------------------------|
| 1 | 1/10 | 15-30 min | Input parsing, case sensitivity | 90% |
| 2 | 1/10 | 15-30 min | List indexing, `.pop(0)` vs `.pop()` | 90% |
| 3 | 1/10 | 15-30 min | `and`/`or` logic, string comparison | 85% |
| 4 | 1/10 | 15-30 min | Random seed not set, import order | 80% |
| 5 | 2/10 | 20-40 min | While loop logic, boundary conditions | 75% |
| 6 | 2.5/10 | 25-50 min | Perceptron formula, multiple inputs | 70% |
| 7 | 1/10 | 15-30 min | Float precision | 85% |
| 8 | 1/10 | 15-30 min | Whitespace, `.lower()` placement | 90% |
| 9 | 1/10 | 10-20 min | Word count, shallow responses | 95% |
| 10 | 2/10 | 20-40 min | String contains, multiple conditions | 80% |

**Prerequisites:** None. Everything runs in-browser. No setup required.
**Skills required:** Basic Python (variables, if/else, loops, lists, input/output).

### Milestone Projects

| Project | Difficulty | Expected Time | Prerequisites | Common Mistakes |
|---------|-----------|---------------|---------------|-----------------|
| Degrees (BFS) | 5/10 | 3-5 hrs | BFS, Python, file I/O | Not handling CSV parsing, infinite loops |
| Tic-Tac-Toe (Minimax) | 6/10 | 4-6 hrs | Recursion, game trees | Off-by-one in board state evaluation |
| Knights (Logic) | 4/10 | 2-4 hrs | Propositional logic, Python | Model enumeration logic |
| Minesweeper (Inference) | 6/10 | 4-6 hrs | Knowledge bases, inference | Too complex for beginners without guidance |
| PageRank | 5/10 | 3-5 hrs | Probability, Markov chains | Convergence criteria, damping factor |
| Heredity | 6/10 | 4-6 hrs | Bayesian networks, probability | Conditional probability calculation |
| Crossword (CSP) | 5/10 | 3-5 hrs | CSP, backtracking | Constraint definition, arc consistency |
| Shopping (KNN) | 4/10 | 2-4 hrs | KNN, data normalization | Feature scaling, distance metric |
| Nim (Q-Learning) | 7/10 | 5-7 hrs | Reinforcement learning, Q-tables | Hyperparameter tuning, convergence |
| Traffic (CNN) | 7/10 | 5-8 hrs | Neural networks, TensorFlow | TensorFlow setup, GPU issues, dataset size |

**Success rate for beginners:** Estimated 40-60% without support. The AI review is strict — all requirements must be met.

### Capstone Projects

| Project | Difficulty | Expected Time | Prerequisites | Common Mistakes |
|---------|-----------|---------------|---------------|-----------------|
| Search Algorithm Trace | 5/10 | 2-3 hrs | BFS, DFS, A*, heuristics | Heuristic admissibility |
| Logic Puzzle Formalization | 5/10 | 2-3 hrs | Propositional logic, model checking | Biconditional formulation |
| Text Classification (ML) | 7/10 | 3-4 hrs | sklearn, TF-IDF, k-NN | Library installation, dataset loading |
| CSP Formulation | 7/10 | 3-4 hrs | CSP, backtracking, AC-3 | Forward checking implementation |

**Success rate for beginners:** Estimated 30-50% on first attempt. Most will need the resubmission option.

---

## PART 6 — Learning Flow Audit

### Does the progression follow Understand → Observe → Practice → Build → Reflect → Submit → Receive Feedback?

| Step | Problems to Solve | Milestone | Capstone |
|------|------------------|-----------|----------|
| **Understand** | ✅ Lecture content explains concepts | ✅ Lecture content covers algorithms | ✅ All prior lectures build knowledge |
| **Observe** | ❌ No worked example shown | ❌ No sample submission shown | ❌ No sample capstone shown |
| **Practice** | ✅ In-browser coding with test cases | ✅ Build real project from starter code | ✅ Build complete project |
| **Build** | ⚠️ Very small programs (5-15 lines) | ✅ Full project (50-200+ lines) | ✅ Full project (100-400+ lines) |
| **Reflect** | ⚠️ Only in Lecture 9 (reflection type) | ❌ No required reflection/analysis | ⚠️ Required in README but no template |
| **Submit** | ⚠️ "Submit" = run test cases. No formal submission | ✅ GitHub link submission | ✅ GitHub link submission |
| **Receive Feedback** | ✅ Test case results (pass/fail + diff) | ⚠️ AI feedback exists but not shown in UI | ⚠️ AI feedback exists but not shown in UI |

### Gaps

1. **No "Observe" step anywhere.** The learner is never shown one complete example being solved from start to finish.
2. **Reflection is optional/isolated.** Only Lecture 9 has reflection-type problems, and they use the code editor UI which is confusing.
3. **Milestone/Capstone feedback is invisible.** The AI review generates detailed feedback with scores, strengths, and improvements, but none of this is displayed to the learner on the milestone or capstone pages.
4. **No structured "Reflect" phase in milestones.** The learner submits and moves on — no opportunity to reflect on what they learned or what was challenging.

---

## PART 7 — Final Recommendations

### P0 (Must Fix)

| # | Issue | Area | Impact |
|---|-------|------|--------|
| 1 | **Show AI review results (score + feedback) on Milestone/Capstone pages** | Milestone, Capstone | High — learner has no idea if they passed or what to improve |
| 2 | **GitHub setup guide for beginners** | Milestone, Capstone | High — first-year students don't know Git |
| 3 | **README template for all milestone and capstone projects** | Milestone, Capstone | High — "write a README" is too vague |
| 4 | **Fix project ID mismatch** (frontend `search_trace` vs backend `search_visualizer`) | Capstone | High — certificates show raw IDs |
| 5 | **Fix XP display** (frontend says +500, backend awards 100) | Capstone | Medium — false expectation |
| 6 | **Resubmission UI** — show previous attempts, allow resubmit | Milestone, Capstone | High — rejected student has no path forward |
| 7 | **Reflection problems should NOT use code editor** | Problems (Lecture 9, 10) | Medium — confusing interface for essay answers |
| 8 | **Add "How to Submit" walkthrough** | Milestone, Capstone | High — beginner doesn't know the submission flow |

### P1 (Should Improve)

| # | Issue | Area | Impact |
|---|-------|------|--------|
| 9 | **Partial credit display** — show "passed 2/3 tests" not just pass/fail | Problems | Medium — learner should see partial success |
| 10 | **Progressive hint system** — reveal hints one at a time | Problems | Medium — encourages trying before reading hints |
| 11 | **Example walkthrough before first problem** | Problems (Lecture 1) | Medium — sets expectations |
| 12 | **Add "What you'll build" + example to every problem** | Problems | Medium — helps visualize the goal |
| 13 | **Evaluation criteria visible before submission** | Milestone, Capstone | Medium — learner should know what they're graded on |
| 14 | **Add "Connection to lecture" section to every problem** | Problems | Medium — answers "why am I doing this?" |
| 15 | **Remove select-none + copy blocking from ProblemCard** | Problems | ✅ Already done in previous commit |
| 16 | **Fix NEEDS_REVIEW status not in Prisma enum** | Backend | Medium — potential DB error |
| 17 | **Show submission history + status on milestone page** | Milestone | Medium — learner needs visibility |
| 18 | **Fix "PENDING counted as complete"** — wait for real verdict | Milestone | Medium — false sense of progress |

### P2 (Nice to Have)

| # | Issue | Area | Impact |
|---|-------|------|--------|
| 19 | **"Similar Problems to Try" should link to real content** | Problems | Low — currently fake suggestions |
| 20 | **Add problem-level progress to lecture sidebar** | Problems | Low — nice-to-have navigation aid |
| 21 | **Pre-populate GitHub URL from linked account** | Milestone, Capstone | Low — saves typing |
| 22 | **Add "Share on LinkedIn" for certificate** | Capstone | Low — exists in backend, needs UI |
| 23 | **Difficulty badge should reflect true difficulty** | All | Medium — all problems currently tagged "easy" |
| 24 | **Add "Common mistakes" section to problems** | Problems | Low — proactive error prevention |
| 25 | **Certificate preview on CertificationsPage** | Certificate | Low — already shows mockup |
| 26 | **Add quiz score to certificate display** | Certificate | Low — exists in backend, not shown |
| 27 | **Milestone for Lecture 1 (Intro) — currently none** | Milestone | Medium — missing milestone for first topic |

---

## Instructional Designer Review

### For every practical, evaluated:

| Question | Problems to Solve | Milestone | Capstone |
|----------|------------------|-----------|----------|
| **Is the learner told *why* they are doing this?** | ⚠️ Weak. "Apply what you've learned" is generic. | ❌ No explicit "why". Implicit: "demonstrate your knowledge." | ❌ No explicit "why". |
| **Is the learner shown one complete worked example?** | ❌ Never. First problem is attempted cold. | ❌ No sample submission exists. | ❌ No sample capstone exists. |
| **Is there enough guidance without giving away the solution?** | ✅ Good. Hints help without revealing code. | ⚠️ Guidelines exist but lack beginner context (Git, submission). | ⚠️ Requirements are thorough but assume technical readiness. |
| **Can someone with zero GitHub experience finish this?** | ✅ No GitHub needed. Browser-only. | ❌ No GitHub setup guidance. Assumes knowledge. | ❌ Same as Milestone. |
| **At what point will most students become stuck?** | When test case output doesn't match expected (whitespace, formatting). | GitHub setup → linking account → creating repo → knowing folder structure. | Project ID mismatch confusion → GitHub setup → knowing what "passing" looks like. |
| **How can we reduce frustration while preserving learning?** | Show expected vs actual more clearly. Allow partial credit view. | Add GitHub guide, README template, submission checklist, show AI feedback. | Add rubric visibility, README template, sample repo, resubmission path. |

### Key Instructional Design Gaps

1. **No scaffolding across the three experiences.** Problems → Milestones → Capstone should feel like a progression, not three disconnected features. Currently they share no design language, no progress tracking, and no consistent terminology.

2. **Feedback is invisible in the most important experiences.** The AI review produces rich feedback (scores, strengths, improvements, criteria breakdown) but none of this is shown to the learner on the milestone or capstone pages. This is the single biggest missed opportunity.

3. **The "learn to learn" skill is not taught.** The course assumes the learner already knows how to: read technical requirements, break down a problem, use version control, write documentation, seek help effectively.

4. **No error recovery path.** What happens when a learner fails? There's no "here's what went wrong, here's how to fix it" guidance. They just see rejection and have to figure it out.

5. **The three experiences don't feel like a journey.** They feel like three separate pages built by three different teams. Consistent terminology, visual patterns, and progression indicators would help learners see the arc: "I practiced → I built → I created."
