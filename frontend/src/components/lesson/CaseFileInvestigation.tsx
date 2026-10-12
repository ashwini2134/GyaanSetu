import { useState, useRef } from 'react';
import type { CaseFileInvestigationConfig } from '../../types/lesson';

if (typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.textContent = `
@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes pulse-slow { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }
@keyframes scale-in { 0% { transform: scale(0.6); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
@keyframes scan-line { 0%,100% { transform: translateY(0); } 50% { transform: translateY(18px); } }
@keyframes orbit { 0% { transform: rotate(0deg) translateX(10px) rotate(0deg); } 100% { transform: rotate(360deg) translateX(10px) rotate(-360deg); } }
@keyframes draw-check { 0% { stroke-dashoffset: 30; } 100% { stroke-dashoffset: 0; } }
@keyframes glow { 0%,100% { filter: drop-shadow(0 0 2px rgba(251,191,36,0.3)); } 50% { filter: drop-shadow(0 0 8px rgba(251,191,36,0.6)); } }
.anim-float { animation: float 3s ease-in-out infinite; }
.anim-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; transform-origin: center; }
.anim-scale-in { animation: scale-in 0.6s ease-out forwards; }
.anim-scan { animation: scan-line 1.8s ease-in-out infinite; }
.anim-glow { animation: glow 2s ease-in-out infinite; }
.anim-check { stroke-dasharray: 30; animation: draw-check 1s ease-out forwards; }
`;
  document.head.appendChild(s);
}

interface Props {
  config: CaseFileInvestigationConfig;
  onComplete: () => void;
  onAttempt?: () => void;
}

type Phase = 'carousel' | 'investigation' | 'complete';

function MagnifyingGlass({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none">
      <circle cx="17" cy="17" r="10" stroke="currentColor" strokeWidth="2.5" className="text-amber-400" />
      <line x1="24" y1="24" x2="33" y2="33" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-amber-400" />
      <circle cx="17" cy="17" r="4" fill="currentColor" className="text-amber-300/30" />
    </svg>
  );
}

function FileIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none">
      <rect x="6" y="4" width="28" height="32" rx="3" stroke="currentColor" strokeWidth="1.5" className="text-amber-500" />
      <rect x="6" y="4" width="28" height="6" rx="1" fill="currentColor" className="text-amber-500/30" />
      <line x1="12" y1="16" x2="28" y2="16" stroke="currentColor" strokeWidth="1.5" className="text-amber-500/40" />
      <line x1="12" y1="22" x2="24" y2="22" stroke="currentColor" strokeWidth="1.5" className="text-amber-500/40" />
    </svg>
  );
}

function ScaleIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none">
      <path d="M4 32 A16 16 0 0 1 36 32" stroke="currentColor" strokeWidth="2" className="text-amber-400" />
      <line x1="20" y1="32" x2="20" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-amber-400" />
      <circle cx="20" cy="12" r="3" fill="currentColor" className="text-amber-400" />
      <text x="8" y="36" fontSize="6" fill="#64748b" fontFamily="monospace">0%</text>
      <text x="28" y="36" fontSize="6" fill="#64748b" fontFamily="monospace">100%</text>
    </svg>
  );
}

const PREDICTION_LABELS: Record<string, { label: string; icon: string }> = {
  increase: { label: 'Increase', icon: 'M12 5l7 7-7 7' },
  decrease: { label: 'Decrease', icon: 'M12 19l7-7-7-7' },
  stay_similar: { label: 'Stay Similar', icon: 'M5 12h14' },
};

