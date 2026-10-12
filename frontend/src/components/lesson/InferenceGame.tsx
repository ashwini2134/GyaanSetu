import { useState, useEffect } from 'react';
import type { InferenceGameConfig } from '../../types/lesson';

interface Props {
  config: InferenceGameConfig;
  onComplete: () => void;
  onAttempt?: () => void;
}

type Phase = 'carousel' | 'inference' | 'complete';

const DEFAULT_FACTS = [
  { label: 'Artifact Missing',  value: true  },
  { label: 'Motion Detected',   value: true  },
  { label: 'Camera Live',       value: true  },
  { label: 'Guard Present',     value: false },
  { label: 'Door Forced Open',  value: true  },
];

const DEFAULT_RULES = [
  { id: 'r1', display: 'Motion Detected AND Camera Live',          then: 'Possible Intruder' },
  { id: 'r2', display: 'Artifact Missing AND Motion Detected',     then: 'Investigate Scene' },
  { id: 'r3', display: 'Door Forced Open',                         then: 'Suspicious Activity' },
  { id: 'r4', display: 'Suspicious Activity OR Possible Intruder', then: 'Alert Security' },
];

// Plain-language narrative steps the AI "thinks through"
const STEPS = [
  {
    id: 0,
    type: 'load' as const,
    text: 'Reading clues from tonight…',
  },
  {
    id: 1,
    type: 'load' as const,
    text: 'Loading reasoning connections…',
  },
  {
    id: 2,
    type: 'think' as const,
    because: 'Motion detected + Camera live',
    concluded: 'Possible Intruder',
    isAlert: false,
  },
  {
    id: 3,
    type: 'think' as const,
    because: 'Door was forced open',
    concluded: 'Suspicious Activity',
    isAlert: false,
  },
  {
    id: 4,
    type: 'think' as const,
    because: 'Artifact missing + Motion detected',
    concluded: 'Investigate Scene',
    isAlert: false,
  },
  {
    id: 5,
    type: 'think' as const,
    because: 'Suspicious activity + Possible intruder',
    concluded: 'Alert Security',
    isAlert: true,
  },
];

function JourneyBar() {
  return (
    <div className="flex items-center justify-center gap-2 px-4 py-2.5 border-b border-slate-800/60 bg-slate-800/40 shrink-0">
      <span className="text-[11px] text-slate-300">1 — Logic ✓</span>
      <span className="text-slate-700 text-xs">›</span>
      <span className="text-[11px] text-slate-300">2 — Knowledge ✓</span>
      <span className="text-slate-700 text-xs">›</span>
      <span className="text-[11px] font-bold text-indigo-300">3 — Inference</span>
    </div>
  );
}

