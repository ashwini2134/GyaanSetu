import { useState } from 'react';
import type { PropLogicGameConfig } from '../../types/lesson';

interface Props {
  config: PropLogicGameConfig;
  onComplete: () => void;
  onAttempt?: () => void;
}

type Op = 'AND' | 'OR' | 'NOT';
type Phase = 'carousel' | 'game' | 'complete';

// ── Same museum break-in setting used in 3.2 and 3.3 ─────────────────────────
const SCENARIOS = [
  {
    id: 1,
    story: 'The exhibit room requires a badge scan AND a face match. Both must succeed.',
    condA: { label: 'Badge Scan', value: true },
    op: 'AND' as Op,
    condB: { label: 'Face Match', value: true } as { label: string; value: boolean } | null,
    resultLabel: 'Exhibit Unlocked',
    resultValue: true,
    explanation: 'Both TRUE → AND = TRUE. Every condition must hold.',
  },
  {
    id: 2,
    story: 'Staff can enter with their key card OR an emergency override — either is enough.',
    condA: { label: 'Key Card', value: false },
    op: 'OR' as Op,
    condB: { label: 'Override', value: true } as { label: string; value: boolean } | null,
    resultLabel: 'Staff Entry',
    resultValue: true,
    explanation: 'One FALSE, one TRUE → OR = TRUE. Only one needs to succeed.',
  },
  {
    id: 3,
    story: 'A flagged suspect tries to enter. Invert their blacklist status to decide.',
    condA: { label: 'Blacklisted', value: true },
    op: 'NOT' as Op,
    condB: null,
    resultLabel: 'Entry Allowed',
    resultValue: false,
    explanation: 'NOT TRUE = FALSE. Blacklisted flips to denied.',
  },
  {
    id: 4,
    story: 'The motion sensor AND the live camera must both confirm before raising an alert.',
    condA: { label: 'Motion', value: true },
    op: 'AND' as Op,
    condB: { label: 'Camera Live', value: true } as { label: string; value: boolean } | null,
    resultLabel: 'Alert Triggered',
    resultValue: true,
    explanation: 'Both TRUE → AND = TRUE. Every sensor must confirm.',
  },
  {
    id: 5,
    story: 'A forced door OR a disabled alarm — either breach alone triggers lockdown.',
    condA: { label: 'Door Forced', value: true },
    op: 'OR' as Op,
    condB: { label: 'Alarm Off', value: true } as { label: string; value: boolean } | null,
    resultLabel: 'Lockdown',
    resultValue: true,
    explanation: 'Either threat alone is enough. OR catches every angle.',
  },
];

