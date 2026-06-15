import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { saveCompletedProject } from '../api';
import { markProjectCompletedDirect } from '../hooks/useProgress';
import { runPythonMock, type DebugStep } from '../interpreter';
import { getProjectDefaultInput, getProjectChecklist, runChecklist, getProjectDefinition } from '../projects/registry';
import SimulationModal from '../simulation/SimulationModal';
import { hasSimulation } from '../simulation/registry';
import SceneRenderer from '../simulation/SceneRenderer';

interface FormField { label: string; key: string; defaultValue: string; }

const projectFormFields: Record<string, FormField[]> = {
  story_generator: [
    { label: 'Name', key: 'name', defaultValue: 'Maya' },
    { label: 'Age', key: 'age', defaultValue: '22' },
    { label: 'Color', key: 'color', defaultValue: 'Blue' },
    { label: 'Hobby', key: 'hobby', defaultValue: 'Painting' },
  ],
};

function formatDefaultInput(input: string): { label: string; value: string }[] {
  const parts = input.split('\n').filter(Boolean);
  const labels = ['Name', 'Age', 'Color', 'Hobby'];
  return parts.map((v, i) => ({ label: labels[i] || `Input ${i + 1}`, value: v }));
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

  const [showCompleted, setShowCompleted] = useState(false);
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

  const exampleInputs = projectDef ? formatDefaultInput(projectDef.defaultInput) : [];

  useEffect(() => {
    if (projectId) setChecklist(getProjectChecklist(projectId));
  }, [projectId]);

  useEffect(() => {
    const fields = (projectId && projectFormFields[projectId]) || [];
    const initial: Record<string, string> = {};
    for (const f of fields) initial[f.key] = f.defaultValue;
    setFormValues(initial);
  }, [projectId]);

  // Auto-save draft
  useEffect(() => {
    if (!code) return;
    const t = setTimeout(() => {
      localStorage.setItem(`draft_${projectId}`, code);
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
    }, 1500);
    return () => clearTimeout(t);
  }, [code, projectId]);

  // Load saved draft
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
    if (!projectId || !code.trim()) return null;
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
      setShowCompleted(true);
      saveCompletedProject(slug, projectId, true);
      const num = Number(number);
      if (!isNaN(num)) markProjectCompletedDirect(slug, num, projectId);
      setRunStatus('submitted');
    }
  }, [runCode, isSim, slug, projectId, number]);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    if (!autoClose) {
      setShowCompleted(true);
      setRunStatus('submitted');
      if (slug && projectId) {
        saveCompletedProject(slug, projectId, true);
        const num = Number(number);
        if (!isNaN(num)) markProjectCompletedDirect(slug, num, projectId);
      }
    }
  }, [autoClose, slug, projectId, number]);

  const fields = (projectId && projectFormFields[projectId]) || [];

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

            {/* SECTION 1: What Are We Building? */}
            <section>
              <h2 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">What Are We Building?</h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">{projectDef?.description}</p>
              <p className="text-[11px] text-slate-500 font-medium mb-2">By completing this project you will learn:</p>
              <ul className="space-y-1 mb-3">
                {projectDef?.concepts.map(c => (
                  <li key={c} className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-emerald-400">✓</span>
                    <span className="text-slate-300">{c}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-3">
                <span className="text-[10px] px-2 py-0.5 bg-sky-500/10 text-sky-300 rounded font-semibold">{projectDef?.difficulty}</span>
                <span className="text-[10px] text-amber-400 font-semibold">+{projectDef?.xp} XP</span>
                <span className="text-[10px] text-slate-500">{projectDef?.estimatedTime}</span>
              </div>
            </section>

            {/* SECTION 2: What Should The Result Look Like? */}
            {exampleInputs.length > 0 && (
              <section>
                <h2 className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-2">What Should The Result Look Like?</h2>
                <div className="bg-[#090d12] rounded-lg border border-slate-800/60 p-3 mb-2">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase mb-2">Example Input</p>
                  <div className="space-y-1">
                    {exampleInputs.map(({ label, value }) => (
                      <div key={label} className="flex items-center gap-2 text-[11px]">
                        <span className="text-slate-500 w-12">{label}:</span>
                        <span className="text-slate-200 font-mono">{value}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase mt-3 mb-1">Expected Result</p>
                  <p className="text-[11px] text-slate-400">A personalized story appears.</p>
                </div>
                {isSim && (
                  <div className="rounded-lg overflow-hidden border border-slate-800/40 pointer-events-none" style={{ height: 140 }}>
                    <SceneRenderer projectId={projectId ?? ''} />
                  </div>
                )}
              </section>
            )}

            {/* SECTION 3: Checklist */}
            <section>
              <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Checklist</h2>
              {totalCount > 0 && (
                <p className="text-[11px] text-slate-500 mb-2">{checkedCount} / {totalCount} Complete</p>
              )}
              <ul className="space-y-1.5">
                {checklist.map(item => (
                  <li key={item.id} className="flex items-center gap-2 text-xs">
                    <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                      checklistResults[item.id] ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'border-slate-600/50 text-transparent'
                    }`}>
                      {checklistResults[item.id] && (
                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <span className={checklistResults[item.id] ? 'text-slate-300' : 'text-slate-500'}>{item.label}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* SECTION 4: Try Your Story */}
            {fields.length > 0 && (
              <section>
                <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Try Your Story</h2>
                <p className="text-[10px] text-slate-500 mb-2">Change values to experiment without editing code.</p>
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

          </div>
        </div>

        {/* ── RIGHT PANEL (70%) ── */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#090d12]">

          {/* File Explorer */}
          <div className="border-b border-slate-800/40 bg-[#0a0e13]">
            <div className="flex items-center gap-4 px-5 py-1.5">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">📁 Project Files</span>
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
          autoClose={autoClose}
        />
      )}

      {/* Completion Overlay */}
      {showCompleted && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 p-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-sky-500/20 border border-emerald-500/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xl font-bold text-slate-100">Project Complete!</p>
            <p className="text-sm text-slate-400">Great work on this project.</p>
            {projectDef && <p className="text-sm text-amber-400 font-semibold">+{projectDef.xp} XP</p>}
            <a
              href={`/course/${slug}/lecture/${number}/project`}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all"
            >
              Back to Projects
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
