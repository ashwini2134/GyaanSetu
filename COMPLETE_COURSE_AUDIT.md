# AI Course — Complete Instruction Audit (As Implemented)

**Course:** Artificial Intelligence Fundamentals (fundamentals-of-ai)
**Scope:** Lecture 1–10 Problems to Solve, Milestone Projects, Capstone Project
**Date:** July 14, 2026

---

## Lecture 1 — Introduction to AI

### Problems to Solve

#### Problem Screen Heading
**Heading:** "Problems to Solve" (h2)
**Subheading:** "Apply what you've learned by solving these coding challenges."
**Counter badge:** `N/2 solved` (shown in orange, only when `completedProblems.length > 0`)
**No problems available:** "No problems available yet for this module." (only shown when `mainProblems.length === 0`)

#### Problem 1: AI Daily Usage Calculator
**id:** `ai_usage_calculator`
**title:** "AI Daily Usage Calculator"
**difficulty:** easy
**type:** coding

**Full description (exactly as written):**
```
Write a Python program that calculates how many hours per week a user spends on AI tools based on their daily usage.

Your program must:
1. Read an integer representing the number of hours the user spends on AI tools per day.
2. Calculate the weekly usage by multiplying the daily hours by 7.
3. Output a specific message based on the total weekly hours.

Rules:
- If the weekly hours are greater than 10 → Print 'Heavy AI User: [X] hours/week'
- If the weekly hours are 10 or less → Print 'Light AI User: [X] hours/week'

Sample Input:
2

Sample Output:
Heavy AI User: 14 hours/week

Note: Make sure to replace [X] with the actual calculated number!
```

**Hints (3):**
1. "Multiply the `daily_hours` variable by 7 to find the weekly total."
2. "Use an `if` statement to check `if weekly > 10:` and an `else` block for the alternative."
3. "Use an f-string like `f'Heavy AI User: {weekly} hours/week'` to easily insert the calculated number into your print statement."

**Starter code:**
```python
# Read daily hours as an integer
daily_hours = int(input())

# Calculate weekly hours and print the result
```

**Solution:**
```python
daily_hours = int(input())
weekly = daily_hours * 7
if weekly > 10:
    print(f'Heavy AI User: {weekly} hours/week')
else:
    print(f'Light AI User: {weekly} hours/week')
```

**Test cases (3):**
| Label | Input | Expected Output |
|-------|-------|-----------------|
| Heavy user | `2` | `Heavy AI User: 14 hours/week\n` |
| Light user | `1` | `Light AI User: 7 hours/week\n` |
| Edge Case - Exactly 0 | `0` | `Light AI User: 0 hours/week\n` |

#### Problem 2: AI/ML/DL Classifier
**id:** `ai_classifier`
**title:** "AI/ML/DL Classifier"
**difficulty:** easy
**type:** coding

**Full description (exactly as written):**
```
Write a Python program that takes a user's input and prints whether it sounds like AI, Machine Learning, or Deep Learning based on keywords in their answer.

Your program must:
1. Read the user's input string and convert it to lowercase.
2. Check the input against specific keywords to determine the classification.

Rules:
- If input contains 'learn', 'data', 'pattern', 'train', or 'example' → Print 'Machine Learning'
- If input contains 'brain', 'network', 'layer', 'neuron', or 'node' → Print 'Deep Learning'
- Otherwise → Print 'Artificial Intelligence'

Sample Input:
A system that learns patterns from examples

Sample Output:
Machine Learning
```

**Hints (3):**
1. "Create lists of keywords for Deep Learning and Machine Learning."
2. "Use a loop or the 'any()' function to check if a keyword from your list is in the user's input."
3. "Use an if/elif/else structure to prioritize the checks."

**Starter code:**
```python
# AI/ML/DL Classifier
user_input = input().lower()

# Check keywords and classify
# Hint: use 'in' to check if keyword is in user_input
```

**Test cases (4):**
| Label | Input | Expected Output |
|-------|-------|-----------------|
| Machine Learning keywords | `A system that learns patterns from examples` | `Machine Learning\n` |
| Deep Learning keywords | `Brain-like networks with many layers` | `Deep Learning\n` |
| Edge Case - Capitalized Input | `BRAIN-like` | `Deep Learning\n` |
| Fallback AI keywords | `A system to perform a task` | `Artificial Intelligence\n` |

#### Similar A: AGI Timeline Predictor (Similar A)
**id:** `agi_timeline_sim1`
**title:** "AGI Timeline Predictor (Similar A)"
**difficulty:** easy
**type:** coding

**Full description (exactly as written):**
```
Experts frequently debate the timeline for Artificial General Intelligence (AGI). Write a program that takes a user's predicted year for AGI and categorizes their estimate.

Your program must:
1. Read an integer representing the predicted year.
2. Output a specific categorization based on numeric ranges.

Rules:
- If the year is 2025 or earlier → Print 'Very optimistic!'
- If the year is between 2026 and 2050 (inclusive) → Print 'Realistic timeline.'
- If the year is 2051 or later → Print 'Conservative estimate.'

Sample Input:
2040

Sample Output:
Realistic timeline.
```

**Hints (3):**
1. "Start with `if year <= 2025:` to handle the first condition."
2. "Because the `if` handles everything up to 2025, your `elif` only needs to check `year <= 2050` to cover the 2026-2050 range."
3. "Use a final `else:` for anything that doesn't fit the first two conditions (meaning it must be greater than 2050)."

**Starter code:**
```python
# Read the predicted year as an integer
year = int(input())

# Check the ranges using if/elif/else
```

**Test cases (3):**
| Label | Input | Expected Output |
|-------|-------|-----------------|
| Optimistic | `2024` | `Very optimistic!\n` |
| Realistic boundary | `2026` | `Realistic timeline.\n` |
| Conservative | `2060` | `Conservative estimate.\n` |

#### Similar B: Simple Chatbot Rules (Similar B)
**id:** `chatbot_greeting_sim2`
**title:** "Simple Chatbot Rules (Similar B)"
**difficulty:** easy
**type:** coding

**Full description (exactly as written):**
```
Write a Python program that acts as a simple rule-based Chatbot.

Your chatbot must:
1. Ask the user 'How are you feeling today?'
2. Read the user's input and make it case-insensitive
3. Respond based on specific exact matches

Rules:
- If input is 'happy' → Print 'That is great to hear!'
- If input is 'sad' → Print 'I hope your day gets better.'
- Otherwise → Print 'I see. Tell me more.'

Sample Input:
happy

Sample Output:
How are you feeling today?
That is great to hear!
```

**Hints (2):**
1. "Use the `input()` function to get the user's feelings and convert it to `.lower()` immediately."
2. "Check for equality `== 'happy'` rather than using the `in` keyword, since we want exact mood matches."

**Starter code:**
```python
# Simple Chatbot
print('How are you feeling today?')
feeling = input().lower().strip()

# Add your rule-based responses here
```

**Test cases (3):**
| Label | Input | Expected Output |
|-------|-------|-----------------|
| User is happy | `happy` | `How are you feeling today?\nThat is great to hear!\n` |
| User is sad (uppercase) | `SAD` | `How are you feeling today?\nI hope your day gets better.\n` |
| User is tired (fallback) | `tired` | `How are you feeling today?\nI see. Tell me more.\n` |

---

### Problems Screen UI (LecturePage.tsx lines 465-543)
- **Section heading:** "Problems to Solve" (h2)
- **Subheading text:** "Apply what you've learned by solving these coding challenges."
- **Progress indicator:** `{completedProblems.length}/{mainProblems.length} solved` shown in orange text, only visible when at least 1 problem is completed.
- **Main problems:** First 2 problems from problems.json rendered as ProblemCard components.
- **Similar Questions heading:** "Similar Questions" (h3) with a lightning bolt SVG icon (emerald-500), shown only when `similarProblems.length > 0`.
- **Similar questions** are rendered below a border-top separator, also as ProblemCard components.

### ProblemCard Component (ProblemCard.tsx)
**Collapsed state:**
- Rounded card with border, hover effect.
- Index badge (blue circle with number) or checkmark icon if solved.
- Problem title text (truncated with ellipsis).
- "Solved" badge (emerald, with checkmark) if `allPassed`, otherwise difficulty badge (colored by difficulty: emerald for easy, amber for medium, red for hard).
- Chevron icon pointing right.
- Click anywhere on the card to open/expand.

**Expanded state:**
- Watermark overlay: student name and email repeated diagonally across entire card (opacity 0.07, `select-none`, rotated -22 degrees). This is a `pointer-events-none` overlay with 80 repetitions of the watermark text.
- Completion overlay: When `showCompletion` is true, a `z-10` overlay covers the card with a bounce animation showing a checkmark circle, "Problem Solved" text, and "Great job!" text. Auto-hides after 1500ms.
- **Header bar:** Difficulty badge (colored), problem title, "Solved" indicator (if allPassed), close button (X icon).
- **Tab bar:** Two tabs: `description` | `hints`. Blue underline on active tab.
- **Description tab (left column):** Problem description text rendered with `whitespace-pre-line`. After solving: "Similar Problems to Try (Optional)" box with auto-generated suggestions (e.g., "→ Advanced [Title] Challenge", "→ [Title] using built-in functions" — these are string replacements, not real links).
- **Test cases list:** "Test Cases (N)" heading with numbered circles and labels, shown only if `totalCount > 0`.
- **Code Editor (right column):** Monaco editor loaded via `@monaco-editor/react`, language Python, height 240px. Shows starter code or saved draft.
- **Console Output:** Shown after clicking Run (green/red styled pre block). 
- **Submission Results:** Shown after clicking Submit. Header: "All tests passed!" (emerald) or "Passed: X/Y" (amber). Then per-test-case results showing "Submission Result" heading, each test case with pass/fail icon (checkmark or X), label, line-by-line diff with Expected Output (green) and Actual Output (red), and explanation (blue info box). Fallback raw display when diff lines are empty.
- **Hints tab:** "Hints" heading with blue info box, bullet list of hint texts. If no hints, generic message: "Try breaking the problem into smaller steps. Think about what each line of code needs to do."

**ProblemCard Buttons:**
- **Close button** (X icon in header) — collapses the card.
- **Run button** — executes code without test cases, shows console output.
- **Submit button** — runs all test cases, shows submission results. For reflection type: checks word count >= 20.

**Submission logic:**
- Draft auto-saved on every Run/Submit via `POST /drafts`.
- Reflection type: checks word count, requires ≥20 words, shows error: "Reflection needs more detail. Please write at least 20 words (currently X)."
- Coding type: runs test cases via `runPython()` (MiniPython interpreter), compares expected vs actual output using `normalizeNumbers()` and `stripPrompts()`.
- Match types: `exact` (default), `regex`, `any_lines`.
- Pass/fail per test case with character-level mismatch explanation.
- All must pass for completion; no partial credit to mark as "solved".
- On completion: `setAllPassed(true)`, `onComplete(problem.id)` callback, showCompletion overlay auto-hides 1500ms.

---

### Milestone

Lecture 1 has no milestone projects defined in PROJECT_CONFIGS. The MilestonePage falls back to lecture '2' projects when '1' is requested.

### Summary

**SummaryCard** renders three sections:
1. **Key Takeaways** — green-bordered card with summary.takeaways items in 2-column grid.
2. **You Now Know** — blue-bordered card with summary.learned items.
3. **Lecture Complete!** — Graduate cap icon, "Lecture Complete!" heading, lecture title, and a button.

**Button behavior for Lecture 1:** `customButtonLabel = 'Next: Milestone Project'` (since lectures 1-6 have custom button). Click navigates to `/course/fundamentals-of-ai/lecture/1/milestone`.

---

## Lecture 2 — Search Algorithms

### Problems to Solve

Same screen structure as Lecture 1. 

#### Problem 1: BFS Queue Simulator
**id:** `maze_bfs_trace`
**title:** "BFS Queue Simulator"
**difficulty:** easy
**type:** coding

**Full description (exactly as written):**
```
In Breadth-First Search (BFS), we use a Queue (First-In, First-Out) to explore nodes. Write a program that simulates a single step of a BFS queue.

Your program must:
1. Read a comma-separated string of current queue nodes (e.g., 'A,B,C').
2. Read a new node to add to the queue (e.g., 'D').
3. Remove the FIRST node from the queue.
4. Add the new node to the END of the queue.
5. Print the removed node and the new queue.

Sample Input:
A,B,C
D

Sample Output:
Removed: A
New Queue: ['B', 'C', 'D']
```

