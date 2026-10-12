import { useState, useCallback, useRef } from 'react';
import type { ConfidenceChallengeConfig, ConfidenceScenario } from '../../types/lesson';

if (typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.textContent = `
@keyframes coin-flip { 0%,100% { transform: rotateY(0); } 50% { transform: rotateY(180deg); } }
@keyframes die-bounce { 0%,100% { transform: translateY(0); } 25% { transform: translateY(-6px); } 50% { transform: translateY(0); } 75% { transform: translateY(-3px); } }
@keyframes card-glide { 0% { transform: translateX(-20px) rotate(-5deg); opacity: 0; } 100% { transform: translateX(0) rotate(0); opacity: 1; } }
@keyframes dice-shake { 0%,100% { transform: translate(0); } 20% { transform: translate(-2px,1px); } 40% { transform: translate(2px,-1px); } 60% { transform: translate(-1px,2px); } 80% { transform: translate(1px,-2px); } }
@keyframes sun-pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.08); opacity: 0.8; } }
.anim-coin { animation: coin-flip 2s ease-in-out infinite; transform-style: preserve-3d; }
.anim-die { animation: die-bounce 1.5s ease-in-out infinite; }
.anim-card { animation: card-glide 0.8s ease-out forwards; }
.anim-dice { animation: dice-shake 0.8s ease-in-out infinite; }
.anim-sun { animation: sun-pulse 2s ease-in-out infinite; transform-origin: center; }
`;
  document.head.appendChild(s);
}

interface Props {
  config: ConfidenceChallengeConfig;
  onComplete: () => void;
  onAttempt?: () => void;
}

type Phase = 'carousel' | 'scenario' | 'complete';

function getLabel(value: number): string {
  if (value <= 0.05) return 'Impossible';
  if (value <= 0.25) return 'Very Unlikely';
  if (value <= 0.55) return 'Possible';
  if (value <= 0.85) return 'Likely';
  return 'Certain';
}

function evaluateConfidence(value: number, min: number, max: number, closeThreshold: number, farThreshold: number): { verdict: 'close' | 'reasonable' | 'far'; message: string } {
  if (value >= min && value <= max) {
    return { verdict: 'close', message: 'Your estimate is very close. Good reasoning.' };
  }
  const dist = Math.min(Math.abs(value - min), Math.abs(value - max));
  if (dist <= closeThreshold) {
    return { verdict: 'close', message: 'Your estimate is very close. Good reasoning.' };
  }
  if (dist <= farThreshold) {
    const direction = value < min ? 'higher' : 'lower';
    return { verdict: 'reasonable', message: `Your estimate is reasonable. Here is why experts usually choose a value ${direction} — ` };
  }
  return { verdict: 'far', message: 'Think about how much uncertainty exists in this situation.' };
}

