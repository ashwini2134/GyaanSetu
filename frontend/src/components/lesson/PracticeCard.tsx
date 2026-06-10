import { useState, useEffect, useCallback } from 'react';
import type { PracticeBlock } from '../../types/lesson';
import CodeEditor from './CodeEditor';

interface PracticeCardProps {
  block: PracticeBlock;
  onAttempt?: () => void;
  onComplete?: () => void;
}

const SAVE_PREFIX = 'lms:practice:';

export default function PracticeCard({ block, onAttempt, onComplete }: PracticeCardProps) {
  const saveKey = `${SAVE_PREFIX}${block.title}`;
  const [open, setOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [passed, setPassed] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const [savedCode, setSavedCode] = useState<string | null>(null);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(saveKey);
      if (saved) setSavedCode(saved);
    } catch {}
  }, [saveKey]);

  const saveCode = useCallback((code: string) => {
    try { localStorage.setItem(saveKey, code); } catch {}
  }, [saveKey]);

  const handleRun = (_code: string, output: string, error: string | null) => {
    onAttempt?.();
    setAttempts(a => a + 1);
    setShowHint(true);
  };

  const handleSubmit = (_code: string, output: string, error: string | null) => {
    onAttempt?.();
    setAttempts(a => a + 1);
    setShowSolution(true);
    if (!error && block.expectedOutput && output.trim() === block.expectedOutput.trim()) {
      setPassed(true);
      onComplete?.();
    }
  };

  const handleReset = () => {
    setSavedCode(null);
    try { localStorage.removeItem(saveKey); } catch {}
    setAttempts(0);
    setPassed(false);
    setShowHint(false);
    setShowSolution(false);
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
            <p className="text-sm text-slate-300 leading-relaxed">{block.instructions}</p>
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
      {/* Header */}
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
        {/* Problem Statement */}
        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/30">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Instructions</p>
          <p className="text-sm text-slate-200 leading-relaxed">{block.instructions}</p>
        </div>

        {/* Expected Output */}
        {block.expectedOutput && (
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/30">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Expected Output</p>
            <pre className="text-sm text-emerald-400 font-mono" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>{block.expectedOutput}</pre>
          </div>
        )}

        {/* Code Editor */}
        <CodeEditor
          initialCode={savedCode ?? block.starterCode}
          language="python"
          height="200px"
          showSaveButton
          showSubmitButton
          expectedOutput={block.expectedOutput}
          onRun={handleRun}
          onSubmit={handleSubmit}
          onSave={saveCode}
          showResetButton
          onReset={handleReset}
        />

        {/* Action buttons removed — triggered via Run/Submit now */}

        {/* Hint box */}
        {showHint && block.hint && (
          <div className="p-3 rounded-xl bg-blue-900/20 border border-blue-700/30">
            <p className="text-xs font-semibold text-blue-400 mb-1">Hint</p>
            <p className="text-sm text-slate-300">{block.hint}</p>
          </div>
        )}

        {/* Solution */}
        {showSolution && block.solution && (
          <div className="rounded-xl bg-[#0d1117] border border-slate-700/40 overflow-hidden">
            <div className="flex items-center px-4 py-2 bg-slate-800/40 border-b border-slate-700/30">
              <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Solution</span>
            </div>
            <pre className="p-4 text-sm text-slate-200 font-mono leading-relaxed">{block.solution}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
