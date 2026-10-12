import { useState, useCallback } from 'react';
import type { AIChallengeSetBlock, AIChallenge } from '../../types/lesson';

const KEYFRAMES = `
@keyframes acs-pop {
  from { transform: scale(0.92); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}
@keyframes acs-slide {
  from { transform: translateY(12px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
`;

function CheckIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}

const CARD_ICONS: Record<string, JSX.Element> = {
  'face-unlock': (
    <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
      <circle cx="16" cy="14" r="8" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <circle cx="13" cy="12" r="1.5" fill="currentColor" opacity="0.5" />
      <circle cx="19" cy="12" r="1.5" fill="currentColor" opacity="0.5" />
      <path d="M12 18 Q16 22 20 18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.45" />
    </svg>
  ),
  maps: (
    <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
      <path d="M16 8 Q22 14 16 22 Q10 14 16 8Z" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <circle cx="16" cy="14" r="3" fill="currentColor" opacity="0.4" />
    </svg>
  ),
  chatgpt: (
    <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
      <rect x="8" y="10" width="16" height="12" rx="3" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <path d="M18 22 L16 26 L14 22" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.45" />
    </svg>
  ),
  netflix: (
    <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
      <rect x="8" y="8" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <path d="M12 12 L12 22 L16 18 L16 22 L20 18 L20 12" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" opacity="0.5" />
    </svg>
  ),
  calculator: (
    <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
      <rect x="9" y="6" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <rect x="12" y="9" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
      <text x="16" y="22" textAnchor="middle" fill="currentColor" fontSize="7" opacity="0.5">+</text>
      <text x="16" y="25" textAnchor="middle" fill="currentColor" fontSize="7" opacity="0.5">−</text>
    </svg>
  ),
  flashlight: (
    <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
      <rect x="13" y="6" width="6" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <circle cx="16" cy="24" r="3" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <line x1="16" y1="6" x2="16" y2="10" stroke="currentColor" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />
    </svg>
  ),
};

function diffColor(d: string) {
  if (d === 'Easy') return 'text-green-400 bg-green-500/10 border-green-500/20';
  if (d === 'Medium') return 'text-[var(--brand-primary)] bg-[var(--brand-primary)]/10 border-[var(--brand-primary)]/20';
  return 'text-red-400 bg-red-500/10 border-red-500/20';
}

