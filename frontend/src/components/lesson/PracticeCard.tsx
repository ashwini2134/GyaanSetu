import { useState, useEffect, useCallback } from 'react';
import type { PracticeBlock } from '../../types/lesson';
import CodeEditor from './CodeEditor';
import { renderMarkdown } from '../../utils/renderContent';
import { authFetch } from '../../authClient';
import type { PracticeExerciseConfig } from '../../types/lesson';
import { Target, Lightbulb, HelpCircle, ListChecks, Wand2, SendHorizonal, CheckCircle } from 'lucide-react';
import { generateProgressiveHint } from '../../utils/logicValidation';
import { scanForInput } from '../../utils/prescanner';
import DragDropPracticeExercise from './DragDropPracticeExercise';
import ExpandUniverse from './ExpandUniverse';

interface PracticeCardProps {
  block: PracticeBlock;
  courseSlug: string;
  lectureNumber: number;
  sectionId: string;
  onAttempt?: () => void;
  onComplete?: () => void;
}

const SAVE_PREFIX = 'lms:practice:';

function AIPracticeCard({ block, courseSlug, lectureNumber, sectionId, onAttempt, onComplete }: PracticeCardProps) {
  const [config, setConfig] = useState<PracticeExerciseConfig | null>(null);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        const url = sectionId
          ? `/practice-exercises/config/${courseSlug}/${lectureNumber}?sectionId=${encodeURIComponent(sectionId)}`
          : `/practice-exercises/config/${courseSlug}/${lectureNumber}`;
        const data = await authFetch<{ exercise: PracticeExerciseConfig | null }>(url);
        setConfig(data.exercise);
      } catch {
        setConfig(null);
      }
    }
    loadConfig();
  }, [courseSlug, lectureNumber, sectionId]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setError(null);
    onAttempt?.();
    try {
      const data = await authFetch<{ generatedOutput: string }>('/practice-exercises/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: `${courseSlug}_${lectureNumber}`,
          prompt: prompt.trim(),
          exerciseType: 'ai-practice',
          exerciseTitle: block.title,
          exerciseDescription: block.instructions,
          systemInstruction: config
            ? config.systemInstruction
            : `Answer the student's question about ${block.title}. Be direct and concise - 2-4 sentences max. No paragraphs.`,
        }),
      });
      setResponse(data.generatedOutput);
    } catch {
      setError('AI generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleComplete = () => {
    setDone(true);
    onComplete?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };



  const isDragDrop = config?.type === 'drag_drop' && config?.dragDropConfig;
  const isHierarchyExpand = config?.type === 'hierarchy_expand' && config?.hierarchyExpandConfig;

  // All exercises show a "Start Practice" gate first (including drag-drop)
  if (!open) {
    return (
      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-600/10 to-slate-800/40 backdrop-blur-sm p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-600/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1">
              {isHierarchyExpand ? 'Interactive Discovery' : isDragDrop ? 'Drag & Drop Exercise' : 'Practice Exercise'}
            </p>
            <p className="text-sm font-medium text-slate-200 mb-1">{config?.title || block.title}</p>
            <button
              onClick={() => setOpen(true)}
              className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-white px-4 py-2 rounded-lg bg-amber-600/80 hover:bg-amber-600 transition-all"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              Start Practice
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Hierarchy expand exercises render inline
  if (config && isHierarchyExpand) {
    return (
      <ExpandUniverse
        config={config.hierarchyExpandConfig!}
        onComplete={() => { setOpen(false); onComplete?.(); }}
      />
    );
  }

  // Drag-drop exercises render inline
  if (config && isDragDrop) {
    return (
      <DragDropPracticeExercise
        config={config.dragDropConfig!}
        challenge={config.challenge}
        learningGoal={config.learningGoal}
        promptHint={config.promptHint}
        onComplete={() => { setOpen(false); onComplete?.(); }}
        onAttempt={onAttempt}
      />
    );
  }

  return (
    <div className={`rounded-2xl border backdrop-blur-sm overflow-hidden ${
      done ? 'border-green-500/30 bg-gradient-to-br from-green-600/10 to-slate-800/40' : 'border-amber-500/20 bg-gradient-to-br from-amber-600/10 to-slate-800/40'
    }`}>
      <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-700/20 flex items-center justify-between">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wider ${done ? 'text-green-300' : 'text-amber-300'}`}>
            Practice Exercise {done && '— Completed'}
          </p>
          <p className="text-sm font-medium text-slate-200 mt-0.5">{config?.title || block.title}</p>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-slate-500 hover:text-slate-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-5 space-y-5">
        {(
          <>
            {config && (
              <>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-600/10 to-slate-800/40 border border-blue-500/20">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Target size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider mb-1">What You'll Learn</p>
                    <p className="text-sm text-slate-200 leading-relaxed">{config.learningGoal}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-amber-600/10 to-slate-800/40 border border-amber-500/20">
                  <div className="w-8 h-8 rounded-lg bg-amber-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Lightbulb size={16} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-1">Your Challenge</p>
                    <p className="text-sm text-slate-200 leading-relaxed">{config.challenge}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-violet-600/10 to-slate-800/40 border border-violet-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <HelpCircle size={14} className="text-violet-400" />
                    <p className="text-[11px] font-semibold text-violet-400 uppercase tracking-wider">Prompt Hint</p>
                  </div>
                  <p className="text-sm text-violet-300/90 leading-relaxed">{config.promptHint}</p>
                </div>
              </>
            )}

            <div>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your question for the AI here..."
                rows={2}
                disabled={done}
                className="w-full bg-slate-900/60 border border-slate-700/40 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {!done && (
              <button
                onClick={handleGenerate}
                disabled={generating || !prompt.trim()}
                className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-600/20"
              >
                {generating ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
                ) : (
                  <><Wand2 size={16} /> Generate with AI</>
                )}
              </button>
            )}

            {response && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">AI Response</p>
                <div className="w-full bg-slate-900/60 border border-amber-500/20 rounded-xl px-4 py-3 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {response}
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-900/20 border border-red-700/30 text-sm text-red-300">{error}</div>
            )}

            {response && (
              <div className="space-y-4">
                {config && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-emerald-600/10 to-slate-800/40 border border-emerald-500/20">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ListChecks size={16} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1">Success Criteria</p>
                      <ul className="space-y-1">
                        {config.successCriteria.map((c, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-emerald-300/80">
                            <span className="mt-0.5">•</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {!done && (
                  <button
                    onClick={handleComplete}
                    className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-white px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 transition-all shadow-lg shadow-emerald-600/20"
                  >
                    <SendHorizonal size={16} /> Mark Complete
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function PracticeCard({ block, courseSlug, lectureNumber, sectionId, onAttempt, onComplete }: PracticeCardProps) {
  if (courseSlug === 'cs50ai') {
    return <AIPracticeCard block={block} courseSlug={courseSlug} lectureNumber={lectureNumber} sectionId={sectionId} onAttempt={onAttempt} onComplete={onComplete} />;
  }

  const saveKey = `${SAVE_PREFIX}${block.title}`;
  const [open, setOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [passed, setPassed] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [toast, setToast] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [lastCode, setLastCode] = useState('');

  const [submissionResult, setSubmissionResult] = useState<{ passed: boolean; expected: string; actual: string } | null>(null);

  const [savedCode, setSavedCode] = useState<string | null>(null);
  useEffect(() => {
    async function loadDraft() {
      try {
        const data = await authFetch<{ code?: string }>(`/drafts/${encodeURIComponent(block.title)}?type=practice`);
        if (data && data.code) setSavedCode(data.code);
      } catch (err) {
        console.error('Failed to load practice draft', err);
      }
    }
    loadDraft();
  }, [block.title]);

  const saveCode = useCallback((code: string) => {
    authFetch('/drafts', {
      method: 'POST',
      body: JSON.stringify({
        lectureId: block.title,
        type: 'practice',
        code
      })
    })
    .then(() => {
      localStorage.removeItem(saveKey);
    })
    .catch(err => console.error('Failed to save practice draft', err));
  }, [block.title, saveKey]);

  const handleRun = (code: string, _output: string, _error: string | null) => {
    onAttempt?.();
    setAttempts(a => a + 1);
    setShowHint(true);
    setHintLevel(a => Math.min(a + 1, 3));
    setLastCode(code);
    saveCode(code);
  };

  const handleSubmit = (_code: string, output: string, error: string | null, dynamicExpected?: string) => {
    onAttempt?.();
    setAttempts(a => a + 1);
    const expected = dynamicExpected ?? block.expectedOutput;
    let passed = false;
    if (!error && expected && output !== null) {
      passed = output.trim() === expected.trim();
      setSubmissionResult({ passed, expected, actual: output });
    }
    if (passed) {
      setPassed(true);
      onComplete?.();
    }
    saveCode(_code);
    setToast(true);
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(false), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleReset = () => {
    setSavedCode(null);
    saveCode('');
    try { localStorage.removeItem(saveKey); } catch {}
    setAttempts(0);
    setPassed(false);
    setShowHint(false);
    setSubmissionResult(null);
    setHintLevel(0);
    setShowSolution(false);
    setLastCode('');
  };

  if (!open) {
    return (
      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-600/10 to-slate-800/40 backdrop-blur-sm p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-600/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1">Practice Exercise</p>
            <p className="text-sm font-medium text-slate-200 mb-1">{block.title}</p>
            <p className="text-sm text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMarkdown(block.instructions) }} />
            <button
              onClick={() => setOpen(true)}
              className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-white px-4 py-2 rounded-lg bg-amber-600/80 hover:bg-amber-600 transition-all"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              Open Editor
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border backdrop-blur-sm overflow-hidden ${
      passed ? 'border-green-500/30 bg-gradient-to-br from-green-600/10 to-slate-800/40' : 'border-amber-500/20 bg-gradient-to-br from-amber-600/10 to-slate-800/40'
    }`}>
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800 border border-slate-600 shadow-xl">
            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-slate-200">✓ Submitted</span>
          </div>
        </div>
      )}

      <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-700/20 flex items-center justify-between">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wider ${passed ? 'text-green-300' : 'text-amber-300'}`}>
            Practice Exercise {passed && '— Completed'}
          </p>
          <p className="text-sm font-medium text-slate-200 mt-0.5">{block.title}</p>
        </div>
        <div className="flex items-center gap-2">
          {attempts > 0 && (
            <span className="text-[10px] text-slate-500">Attempts: {attempts}</span>
          )}
          <button
            onClick={() => setOpen(false)}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/30">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Instructions</p>
          <p className="text-sm text-slate-200 leading-relaxed" dangerouslySetInnerHTML={{ __html: renderMarkdown(block.instructions) }} />
        </div>

        {block.expectedOutput && !scanForInput(block.solution).hasInput && (
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/30">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Expected Output</p>
            <pre className="text-sm text-emerald-400 font-mono" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>{block.expectedOutput}</pre>
          </div>
        )}

        <CodeEditor
          initialCode={savedCode ?? block.starterCode}
          language="python"
          height="200px"
          showSaveButton
          showSubmitButton
          expectedOutput={block.expectedOutput}
          solution={block.solution}
          onRun={handleRun}
          onSubmit={handleSubmit}
          onSave={saveCode}
          showResetButton
          onReset={handleReset}
        />

        {submissionResult && (
          <div className={`rounded-xl border p-4 ${
            submissionResult.passed
              ? 'border-green-500/30 bg-green-900/10'
              : 'border-red-500/30 bg-red-900/10'
          }`}>
            {submissionResult.passed ? (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-semibold text-green-300">✓ Correct Output</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-sm font-semibold text-red-300">Output Mismatch</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700/30">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Expected</p>
                    <pre className="text-sm font-mono text-emerald-400 whitespace-pre-wrap">{submissionResult.expected}</pre>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700/30">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Your Output</p>
                    <pre className="text-sm font-mono text-red-300 whitespace-pre-wrap">{submissionResult.actual}</pre>
                  </div>
                </div>
                {generateHint(submissionResult.expected, submissionResult.actual) && (
                  <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-700/30">
                    <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-1">Hint</p>
                    <p className="text-sm text-blue-300/90">{generateHint(submissionResult.expected, submissionResult.actual)}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {showHint && hintLevel > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lightbulb size={14} className="text-amber-400" />
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                Hint {hintLevel}/{3}
              </p>
            </div>
            {hintLevel >= 1 && (
              <div className="p-3 rounded-xl bg-blue-900/20 border border-blue-700/30">
                <p className="text-sm text-slate-300">
                  {hintLevel === 1
                    ? (() => {
                        const progHint = generateProgressiveHint(lastCode, block.solution, block.hint, 0);
                        if (!progHint && block.hint) {
                          const sentences = block.hint.split(/(?<=[.!])\s+/);
                          return sentences[0] || block.hint;
                        }
                        return progHint || block.hint;
                      })()
                    : hintLevel === 2
                    ? block.hint
                    : generateProgressiveHint(lastCode, block.solution, block.hint, 2) || block.hint}
                </p>
              </div>
            )}
            {hintLevel >= 3 && !showSolution && (
              <button
                onClick={() => setShowSolution(true)}
                className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 px-4 py-2 rounded-lg bg-emerald-900/30 border border-emerald-700/40 hover:bg-emerald-900/50 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Show Solution
              </button>
            )}
            {showSolution && (
              <div className="p-3 rounded-xl bg-emerald-900/20 border border-emerald-700/30">
                <p className="text-xs font-semibold text-emerald-400 mb-1">Solution</p>
                <pre className="text-sm text-emerald-300 font-mono whitespace-pre-wrap">{block.solution}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function generateHint(expected: string, actual: string): string {
  const exp = expected.trimEnd();
  const act = actual.trimEnd();

  if (exp === act) return '';

  // Check for whitespace differences
  const expNorm = exp.replace(/\s+/g, ' ').trim();
  const actNorm = act.replace(/\s+/g, ' ').trim();
  if (expNorm === actNorm && exp !== act) {
    return 'Check your spacing and line breaks — the text matches but whitespace differs.';
  }

  // Check for line count difference
  const expLines = exp.split('\n');
  const actLines = act.split('\n');
  if (expLines.length !== actLines.length) {
    const diff = Math.abs(expLines.length - actLines.length);
    const more = actLines.length > expLines.length;
    return `Expected ${expLines.length} line${expLines.length === 1 ? '' : 's'} but got ${actLines.length}. You have ${more ? `${diff} extra line${diff === 1 ? '' : 's'}` : `${diff} fewer line${diff === 1 ? '' : 's'}`}.`;
  }

  // Find first differing character
  const maxLen = Math.max(exp.length, act.length);
  for (let i = 0; i < maxLen; i++) {
    if (exp[i] !== act[i]) {
      const expChar = exp[i] ?? '(end)';
      const actChar = act[i] ?? '(end)';
      const desc: Record<string, string> = {
        ' ': 'space',
        '\n': 'newline',
        ',': 'comma',
        '.': 'period',
        '!': 'exclamation mark',
        "'": 'single quote',
        '"': 'double quote',
        '\t': 'tab',
      };
      const expDesc = desc[expChar] ?? `"${expChar}"`;
      const actDesc = desc[actChar] ?? `"${actChar}"`;
      return `Character ${i + 1} differs: expected ${expDesc} but found ${actDesc}.`;
    }
  }

  return '';
}
