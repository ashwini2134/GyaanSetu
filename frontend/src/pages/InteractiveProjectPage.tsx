import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { saveCompletedProject } from '../api';
import { markProjectCompletedDirect } from '../hooks/useProgress';
import { runPythonMock, type DebugStep } from '../interpreter';
import { getProjectDefaultInput, getProjectChecklist, runChecklist, getProjectDefinition } from '../projects/registry';
import SimulationModal from '../simulation/SimulationModal';
import { hasSimulation } from '../simulation/registry';

interface FormField { label: string; key: string; defaultValue: string; }

const projectFormFields: Record<string, FormField[]> = {
  story_generator: [
    { label: 'Name', key: 'name', defaultValue: 'Maya' },
    { label: 'Age', key: 'age', defaultValue: '22' },
    { label: 'Color', key: 'color', defaultValue: 'Blue' },
    { label: 'Hobby', key: 'hobby', defaultValue: 'Painting' },
  ],
};

const conceptExplanations: Record<string, string> = {
  'input()': 'Used to collect information from the user.',
  'variables': 'Used to store information for later use.',
  'print()': 'Used to display information.',
  'f-strings': 'Used to combine variables and text.',
  'if/elif/else': 'Used to make decisions based on conditions.',
  'comparison operators': 'Used to compare values in conditions.',
  'random.choice()': 'Used to pick a random option from a list.',
  'for loops': 'Used to repeat code a specific number of times.',
  'range()': 'Used to generate a sequence of numbers.',
  'nested loops': 'Used to create loops inside other loops.',
  'formatted output': 'Used to control how data is displayed.',
  'while loops': 'Used to repeat code until a condition changes.',
  'break': 'Used to exit a loop early.',
  'random.randint()': 'Used to generate a random integer.',
  'input validation': 'Used to check user input is correct.',
  'lists': 'Used to store multiple items in one variable.',
  'list methods': 'Used to manipulate lists.',
  'menu-driven programs': 'Used to create interactive menus.',
  'loops': 'Used to repeat actions in your code.',
  'dictionaries': 'Used to store key-value pairs.',
  'key-value pairs': 'Used to associate related data.',
  'dict methods': 'Used to work with dictionaries.',
  'search': 'Used to find specific data.',
  'function definitions': 'Used to create reusable blocks of code.',
  'parameters': 'Used to pass data into functions.',
  'return values': 'Used to send data back from functions.',
  'modular design': 'Used to organize code into separate parts.',
  'string methods': 'Used to manipulate text.',
  'character iteration': 'Used to process each character in text.',
  'frequency analysis': 'Used to count how often things appear.',
  'slicing': 'Used to extract parts of strings or lists.',
  'file reading/writing': 'Used to save and load data from files.',
  'append mode': 'Used to add data to the end of a file.',
  'persistence': 'Used to keep data between program runs.',
  'CRUD operations': 'Used to create, read, update, and delete data.',
  'data processing': 'Used to transform raw data into useful information.',
  'capstone': 'Used to combine everything you have learned.',
};

function thinkingQuestions(concepts: string[]): { question: string }[] {
  const qs: { question: string }[] = [];
  if (concepts.some(c => c.includes('input'))) {
    qs.push({ question: 'How will I collect information from the user?' });
  }
  if (concepts.some(c => c.includes('variable'))) {
    qs.push({ question: 'Where will I store the answers for later use?' });
  }
  if (concepts.some(c => c.includes('f-string') || c.includes('print'))) {
    qs.push({ question: 'How can I combine text and variables together?' });
  }
  if (concepts.some(c => c.includes('print'))) {
    qs.push({ question: 'How will I display the final result?' });
  }
  if (concepts.some(c => c.includes('loop') || c.includes('for') || c.includes('while'))) {
    qs.push({ question: 'Which parts of the program need to repeat?' });
  }
  if (concepts.some(c => c.includes('condition') || c.includes('if') || c.includes('comparison'))) {
    qs.push({ question: 'What decisions does my program need to make?' });
  }
  if (concepts.some(c => c.includes('list'))) {
    qs.push({ question: 'How should I organize the collection of items?' });
  }
  if (concepts.some(c => c.includes('dictionar'))) {
    qs.push({ question: 'How should I group related pieces of data?' });
  }
  if (concepts.some(c => c.includes('function') || c.includes('parameter'))) {
    qs.push({ question: 'How can I break this problem into smaller reusable pieces?' });
  }
  if (concepts.some(c => c.includes('file') || c.includes('persistence') || c.includes('CRUD'))) {
    qs.push({ question: 'How should I save data so it persists between runs?' });
  }
  if (qs.length === 0) {
    qs.push({ question: 'What steps does my program need to follow?' });
    qs.push({ question: 'How can I make sure each step works correctly?' });
  }
  return qs;
}