**Hints (3):**
1. "Use `.pop(0)` to remove the first element of the list."
2. "Use `.append()` to add the new node to the end."
3. "Use f-strings to match the exact output format."

**Starter code:**
```python
current_queue = input().strip().split(',')
new_node = input().strip()

# Your code here
```

**Test cases (3):**
| Label | Input | Expected Output |
|-------|-------|-----------------|
| Standard Queue | `A,B,C\nD` | `Removed: A\nNew Queue: ['B', 'C', 'D']\n` |
| Two items | `X,Y\nZ` | `Removed: X\nNew Queue: ['Y', 'Z']\n` |
| Single item | `A\nB` | `Removed: A\nNew Queue: ['B']\n` |

#### Problem 2: Graph Representation
**id:** `graph_neighbors`
**title:** "Graph Representation"
**difficulty:** easy
**type:** coding

**Full description (exactly as written):**
```
Write a Python program that defines a hardcoded graph and prints the neighbors of a given node.

Your program must:
1. Use this exact dictionary for the graph:
   `graph = {'A': ['B', 'C'], 'B': ['A', 'D'], 'C': ['A'], 'D': ['B']}`
2. Ask the user to input a node letter.
3. Print the list of neighbors for that node. If the node doesn't exist, print 'Node not found'.

Sample Input:
B

Sample Output:
['A', 'D']
```

**Hints (2):**
1. "Use the `in` keyword to check if the node exists as a key in the dictionary."
2. "If it exists, you can access the neighbors using `graph[node]`."

**Starter code:**
```python
graph = {'A': ['B', 'C'], 'B': ['A', 'D'], 'C': ['A'], 'D': ['B']}
node = input().strip().upper()

# Your code here
```

**Test cases (3):**
| Label | Input | Expected Output |
|-------|-------|-----------------|
| Node A | `A` | `['B', 'C']\n` |
| Node C | `C` | `['A']\n` |
| Invalid Node | `Z` | `Node not found\n` |

#### Similar A: DFS Stack Simulator (Similar A)
**id:** `maze_dfs_trace_sim1`
**title:** "DFS Stack Simulator (Similar A)"
**difficulty:** easy
**type:** coding

**Full description (exactly as written):**
```
In Depth-First Search (DFS), we use a Stack (Last-In, First-Out) to explore nodes. Write a program that simulates a single step of a DFS stack.

Your program must:
1. Read a comma-separated string of current stack nodes (e.g., 'A,B,C').
2. Read a new node to add to the stack (e.g., 'D').
3. Remove the LAST node from the stack.
4. Add the new node to the END of the stack.
5. Print the removed node and the new stack.

Sample Input:
A,B,C
D

Sample Output:
Removed: C
New Stack: ['A', 'B', 'D']
```

**Hints (3):**
1. "Use `.pop()` (without an index) to remove the last element of the list."
2. "Use `.append()` to add the new node to the top of the stack."
3. "Compare this LIFO behavior to the FIFO behavior of BFS!"

**Starter code:**
```python
current_stack = input().strip().split(',')
new_node = input().strip()

# Your code here
```

**Test cases (3):**
| Label | Input | Expected Output |
|-------|-------|-----------------|
| Standard Stack | `A,B,C\nD` | `Removed: C\nNew Stack: ['A', 'B', 'D']\n` |
| Two items | `X,Y\nZ` | `Removed: Y\nNew Stack: ['X', 'Z']\n` |
| Single item | `A\nB` | `Removed: A\nNew Stack: ['B']\n` |

#### Similar B: Graph Connection Check (Similar B)
**id:** `graph_connection_sim2`
**title:** "Graph Connection Check (Similar B)"
**difficulty:** easy
**type:** coding

**Full description (exactly as written):**
```
Write a Python program that checks if two nodes are directly connected in a graph.

Your program must:
1. Use this exact dictionary for the graph:
   `graph = {'A': ['B', 'C'], 'B': ['A', 'D'], 'C': ['A'], 'D': ['B']}`
2. Ask the user for Node 1.
3. Ask the user for Node 2.
4. If Node 2 is in Node 1's neighbor list, print 'Connected'. Otherwise, print 'Not Connected'.

Sample Input:
A
C

Sample Output:
Connected
```

**Hints (2):**
1. "First, make sure Node 1 actually exists in the graph dictionary."
2. "Then, check if Node 2 is `in` the list `graph[node1]`."

**Starter code:**
```python
graph = {'A': ['B', 'C'], 'B': ['A', 'D'], 'C': ['A'], 'D': ['B']}
node1 = input().strip().upper()
node2 = input().strip().upper()

# Your code here
```

**Test cases (3):**
| Label | Input | Expected Output |
|-------|-------|-----------------|
| Connected nodes | `A\nC` | `Connected\n` |
| Not connected | `C\nD` | `Not Connected\n` |
| Invalid node | `Z\nA` | `Not Connected\n` |

---

### Milestone Projects (Lecture 2)

Navigated to from Summary via `/course/fundamentals-of-ai/lecture/2/milestone`.

**MilestonePage** is a 3-step wizard.

**Step 1 — Choose Project screen:**
- Hero badge: "Milestone Challenge" (small text, teal colored, rounded)
- Heading: "Select Your" + "Milestone" (in brand primary color)
- Subtitle: "Demonstrate your AI knowledge. Select one of the projects below to complete and submit via GitHub."
- Skills tags: 9 skills displayed with green checkmarks: Search Algorithms, Propositional Logic, Inference, Machine Learning, NLP, Optimization, CSP, Heuristics, Model Evaluation
- Project cards: 2-column grid. Each card shows title, difficulty badge, description, key concepts tags.
- Buttons: "Select Project" / "Selected" (when active, brand-primary filled) / "Locked".
- Selected project details bar: 4-column grid showing Estimated Time, Difficulty, Skills, What You'll Build.
- Footer: project name or "Select a project to continue" text, "Configure Requirements" button.
- **If already submitted:** Warning banner: "Project Already Submitted — You have already submitted this project. Please proceed to the next required project to complete the milestone."

**Step 2 — Requirements screen:**
- Heading: "Requirements & Scope" + project title
- "Download Starter Code & Dataset" button (link to ZIP file) — only shown if `downloadUrl` exists
- "Core Objective" card with full goal text
- Two-column grid:
  - "Technical Checklist" — bullet list of features (checked with teal dots)
  - "Expected Program Execution Flow" — numbered list of steps
- Footer: "← Switch Project" button, "Submit Project" button

**Step 3 — Submit Project screen:**
- Project Summary card: title, description, difficulty badge, skills tags
- Requirements Summary card: requirements list with CheckCircle icons
- GitHub Submission Form:
  - Label: "Submit Your Project"
  - Instruction text: "Push your completed project to a GitHub repository and submit the link below."
  - Input: GitHub Repository URL text field with placeholder `https://github.com/your-username/your-repo`
  - Validation: URL must start with `https://github.com/` — error message: "URL must start with https://github.com/"
  - Submit button: "Submit Project" (Send icon), disabled when no URL or already submitted. States: "Submitting..." (spinner), "Project Submitted" (green, disabled, CheckCircle icon)
  - Error banner: shows submit error in red
  - Success banner when submitted: "Project submitted successfully!" with "Your capstone project has been recorded." (note: says "capstone" even though this is milestone)
- Navigation: "← Back to Requirements" button

**Submission flow:**
- Calls `useProjectStatus.submitProject(githubUrl, "Milestone submission")` which triggers `POST /student/projects/:projectId/submit`
- Creates `ProjectSubmission` with status PENDING
- AI review runs asynchronously
- Status polls every 5s until APPROVED or REJECTED
- `isProject1Completed` / `isProject2Completed` = `status === 'APPROVED' || status === 'PENDING'` (PENDING counts as complete)
- When `bothCompleted` (all projects submitted), auto-navigates to next lecture after 1500ms

**"Both Completed" banner:** (shown below Step 3, above footer)
- "All Milestones Completed" heading with CheckCircle icon
- Text: "You have successfully submitted all milestone projects for this lecture."
- "Continue to Next Lecture →" button

**Hidden "Certificate" step:** (MilestonePage lines 943-1086)
- Rendered when `(step as string) === 'Certificate'` — but the wizard never transitions to this step
- Shows false/true ternary (always shows false branch)
- False branch: "Project Passed!" with Validation Results (from `evaluationChecklist` — all hardcoded check: () => true), Project Summary (hardcoded: "All requirements completed", "All tests passed", "Code quality: Good", "Execution successful"), Your Reward (+500 XP, Certificate Unlocked, Course Progress Updated)
- True branch: Certificate widget (gold-bordered card, "Certificate of Completion", student name, course name, date)
- Buttons: "View Summary" (does console.log(true)), "Back to Dashboard"

---

#### Project: Degrees
**id:** `fundamentals-of-ai-degrees`
**title:** "Degrees"
**Skills:** Search Algorithms, BFS, Graph Traversal, Python
**Difficulty:** Intermediate
**Estimated time:** 2-4 Hours
**Goal:** "According to the Six Degrees of Kevin Bacon game, anyone in the Hollywood film industry can be connected to Kevin Bacon within six steps. You will use breadth-first search to find the shortest path between any two actors."

**Features (Technical Checklist):**
1. "Load CSV data into memory"
2. "Model the data as a graph"
3. "Implement Breadth-First Search (BFS)"
4. "Trace path back from target to source"

**Expected Program Execution Flow:**
1. "Download the small dataset distribution"
2. "Review the provided data structures (Node, StackFrontier, QueueFrontier)"
3. "Implement the shortest_path function in degrees.py"
4. "Run the program to see the shortest path between two given actors"

**Requirements:**
- "Complete the shortest_path function in degrees.py"
- "The function should return a list of (movie_id, person_id) tuples"
- "Your program should work for any two actors in the dataset"
- "Do not modify the existing data loading logic"

**Guidelines:**
- "Data Structures — Use a QueueFrontier for Breadth-First Search. This guarantees finding the shortest path."
- "Node Representation — Each state is a person. The action is the movie they starred in to reach the next person."
- "Performance — Make sure you do not explore the same state multiple times by keeping track of an explored set."

**Evaluation Checklist (all hardcoded check: () => true):**
- "shortest_path implemented — Returns correct sequence of movies and actors"
- "Uses BFS — Utilizes QueueFrontier for optimal path finding"
- "Handles disconnected actors — Returns None if no path exists"

**Download URL:** `/data/fundamentals-of-ai/lecture_2/degrees/small.zip`

---

#### Project: Tic-Tac-Toe
**id:** `fundamentals-of-ai-tictactoe`
**title:** "Tic-Tac-Toe"
**Skills:** Adversarial Search, Minimax, Game Trees, Python
**Difficulty:** Intermediate
**Estimated time:** 3-5 Hours
**Goal:** "Implement an AI that plays Tic-Tac-Toe optimally. The AI should never lose. If the human plays optimally, the game will tie. If the human makes a mistake, the AI will win."

**Features (Technical Checklist):**
1. "Implement player(), actions(), result(), winner(), terminal(), utility(), and minimax()"
2. "Ensure the AI plays optimally"
3. "Optional: Implement Alpha-Beta Pruning for speed"

**Expected Program Execution Flow:**
1. "Download the tictactoe starter code and requirements.txt"
2. "Install pygame via pip"
3. "Implement the minimax algorithm and helper functions"
4. "Play the game against your AI to verify it never loses"

**Requirements:**
- "Complete all the missing functions in tictactoe.py"
- "Do not modify runner.py"
- "Your AI must play optimally (never lose)"
- "Your AI should evaluate game states correctly"

**Guidelines:**
- "Minimax Logic — The max player tries to maximize the score, and the min player tries to minimize it."
- "Helper Functions — Implement terminal() and utility() first. Then build minimax() on top of them."
- "Alpha-Beta Pruning — If your AI takes too long to think, add alpha-beta pruning to speed it up."

**Evaluation Checklist (all hardcoded check: () => true):**
- "Helper functions working — actions, result, winner, terminal, utility are correct"
- "Minimax implemented — AI makes optimal moves and never loses"
- "Plays correctly — Game logic properly ends with a win, loss, or tie"

**Download URL:** `/data/fundamentals-of-ai/lecture_2/tictactoe/tictactoe.zip`

### Summary

Same SummaryCard as Lecture 1. Button label: "Next: Milestone Project" (since lecture 2 is in the 1-6 range). Navigates to `/course/fundamentals-of-ai/lecture/2/milestone`.

