import { useEffect, useState, useCallback } from 'react';
import type { DebugStep } from '../interpreter';
import SceneRenderer from './SceneRenderer';

interface SimulationModalProps {
  projectId: string;
  steps?: DebugStep[];
  onClose: () => void;
  autoClose?: boolean;
}

export default function SimulationModal({ projectId, steps, onClose, autoClose = true }: SimulationModalProps) {
  const [showCompletion, setShowCompletion] = useState(false);

  const handleFinish = useCallback(() => {
    if (autoClose) {
      onClose();
    } else {
      setShowCompletion(true);
    }
  }, [autoClose, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (showCompletion) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 p-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-sky-500/20 border border-emerald-500/30 flex items-center justify-center">
            <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xl font-bold text-slate-100">Project Complete!</p>
          <p className="text-sm text-slate-400">Great work on this project.</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-[90vw] h-[85vh] max-w-5xl rounded-2xl overflow-hidden border border-slate-700/30 shadow-2xl bg-[#0b0f14]">
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
