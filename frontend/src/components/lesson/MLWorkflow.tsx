import { useState, useMemo, useRef } from 'react';
import type { MLWorkflowConfig, MLWorkflowStep } from '../../types/lesson';

if (typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.textContent = `
@keyframes mw-shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
@keyframes mw-place { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
@keyframes mw-fade { 0% { opacity: 0; } 100% { opacity: 1; } }
@keyframes mw-slide { 0% { opacity: 0; transform: translateY(12px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes mw-glow { 0%,100% { box-shadow: 0 0 8px rgba(52,211,153,0.4); } 50% { box-shadow: 0 0 20px rgba(52,211,153,0.7); } }
@keyframes mw-arrow { 0% { opacity: 0; } 100% { opacity: 1; } }
@keyframes mw-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes mw-pulse { 0%,100% { opacity: 0.3; } 50% { opacity: 0.8; } }
.mw-shake { animation: mw-shake 0.4s ease-out; }
.mw-place { animation: mw-place 0.3s ease-out forwards; }
.mw-fade { animation: mw-fade 0.4s ease-out forwards; }
.mw-slide { animation: mw-slide 0.4s ease-out forwards; }
.mw-glow { animation: mw-glow 1.5s ease-in-out infinite; }
.mw-arrow { animation: mw-arrow 0.5s ease-out forwards; }
`;
  document.head.appendChild(s);
}

interface Props {
  config: MLWorkflowConfig;
  onComplete: () => void;
  onAttempt?: () => void;
}

type Phase = 'carousel' | 'arrange' | 'preview' | 'complete';

const CORRECT_ORDER = ['collect-data', 'clean-data', 'train-model', 'test-model', 'predict'];

