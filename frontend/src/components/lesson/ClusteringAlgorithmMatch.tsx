import { useState } from 'react';
import type { ClusteringMatchConfig } from '../../types/lesson';

interface Props {
  config: ClusteringMatchConfig;
  onComplete: () => void;
  onAttempt?: () => void;
}

const ALGO_LABELS: Record<string, { label: string; icon: string }> = {
  kmeans: { label: 'K-Means', icon: 'M9 3v18M15 3v18M3 9h18M3 15h18' },
  hierarchical: { label: 'Hierarchical', icon: 'M12 3v4m0 0L7 11m5-4l5 4m-5 4v6m-4-2l4 2 4-2' },
  dbscan: { label: 'DBSCAN', icon: 'M12 12m-3 0a3 3 0 106 0 3 3 0 10-6 0M5 5l2 2m10-2l-2 2M5 19l2-2m10 2l-2-2' },
};

export default function ClusteringAlgorithmMatch({ config, onComplete, onAttempt }: Props) {
  const { scenarios } = config;
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  const scenario = scenarios[idx];
  const isLast = idx === scenarios.length - 1;

  const handlePick = (algo: string) => {
    if (picked) return;
    onAttempt?.();
    setPicked(algo);
    if (algo === scenario.correctAlgorithm) setCorrectCount(c => c + 1);
  };

  const handleNext = () => {
    if (isLast) {
      setDone(true);
      onComplete();
    } else {
      setIdx(i => i + 1);
      setPicked(null);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-[var(--brand-primary)]/20 bg-gradient-to-br from-[var(--brand-primary)]/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="p-6 space-y-4 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-[var(--brand-primary)]/15 border-2 border-[var(--brand-primary)]/40 flex items-center justify-center">
            <svg className="w-7 h-7 text-[var(--brand-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Algorithm Matcher Complete</h3>
            <p className="text-sm text-slate-300 mt-1">You matched {correctCount} of {scenarios.length} scenarios to the right clustering algorithm.</p>
          </div>
          <div className="max-w-sm mx-auto space-y-1.5 text-left text-sm text-slate-300">
            <p className="flex items-start gap-2"><span className="text-[var(--brand-primary)]">•</span> K-Means: fast, needs a chosen K, works best on compact round clusters.</p>
            <p className="flex items-start gap-2"><span className="text-[var(--brand-primary)]">•</span> Hierarchical: builds a full tree of nested groupings, no K needed upfront.</p>
            <p className="flex items-start gap-2"><span className="text-[var(--brand-primary)]">•</span> DBSCAN: finds irregular-shaped clusters and flags noise/outliers automatically.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--brand-primary)]/20 bg-gradient-to-br from-[var(--brand-primary)]/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
      <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-700/20 flex items-center justify-between">
        <p className="text-xs font-semibold text-[var(--brand-primary)] uppercase tracking-wider">Match the Clustering Algorithm</p>
        <p className="text-[10px] text-slate-300">{idx + 1} / {scenarios.length}</p>
      </div>

      <div className="p-5 space-y-4">
        <div className="rounded-xl bg-slate-900/60 border border-slate-700/40 p-5 text-center">
          <div className="text-3xl mb-2">{scenario.emoji}</div>
          <p className="text-base font-bold text-white">{scenario.title}</p>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">{scenario.description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {(['kmeans', 'hierarchical', 'dbscan'] as const).map((algo) => {
            const meta = ALGO_LABELS[algo];
            const isCorrectChoice = picked && algo === scenario.correctAlgorithm;
            const isWrongChoice = picked === algo && algo !== scenario.correctAlgorithm;
            return (
              <button
                key={algo}
                onClick={() => handlePick(algo)}
                disabled={!!picked}
                className={`flex flex-col items-center gap-2 px-4 py-4 rounded-xl border text-sm font-semibold transition-all ${
                  isCorrectChoice ? 'bg-emerald-900/20 border-emerald-500/50 text-emerald-300'
                    : isWrongChoice ? 'bg-red-900/15 border-red-500/40 text-red-300'
                    : picked ? 'bg-slate-900/40 border-slate-700/20 text-slate-300 opacity-40'
                    : 'bg-slate-900/60 border-slate-700/40 text-slate-200 hover:border-[var(--brand-primary)]/50 hover:bg-slate-800/60'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={meta.icon} />
                </svg>
                {meta.label}
              </button>
            );
          })}
        </div>

        {picked && (
          <div className={`rounded-xl p-3.5 ${picked === scenario.correctAlgorithm ? 'bg-emerald-900/15 border border-emerald-500/30' : 'bg-slate-900/60 border border-slate-700/40'}`}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-slate-300">
              {picked === scenario.correctAlgorithm ? 'Correct' : `Best fit: ${ALGO_LABELS[scenario.correctAlgorithm].label}`}
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">{scenario.explanation}</p>
          </div>
        )}

        {picked && (
          <div className="text-center">
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-2.5 rounded-lg bg-[var(--brand-primary)] shadow-lg shadow-[var(--brand-primary)]/20 transition-all duration-[280ms] hover:scale-[1.03] hover:-translate-y-0.5"
            >
              {isLast ? 'See Results' : 'Next Scenario'}
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