---

## Lecture 3 — Knowledge & Logic

### Problems to Solve

#### Problem 1: Logic Puzzle Solver
**id:** `logic_puzzle`
**title:** "Logic Puzzle Solver"
**difficulty:** easy
**type:** coding

**Full description (exactly as written):**
```
Write a program that solves a logic puzzle based on strict rules. We know that Alice has a dog, a cat, or a bird.

Your program must:
1. Read what animal Alice has (user input).
2. Apply the following logical rules:
   - If Alice has a 'dog', then Bob has a 'bird'.
   - If Alice has a 'cat', then Bob has a 'dog'.
   - If Alice has a 'bird', then Bob has a 'cat'.
3. Print what Bob has in the format 'Bob has a [animal]'.
   If the input is not dog, cat, or bird, print 'Invalid input'.

Sample Input:
dog

Sample Output:
Bob has a bird
```

**Hints (2):**
1. "Use an `if/elif/else` structure to check each possible animal Alice might have."
2. "Remember to handle the fallback case with `else` for invalid inputs."

**Starter code:**
```python
alice_animal = input().strip().lower()

# Your code here
```

**Test cases (3):**
| Label | Input | Expected Output |
|-------|-------|-----------------|
| Alice has dog | `dog` | `Bob has a bird\n` |
| Alice has bird | `bird` | `Bob has a cat\n` |
| Invalid | `fish` | `Invalid input\n` |

#### Problem 2: Daily Rules Validator
**id:** `daily_rules`
**title:** "Daily Rules Validator"
**difficulty:** easy
**type:** coding

**Full description (exactly as written):**
```
Write a Python program that applies multiple conditions to decide an outcome based on weather and the day of the week.

Your program must:
1. Read the weather ('rain' or 'sun').
2. Read the day type ('weekend' or 'weekday').
3. Apply these rules:
   - If weekday AND rain -> Print 'Work from home'
   - If weekday AND sun -> Print 'Go to office'
   - If weekend -> Print 'Relax at home'
   - Otherwise -> Print 'Invalid input'

Sample Input:
rain
weekday

Sample Output:
Work from home
```

**Hints (2):**
1. "Use the `and` logical operator to check two conditions at once in your `if` statement."
2. "Make sure you handle exactly 'weekend' correctly without needing to check the weather."

**Starter code:**
```python
weather = input().strip().lower()
day_type = input().strip().lower()

# Your code here
```

**Test cases (3):**
| Label | Input | Expected Output |
|-------|-------|-----------------|
| Rainy weekday | `rain\nweekday` | `Work from home\n` |
| Sunny weekday | `sun\nweekday` | `Go to office\n` |
| Sunny weekend | `sun\nweekend` | `Relax at home\n` |

#### Similar A: Deductive Reasoning Checker (Similar A)
**id:** `deductive_reasoning_sim1`
**title:** "Deductive Reasoning Checker (Similar A)"
**difficulty:** easy
**type:** coding

**Full description (exactly as written):**
```
Write a program that evaluates the logical consistency of an event based on a premise. Premise: 'If it snows, the flight is canceled.'

Your program must:
1. Read whether it snowed ('yes' or 'no').
2. Read whether the flight was canceled ('yes' or 'no').
3. Print 'Consistent' if the outcomes obey the premise.
4. Print 'Inconsistent' if it snowed but the flight was NOT canceled (which violates the premise!).

Note: If it didn't snow, the flight could be canceled for another reason, so that's still 'Consistent'.

Sample Input:
yes
no

Sample Output:
Inconsistent
```

**Hints (2):**
1. "The only way this premise is violated (inconsistent) is if the condition happens (snows) but the guaranteed result does NOT happen."
2. "You only need one `if` statement for the violation, and an `else` for everything else!"

**Starter code:**
```python
snowed = input().strip().lower()
canceled = input().strip().lower()

# Your code here
```

**Test cases (3):**
| Label | Input | Expected Output |
|-------|-------|-----------------|
| Violates premise | `yes\nno` | `Inconsistent\n` |
| Follows premise | `yes\nyes` | `Consistent\n` |
| Other reason | `no\nyes` | `Consistent\n` |

#### Similar B: Movie Recommendation Rules (Similar B)
**id:** `movie_recommendation_sim2`
**title:** "Movie Recommendation Rules (Similar B)"
**difficulty:** easy
**type:** coding

**Full description (exactly as written):**
```
Write a Python program that uses logic to recommend a movie rating based on age and genre.

Your program must:
1. Ask the user for a genre ('action' or 'comedy').
2. Ask for their age (integer).
3. Apply these rules:
   - If age < 13 AND genre is 'action' -> Print 'PG Action'
   - If age >= 13 AND genre is 'action' -> Print 'PG-13 Action'
   - If genre is 'comedy' -> Print 'PG Comedy' (regardless of age)
   - Otherwise -> Print 'Unknown'

Sample Input:
action
10

Sample Output:
PG Action
```

**Hints (2):**
1. "Remember to convert the `age` input to an integer before comparing it with `< 13`."
2. "Use `and` to combine age and genre conditions."

**Starter code:**
```python
genre = input().strip().lower()
age = int(input().strip())

# Your code here
```

**Test cases (3):**
| Label | Input | Expected Output |
|-------|-------|-----------------|
| Young Action | `action\n10` | `PG Action\n` |
| Older Action | `action\n15` | `PG-13 Action\n` |
| Comedy ignores age | `comedy\n40` | `PG Comedy\n` |

---

### Milestone Projects (Lecture 3)

Same MilestonePage structure. Two projects available.

#### Project: Knights
**id:** `fundamentals-of-ai-knights`
**title:** "Knights"
**Skills:** Propositional Logic, Model Checking, Python
**Difficulty:** Intermediate
**Estimated time:** 2-4 Hours
**Goal:** "Represent the rules of Knights and Knaves puzzles in propositional logic, and write a model-checking algorithm to solve them automatically."

**Features (Technical Checklist):**
1. "Represent clues as logical sentences"
2. "Use logical connectives (And, Or, Not, Implication, Biconditional)"
3. "Run a model checking algorithm to find the unique solution"

**Expected Program Execution Flow:**
1. "Download the knights starter code"
2. "Review logic.py to understand the logic representation"
3. "Translate the puzzles into knowledge bases in puzzle.py"
4. "Run the program to let the AI solve the puzzles"

**Requirements:**
- "Complete the knowledge bases (knowledge0, knowledge1, knowledge2, knowledge3) in puzzle.py"
- "Do not modify logic.py"
- "Each knowledge base must contain the rules of the game and the specific spoken clues"

**Guidelines:**
- "Game Rules — Every character is either a knight (always tells the truth) or a knave (always lies). They cannot be both."
- "Translating Clues — If character A says 'I am a knight', that is a biconditional: A is a knight if and only if 'I am a knight' is true."
- "Testing — The model checking algorithm should print exactly one solution per puzzle."

**Evaluation Checklist (all hardcoded check: () => true):**
- "Puzzle 0 solved — AI correctly identifies characters in Puzzle 0"
- "Puzzle 3 solved — AI correctly identifies characters in the hardest puzzle"
- "Proper constraints — Rules of Knights and Knaves are included in every knowledge base"

**Download URL:** `/data/fundamentals-of-ai/lecture_3/knights/knights.zip`

---

#### Project: Minesweeper
**id:** `fundamentals-of-ai-minesweeper`
**title:** "Minesweeper"
**Skills:** Knowledge Representation, Inference, Python
**Difficulty:** Hard
**Estimated time:** 4-6 Hours
**Goal:** "Build a knowledge-based agent that plays Minesweeper. The AI will deduce which cells are safe and which contain mines based on the numbers revealed on the board."

**Features (Technical Checklist):**
1. "Maintain a knowledge base of logical sentences"
2. "Infer new safe cells and mines"
3. "Make safe moves when possible, and random moves when necessary"

**Expected Program Execution Flow:**
1. "Download the minesweeper starter code and install pygame"
2. "Implement the Sentence class methods for logic evaluation"
3. "Implement the MinesweeperAI methods to manage knowledge and make moves"
4. "Play the game with the AI button to watch it win automatically"

**Requirements:**
- "Complete the Sentence class in minesweeper.py (known_mines, known_safes, mark_mine, mark_safe)"
- "Complete the MinesweeperAI class (add_knowledge, make_safe_move, make_random_move)"
- "Do not modify runner.py"

**Guidelines:**
- "Subsets Inference — If set1 is a subset of set2, you can infer new rules by subtracting set1 from set2 and updating the mine count."
- "Updating Knowledge — When you deduce a mine or safe cell, you must update ALL sentences in the knowledge base that contain that cell."
- "Random Moves — Only make a random move if no safe moves are guaranteed. Never guess a cell known to be a mine."

**Evaluation Checklist (all hardcoded check: () => true):**
- "Sentence methods work — Can correctly identify known mines and safe cells from a single sentence"
- "AI adds knowledge — add_knowledge correctly creates sentences and infers new information"
- "AI makes safe moves — The AI never blows up when a guaranteed safe move exists"

**Download URL:** `/data/fundamentals-of-ai/lecture_3/minesweeper/minesweeper.zip`

---

## Lecture 4 — Probability & Uncertainty

### Problems to Solve

#### Problem 1: Simulate Coin Flips
**id:** `flip_coin`
**title:** "Simulate Coin Flips"
**difficulty:** easy
**type:** coding

**Full description (exactly as written):**
```
Write a Python program that simulates flipping a coin multiple times using a random number generator.

Your program must:
1. Read an integer `n` representing the number of flips.
2. Use a `for` loop to flip a coin `n` times.
3. For each flip, generate a random number between 0 and 1 using `random.random()`. If it's < 0.5, count it as Heads, otherwise Tails.
4. Print the total number of Heads.

*Note: A random seed is set automatically so test cases output predictable numbers!*

Sample Input:
10

Sample Output:
Heads: 6
```

**Hints (2):**
1. "Use `for _ in range(flips):` to loop exactly `n` times."
2. "Inside the loop, use an `if random.random() < 0.5:` block to increment your `heads_count`."

**Starter code:**
```python
import random
random.seed(42) # Do not remove this line

flips = int(input())
heads_count = 0

# Your loop here

print(f'Heads: {heads_count}')
```

**Test cases (3):**
| Label | Input | Expected Output |
|-------|-------|-----------------|
| 10 Flips | `10` | `Heads: 6\n` |
| 100 Flips | `100` | `Heads: 50\n` |
| 1 Flip | `1` | `Heads: 0\n` |

#### Problem 2: Python Coin Simulator
**id:** `coin_sim`
**title:** "Python Coin Simulator"
**difficulty:** easy
**type:** coding

**Full description (exactly as written):**
```
Let's use the random module to simulate 100 coin flips. We want to see if we get exactly 50 heads and 50 tails.

Your program must:
1. Use a loop to simulate 100 flips.
2. Use `random.choice(['H', 'T'])` to pick Heads or Tails.
3. Count the total number of Heads.
4. Print ONLY the integer number of Heads.

*Note: We've hardcoded a random seed so the output is predictable for grading.*

Sample Input:
(no input needed, just run 100 iterations)

Sample Output:
46
```

**Hints (2):**
1. "You don't need any `input()` for this problem. Just write a `for` loop that runs 100 times."
2. "Keep a counter variable. If `random.choice(['H', 'T'])` returns `'H'`, increase the counter."

**Starter code:**
```python
import random
random.seed(10) # Do not remove

# Your code here to simulate 100 flips
```

**Test cases (1):**
| Label | Input | Expected Output |
|-------|-------|-----------------|
| Run 100 flips | `` | `46\n` |

#### Similar A: Dice Roll Experiment (Similar A)
**id:** `dice_roll_exp_sim1`
**title:** "Dice Roll Experiment (Similar A)"
**difficulty:** easy
**type:** coding

**Full description (exactly as written):**
```
If you roll a 6-sided die, the theoretical probability of rolling a '3' is 1/6. Let's test this experimentally!

Your program must:
1. Read an integer `n` representing the number of dice rolls.
2. Simulate `n` rolls using `random.randint(1, 6)`.
3. Count how many times a '3' is rolled.
4. Print the final count in the format: `Rolled a 3 [X] times`

Sample Input:
10

Sample Output:
Rolled a 3 2 times
```

**Hints (2):**
1. "Use `random.randint(1, 6)` to generate a number from 1 to 6 inclusive."
2. "Compare the result to `3` and increment your counter if they match."