function missionDetails(projectId: string): string[] {
  const map: Record<string, string[]> = {
    story_generator: [
      'The user\'s name',
      'The user\'s age',
      'Their favorite color',
      'Their favorite hobby',
    ],
    rock_paper_scissors: [
      'The player\'s choice (rock, paper, or scissors)',
      'The computer\'s random choice',
      'The winner determined by the rules',
    ],
    multiplication_explorer: [
      'A number from the user',
      'Which multiplication table to generate',
      'How far the table should go',
    ],
    guessing_game_project: [
      'A random secret number',
      'The player\'s guesses',
      'Hints that guide the player',
    ],
    shopping_list: [
      'Items the user wants to add',
      'A way to view the current list',
      'Options to remove or mark items',
    ],
    contact_book: [
      'Contact names and details',
      'A way to search for contacts',
      'Options to add, edit, or remove',
    ],
    unit_converter: [
      'A value to convert',
      'The unit to convert from',
      'The unit to convert to',
    ],
    text_analyzer: [
      'A block of text from the user',
      'Character and word counts',
      'Letter frequency analysis',
    ],
    personal_diary: [
      'New diary entries from the user',
      'A way to view past entries',
      'Entries saved between sessions',
    ],
    grade_tracker: [
      'Student names and grades',
      'Calculated averages and stats',
      'Saved grade records',
    ],
  };
  return map[projectId] || ['Input from the user', 'Processing logic', 'Output displayed to the user'];
}

