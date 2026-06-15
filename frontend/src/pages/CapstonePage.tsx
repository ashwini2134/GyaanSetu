import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, ChevronRight, FileText, Play, Send, Terminal, XCircle } from 'lucide-react';
import MonacoEditor from '@monaco-editor/react';
import { runInteractive, type ExecEvent, type ExecResult } from '../utils/pythonRunnerInteractive';

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
};

const PROJECTS: CapstoneProject[] = [
  {
    id: 'student_management',
    title: 'Student Management System',
    description: 'Build a system to manage student records.',
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
  },
  {
    id: 'expense_tracker',
    title: 'Expense Tracker',
    description: 'Log expenses, view totals, and filter by category.',
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
  },
  {
    id: 'quiz_app',
    title: 'Quiz Application',
    description: 'Create interactive quizzes with scoring and feedback.',
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
  },
  {
    id: 'todo_list',
    title: 'To-Do List',
    description: 'Manage tasks with file-based persistence.',
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
  },
];

const SKILLS_MASTERED = [
  'Variables', 'Input / Output', 'Conditions', 'Loops',
  'Functions', 'Lists', 'Dictionaries', 'Strings', 'File Handling',
];

const REQUIRED_CONCEPTS = [
  { id: 'variables', label: 'Variables' },
  { id: 'input_output', label: 'Input / Output' },
  { id: 'conditions', label: 'Conditions' },
  { id: 'loops', label: 'Loops' },
  { id: 'functions', label: 'Functions' },
  { id: 'lists', label: 'Lists' },
  { id: 'dictionaries', label: 'Dictionaries' },
  { id: 'file_handling', label: 'File Handling' },
];

const STEPS = ['Choose Project', 'Requirements', 'Workspace', 'Submit'] as const;

type Step = typeof STEPS[number];

