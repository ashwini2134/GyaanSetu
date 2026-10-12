import { useState } from 'react';
import type { KBGameConfig } from '../../types/lesson';

interface Props {
  config: KBGameConfig;
  onComplete: () => void;
  onAttempt?: () => void;
}

type Phase = 'carousel' | 'facts' | 'rules' | 'complete';

const ALL_FACTS = [
  { id: 'artifact_missing', label: 'Artifact Missing',  value: true,  desc: 'The museum artifact was reported stolen.' },
  { id: 'motion_triggered', label: 'Motion Detected',   value: true,  desc: 'Sensors picked up movement in the hall.' },
  { id: 'camera_online',    label: 'Camera Live',       value: true,  desc: 'Security cameras are actively recording.' },
  { id: 'guard_present',    label: 'Guard Present',     value: false, desc: 'No guard is on duty at this hour.' },
  { id: 'door_forced',      label: 'Door Forced Open',  value: true,  desc: 'The back door shows forced entry.' },
];

// op null = single condition, 'AND' = all must be true, 'OR' = any is enough
const ALL_RULES = [
  {
    id: 'r1',
    conditions: ['Motion Detected', 'Camera Live'],
    op: 'AND' as string | null,
    conclusion: 'Possible Intruder',
    plain: 'Both sensors agree — someone may be inside.',
  },
  {
    id: 'r2',
    conditions: ['Possible Intruder', 'Guard Present'],
    op: 'AND' as string | null,
    conclusion: 'Detain Suspect',
    plain: 'A guard is available and there\'s an intruder — detain.',
  },
  {
    id: 'r3',
    conditions: ['Artifact Missing', 'Motion Detected'],
    op: 'AND' as string | null,
    conclusion: 'Investigate Scene',
    plain: 'Something\'s gone and someone moved — investigate.',
  },
  {
    id: 'r4',
    conditions: ['Door Forced Open'],
    op: null,
    conclusion: 'Suspicious Activity',
    plain: 'A forced door alone is enough to flag suspicious activity.',
  },
  {
    id: 'r5',
    conditions: ['Suspicious Activity', 'Possible Intruder'],
    op: 'OR' as string | null,
    conclusion: 'Alert Security',
    plain: 'Either threat alone is enough — alert security now.',
  },
];

function JourneyBar() {
  return (
    <div className="flex items-center justify-center gap-2 px-4 py-2.5 border-b border-slate-700/20 bg-slate-800/40 shrink-0">
      <span className="text-[11px] text-slate-300">1 — Logic ✓</span>
      <span className="text-slate-700 text-xs">›</span>
      <span className="text-[11px] font-bold text-indigo-300">2 — Knowledge</span>
      <span className="text-slate-700 text-xs">›</span>
      <span className="text-[11px] text-slate-300">3 — Inference</span>
    </div>
  );
}