const EVIDENCE_VISUALS: Record<string, { color: string; visual: React.ReactNode }> = {
  xray: { color: 'text-amber-400', visual: (
    <svg className="w-14 h-14" viewBox="0 0 60 60" fill="none">
      <rect x="6" y="12" width="48" height="36" rx="4" stroke="#f59e0b" strokeWidth="1.5" fill="#0f172a" />
      <rect x="10" y="16" width="40" height="28" rx="2" stroke="#f59e0b/20" strokeWidth="1" fill="#0f172a" />
      <rect x="24" y="18" width="12" height="24" rx="1" fill="#1e293b" stroke="#f59e0b/30" strokeWidth="1" />
      <circle cx="30" cy="30" r="5" stroke="#f59e0b" strokeWidth="1.5" fill="none" className="anim-glow" />
      <line x1="14" y1="30" x2="20" y2="30" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      <line x1="40" y1="30" x2="46" y2="30" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      <line x1="10" y1="24" x2="50" y2="24" stroke="#f59e0b/40" strokeWidth="1" strokeLinecap="round" className="anim-scan" />
      <line x1="10" y1="42" x2="50" y2="42" stroke="#f59e0b/40" strokeWidth="1" strokeLinecap="round" className="anim-scan" style={{ animationDelay: '0.3s' }} />
    </svg>
  )},
  'passenger-history': { color: 'text-blue-400', visual: (
    <svg className="w-14 h-14" viewBox="0 0 60 60" fill="none">
      <rect x="10" y="6" width="40" height="48" rx="4" stroke="#60a5fa" strokeWidth="1.5" fill="#0f172a" className="anim-float" />
      <rect x="14" y="8" width="32" height="4" rx="1" fill="#60a5fa/20" />
      <circle cx="30" cy="22" r="6" stroke="#60a5fa" strokeWidth="1.5" fill="none" />
      <circle cx="30" cy="21" r="3" fill="#60a5fa/30" />
      <path d="M18 44 Q18 34 30 34 Q42 34 42 44" stroke="#60a5fa" strokeWidth="1.5" fill="none" />
      <line x1="20" y1="12" x2="26" y2="12" stroke="#60a5fa/40" strokeWidth="1" strokeLinecap="round" />
      <line x1="20" y1="14" x2="24" y2="14" stroke="#60a5fa/20" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )},
  'manual-inspection': { color: 'text-red-400', visual: (
    <svg className="w-14 h-14" viewBox="0 0 60 60" fill="none">
      <rect x="16" y="10" width="28" height="28" rx="3" stroke="#f87171" strokeWidth="1.5" fill="#0f172a" />
      <circle cx="26" cy="16" r="3" stroke="#f87171/60" strokeWidth="1" fill="none" className="anim-pulse-slow" />
      <circle cx="20" cy="22" r="2" fill="#f87171/30" />
      <line x1="30" y1="12" x2="34" y2="8" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="34" y1="8" x2="46" y2="20" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
      <line x1="46" y1="20" x2="52" y2="26" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
      <circle cx="52" cy="26" r="3" fill="#f87171/20" />
      <line x1="32" y1="38" x2="48" y2="54" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="48" y1="54" x2="55" y2="47" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )},
  'final-inspection': { color: 'text-emerald-400', visual: (
    <svg className="w-14 h-14" viewBox="0 0 60 60" fill="none">
      <circle cx="30" cy="30" r="22" stroke="#34d399" strokeWidth="2" fill="#0f172a" className="anim-scale-in" />
      <circle cx="30" cy="30" r="18" stroke="#34d399/20" strokeWidth="1" fill="none" className="anim-pulse-slow" style={{ animationDelay: '0.3s' }} />
      <polyline points="20,30 27,38 40,22" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" className="anim-check" />
      <line x1="10" y1="52" x2="50" y2="52" stroke="#34d399/30" strokeWidth="1" strokeLinecap="round" strokeDasharray="4 4" />
      <line x1="10" y1="54" x2="46" y2="54" stroke="#34d399/15" strokeWidth="1" strokeLinecap="round" strokeDasharray="3 5" />
    </svg>
  )},
};

