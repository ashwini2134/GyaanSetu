import { useEffect, useCallback } from 'react';
import type { DebugStep } from '../interpreter';
import SceneRenderer from './SceneRenderer';

interface SimulationModalProps {
  projectId: string;
  steps?: DebugStep[];
  onClose: () => void;
  mode?: 'example' | 'your-version';
}

export default function SimulationModal({ projectId, steps, onClose, mode }: SimulationModalProps) {
  const handleFinish = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-[90vw] h-[85vh] max-w-5xl rounded-2xl overflow-hidden border border-slate-700/30 shadow-2xl bg-[#0b0f14]">
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
            mode === 'example'
              ? 'bg-sky-500/10 text-sky-300 border border-sky-500/20'
              : 'bg-violet-500/10 text-violet-300 border border-violet-500/20'
          }`}>
            {mode === 'example' ? 'Example Preview' : 'Your Version'}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-white/5 text-slate-500 text-[10px] font-medium">
            Click to skip
          </span>
        </div>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-slate-900/60 hover:bg-slate-800/80 text-slate-400 hover:text-white flex items-center justify-center transition-colors backdrop-blur-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <SceneRenderer projectId={projectId} steps={steps} onFinish={handleFinish} />
      </div>
    </div>
  );
}
