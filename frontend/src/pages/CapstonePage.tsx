import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  CheckCircle, ChevronRight, FileText, Play, Send, Terminal, XCircle, 
  Eye, CheckSquare, Award, Loader2, Trophy, ShieldAlert, Check
} from 'lucide-react';
import MonacoEditor from '@monaco-editor/react';
import { runInteractive, runValidationTest, type ExecEvent, type ExecResult } from '../utils/pythonRunnerInteractive';
import VisualPreview from '../components/lesson/VisualPreview';
import { api } from '../api';
import { authFetch } from '../authClient';
import { completeAction } from '../progress';
import { useAuth } from '../auth';

type CapstoneProject = {
  id: string;
  title: string;
  description: string;
  skills: string[];
  difficulty: string;
  estimatedTime: string;
  goal: string;
  features: string[];
  sampleFlow: string[];
  requirements: string[];
  guidelines: { title: string; description: string }[];
  evaluationChecklist: { label: string; description: string; check: (staticChecks: any[], dynamicChecks: any[]) => boolean }[];
};

const PROJECTS: CapstoneProject[] = [
  {
    id: 'student_management',
    title: 'Student Management System',
    description: 'Build a menu-driven records manager that writes, reads, searches, and deletes student records with file persistence.',
    skills: ['Functions', 'Lists', 'Dictionaries', 'File Handling'],
    difficulty: 'Intermediate',
    estimatedTime: '2-3 Hours',
    goal: 'Create a menu-driven application that manages student records. Users can add, view, search, update, and delete student information. Data persists between sessions using file storage.',
    features: [
      'Add a new student with name and grade',
      'View all students and their details',
      'Search for a student by name',
      'Delete a student record',
      'Save and load data from a file',
    ],
    sampleFlow: [
      'Program loads existing data from a file',
      'Menu displays: Add, View, Search, Delete, Save & Exit',
      'User selects an option and interacts with the system',
      'Changes are written back to the file on save',
    ],
    requirements: [
      'Store student records in a file named students.txt.',
      'Each student record should contain a student name and grade.',
      'Display a menu until the user chooses to exit.',
      'Allow users to Add a new student, View all student records, Search for a student by name, and Delete a student record.',
      'Load previously saved records when the program starts.',
      'Save all changes before exiting the application.',
    ],
    guidelines: [
      { title: 'Functions', description: 'Create separate functions for loading records, saving records, and handling the main menu.' },
      { title: 'Dictionaries', description: 'Store student records using a dictionary where the student\'s name is the key and the grade is the value.' },
      { title: 'File Handling', description: 'Read student records from students.txt when the program starts and write updated records back to the file before exiting.' },
      { title: 'Validation', description: 'Handle missing files gracefully using try-except and validate user menu selections.' },
    ],
    evaluationChecklist: [
      { label: 'Menu navigation works', description: 'Interactive menu displays and option 5 exits cleanly.', check: (_, dyn) => dyn[0]?.passed === true },
      { label: 'Add student works', description: 'Successfully captures name and grade input records.', check: (_, dyn) => dyn[1]?.passed === true },
      { label: 'Search student works', description: 'Correctly matches case-insensitive search queries.', check: (_, dyn) => dyn[3]?.passed === true },
      { label: 'Delete student works', description: 'Removes target record from database state.', check: (stat, _) => stat.find(c => c.id === 'dictionaries')?.passed === true },
      { label: 'File handling works', description: 'Uses "students.txt" to read stored records.', check: (stat, _) => stat.find(c => c.id === 'file_handling')?.passed === true },
      { label: 'Data persists', description: 'Saves database records back to file upon program exit.', check: (_, dyn) => dyn[1]?.passed === true || dyn[2]?.passed === true },
      { label: 'Clean code & structure', description: 'Code includes helper functions and runs standard entrypoint.', check: (stat, _) => stat.find(c => c.id === 'functions')?.passed === true },
    ]
  },
  {
    id: 'expense_tracker',
    title: 'Expense Tracker',
    description: 'Log and summarize transactions with dates, categories, and amounts, persisting data to a filesystem.',
    skills: ['Functions', 'Lists', 'Dictionaries', 'File Handling'],
    difficulty: 'Intermediate',
    estimatedTime: '2-3 Hours',
    goal: 'Build an expense logging system where users can add expenses with a category and amount, view summaries, filter by category, and have data persist between sessions.',
    features: [
      'Add an expense with date, category, description, and amount',
      'View all recorded expenses',
      'Filter expenses by category',
      'Display total spending and per-category totals',
      'Save expenses to a file and load on startup',
    ],
    sampleFlow: [
      'Program loads expenses from a file',
      'Menu displays: Add Expense, View All, View by Category, Summary, Save & Exit',
      'User adds expenses with category, description, and amount',
      'Reports show spending breakdown by category',
    ],
    requirements: [
      'Store expense records in expenses.txt.',
      'Each expense should contain: Date, Category, Description, Amount.',
      'Allow users to Add a new expense, View all expenses, Filter expenses by category, and View total spending and category-wise summary.',
      'Load existing expenses when the program starts.',
      'Save all expense data before exiting.',
    ],
    guidelines: [
      { title: 'Functions', description: 'Separate the application into loading, saving, and menu functions.' },
      { title: 'Lists & Dictionaries', description: 'Store each expense as a dictionary inside a list.' },
      { title: 'File Handling', description: 'Read expense records from the file during startup and update the file before exiting.' },
      { title: 'Validation', description: 'Validate numeric amount input and handle missing files gracefully.' },
    ],
    evaluationChecklist: [
      { label: 'Menu navigation works', description: 'Menu displays options and option 5 exits cleanly.', check: (_, dyn) => dyn[5]?.passed === true },
      { label: 'Add expense works', description: 'Captures and appends transaction data to history.', check: (_, dyn) => dyn[0]?.passed === true },
      { label: 'Category filtering works', description: 'Prints only records belonging to the filtered category.', check: (_, dyn) => dyn[2]?.passed === true },
      { label: 'Total calculation works', description: 'Aggregates spending total calculations.', check: (_, dyn) => dyn[3]?.passed === true },
      { label: 'File handling works', description: 'Loads expenses from file and handles disk reading.', check: (stat, _) => stat.find(c => c.id === 'file_handling')?.passed === true },
      { label: 'Data persists', description: 'Saves transactions back to expenses.txt upon exit.', check: (_, dyn) => dyn[4]?.passed === true },
      { label: 'Input conversions safe', description: 'Validates numeric input parsing cleanly.', check: (_, dyn) => dyn[6]?.passed === true },
    ]
  },
  {
    id: 'quiz_app',
    title: 'Quiz Application',
    description: 'Develop an interactive quiz app with multi-choice choices, loops, scoring, and percentage diagnostics.',
    skills: ['Functions', 'Lists', 'Dictionaries', 'Loops'],
    difficulty: 'Intermediate',
    estimatedTime: '2-3 Hours',
    goal: 'Develop an interactive quiz program that presents multiple-choice questions, tracks scores, and provides feedback. Questions and answers are stored in a collection.',
    features: [
      'Store questions, choices, and correct answers in a dictionary',
      'Present questions one at a time in a loop',
      'Accept user input for answer selection',
      'Track correct and incorrect answers',
      'Display final score and percentage',
    ],
    sampleFlow: [
      'Program loads quiz questions from a data structure',
      'Each question is shown one at a time with multiple choices',
      'User selects an answer and gets immediate feedback',
      'Final score is displayed at the end',
    ],
    requirements: [
      'Create a multiple-choice quiz.',
      'Display one question at a time.',
      'Accept answers from the user.',
      'Check whether each answer is correct.',
      'Keep track of the score.',
      'Display Total Questions, Correct Answers, and Final Percentage.',
      'Display the correct answer whenever the user answers incorrectly.',
    ],
    guidelines: [
      { title: 'Functions', description: 'Organize quiz logic inside reusable functions where appropriate.' },
      { title: 'Dictionaries & Lists', description: 'Store questions, options, and correct answers using dictionaries and lists.' },
      { title: 'Loops', description: 'Loop through every question and process the user\'s answer.' },
      { title: 'Validation', description: 'Accept answers in a consistent format and compare them correctly.' },
    ],
    evaluationChecklist: [
      { label: 'Full quiz execution', description: 'Displays all questions and renders final scorecard.', check: (_, dyn) => dyn[0]?.passed === true },
      { label: 'Scoring tracks answers', description: 'Computes correct answer totals properly.', check: (_, dyn) => dyn[1]?.passed === true },
      { label: 'Displays choices', description: 'Iterates and prints choices in a loop.', check: (stat, _) => stat.find(c => c.id === 'loops')?.passed === true },
      { label: 'String matching safe', description: 'Handles inputs case-insensitively.', check: (stat, _) => stat.find(c => c.id === 'conditions')?.passed === true },
    ]
  },
  {
    id: 'todo_list',
    title: 'To-Do List',
    description: 'Create a task organizer supporting status checks and tasks loading/saving with text persistence.',
    skills: ['Functions', 'Lists', 'Dictionaries', 'File Handling'],
    difficulty: 'Intermediate',
    estimatedTime: '2-3 Hours',
    goal: 'Build a task management application where users can add tasks, mark them as complete, delete them, and have their task list persist between sessions using file storage.',
    features: [
      'Add a new task with description',
      'View all tasks with completion status',
      'Mark a task as complete',
      'Delete a task',
      'Save tasks to a file and load on startup',
    ],
    sampleFlow: [
      'Program loads tasks from a file',
      'Menu displays: Add Task, View Tasks, Mark Complete, Delete Task, Save & Exit',
      'User adds tasks with a description and optional priority',
      'Completed tasks are visually distinguished',
    ],
    requirements: [
      'Store tasks inside todo.txt.',
      'Each task should contain Task Title and Completion Status.',
      'Allow users to Add a new task, View all tasks, Mark a task as completed, and Delete a task.',
      'Load saved tasks when the application starts.',
      'Save all updates before exiting.',
    ],
    guidelines: [
      { title: 'Functions', description: 'Create separate functions for loading tasks, saving tasks, and handling menu operations.' },
      { title: 'Lists & Dictionaries', description: 'Store tasks as dictionaries inside a list.' },
      { title: 'File Handling', description: 'Read task data from the file during startup and write updated data before exiting.' },
      { title: 'Validation', description: 'Handle empty task lists, invalid menu choices, and missing files.' },
    ],
    evaluationChecklist: [
      { label: 'Add task works', description: 'Saves task additions into session list.', check: (_, dyn) => dyn[0]?.passed === true },
      { label: 'Complete task works', description: 'Toggles completed tasks status flag.', check: (_, dyn) => dyn[1]?.passed === true },
      { label: 'Checkbox checkboxes', description: 'Prints checkbox markers correctly based on state.', check: (stat, _) => stat.find(c => c.id === 'loops')?.passed === true },
      { label: 'File handling works', description: 'Uses todo.txt for loading and saving task list.', check: (stat, _) => stat.find(c => c.id === 'file_handling')?.passed === true },
    ]
  },
];