export default function MLWorkflow({ config, onComplete, onAttempt }: Props) {
  const [phase, setPhase] = useState<Phase>('carousel');
  const [slideIdx, setSlideIdx] = useState(0);
  const [slots, setSlots] = useState<(string | null)[]>(Array(5).fill(null));
  const [results, setResults] = useState<('correct' | 'wrong' | null)[]>(Array(5).fill(null));
  const [shakeSlots, setShakeSlots] = useState<Set<number>>(new Set());
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const [checkFeedback, setCheckFeedback] = useState<string[] | null>(null);
  const dragId = useRef<string | null>(null);

  const totalSlides = config.slides.length;
  const isLastSlide = slideIdx === totalSlides - 1;

  const shuffledSteps = useMemo(() => {
    return [...config.steps].sort(() => Math.random() - 0.5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unplacedSteps = shuffledSteps.filter(s => !slots.includes(s.id));

  const handleSlideNext = () => {
    if (isLastSlide) {
      setPhase('arrange');
    } else {
      setSlideIdx(i => i + 1);
    }
  };

  const handleDragStart = (e: React.DragEvent, stepId: string) => {
    dragId.current = stepId;
    e.dataTransfer.setData('text/plain', stepId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (slotIdx: number) => {
    if (!dragId.current) return;
    const stepId = dragId.current;
    dragId.current = null;
    setDragOverSlot(null);

    const existingIdx = slots.indexOf(stepId);
    if (existingIdx === slotIdx) return;

    setSlots(prev => {
      const next = [...prev];
      const targetFilled = next[slotIdx];
      if (targetFilled && existingIdx >= 0) {
        next[existingIdx] = targetFilled;
      } else if (existingIdx >= 0) {
        next[existingIdx] = null;
      }
      next[slotIdx] = stepId;
      return next;
    });

    if (results.some(r => r !== null)) {
      setResults(Array(5).fill(null));
    }
  };

  const handleRemoveFromSlot = (slotIdx: number) => {
    setSlots(prev => {
      const next = [...prev];
      next[slotIdx] = null;
      return next;
    });
    if (results.some(r => r !== null)) {
      setResults(Array(5).fill(null));
    }
  };

  const handleCheckWorkflow = () => {
    onAttempt?.();
    const newResults: ('correct' | 'wrong' | null)[] = Array(5).fill(null);
    const shake = new Set<number>();
    const feedback: string[] = [];
    let allOk = true;

    for (let i = 0; i < 5; i++) {
      const stepId = slots[i];
      if (stepId === CORRECT_ORDER[i]) {
        newResults[i] = 'correct';
      } else {
        newResults[i] = 'wrong';
        shake.add(i);
        allOk = false;
        const got = getStep(stepId!)?.label || '?';
        const expected = getStep(CORRECT_ORDER[i])?.label || '?';
        feedback.push(`Slot ${i + 1}: expected "${expected}" but got "${got}".`);
      }
    }

    setResults(newResults);

    if (allOk) {
      setCheckFeedback(null);
      setTimeout(() => {
        setPhase('preview');
      }, 1000);
    } else {
      setCheckFeedback(feedback);
      setTimeout(() => {
        setShakeSlots(shake);
        setTimeout(() => {
          setSlots(prev => {
            const next = [...prev];
            shake.forEach(idx => { next[idx] = null; });
            return next;
          });
          setShakeSlots(new Set());
          setCheckFeedback(null);
          setResults(Array(5).fill(null));
        }, 800);
      }, 3500);
    }
  };

  const allSlotsFilled = slots.every(s => s !== null);

  const handleTryAgain = () => {
    setSlots(Array(5).fill(null));
    setResults(Array(5).fill(null));
    setShakeSlots(new Set());
    setPhase('carousel');
    setSlideIdx(0);
  };

  const getStep = (id: string): MLWorkflowStep | undefined =>
    config.steps.find(s => s.id === id);

  const stepColors: Record<string, string> = {
    'collect-data': '#3b82f6',
    'clean-data': '#22c55e',
    'train-model': '#f59e0b',
    'test-model': '#ef4444',
    'predict': '#a855f7',
  };

  // ── Carousel ──
  if (phase === 'carousel') {
    const slide = config.slides[slideIdx];
    return (
      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-700/20 flex items-center justify-between">
          <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Build the ML Pipeline</p>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${
                i === slideIdx ? 'bg-blue-400 scale-125 shadow-sm shadow-blue-400/50' : i < slideIdx ? 'bg-blue-600/60' : 'bg-slate-600/50'
              }`} />
            ))}
          </div>
        </div>
        <div className="px-6 pt-2 pb-6">
          <div className="mx-auto text-center">
            <div className="flex justify-center mb-4 mw-float" style={{ animationDuration: '3s', animationIterationCount: 'infinite' }}>
              {slideIdx === 0 && (
                <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                  <rect x="8" y="6" width="32" height="36" rx="4" stroke="#3b82f6" strokeWidth="1.5" fill="#3b82f6" fillOpacity="0.1" />
                  <rect x="14" y="12" width="20" height="4" rx="1" stroke="#3b82f6" strokeWidth="1" className="mw-pulse" style={{ animationDuration: '2s', animationIterationCount: 'infinite' }} />
                  <rect x="14" y="20" width="20" height="4" rx="1" stroke="#3b82f6" strokeWidth="1" className="mw-pulse" style={{ animationDuration: '2.5s', animationIterationCount: 'infinite', animationDelay: '0.3s' }} />
                  <rect x="14" y="28" width="20" height="4" rx="1" stroke="#3b82f6" strokeWidth="1" className="mw-pulse" style={{ animationDuration: '2s', animationIterationCount: 'infinite', animationDelay: '0.6s' }} />
                  <path d="M36 18l4 6-4 6" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mw-pulse" style={{ animationDuration: '1.5s', animationIterationCount: 'infinite' }} />
                </svg>
              )}
              {slideIdx === 1 && (
                <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                  <circle cx="14" cy="14" r="6" stroke="#22c55e" strokeWidth="1.5" fill="#22c55e" fillOpacity="0.1" className="mw-pulse" style={{ animationDuration: '3s', animationIterationCount: 'infinite' }} />
                  <text x="14" y="17" fontSize="6" fill="#94a3b8" textAnchor="middle">Data</text>
                  <path d="M20 14h8" stroke="#64748b" strokeWidth="1.5" className="mw-pulse" style={{ animationDuration: '2.5s', animationIterationCount: 'infinite', animationDelay: '0.5s' }} />
                  <circle cx="34" cy="14" r="6" stroke="#3b82f6" strokeWidth="1.5" fill="#3b82f6" fillOpacity="0.1" className="mw-pulse" style={{ animationDuration: '2.5s', animationIterationCount: 'infinite', animationDelay: '1s' }} />
                  <text x="34" y="17" fontSize="6" fill="#94a3b8" textAnchor="middle">Model</text>
                  <path d="M14 20v8" stroke="#64748b" strokeWidth="1.5" className="mw-pulse" style={{ animationDuration: '2s', animationIterationCount: 'infinite', animationDelay: '0.8s' }} />
                  <circle cx="14" cy="34" r="6" stroke="#a855f7" strokeWidth="1.5" fill="#a855f7" fillOpacity="0.1" className="mw-pulse" style={{ animationDuration: '3.5s', animationIterationCount: 'infinite', animationDelay: '0.3s' }} />
                  <text x="14" y="37" fontSize="6" fill="#94a3b8" textAnchor="middle">Predict</text>
                </svg>
              )}
            </div>
            <h3 className="text-lg font-bold text-white">{slide.title}</h3>
            <p className="mt-4 text-sm text-slate-300 leading-relaxed whitespace-pre-line max-w-md mx-auto">{slide.body}</p>
            <div className="mt-7">
              <button onClick={handleSlideNext} className="inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
                {isLastSlide ? 'Start Building' : 'Next'}
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

  // ── Arrange ──
  if (phase === 'arrange') {
    return (
      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-700/20 flex items-center justify-between">
          <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Build the ML Pipeline</p>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-20 rounded-full bg-slate-700/50 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${((5 - unplacedSteps.length) / 5) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-300">{unplacedSteps.length} left</p>
          </div>
        </div>

        <div className="p-5 space-y-5">

          {/* Tray */}
          <div>
            <p className="text-[10px] text-slate-300 uppercase tracking-wider mb-2">Cards</p>
            <div className="flex flex-wrap gap-2">
              {unplacedSteps.length === 0 ? (
                <p className="text-xs text-slate-300 italic">All cards placed</p>
              ) : (
                unplacedSteps.map(step => {
                  const color = stepColors[step.id] || '#3b82f6';
                  return (
                    <div
                      key={step.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, step.id)}
                      className="rounded-lg border px-4 py-3 flex items-center gap-2.5 cursor-grab active:cursor-grabbing select-none transition-all bg-slate-900/60 border-slate-700/40 text-slate-200 hover:border-blue-500/40 hover:bg-slate-800/60"
                    >
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-sm font-medium">{step.label}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Timeline Slots */}
          <div>
            <p className="text-[10px] text-slate-300 uppercase tracking-wider mb-2">Timeline</p>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 5 }).map((_, idx) => {
                const stepId = slots[idx];
                const step = stepId ? getStep(stepId) : null;
                const color = step ? stepColors[step.id] || '#3b82f6' : '#64748b';
                const isOver = dragOverSlot === idx;
                const result = results[idx];
                const isShake = shakeSlots.has(idx);

                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5">
                    <div className="text-[10px] text-slate-300 font-semibold">{idx + 1}</div>
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragOverSlot(idx); }}
                      onDragEnter={(e) => { e.preventDefault(); setDragOverSlot(idx); }}
                      onDragLeave={() => setDragOverSlot(null)}
                      onDrop={(e) => { e.preventDefault(); setDragOverSlot(null); handleDrop(idx); }}
                      className={`w-full min-h-[64px] rounded-xl border-2 border-dashed flex items-center justify-center p-2 transition-all ${
                        isOver ? 'border-blue-400 bg-blue-900/20' :
                        result === 'correct' ? 'border-emerald-500 bg-emerald-900/20 mw-glow' :
                        'border-slate-600/50 bg-slate-900/40'
                      } ${isShake ? 'mw-shake' : ''}`}
                    >
                      {step && (
                        <div className="flex items-center gap-1.5 mw-place">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                          <span className="text-[11px] font-medium text-slate-200 text-center leading-tight">{step.label}</span>
                          {results.every(r => r === null) && (
                            <button
                              onClick={() => handleRemoveFromSlot(idx)}
                              className="ml-auto flex-shrink-0 w-4 h-4 rounded-full bg-slate-700/50 hover:bg-slate-600/50 flex items-center justify-center transition-colors"
                            >
                              <svg className="w-2.5 h-2.5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" d="M6 6l12 12M18 6l-12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    {result === 'correct' && (
                      <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <polyline points="20,6 9,17 4,12" />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feedback */}
          {checkFeedback && (
            <div className="space-y-1 mw-slide">
              <p className="text-[10px] text-slate-300 uppercase tracking-wider">Feedback</p>
              <div className="rounded-xl bg-red-900/15 border border-red-500/30 p-3 space-y-1">
                {checkFeedback.map((msg, i) => (
                  <p key={i} className="text-xs text-red-300">{msg}</p>
                ))}
              </div>
            </div>
          )}

          {/* Check button */}
          <div className="text-center pt-2">
            <button
              onClick={handleCheckWorkflow}
              disabled={!allSlotsFilled}
              className={`inline-flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-lg transition-all ${
                allSlotsFilled
                  ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/20'
                  : 'text-slate-300 bg-slate-800/40 border border-slate-700/30 cursor-not-allowed'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Check Workflow
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Preview ──
  if (phase === 'preview') {
    const ordered = CORRECT_ORDER.map(id => getStep(id)!);
    return (
      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-700/20 text-center">
          <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider">ML Workflow Pipeline</p>
        </div>
        <div className="p-5 flex flex-col items-center gap-0 max-w-sm mx-auto">
          {ordered.map((step, idx) => (
            <div key={step.id} className="w-full mw-fade" style={{ animationDelay: `${idx * 0.15}s` }}>
              <div
                className="rounded-xl border px-4 py-3 flex items-center gap-3"
                style={{
                  backgroundColor: `${stepColors[step.id] || '#3b82f6'}15`,
                  borderColor: `${stepColors[step.id] || '#3b82f6'}40`,
                }}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: stepColors[step.id] || '#3b82f6' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-200">{step.label}</p>
                  <p className="text-[11px] text-slate-300 mt-0.5">{step.explanation}</p>
                </div>
                <div className="text-[10px] text-slate-300 font-mono">{idx + 1}</div>
              </div>
              {idx < ordered.length - 1 && (
                <div className="flex justify-center py-1 mw-arrow" style={{ animationDelay: `${idx * 0.15 + 0.1}s` }}>
                  <svg className="w-5 h-5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          ))}
          <div className="mt-6 text-center mw-fade" style={{ animationDelay: '1s' }}>
            <button onClick={() => setPhase('complete')} className="inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 transition-all shadow-lg shadow-emerald-600/20">
              Continue
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Complete ──
  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
      <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-700/20" />
      <div className="p-6 space-y-5">
        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-white">{config.completionTitle}</h3>
          <p className="text-sm text-slate-300">{config.completionMessage}</p>
        </div>

        <div className="space-y-1.5 max-w-md mx-auto">
          {config.takeaways.map((t, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
              <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <polyline points="20,6 9,17 4,12" />
              </svg>
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
