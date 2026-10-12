import { useState } from 'react';

const DEFAULT_POINTS = [
  'Correct output',
  'Correct logic',
  'Multiple test cases — not just the one shown above',
];

interface HowWeEvaluateCardProps {
  points?: string[];
  defaultCollapsed?: boolean;
}

/** Sets honest expectations: passing the visible sample doesn't guarantee every test case passes. */
export default function HowWeEvaluateCard({ points, defaultCollapsed = true }: HowWeEvaluateCardProps) {
  const [open, setOpen] = useState(!defaultCollapsed);
  const items = points && points.length > 0 ? points : DEFAULT_POINTS;

  return (
    <div className="rounded-xl border border-[#334155]/50 bg-[#1e293b]/40 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-xs font-semibold text-[#cbd5e1] uppercase tracking-wider">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          How We Evaluate
        </span>
        <svg
          className={`w-4 h-4 text-[#94a3b8] transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-xs text-[#cbd5e1]">Your program is tested automatically. We check:</p>
          <ul className="space-y-1.5">
            {items.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-[#cbd5e1] leading-relaxed">
                <span className="w-1 h-1 rounded-full bg-[#94a3b8] mt-1.5 flex-shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-amber-400/90 bg-amber-900/10 border border-amber-700/20 rounded-lg px-3 py-2">
            Passing the sample input alone is not enough — your code needs to handle every test case correctly.
          </p>
        </div>
      )}
    </div>
  );
}