// ── Shared journey indicator ──────────────────────────────────────────────────
function JourneyBar() {
  return (
    <div className="flex items-center justify-center gap-2 px-4 py-2.5 border-b border-slate-700/20 bg-slate-800/40 shrink-0">
      <span className="text-[11px] font-bold text-indigo-300">1 — Logic</span>
      <span className="text-slate-700 text-xs">›</span>
      <span className="text-[11px] text-slate-300">2 — Knowledge</span>
      <span className="text-slate-700 text-xs">›</span>
      <span className="text-[11px] text-slate-300">3 — Inference</span>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function InlineLock({ solved, resultValue }: { solved: boolean; resultValue: boolean }) {
  if (!solved) {
    return (
      <svg width="14" height="18" viewBox="0 0 28 34" fill="none" className="shrink-0">
        <rect x="1" y="14" width="26" height="18" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="2" />
        <path d="M6 14V10a8 8 0 0 1 16 0v4" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
        <circle cx="14" cy="22.5" r="3" fill="#475569" />
      </svg>
    );
  }
  const locked = !resultValue;
  const c = locked ? '#ef4444' : '#22c55e';
  const bg = locked ? 'rgba(69,10,10,0.3)' : 'rgba(20,83,45,0.3)';
  return (
    <svg width="14" height="18" viewBox="0 0 28 34" fill="none" className="shrink-0 transition-all duration-500">
      <rect x="1" y="14" width="26" height="18" rx="4" fill={bg} stroke={c} strokeWidth="2" />
      {locked
        ? <path d="M6 14V10a8 8 0 0 1 16 0v4" stroke={c} strokeWidth="2" strokeLinecap="round" />
        : <path d="M6 14V10a8 8 0 0 1 13.5-1.8" stroke={c} strokeWidth="2" strokeLinecap="round" />
      }
      <circle cx="14" cy="22.5" r="3" fill={c} />
    </svg>
  );
}

function CondCard({ label, value }: { label: string; value: boolean }) {
  return (
    <div className={`rounded-xl px-3 py-3 text-center border flex-1 flex flex-col items-center justify-center min-h-[68px] ${
      value ? 'bg-green-950/30 border-green-700/40' : 'bg-red-950/30 border-red-700/40'
    }`}>
      <div className="text-[11px] text-slate-300 mb-1.5 leading-tight">{label}</div>
      <div className={`text-sm font-black tracking-wide ${value ? 'text-green-400' : 'text-red-400'}`}>
        {value ? 'TRUE' : 'FALSE'}
      </div>
    </div>
  );
}

function OpSlot({ op, correct }: { op: Op | null; correct: boolean }) {
  return (
    <div className={`rounded-xl w-16 flex items-center justify-center border-2 shrink-0 min-h-[68px] transition-all duration-300 ${
      correct ? 'border-indigo-500/70 bg-indigo-900/30' : 'border-dashed border-slate-600/60'
    }`}>
      {correct && op
        ? <span className="font-mono font-black text-indigo-300 text-sm">{op}</span>
        : <span className="text-slate-300 text-2xl font-light">?</span>
      }
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PropLogicGame({ config, onComplete, onAttempt }: Props) {
  const slides = config.slides ?? [];
  const [phase, setPhase] = useState<Phase>('carousel');
  const [slideIdx, setSlideIdx] = useState(0);
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<Op | null>(null);
  const [wrongOp, setWrongOp] = useState<Op | null>(null);

  const s = SCENARIOS[idx];
  const correct = chosen === s.op;

  function pick(op: Op) {
    if (correct) return;
    if (op === s.op) { setChosen(op); onAttempt?.(); }
    else { setWrongOp(op); setTimeout(() => setWrongOp(null), 500); }
  }

  function next() {
    if (idx < SCENARIOS.length - 1) { setIdx(i => i + 1); setChosen(null); }
    else {
      try { localStorage.setItem('fraylon_ai_31_complete', JSON.stringify({ completedAt: Date.now() })); } catch {}
      setPhase('complete');
    }
  }

  // ── Carousel ────────────────────────────────────────────────────────────────
  if (phase === 'carousel') {
    const slide = slides[slideIdx];
    const isLast = slideIdx === slides.length - 1;
    return (
      <div className="flex flex-col rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <JourneyBar />
        <div className="flex justify-center gap-1.5 pt-5">
          {slides.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
              i === slideIdx ? 'w-6 bg-indigo-400' : 'w-1.5 bg-slate-700'
            }`} />
          ))}
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-7 gap-5 text-center">
          <h2 className="text-xl font-bold text-white leading-tight">{slide?.title}</h2>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{slide?.body}</p>
        </div>
        <div className="px-7 pb-7 flex justify-between items-center">
          <button onClick={() => setSlideIdx(i => Math.max(0, i - 1))} disabled={slideIdx === 0}
            className="text-sm text-slate-300 disabled:opacity-0 hover:text-slate-300 transition-colors">
            Back
          </button>
          <button onClick={() => { if (isLast) setPhase('game'); else setSlideIdx(i => i + 1); }}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all">
            {isLast ? 'Start' : 'Next'}
          </button>
        </div>
      </div>
    );
  }

  // ── Complete ─────────────────────────────────────────────────────────────────
  if (phase === 'complete') {
    return (
      <div className="flex flex-col rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <JourneyBar />
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-900/30 border border-indigo-500/30 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-black text-white mb-1">{config.completionTitle || 'Step 1 Complete'}</h2>
            <p className="text-slate-300 text-sm leading-relaxed max-w-xs whitespace-pre-line">{config.completionMessage}</p>
          </div>
          <div className="bg-slate-800/40 rounded-2xl px-5 py-4 w-full max-w-xs text-left">
            <div className="text-[10px] text-slate-300 uppercase tracking-widest mb-3 font-semibold">What you taught the AI</div>
            <div className="space-y-2">
              {(['AND', 'OR', 'NOT'] as Op[]).map(op => (
                <div key={op} className="flex items-start gap-3">
                  <span className="font-mono text-sm font-black text-indigo-300 w-8 shrink-0">{op}</span>
                  <span className="text-slate-300 text-xs leading-snug">
                    {op === 'AND' ? 'All conditions must be TRUE' : op === 'OR' ? 'At least one must be TRUE' : 'Inverts TRUE to FALSE'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 shrink-0">
          <button onClick={onComplete}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all text-sm">
            Continue → Build the Knowledge Base
          </button>
        </div>
      </div>
    );
  }

  // ── Game ──────────────────────────────────────────────────────────────────────
  const isNOT = s.op === 'NOT';

  return (
    <div className="flex flex-col rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
      <JourneyBar />

      {/* Scenario progress */}
      <div className="flex items-center justify-between px-5 pt-3 pb-2 shrink-0">
        <div className="flex gap-1.5">
          {SCENARIOS.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
              i < idx ? 'w-4 bg-indigo-400' : i === idx ? 'w-6 bg-indigo-500' : 'w-1.5 bg-slate-700'
            }`} />
          ))}
        </div>
        <span className="text-xs text-slate-300">{idx + 1} / {SCENARIOS.length}</span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-3">

        {/* Story */}
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl px-4 py-3">
          <p className="text-sm text-slate-300 leading-snug">{s.story}</p>
        </div>

        {/* Expression */}
        <div className="bg-slate-800/20 border border-slate-700/30 rounded-2xl px-4 py-4 flex flex-col gap-3">
          <div className="flex items-stretch gap-2">
            {isNOT ? (
              <>
                <OpSlot op={chosen} correct={correct} />
                <CondCard label={s.condA.label} value={s.condA.value} />
              </>
            ) : (
              <>
                <CondCard label={s.condA.label} value={s.condA.value} />
                <OpSlot op={chosen} correct={correct} />
                {s.condB && <CondCard label={s.condB.label} value={s.condB.value} />}
              </>
            )}
          </div>

          {/* Result */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-700/30">
            <span className="text-slate-300 text-sm shrink-0">→</span>
            <InlineLock solved={correct} resultValue={s.resultValue} />
            <span className={`text-sm font-semibold transition-colors duration-500 ${
              !correct ? 'text-slate-300' : s.resultValue ? 'text-green-400' : 'text-red-400'
            }`}>
              {s.resultLabel}{correct ? `: ${s.resultValue ? 'TRUE' : 'FALSE'}` : ''}
            </span>
          </div>
        </div>

        {/* Explanation */}
        {correct && (
          <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl px-4 py-3">
            <p className="text-sm text-slate-300 leading-relaxed">{s.explanation}</p>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="px-4 pb-5 pt-3 border-t border-slate-800/60 shrink-0">
        {!correct ? (
          <div className="flex gap-2">
            {(['AND', 'OR', 'NOT'] as Op[]).map(op => (
              <button key={op} onClick={() => pick(op)}
                className={`flex-1 py-3 rounded-xl font-mono font-bold text-sm border-2 transition-all duration-150 ${
                  wrongOp === op
                    ? 'border-red-500/70 bg-red-950/30 text-red-400 scale-95'
                    : 'border-slate-700/60 text-slate-300 hover:border-indigo-500/60 hover:bg-indigo-900/20 hover:text-indigo-200'
                }`}>
                {op}
              </button>
            ))}
          </div>
        ) : (
          <button onClick={next}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all text-sm">
            {idx < SCENARIOS.length - 1 ? 'Next →' : 'Complete Step 1'}
          </button>
        )}
      </div>
    </div>
  );
}