const STARTER_CODE: Record<string, string> = {
  student_management: `# Student Management System

def load_students():
    # TODO: Load students from students.txt into a dictionary
    # Return a dictionary of {name: grade}
    # Handle FileNotFoundError gracefully using try-except
    pass

def save_students(students):
    # TODO: Save the student dictionary to students.txt in name,grade format
    pass

def main():
    # TODO: Load existing student records
    # TODO: Display the interactive menu:
    #       1. Add Student
    #       2. View Students
    #       3. Search Student
    #       4. Delete Student
    #       5. Save and Exit
    # TODO: Loop to handle user choices and call functions
    # TODO: Save data to file before exiting and print goodbye/exit message
    pass

if __name__ == "__main__":
    main()
`,

  expense_tracker: `# Expense Tracker

def load_expenses():
    # TODO: Load expenses from expenses.txt
    # Return a list of expense dictionaries
    # Handle FileNotFoundError gracefully
    pass

def save_expenses(expenses):
    # TODO: Save expenses list to expenses.txt
    pass

def main():
    # TODO: Load existing expenses
    # TODO: Display the menu:
    #       1. Add Expense
    #       2. View All Expenses
    #       3. View by Category
    #       4. Summary
    #       5. Save and Exit
    # TODO: Loop to handle user choices and call functions
    # TODO: Save data to file before exiting and print goodbye/exit message
    pass

if __name__ == "__main__":
    main()
`,

  quiz_app: `# Interactive Quiz Application

def main():
    # TODO: Define a dictionary of questions, options, and correct answers
    # TODO: Initialize score and total variables
    # TODO: Iterate through questions and display options
    # TODO: Get user input, normalize it (strip & lowercase), and check correctness
    # TODO: Provide instant feedback and update score
    # TODO: Display final score, percentage, and completion details at the end
    pass

if __name__ == "__main__":
    main()
`,

  todo_list: `# To-Do List Application

def load_tasks():
    # TODO: Load tasks from todo.txt
    # Return a list of task dictionaries
    # Handle FileNotFoundError gracefully
    pass

def save_tasks(tasks):
    # TODO: Save tasks list to todo.txt
    pass

def main():
    # TODO: Load existing tasks
    # TODO: Display the menu:
    #       1. Add Task
    #       2. View Tasks
    #       3. Mark Task Complete
    #       4. Delete Task
    #       5. Save and Exit
    # TODO: Loop to handle user choices and call functions
    # TODO: Save data to file before exiting and print goodbye/exit message
    pass

if __name__ == "__main__":
    main()
`
};

interface TestCase {
  name: string;
  description: string;
  inputs: string[];
  verify: (stdout: string, filesAfter: Record<string, string | null>) => { passed: boolean; error?: string };
}

