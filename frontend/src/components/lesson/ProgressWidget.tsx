import type { LectureProgress } from '../../types/lesson';

interface ProgressWidgetProps {
  progress: LectureProgress;
  totalSections: number;
}

export default function ProgressWidget({ progress, totalSections }: ProgressWidgetProps) {
  const visited = Object.values(progress.sections).filter(s => s.visited).length;
  const pct = Math.round((visited / Math.max(totalSections, 1)) * 100);

  return (
    <div className="px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-700/30">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">Progress</span>
        <span className="text-[10px] font-bold text-[var(--brand-primary)]">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--brand-primary)] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-300">
        <span>{visited}/{totalSections} sections</span>
        {progress.quizCompleted && (
          <span className="text-[var(--brand-primary)]">✓ Quiz {progress.quizScore !== null ? `${progress.quizScore}%` : ''}</span>
        )}
        {progress.problemsCompleted.length > 0 && (
          <span className="text-[var(--brand-primary)]">✓ {progress.problemsCompleted.length} solved</span>
        )}
      </div>
    </div>
  );
}
