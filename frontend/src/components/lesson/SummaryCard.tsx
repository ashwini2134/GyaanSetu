import { GraduationCap } from 'lucide-react';
import type { SummaryData } from '../../types/lesson';

interface SummaryCardProps {
  summary: SummaryData;
  lectureTitle: string;
  nextLectureTitle?: string;
  onNext?: () => void;
}

export default function SummaryCard({ summary, lectureTitle, nextLectureTitle, onNext }: SummaryCardProps) {
  return (
    <div className="space-y-5">
      {/* Key Takeaways */}
      <div className="rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-600/8 to-slate-800/40 p-6">
        <h3 className="text-sm font-semibold text-green-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Key Takeaways
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {summary.keyTakeaways.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-800/30 border border-slate-700/20">
              <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-slate-200 leading-snug">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* What you learned */}
      <div className="rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          You Now Know
        </h3>
        <ul className="space-y-2">
          {summary.whatYouLearned.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
              <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Completed + Next */}
      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-slate-800/40 p-6 text-center space-y-4">
        <div className="text-4xl"><GraduationCap size={48} className="text-blue-400 inline-block" /></div>
        <div>
          <p className="text-lg font-bold text-white">Lecture Complete!</p>
          <p className="text-sm text-slate-400 mt-1">You've finished "{lectureTitle}"</p>
        </div>
        {onNext && (
          <button
            onClick={onNext}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-600/20 transition-all"
          >
            {nextLectureTitle ? (
              <>
                Next: {nextLectureTitle}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </>
            ) : (
              'Back to Course'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