**Starter code:**
```python
import random
random.seed(7) # Do not remove

rolls = int(input())
count_of_threes = 0

# Your loop here

print(f'Rolled a 3 {count_of_threes} times')
```

**Test cases (3):**
| Label | Input | Expected Output |
|-------|-------|-----------------|
| 10 Rolls | `10` | `Rolled a 3 2 times\n` |
| 60 Rolls | `60` | `Rolled a 3 5 times\n` |
| 0 Rolls | `0` | `Rolled a 3 0 times\n` |

#### Similar B: Python Dice Simulator (Similar B)
**id:** `python_dice_sim2`
**title:** "Python Dice Simulator (Similar B)"
**difficulty:** easy
**type:** coding

**Full description (exactly as written):**
```
Write Python using the random module to simulate rolling a 6-sided die exactly 1000 times.

Your program must:
1. Run a loop 1000 times.
2. Use `random.randint(1, 6)` for each roll.
3. Count how many times you roll a '6'.
4. Print just that integer count.

*Note: We've hardcoded a random seed so the output is predictable.*

Sample Output:
164
```

**Hints (2):**
1. "This is very similar to the coin flip simulator, but the loop runs 1000 times."
2. "Only count the iterations where `random.randint(1, 6) == 6`."

**Starter code:**
```python
import random
random.seed(99) # Do not remove

# Your code here to simulate 1000 rolls
```

**Test cases (1):**
| Label | Input | Expected Output |
|-------|-------|-----------------|
| Run 1000 rolls | `` | `164\n` |

---

### Milestone Projects (Lecture 4)

Two projects available.

#### Project: PageRank
**id:** `fundamentals-of-ai-pagerank`
**title:** "PageRank"
**Skills:** Probability, Markov Models, Python
**Difficulty:** Intermediate
**Estimated time:** 2-4 Hours
**Goal:** "Implement a model of a random surfer to calculate the PageRank of web pages. Use both a sampling method and an iterative mathematical method."

**Features (Technical Checklist):**
1. "Parse a corpus of HTML pages"
2. "Implement the random surfer model using a Markov Chain"
3. "Calculate probabilities through sampling"
4. "Calculate exact probabilities iteratively"

**Expected Program Execution Flow:**
1. "Download the pagerank starter code"
2. "Review the provided corpus data"
3. "Implement transition_model, sample_pagerank, and iterate_pagerank"
4. "Run the program to see page rankings for different corpora"

**Requirements:**
- "Complete transition_model to return a probability distribution"
- "Complete sample_pagerank to estimate PageRank by sampling"
- "Complete iterate_pagerank to calculate PageRank iteratively"
- "Use DAMPING = 0.85 and SAMPLES = 10000 constants"

**Guidelines:**
- "Damping Factor — With probability 0.85, the surfer chooses a link on the current page. With probability 0.15, the surfer chooses randomly among all pages."
- "Dead Ends — If a page has no links, assume it links to all pages in the corpus (including itself)."
- "Convergence — The iterative algorithm stops when no PageRank value changes by more than 0.001."

**Evaluation Checklist (all hardcoded check: () => true):**
- "Transition model correct — Correctly handles damping factor and dead ends"
- "Sampling approach works — Estimates match expected values closely"
- "Iterative approach works — Converges to the correct mathematical probabilities"

**Download URL:** `/data/fundamentals-of-ai/lecture_4/pagerank/pagerank.zip`

---

#### Project: Heredity
**id:** `fundamentals-of-ai-heredity`
**title:** "Heredity"
**Skills:** Bayesian Networks, Inference, Python
**Difficulty:** Hard
**Estimated time:** 3-5 Hours
**Goal:** "Implement a Bayesian Network to calculate the probability that a person has a specific gene mutation and exhibits a trait, based on their family tree."

**Features (Technical Checklist):**
1. "Parse family tree data from CSV"
2. "Use a Bayesian Network representing genes and traits"
3. "Calculate joint probabilities"
4. "Update marginal probabilities and normalize them"

**Expected Program Execution Flow:**
1. "Download the heredity starter code"
2. "Understand the PROBS dictionary containing genetic probabilities"
3. "Implement joint_probability, update, and normalize"
4. "Run the program to see probability distributions for each person"

**Requirements:**
- "Complete joint_probability to calculate the probability of a specific state"
- "Complete update to add a new joint probability to the existing distribution"
- "Complete normalize to ensure probabilities sum to 1"

**Guidelines:**
- "Joint Probability — For anyone with parents in the dataset, their genes depend on their parents. For anyone without parents, use the unconditional probability."
- "Mutations — Remember that genes can mutate. A parent passing a gene might mutate (fail to pass), and a parent not passing a gene might mutate (pass it anyway)."
- "Normalization — To normalize a dictionary of values, divide each value by the sum of all values."

**Evaluation Checklist (all hardcoded check: () => true):**
- "Joint probability accurate — Correctly multiplies probabilities across the family tree"
- "Update function — Properly accumulates probabilities"
- "Normalization works — Final distributions sum exactly to 1.0"

**Download URL:** `/data/fundamentals-of-ai/lecture_4/heredity/heredity.zip`

---

## Lecture 5 — Optimization

### Problems to Solve

#### Problem 1: Sudoku Row Validator
**id:** `simple_sudoku`
**title:** "Sudoku Row Validator"
**difficulty:** easy
**type:** coding

**Full description (exactly as written):**
```
In Constraint Satisfaction, Sudoku requires each row to have exactly one of each digit (1-9). Let's validate a mini 1x3 Sudoku row (digits 1-3).

Your program must:
1. Read a comma-separated string of 3 integers (e.g., '1,2,3').
2. Check if the numbers contain exactly one '1', one '2', and one '3'.
3. Print 'Valid' if it satisfies the constraint, or 'Invalid' if it has duplicates or missing numbers.

Sample Input:
1,2,3

Sample Output:
Valid
```

**Hints (2):**
1. "You can use the `sorted()` function on the list and check if it equals `['1', '2', '3']`."
2. "Alternatively, use `if '1' in row_input and '2' in row_input and '3' in row_input:`."

**Starter code:**
```python
row_input = input().strip().split(',')

# Convert strings to integers, or keep as strings and check for '1', '2', '3'
# Your code here
```

**Test cases (3):**
| Label | Input | Expected Output |
|-------|-------|-----------------|
| Valid row | `3,1,2` | `Valid\n` |
| Duplicate 1s | `1,1,3` | `Invalid\n` |
| Wrong numbers | `4,5,6` | `Invalid\n` |

#### Problem 2: Hill Climbing Code
**id:** `hill_climbing_code`
**title:** "Hill Climbing Code"
**difficulty:** medium
**type:** coding

**Full description (exactly as written):**
```
Write Python to find the local maximum value in a list by checking neighbors one step at a time (like Hill Climbing).

Your program must:
1. Read a comma-separated list of integers.
2. Start at index 0.
3. Compare the current value with the next value (index + 1).
4. If the next value is strictly GREATER, move to it and repeat.
5. If the next value is smaller or equal, STOP and print the current value.

Sample Input:
1,3,7,5,8

Sample Output:
7
```

**Hints (2):**
1. "Use a `while` loop to ensure `current_idx` doesn't go beyond `len(nums) - 1`."
2. "Compare `nums[current_idx + 1]` with `nums[current_idx]`. If greater, increment `current_idx`. Else, `break` the loop."

**Starter code:**
```python
nums = [int(x) for x in input().strip().split(',')]
current_idx = 0

# Your loop here

print(nums[current_idx])
```

**Test cases (3):**
| Label | Input | Expected Output |
|-------|-------|-----------------|
| Peak in middle | `1,3,7,5,8` | `7\n` |
| Peak at start | `9,4,5` | `9\n` |
| Peak at end | `1,2,3` | `3\n` |

#### Similar A: Crossword Constraint Checker (Similar A)
**id:** `crossword_constraint_sim1`
**title:** "Crossword Constraint Checker (Similar A)"
**difficulty:** easy
**type:** coding

**Full description (exactly as written):**
```
In a crossword puzzle, if 1-Across and 1-Down intersect at the first letter, those first letters MUST be identical. Let's validate this constraint.

Your program must:
1. Read Word 1 (the Across word).
2. Read Word 2 (the Down word).
3. Check if the first character of Word 1 matches the first character of Word 2 (case-insensitive!).
4. Print 'Constraint Satisfied' if they match, or 'Constraint Failed' if they do not.

Sample Input:
feline
fire

Sample Output:
Constraint Satisfied
```

**Hints (2):**
1. "Use string indexing `[0]` to grab the very first letter of each word."
2. "Ensure you apply `.lower()` to both words so that 'Feline' and 'fire' match correctly."

**Starter code:**
```python
word1 = input().strip().lower()
word2 = input().strip().lower()

# Your code here
```

**Test cases (3):**
| Label | Input | Expected Output |
|-------|-------|-----------------|
| Match | `feline\nfire` | `Constraint Satisfied\n` |
| No Match | `cat\ndog` | `Constraint Failed\n` |
| Case match | `Apple\nAnt` | `Constraint Satisfied\n` |

#### Similar B: Simulated Annealing Concept (Similar B)
**id:** `simulated_annealing_sim2`
**title:** "Simulated Annealing Concept (Similar B)"
**difficulty:** easy
**type:** coding

**Full description (exactly as written):**
```
Simulated Annealing sometimes accepts worse moves to escape local maximums. Let's build the decision logic.

Your program must:
1. Read an integer for `current_value`.
2. Read an integer for `next_value`.
3. If `next_value` > `current_value`, print 'Accept' (we always take improvements!).
4. If `next_value` <= `current_value`, print 'Maybe' (representing the random chance to accept a worse move).

Sample Input:
10
8

Sample Output:
Maybe
```

**Hints (2):**
1. "Use a simple `if/else` block."
2. "Check `next_value > current_value` for the 'Accept' condition."

**Starter code:**
```python
current_value = int(input())
next_value = int(input())

# Your code here
```

**Test cases (3):**
| Label | Input | Expected Output |
|-------|-------|-----------------|
| Worse move | `10\n8` | `Maybe\n` |
| Better move | `5\n20` | `Accept\n` |
| Equal move | `7\n7` | `Maybe\n` |

---

### Milestone Projects (Lecture 5)

One project available.

#### Project: Crossword
**id:** `fundamentals-of-ai-crossword`
**title:** "Crossword"
**Skills:** Constraint Satisfaction, Search, Python
**Difficulty:** Hard
**Estimated time:** 3-6 Hours
**Goal:** "Model the generation of a crossword puzzle as a Constraint Satisfaction Problem (CSP). Implement node consistency, arc consistency (AC3), and backtracking search to find a valid assignment of words to the puzzle structure."

**Features (Technical Checklist):**
1. "Parse crossword structures and vocabulary lists"
2. "Enforce unary constraints (node consistency)"
3. "Enforce binary constraints (arc consistency)"
4. "Solve the CSP using backtracking search"

**Expected Program Execution Flow:**
1. "Download the crossword starter code"
2. "Implement enforce_node_consistency and revise"
3. "Implement the ac3 algorithm for arc consistency"
4. "Complete the assignment_complete and consistent checks"
5. "Implement the backtrack search algorithm to solve the puzzle"

**Requirements:**
- "Complete enforce_node_consistency to remove words that don't match variable lengths"
- "Complete revise to remove words from a domain that conflict with a neighbor"
- "Complete ac3 to enforce arc consistency across the entire puzzle"
- "Complete assignment_complete and consistent to check if a state is a valid solution"
- "Complete order_domain_values and select_unassigned_variable as heuristics"
- "Complete backtrack to perform the recursive search"

**Guidelines:**
- "Node Consistency — A variable is node-consistent if every value in its domain has the correct length. Remove any values that don't match the variable's length."
- "Arc Consistency — Variable X is arc-consistent with Y if for every value in X's domain, there is a possible value for Y that doesn't cause a conflict (overlapping characters must match)."
- "Heuristics — Use the Minimum Remaining Values (MRV) heuristic for selecting variables, and the Least Constraining Value (LCV) heuristic for ordering values to speed up search."
- "Dependencies — This project requires the Pillow library. Run pip3 install Pillow to install it before testing your code."

**Evaluation Checklist (all hardcoded check: () => true):**
- "Consistency enforcement — Node and arc consistency correctly reduce domains"
- "Heuristics implemented — MRV and LCV properly order choices"
- "Backtracking succeeds — Algorithm finds valid puzzles without failing or running forever"