export default function InferenceGame({ config, onComplete, onAttempt }: Props) {
  const slides = config.slides ?? [];
  const [phase, setPhase] = useState<Phase>('carousel');
  const [slideIdx, setSlideIdx] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [running, setRunning] = useState(false);
  const done = visibleSteps >= STEPS.length;

  // Load KB from localStorage for count display
  const [kbCount] = useState(() => {
    try {
      const raw = localStorage.getItem('fraylon_ai_32_kb');
      if (raw) {
        const kb = JSON.parse(raw);
        return { facts: Array.isArray(kb.facts) ? kb.facts.length : 5, rules: Array.isArray(kb.rules) ? kb.rules.length : 4 };
      }
    } catch {}
    return { facts: DEFAULT_FACTS.length, rules: DEFAULT_RULES.length };
  });

  useEffect(() => {
    if (!running) return;
    if (visibleSteps >= STEPS.length) { setRunning(false); return; }
    const tid = setTimeout(() => setVisibleSteps(n => n + 1), 900);
    return () => clearTimeout(tid);
  }, [running, visibleSteps]);

  function start() {
    setVisibleSteps(0);
    setRunning(true);
    onAttempt?.();
  }

  // ── Carousel ──────────────────────────────────────────────────────────────────
  if (phase === 'carousel') {
    const slide = slides[slideIdx];
    const isLast = slideIdx === slides.length - 1;
    return (
      <div className="flex flex flex-col rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
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
            className="text-sm text-slate-300 disabled:opacity-0 hover:text-slate-300 transition-colors">Back</button>
          <button onClick={() => { if (isLast) setPhase('inference'); else setSlideIdx(i => i + 1); }}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all">
            {isLast ? 'Watch the AI think' : 'Next'}
          </button>
        </div>
      </div>
    );
  }

  // ── Complete ──────────────────────────────────────────────────────────────────
  if (phase === 'complete') {
    return (
      <div className="flex flex flex-col rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <JourneyBar />
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-green-950/50 border border-green-700/40 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-black text-white mb-1">{config.completionTitle || 'Case Solved'}</h2>
            <p className="text-slate-300 text-sm leading-relaxed max-w-xs whitespace-pre-line">{config.completionMessage}</p>
          </div>
          <div className="bg-slate-800/40 rounded-2xl px-5 py-4 w-full max-w-xs text-left">
            <div className="text-[10px] text-slate-300 uppercase tracking-widest mb-3 font-semibold">What you built in 3 steps</div>
            <div className="space-y-2.5">
              {[
                { step: '1 — Logic',     desc: 'AND, OR, NOT to evaluate conditions' },
                { step: '2 — Knowledge', desc: '5 clues + 5 connections about tonight' },
                { step: '3 — Inference', desc: 'AI figured out conclusions it was never told' },
              ].map(({ step, desc }) => (
                <div key={step} className="flex items-start gap-2.5">
                  <span className="text-indigo-400 text-xs font-bold shrink-0 mt-0.5">✓</span>
                  <div>
                    <div className="text-xs font-semibold text-slate-300">{step}</div>
                    <div className="text-xs text-slate-300 leading-snug">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 shrink-0">
          <button onClick={onComplete}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all text-sm">
            Continue Learning →
          </button>
        </div>
      </div>
    );
  }

  // ── Inference ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex flex-col rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
      <JourneyBar />

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">

        {/* Start state */}
        {!running && visibleSteps === 0 && (
          <>
            <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl px-4 py-3 text-center">
              <p className="text-sm text-white font-semibold mb-1">The AI has everything it needs</p>
              <p className="text-xs text-slate-300">
                {kbCount.facts} clues from tonight · {kbCount.rules} ways to reason
              </p>
            </div>
            <button onClick={start}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all text-sm">
              Watch it think →
            </button>
          </>
        )}

        {/* Thinking indicator */}
        {running && (
          <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-800/40 border border-slate-700/30 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shrink-0" />
            <span className="text-sm text-slate-300">Thinking…</span>
          </div>
        )}

        {/* Steps */}
        {visibleSteps > 0 && (
          <div className="flex flex-col gap-2">
            {STEPS.slice(0, visibleSteps).map(step => {
              if (step.type === 'load') {
                return (
                  <div key={step.id} className="flex items-center gap-3 px-4 py-2.5 bg-slate-800/30 border border-slate-700/30 rounded-xl">
                    <span className="text-green-400 text-sm shrink-0">✓</span>
                    <span className="text-sm text-slate-300">{step.text}</span>
                  </div>
                );
              }
              // think step
              const isAlert = step.isAlert;
              return (
                <div key={step.id} className={`rounded-xl border px-4 py-3 transition-all duration-300 ${
                  isAlert
                    ? 'border-indigo-500/30 bg-indigo-900/20'
                    : 'border-indigo-500/30 bg-indigo-900/10'
                }`}>
                  <p className="text-xs text-slate-300 mb-1.5">{step.because}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300">→</span>
                    <span className={`text-sm font-bold ${isAlert ? 'text-indigo-300' : 'text-indigo-200'}`}>
                      {step.concluded}
                    </span>
                    {isAlert && <span className="text-xs text-indigo-500 font-semibold ml-1">Final conclusion</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {done && (
        <div className="px-5 pb-5 pt-3 border-t border-slate-800 shrink-0">
          <button onClick={() => setPhase('complete')}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all text-sm">
            Complete Step 3
          </button>
        </div>
      )}
    </div>
  );
}