export default function CaseFileInvestigation({ config, onComplete, onAttempt }: Props) {
  const [phase, setPhase] = useState<Phase>('carousel');
  const [slideIdx, setSlideIdx] = useState(0);
  const [evidenceIdx, setEvidenceIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [displayBelief, setDisplayBelief] = useState(config.initialBelief);
  const beliefRef = useRef(config.initialBelief);
  const [showResults, setShowResults] = useState(false);

  const totalSlides = config.slides.length;
  const isLastSlide = slideIdx === totalSlides - 1;
  const currentEvidence = config.evidences[evidenceIdx];
  const totalEvidences = config.evidences.length;
  const isLastEvidence = evidenceIdx >= totalEvidences - 1;

  const handleSlideNext = () => {
    if (isLastSlide) {
      setPhase('investigation');
    } else {
      setSlideIdx(i => i + 1);
    }
  };

  const animateBelief = (target: number) => {
    const start = beliefRef.current;
    const duration = 800;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (target - start) * eased;
      setDisplayBelief(current);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        beliefRef.current = target;
      }
    };

    requestAnimationFrame(tick);
  };

  const handleSelect = (val: string) => {
    if (submitted) return;
    setSelected(val);
  };

  const handleSubmit = () => {
    if (!selected || !currentEvidence || submitted) return;
    setSubmitted(true);
    onAttempt?.();
    animateBelief(currentEvidence.newBelief);
  };

  const handleNextEvidence = () => {
    if (isLastEvidence) {
      setShowResults(true);
    } else {
      setEvidenceIdx(i => i + 1);
      setSelected(null);
      setSubmitted(false);
    }
  };

  const handleTryAgain = () => {
    setSlideIdx(0);
    setPhase('carousel');
    setEvidenceIdx(0);
    setSelected(null);
    setSubmitted(false);
    setDisplayBelief(config.initialBelief);
    beliefRef.current = config.initialBelief;
    setShowResults(false);
  };

  const handleComplete = () => {
    onComplete();
  };

  if (phase === 'complete' || (showResults && phase === 'investigation')) {
    if (showResults && phase === 'investigation') {
      return (
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
          <div className="px-5 py-5 bg-slate-800/40 border-b border-slate-700/20 text-center">
            <svg className="w-10 h-10 mx-auto text-emerald-400 mb-1" viewBox="0 0 40 40" fill="none">
              <rect x="6" y="4" width="28" height="32" rx="3" stroke="currentColor" strokeWidth="1.5" />
              <line x1="12" y1="14" x2="28" y2="14" stroke="currentColor" strokeWidth="1.5" />
              <polyline points="16,22 20,26 28,18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-sm font-bold text-emerald-300 uppercase tracking-wider">{config.completionTitle}</p>
          </div>
          <div className="p-6 space-y-5">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-white">{config.completionTitle}</h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{config.completionMessage}</p>
            </div>

            <div className="max-w-md mx-auto space-y-2">
              {config.evidences.map((ev, i) => {
                const prevBelief = i === 0 ? config.initialBelief : config.evidences[i - 1].newBelief;
                return (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/30">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-700/50 text-xs font-bold text-amber-300 border border-slate-600/50">{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-300 truncate">{ev.title}</p>
                      <p className="text-[10px] text-slate-300">{Math.round(prevBelief * 100)}% → {Math.round(ev.newBelief * 100)}%</p>
                    </div>
                    <svg className={`w-4 h-4 flex-shrink-0 ${ev.newBelief > prevBelief ? 'text-emerald-400' : ev.newBelief < prevBelief ? 'text-red-400' : 'text-slate-300'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      {ev.newBelief > prevBelief
                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M12 5l7 7-7 7" />
                        : ev.newBelief < prevBelief
                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l7-7-7-7" />
                        : <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                      }
                    </svg>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button onClick={handleTryAgain} className="px-4 py-2 text-xs font-semibold text-slate-300 rounded-lg border border-slate-700/50 bg-slate-800/50 hover:bg-slate-700/50 transition-all">
                Try Again
              </button>
              <button onClick={handleComplete} className="px-5 py-2 text-xs font-semibold text-white rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 transition-all shadow-lg shadow-emerald-600/20">
                Continue Learning
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  if (phase === 'carousel') {
    const slide = config.slides[slideIdx];
    return (
      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-700/20 flex items-center justify-between">
          <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Case File Investigation</p>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${
                i === slideIdx ? 'bg-amber-400 scale-125 shadow-sm shadow-amber-400/50' : i < slideIdx ? 'bg-amber-600/60' : 'bg-slate-600/50'
              }`} />
            ))}
          </div>
        </div>
        <div className="px-6 pt-2 pb-6">
          <div className="mx-auto text-center">
            <div className="flex justify-center mb-4">
              {slideIdx === 0 && (
                <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                  <circle cx="20" cy="20" r="10" stroke="#f59e0b" strokeWidth="2" fill="#f59e0b" fillOpacity="0.1" />
                  <line x1="27" y1="27" x2="36" y2="36" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              )}
              {slideIdx === 1 && (
                <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                  <rect x="8" y="14" width="32" height="22" rx="2" stroke="#3b82f6" strokeWidth="1.5" fill="#3b82f6" fillOpacity="0.1" />
                  <path d="M8 20h32" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.3" />
                  <circle cx="28" cy="28" r="2" fill="#3b82f6" fillOpacity="0.4" />
                  <circle cx="34" cy="28" r="2" fill="#3b82f6" fillOpacity="0.4" />
                </svg>
              )}
              {slideIdx === 2 && (
                <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="16" stroke="#22c55e" strokeWidth="1.5" fill="#22c55e" fillOpacity="0.1" />
                  <polyline points="16,24 21,29 32,18" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              )}
            </div>
            <h3 className="text-lg font-bold text-white">{slide.title}</h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line mt-4 max-w-md mx-auto">{slide.body}</p>
            <div className="mt-7"><button onClick={handleSlideNext} className="inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 transition-all shadow-lg shadow-amber-600/20">
              {isLastSlide ? 'Start Investigation' : 'Next'}
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentEvidence) return null;

  const isCorrect = submitted && selected === currentEvidence.correct;
  const prevBelief = evidenceIdx === 0 ? config.initialBelief : config.evidences[evidenceIdx - 1].newBelief;
  const arrowColor = displayBelief > prevBelief ? 'text-emerald-400' : displayBelief < prevBelief ? 'text-red-400' : 'text-slate-300';

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
      <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-700/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileIcon className="w-5 h-5 text-amber-400" />
          <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Evidence {evidenceIdx + 1} of {totalEvidences}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalEvidences }).map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${
              i < evidenceIdx ? 'bg-emerald-500' : i === evidenceIdx ? 'bg-amber-400 scale-125 shadow-sm shadow-amber-400/50' : 'bg-slate-600'
            }`} />
          ))}
        </div>
      </div>

      <div className="p-5">
        <div className="max-w-2xl mx-auto flex gap-6">
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="relative w-8 h-48 rounded-full bg-slate-800 overflow-hidden border border-slate-700/30">
              <div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-600 via-amber-500 to-green-500 transition-all rounded-full"
                style={{ height: `${displayBelief * 100}%`, transition: 'height 0.1s linear' }}
              />
            </div>
            <span className="font-mono text-lg font-bold text-white">{Math.round(displayBelief * 100)}%</span>
            <span className="text-[10px] text-slate-300 uppercase tracking-wider">Belief</span>
            {submitted && (
              <svg className={`w-5 h-5 ${arrowColor} animate-bounce`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                {displayBelief > prevBelief
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M12 5l7 7-7 7" />
                  : displayBelief < prevBelief
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l7-7-7-7" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                }
              </svg>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-4">
            <div className="rounded-xl bg-slate-900/60 border border-slate-700/40 p-4">
              <div className="flex items-start gap-3 mb-2">
                {EVIDENCE_VISUALS[currentEvidence.id]?.visual}
                <div>
                  <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">{currentEvidence.title}</p>
                  <p className="text-sm text-slate-200 leading-relaxed mt-1">{currentEvidence.evidence}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700/30">
                <p className="text-xs text-slate-300">{currentEvidence.question}</p>
              </div>
            </div>

            {!submitted && (
              <div className="flex gap-2">
                {(['increase', 'decrease', 'stay_similar'] as const).map((val) => {
                  const pl = PREDICTION_LABELS[val];
                  const active = selected === val;
                  return (
                    <button
                      key={val}
                      onClick={() => handleSelect(val)}
                      className={`flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        active
                          ? 'bg-amber-900/20 border-amber-500/50 text-amber-300'
                          : 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-700/40 hover:border-slate-500/50'
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d={pl.icon} />
                      </svg>
                      {pl.label}
                    </button>
                  );
                })}
              </div>
            )}

            {!submitted && selected && (
              <button onClick={handleSubmit} className="w-full text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 transition-all shadow-lg shadow-amber-600/20">
                Submit Prediction
              </button>
            )}

            {submitted && (
              <div className={`rounded-xl p-4 border space-y-2 ${
                isCorrect ? 'bg-emerald-900/15 border-emerald-500/30' : 'bg-amber-900/15 border-amber-500/30'
              }`}>
                <p className={`text-xs font-bold flex items-center gap-1.5 ${
                  isCorrect ? 'text-emerald-300' : 'text-amber-300'
                }`}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    {isCorrect
                      ? <polyline points="20 6 9 17 4 12" />
                      : <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>
                    }
                  </svg>
                  {isCorrect ? 'Good reasoning.' : 'Think about whether this evidence strengthens or weakens the previous conclusion.'}
                </p>
                <p className="text-sm text-slate-300 leading-relaxed pl-6">{currentEvidence.explanation}</p>
                <button onClick={handleNextEvidence} className="mt-2 ml-6 inline-flex items-center gap-2 text-xs font-semibold text-white px-4 py-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 transition-all">
                  {isLastEvidence ? 'Close Case' : 'Next Evidence'}
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