**Download URL:** `/data/fundamentals-of-ai/lecture_5/crossword/crossword.zip`

---

## Lecture 6 — Machine Learning

### Problems to Solve

#### Problem 1: ML Workflow Validator
**id:** `ml_workflow`
**title:** "ML Workflow Validator"
**difficulty:** easy
**type:** coding

**Full description (exactly as written):**
```
In Machine Learning, it's critical that data is cleaned BEFORE training the model. Write a script to validate the order of workflow steps.

Your program must:
1. Read a comma-separated list of workflow steps from the user.
2. Find the index of 'Clean Data' and the index of 'Train Model' in the list.
3. If 'Clean Data' comes before 'Train Model', print 'Valid Workflow'.
4. Otherwise (or if either is missing), print 'Invalid Workflow'.

Sample Input:
Collect Data,Clean Data,Train Model,Test Model

Sample Output:
Valid Workflow
```

**Hints (2):**
1. "First verify that both strings exist in the list using the `in` operator."
2. "Use `.index('Clean Data')` to find its position in the list, and compare it to `.index('Train Model')`."

**Starter code:**
```python
workflow = input().strip().split(',')

# Your code here
```

**Test cases (3):**
| Label | Input | Expected Output |
|-------|-------|-----------------|
| Valid order | `Collect Data,Clean Data,Train Model` | `Valid Workflow\n` |
| Reversed order | `Train Model,Clean Data` | `Invalid Workflow\n` |
| Missing step | `Collect Data,Train Model` | `Invalid Workflow\n` |

#### Problem 2: Simple Number Classifier
**id:** `simple_classifier_l6`
**title:** "Simple Number Classifier"
**difficulty:** easy
**type:** coding

**Full description (exactly as written):**
```
Write Python code to classify a number entered by the user as Positive, Negative, or Zero.

Your program must:
1. Read an integer input.
2. Apply the rules:
   - Greater than 0 -> Print 'Positive'
   - Less than 0 -> Print 'Negative'
   - Exactly 0 -> Print 'Zero'

Sample Input:
-5

Sample Output:
Negative
```

**Hints (2):**
1. "Use an `if / elif / else` block."
2. "Remember that 0 is neither positive nor negative."

**Starter code:**
```python
number = int(input())

# Your code here
```

**Test cases (3):**
| Label | Input | Expected Output |
|-------|-------|-----------------|
| Negative | `-5` | `Negative\n` |
| Positive | `100` | `Positive\n` |
| Zero | `0` | `Zero\n` |

#### Problem 3: Data Cleaner (Similar A)
**id:** `data_cleaning_sim1`
**title:** "Data Cleaner (Similar A)"
**difficulty:** easy
**type:** coding

**Full description (exactly as written):**
```
Real world data is messy! Write a program that takes a 'dirty' string of data and cleans it up for a machine learning algorithm.

Your program must:
1. Read a string input.
2. Strip all leading and trailing whitespace.
3. Convert the entire string to lowercase.
4. Replace all occurrences of the word 'error' with an empty string ''.
5. Print the cleaned string.

Sample Input:
   This ERROR is bad data   

Sample Output:
this  is bad data
```

**Hints (2):**
1. "You can chain string methods together like `input().strip().lower()`."
2. "Use `.replace('error', '')` to remove the specific word."

**Starter code:**
```python
dirty_data = input()

# Your cleaning steps here
```

**Test cases (3):**
| Label | Input | Expected Output |
|-------|-------|-----------------|
| Has errors and spaces | `   This ERROR is bad data   ` | `this  is bad data\n` |
| Clean already | `good data` | `good data\n` |
| Multiple errors | `ERRORERROR` | `\n` |

#### Problem 4: Age Categorizer (Similar B)
**id:** `simple_categorizer_sim2`
**title:** "Age Categorizer (Similar B)"
**difficulty:** easy
**type:** coding

**Full description (exactly as written):**
```
Write a Python script that takes a user's age as input and categorizes them into life stages.

Your program must:
1. Read an integer age.
2. Print 'Child' if under 13.
3. Print 'Teen' if 13 to 19 (inclusive).
4. Print 'Adult' if 20 or older.

Sample Input:
15

Sample Output:
Teen
```

**Hints (2):**
1. "Since an `if age < 13` block catches all younger ages, the `elif` only needs to check `<= 19`."
2. "Use a final `else:` statement for Adults."

**Starter code:**
```python
age = int(input())

# Your code here
```

**Test cases (3):**
| Label | Input | Expected Output |
|-------|-------|-----------------|
| Teen | `15` | `Teen\n` |
| Child | `12` | `Child\n` |
| Adult boundary | `20` | `Adult\n` |

#### Problem 5: Loss Function Calculator
**id:** `loss_function_calculator`
**title:** "Loss Function Calculator"
**difficulty:** easy
**type:** coding

**Full description (exactly as written):**
```
Implement three loss functions: 0-1 loss, L₁ loss, and L₂ loss. Given actual and predicted values, compute the loss for each type.

Write a program that:
1. Reads two floats from input: actual and predicted.
2. Prints the 0-1 loss (0 if equal, 1 otherwise).
3. Prints the L₁ loss (absolute difference).
4. Prints the L₂ loss (squared difference).

Sample Input:
3.0 2.5

Sample Output:
1
0.5
0.25
```

**Hints (3):**
1. "0-1 loss is 0 when values match exactly, 1 otherwise."
2. "L₁ loss uses abs() for absolute difference."
3. "L₂ loss squares the difference."

**Starter code:**
```python
actual, predicted = map(float, input().split())

# Your loss functions here
```

**Test cases (3):**
| Label | Input | Expected Output |
|-------|-------|-----------------|
| Close prediction | `3.0 2.5` | `1\n0.5\n0.25\n` |
| Exact match | `5.0 5.0` | `0\n0.0\n0.0\n` |
| Large error | `1.0 10.0` | `1\n9.0\n81.0\n` |

#### Problem 6: Single Perceptron Update
**id:** `perceptron_step`
**title:** "Single Perceptron Update"
**difficulty:** medium
**type:** coding

**Full description (exactly as written):**
```
Simulate one step of the perceptron learning rule. Given the current weights, input vector, learning rate, true label, and predicted label, compute the updated weights.

The perceptron update rule: wᵢ = wᵢ + α * (y - ŷ) * xᵢ
where y is the true label, ŷ is the predicted label, and α is the learning rate.

Sample Input:
0.5 0.3
1 2
0.1
1
0

Sample Output:
0.6 0.5
```

**Hints (3):**
1. "The error is true_label - pred_label."
2. "Each weight updates by: alpha * error * corresponding input."
3. "If prediction is correct (error = 0), weights don't change."

**Starter code:**
```python
weights = list(map(float, input().split()))
inputs = list(map(float, input().split()))
alpha = float(input())
true_label = int(input())
pred_label = int(input())

# Your update rule here
```

**Test cases (3):**
| Label | Input | Expected Output |
|-------|-------|-----------------|
| Underestimated | `0.5 0.3\n1 2\n0.1\n1\n0` | `0.6 0.5\n` |
| Overestimated | `0.5 0.3\n1 2\n0.1\n0\n1` | `0.4 0.1\n` |
| Correct prediction | `0.5 0.3\n1 2\n0.1\n1\n1` | `0.5 0.3\n` |

#### Problem 7: Margin Checker
**id:** `margin_checker`
**title:** "Margin Checker"
**difficulty:** medium
**type:** coding

**Full description (exactly as written):**
```
Check whether a decision boundary correctly separates two classes with a margin. Given four numbers representing the positions of two class A points and two class B points on a line, determine if the boundary at x=0 separates them with a margin ≥ 1.

The boundary at x=0 classifies points with x < 0 as class A and x > 0 as class B. The margin is the distance from the boundary to the nearest point on each side.

Sample Input:
-3 -1 2 4

Sample Output:
Margin: 1.0
Sufficient
```

**Hints (3):**
1. "Class A points should be negative (x < 0), class B points positive (x > 0)."
2. "The margin is the distance from the boundary (x=0) to the closest point on each side."
3. "Use abs() to find distances."

**Starter code:**
```python
a1, a2, b1, b2 = map(float, input().split())

# Your margin check here
```

**Test cases (3):**
| Label | Input | Expected Output |
|-------|-------|-----------------|
| Sufficient margin | `-3 -1 2 4` | `Margin: 1.0\nSufficient\n` |
| Insufficient margin | `-3 -0.5 0.5 4` | `Margin: 0.5\nInsufficient\n` |
| Wide margin | `-5 -3 3 6` | `Margin: 3.0\nSufficient\n` |

---

### Milestone Projects (Lecture 6)

Two projects available. **Note:** Lecture 6 has 7 problems (more than usual — LecturePage only takes first 2 as "main", remaining 5 are "Similar Questions").

#### Project: Shopping
**id:** `fundamentals-of-ai-shopping`
**title:** "Shopping"
**Skills:** Machine Learning, Classification, Python
**Difficulty:** Medium
**Estimated time:** 2-4 Hours
**Goal:** "Train a nearest-neighbor classifier (k=1) using scikit-learn's KNeighborsClassifier to predict online shopping purchase behavior based on customer session data."

**Features (Technical Checklist):**
1. "Load and process a dataset of shopping sessions"
2. "Map categorical features to numerical values"
3. "Train a k-nearest neighbor classifier"
4. "Evaluate model sensitivity and specificity"

**Expected Program Execution Flow:**
1. "Download the shopping starter code and dataset"
2. "Implement load_data to parse the CSV file"
3. "Implement train_model to fit the classifier"
4. "Implement evaluate to calculate true positive and true negative rates"
5. "Run the model and verify its accuracy metrics"

**Requirements:**
- "Complete load_data to return a tuple (evidence, labels) formatted correctly"
- "Convert string categories (like month names, VisitorType, and boolean values) to proper integers/floats"
- "Complete train_model to return an instantiated, trained KNeighborsClassifier with k=1"
- "Complete evaluate to calculate sensitivity (True Positive Rate) and specificity (True Negative Rate)"

**Guidelines:**
- "Data Formatting — Be meticulous about converting types. Evidence lists should contain ints or floats, and labels should be 1 (True) or 0 (False)."
- "Sensitivity — Sensitivity is the proportion of actual positive cases (made a purchase) that were correctly identified."
- "Specificity — Specificity is the proportion of actual negative cases (did not purchase) that were correctly identified."
- "Dependencies — This project requires the scikit-learn library. Run pip3 install scikit-learn to install it."

**Evaluation Checklist (all hardcoded check: () => true):**
- "Data loading is robust — Correctly parses CSV strings into appropriate numeric types"
- "Classifier trains correctly — Model is fit onto the training data successfully"
- "Evaluation metrics accurate — Calculates exact sensitivity and specificity"

**Download URL:** `/data/fundamentals-of-ai/lecture_6/shopping/shopping.zip`

---

#### Project: Nim
**id:** `fundamentals-of-ai-nim`
**title:** "Nim"
**Skills:** Reinforcement Learning, Q-Learning, Python
**Difficulty:** Hard
**Estimated time:** 3-6 Hours
**Goal:** "Implement a Q-learning agent that learns to play the game of Nim by playing against itself and updating its Q-values based on rewards."

**Features (Technical Checklist):**
1. "Calculate Q-values for state-action pairs"
2. "Implement the Q-learning update equation"
3. "Determine the best future reward from a state"
4. "Choose actions using an epsilon-greedy strategy"

**Expected Program Execution Flow:**
1. "Download the nim starter code"
2. "Implement get_q_value to fetch or initialize values"
3. "Implement update_q_value with the Q-learning formula"
4. "Implement best_future_reward to look ahead one step"
5. "Implement choose_action to balance exploration and exploitation"
6. "Train the AI by playing 10,000 games and challenge it"

**Requirements:**
- "Complete get_q_value to return the current Q-value for a given state and action (default 0)"
- "Complete update_q_value using the old Q-value, reward, and future reward"
- "Complete best_future_reward to return the maximum possible Q-value from all available actions"
- "Complete choose_action using epsilon-greedy: explore with probability epsilon, else exploit the best action"

**Guidelines:**
- "States and Actions — States are represented as lists (piles). Actions are tuples (pile_index, count)."
- "Epsilon-Greedy — Generate a random number. If it is less than epsilon, choose randomly. Otherwise, choose the action with the highest Q-value."
- "Q-Learning Formula — Q(s, a) <- Q(s, a) + alpha * (reward + gamma * max(Q(s', a')) - Q(s, a))"

