import { useState, useMemo } from 'react';
import type { HillClimbExerciseConfig } from '../../types/lesson';

if (typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.textContent = `
@keyframes bounce-in { 0% { transform: scale(0); } 60% { transform: scale(1.15); } 100% { transform: scale(1); } }
@keyframes pulse-slow { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }
@keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
.anim-bounce { animation: bounce-in 0.4s ease-out forwards; }
.anim-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
.anim-fade { animation: fade-in 0.5s ease-out forwards; }
`;
  document.head.appendChild(s);
}

interface Props {
  config: HillClimbExerciseConfig;
  onComplete: () => void;
  onAttempt?: () => void;
}

type Phase = 'carousel' | 'playing' | 'complete';

export default function HillClimbExercise({ config, onComplete, onAttempt }: Props) {
  const [phase, setPhase] = useState<Phase>('carousel');
  const [slideIdx, setSlideIdx] = useState(0);
  const [currentIdx, setCurrentIdx] = useState<number | null>(null);
  const [journey, setJourney] = useState<number[]>([]);
  const [revealed, setRevealed] = useState(false);

  const totalSlides = config.slides.length;
  const isLastSlide = slideIdx === totalSlides - 1;
  const landscape = config.landscape;
  const maxVal = Math.max(...landscape);
  const globalOptimum = maxVal;
  const globalIdx = landscape.indexOf(globalOptimum);

  const currentValue = currentIdx !== null ? landscape[currentIdx] : null;

  const scenarioText = config.scenarioText || 'You are a hiker traversing a mountain range. Each position shows the elevation. You can only hike uphill to an adjacent position with higher elevation.';

  const neighbors = useMemo(() => {
    if (currentIdx === null || revealed) return [];
    const result: number[] = [];
    if (currentIdx > 0 && landscape[currentIdx - 1] > landscape[currentIdx]) result.push(currentIdx - 1);
    if (currentIdx < landscape.length - 1 && landscape[currentIdx + 1] > landscape[currentIdx]) result.push(currentIdx + 1);
    return result;
  }, [currentIdx, revealed, landscape]);

  const isLocalOptimum = currentIdx !== null && neighbors.length === 0 && !revealed;

  const handleSlideNext = () => {
    if (isLastSlide) {
      setPhase('playing');
    } else {
      setSlideIdx(i => i + 1);
    }
  };

  const handleSelectStart = (idx: number) => {
    if (currentIdx !== null) return;
    setCurrentIdx(idx);
    setJourney([idx]);
    onAttempt?.();
  };

  const handleMove = (idx: number) => {
    if (currentIdx === null || revealed) return;
    setCurrentIdx(idx);
    setJourney(j => [...j, idx]);
    onAttempt?.();
  };

  const handleReveal = () => {
    setRevealed(true);
    onAttempt?.();
  };

  const handleContinue = () => {
    setPhase('complete');
  };

  const handleTryAgain = () => {
    setCurrentIdx(null);
    setJourney([]);
    setRevealed(false);
    setPhase('carousel');
    setSlideIdx(0);
  };

  if (phase === 'carousel') {
    const slide = config.slides[slideIdx];
    return (
      <div className="rounded-2xl border border-[var(--brand-primary)]/20 bg-gradient-to-br from-[var(--brand-primary)]/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-700/20 flex items-center justify-between">
          <p className="text-xs font-semibold text-[var(--brand-primary)] uppercase tracking-wider">Hill Climbing</p>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${
                i === slideIdx ? 'bg-[var(--brand-primary)] scale-125 shadow-sm shadow-[var(--brand-primary)]/50' : i < slideIdx ? 'bg-[var(--brand-primary)]/60' : 'bg-slate-600/50'
              }`} />
            ))}
          </div>
        </div>
        <div className="px-6 pt-2 pb-6">
          <div className="mx-auto text-center">
            <div className="flex justify-center mb-4">
              {slideIdx === 0 && (
                <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                  <polyline points="6,38 12,30 18,32 24,20 30,22 36,12 42,14" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <circle cx="24" cy="20" r="2" fill="#f59e0b" />
                  <circle cx="36" cy="12" r="2" fill="#34d399" />
                </svg>
              )}
              {slideIdx === 1 && (
                <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                  <rect x="6" y="32" width="6" height="10" rx="1" fill="#f59e0b" fillOpacity="0.3" stroke="#f59e0b" strokeWidth="1" />
                  <text x="9" y="46" fontSize="5" fill="#94a3b8" textAnchor="middle">1</text>
                  <rect x="14" y="24" width="6" height="18" rx="1" fill="#f59e0b" fillOpacity="0.4" stroke="#f59e0b" strokeWidth="1" />
                  <text x="17" y="46" fontSize="5" fill="#94a3b8" textAnchor="middle">3</text>
                  <rect x="22" y="14" width="6" height="28" rx="1" fill="#f59e0b" fillOpacity="0.5" stroke="#f59e0b" strokeWidth="1" />
                  <text x="25" y="46" fontSize="5" fill="#94a3b8" textAnchor="middle">6</text>
                  <rect x="30" y="8" width="6" height="34" rx="1" fill="#34d399" fillOpacity="0.4" stroke="#34d399" strokeWidth="1" />
                  <text x="33" y="46" fontSize="5" fill="#94a3b8" textAnchor="middle">9</text>
                  <rect x="38" y="18" width="6" height="24" rx="1" fill="#f59e0b" fillOpacity="0.3" stroke="#f59e0b" strokeWidth="1" />
                  <text x="41" y="46" fontSize="5" fill="#94a3b8" textAnchor="middle">7</text>
                </svg>
              )}
              {slideIdx === 2 && (
                <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                  <polyline points="6,36 16,28 24,30 32,18 42,22" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray="3 2" />
                  <circle cx="16" cy="28" r="3" fill="#f59e0b" />
                  <text x="16" y="24" fontSize="5" fill="#f59e0b" textAnchor="middle">Local</text>
                  <circle cx="32" cy="18" r="3" fill="#34d399" />
                  <text x="32" y="14" fontSize="5" fill="#34d399" textAnchor="middle">Global</text>
                </svg>
              )}
            </div>
            <h3 className="text-lg font-bold text-white">{slide.title}</h3>
            <p className="mt-4 text-sm text-slate-300 leading-relaxed whitespace-pre-line max-w-md mx-auto">{slide.body}</p>
            <div className="mt-7">
              <button onClick={handleSlideNext} className="inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-2.5 rounded-lg bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] hover:scale-[1.03] hover:-translate-y-0.5 duration-[280ms] transition-all shadow-lg shadow-[var(--brand-primary)]/20">
                {isLastSlide ? 'Start Exercise' : 'Next'}
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'complete') {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-5 bg-slate-800/40 border-b border-slate-700/20 text-center">
          <p className="text-sm font-bold text-emerald-300 uppercase tracking-wider">Exercise Complete</p>
        </div>
        <div className="p-6 space-y-5">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-bold text-white">{config.completionTitle}</h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{config.completionMessage}</p>
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            {config.takeaways.map((t, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="20,6 9,17 4,12" /></svg>
                {t}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button onClick={handleTryAgain} className="px-4 py-2 text-xs font-semibold text-slate-300 rounded-lg border border-slate-700/50 bg-slate-800/50 hover:bg-slate-700/50 transition-all">
              Try Again
            </button>
            <button onClick={onComplete} className="px-5 py-2 text-xs font-semibold text-white rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 transition-all shadow-lg shadow-emerald-600/20">
              Continue Learning
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--brand-primary)]/20 bg-gradient-to-br from-[var(--brand-primary)]/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
      <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-700/20">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-[var(--brand-primary)] uppercase tracking-wider">Hill Climbing</p>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-700/40">
              <span className="text-[10px] text-slate-300">Steps: </span>
              <span className="text-xs font-bold text-white">{journey.length}</span>
            </div>
            {currentValue !== null && (
              <div className="px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-700/40">
                <span className="text-[10px] text-slate-300">Value: </span>
                <span className="text-xs font-bold text-[var(--brand-primary)]">{currentValue}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="max-w-lg mx-auto space-y-5">
          {/* Scenario */}
          <div className="rounded-xl bg-gradient-to-br from-[var(--brand-primary)]/10 to-slate-800/40 border border-[var(--brand-primary)]/20 p-4">
            <p className="text-xs font-semibold text-[var(--brand-primary)] uppercase tracking-wider mb-1.5 flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Scenario
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">{scenarioText}</p>
          </div>

          <div className="rounded-xl bg-slate-900/60 border border-slate-700/40 p-4">
            <p className="text-[9px] text-slate-300 uppercase tracking-wider mb-2 text-center">Mountain Profile</p>
            <svg viewBox="0 0 280 120" className="w-full max-w-xs mx-auto" style={{ height: '140px' }}>
              <defs>
                <linearGradient id="hillFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              {landscape.map((v, i) => {
                const px = 20 + i * 40;
                const py = 110 - (v / maxVal) * 90;
                return { px, py, i };
              }).map(({ px, py, i }, idx) => {
                const isCurrent = currentIdx === i;
                const isJourney = journey.includes(i);

                let lineColor = '#475569';
                if (isCurrent || isJourney) lineColor = '#f59e0b';

                return (
                  <g key={i}>
                    {idx > 0 && (
                      <line
                        x1={landscape.map((_, j) => 20 + j * 40)[idx - 1]}
                        y1={landscape.map((val, _j) => 110 - (val / maxVal) * 90)[idx - 1]}
                        x2={px} y2={py}
                        stroke={isJourney || isCurrent ? lineColor : '#334155'}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                      />
                    )}
                    {idx === 0 && (
                      <line x1={20} y1={110} x2={px} y2={py} stroke="#1e293b" strokeWidth={1} />
                    )}
                    {idx === landscape.length - 1 && (
                      <line x1={px} y1={py} x2={260} y2={110} stroke="#1e293b" strokeWidth={1} />
                    )}
                  </g>
                );
              })}
              {landscape.map((v, i) => {
                const dx = 20 + i * 40;
                const dy = 110 - (v / maxVal) * 90;

                const isCurrent = currentIdx === i;
                const isJourney = journey.includes(i);
                const canStart = currentIdx === null;
                const canMove = neighbors.includes(i);
                const isFinal = revealed && i === globalIdx;

                let dotColor = '#475569';
                let labelColor = '#64748b';
                let dotR = 5;

                if (isCurrent) { dotColor = '#f59e0b'; labelColor = '#fbbf24'; dotR = 8; }
                else if (isJourney) { dotColor = '#d97706'; labelColor = '#f59e0b'; }
                else if (isFinal) { dotColor = '#34d399'; labelColor = '#34d399'; }
                else if (canMove) { dotColor = '#f59e0b'; labelColor = '#fbbf24'; dotR = 7; }
                else if (canStart) { dotColor = '#475569'; labelColor = '#94a3b8'; }

                return (
                  <g key={`dot-${i}`} onClick={() => { if (canStart) handleSelectStart(i); else if (canMove) handleMove(i); }} style={{ cursor: canStart || canMove ? 'pointer' : 'default' }}>
                    <text x={dx} y={dy - 12} textAnchor="middle" fontSize="9" fill={labelColor} fontFamily="monospace" fontWeight="bold">{v}</text>
                    <circle cx={dx} cy={dy} r={dotR} fill={dotColor} className={isCurrent ? 'anim-bounce' : ''} />
                    {isCurrent && <circle cx={dx} cy={dy} r={dotR + 4} fill="none" stroke="#f59e0b" strokeWidth="1" className="anim-pulse-slow" />}
                    <text x={dx} y={120} textAnchor="middle" fontSize="9" fill={labelColor} fontFamily="monospace" dy="0">▲</text>
                    <text x={dx} y={120} textAnchor="middle" fontSize="8" fill={labelColor} fontFamily="monospace" dy="10">{i}</text>
                  </g>
                );
              })}
            </svg>
          </div>

          {currentIdx !== null && (
            <div className="flex gap-3">
              <div className="flex-1 rounded-xl bg-slate-900/60 border border-slate-700/40 p-3">
                <p className="text-[9px] text-slate-300 uppercase tracking-wider mb-1">Position</p>
                <p className="text-sm font-bold text-white">
                  Index {currentIdx}
                  {revealed && currentIdx === globalIdx && (
                    <span className="ml-2 text-[10px] text-emerald-400 font-normal">(Global Optimum)</span>
                  )}
                </p>
                <p className="text-xs text-slate-300 mt-1">Value: <span className="font-bold text-[var(--brand-primary)]">{currentValue}</span></p>
              </div>
              <div className="flex-1 rounded-xl bg-slate-900/60 border border-slate-700/40 p-3">
                <p className="text-[9px] text-slate-300 uppercase tracking-wider mb-1">Rules</p>
                <ul className="space-y-0.5">
                  <li className="text-[10px] text-slate-300 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-[var(--brand-primary)]" />
                    Adjacent only
                  </li>
                  <li className="text-[10px] text-slate-300 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-[var(--brand-primary)]" />
                    Must be higher
                  </li>
                  <li className="text-[10px] text-slate-300 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-[var(--brand-primary)]" />
                    Stop when stuck
                  </li>
                </ul>
              </div>
            </div>
          )}

          {journey.length > 1 && (
            <div className="rounded-xl bg-slate-900/60 border border-slate-700/40 p-3">
              <p className="text-[9px] text-slate-300 uppercase tracking-wider mb-1.5">Journey</p>
              <div className="flex items-center gap-1 flex-wrap">
                {journey.map((idx, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className="text-xs font-mono font-bold text-[var(--brand-primary)]">{landscape[idx]}</span>
                    <span className="text-[10px] text-slate-300">(@{idx})</span>
                    {i < journey.length - 1 && <span className="text-xs text-slate-300">→</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {isLocalOptimum && (
            <div className="rounded-xl bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/30 p-4 space-y-2">
              <p className="text-xs font-bold text-[var(--brand-primary)]">Local Optimum Reached</p>
              <p className="text-sm text-slate-300 leading-relaxed">
                No adjacent position has a higher value. Hill Climbing stops here.
                {currentIdx !== globalIdx && (
                  <> The highest value in the landscape is <span className="font-bold text-emerald-400">{globalOptimum}</span> at index {globalIdx}.</>
                )}
              </p>
              <button onClick={handleReveal} className="text-xs font-semibold text-white px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-primary)] hover:from-[var(--brand-primary)] hover:to-[var(--brand-primary)] hover:scale-[1.03] hover:-translate-y-0.5 duration-[280ms] transition-all">
                {currentIdx === globalIdx ? 'Confirm Result' : 'Reveal Global Optimum'}
              </button>
            </div>
          )}

          {revealed && (
            <div className={`rounded-xl p-4 space-y-2 ${
              currentIdx === globalIdx ? 'bg-emerald-900/15 border border-emerald-500/30' : 'bg-blue-900/15 border border-blue-500/30'
            }`}>
              <p className={`text-xs font-bold ${currentIdx === globalIdx ? 'text-emerald-300' : 'text-blue-300'}`}>
                {currentIdx === globalIdx
                  ? 'Hill Climbing found the Global Optimum. Every move improved the score until the highest peak was reached.'
                  : `Hill Climbing stopped at a Local Optimum. The Global Optimum (${globalOptimum}) at index ${globalIdx} was never reached because every adjacent move would have decreased the value.`}
              </p>
              <button onClick={handleContinue} className="text-xs font-semibold text-white px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 transition-all shadow-lg shadow-emerald-600/20">
                See Summary
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