export default function InteractiveProjectPage() {
  const { slug, number, projectId } = useParams<{ slug: string; number: string; projectId: string }>();

  const [code, setCode] = useState('');
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [showModal, setShowModal] = useState(false);
  const [modalSteps, setModalSteps] = useState<DebugStep[] | undefined>(undefined);
  const [autoClose, setAutoClose] = useState(true);
  const [checklist, setChecklist] = useState<{ id: string; label: string }[]>([]);
  const [checklistResults, setChecklistResults] = useState<Record<string, boolean>>({});

  const [runStatus, setRunStatus] = useState<'idle' | 'running' | 'passed' | 'submitted'>('idle');
  const [draftSaved, setDraftSaved] = useState(false);

  const gutterRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const highlighterRef = useRef<HTMLDivElement>(null);

  const projectDef = projectId ? getProjectDefinition(projectId) : undefined;
  const isSim = hasSimulation(projectId ?? '');
  const lines = code.split('\n');
  const lineCount = lines.length;
  const checkedCount = Object.values(checklistResults).filter(Boolean).length;
  const totalCount = checklist.length;

  const concepts = projectDef?.concepts ?? [];
  const thinkingQs = thinkingQuestions(concepts);
  const details = projectId ? missionDetails(projectId) : [];

  useEffect(() => {
    if (projectId) setChecklist(getProjectChecklist(projectId));
  }, [projectId]);

  useEffect(() => {
    const fields = (projectId && projectFormFields[projectId]) || [];
    const initial: Record<string, string> = {};
    for (const f of fields) initial[f.key] = f.defaultValue;
    setFormValues(initial);
  }, [projectId]);

  useEffect(() => {
    if (!code) return;
    const t = setTimeout(() => {
      localStorage.setItem(`draft_${projectId}`, code);
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
    }, 1500);
    return () => clearTimeout(t);
  }, [code, projectId]);

  useEffect(() => {
    if (projectId) {
      const saved = localStorage.getItem(`draft_${projectId}`);
      if (saved) setCode(saved);
    }
  }, [projectId]);

  const handleScroll = useCallback(() => {
    if (gutterRef.current && editorRef.current) {
      gutterRef.current.scrollTop = editorRef.current.scrollTop;
    }
    if (highlighterRef.current && editorRef.current) {
      highlighterRef.current.scrollTop = editorRef.current.scrollTop;
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (e.shiftKey) {
        handleSubmit();
      } else {
        handleRun();
      }
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      setCode(prev => prev.substring(0, start) + '  ' + prev.substring(end));
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.selectionStart = editorRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  }, []);

  const runCode = useCallback(() => {
    if (!projectId) return null;
    if (!code.trim()) return [];
    const fields = projectFormFields[projectId] || [];
    const input = fields.length > 0
      ? fields.map(f => formValues[f.key] || f.defaultValue).join('\n')
      : getProjectDefaultInput(projectId);
    const steps = runPythonMock(code, input);
    setChecklistResults(runChecklist(code, projectId));
    return steps;
  }, [code, formValues, projectId]);

  const handleRun = useCallback(() => {
    setRunStatus('running');
    const steps = runCode();
    if (!steps) { setRunStatus('idle'); return; }
    if (isSim) {
      setModalSteps(steps);
      setAutoClose(true);
      setShowModal(true);
      setRunStatus('passed');
    } else {
      setRunStatus('passed');
      setTimeout(() => setRunStatus('idle'), 3000);
    }
  }, [runCode, isSim]);

  const handleSubmit = useCallback(() => {
    setRunStatus('running');
    const steps = runCode();
    if (!steps) { setRunStatus('idle'); return; }
    if (isSim) {
      setModalSteps(steps);
      setAutoClose(false);
      setShowModal(true);
    } else if (slug && projectId) {
      saveCompletedProject(slug, projectId, true);
      const num = Number(number);
      if (!isNaN(num)) markProjectCompletedDirect(slug, num, projectId);
      setRunStatus('submitted');
    }
  }, [runCode, isSim, slug, projectId, number]);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    if (!autoClose && slug && projectId) {
      setRunStatus('submitted');
      saveCompletedProject(slug, projectId, true);
      const num = Number(number);
      if (!isNaN(num)) markProjectCompletedDirect(slug, num, projectId);
    }
  }, [autoClose, slug, projectId, number]);

  const fields = (projectId && projectFormFields[projectId]) || [];

  const defaultFormValues = useMemo(() => {
    const initial: Record<string, string> = {};
    for (const f of fields) initial[f.key] = f.defaultValue;
    return initial;
  }, [fields]);

  const mode: 'example' | 'your-version' = useMemo(() => {
    const defaults = defaultFormValues;
    return Object.keys(defaults).every(key => formValues[key] === defaults[key])
      ? 'example'
      : 'your-version';
  }, [formValues, defaultFormValues]);

  return (
    <div className="h-full flex flex-col bg-[#0c1015] text-slate-200">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800/80 bg-[#0a0e13]">
        <div className="flex items-center gap-3">
          <a href={`/course/${slug}/lecture/${number}/project`} className="text-slate-500 hover:text-slate-300 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </a>
          <span className="text-sm font-semibold text-slate-200">{projectDef?.title || 'Project'}</span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* ── LEFT PANEL (30%) ── */}
        <div className="w-[30%] flex-shrink-0 border-r border-slate-800/80 overflow-y-auto bg-[#0a0e13]">
          <div className="p-5 space-y-6">

            {/* SECTION 1: Project Mission */}
            <section>
              <h2 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">Project Mission</h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">{projectDef?.description}</p>
              {details.length > 0 && (
                <>
                  <p className="text-[11px] text-slate-500 font-medium mb-2">The user will provide:</p>
                  <ul className="space-y-1 mb-3">
                    {details.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-[11px]">
                        <span className="text-sky-400 mt-0.5">•</span>
                        <span className="text-slate-300">{d}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {projectDef?.learningGoal && (
                <p className="text-[11px] text-slate-400 italic border-t border-slate-800/40 pt-3 mt-3">
                  Goal: {projectDef.learningGoal}
                </p>
              )}
              <div className="flex items-center gap-3 mt-3">
                <span className="text-[10px] px-2 py-0.5 bg-sky-500/10 text-sky-300 rounded font-semibold">{projectDef?.difficulty}</span>
                <span className="text-[10px] text-amber-400 font-semibold">+{projectDef?.xp} XP</span>
                <span className="text-[10px] text-slate-500">{projectDef?.estimatedTime}</span>
              </div>
            </section>

            {/* SECTION 2: Think Before You Code */}
            {thinkingQs.length > 0 && (
              <section>
                <h2 className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-2">Think Before You Code</h2>
                <p className="text-[10px] text-slate-500 mb-2">Before writing any code, ask yourself:</p>
                <ul className="space-y-2">
                  {thinkingQs.map((q, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px]">
                      <span className="text-violet-400 font-bold mt-0.5 flex-shrink-0">?</span>
                      <span className="text-slate-300">{q.question}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* SECTION 3: Concepts You Should Use */}
            {concepts.length > 0 && (
              <section>
                <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Concepts You Should Use</h2>
                <div className="space-y-2">
                  {concepts.map(c => {
                    const explanation = conceptExplanations[c] || 'Used to build a working solution.';
                    return (
                      <div key={c} className="flex items-start gap-2 bg-[#090d12] rounded-lg border border-slate-800/40 p-2.5">
                        <span className="text-emerald-400 text-xs font-bold font-mono flex-shrink-0 mt-0.5">{c}</span>
                        <span className="text-[10px] text-slate-400 leading-relaxed">{explanation}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* SECTION 4: Build Checklist */}
            {totalCount > 0 && (
              <section>
                <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Build Checklist</h2>
                <p className="text-[10px] text-slate-500 mb-2">Your project is complete when:</p>
                <div className="space-y-1.5">
                  {checklist.map(item => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
                        checklistResults[item.id]
                          ? 'bg-emerald-500/5 text-emerald-300'
                          : 'bg-slate-800/20 text-slate-400'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        checklistResults[item.id]
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                          : 'border-slate-600/60'
                      }`}>
                        {checklistResults[item.id] ? (
                          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : ''}
                      </span>
                      <span className={checklistResults[item.id] ? 'line-through text-emerald-400/70' : ''}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
                {checkedCount === totalCount && (
                  <div className="mt-3 pt-3 border-t border-emerald-500/20 text-center">
                    <p className="text-[11px] font-semibold text-emerald-400">All criteria met!</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">Click Submit Project to finish.</p>
                  </div>
                )}
              </section>
            )}

            {/* SECTION 5: Test Data */}
            {fields.length > 0 && (
              <section>
                <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Test Data</h2>
                <p className="text-[10px] text-slate-500 mb-2">
                  Change these values and run your project to see how your program behaves with different inputs.
                </p>
                <div className="space-y-2">
                  {fields.map(field => (
                    <div key={field.key} className="flex items-center gap-2">
                      <label className="text-[11px] text-slate-400 w-14 flex-shrink-0">{field.label}</label>
                      <input
                        type="text"
                        value={formValues[field.key] ?? field.defaultValue}
                        onChange={(e) => setFormValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                        className="flex-1 bg-[#090d12] border border-slate-800/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-slate-700 font-mono"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* SECTION 6: Project Experience */}
            <section>
              <h2 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Project Experience</h2>
              {showModal ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-[11px] text-blue-300">Playing your project</span>
                </div>
              ) : isSim ? (
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Run your project to see your story come to life. Use different test data to explore unique outcomes.
                </p>
              ) : (
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Run your project to see the output.
                </p>
              )}
            </section>

          </div>
        </div>

        {/* ── RIGHT PANEL (70%) ── */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#090d12]">

          {/* File Explorer */}
          <div className="border-b border-slate-800/40 bg-[#0a0e13]">
            <div className="flex items-center gap-4 px-5 py-1.5">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Project Files</span>
            </div>
            <div className="px-5 pb-1.5 flex items-center gap-2 text-xs text-slate-400">
              <svg className="w-3.5 h-3.5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              main.py
            </div>
          </div>

          {/* Editor Header */}
          <div className="flex items-center justify-between px-5 py-1.5 border-b border-slate-800/40 bg-[#0a0e13]">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-semibold text-sky-400">Python 3</span>
              {draftSaved && <span className="text-[10px] text-slate-500">Draft Saved</span>}
            </div>
            <div className="flex items-center gap-2">
              {runStatus === 'running' && (
                <span className="text-[10px] text-amber-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Running
                </span>
              )}
              {runStatus === 'passed' && (
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Passed
                </span>
              )}
              {runStatus === 'submitted' && (
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Submitted
                </span>
              )}
              {runStatus === 'idle' && (
                <span className="text-[10px] text-slate-500">Ready</span>
              )}
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 flex overflow-hidden min-h-0">
            <div
              ref={gutterRef}
              className="w-10 flex-shrink-0 bg-[#070b0f] border-r border-slate-800/80 text-slate-600 font-mono text-right pr-2 select-none overflow-hidden py-4 text-xs leading-6"
              style={{ height: '100%' }}
            >
              {Array.from({ length: Math.max(1, lineCount) }).map((_, i) => (
                <div key={i} style={{ height: '1.5rem', lineHeight: '1.5rem' }}>{i + 1}</div>
              ))}
            </div>
            <div className="relative flex-1 h-full overflow-hidden">
              <textarea
                ref={editorRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onScroll={handleScroll}
                onKeyDown={handleKeyDown}
                spellCheck="false"
                aria-label="Code Editor"
                className="absolute inset-0 w-full h-full resize-none bg-transparent py-4 pl-3 pr-6 font-mono text-xs leading-6 text-transparent caret-white outline-none z-10 whitespace-pre overflow-auto"
                style={{ WebkitTextFillColor: 'transparent' }}
              />
              <div
                ref={highlighterRef}
                className="absolute inset-0 w-full h-full py-4 pl-3 pr-6 overflow-hidden pointer-events-none"
              >
                <SyntaxHighlighter
                  language="python"
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0, padding: 0, background: 'transparent',
                    fontSize: '0.75rem',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    overflow: 'hidden', whiteSpace: 'pre', lineHeight: '1.5rem',
                  }}
                >
                  {code || ' '}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-center gap-4 px-5 py-3 border-t border-slate-800/60 bg-[#0a0e13]">
            <button
              onClick={handleRun}
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-900/20 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Run Project
              <span className="text-[10px] text-blue-300 font-normal ml-1">Ctrl+Enter</span>
            </button>
            <button
              onClick={handleSubmit}
              className="px-8 py-2.5 border border-slate-700 bg-slate-800 hover:bg-slate-700/80 rounded-xl text-sm font-semibold text-slate-200 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Submit Project
              <span className="text-[10px] text-slate-500 font-normal ml-1">Ctrl+Shift+Enter</span>
            </button>
          </div>

        </div>
      </div>

      {/* Simulation Modal */}
      {showModal && (
        <SimulationModal
          projectId={projectId ?? ''}
          steps={isSim ? modalSteps : undefined}
          onClose={handleModalClose}
          mode={mode}
        />
      )}
    </div>
  );
}
