import { useState } from 'react';

const DEFAULT_POINTS = [
  'This challenge helps you practise the concept you just learned.',
  'You only need to edit the code shown in the editor.',
  'You do NOT need to create files.',
  'You do NOT need GitHub.',
  'You do NOT need to install anything.',
];

const DEFAULT_STEPS = [
  'Read the problem carefully.',
  'Write your solution.',
  'Click Run Code to test it.',
  'Click Submit Solution once your program works.',
];

interface BeforeYouStartCardProps {
  points?: string[];
  defaultCollapsed?: boolean;
}

/** Orientation card shown above a problem's description — first thing a beginner sees before any code. */
export default function BeforeYouStartCard({ points, defaultCollapsed = false }: BeforeYouStartCardProps) {
  const [open, setOpen] = useState(!defaultCollapsed);
  const items = points && points.length > 0 ? points : DEFAULT_POINTS;

  return (
    <div className="rounded-xl border border-blue-700/30 bg-blue-900/10 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Before You Start
        </span>
        <svg
          className={`w-4 h-4 text-blue-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          <ul className="space-y-1.5">
            {items.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                <span className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <div className="pt-2 border-t border-blue-700/20">
            <p className="text-[10px] font-semibold text-blue-400/80 uppercase tracking-wider mb-2">Simply</p>
            <ol className="space-y-1">
              {DEFAULT_STEPS.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                  <span className="font-bold text-blue-400 min-w-[13px]">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