function validateCapstone(code: string): { passed: boolean; checks: { id: string; label: string; passed: boolean }[] } {
  const cleanCode = code.split('\n').map(line => line.replace(/#.*$/, '')).join('\n');
  const n = cleanCode.toLowerCase().replace(/\s/g, '');

  const checks = [
    { id: 'variables', label: 'Variables', passed: /\b\w+\s*=/.test(cleanCode) },
    { id: 'input_output', label: 'Input / Output', passed: n.includes('input(') && n.includes('print(') },
    { id: 'conditions', label: 'Conditions', passed: /\bif\b/.test(cleanCode) },
    { id: 'loops', label: 'Loops', passed: /\bwhile\b|\bfor\b/.test(cleanCode) },
    { id: 'functions', label: 'Functions', passed: (cleanCode.match(/\bdef\b/g) || []).length >= 2 },
    { id: 'lists', label: 'Lists', passed: /\[.*\]/.test(cleanCode) },
    { id: 'dictionaries', label: 'Dictionaries', passed: n.includes('{}') || n.includes('dict(') || /\{[^}]+\}/.test(cleanCode) },
    { id: 'file_handling', label: 'File Handling', passed: n.includes('open(') },
  ];

  return { passed: checks.every(c => c.passed), checks };
}

export default function CapstonePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('Choose Project');
  const [selected, setSelected] = useState<CapstoneProject | null>(null);
  const [code, setCode] = useState('# Write your Python project here\n');
  const [consoleEntries, setConsoleEntries] = useState<{ type: 'stdout' | 'stderr' | 'stdin-prompt' | 'stdin-value'; text: string }[]>([]);
  const [awaitingInput, setAwaitingInput] = useState(false);
  const [inputPrompt, setInputPrompt] = useState('');
  const [inputBuffer, setInputBuffer] = useState('');
  const [running, setRunning] = useState(false);
  const [validation, setValidation] = useState<{ passed: boolean; checks: { id: string; label: string; passed: boolean }[] } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [splitRatio, setSplitRatio] = useState(70);
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
        stepGenerator(); // Continue synchronously until input or done
      } else if (value.type === 'input') {
        setInputPrompt(value.prompt);
        setAwaitingInput(true);
        // Generator is now paused; handleInputSubmit will resume it
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
    setValidation(null);
    setAwaitingInput(false);
    setInputPrompt('');
    setRunning(true);

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
    if (!awaitingInput || !inputBuffer.trim()) return;
    const val = inputBuffer;
    setInputBuffer('');
    setAwaitingInput(false);
    addEntry({ type: 'stdin-value', text: val + '\n' });
    stepGenerator(val);
  }

  const stepIdx = STEPS.indexOf(step);

  const canAdvance = useMemo(() => {
    switch (step) {
      case 'Choose Project': return selected !== null;
      case 'Requirements': return true;
      case 'Workspace': return submitted;
      case 'Submit': return false;
    }
  }, [step, selected, submitted]);

  function goNext() {
    const i = STEPS.indexOf(step);
    if (i < STEPS.length - 1) setStep(STEPS[i + 1]);
  }

  function goPrev() {
    const i = STEPS.indexOf(step);
    if (i > 0) setStep(STEPS[i - 1]);
  }

  function handleSubmit() {
    const result = validateCapstone(code);
    setValidation(result);
    if (result.passed) setSubmitted(true);
  }

  function canNavigate(s: Step) {
    return STEPS.indexOf(s) <= stepIdx;
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
    setSplitRatio(Math.max(30, Math.min(85, pct)));
  }

  function handleDividerMouseUp() {
    dragging.current = false;
    document.removeEventListener('mousemove', handleDividerMouseMove);
    document.removeEventListener('mouseup', handleDividerMouseUp);
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">

      {/* ── Top bar ── */}
      <header className="border-b border-slate-800 bg-slate-900/80 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(`/course/${slug}`)}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors whitespace-nowrap flex-shrink-0"
          >
            &larr; Back to Course
          </button>

          <div className="flex items-center gap-0.5">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center">
                <button
                  onClick={() => canNavigate(s) && setStep(s)}
                  className={`text-[11px] font-medium px-2.5 py-1.5 rounded transition-all ${
                    i === stepIdx
                      ? 'bg-blue-600/20 text-blue-300'
                      : i < stepIdx
                      ? 'text-emerald-400'
                      : 'text-slate-600 cursor-default'
                  }`}
                >
                  {i < stepIdx && <CheckCircle size={12} className="inline mr-1" />}
                  {s}
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`w-5 h-px mx-0.5 ${i < stepIdx ? 'bg-emerald-500/40' : 'bg-slate-700'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="w-[88px]" />
        </div>
      </header>

      {/* ── Step 1: Choose Project ── */}
      {step === 'Choose Project' && (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-10">

            {/* Hero */}
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-white mb-3">FINAL PYTHON CAPSTONE</h1>
              <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                You have completed all lectures.<br />
                Now build a complete application using everything you learned.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {SKILLS_MASTERED.map(s => (
                  <span key={s} className="flex items-center gap-1 text-xs text-slate-300 bg-slate-800/60 border border-slate-700/30 px-3 py-1.5 rounded-lg">
                    <CheckCircle size={12} className="text-emerald-400" />
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Project cards */}
            <div className="grid gap-5 sm:grid-cols-2">
              {PROJECTS.map(p => {
                const isSelected = selected?.id === p.id;
                return (
                  <div
                    key={p.id}
                    className={`rounded-xl border p-6 transition-all duration-200 ${
                      isSelected
                        ? 'border-blue-500/50 bg-blue-600/10 shadow-md shadow-blue-600/10'
                        : 'border-slate-700/30 bg-slate-800/30'
                    }`}
                  >
                    <h3 className="text-base font-bold text-white mb-2">{p.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">{p.description}</p>
                    <div className="space-y-2.5 mb-5">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Skills</span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {p.skills.map(s => (
                            <span key={s} className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-700/40 text-slate-400">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] text-slate-500">
                        <span>
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500/60 mr-1.5" />
                          {p.difficulty}
                        </span>
                        <span>
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500/60 mr-1.5" />
                          {p.estimatedTime}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelected(p)}
                      className={`w-full text-xs font-semibold py-2.5 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-500'
                          : 'bg-transparent text-slate-300 border-slate-600/50 hover:border-blue-500/50 hover:text-blue-300'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Select Project'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end mt-10 pt-6 border-t border-slate-700/20">
              <button
                onClick={goNext}
                disabled={!selected}
                className={`inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all ${
                  selected ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                View Requirements
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Requirements ── */}
      {step === 'Requirements' && (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-10">

            <div className="mb-8">
              <h2 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Project Goal</h2>
              <p className="text-sm text-slate-200 leading-relaxed">{selected?.goal}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="rounded-xl border border-slate-700/30 bg-slate-800/40 p-5">
                <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Required Features</h3>
                <div className="space-y-2.5">
                  {selected?.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-300">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-700/30 bg-slate-800/40 p-5">
                <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Sample User Flow</h3>
                <div className="space-y-2.5">
                  {selected?.sampleFlow.map((s, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="text-[10px] font-bold text-blue-400 mt-0.5 w-4 flex-shrink-0">{i + 1}.</span>
                      <span className="text-sm text-slate-400">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Required Concepts</h3>
              <div className="flex flex-wrap gap-2">
                {REQUIRED_CONCEPTS.map(c => (
                  <span key={c.id} className="text-xs text-slate-300 bg-slate-800/60 border border-slate-700/30 px-3 py-1.5 rounded-lg">
                    {c.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-700/20">
              <button onClick={goPrev} className="text-sm text-slate-400 hover:text-slate-200 transition-all px-4 py-2">
                &larr; Choose Project
              </button>
              <div className="text-xs text-slate-500">Step 2 of 4</div>
              <button
                onClick={goNext}
                className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all"
              >
                Open Workspace
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3: Workspace (split panel) ── */}
      {step === 'Workspace' && (
        <div className="flex-1 flex overflow-hidden">

          {/* Left panel — project info */}
          <aside className="w-[380px] flex-shrink-0 border-r border-slate-800 overflow-y-auto bg-slate-900/50">
            <div className="p-5 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">{selected?.title}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">{selected?.goal}</p>
              </div>

              <div>
                <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Required Concepts</h4>
                <div className="flex flex-wrap gap-1.5">
                  {REQUIRED_CONCEPTS.map(c => (
                    <span key={c.id} className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-700/40 text-slate-400 border border-slate-700/20">{c.label}</span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Sample Flow</h4>
                <div className="space-y-1.5">
                  {selected?.sampleFlow.map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[10px] font-bold text-blue-400 mt-0.5 w-3 flex-shrink-0">{i + 1}.</span>
                      <span className="text-[11px] text-slate-400 leading-relaxed">{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Expected Features</h4>
                <div className="space-y-1.5">
                  {selected?.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 text-[10px] mt-0.5 flex-shrink-0">&bull;</span>
                      <span className="text-[11px] text-slate-400">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {validation && (
                <div>
                  <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Evaluation Criteria</h4>
                  <div className="space-y-1.5">
                    {validation.checks.map(c => (
                      <div key={c.id} className="flex items-center gap-2">
                        {c.passed ? (
                          <CheckCircle size={12} className="text-emerald-400 flex-shrink-0" />
                        ) : (
                          <XCircle size={12} className="text-red-400 flex-shrink-0" />
                        )}
                        <span className={`text-[11px] ${c.passed ? 'text-emerald-400' : 'text-red-300'}`}>
                          {c.label}: {c.passed ? 'Found' : 'Missing'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 text-[10px] text-slate-500 pb-2">
                <span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500/60 mr-1" />
                  {selected?.difficulty}
                </span>
                <span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500/60 mr-1" />
                  {selected?.estimatedTime}
                </span>
              </div>
            </div>
          </aside>

          {/* Right panel — editor + output */}
          <div ref={containerRef} className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Editor toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-slate-500" />
                <span className="text-xs font-medium text-slate-400">main.py</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRun}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 hover:bg-emerald-600/30 transition-all"
                >
                  <Play size={12} />
                  Run
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitted}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-lg transition-all ${
                    submitted ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  Submit Solution
                </button>
              </div>
            </div>

            {/* Editor area */}
            <div className="flex-shrink-0 overflow-hidden" style={{ height: `${splitRatio}%` }}>
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

            {/* Draggable divider */}
            <div
              ref={dividerRef}
              onMouseDown={handleDividerMouseDown}
              className="flex-shrink-0 h-1 bg-slate-800 hover:bg-blue-500/40 cursor-row-resize transition-colors relative z-10"
            />

            {/* Console */}
            <div ref={consoleRef} className="flex-1 min-h-[100px] border-t border-slate-800 bg-slate-950 overflow-y-auto font-mono">
              {/* Terminal header */}
              <div className="sticky top-0 flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 flex-shrink-0">
                <Terminal size={12} className="text-slate-500" />
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Console</span>
                {running && (
                  <span className="ml-auto text-[10px] text-emerald-500/70 animate-pulse">Running...</span>
                )}
              </div>

              {/* Console entries */}
              <div className="p-3 space-y-0.5">
                {consoleEntries.length === 0 && !running && !validation && (
                  <div className="text-[11px] text-slate-600">Click Run to execute your code, or Submit Solution to validate.</div>
                )}
                {consoleEntries.map((entry, i) => {
                  if (entry.type === 'stdout') {
                    return (
                      <pre key={i} className="text-xs text-slate-300 whitespace-pre-wrap">{entry.text}</pre>
                    );
                  }
                  if (entry.type === 'stderr') {
                    return (
                      <pre key={i} className="text-xs text-red-300 whitespace-pre-wrap">{entry.text}</pre>
                    );
                  }
                  if (entry.type === 'stdin-prompt') {
                    return (
                      <span key={i} className="text-xs text-slate-400">{entry.text}</span>
                    );
                  }
                  if (entry.type === 'stdin-value') {
                    return (
                      <pre key={i} className="text-xs text-emerald-400 whitespace-pre-wrap">{entry.text}</pre>
                    );
                  }
                  return null;
                })}

                {/* Active input prompt and field */}
                {awaitingInput && (
                  <div className="flex items-center gap-2 mt-1">
                    {inputPrompt && (
                      <span className="text-xs text-slate-400 flex-shrink-0">{inputPrompt}</span>
                    )}
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputBuffer}
                      onChange={(e) => setInputBuffer(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleInputSubmit();
                      }}
                      className="flex-1 bg-transparent border-0 outline-none text-xs text-white font-mono placeholder-slate-600"
                      placeholder={inputPrompt ? '' : 'Type your input...'}
                    />
                    <button
                      onClick={handleInputSubmit}
                      className="flex-shrink-0 text-xs text-blue-400 hover:text-blue-300 transition-colors p-1"
                    >
                      <Send size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Validation results (appended after console if submitted) */}
              {validation && (
                <div className="border-t border-slate-800 p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    {validation.passed ? (
                      <CheckCircle size={12} className="text-emerald-400" />
                    ) : (
                      <XCircle size={12} className="text-red-400" />
                    )}
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      {validation.passed ? 'All Requirements Met' : 'Requirements Check'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    {validation.checks.map(c => (
                      <div key={c.id} className="flex items-center gap-1.5">
                        {c.passed ? (
                          <CheckCircle size={10} className="text-emerald-400 flex-shrink-0" />
                        ) : (
                          <XCircle size={10} className="text-red-400 flex-shrink-0" />
                        )}
                        <span className={`text-[11px] ${c.passed ? 'text-slate-400' : 'text-red-300'}`}>{c.label}</span>
                      </div>
                    ))}
                  </div>
                  {validation.passed && (
                    <div className="mt-3 pt-3 border-t border-slate-700/30 flex justify-end">
                      <button
                        onClick={goNext}
                        className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all"
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
      )}

      {/* ── Step 4: Submit ── */}
      {step === 'Submit' && (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-lg mx-auto px-4 py-16">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={32} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Project Complete</h2>
              <p className="text-sm text-slate-400">All requirements met. Your code has been validated.</p>
            </div>

            {/* Validation summary */}
            <div className="rounded-xl border border-slate-700/30 bg-slate-800/40 p-5 mb-6">
              <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Validation</h3>
              <div className="grid grid-cols-2 gap-2">
                {validation?.checks.map(c => (
                  <div key={c.id} className="flex items-center gap-2 text-sm">
                    {c.passed ? (
                      <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                    ) : (
                      <XCircle size={14} className="text-red-400 flex-shrink-0" />
                    )}
                    <span className={c.passed ? 'text-slate-300' : 'text-red-300'}>{c.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rewards */}
            <div className="rounded-xl border border-amber-500/20 bg-slate-800/40 p-5 mb-8">
              <h3 className="text-sm font-semibold text-white mb-4">Capstone Completion Rewards</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-slate-800/80 border border-slate-700/20">
                  <span className="text-sm text-slate-300">Experience Points</span>
                  <span className="text-sm font-bold text-amber-400">+500 XP</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-slate-800/80 border border-slate-700/20">
                  <span className="text-sm text-slate-300">Course Completion Badge</span>
                  <span className="text-xs font-semibold text-emerald-400">Unlocked</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-slate-800/80 border border-slate-700/20">
                  <span className="text-sm text-slate-300">Certificate</span>
                  <span className="text-xs font-semibold text-emerald-400">Unlocked</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => navigate(`/course/${slug}`)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white border border-slate-600/50 hover:bg-slate-700/50 transition-all"
              >
                Back to Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