**Evaluation Checklist (all hardcoded check: () => true):**
- "Q-values initialize to zero — Unseen state-action pairs default to 0"
- "Q-learning update formula — Accurately applies alpha, gamma, and rewards"
- "Epsilon-greedy choice — Correctly balances random actions vs best actions"

**Download URL:** `/data/fundamentals-of-ai/lecture_6/nim/nim.zip`

---

## Lecture 7 — Neural Networks

### Problems to Solve

#### Problem 1: 3-Layer NN Simulator
**id:** `draw_nn`
**title:** "3-Layer NN Simulator"
**difficulty:** easy
**type:** coding

**Full description (exactly as written):**
```
Let's simulate a simple 3-layer neural network (Input -> Hidden -> Output).

Your program must:
1. Read a float value representing the Input Node.
2. Calculate the Hidden Node value: `Input * 0.5`.
3. Calculate the Output Node value: `Hidden * 0.8`.
4. Print the final Output Node value exactly.

Sample Input:
10.0

Sample Output:
4.0
```

**Hints (2):**
1. "You just need two multiplication steps in sequence."
2. "Store the result of the first multiplication in a variable so you can use it in the second."

**Starter code:**
```python
input_val = float(input())

# Calculate hidden_val

# Calculate output_val

# Print output_val
```

**Test cases (3):**
| Label | Input | Expected Output |
|-------|-------|-----------------|
| Input 10 | `10.0` | `4.0\n` |
| Input 0 | `0.0` | `0.0\n` |
| Input 2.5 | `2.5` | `1.0\n` |

#### Problem 2: Weighted Sum Calculator
**id:** `weighted_sum`
**title:** "Weighted Sum Calculator"
**difficulty:** easy
**type:** coding

**Full description (exactly as written):**
```
Write Python to calculate a weighted sum of two inputs, like a neuron does.

Your program must:
1. Read Input 1 as a float. It has a weight of 0.5.
2. Read Input 2 as a float. It has a weight of -0.2.
3. Calculate the weighted sum: `(Input1 * 0.5) + (Input2 * -0.2)`.
4. Print the final calculated sum.

Sample Input:
10.0
5.0

Sample Output:
4.0
```

**Hints (2):**
1. "Multiply each input by its respective weight, then add them together."
2. "Be careful with the negative weight."

**Starter code:**
```python
in1 = float(input())
in2 = float(input())

# Your code here
```

**Test cases (3):**
| Label | Input | Expected Output |
|-------|-------|-----------------|
| Standard | `10.0\n5.0` | `4.0\n` |
| Both zero | `0.0\n0.0` | `0.0\n` |
| Negative input | `-10.0\n10.0` | `-7.0\n` |

#### Similar A: ReLU Activation Function (Similar A)
**id:** `activation_functions_sim1`
**title:** "ReLU Activation Function (Similar A)"
**difficulty:** easy
**type:** coding

**Full description (exactly as written):**
```
A very common activation function in deep learning is ReLU (Rectified Linear Unit). It is very simple: if the input is greater than 0, it outputs the input. Otherwise, it outputs 0.

Your program must:
1. Read a float input.
2. Apply the ReLU logic.
3. Print the result.

Sample Input:
-3.5

Sample Output:
0.0
```

**Hints (2):**
1. "Use a simple `if val > 0:` block."
2. "You can use `max(0.0, val)` as a single-line trick if you know how it works!"

**Starter code:**
```python
val = float(input())

# Apply ReLU logic and print
```

**Test cases (3):**
| Label | Input | Expected Output |
|-------|-------|-----------------|
| Negative | `-3.5` | `0.0\n` |
| Positive | `7.2` | `7.2\n` |
| Zero | `0.0` | `0.0\n` |

#### Similar B: Step Activation Function (Similar B)
**id:** `nn_threshold_sim2`
**title:** "Step Activation Function (Similar B)"
**difficulty:** easy
**type:** coding

**Full description (exactly as written):**
```
Write a Python script that acts like a simple Step Activation Function neuron.

Your program must:
1. Read a float representing a calculated 'weighted sum'.
2. If the sum is greater than or equal to 0, print '1' (Activated).
3. Otherwise, print '0' (Deactivated).

Sample Input:
1.5

Sample Output:
1
```

**Hints (2):**
1. "Use the `>=` operator to check for 'greater than or equal to 0'."
2. "Make sure to print integers or strings '1' and '0'."

**Starter code:**
```python
weighted_sum = float(input())

# Your code here
```

**Test cases (3):**
| Label | Input | Expected Output |
|-------|-------|-----------------|
| Positive | `1.5` | `1\n` |
| Negative | `-0.1` | `0\n` |
| Zero boundary | `0.0` | `1\n` |

---

### Milestone Projects (Lecture 7)

One project available.

#### Project: Traffic
**id:** `fundamentals-of-ai-traffic`
**title:** "Traffic"
**Skills:** Deep Learning, Computer Vision, TensorFlow, Python
**Difficulty:** Hard
**Estimated time:** 4-8 Hours
**Goal:** "Train a compiled Keras neural network to classify road signs from the German Traffic Sign Recognition Benchmark (GTSRB) dataset using convolutional neural networks (CNNs)."

**Features (Technical Checklist):**
1. "Load and resize thousands of images using OpenCV"
2. "Design a neural network architecture with convolutional and pooling layers"
3. "Add hidden layers and dropout to prevent overfitting"
4. "Compile and train the model on image categories"
5. "Document the experimentation process in a README.md"

**Expected Program Execution Flow:**
1. "Download the traffic starter code and the GTSRB dataset"
2. "Implement load_data to read and resize all images"
3. "Implement get_model to build and compile the CNN"
4. "Experiment with different layers, sizes, and dropout rates"
5. "Write a README.md explaining your design choices and results"

**Requirements:**
- "Complete load_data: return a tuple (images, labels) where images is a list of numpy arrays, and labels is a list of integers representing categories"
- "Images must be resized to exactly EPOCHS (defined as 30x30 in starter code)"
- "Complete get_model: return a compiled Keras neural network model"
- "The model must have an output layer with NUM_CATEGORIES units and softmax activation"
- "Include a README.md file documenting the architecture choices (layers, node counts, dropout)"

**Guidelines:**
- "Dataset Note — The GTSRB dataset is quite large. Download it separately using the link provided in the course instructions. Do not attempt to push the dataset to GitHub."
- "OpenCV Basics — Use cv2.imread to read images and cv2.resize to resize them to the required dimensions."
- "Overfitting — If your training accuracy is high but testing accuracy is low, your model might be overfitting. Try adding a Dropout layer."
- "Dependencies — This project requires opencv-python, scikit-learn, and tensorflow. Run pip3 install -r requirements.txt."

**Evaluation Checklist (all hardcoded check: () => true):**
- "Image loading — load_data successfully parses and resizes all categories"
- "Model compiles — get_model returns a valid compiled keras Sequential model"
- "Documentation — README.md exists and explains the design process"

**Download URL:** `/data/fundamentals-of-ai/lecture_7/traffic/traffic.zip`

---

## Lecture 8 — Natural Language Processing

### Problems to Solve

Same screen structure as previous lectures. **No milestone projects for Lecture 8.**

#### Problem 1: Prompt Length Checker
**id:** `ask_chatgpt`
**title:** "Prompt Length Checker"
**difficulty:** easy
**type:** coding

**Full description (exactly as written):**
```
In Prompt Engineering, providing enough context is crucial for good outputs. Write a script to validate prompt length.

Your program must:
1. Read a prompt string from the user.
2. Count the number of characters in the string.
3. If the length is strictly less than 15 characters, print 'Too short'.
4. Otherwise, print 'Good prompt'.

Sample Input:
hello

Sample Output:
Too short
```

**Hints (2):**
1. "Use the `len()` function to find the number of characters in the string."
2. "Compare the length to 15 using `<`."

**Starter code:**
```python
prompt = input().strip()

# Your code here
```

**Test cases (3):**
| Label | Input | Expected Output |
|-------|-------|-----------------|
| Short prompt | `hello` | `Too short\n` |
| Long prompt | `Please explain quantum physics.` | `Good prompt\n` |
| Exactly 14 | `fourteen chars` | `Too short\n` |

#### Problem 2: Tokenize Sentence
**id:** `tokenize_sentence`
**title:** "Tokenize Sentence"
**difficulty:** easy
**type:** coding

**Full description (exactly as written):**
```
Write Python to tokenize a sentence (split it into words) and count how many words it contains.

Your program must:
1. Read a sentence string from user input.
2. Use the `.split()` method to separate it into words based on spaces.
3. Print the total number of words as an integer.

Sample Input:
Hello world this is AI

Sample Output:
5
```

**Hints (2):**
1. "The `.split()` method on a string automatically turns it into a list of words."
2. "Use `len()` on the resulting list to get the word count."

**Starter code:**
```python
sentence = input().strip()

# Your code here
```

**Test cases (3):**
| Label | Input | Expected Output |
|-------|-------|-----------------|
| Five words | `Hello world this is AI` | `5\n` |
| One word | `Python` | `1\n` |
| Empty string | `` | `0\n` |

#### Similar A: Hallucination Filter (Similar A)
**id:** `hallucination_check_sim1`
**title:** "Hallucination Filter (Similar A)"
**difficulty:** easy
**type:** coding

**Full description (exactly as written):**
```
Sometimes LLMs hallucinate by asserting a fact while also expressing uncertainty. Let's write a simple filter rule.

Your program must:
1. Read a response string.
2. Check if the string contains the exact phrase 'not sure' (case-insensitive).
3. If it does, print 'Potential Hallucination'.
4. Otherwise, print 'Clear response'.

Sample Input:
I am not sure, but the capital is Paris.

Sample Output:
Potential Hallucination
```

**Hints (2):**
1. "Convert the response to `.lower()` before checking."
2. "Use the `in` keyword to see if the substring `'not sure'` exists."

**Starter code:**
```python
response = input().strip().lower()

# Your code here
```

**Test cases (3):**
| Label | Input | Expected Output |
|-------|-------|-----------------|
| Contains phrase | `I am not sure, but the capital is Paris.` | `Potential Hallucination\n` |
| Does not contain | `The capital is Paris.` | `Clear response\n` |
| Case variations | `I am NOT SURE about this` | `Potential Hallucination\n` |

#### Similar B: Word Frequency Counter (Similar B)
**id:** `word_freq_counter_sim2`
**title:** "Word Frequency Counter (Similar B)"
**difficulty:** easy
**type:** coding

**Full description (exactly as written):**
```
Write a Python script that takes a sentence and a target word as input. Tokenize the sentence and count how many times the exact target word appears.

Your program must:
1. Read the sentence string.
2. Read the target word string.
3. Split the sentence into a list of words.
4. Count how many times the target word appears in the list (case-sensitive).
5. Print the integer count.

Sample Input:
the cat and the dog
the

Sample Output:
2
```

**Hints (2):**
1. "Use `sentence.split()` to make a list of words."
2. "Lists have a built-in `.count()` method that counts exact matches!"

**Starter code:**
```python
sentence = input().strip()
target = input().strip()

# Your code here
```

**Test cases (3):**
| Label | Input | Expected Output |
|-------|-------|-----------------|
| Matches 2 | `the cat and the dog\nthe` | `2\n` |
| Matches 0 | `the cat and the dog\nbird` | `0\n` |
| Case sensitive check | `The cat and the dog\nthe` | `1\n` |

---

## Lecture 9 — AI Ethics & Safety

### Problems to Solve

All problems in Lecture 9 are `type: "reflection"` — they require written answers, not code. They use the same Monaco code editor interface as coding problems.

#### Problem 1: News story about AI
**id:** `news_story_ai`
**title:** "News story about AI"
**difficulty:** easy
**type:** reflection

**Full description (exactly as written):**
```
Find one real news story about AI causing harm (e.g., bias, hallucination, deepfakes, or job displacement). Briefly summarize the story and the specific ethical issue it highlights.

Provide your written answer in the code editor as comments.
```

**Hints (2):**
1. "Search for terms like 'AI bias in hiring', 'deepfake controversies', or 'facial recognition errors'."
2. "Focus on what went wrong and why it is an ethical problem."

**Starter code:**
```python
# Summarize your news story here:
```

**Test cases:** None (0 test cases)

#### Problem 2: Medical decisions debate
**id:** `medical_decisions_debate`
**title:** "Medical decisions debate"
**difficulty:** easy
**type:** reflection