const TEST_SUITES: Record<string, TestCase[]> = {
  student_management: [
    {
      name: "Menu Navigation & Exit",
      description: "App should display menu options and exit gracefully when option 5 is selected.",
      inputs: ["5"],
      verify: (stdout) => {
        const passed = stdout.toLowerCase().includes("goodbye") || stdout.toLowerCase().includes("exit");
        return { passed, error: passed ? undefined : "Program did not print exit or goodbye message." };
      }
    },
    {
      name: "Add Student Record",
      description: "Adding a student 'Charlie' with grade 'A+' should persist to 'students.txt'.",
      inputs: ["1", "Charlie", "A+", "5"],
      verify: (_stdout, files) => {
        const fileContent = files["students.txt"] || "";
        const lines = fileContent.split("\n").map(l => l.trim()).filter(Boolean);
        const hasRecord = lines.some(l => {
          const [n, g] = l.split(",");
          return n === "Charlie" && g === "A+";
        });
        return { passed: hasRecord, error: hasRecord ? undefined : "Student record 'Charlie,A+' not found in students.txt." };
      }
    },
    {
      name: "View Student Records",
      description: "Viewing students should read and display existing records from 'students.txt'.",
      inputs: ["2", "5"],
      verify: (stdout) => {
        const passed = stdout.includes("Dave") && stdout.includes("B-");
        return { passed, error: passed ? undefined : "Did not display student Dave's grade." };
      }
    },
    {
      name: "Search Student Record",
      description: "Searching for 'Frank' should return their grade if they exist.",
      inputs: ["3", "Frank", "5"],
      verify: (stdout) => {
        const passed = stdout.includes("Frank") && (stdout.includes("C") || stdout.includes("found"));
        return { passed, error: passed ? undefined : "Did not display correct search result for Frank." };
      }
    }
  ],
  expense_tracker: [
    {
      name: "Add Expense functionality",
      description: "Adding an expense should prompt for details and update the records.",
      inputs: ["1", "2026-06-15", "Food", "Dinner", "12.50", "5"],
      verify: (stdout, files) => {
        const hasAddedMessage = stdout.includes("Added expense") || stdout.includes("12.5");
        const fileContent = files["expenses.txt"] || "";
        const hasInFile = fileContent.includes("Food") && (fileContent.includes("12.5") || fileContent.includes("12.50"));
        const passed = hasAddedMessage || hasInFile;
        return { passed, error: passed ? undefined : "Could not verify that expense was successfully added." };
      }
    },
    {
      name: "View All Expenses",
      description: "Viewing all expenses should read and display existing records from expenses.txt.",
      inputs: ["2", "5"],
      verify: (stdout) => {
        const passed = stdout.includes("Pizza") && stdout.includes("Movie");
        return { passed, error: passed ? undefined : "Did not display existing expense records." };
      }
    },
    {
      name: "Category Filtering",
      description: "Filtering by category should display only expenses belonging to that category.",
      inputs: ["3", "Food", "5"],
      verify: (stdout) => {
        const hasFood = stdout.includes("Pizza");
        const hasEnt = stdout.includes("Movie");
        const passed = hasFood && !hasEnt;
        return { passed, error: passed ? undefined : "Category filtering did not properly restrict view." };
      }
    },
    {
      name: "Spending Summary calculations",
      description: "Selecting Summary should display total spending of entered expenses.",
      inputs: ["4", "5"],
      verify: (stdout) => {
        const passed = stdout.includes("25") || stdout.includes("25.0") || stdout.includes("25.00");
        return { passed, error: passed ? undefined : "Did not calculate or display correct total spending." };
      }
    },
    {
      name: "File Persistence (save/load)",
      description: "Expenses should be saved to 'expenses.txt' upon exit and loaded on startup.",
      inputs: ["1", "2026-06-15", "Rent", "Monthly", "1200.00", "5"],
      verify: (_stdout, files) => {
        const fileContent = files["expenses.txt"] || "";
        const passed = fileContent.includes("Rent") && (fileContent.includes("1200") || fileContent.includes("1200.0") || fileContent.includes("1200.00"));
        return { passed, error: passed ? undefined : "Expense was not written to expenses.txt upon save." };
      }
    },
    {
      name: "Menu Navigation & Exit",
      description: "App should display menu options and exit gracefully when option 5 is selected.",
      inputs: ["5"],
      verify: (stdout) => {
        const passed = stdout.toLowerCase().includes("goodbye") || stdout.toLowerCase().includes("exit");
        return { passed, error: passed ? undefined : "Program did not display menu or exit cleanly." };
      }
    },
    {
      name: "Program Stability",
      description: "Program should handle invalid inputs and unexpected data without crashing.",
      inputs: ["9", "5"],
      verify: (stdout) => {
        const passed = (stdout.toLowerCase().includes("invalid") || stdout.toLowerCase().includes("choice") || stdout.toLowerCase().includes("error")) &&
                       (stdout.toLowerCase().includes("goodbye") || stdout.toLowerCase().includes("exit"));
        return { passed, error: passed ? undefined : "Program did not handle invalid menu options gracefully." };
      }
    }
  ],
  todo_list: [
    {
      name: "Add Task to List",
      description: "Adding 'Buy Milk' should save it with status '0' in 'todo.txt'.",
      inputs: ["1", "Buy Milk", "5"],
      verify: (_stdout, files) => {
        const fileContent = files["todo.txt"] || "";
        const lines = fileContent.split("\n").map(l => l.trim()).filter(Boolean);
        const hasTask = lines.some(l => {
          const [title, status] = l.split(",");
          return title === "Buy Milk" && status === "0";
        });
        return { passed: hasTask, error: hasTask ? undefined : "Task not found in todo.txt with active status." };
      }
    },
    {
      name: "Mark Task Complete",
      description: "Completing task should change its status to '1' in 'todo.txt'.",
      inputs: ["3", "Read Book", "5"],
      verify: (_stdout, files) => {
        const fileContent = files["todo.txt"] || "";
        const lines = fileContent.split("\n").map(l => l.trim()).filter(Boolean);
        const isComplete = lines.some(l => {
          const [title, status] = l.split(",");
          return title === "Read Book" && status === "1";
        });
        return { passed: isComplete, error: isComplete ? undefined : "Task 'Read Book' was not marked complete." };
      }
    }
  ],
  quiz_app: [
    {
      name: "Full Quiz Execution",
      description: "Complete the quiz and print final scorecard (e.g. 3/3).",
      inputs: ["a", "b", "c"],
      verify: (stdout) => {
        const passed = stdout.includes("3/3") || stdout.includes("100%");
        return { passed, error: passed ? undefined : "Did not output perfect score scorecard." };
      }
    },
    {
      name: "Mixed Quiz Scoring",
      description: "Answering some questions wrong should output score 1/3.",
      inputs: ["a", "a", "a"],
      verify: (stdout) => {
        const passed = stdout.includes("1/3") || stdout.includes("33");
        return { passed, error: passed ? undefined : "Did not output correct score 1/3." };
      }
    }
  ]
};

const SKILLS_MASTERED = [
  'Variables', 'Input / Output', 'Conditions', 'Loops',
  'Functions', 'Lists', 'Dictionaries', 'Strings', 'File Handling',
];

const STEPS = ['Choose Project', 'Requirements', 'Workspace', 'Submit'] as const;
type Step = typeof STEPS[number];