function ScenarioVisual({ scenario }: { scenario: ConfidenceScenario }) {
  const cn = 'w-14 h-14';
  switch (scenario.id) {
    case 'coin-flip':
      return (
        <svg viewBox="0 0 60 60" className={`${cn} anim-coin`}>
          <circle cx="30" cy="30" r="26" fill="none" stroke="#f59e0b" strokeWidth="2" />
          <circle cx="30" cy="30" r="24" fill="#1e293b" stroke="#f59e0b" strokeWidth="1" />
          <text x="30" y="36" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#fbbf24" fontFamily="monospace">H</text>
        </svg>
      );
    case 'die-roll':
      return (
        <svg viewBox="0 0 60 60" className={`${cn} anim-die`}>
          <rect x="6" y="6" width="48" height="48" rx="8" fill="#1e293b" stroke="#8b5cf6" strokeWidth="2" />
          <circle cx="18" cy="18" r="3" fill="#a78bfa" />
          <circle cx="30" cy="30" r="3" fill="#a78bfa" />
          <circle cx="42" cy="42" r="3" fill="#a78bfa" />
        </svg>
      );
    case 'card-draw':
      return (
        <svg viewBox="0 0 60 60" className={`${cn} anim-card`}>
          <rect x="10" y="6" width="40" height="52" rx="4" fill="#1e293b" stroke="#ef4444" strokeWidth="1.5" />
          <text x="30" y="36" textAnchor="middle" fontSize="20" fill="#ef4444" fontFamily="serif">&hearts;</text>
        </svg>
      );
    case 'dice-doubles':
      return (
        <svg viewBox="0 0 60 60" className={`${cn} anim-dice`}>
          <rect x="3" y="6" width="24" height="24" rx="4" fill="#1e293b" stroke="#8b5cf6" strokeWidth="1.5" />
          <circle cx="9" cy="12" r="2" fill="#a78bfa" />
          <circle cx="21" cy="24" r="2" fill="#a78bfa" />
          <rect x="33" y="6" width="24" height="24" rx="4" fill="#1e293b" stroke="#8b5cf6" strokeWidth="1.5" />
          <circle cx="39" cy="12" r="2" fill="#a78bfa" />
          <circle cx="51" cy="24" r="2" fill="#a78bfa" />
        </svg>
      );
    case 'at-least-heart':
      return (
        <svg viewBox="0 0 60 60" className={`${cn}`}>
          <rect x="6" y="8" width="22" height="30" rx="3" fill="#1e293b" stroke="#ef4444" strokeWidth="1.5" className="anim-card" style={{ animationDelay: '0s' }} />
          <text x="17" y="29" textAnchor="middle" fontSize="12" fill="#ef4444" fontFamily="serif">&hearts;</text>
          <rect x="32" y="8" width="22" height="30" rx="3" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" className="anim-card" style={{ animationDelay: '0.3s' }} />
          <text x="43" y="29" textAnchor="middle" fontSize="12" fill="#64748b" fontFamily="serif">?</text>
        </svg>
      );
    case 'forecast':
      return (
        <svg viewBox="0 0 60 60" className={`${cn} anim-sun`}>
          <circle cx="30" cy="26" r="12" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
          <line x1="30" y1="6" x2="30" y2="12" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="30" y1="40" x2="30" y2="46" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="10" y1="26" x2="16" y2="26" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="44" y1="26" x2="50" y2="26" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="16" y1="12" x2="20" y2="16" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="40" y1="36" x2="44" y2="40" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="44" y1="12" x2="40" y2="16" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="20" y1="36" x2="16" y2="40" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

export default function ConfidenceChallenge({ config, onComplete, onAttempt }: Props) {
  const [phase, setPhase] = useState<Phase>('carousel');
  const [slideIdx, setSlideIdx] = useState(0);
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [sliderValue, setSliderValue] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<{ value: number; verdict: string; message: string }[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);

  const scenario = config.scenarios[scenarioIdx];
  const totalScenarios = config.scenarios.length;
  const totalSlides = config.slides.length;
  const isLastSlide = slideIdx === totalSlides - 1;

  const handleSlideNext = () => {
    if (isLastSlide) {
      setPhase('scenario');
    } else {
      setSlideIdx(i => i + 1);
    }
  };

  const handleSliderChange = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!trackRef.current || submitted) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    let val = (clientX - rect.left) / rect.width;
    val = Math.max(0, Math.min(1, Math.round(val * 100) / 100));
    setSliderValue(val);
  }, [submitted]);

  const handleSubmit = () => {
    if (!scenario || submitted) return;
    const evaluation = evaluateConfidence(sliderValue, scenario.expectedMin, scenario.expectedMax, config.closeThreshold, config.farThreshold);
    setResults(prev => [...prev, { value: sliderValue, verdict: evaluation.verdict, message: evaluation.message }]);
    setSubmitted(true);
    onAttempt?.();
  };

  const handleNext = () => {
    if (scenarioIdx + 1 >= totalScenarios) {
      setPhase('complete');
    } else {
      setScenarioIdx(i => i + 1);
      setSliderValue(0);
      setSubmitted(false);
    }
  };

  const handleTryAgain = () => {
    setSlideIdx(0);
    setPhase('carousel');
    setScenarioIdx(0);
    setSliderValue(0);
    setSubmitted(false);
    setResults([]);
  };

  if (phase === 'complete') {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-6 py-6 bg-gradient-to-r from-emerald-900/30 to-slate-800/40 border-b border-emerald-500/20 text-center">
          <p className="text-sm font-bold text-emerald-300 uppercase tracking-wider">Exercise Complete</p>
        </div>
        <div className="p-6 space-y-5">
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white text-center">{config.completionTitle}</h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{config.completionMessage}</p>
          </div>
          <div className="max-w-md mx-auto space-y-2">
            {config.scenarios.map((s, i) => {
              const r = results[i];
              return (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/30">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    r?.verdict === 'close' ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-500/30' :
                    r?.verdict === 'reasonable' ? 'bg-[var(--brand-primary)]/30 text-[var(--brand-primary)] border border-[var(--brand-primary)]/30' :
                    'bg-slate-800 text-slate-300 border border-slate-700/50'
                  }`}>{i + 1}</div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-300">{s.title}</p>
                    <p className="text-[10px] text-slate-300">Your estimate: {r?.value.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
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

  if (phase === 'carousel') {
    const slide = config.slides[slideIdx];
    return (
      <div className="rounded-2xl border border-[var(--brand-primary)]/20 bg-gradient-to-br from-[var(--brand-primary)]/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-700/20 flex items-center justify-between">
          <p className="text-xs font-semibold text-[var(--brand-primary)] uppercase tracking-wider">Confidence Challenge</p>
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
                  <path d="M8 36 A16 16 0 0 1 40 36" stroke="#3b82f6" strokeWidth="2" fill="none" />
                  <line x1="24" y1="20" x2="24" y2="14" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="24" cy="20" r="3" fill="#f59e0b" />
                </svg>
              )}
              {slideIdx === 1 && (
                <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                  <rect x="6" y="22" width="36" height="4" rx="2" fill="#475569" />
                  <rect x="6" y="22" width="18" height="4" rx="2" fill="#3b82f6" />
                  <circle cx="24" cy="24" r="5" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5" />
                </svg>
              )}
              {slideIdx === 2 && (
                <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="16" stroke="#22c55e" strokeWidth="1.5" fill="#22c55e" fillOpacity="0.1" />
                  <circle cx="24" cy="24" r="6" fill="#22c55e" fillOpacity="0.2" />
                  <circle cx="24" cy="24" r="2" fill="#22c55e" />
                </svg>
              )}
            </div>
            <h3 className="text-lg font-bold text-white">{slide.title}</h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line mt-4 max-w-md mx-auto">{slide.body}</p>
            <div className="mt-7"><button onClick={handleSlideNext} className="inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-2.5 rounded-lg bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] transition-all shadow-lg shadow-[var(--brand-primary)]/20 hover:scale-[1.03] hover:-translate-y-0.5 duration-[280ms]">
              {isLastSlide ? 'Start Challenge' : 'Next'}
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button></div>
          </div>
        </div>
      </div>
    );
  }

  if (!scenario) return null;
  const result = submitted ? results[results.length - 1] : null;

  return (
    <div className="rounded-2xl border border-[var(--brand-primary)]/20 bg-gradient-to-br from-[var(--brand-primary)]/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
      <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-700/20 flex items-center justify-between">
        <p className="text-xs font-semibold text-[var(--brand-primary)] uppercase tracking-wider">
          Scenario {scenarioIdx + 1} of {totalScenarios}
        </p>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalScenarios }).map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${
              i < scenarioIdx ? 'bg-emerald-500' : i === scenarioIdx ? 'bg-[var(--brand-primary)] scale-125 shadow-sm shadow-[var(--brand-primary)]/50' : 'bg-slate-600'
            }`} />
          ))}
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="max-w-lg mx-auto space-y-4">
          <div className="rounded-xl bg-slate-900/60 border border-slate-700/40 p-5 flex items-start gap-4">
            <div className="flex-shrink-0 mt-0.5">
              <ScenarioVisual scenario={scenario} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-[var(--brand-primary)] uppercase tracking-wider mb-1.5">{scenario.title}</p>
              <p className="text-sm text-slate-200 leading-relaxed">{scenario.situation}</p>
              <p className="text-xs text-slate-300 mt-2">How confident are you that this will happen?</p>
            </div>
          </div>

          <div className="px-2 py-4">
            <div
              ref={trackRef}
              onMouseDown={handleSliderChange}
              onMouseMove={(e) => { if (e.buttons === 1) handleSliderChange(e); }}
              onTouchMove={handleSliderChange}
              className={`relative h-10 cursor-pointer select-none ${submitted ? 'pointer-events-none' : ''}`}
            >
              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 rounded-full bg-slate-700" />
              <div
                className="absolute top-1/2 -translate-y-1/2 left-0 h-1.5 rounded-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-primary)]"
                style={{ width: `${sliderValue * 100}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-[var(--brand-primary)] shadow-lg shadow-[var(--brand-primary)]/30 -ml-2.5 transition-all"
                style={{ left: `${sliderValue * 100}%` }}
              />
            </div>

            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-slate-300">0</span>
              <span className="text-[10px] text-slate-300">0.25</span>
              <span className="text-[10px] text-slate-300">0.50</span>
              <span className="text-[10px] text-slate-300">0.75</span>
              <span className="text-[10px] text-slate-300">1</span>
            </div>

            <div className="flex justify-between mt-1.5">
              {['Impossible', 'Very Unlikely', 'Possible', 'Likely', 'Certain'].map((label, i) => (
                <span key={i} className="text-[9px] text-slate-300" style={{ transform: 'translateX(-25%)' }}>{label}</span>
              ))}
            </div>

            <div className="text-center mt-4">
              <span className="text-lg font-bold text-white font-mono">{sliderValue.toFixed(2)}</span>
              <span className="text-sm text-slate-300 ml-2">{getLabel(sliderValue)}</span>
            </div>
          </div>

          {!submitted && (
            <div className="text-center">
              <button onClick={handleSubmit} className="inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-2.5 rounded-xl bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-primary)] hover:from-[var(--brand-primary)] hover:to-[var(--brand-primary)] transition-all shadow-lg shadow-[var(--brand-primary)]/20 hover:scale-[1.03] hover:-translate-y-0.5 duration-[280ms]">
                Submit Confidence
              </button>
            </div>
          )}

          {result && (
            <div className={`rounded-xl border p-4 space-y-2 ${
              result.verdict === 'close' ? 'bg-emerald-900/15 border-emerald-500/30' :
              result.verdict === 'reasonable' ? 'bg-[var(--brand-primary)]/15 border-[var(--brand-primary)]/30' :
              'bg-[var(--brand-primary)]/15 border-[var(--brand-primary)]/30'
            }`}>
              <p className={`text-xs font-bold ${
                result.verdict === 'close' ? 'text-emerald-300' :
                result.verdict === 'reasonable' ? 'text-[var(--brand-primary)]' :
                'text-[var(--brand-primary)]'
              }`}>
                {result.verdict === 'close' ? 'Close Estimate' :
                 result.verdict === 'reasonable' ? 'Reasonable Estimate' :
                 'Think Again'}
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">{result.message}{result.verdict === 'reasonable' ? scenario.explanation : ''}</p>
              {result.verdict !== 'reasonable' && <p className="text-sm text-slate-300 leading-relaxed">{scenario.explanation}</p>}
              <button onClick={handleNext} className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-white px-4 py-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 transition-all">
                {scenarioIdx + 1 >= totalScenarios ? 'See Results' : 'Next Scenario'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