function SelectCardsChallenge({ challenge, onComplete }: { challenge: AIChallenge; onComplete: (correct: number, total: number) => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const cards = challenge.cards ?? [];
  const toggle = (id: string) => {
    if (submitted) return;
    setSelected(p => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };
  const submit = () => {
    setSubmitted(true);
    const correct = cards.filter(c => selected.has(c.id) === c.usesAI).length;
    onComplete(correct, cards.length);
  };
  const hasIcons = cards.some(c => CARD_ICONS[c.id] !== undefined);
  return (
    <div>
      <div className="space-y-2">
        {cards.map(c => {
          const isSelected = selected.has(c.id);
          const isCorrect = submitted && c.usesAI;
          const isWrong = submitted && isSelected && !c.usesAI;
          const isMissed = submitted && !isSelected && c.usesAI;
          let border = 'border-slate-700/40 bg-slate-800/10';
          let textColor = 'text-slate-300';
          if (submitted) {
            if (isCorrect) { border = 'border-green-500/50 bg-green-500/8'; textColor = 'text-green-300'; }
            else if (isWrong) { border = 'border-red-500/50 bg-red-500/8'; textColor = 'text-red-300'; }
            else if (isMissed) { border = 'border-amber-500/40 bg-amber-500/5'; textColor = 'text-amber-300'; }
            else { border = 'border-slate-700/30 bg-slate-800/5'; textColor = 'text-slate-300'; }
          } else if (isSelected) {
            border = 'border-[var(--brand-primary)]/50 bg-[var(--brand-primary)]/8';
            textColor = 'text-white';
          }
          return (
            <button key={c.id} onClick={() => toggle(c.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all duration-300 ${border} ${!submitted ? 'hover:border-[var(--brand-primary)]/30 hover:bg-[var(--brand-primary)]/5 cursor-pointer' : 'cursor-default'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  submitted
                    ? isCorrect ? 'border-green-500 bg-green-500/20' : isWrong ? 'border-red-500 bg-red-500/20' : isMissed ? 'border-amber-500 bg-amber-500/20' : 'border-slate-700'
                    : isSelected ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/20' : 'border-slate-600'
                }`}>
                  {submitted && isCorrect && <svg className="w-3 h-3 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                  {submitted && isWrong && <svg className="w-3 h-3 text-red-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>}
                  {submitted && isMissed && <span className="text-amber-400 text-xs font-bold">!</span>}
                  {!submitted && isSelected && <div className="w-2 h-2 rounded-full bg-[var(--brand-primary)]" />}
                </div>
                {hasIcons && (
                  <span className={`flex-shrink-0 ${isSelected && !submitted ? 'text-[var(--brand-primary)]' : isCorrect ? 'text-green-400' : isWrong ? 'text-red-400' : 'text-slate-300'}`}>
                    {CARD_ICONS[c.id] ?? null}
                  </span>
                )}
                <span className={`text-xs font-semibold leading-snug ${textColor}`}>{c.label}</span>
              </div>
            </button>
          );
        })}
      </div>
      {!submitted && (
        <button onClick={submit} disabled={selected.size === 0}
          className={`mt-3 w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${selected.size > 0 ? 'bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)] text-white cursor-pointer' : 'bg-slate-800 text-slate-300 cursor-not-allowed'}`}>
          Submit
        </button>
      )}
      {submitted && challenge.explanation && (
        <div className="mt-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30" style={{ animation: 'acs-slide 0.4s ease both' }}>
          <p className="text-xs text-slate-300 leading-relaxed">{challenge.explanation}</p>
        </div>
      )}
    </div>
  );
}

function ClassifyChallenge({ challenge, onComplete }: { challenge: AIChallenge; onComplete: (correct: number, total: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const apps = challenge.apps ?? [];
  const choices = challenge.choices ?? [];
  const app = apps[idx];
  const isLast = idx >= apps.length - 1;
  const [results, setResults] = useState<boolean[]>([]);

  const submit = () => {
    if (!selected) return;
    setRevealed(true);
  };
  const next = () => {
    const correct = selected === app.answer;
    setResults(p => [...p, correct]);
    setSelected(null);
    setRevealed(false);
    if (isLast) {
      const newResults = [...results, correct];
      onComplete(newResults.filter(Boolean).length, apps.length);
    } else {
      setIdx(p => p + 1);
    }
  };
  return (
    <div key={idx}>
      <div className="rounded-xl border border-slate-700/40 bg-slate-800/20 p-4 mb-4 text-center">
        <p className="text-sm font-bold text-white leading-relaxed">{app.name}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        {choices.map(c => {
          const isSelected = selected === c;
          const isRevealedCorrect = revealed && c === app.answer;
          const isRevealedWrong = revealed && isSelected && c !== app.answer;
          let cardStyle = 'border-slate-700/40 bg-slate-800/15';
          if (isRevealedCorrect) cardStyle = 'border-green-500/50 bg-green-500/8';
          else if (isRevealedWrong) cardStyle = 'border-red-500/50 bg-red-500/8';
          else if (isSelected) cardStyle = 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/8';
          return (
            <div
              key={c}
              onClick={() => !revealed && setSelected(c)}
              className={`rounded-xl border transition-all duration-300 p-3 ${!revealed ? 'cursor-pointer hover:border-[var(--brand-primary)] hover:-translate-y-0.5 hover:shadow-md hover:shadow-[var(--brand-primary)]/5' : 'cursor-default'} ${cardStyle}`}
            >
              <p className={`text-xs font-semibold leading-snug ${isRevealedCorrect ? 'text-green-300' : isRevealedWrong ? 'text-red-300' : isSelected ? 'text-white' : 'text-slate-300'}`}>
                {c}
              </p>
            </div>
          );
        })}
      </div>
      {!revealed ? (
        <button onClick={submit} disabled={!selected}
          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${selected ? 'bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)] text-white cursor-pointer' : 'bg-slate-800 text-slate-300 cursor-not-allowed'}`}>
          Submit
        </button>
      ) : (
        <div className="rounded-xl border border-slate-700/30 bg-slate-800/30 p-4" style={{ animation: 'acs-slide 0.4s ease both' }}>
          <div className={`flex items-center gap-2 mb-1.5 ${selected === app.answer ? 'text-green-400' : 'text-red-400'}`}>
            <span className="text-sm">{selected === app.answer ? '✓' : '✗'}</span>
            <span className="text-xs font-bold">{selected === app.answer ? 'Correct' : `Incorrect — answer: ${app.answer}`}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{app.explanation}</p>
          <button onClick={next}
            className={`mt-3 w-full py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${isLast ? 'bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)] text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}>
            {isLast ? 'See Results' : 'Next'}
          </button>
        </div>
      )}
      <div className="flex justify-center gap-1.5 mt-3">
        {apps.map((_, i) => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${i < idx ? (results[i] ? 'bg-green-500' : 'bg-red-500') : i === idx ? 'bg-[var(--brand-primary)]' : 'bg-slate-700'}`} />
        ))}
      </div>
    </div>
  );
}

function SituationsChallenge({ challenge, onComplete }: { challenge: AIChallenge; onComplete: (correct: number, total: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, boolean | null>>({});
  const [submitted, setSubmitted] = useState(false);
  const situations = challenge.situations ?? [];
  const choose = (i: number, val: boolean) => {
    if (submitted) return;
    setAnswers(p => ({ ...p, [i]: val }));
  };
  const submit = () => {
    setSubmitted(true);
    const correct = situations.filter((s, i) => answers[i] === s.usesAI).length;
    onComplete(correct, situations.length);
  };
  const allAnswered = situations.every((_, i) => answers[i] !== undefined);
  return (
    <div className="space-y-2">
      {situations.map((s, i) => {
        const ans = answers[i];
        const isCorrect = submitted && ans === s.usesAI;
        const isWrong = submitted && ans !== null && ans !== s.usesAI;
        return (
          <div key={i} className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-300 ${submitted ? (isCorrect ? 'border-green-500/40 bg-green-500/8' : isWrong ? 'border-red-500/40 bg-red-500/8' : 'border-slate-700/30') : ans !== undefined ? 'border-[var(--brand-primary)]/40 bg-[var(--brand-primary)]/8' : 'border-slate-700/30 bg-slate-800/15'}`}>
            <span className="text-xs text-slate-300 font-medium">{s.text}</span>
            {submitted ? (
              <span className={`text-xs font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {s.usesAI ? 'Uses AI' : 'No AI'}
              </span>
            ) : (
              <div className="flex gap-1.5">
                <button onClick={() => choose(i, true)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all duration-200 ${ans === true ? 'bg-[var(--brand-primary)] text-white' : 'bg-slate-800 text-slate-300 hover:text-slate-300'} cursor-pointer`}>
                  Uses AI
                </button>
                <button onClick={() => choose(i, false)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all duration-200 ${ans === false ? 'bg-[var(--brand-primary)] text-white' : 'bg-slate-800 text-slate-300 hover:text-slate-300'} cursor-pointer`}>
                  No AI
                </button>
              </div>
            )}
          </div>
        );
      })}
      {!submitted && (
        <button onClick={submit} disabled={!allAnswered}
          className={`mt-3 w-full py-2 rounded-xl text-xs font-bold transition-all duration-300 ${allAnswered ? 'bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)] text-white cursor-pointer' : 'bg-slate-800 text-slate-300 cursor-not-allowed'}`}>
          Submit
        </button>
      )}
    </div>
  );
}

function RulesChallenge({ challenge, onComplete }: { challenge: AIChallenge; onComplete: (correct: number, total: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const items = challenge.items ?? [];
  const choices = challenge.choices ?? ['Fixed Rules', 'Learns From Data'];
  const choose = (i: number, val: string) => {
    if (submitted) return;
    setAnswers(p => ({ ...p, [i]: val }));
  };
  const submit = () => {
    setSubmitted(true);
    const correct = items.filter((item, i) => answers[i]?.toLowerCase() === item.answer?.toLowerCase()).length;
    onComplete(correct, items.length);
  };
  const allAnswered = items.every((_, i) => answers[i] !== undefined);
  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const ans = answers[i];
        const isCorrect = submitted && ans?.toLowerCase() === item.answer?.toLowerCase();
        const isWrong = submitted && ans && ans?.toLowerCase() !== item.answer?.toLowerCase();
        const borderColor = submitted
          ? isCorrect ? 'border-green-500/50 bg-green-500/8' : 'border-red-500/50 bg-red-500/8'
          : ans ? 'border-[var(--brand-primary)]/40 bg-[var(--brand-primary)]/8' : 'border-slate-700/40 bg-slate-800/15';
        return (
          <div key={i} className={`p-3 rounded-xl border transition-all duration-500 ${borderColor}`}>
            <p className={`text-xs mb-2 leading-relaxed italic transition-colors duration-500 ${submitted ? (isCorrect ? 'text-green-300' : 'text-red-300') : 'text-slate-300'}`}>&ldquo;{item.text}&rdquo;</p>
            {submitted ? (
              <div className={`flex items-center gap-1.5 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect ? <CheckIcon /> : <XIcon />}
                <span className="text-xs font-semibold capitalize">{item.answer}</span>
              </div>
            ) : (
              <div className="flex gap-1.5">
                {choices.map(c => (
                  <button key={c} onClick={() => choose(i, c)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all duration-200 ${ans === c ? 'bg-[var(--brand-primary)] text-white' : 'bg-slate-800 text-slate-300 hover:text-slate-300'} cursor-pointer`}>
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
      {!submitted && (
        <button onClick={submit} disabled={!allAnswered}
          className={`mt-3 w-full py-2 rounded-xl text-xs font-bold transition-all duration-300 ${allAnswered ? 'bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)] text-white cursor-pointer' : 'bg-slate-800 text-slate-300 cursor-not-allowed'}`}>
          Submit
        </button>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function AIChallengeSet({ block }: { block: AIChallengeSetBlock }) {
  const [current, setCurrent] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [results, setResults] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });

  const challenges = block.challenges;
  const challenge = challenges[current];

  const handleComplete = useCallback((correct: number, total: number) => {
    setResults(p => ({ correct: p.correct + correct, total: p.total + total }));
    if (current < challenges.length - 1) {
      setCurrent(p => p + 1);
    } else {
      setCompleted(true);
    }
  }, [current, challenges.length]);

  if (completed) {
    const pct = results.total > 0 ? Math.round((results.correct / results.total) * 100) : 0;
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <style>{KEYFRAMES}</style>
        <div className="text-center" style={{ animation: 'acs-pop 0.4s ease both' }}>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-green-500 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(0,191,179,0.25)]">
            <svg className="w-6 h-6 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-white mb-1">Challenges Complete</h3>
          <p className="text-slate-300 text-xs mb-5">All AI challenges finished</p>
          <div className="flex justify-center gap-6 mb-4">
            <div className="text-center">
              <p className="text-2xl font-black text-white">{results.correct}</p>
              <p className="text-[10px] text-slate-300 mt-0.5">Correct</p>
            </div>
            <div className="w-px bg-slate-700/50" />
            <div className="text-center">
              <p className="text-2xl font-black text-white">{results.total}</p>
              <p className="text-[10px] text-slate-300 mt-0.5">Total</p>
            </div>
            <div className="w-px bg-slate-700/50" />
            <div className="text-center">
              <p className="text-2xl font-black text-white">{pct}%</p>
              <p className="text-[10px] text-slate-300 mt-0.5">Accuracy</p>
            </div>
          </div>
          <div className="w-full max-w-[200px] mx-auto h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-[var(--brand-primary)] to-green-500 transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
      <style>{KEYFRAMES}</style>

      <div className="px-6 pt-6 pb-6">
        {/* Challenge header row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5">
            {challenges.map((ch, i) => (
              <div key={ch.id} className={`w-2 h-2 rounded-full transition-all duration-400 ${
                i === current ? 'bg-[var(--brand-primary)] w-3' : i < current ? 'bg-[var(--brand-primary)]/50' : 'bg-slate-700'
              }`} />
            ))}
          </div>
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider ml-auto">Challenge {current + 1}/{challenges.length}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${diffColor(challenge.difficulty)}`}>
            {challenge.difficulty}
          </span>
        </div>

        {/* Challenge content */}
        <div key={challenge.id} style={{ animation: 'acs-pop 0.35s ease both' }}>
          <h3 className="text-base font-bold text-white mb-3">{challenge.title}</h3>

          {challenge.type === 'select_cards' && (
            <SelectCardsChallenge challenge={challenge} onComplete={handleComplete} />
          )}
          {challenge.type === 'classify' && (
            <ClassifyChallenge challenge={challenge} onComplete={handleComplete} />
          )}
          {challenge.type === 'situations' && (
            <SituationsChallenge challenge={challenge} onComplete={handleComplete} />
          )}
          {challenge.type === 'rules_vs_learning' && (
            <RulesChallenge challenge={challenge} onComplete={handleComplete} />
          )}
        </div>
      </div>
    </div>
  );
}