**Full description (exactly as written):**
```
Discussion — Should AI be allowed to make medical diagnoses and treatment decisions without a human doctor reviewing them? Argue for or against, using at least two reasons.

Provide your written answer in the code editor as comments.
```

**Hints (2):**
1. "Think about accountability: who gets sued if the AI is wrong?"
2. "Consider the accuracy of AI versus human doctors, and the importance of human empathy."

**Starter code:**
```python
# Write your argument here:
```

**Test cases:** None (0 test cases)

#### Similar A: AI in Education (Similar A)
**id:** `ai_education_sim1`
**title:** "AI in Education (Similar A)"
**difficulty:** easy
**type:** reflection

**Full description (exactly as written):**
```
How should schools handle generative AI tools like ChatGPT? Should they be completely banned, fully integrated into the curriculum, or something in between? State your opinion and one supporting reason.

Provide your written answer in the code editor as comments.
```

**Hints (2):**
1. "Consider how difficult it is to actually enforce a total ban."
2. "Think about what skills students will need when they enter the modern workforce."

**Starter code:**
```python
# Write your opinion here:
```

**Test cases:** None (0 test cases)

#### Similar B: Autonomous Vehicles Debate (Similar B)
**id:** `autonomous_vehicles_sim2`
**title:** "Autonomous Vehicles Debate (Similar B)"
**difficulty:** easy
**type:** reflection

**Full description (exactly as written):**
```
If a self-driving car gets into an accident, who should be held legally responsible: the person sitting in the driver's seat, the software developer, or the car manufacturer? Defend your choice.

Provide your written answer in the code editor as comments.
```

**Hints (2):**
1. "Think about whether the 'driver' actually had the ability to intervene in time."
2. "How does consumer trust factor into who takes the blame?"

**Starter code:**
```python
# Defend your choice here:
```

**Test cases:** None (0 test cases)

**Reflection submission logic (ProblemCard.tsx lines 155-163):**
- When type is 'reflection', the Submit handler counts words: `code.trim().split(/\s+/).filter(w => w.length > 0)`.
- If word count >= 20, marks as complete.
- If word count < 20, shows error: `Reflection needs more detail. Please write at least 20 words (currently X).`

---

## Lecture 10 — Final Project

### Problems to Solve

#### Problem 1: Project Plan Validator
**id:** `write_project_plan`
**title:** "Project Plan Validator"
**difficulty:** medium
**type:** coding

**Full description (exactly as written):**
```
Write a script that validates if a project plan contains the required sections.

Your program must:
1. Read a multi-line project plan string from the user. (We will simulate this by reading a single long string).
2. Check if the string contains the exact substrings: 'Input:', 'Output:', and 'Algorithm:'.
3. If ALL THREE are present, print 'Plan Complete'.
4. If any are missing, print 'Plan Incomplete'.

Sample Input:
My project. Input: images. Output: text. Algorithm: CNN.

Sample Output:
Plan Complete
```

**Hints (2):**
1. "Use the `in` operator multiple times combined with `and`."
2. "Make sure you match the case and colon exactly ('Input:')."

**Starter code:**
```python
plan_text = input().strip()

# Your code here
```

**Test cases (3):**
| Label | Input | Expected Output |
|-------|-------|-----------------|
| All present | `My project. Input: images. Output: text. Algorithm: CNN.` | `Plan Complete\n` |
| Missing Algorithm | `My project. Input: images. Output: text.` | `Plan Incomplete\n` |
| Empty | `Nothing here` | `Plan Incomplete\n` |

#### Problem 2: Ethical consideration
**id:** `ethical_consideration`
**title:** "Ethical consideration"
**difficulty:** easy
**type:** reflection

**Full description (exactly as written):**
```
Write one ethical consideration for your chosen project and explain it. For example, could it be biased? Could it be misused? How will you mitigate this?

Provide your written answer in the code editor as comments.
```

**Hints (2):**
1. "Think about the worst-case scenario if a malicious user got access to your project."
2. "Consider where your data comes from and if it represents everyone fairly."

**Starter code:**
```python
# Ethical consideration:
# Mitigation:
```

**Test cases:** None (0 test cases)

#### Similar A: Milestone Tracker (Similar A)
**id:** `project_milestones_sim1`
**title:** "Milestone Tracker (Similar A)"
**difficulty:** easy
**type:** coding

**Full description (exactly as written):**
```
Write a program that takes three project milestones and prints them in a formatted numbered list.

Your program must:
1. Read Milestone 1.
2. Read Milestone 2.
3. Read Milestone 3.
4. Print them out as:
   1. [Milestone 1]
   2. [Milestone 2]
   3. [Milestone 3]

Sample Input:
Gather Data
Train Model
Deploy

Sample Output:
1. Gather Data
2. Train Model
3. Deploy
```

**Hints (2):**
1. "Use three separate `print()` statements."
2. "Use f-strings to combine the number prefix with the variable."

**Starter code:**
```python
m1 = input().strip()
m2 = input().strip()
m3 = input().strip()

# Your code here
```

**Test cases (3):**
| Label | Input | Expected Output |
|-------|-------|-----------------|
| Standard | `Gather Data\nTrain Model\nDeploy` | `1. Gather Data\n2. Train Model\n3. Deploy\n` |
| Other tasks | `Design\nCode\nTest` | `1. Design\n2. Code\n3. Test\n` |
| Short | `A\nB\nC` | `1. A\n2. B\n3. C\n` |

#### Similar B: Bias Mitigation (Similar B)
**id:** `bias_mitigation_sim2`
**title:** "Bias Mitigation (Similar B)"
**difficulty:** easy
**type:** reflection

**Full description (exactly as written):**
```
Imagine your AI model is accidentally producing biased results against a certain group. List two technical steps you could take to fix or mitigate this bias.

Provide your written answer in the code editor as comments.
```

**Hints (2):**
1. "Think about fixing the DATA versus fixing the ALGORITHM."
2. "Can you measure the bias automatically during testing?"

**Starter code:**
```python
# Mitigation Step 1:
# Mitigation Step 2:
```

**Test cases:** None (0 test cases)

---

### Summary (Lecture 10)

Same SummaryCard. Button label: NOT "Next: Milestone Project" (since lecture 10 is not in the 1-6 range). Instead: if `nextLecture` exists, navigates to it; otherwise navigates back to `/course/${slug}`. However, for lecture 10, the LecturePage redirects to the CapstonePage (line 146-148 of LecturePage.tsx):
```typescript
const last = lectures[lectures.length - 1];
if (last && lectureNumber >= last.number) {
  navigate(`/course/${slug}/capstone`, { replace: true });
}
```

---

## Capstone Project

**Route:** `/course/fundamentals-of-ai/capstone`

**Page:** CapstonePage.tsx (872 lines)

**4-Step Wizard:** Choose Project → Requirements → Submit Project → Certificate

---

### Step 1 — Choose Project

**Screen:**
- Background: gradient from `#F8FCFD` to `#EEF8FA`
- Top bar with step indicator circles (1-4)
- Hero badge: "Capstone Challenge" (small teal badge)
- Heading: "Select Your" + "Final Project" (teal colored)
- Subtitle: "Demonstrate your AI knowledge. Select one of the projects below to complete and submit via GitHub."
- 9 skill badges with green checkmarks (same list as Milestone page)
- 4 project cards in 2x2 grid

**Project cards show:** title, difficulty badge, description, key concepts tags, "Select Project" / "Selected" / "Locked" button.

**If already submitted a capstone:** Warning banner: "Capstone Project Locked — You have already completed your capstone project. Only one capstone project can be submitted per course."

**Selected project details:** 4-column grid: Estimated Time, Difficulty, Skills, What You'll Build (truncated to 100 chars).

**Footer:** project name text, "Configure Requirements" button.

**One-capstone enforcement:** `completedProjectId` state locks all other projects. Once one is submitted, others show "Locked".

---

### Step 2 — Requirements

Same layout as MilestonePage. No download URL button (all capstone projects have `downloadUrl: undefined`).

**Sections:**
- "Requirements & Scope" heading
- Project title
- Core Objective card
- Two-column grid: Technical Checklist + Expected Program Execution Flow
- Navigation: "← Switch Project", "Submit Project"

---

### Step 3 — Submit Project

**Same structure as MilestonePage Step 3:**
- Project Summary card (title, description, difficulty badge, skills)
- Requirements Summary card
- GitHub Submission Form:
  - Instruction: "Push your completed project to a GitHub repository and submit the link below."
  - GitHub URL input with `https://github.com/` validation
  - Submit button with states: "Submitting...", "Project Submitted" (green, disabled)
  - Error banner
  - Success banner: "Project submitted successfully! Your capstone project has been recorded."
- Navigation: "← Back to Requirements", "View Certificate" button (only when submitted)

**Submission flow (CapstonePage.tsx lines 227-244):**
- Calls `POST /projects/complete` with `{ courseSlug, lectureId, projectId, githubUrl }`
- This endpoint (backend `routes/project.ts`): upserts a `Progress` record with `projectCompleted: true` and creates/updates a `Project` record for leaderboard tracking
- Sets local `submitted = true` and `completedProjectId = selected.id`
- **No AI review is triggered** — unlike MilestonePage which uses `useProjectStatus.submitProject`

**"View Certificate" button** (CapstonePage.tsx lines 246-254):
- Calls `completeAction('project', selected.id)` and `completeAction('course_complete', slug)` via `POST /progress/action`
- Then sets step to 'Certificate'

---

### Step 4 — Certificate

Two-state screen toggled by `showCertificate` state (default: false).

**State 1: Results View (showCertificate = false)**

- "Project Passed!" heading with green checkmark circle
- Subtitle: "Congratulations! You have successfully completed the project."
- 3-column grid:
  1. **Validation Results:** Renders `selected.evaluationChecklist` items with green checkmarks (all hardcoded `check: () => true`)
  2. **Project Summary:** Hardcoded list: "All requirements completed", "All tests passed", "Code quality: Good", "Execution successful"
  3. **Your Reward:** Trophy icon with "+500 XP" (gold, pulsing), "Certificate Unlocked" with Award icon, "Course Progress Updated" with CheckCircle icon
- Buttons: "View Summary" (navigates to certificate view), "Back to Dashboard" (navigates to course page)

**State 2: Certificate View (showCertificate = true)**

- Gold-bordered certificate card with decorative border lines
- Text: "Certificate of Completion" (small caps, gold)
- Text: "This certifies that [Student Name] has successfully mastered all curriculum requirements for"
- Course name (from `COURSE_FULL_NAMES`)
- Date: current date formatted as "Month Day, Year"
- Verification seal: "VERIFIED" in a circle
- "Curriculum Verified" label
- "Course Assessment System" signature line
- "Verified Completion" label
- Button: "Back to Results"

---

### Capstone Project 1: Search Algorithm Trace
**id:** `search_trace`
**title:** "Search Algorithm Trace"
**Skills:** Search Algorithms, BFS, DFS, A* Search, Heuristics
**Difficulty:** Intermediate
**Estimated time:** 2-3 Hours
**Goal:** "Implement one search algorithm (BFS or A*) in Python (~40 lines), trace all three algorithms manually on a provided maze, and write a short analysis comparing path optimality and nodes explored."

**Features (Technical Checklist):**
1. "Implement BFS or A* in Python for a given grid maze"
2. "Trace BFS, DFS, and A* manually on the same maze"
3. "Compare paths found: optimality and nodes explored"
4. "Explain why A* with Manhattan heuristic finds the optimal path but Greedy Best-First may not"

**Expected Program Execution Flow:**
1. "Review the provided maze with obstacles, start, and goal"
2. "Implement BFS using a queue or A* with a priority queue"
3. "Manually trace the remaining algorithms on paper/in comments"
4. "Compare path costs and number of nodes explored by each algorithm"
5. "Write a brief analysis connecting to the search lecture concepts (optimality, completeness, heuristics)"

**Requirements:**
- "Repository must contain one Python implementation of BFS or A* on the provided maze."
- "Include a trace (in code comments or a separate text file) showing the order nodes are explored by BFS, DFS, and A*."
- "Report the final path and path cost for each algorithm."
- "Write a short README analysis: which algorithm found the shortest path? Which explored the fewest nodes? Why?"
- "Define the Manhattan heuristic used by A* and explain why it is admissible."