function ValueChip({ value }: { value: boolean }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-black shrink-0 ${
      value ? 'bg-green-950/50 text-green-400 border border-green-700/40'
             : 'bg-red-950/50 text-red-400 border border-red-700/40'
    }`}>
      {value ? 'TRUE' : 'FALSE'}
    </span>
  );
}

export default function KnowledgeBaseGame({ config, onComplete, onAttempt }: Props) {
  const slides = config.slides ?? [];
  const [phase, setPhase] = useState<Phase>('carousel');
  const [slideIdx, setSlideIdx] = useState(0);
  const [addedFacts, setAddedFacts] = useState<Set<string>>(new Set());
  const [addedRules, setAddedRules] = useState<Set<string>>(new Set());

  const allFactsDone = addedFacts.size === ALL_FACTS.length;
  const allRulesDone = addedRules.size === ALL_RULES.length;
  const nextRuleIdx = ALL_RULES.findIndex(r => !addedRules.has(r.id));

  function toggleFact(id: string) {
    setAddedFacts(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); onAttempt?.(); }
      return next;
    });
  }

  function addRule(id: string) {
    if (addedRules.has(id)) return;
    setAddedRules(prev => new Set([...prev, id]));
    onAttempt?.();
  }

  function finish() {
    try {
      localStorage.setItem('fraylon_ai_32_kb', JSON.stringify({
        facts: ALL_FACTS,
        rules: ALL_RULES.filter(r => addedRules.has(r.id)),
        completedAt: Date.now(),
      }));
    } catch {}
    setPhase('complete');
  }

  // ── Carousel ──────────────────────────────────────────────────────────────────
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
            className="text-sm text-slate-300 disabled:opacity-0 hover:text-slate-300 transition-colors">Back</button>
          <button onClick={() => { if (isLast) setPhase('facts'); else setSlideIdx(i => i + 1); }}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-colors">
            {isLast ? 'Start' : 'Next'}
          </button>
        </div>
      </div>
    );
  }

  // ── Complete ──────────────────────────────────────────────────────────────────
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
            <h2 className="text-xl font-black text-white mb-1">{config.completionTitle || 'Step 2 Complete'}</h2>
            <p className="text-slate-300 text-sm leading-relaxed max-w-xs whitespace-pre-line">{config.completionMessage}</p>
          </div>
          <div className="bg-slate-800/40 rounded-2xl px-5 py-4 w-full max-w-xs text-left space-y-2">
            <div className="text-[10px] text-slate-300 uppercase tracking-widest mb-2 font-semibold">The AI now knows</div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Clues from tonight</span>
              <span className="font-bold text-green-400">{addedFacts.size} facts</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Ways to reason</span>
              <span className="font-bold text-indigo-400">{addedRules.size} rules</span>
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 shrink-0">
          <button onClick={onComplete}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-colors text-sm">
            Continue Learning →
          </button>
        </div>
      </div>
    );
  }

  // ── Facts phase ───────────────────────────────────────────────────────────────
  if (phase === 'facts') {
    return (
      <div className="flex flex-col rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <JourneyBar />

        <div className="px-5 pt-4 pb-3 shrink-0">
          <div className="flex items-center justify-between mb-0.5">
            <h2 className="text-sm font-bold text-white">What the AI sees tonight</h2>
            <span className="text-xs text-slate-300">{addedFacts.size} / {ALL_FACTS.length}</span>
          </div>
          <p className="text-xs text-slate-300 mb-2.5">Tap each clue to show it to the AI.</p>
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${(addedFacts.size / ALL_FACTS.length) * 100}%` }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-2">
          {ALL_FACTS.map(f => {
            const added = addedFacts.has(f.id);
            return (
              <button key={f.id} onClick={() => toggleFact(f.id)}
                className={`w-full text-left rounded-xl border px-4 py-3 transition-all duration-150 ${
                  added
                    ? 'border-indigo-500/40 bg-indigo-900/20'
                    : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50'
                }`}>
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="text-sm font-semibold text-white">{f.label}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <ValueChip value={f.value} />
                    <span className={`text-[11px] font-semibold ${added ? 'text-indigo-400' : 'text-slate-300'}`}>
                      {added ? '✓' : '+ Show'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-snug">{f.desc}</p>
              </button>
            );
          })}
        </div>

        <div className="px-5 pb-5 pt-3 border-t border-slate-800 shrink-0">
          <button onClick={() => setPhase('rules')} disabled={!allFactsDone}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-colors text-sm">
            {allFactsDone ? 'Now teach it how to reason →' : `Show all clues (${addedFacts.size} / ${ALL_FACTS.length})`}
          </button>
        </div>
      </div>
    );
  }

  // ── Rules phase ───────────────────────────────────────────────────────────────
  const currentRule = nextRuleIdx >= 0 ? ALL_RULES[nextRuleIdx] : null;
  const doneRules = ALL_RULES.filter(r => addedRules.has(r.id));

  const condLabel = (op: string | null) => {
    if (!op) return null;
    return op === 'AND' ? 'All of these are true:' : 'Any of these is true:';
  };

  return (
    <div className="flex flex-col rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
      <JourneyBar />

      <div className="px-5 pt-4 pb-3 shrink-0">
        <div className="flex items-center justify-between mb-0.5">
          <h2 className="text-sm font-bold text-white">How the AI reasons</h2>
          <span className="text-xs text-slate-300">{addedRules.size} / {ALL_RULES.length}</span>
        </div>
        <p className="text-xs text-slate-300 mb-2.5">Read each connection, then confirm it.</p>
        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all duration-300"
            style={{ width: `${(addedRules.size / ALL_RULES.length) * 100}%` }} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4 flex flex-col gap-3">

        {/* Active rule */}
        {currentRule && (
          <div className="border border-indigo-500/30 bg-indigo-900/10 rounded-2xl px-4 pt-4 pb-4">
            <div className="text-[10px] text-indigo-400 uppercase tracking-widest font-semibold mb-3">
              Connection {nextRuleIdx + 1} of {ALL_RULES.length}
            </div>

            {/* When block */}
            <div className="mb-3">
              <p className="text-xs text-slate-300 mb-2">
                {currentRule.op ? condLabel(currentRule.op) : 'When this is true:'}
              </p>
              <div className="flex flex-col gap-1.5">
                {currentRule.conditions.map((c, i) => (
                  <div key={i} className="bg-slate-800/60 border border-slate-700/40 rounded-lg px-3 py-2 text-sm text-white">
                    {c}
                  </div>
                ))}
              </div>
            </div>

            {/* Conclusion */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-slate-300 text-sm">→</span>
              <div className="bg-indigo-900/30 border border-indigo-500/30 rounded-lg px-3 py-2 flex-1">
                <span className="text-sm text-indigo-200 font-semibold">{currentRule.conclusion}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-3 leading-snug">{currentRule.plain}</p>

            <button onClick={() => addRule(currentRule.id)}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-colors">
              Got it →
            </button>
          </div>
        )}

        {/* Done rules — compact tick list */}
        {doneRules.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] text-slate-300 uppercase tracking-widest font-semibold px-1">Confirmed</p>
            {doneRules.map(r => (
              <div key={r.id} className="flex items-center gap-3 px-3 py-2 bg-slate-800/20 border border-slate-800 rounded-xl">
                <span className="text-green-500 text-xs shrink-0">✓</span>
                <span className="text-xs text-slate-300 leading-snug">
                  {r.conditions.join(r.op === 'OR' ? ' or ' : ' + ')}
                  <span className="text-slate-300"> → </span>
                  <span className="text-indigo-400 font-semibold">{r.conclusion}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 pb-5 pt-3 border-t border-slate-800 shrink-0">
        <button onClick={finish} disabled={!allRulesDone}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-colors text-sm">
          {allRulesDone ? 'Complete Step 2' : `Confirm all connections (${addedRules.size} / ${ALL_RULES.length})`}
        </button>
      </div>
    </div>
  );
}