function validateCapstoneProject(code: string, project: CapstoneProject) {
  const cleanCode = code.split('\n').map(line => line.replace(/#.*$/, '')).join('\n');
  const n = cleanCode.toLowerCase().replace(/\s/g, '');

  const checks = [
    { id: 'variables', label: 'Variables Usage', passed: /\b\w+\s*=/.test(cleanCode) },
    { id: 'input_output', label: 'Input / Output Functions', passed: n.includes('input(') && n.includes('print(') },
    { id: 'conditions', label: 'Conditional Logic (if/else)', passed: /\bif\b/.test(cleanCode) },
    { id: 'loops', label: 'Looping Statements (for/while)', passed: /\bwhile\b|\bfor\b/.test(cleanCode) },
  ];

  if (project.skills.includes('Functions')) {
    checks.push({ id: 'functions', label: 'Custom Functions (def)', passed: (cleanCode.match(/\bdef\b/g) || []).length >= 2 });
  }
  if (project.skills.includes('Lists')) {
    checks.push({ id: 'lists', label: 'List Data Structures', passed: /\[.*\]/.test(cleanCode) });
  }
  if (project.skills.includes('Dictionaries')) {
    checks.push({ id: 'dictionaries', label: 'Dictionaries usage', passed: n.includes('{}') || n.includes('dict(') || /\{[^}]+\}/.test(cleanCode) });
  }
  if (project.skills.includes('File Handling')) {
    checks.push({ id: 'file_handling', label: 'File Operations (open)', passed: n.includes('open(') });
  }

  return { passed: checks.every(c => c.passed), checks };
}

export default function CapstonePage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('Choose Project');
  const [selected, setSelected] = useState<CapstoneProject | null>(null);
  const [completedProjectId, setCompletedProjectId] = useState<string | null>(null);
  const [code, setCode] = useState('# Write your Python project here\n');
  const [lastLectureNumber, setLastLectureNumber] = useState<number | null>(null);
  const [consoleEntries, setConsoleEntries] = useState<{ type: 'stdout' | 'stderr' | 'stdin-prompt' | 'stdin-value'; text: string }[]>([]);
  const [awaitingInput, setAwaitingInput] = useState(false);
  const [inputPrompt, setInputPrompt] = useState('');
  const [inputBuffer, setInputBuffer] = useState('');
  const [running, setRunning] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [splitRatio, setSplitRatio] = useState(60);
  const [activeTab, setActiveTab] = useState<'console' | 'preview' | 'tests'>('console');
  
  // Test results state
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [staticCheckResults, setStaticCheckResults] = useState<{ id: string; label: string; passed: boolean }[]>([]);
  const [dynamicTestResults, setDynamicTestResults] = useState<{ name: string; description: string; passed: boolean | null; error?: string }[]>([]);

  const dividerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragging = useRef(false);
  const generatorRef = useRef<Generator<ExecEvent, ExecResult, string> | null>(null);

  // Auto-scroll console when entries change
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleEntries]);

  // Auto-focus input when waiting
  useEffect(() => {
    if (awaitingInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [awaitingInput]);

  useEffect(() => {
    if (!slug) return;
    api.courseLectures(slug)
      .then((lectures) => {
        if (lectures.length > 0) {
          const lastNum = lectures[lectures.length - 1].number;
          setLastLectureNumber(lastNum);
          
          // Fetch capstone project completion status
          authFetch<{ projectCompleted: boolean; projectId: string | null }>(`/progress/lecture/${slug}/${lastNum}`)
            .then((res) => {
              if (res.projectCompleted && res.projectId) {
                setCompletedProjectId(res.projectId);
                const compProj = PROJECTS.find(p => p.id === res.projectId);
                if (compProj) {
                  setSelected(compProj);
                }
              }
            })
            .catch((err) => {
              console.error('Failed to load capstone progress', err);
            });
        }
      })
      .catch((err) => {
        console.error('Failed to load course lectures for capstone progress', err);
      });
  }, [slug]);

  // Handle selected project changes
  useEffect(() => {
    if (selected) {
      setCode(STARTER_CODE[selected.id] || '# Write your Python project here\n');
      const staticChecks = validateCapstoneProject('', selected).checks.map(c => ({ ...c, passed: false }));
      setStaticCheckResults(staticChecks);
      
      const dynSuite = TEST_SUITES[selected.id] || [];
      setDynamicTestResults(dynSuite.map(tc => ({
        name: tc.name,
        description: tc.description,
        passed: null
      })));
      setSubmitted(false);
      setShowCertificate(false);
      setConsoleEntries([]);
    }
  }, [selected]);

  function addEntry(entry: { type: 'stdout' | 'stderr' | 'stdin-prompt' | 'stdin-value'; text: string }) {
    setConsoleEntries(prev => [...prev, entry]);
  }

  function stepGenerator(input?: string) {
    const gen = generatorRef.current;
    if (!gen) return;

    try {
      const { value, done } = input !== undefined ? gen.next(input) : gen.next();

      if (done) {
        generatorRef.current = null;
        setRunning(false);
        if (value?.error) {
          addEntry({ type: 'stderr', text: value.error });
        }
        return;
      }

      if (value.type === 'stdout') {
        addEntry({ type: 'stdout', text: value.text });
        stepGenerator();
      } else if (value.type === 'input') {
        setInputPrompt(value.prompt);
        setAwaitingInput(true);
      } else if (value.type === 'stderr') {
        addEntry({ type: 'stderr', text: value.text });
        stepGenerator();
      }
    } catch (e) {
      generatorRef.current = null;
      setRunning(false);
      addEntry({ type: 'stderr', text: String(e instanceof Error ? e.message : e) });
    }
  }

  function handleRun() {
    setConsoleEntries([]);
    setAwaitingInput(false);
    setInputPrompt('');
    setRunning(true);
    setActiveTab('console');

    try {
      const gen = runInteractive(code);
      generatorRef.current = gen;
      stepGenerator();
    } catch (e) {
      generatorRef.current = null;
      setRunning(false);
      addEntry({ type: 'stderr', text: String(e instanceof Error ? e.message : e) });
    }
  }

  function handleInputSubmit() {
    if (!awaitingInput) return;
    const val = inputBuffer;
    setInputBuffer('');
    setAwaitingInput(false);
    addEntry({ type: 'stdin-value', text: val + '\n' });
    stepGenerator(val);
  }

  const outputString = useMemo(() => {
    return consoleEntries
      .filter(entry => entry.type === 'stdout')
      .map(entry => entry.text)
      .join('');
  }, [consoleEntries]);

  // Run the test suite on submission
  const runTestSuiteAsync = async (project: CapstoneProject) => {
    setActiveTab('tests');
    setIsRunningTests(true);
    
    // 1. Run static checks
    const staticRes = validateCapstoneProject(code, project);
    setStaticCheckResults(staticRes.checks);
    
    // 2. Prepare test cases
    const suite = TEST_SUITES[project.id] || [];
    const results: { name: string; description: string; passed: boolean; error?: string }[] = [];
    
    for (const tc of suite) {
      const filesToBackup = ["students.txt", "expenses.txt", "todo.txt"];
      const backups: Record<string, string | null> = {};
      for (const f of filesToBackup) {
        backups[f] = localStorage.getItem(`fa_file_${f}`);
      }
      
      try {
        if (project.id === 'student_management') {
          if (tc.name === "View Student Records") {
            localStorage.setItem('fa_file_students.txt', 'Dave,B-\nEva,A\n');
          } else if (tc.name === "Search Student Record") {
            localStorage.setItem('fa_file_students.txt', 'Frank,C\n');
          } else if (tc.name === "Delete Student Record") {
            localStorage.setItem('fa_file_students.txt', 'Grace,A\n');
          }
        } else if (project.id === 'expense_tracker') {
          if (tc.name === "View All Expenses" || tc.name === "Category Filtering") {
            localStorage.setItem('fa_file_expenses.txt', '2026-06-15,Food,Pizza,15\n2026-06-15,Entertainment,Movie,12\n');
          } else if (tc.name === "Spending Summary calculations") {
            localStorage.setItem('fa_file_expenses.txt', '2026-06-15,Food,Pizza,15\n2026-06-15,Food,Burger,10\n');
          }
        } else if (project.id === 'todo_list') {
          if (tc.name === "Mark Task Complete") {
            localStorage.setItem('fa_file_todo.txt', 'Read Book,0\n');
          }
        }
        
        const { stdout, error } = runValidationTest(code, tc.inputs);
        
        if (error) {
          results.push({
            name: tc.name,
            description: tc.description,
            passed: false,
            error: `Runtime error: ${error}`
          });
          continue;
        }
        
        const filesAfter: Record<string, string | null> = {};
        for (const f of filesToBackup) {
          filesAfter[f] = localStorage.getItem(`fa_file_${f}`);
        }
        
        const assertRes = tc.verify(stdout, filesAfter);
        results.push({
          name: tc.name,
          description: tc.description,
          passed: assertRes.passed,
          error: assertRes.error
        });
      } catch (err) {
        results.push({
          name: tc.name,
          description: tc.description,
          passed: false,
          error: `Execution error: ${String(err)}`
        });
      } finally {
        for (const f of filesToBackup) {
          if (backups[f] === null) {
            localStorage.removeItem(`fa_file_${f}`);
          } else {
            localStorage.setItem(`fa_file_${f}`, backups[f]!);
          }
        }
      }
      
      setDynamicTestResults([...results]);
      await new Promise(r => setTimeout(r, 600)); // nice visual delay
    }
    
    setIsRunningTests(false);
    
    const allStaticPassed = staticRes.passed;
    const allDynamicPassed = results.every(r => r.passed);
    
    if (allStaticPassed && allDynamicPassed) {
      setSubmitted(true);
      setStep('Submit');
      try {
        if (slug && lastLectureNumber !== null) {
          await authFetch('/projects/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseSlug: slug, lectureId: String(lastLectureNumber), projectId: project.id })
          });
        } else {
          console.warn('Capstone completion skipped because lecture number is unknown');
        }
        await completeAction('project', project.id);
        await completeAction('course_complete', slug ?? 'python');
      } catch (e) {
        console.error("Progress submission failed", e);
      }
    }
  };

  const stepIdx = STEPS.indexOf(step);


  function goNext() {
    const i = STEPS.indexOf(step);
    if (i < STEPS.length - 1) setStep(STEPS[i + 1]);
  }

  function goPrev() {
    const i = STEPS.indexOf(step);
    if (i > 0) setStep(STEPS[i - 1]);
  }

  function handleDividerMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    dragging.current = true;
    document.addEventListener('mousemove', handleDividerMouseMove);
    document.addEventListener('mouseup', handleDividerMouseUp);
  }

  function handleDividerMouseMove(e: MouseEvent) {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const pct = (y / rect.height) * 100;
    setSplitRatio(Math.max(25, Math.min(80, pct)));
  }

  function handleDividerMouseUp() {
    dragging.current = false;
    document.removeEventListener('mousemove', handleDividerMouseMove);
    document.removeEventListener('mouseup', handleDividerMouseUp);
  }

  const requirementsTotal = selected?.requirements.length || 0;
  let requirementsCompletedCount = 0;
  if (selected) {
    selected.requirements.forEach((_, i) => {
      let satisfied = false;
      if (selected.id === 'student_management') {
        if (i === 0) satisfied = dynamicTestResults[0]?.passed === true;
        if (i === 1) satisfied = dynamicTestResults[1]?.passed === true;
        if (i === 2) satisfied = dynamicTestResults[3]?.passed === true;
        if (i === 3) satisfied = staticCheckResults.find(c => c.id === 'dictionaries')?.passed === true;
        if (i === 4) satisfied = staticCheckResults.find(c => c.id === 'file_handling')?.passed === true;
        if (i === 5) satisfied = dynamicTestResults[1]?.passed === true;
      } else if (selected.id === 'expense_tracker') {
        if (i === 0) satisfied = staticCheckResults.find(c => c.id === 'file_handling')?.passed === true;
        if (i === 1) satisfied = dynamicTestResults[0]?.passed === true;
        if (i === 2) satisfied = dynamicTestResults[2]?.passed === true;
        if (i === 3) satisfied = dynamicTestResults[3]?.passed === true;
        if (i === 4) satisfied = dynamicTestResults[4]?.passed === true;
      } else if (selected.id === 'quiz_app') {
        if (i === 0) satisfied = staticCheckResults.find(c => c.id === 'dictionaries')?.passed === true;
        if (i === 1) satisfied = staticCheckResults.find(c => c.id === 'loops')?.passed === true;
        if (i === 2) satisfied = dynamicTestResults[0]?.passed === true;
        if (i === 3) satisfied = dynamicTestResults[1]?.passed === true;
      } else if (selected.id === 'todo_list') {
        if (i === 0) satisfied = staticCheckResults.find(c => c.id === 'file_handling')?.passed === true;
        if (i === 1) satisfied = staticCheckResults.find(c => c.id === 'loops')?.passed === true;
        if (i === 2) satisfied = dynamicTestResults[1]?.passed === true;
        if (i === 3) satisfied = staticCheckResults.find(c => c.id === 'lists')?.passed === true;
        if (i === 4) satisfied = dynamicTestResults[1]?.passed === true;
      }
      if (satisfied) requirementsCompletedCount++;
    });
  }
  const requirementsPercent = requirementsTotal > 0 ? Math.round((requirementsCompletedCount / requirementsTotal) * 100) : 0;

  const evaluationTotal = selected?.evaluationChecklist.length || 0;
  const evaluationPassedCount = selected?.evaluationChecklist.filter(item => item.check(staticCheckResults, dynamicTestResults)).length || 0;
  const evaluationPercent = evaluationTotal > 0 ? Math.round((evaluationPassedCount / evaluationTotal) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100 font-sans">
      {/* ── Top Bar ── */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md flex-shrink-0 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(`/course/${slug}`)}
            className="text-xs text-slate-400 hover:text-white transition-all flex items-center gap-1 bg-slate-800/40 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/30 font-medium"
          >
            &larr; Exit Workspace
          </button>

          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center">
                <button
                  onClick={() => i <= stepIdx && setStep(s)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    i === stepIdx
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : i < stepIdx
                      ? 'text-emerald-400 hover:text-emerald-300'
                      : 'text-slate-600 cursor-not-allowed'
                  }`}
                >
                  {i < stepIdx && <Check size={12} className="inline mr-1 stroke-[3]" />}
                  {s}
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`w-6 h-0.5 mx-1 ${i < stepIdx ? 'bg-emerald-500/30' : 'bg-slate-800'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="w-[110px]" />
        </div>
      </header>

      {/* ── Step 1: Choose Project ── */}
      {step === 'Choose Project' && (
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-950 to-slate-900">
          <div className="max-w-5xl mx-auto px-6 py-12">
            {completedProjectId && (
              <div className="mb-8 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
                <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="text-sm font-bold text-amber-200">Capstone Project Locked</h4>
                  <p className="text-xs text-amber-200/80 leading-relaxed mt-1">
                    You have already completed your capstone project. Only one capstone project can be submitted per course.
                  </p>
                </div>
              </div>
            )}
            <div className="text-center mb-12">
              <span className="text-blue-500 font-semibold tracking-widest text-[10px] uppercase bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/25">
                Capstone Challenge
              </span>
              <h1 className="text-4xl font-extrabold text-white mt-4 tracking-tight">
                Select Your Final Project
              </h1>
              <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed mt-2">
                Demonstrate your programming mastery. Select one of the projects below to build in your interactive coding sandbox.
              </p>
              
              <div className="flex flex-wrap justify-center gap-2 mt-8 max-w-3xl mx-auto">
                {SKILLS_MASTERED.map(s => (
                  <span key={s} className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900/60 border border-slate-800/80 px-3.5 py-2 rounded-xl">
                    <CheckCircle size={13} className="text-emerald-400" />
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {PROJECTS.map(p => {
                const isSelected = selected?.id === p.id;
                const isLocked = completedProjectId !== null && completedProjectId !== p.id;
                return (
                  <div
                    key={p.id}
                    className={`rounded-2xl border transition-all duration-300 p-6 flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-500 bg-blue-950/20 shadow-[0_0_30px_rgba(59,130,246,0.15)]'
                        : isLocked
                        ? 'border-slate-900 bg-slate-950/50 opacity-40'
                        : 'border-slate-800 bg-slate-900/40 hover:border-slate-700/60 hover:bg-slate-900/60'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <h3 className="text-lg font-bold text-white tracking-tight">{p.title}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                          {p.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mb-6">{p.description}</p>
                      
                      <div className="mb-6">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Key Concepts Tested</span>
                        <div className="flex flex-wrap gap-1.5">
                          {p.skills.map(s => (
                            <span key={s} className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/30">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelected(p)}
                      disabled={isLocked}
                      className={`w-full text-xs font-bold py-3 rounded-xl transition-all border ${
                        isLocked
                          ? 'bg-slate-900 text-slate-500 border-slate-800/80 cursor-not-allowed'
                          : isSelected
                          ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-600 shadow-lg shadow-blue-500/20'
                          : 'bg-transparent text-slate-300 border-slate-700 hover:border-slate-500 hover:text-white'
                      }`}
                    >
                      {isLocked ? 'Locked' : (isSelected ? 'Selected' : 'Select Project')}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end mt-12 pt-6 border-t border-slate-900">
              <button
                onClick={goNext}
                disabled={!selected}
                className={`inline-flex items-center gap-2 text-xs font-bold px-6 py-3 rounded-xl transition-all ${
                  selected 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/15' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/30'
                }`}
              >
                Configure Requirements
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Requirements ── */}
      {step === 'Requirements' && (
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-950 to-slate-900">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="mb-10 text-center md:text-left">
              <span className="text-xs text-blue-500 font-bold uppercase tracking-widest">Requirements & Scope</span>
              <h2 className="text-3xl font-extrabold text-white mt-1">{selected?.title}</h2>
            </div>

            <div className="space-y-8">
              <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Core Objective</h3>
                <p className="text-sm text-slate-300 leading-relaxed font-light">{selected?.goal}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <CheckSquare size={14} className="text-emerald-400" />
                    Technical Checklist
                  </h3>
                  <div className="space-y-3">
                    {selected?.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-3 text-xs leading-relaxed text-slate-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Terminal size={14} className="text-blue-400" />
                    Expected Program Execution Flow
                  </h3>
                  <div className="space-y-3">
                    {selected?.sampleFlow.map((s, i) => (
                      <div key={i} className="flex items-start gap-3 text-xs leading-relaxed text-slate-400">
                        <span className="font-bold text-blue-400 min-w-[14px]">{i + 1}.</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-12 pt-6 border-t border-slate-900">
              <button 
                onClick={goPrev} 
                className="text-xs font-bold text-slate-400 hover:text-white transition-all bg-slate-800/30 hover:bg-slate-800 px-4 py-2 rounded-xl border border-slate-700/20"
              >
                &larr; Switch Project
              </button>
              <button
                onClick={goNext}
                className="inline-flex items-center gap-2 text-xs font-bold px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/15 transition-all"
              >
                Launch Workspace
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3: Workspace ── */}
      {step === 'Workspace' && (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Project Scope */}
          <aside className="w-[420px] flex-shrink-0 border-r border-slate-900 bg-slate-950 overflow-y-auto flex flex-col justify-between">
            <div className="p-5 space-y-6">
              {/* Header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                    {selected?.difficulty}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    Est. Time: {selected?.estimatedTime}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-white tracking-tight">{selected?.title}</h3>
                
                {/* Tech Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {selected?.skills.map(skill => (
                    <span key={skill} className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-800">
                      {skill}
                    </span>
                  ))}
                </div>
                
                <p className="text-xs text-slate-400 leading-relaxed font-light mt-2 bg-slate-900/40 p-3 rounded-xl border border-slate-900">
                  {selected?.description}
                </p>
              </div>

              {/* Section 1: Requirements */}
              <div className="border-t border-slate-900 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="text-base">📋</span> Requirements
                  </h4>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {requirementsPercent}% Done
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-slate-900 rounded-full h-1.5 mb-4 overflow-hidden border border-slate-800">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-emerald-500 h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${requirementsPercent}%` }}
                  />
                </div>
                <div className="space-y-2.5">
                  {selected?.requirements.map((req, i) => {
                    let satisfied = false;
                    if (selected?.id === 'student_management') {
                      if (i === 0) satisfied = dynamicTestResults[0]?.passed === true; // Menu works
                      if (i === 1) satisfied = dynamicTestResults[1]?.passed === true; // Add works
                      if (i === 2) satisfied = dynamicTestResults[3]?.passed === true; // Search works
                      if (i === 3) satisfied = staticCheckResults.find(c => c.id === 'dictionaries')?.passed === true; // Delete dictionary
                      if (i === 4) satisfied = staticCheckResults.find(c => c.id === 'file_handling')?.passed === true; // Load data
                      if (i === 5) satisfied = dynamicTestResults[1]?.passed === true; // Save data
                    } else if (selected?.id === 'expense_tracker') {
                      if (i === 0) satisfied = staticCheckResults.find(c => c.id === 'file_handling')?.passed === true;
                      if (i === 1) satisfied = dynamicTestResults[0]?.passed === true;
                      if (i === 2) satisfied = dynamicTestResults[2]?.passed === true;
                      if (i === 3) satisfied = dynamicTestResults[3]?.passed === true;
                      if (i === 4) satisfied = dynamicTestResults[4]?.passed === true;
                    } else if (selected?.id === 'quiz_app') {
                      if (i === 0) satisfied = staticCheckResults.find(c => c.id === 'dictionaries')?.passed === true;
                      if (i === 1) satisfied = staticCheckResults.find(c => c.id === 'loops')?.passed === true;
                      if (i === 2) satisfied = dynamicTestResults[0]?.passed === true;
                      if (i === 3) satisfied = dynamicTestResults[1]?.passed === true;
                    } else if (selected?.id === 'todo_list') {
                      if (i === 0) satisfied = staticCheckResults.find(c => c.id === 'file_handling')?.passed === true;
                      if (i === 1) satisfied = staticCheckResults.find(c => c.id === 'loops')?.passed === true;
                      if (i === 2) satisfied = dynamicTestResults[1]?.passed === true;
                      if (i === 3) satisfied = staticCheckResults.find(c => c.id === 'lists')?.passed === true;
                      if (i === 4) satisfied = dynamicTestResults[1]?.passed === true;
                    }

                    return (
                      <div 
                        key={i} 
                        className={`flex gap-3 p-3 rounded-xl border transition-all duration-300 ${
                          satisfied 
                            ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-200' 
                            : 'bg-slate-900/20 border-slate-900 text-slate-400 hover:border-slate-800'
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {satisfied ? (
                            <CheckCircle size={14} className="text-emerald-400 stroke-[2.5]" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-slate-700 bg-slate-900" />
                          )}
                        </div>
                        <span className="text-xs leading-normal">{req}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Implementation Guidelines */}
              <div className="border-t border-slate-900 pt-5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="text-base">💡</span> Implementation Guidelines
                </h4>
                <div className="space-y-3 bg-slate-900/30 p-4 rounded-xl border border-slate-900">
                  {selected?.guidelines.map((guide, i) => (
                    <div key={i} className="space-y-1">
                      <h5 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        {guide.title}
                      </h5>
                      <p className="text-[11px] text-slate-400 leading-normal pl-3">
                        {guide.description}
                      </p>
                    </div>
                  ))}
                  
                  {/* Subtle tips helper block */}
                  <div className="border-t border-slate-800/60 pt-3 mt-1 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pro Engineering Tips:</span>
                    <ul className="text-[10px] text-slate-500 space-y-1 list-disc pl-3 leading-normal">
                      <li>Divide logic into self-contained functions.</li>
                      <li>Handle edge cases (e.g. empty lists, invalid inputs).</li>
                      <li>Double-check file reading mode vs write mode flags.</li>
                      <li>Save session progress immediately after mutations.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section 3: Evaluation Checklist */}
              <div className="border-t border-slate-900 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="text-base">✅</span> Evaluation Checklist
                  </h4>
                  <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    {evaluationPassedCount}/{evaluationTotal} Passed
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-slate-900 rounded-full h-1.5 mb-4 overflow-hidden border border-slate-800">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${evaluationPercent}%` }}
                  />
                </div>
                <div className="space-y-2">
                  {selected?.evaluationChecklist.map((item, i) => {
                    const passed = item.check(staticCheckResults, dynamicTestResults);
                    return (
                      <div 
                        key={i} 
                        className={`flex items-center justify-between text-xs px-3.5 py-2.5 rounded-xl border transition-all ${
                          passed 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 font-semibold' 
                            : 'bg-slate-900/60 border-slate-800/40 text-slate-400'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-200">{item.label}</p>
                          <p className="text-[10px] text-slate-500 font-normal truncate max-w-[280px]">{item.description}</p>
                        </div>
                        {passed ? (
                          <span className="text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded text-[10px] border border-emerald-500/25 flex items-center gap-1">
                            <Check size={10} className="stroke-[3]" /> Passed
                          </span>
                        ) : (
                          <span className="text-slate-500 font-medium bg-slate-800/60 px-2 py-0.5 rounded text-[10px] border border-slate-800">
                            Pending
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="h-4" />
          </aside>

          {/* Right Panel: Code Workspace */}
          <div ref={containerRef} className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">
            {completedProjectId !== null && selected?.id !== completedProjectId && (
              <div className="bg-amber-500/10 border-b border-amber-500/25 px-4 py-3 flex items-start gap-2.5 flex-shrink-0">
                <ShieldAlert size={15} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-200/90 leading-relaxed font-medium">
                  You have already completed your capstone project. Only one capstone project can be submitted per course.
                </p>
              </div>
            )}
            {/* Workspace Header toolbar */}
            <div className="h-12 flex items-center justify-between px-4 bg-slate-900 border-b border-slate-850 flex-shrink-0">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-blue-500" />
                <span className="text-xs font-semibold text-slate-300">main.py</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRun}
                  disabled={completedProjectId !== null && selected?.id !== completedProjectId}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-lg border transition-all ${
                    completedProjectId !== null && selected?.id !== completedProjectId
                      ? 'bg-slate-900 text-slate-650 border-slate-800/80 cursor-not-allowed'
                      : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border-emerald-600/30'
                  }`}
                >
                  <Play size={12} className={completedProjectId !== null && selected?.id !== completedProjectId ? 'fill-slate-600/20' : 'fill-emerald-400/20'} />
                  Run Code
                </button>
                <button
                  onClick={() => selected && runTestSuiteAsync(selected)}
                  disabled={submitted || isRunningTests || (completedProjectId !== null && selected?.id !== completedProjectId)}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-4 py-1.5 rounded-lg transition-all border ${
                    submitted || (completedProjectId !== null && selected?.id !== completedProjectId)
                      ? 'bg-slate-800 text-slate-500 border-slate-700/30 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/15'
                  }`}
                >
                  {isRunningTests ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <CheckSquare size={12} />
                      Submit Solution
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Monaco Editor Container */}
            <div className="flex-shrink-0 overflow-hidden relative" style={{ height: `${splitRatio}%` }}>
              <MonacoEditor
                height="100%"
                language="python"
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val ?? '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  padding: { top: 12 },
                  automaticLayout: true,
                }}
              />
            </div>

            {/* Resizable Split Divider */}
            <div
              ref={dividerRef}
              onMouseDown={handleDividerMouseDown}
              className="flex-shrink-0 h-1.5 bg-slate-900 hover:bg-blue-500 cursor-row-resize transition-all relative z-10"
            />

            {/* Bottom Tabbed Panel */}
            <div className="flex-1 flex flex-col min-h-[150px] bg-slate-950 overflow-hidden">
              {/* Tabs list */}
              <div className="flex items-center bg-slate-900 border-b border-slate-850 px-2 flex-shrink-0">
                <button
                  onClick={() => setActiveTab('console')}
                  className={`flex items-center gap-1.5 text-[11px] font-bold px-4 py-2 border-b-2 transition-all ${
                    activeTab === 'console'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Terminal size={12} />
                  Terminal Console
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-1.5 text-[11px] font-bold px-4 py-2 border-b-2 transition-all ${
                    activeTab === 'preview'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Eye size={12} />
                  Visual Simulation
                </button>
                <button
                  onClick={() => setActiveTab('tests')}
                  className={`flex items-center gap-1.5 text-[11px] font-bold px-4 py-2 border-b-2 transition-all ${
                    activeTab === 'tests'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <CheckSquare size={12} />
                  Verification Output
                </button>
              </div>

              {/* Active tab contents */}
              <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
                {activeTab === 'console' && (
                  <div ref={consoleRef} className="h-full flex flex-col justify-between">
                    <div className="space-y-1">
                      {consoleEntries.length === 0 && !running && (
                        <div className="text-slate-600 italic">Console ready. Click Run Code to see execution output.</div>
                      )}
                      {consoleEntries.map((entry, i) => (
                        <pre 
                          key={i} 
                          className={`whitespace-pre-wrap leading-relaxed ${
                            entry.type === 'stderr' ? 'text-red-400 font-semibold' :
                            entry.type === 'stdin-value' ? 'text-blue-400 font-bold' : 
                            'text-slate-300'
                          }`}
                        >
                          {entry.text}
                        </pre>
                      ))}

                      {/* Interactive prompt block */}
                      {awaitingInput && (
                        <div className="flex items-center gap-2 mt-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800/40">
                          {inputPrompt && (
                            <span className="text-slate-400 font-bold">{inputPrompt}</span>
                          )}
                          <input
                            ref={inputRef}
                            type="text"
                            value={inputBuffer}
                            onChange={(e) => setInputBuffer(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleInputSubmit();
                            }}
                            className="flex-1 bg-transparent border-0 outline-none text-white placeholder-slate-600 font-bold"
                            placeholder="Type input value..."
                          />
                          <button
                            onClick={handleInputSubmit}
                            className="bg-blue-600 hover:bg-blue-500 text-white rounded p-1"
                          >
                            <Send size={10} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'preview' && selected && (
                  <div className="h-full font-sans">
                    <VisualPreview
                      output={outputString}
                      projectId={selected.id}
                      visible={true}
                    />
                  </div>
                )}

                {activeTab === 'tests' && selected && (
                  <div className="h-full font-sans space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Checks Status</h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {staticCheckResults.map(c => (
                          <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-850">
                            {c.passed ? (
                              <CheckCircle size={16} className="text-emerald-400" />
                            ) : (
                              <ShieldAlert size={16} className="text-slate-600" />
                            )}
                            <div className="text-xs">
                              <p className="font-bold text-slate-300">{c.label}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">{c.passed ? 'Matched validation rules' : 'Syntactical check pending'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Verification Suites</h4>
                      <div className="space-y-3">
                        {dynamicTestResults.map((tc, idx) => (
                          <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-slate-900 border border-slate-850">
                            <div className="mt-1">
                              {tc.passed === true ? (
                                <CheckCircle size={20} className="text-emerald-400" />
                              ) : tc.passed === false ? (
                                <XCircle size={20} className="text-red-400" />
                              ) : (
                                <div className="w-5 h-5 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center">
                                  <span className="text-[10px] text-slate-500 font-bold">{idx + 1}</span>
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-200">{tc.name}</p>
                              <p className="text-xs text-slate-400 leading-normal mt-1">{tc.description}</p>
                              {tc.error && (
                                <pre className="mt-2 p-2 bg-red-950/20 border border-red-900/30 text-red-300 rounded text-[10px] overflow-x-auto">
                                  {tc.error}
                                </pre>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {submitted && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="text-emerald-400" size={20} />
                          <div>
                            <p className="text-sm font-bold text-white">All Validations Passed!</p>
                            <p className="text-xs text-slate-400 mt-0.5">Your capstone solution meets all structural and execution checks.</p>
                          </div>
                        </div>
                        <button
                          onClick={goNext}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-lg flex items-center gap-1.5"
                        >
                          View Rewards
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 4: Submit/Certificate Summary ── */}
      {step === 'Submit' && (
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center p-6 animate-fade-in">
          <div className="max-w-4xl w-full space-y-8 py-10">
            {showCertificate ? (
              <div className="space-y-6">
                {/* Certificate Widget */}
                <div className="bg-[#1e2330] rounded-2xl border-2 border-amber-500/40 p-8 shadow-[0_15px_40px_rgba(245,158,11,0.1)] relative overflow-hidden">
                  {/* Classic certificate borders */}
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />
                  <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />
                  <div className="absolute top-0 left-0 h-full w-2 bg-gradient-to-b from-amber-600 via-yellow-400 to-amber-600" />
                  <div className="absolute top-0 right-0 h-full w-2 bg-gradient-to-b from-amber-600 via-yellow-400 to-amber-600" />

                  <div className="text-center space-y-6 py-6 font-serif">
                    <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-amber-500">Certificate of Completion</span>
                    <p className="text-[11px] font-sans text-slate-400">This certifies that <span className="font-bold text-white">{user?.name || 'Student'}</span> has successfully mastered all curriculum requirements for</p>
                    <h3 className="text-2xl font-black font-sans text-white uppercase tracking-wider">
                      {slug && slug === 'cs50ai' ? 'CS50 AI with Python' : 'CS50P: Introduction to Python Programming'}
                    </h3>
                    
                    <div className="w-16 h-px bg-amber-500/30 mx-auto" />
                    
                    <p className="text-xs text-slate-400 italic">Issued on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                    <div className="flex justify-around items-center pt-8 font-sans">
                      <div className="text-center">
                        <div className="w-14 h-14 rounded-full bg-slate-900 border border-amber-500/20 flex flex-col items-center justify-center mx-auto text-amber-400 font-bold text-[9px] leading-tight shadow-lg">
                          <span className="text-xs mb-0.5">✓</span>
                          <span>VERIFIED</span>
                        </div>
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider mt-2 block">Curriculum Verified</span>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-semibold text-slate-200 border-b border-slate-700/60 pb-1 px-4 italic">Course Assessment System</p>
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider mt-1 block">Verified Completion</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                  <button
                    onClick={() => setShowCertificate(false)}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-500/15 cursor-pointer"
                  >
                    Back to Results
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Congratulations / Passed Banner */}
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 relative">
                    <Check className="text-emerald-400 stroke-[3]" size={32} />
                  </div>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight">Project Passed!</h2>
                  <p className="text-sm text-slate-400 max-w-md mx-auto">
                    Congratulations! You have successfully completed the project.
                  </p>
                </div>

                {/* 3 Grid Columns */}
                <div className="grid gap-6 md:grid-cols-3">
                  {/* Card 1: Validation Results */}
                  <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col hover:border-slate-700 transition-all duration-300 shadow-lg">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                      Validation Results
                    </h3>
                    <div className="space-y-3.5 flex-1">
                      {(selected ? (TEST_SUITES[selected.id] || []) : []).map((tc, index) => (
                        <div key={index} className="flex items-start gap-2.5 text-slate-300 text-xs">
                          <Check className="text-emerald-400 stroke-[3] mt-0.5 flex-shrink-0" size={14} />
                          <span>{tc.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card 2: Project Summary */}
                  <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col hover:border-slate-700 transition-all duration-300 shadow-lg">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                      Project Summary
                    </h3>
                    <div className="space-y-3.5 flex-1">
                      {[
                        "All requirements completed",
                        "All tests passed",
                        "Code quality: Good",
                        "Execution successful"
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-2.5 text-slate-300 text-xs">
                          <Check className="text-emerald-400 stroke-[3] mt-0.5 flex-shrink-0" size={14} />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card 3: Your Reward */}
                  <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all duration-300 shadow-lg">
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                        Your Reward
                      </h3>
                      <div className="text-center py-4">
                        <Trophy size={40} className="text-amber-500 mx-auto mb-2 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse" />
                        <span className="text-3xl font-black text-amber-400 tracking-tight">+500 XP</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 border-t border-slate-800/60 pt-4 mt-2">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <Award size={14} className="text-blue-400" />
                        <span>Certificate Unlocked</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <CheckCircle size={14} className="text-emerald-400" />
                        <span>Course Progress Updated</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action buttons */}
                <div className="flex flex-col items-center gap-3 pt-4">
                  <button
                    onClick={() => setShowCertificate(true)}
                    className="px-8 py-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-500/20 w-48 text-center cursor-pointer"
                  >
                    View Summary
                  </button>
                  <button
                    onClick={() => navigate(`/course/${slug}`)}
                    className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-all cursor-pointer"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