**Guidelines:**
- "Algorithm Choice — Pick either BFS (guarantees shortest path, uses queue) or A* (uses heuristic, more efficient). You only need to implement one — trace the others manually."
- "Heuristic — Explain Manhattan distance and why it is admissible (never overestimates). Show the calculation for at least two cells."
- "Analysis — Connect your results to the course: BFS is complete and optimal but explores many nodes; A* is optimal with an admissible heuristic and explores fewer; DFS finds a path but not necessarily the shortest."

**Evaluation Checklist (all hardcoded check: () => true):**
- "One algorithm implemented — BFS or A* working on the maze."
- "All three algorithms traced — BFS, DFS, A* traces provided."
- "Path costs reported — Path length and optimality compared."
- "Heuristic explained — Manhattan distance and admissibility discussed."
- "Analysis connects to lecture — Optimality, completeness, efficiency discussed."

---

### Capstone Project 2: Logic Puzzle Formalization
**id:** `logic_puzzle`
**title:** "Logic Puzzle Formalization"
**Skills:** Propositional Logic, Knowledge Representation, Inference, Model Checking
**Difficulty:** Intermediate
**Estimated time:** 2-3 Hours
**Goal:** "Take a given Knights and Knaves puzzle, translate it into propositional logic sentences, and write a small Python script (~30 lines) that evaluates all truth assignments to find which characters are knights (truth-tellers) and which are knaves (liars)."

**Features (Technical Checklist):**
1. "Translate a natural language puzzle into propositional logic symbols"
2. "Represent puzzle statements as logic sentences (implications, biconditionals)"
3. "Write a Python script that enumerates all truth assignments and checks consistency with the knowledge base"
4. "Output the solution: which characters are knights and which are knaves"

**Expected Program Execution Flow:**
1. "Read a Knights and Knaves puzzle: 'A says: B is a knight. B says: A and B are different types.'"
2. "Define propositional symbols: A = 'A is a knight', B = 'B is a knight'"
3. "Translate each statement into logic: A ↔ B, B ↔ (A ↔ ¬B)"
4. "Write a Python script that generates all 4 truth assignments and filters those consistent with both statements"
5. "Output the consistent model(s) and declare who is knight/knave"

**Requirements:**
- "Repository must contain the puzzle formalization in propositional logic (in README or comments)."
- "Write a Python script that enumerates all possible truth assignments for the puzzle's symbols."
- "For each assignment, evaluate whether the knowledge base (all puzzle statements) is true."
- "Output which truth assignments are consistent with the puzzle."
- "State definitively: who is a knight and who is a knave."
- "Explain in the README how model checking works and why enumerating 2^n assignments is feasible for small n but not for large problems."

**Guidelines:**
- "Puzzle Formalization — Define a propositional symbol for each person (e.g., A = 'A is a knight'). Remember: knights always tell the truth, knaves always lie — so if A says statement S, the logical equivalence is A ↔ S."
- "Implementation — Your Python script can use nested loops or itertools.product([True, False], repeat=n) to enumerate all models. For each model, evaluate each sentence and check if all are true."
- "Connection to Course — This is model checking — the simplest inference algorithm from the Knowledge lecture. Discuss its limitation: O(2^n) and why resolution or DPLL would be needed for larger problems."

**Evaluation Checklist (all hardcoded check: () => true):**
- "Puzzle formalized in logic — Symbols and sentences defined."
- "Python script enumerates models — All truth assignments checked."
- "Correct solution found — Knight/knave identities correctly determined."
- "README explains model checking — O(2^n) complexity and limitations discussed."

---

### Capstone Project 3: Intro to Text Classification
**id:** `ml_classifier_intro`
**title:** "Intro to Text Classification"
**Skills:** Machine Learning, NLP, Feature Extraction, Model Evaluation
**Difficulty:** Advanced
**Estimated time:** 3-4 Hours
**Goal:** "Use scikit-learn to build a text classifier pipeline: load a dataset, extract TF-IDF features, train a k-NN classifier, and evaluate its performance. Focus on understanding each step conceptually rather than implementing from scratch."

**Features (Technical Checklist):**
1. "Load a text dataset (e.g., sklearn's 20 newsgroups or a CSV file)"
2. "Preprocess text: basic cleaning and TF-IDF vectorization"
3. "Train a k-Nearest Neighbors classifier using scikit-learn"
4. "Evaluate with train/test split and report accuracy"
5. "Experiment with different k values and discuss the bias-variance tradeoff"
6. "Analyze misclassified examples"

**Expected Program Execution Flow:**
1. "Load a dataset: e.g., sklearn.datasets.fetch_20newsgroups(subset='train')"
2. "Split into training and test sets"
3. "Create a TF-IDF vectorizer and transform the text data"
4. "Train a k-NN classifier with k=3, 5, 7"
5. "Evaluate each model on the test set and compare accuracy"
6. "Look at specific misclassified documents and discuss why they were wrong"
7. "Write a README explaining the ML pipeline and bias-variance tradeoff"

**Requirements:**
- "Repository must contain a Python script using scikit-learn for text classification."
- "Load a real text dataset (any public dataset)."
- "Use TfidfVectorizer to convert text to feature vectors."
- "Train a KNeighborsClassifier with at least 3 different k values."
- "Split data into training and test sets and report test accuracy for each k."
- "Show 2-3 misclassified examples and discuss why the model got them wrong."
- "README must explain: what TF-IDF does, how k-NN works, and the bias-variance tradeoff with k."

**Guidelines:**
- "Feature Extraction — Use sklearn's TfidfVectorizer. Explain in your README that TF-IDF gives higher weight to words that are frequent in a document but rare across documents — connecting to the NLP lecture on text representation."
- "k-NN and Bias-Variance — Experiment with k=1, 3, 5, 7. Small k overfits (low bias, high variance), large k underfits (high bias, low variance). Show this empirically and connect to the ML lecture."
- "Error Analysis — Pick 2-3 misclassified documents. Are they genuinely ambiguous? Would a human struggle? This connects to the lecture discussion on generalization and the limits of ML."

**Evaluation Checklist (all hardcoded check: () => true):**
- "Dataset loaded and split — Training and test sets created."
- "TF-IDF features extracted — Text converted to feature vectors."
- "k-NN trained with 3+ k values — Accuracy reported for each k."
- "Error analysis completed — Misclassified examples discussed."
- "README explains concepts — TF-IDF, k-NN, bias-variance tradeoff covered."

---

### Capstone Project 4: CSP Problem Formulation
**id:** `csp_formulation`
**title:** "CSP Problem Formulation"
**Skills:** CSP, Constraint Propagation, Backtracking, Optimization
**Difficulty:** Advanced
**Estimated time:** 3-4 Hours
**Goal:** "Take a real constraint problem (map coloring, scheduling, or Sudoku), formulate it as a CSP with variables, domains, and constraints, and use a provided backtracking solver to find solutions. Analyze how forward checking and MRV affect search efficiency."

**Features (Technical Checklist):**
1. "Choose a problem and define its CSP formulation"
2. "Define variables, their domains, and all constraints"
3. "Use a provided backtracking search solver (starter code given)"
4. "Run the solver with and without forward checking"
5. "Count the number of assignments made in each configuration"
6. "Write an analysis of how constraint propagation reduces the search space"

**Expected Program Execution Flow:**
1. "Choose map coloring of Australia (from the course): 7 variables, 3 colors"
2. "Define constraints: adjacent regions cannot share the same color"
3. "Use the provided backtracking solver to find a valid coloring"
4. "Run with plain backtracking, then with forward checking"
5. "Compare the number of assignments made"
6. "Explain why forward checking prunes the search tree earlier"

**Requirements:**
- "Repository must contain the CSP formulation of your chosen problem."
- "Define variables, domains, and constraints clearly (in code or a table in README)."
- "Use the provided backtracking solver (starter code will be given)."
- "Run the solver in at least two configurations: plain backtracking and with forward checking."
- "Report the number of recursive calls or assignments made in each configuration."
- "README must explain: what a CSP is, how backtracking search works, and why constraint propagation improves efficiency."

**Guidelines:**
- "Problem Choice — Choose map coloring (Australia from the course), a simple weekly schedule (3-4 time slots), or a 4x4 Sudoku. The key is to clearly define variables, domains, and constraints."
- "Provided Solver — Starter code will provide a generic backtracking function. Your job is to plug in your problem's variables, domains, and constraint function — you do not need to implement the solver from scratch."
- "Analysis — Count the number of times the solver assigns a value. Compare plain backtracking vs forward checking. Explain: forward checking detects conflicts earlier, so the solver backtracks sooner and explores fewer dead ends."

**Evaluation Checklist (all hardcoded check: () => true):**
- "CSP formulation is correct — Variables, domains, and constraints defined."
- "Solver runs on the problem — Produces a valid solution."
- "Forward checking compared — Assignment counts reported for both configurations."
- "README explains CSP concepts — Backtracking, forward checking, and constraint propagation discussed."

---

## Capstone Project — Known Issues (from code review)

1. **Project ID mismatch:** Frontend projects use IDs `search_trace`, `logic_puzzle`, `ml_classifier_intro`, `csp_formulation`. Backend's `CAPSTONE_PROJECT_NAMES` and `PROJECT_SKILLS` use `search_visualizer`, `inference_engine`, `text_classifier`, `csp_solver`. Certificates will show raw IDs instead of proper names.

2. **XP display discrepancy:** Frontend shows "+500 XP" on the certificate step. Backend only awards 100 XP for capstone submission.

3. **No AI review:** CapstonePage submits via `POST /projects/complete` which only records progress, not through `POST /student/projects/:projectId/submit` which triggers the AI review pipeline. No AI review results are generated or displayed.

4. **Step 3 success banner says "capstone":** MilestonePage's success banner text reads "Your capstone project has been recorded" even though it's a milestone project.

5. **Hardcoded validation results:** All evaluation checklists use `check: () => true` — every item always shows as passing. No actual validation logic exists.

6. **Certificate step is dead code on MilestonePage:** The JSX exists (lines 943-1086) but the wizard never transitions to it — the ternary always shows `false` branch.

---

## CodeEditor Component (CodeEditor.tsx)

Used inside ProblemCard for all problem types (coding and reflection).

**Toolbar:** Terminal-style icon + "main.py" label + close button.

**Features:**
- Monaco editor (Python syntax highlighting)
- Input panel for `input()` calls (shows labeled input fields when code contains `input()` calls)
- Run button (green "▶ Run") — executes code, shows console output
- Submit button (blue "✓ Submit") — runs test cases or validates reflection word count
- Save button (if `showSaveButton` is true) — saves draft to backend via `POST /drafts`
- Reset button (if `showResetButton` is true)
- Clipboard blocking (if `disableClipboard` is true) — prevents copy/paste via CSS `user-select: none` on expected output display

**Output display:**
- Console Output section with green/red styled pre blocks
- Submission Results section with per-test-case pass/fail indicators
- Line-by-line diff for failed test cases (Expected in green, Actual in red, explanation in blue)
- Error translations for common Python errors (e.g., "name 'X' is not defined" → "The variable 'X' is used before it's defined. Check the spelling and make sure it was assigned a value.")

---

## Navigation Flow (LecturePage.tsx)

**Pages in order for each lecture:**
1. Section 1..N (content sections from lesson.json)
2. Quiz (if quiz has questions)
3. Problems to Solve (if problems have entries)
4. Project / Milestone (if projects have entries)
5. Summary (if summary object exists)

**Lecture 10 special case:** Navigates to CapstonePage instead of showing lecture content:
```typescript
const last = lectures[lectures.length - 1];
if (last && lectureNumber >= last.number) {
  navigate(`/course/${slug}/capstone`, { replace: true });
}
```

**Sidebar navigation:** Left sidebar shows all pages with status indicators (completed checkmark, current dot, upcoming empty circle). Clickable to jump between sections.

**Previous/Next buttons:** Bottom of each page. "Previous" goes back, "Next" goes forward. Section pages require scrolling to bottom before "Next" is enabled ("Scroll to continue" otherwise).

**Problems section completion:** When first 2 main problems are completed, auto-marks section as complete, auto-advances to next problem after 1500ms, and shows "All Problems Completed" modal after all main problems done.

**"All Problems Completed" modal:**
- Checkmark circle with "All Problems Completed" heading
- "You successfully completed all practice problems in this lecture."
- Two buttons: "View Similar Questions" (scrolls to similar section), "Continue to Summary" (navigates to summary page)
- Dismiss backdrop (click anywhere outside to dismiss)

---

**End of audit.**
