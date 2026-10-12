import { useState, useRef, useCallback } from 'react';
import type { DecisionPipelineConfig } from '../../types/lesson';

if (typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.textContent = `
@keyframes pipeline-glow { 0%,100% { opacity: 0.3; } 50% { opacity: 0.8; } }
@keyframes slide-up { 0% { transform: translateY(12px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
@keyframes pulse-marker { 0%,100% { box-shadow: 0 0 0 0 rgba(251,191,36,0.4); } 50% { box-shadow: 0 0 0 8px rgba(251,191,36,0); } }
@keyframes float-envelope { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
@keyframes draw-line { 0% { stroke-dashoffset: 100; } 100% { stroke-dashoffset: 0; } }
@keyframes check-pop { 0% { transform: scale(0); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
.anim-pipeline-glow { animation: pipeline-glow 2s ease-in-out infinite; }
.anim-slide-up { animation: slide-up 0.5s ease-out forwards; }
.anim-pulse-marker { animation: pulse-marker 2s ease-in-out infinite; }
.anim-float { animation: float-envelope 2.5s ease-in-out infinite; }
.anim-draw { stroke-dasharray: 100; animation: draw-line 1.5s ease-out forwards; }
.anim-pop { animation: check-pop 0.5s ease-out 0.3s both; }
`;
  document.head.appendChild(s);
}

interface Props {
  config: DecisionPipelineConfig;
  onComplete: () => void;
  onAttempt?: () => void;
}

type Phase = 'carousel' | 'pipeline' | 'summary';

const STEP_LABELS = ['Prior Belief', 'Evidence', 'Update Confidence', 'Decision'];

function PipelineDot({ active, done }: { active: boolean; done: boolean }) {
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500 ${
        done
          ? 'bg-indigo-600/40 border-indigo-500 text-indigo-300'
          : active
          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 anim-pulse-marker'
          : 'bg-slate-800/60 border-slate-700/40 text-slate-300'
      }`}
    >
      {done ? (
        <svg className="w-4 h-4 text-indigo-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20,6 9,17 4,12" />
        </svg>
      ) : (
        <span>{active ? '' : ''}</span>
      )}
    </div>
  );
}

function ConnectorLine({ done }: { done: boolean }) {
  return (
    <div className={`w-0.5 h-8 mx-auto rounded-full transition-all duration-700 ${
      done ? 'bg-indigo-500/60 shadow-sm shadow-indigo-500/30' : 'bg-slate-700/40'
    }`} />
  );
}

export default function DecisionPipeline({ config, onComplete, onAttempt }: Props) {
  const [phase, setPhase] = useState<Phase>('carousel');
  const [slideIdx, setSlideIdx] = useState(0);
  const [step, setStep] = useState(0);
  const [sliderValue, setSliderValue] = useState(config.priorBeliefPercent);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [decisionSubmitted, setDecisionSubmitted] = useState(false);
  const [evidenceSlots, setEvidenceSlots] = useState<string[]>([]);
  const [showPriorExplanation, setShowPriorExplanation] = useState(false);
  const [showEvidenceExplanation, setShowEvidenceExplanation] = useState(false);
  const [showSliderExplanation, setShowSliderExplanation] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const totalSlides = config.slides.length;
  const isLastSlide = slideIdx === totalSlides - 1;

  const handleSlideNext = () => {
    if (isLastSlide) {
      setPhase('pipeline');
    } else {
      setSlideIdx(i => i + 1);
    }
  };

  const handleSliderChange = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    let val = Math.round(((clientX - rect.left) / rect.width) * 100);
    val = Math.max(0, Math.min(100, val));
    setSliderValue(val);
  }, []);

  const handleContinuePrior = () => {
    setShowPriorExplanation(true);
    onAttempt?.();
  };

  const handleContinuePriorClose = () => {
    setStep(1);
  };

  const handleAddEvidence = (id: string) => {
    if (evidenceSlots.includes(id) || evidenceSlots.length >= 3) return;
    setEvidenceSlots(prev => [...prev, id]);
  };

  const handleRemoveEvidence = (id: string) => {
    setEvidenceSlots(prev => prev.filter(x => x !== id));
  };

  const handleFinishEvidence = () => {
    setShowEvidenceExplanation(true);
    onAttempt?.();
  };

  const handleContinueEvidence = () => {
    setStep(2);
  };

  const handleSubmitSlider = () => {
    setShowSliderExplanation(true);
    onAttempt?.();
  };

  const handleContinueSlider = () => {
    setStep(3);
  };

  const handleSelectOption = (val: string) => {
    if (decisionSubmitted) return;
    setSelectedOption(val);
  };

  const handleSubmitDecision = () => {
    if (!selectedOption) return;
    setDecisionSubmitted(true);
    onAttempt?.();
  };

  const handleFinish = () => {
    setPhase('summary');
  };

  const handleContinueLearning = () => {
    onComplete();
  };

  const handleTryAgain = () => {
    setSlideIdx(0);
    setPhase('carousel');
    setStep(0);
    setSliderValue(config.priorBeliefPercent);
    setSelectedOption(null);
    setDecisionSubmitted(false);
    setEvidenceSlots([]);
    setShowPriorExplanation(false);
    setShowEvidenceExplanation(false);
    setShowSliderExplanation(false);
  };

  if (phase === 'carousel') {
    const slide = config.slides[slideIdx];
    return (
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-700/20 flex items-center justify-between">
          <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Decision Pipeline</p>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${
                i === slideIdx ? 'bg-indigo-400 scale-125 shadow-sm shadow-indigo-400/50' : i < slideIdx ? 'bg-indigo-600/60' : 'bg-slate-600/50'
              }`} />
            ))}
          </div>
        </div>
        <div className="px-6 pt-2 pb-6">
          <div className="mx-auto text-center">
            <div className="flex justify-center mb-4">
              {slideIdx === 0 && (
                <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                  <rect x="4" y="16" width="10" height="16" rx="2" stroke="#6366f1" strokeWidth="1.5" fill="#6366f1" fillOpacity="0.1" />
                  <path d="M14 24h4" stroke="#475569" strokeWidth="1.5" />
                  <polyline points="18,24 22,20 26,24" stroke="#6366f1" strokeWidth="1.5" fill="none" />
                  <rect x="26" y="16" width="10" height="16" rx="2" stroke="#3b82f6" strokeWidth="1.5" fill="#3b82f6" fillOpacity="0.1" />
                  <path d="M36 24h4" stroke="#475569" strokeWidth="1.5" />
                  <polyline points="40,24 44,20 48,24" stroke="#6366f1" strokeWidth="1.5" fill="none" />
                </svg>
              )}
              {slideIdx === 1 && (
                <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                  <circle cx="12" cy="24" r="5" stroke="#3b82f6" strokeWidth="1.5" fill="#3b82f6" fillOpacity="0.2" />
                  <path d="M17 24h4" stroke="#475569" strokeWidth="1" />
                  <circle cx="24" cy="24" r="5" stroke="#6366f1" strokeWidth="1.5" fill="#6366f1" fillOpacity="0.2" />
                  <path d="M29 24h4" stroke="#475569" strokeWidth="1" />
                  <circle cx="36" cy="24" r="5" stroke="#22c55e" strokeWidth="1.5" fill="#22c55e" fillOpacity="0.2" />
                </svg>
              )}
              {slideIdx === 2 && (
                <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="12" r="5" stroke="#6366f1" strokeWidth="1.5" fill="#6366f1" fillOpacity="0.2" />
                  <path d="M24 17v6" stroke="#475569" strokeWidth="1.5" />
                  <path d="M24 23l-8 8" stroke="#ef4444" strokeWidth="1.5" />
                  <path d="M24 23l8 8" stroke="#22c55e" strokeWidth="1.5" />
                </svg>
              )}
            </div>
            <h3 className="text-lg font-bold text-white">{slide.title}</h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line mt-4 max-w-md mx-auto">{slide.body}</p>
            <div className="mt-7"><button onClick={handleSlideNext} className="inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
              {isLastSlide ? 'Start Exercise' : 'Next'}
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button></div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'summary') {
    return (
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-4 bg-slate-800/40 border-b border-slate-700/20 text-center">
          <p className="text-sm font-bold text-indigo-300 uppercase tracking-wider">Decision Pipeline Complete</p>
        </div>
        <div className="p-6 space-y-5">
          <div className="max-w-md mx-auto space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-700/30">
              <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="20,6 9,17 4,12" /></svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-indigo-300">Prior Belief</p>
                <p className="text-[10px] text-slate-300">{config.priorBeliefPercent}% — {config.priorBeliefCard}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-700/30">
              <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="20,6 9,17 4,12" /></svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-indigo-300">Evidence</p>
                <p className="text-[10px] text-slate-300">{config.evidences.map(e => e.label).join(', ')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-700/30">
              <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="20,6 9,17 4,12" /></svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-indigo-300">Updated Confidence</p>
                <p className="text-[10px] text-slate-300">{config.updatedConfidence}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-700/30">
              <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="20,6 9,17 4,12" /></svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-indigo-300">Final Decision</p>
                <p className="text-[10px] text-slate-300">{config.correctOption}</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{config.summaryText}</p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button onClick={handleTryAgain} className="px-4 py-2 text-xs font-semibold text-slate-300 rounded-lg border border-slate-700/50 bg-slate-800/50 hover:bg-slate-700/50 transition-all">
              Try Again
            </button>
            <button onClick={handleContinueLearning} className="px-5 py-2 text-xs font-semibold text-white rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
              Continue Learning
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
      <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-700/20 flex items-center justify-between">
        <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Decision Pipeline</p>
        <div className="flex items-center gap-1.5">
          {STEP_LABELS.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${
              i < step ? 'bg-indigo-500' : i === step ? 'bg-indigo-400 scale-125 shadow-sm shadow-indigo-400/50' : 'bg-slate-600'
            }`} />
          ))}
        </div>
      </div>

      <div className="p-5">
        <div className="max-w-lg mx-auto flex flex-col items-center gap-0">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="w-full">
              <div className="flex items-center gap-3 py-1">
                <PipelineDot active={step === i} done={i < step} />
                <span className={`text-xs font-semibold transition-all duration-500 ${
                  i === step ? 'text-indigo-300' : i < step ? 'text-indigo-400' : 'text-slate-300'
                }`}>
                  {STEP_LABELS[i]}
                </span>
                {i < step && (
                  <svg className="w-3.5 h-3.5 text-indigo-400 ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                )}
              </div>
              {i < 3 && <ConnectorLine done={i < step} />}
              {i === step && (
                <div className="pt-4 pb-2 anim-slide-up">
                  {i === 0 && (
                    <div className="space-y-4">
                      <div className="rounded-xl bg-slate-900/60 border border-slate-700/40 p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <svg className="w-10 h-10 flex-shrink-0" viewBox="0 0 60 60" fill="none">
                            <rect x="10" y="12" width="40" height="30" rx="4" stroke="#6366f1" strokeWidth="1.5" fill="#0f172a" />
                            <polyline points="10,14 30,32 50,14" stroke="#6366f1" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div>
                            <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">{config.scenarioTitle}</p>
                            <p className="text-sm text-slate-200">{config.priorBeliefCard}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 pt-3 border-t border-slate-700/30">
                          <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">Belief</span>
                          <div className="flex-1 h-3 rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-500" style={{ width: `${config.priorBeliefPercent}%` }} />
                          </div>
                          <span className="font-mono text-lg font-bold text-white">{config.priorBeliefPercent}%</span>
                        </div>
                      </div>
                      {!showPriorExplanation && (
                        <button onClick={handleContinuePrior} className="w-full text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
                          Continue
                        </button>
                      )}
                      {showPriorExplanation && (
                        <div className="rounded-xl bg-indigo-900/15 border border-indigo-500/30 p-4">
                          <p className="text-sm text-slate-300 leading-relaxed">{config.priorBeliefExplanation}</p>
                          <button onClick={handleContinuePriorClose} className="mt-3 text-xs font-semibold text-white px-4 py-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 transition-all">
                            Next Step
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {i === 1 && (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-300">Click each evidence to add it.</p>
                      <div className="flex gap-2">
                        {config.evidences.filter(ev => !evidenceSlots.includes(ev.id)).map(ev => (
                          <button
                            key={ev.id}
                            onClick={() => handleAddEvidence(ev.id)}
                            className="flex-1 p-3 rounded-xl border border-slate-700/40 bg-slate-900/60 text-left text-slate-300 hover:border-indigo-500/40 hover:bg-slate-800/60 transition-all"
                          >
                            <p className="text-xs font-semibold text-indigo-400 mb-1">{ev.label}</p>
                            <p className="text-[10px] text-slate-300">{ev.description}</p>
                          </button>
                        ))}
                      </div>

                      <div className={`min-h-[60px] rounded-xl border-2 border-dashed p-3 flex items-center gap-2 transition-all ${
                        evidenceSlots.length > 0 ? 'border-indigo-500/40 bg-indigo-900/10' : 'border-slate-700/30'
                      }`}>
                        {evidenceSlots.length === 0 && (
                          <p className="text-xs text-slate-300 w-full text-center">Evidence Area — drop cards here</p>
                        )}
                        {evidenceSlots.map(id => {
                          const ev = config.evidences.find(e => e.id === id);
                          return (
                            <div key={id} className="px-2.5 py-1.5 rounded-lg bg-indigo-900/20 border border-indigo-500/30 flex items-center gap-1.5">
                              <span className="text-[10px] font-semibold text-indigo-300">{ev?.label}</span>
                              <button onClick={() => handleRemoveEvidence(id)} className="text-slate-300 hover:text-red-400 transition-colors">
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {evidenceSlots.length === 3 && !showEvidenceExplanation && (
                        <button onClick={handleFinishEvidence} className="w-full text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
                          All Evidence Added — Continue
                        </button>
                      )}

                      {showEvidenceExplanation && (
                        <div className="rounded-xl bg-indigo-900/15 border border-indigo-500/30 p-4 space-y-2">
                          <p className="text-xs font-bold text-indigo-300">Every new observation provides additional information.</p>
                          <p className="text-sm text-slate-300 leading-relaxed">{config.evidenceExplanation}</p>
                          <button onClick={handleContinueEvidence} className="text-xs font-semibold text-white px-4 py-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 transition-all">
                            Next Step
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {i === 2 && (
                    <div className="space-y-4">
                      <div className="rounded-xl bg-slate-900/60 border border-slate-700/40 p-4">
                        <p className="text-xs text-slate-300 mb-2">Current Belief: <span className="font-bold text-white font-mono">{config.priorBeliefPercent}%</span></p>
                        <p className="text-[10px] text-slate-300 mb-3">Based on the evidence, how should the belief change?</p>

                        <div
                          ref={trackRef}
                          onMouseDown={handleSliderChange}
                          onMouseMove={(e) => { if (e.buttons === 1) handleSliderChange(e); }}
                          onTouchMove={handleSliderChange}
                          className="relative h-10 cursor-pointer select-none"
                        >
                          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 rounded-full bg-slate-700" />
                          <div
                            className="absolute top-1/2 -translate-y-1/2 left-0 h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-500"
                            style={{ width: `${sliderValue}%` }}
                          />
                          <div
                            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-indigo-500 shadow-lg shadow-indigo-500/30 -ml-2.5 transition-all"
                            style={{ left: `${sliderValue}%` }}
                          />
                        </div>

                        <div className="flex justify-between mt-2">
                          <span className="text-[10px] text-slate-300">0%</span>
                          <span className="text-[10px] text-slate-300">50%</span>
                          <span className="text-[10px] text-slate-300">100%</span>
                        </div>

                        <div className="text-center mt-3">
                          <span className="text-lg font-bold text-white font-mono">{sliderValue}%</span>
                        </div>
                      </div>

                      {!showSliderExplanation && (
                        <button onClick={handleSubmitSlider} className="w-full text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
                          Submit Updated Belief
                        </button>
                      )}

                      {showSliderExplanation && (
                        <div className="rounded-xl bg-indigo-900/15 border border-indigo-500/30 p-4 space-y-2">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-mono text-sm text-slate-300 line-through">{config.priorBeliefPercent}%</span>
                            <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14" /><polyline points="12,5 19,12 12,19" /></svg>
                            <span className="font-mono text-lg font-bold text-indigo-300">{config.updatedConfidence}%</span>
                          </div>
                          <p className="text-sm text-slate-300 leading-relaxed">You are closer to {config.updatedConfidence}%. Because of {evidenceSlots.map(id => config.evidences.find(e => e.id === id)?.label).filter(Boolean).join(', ')}, the belief increases significantly.</p>
                          <button onClick={handleContinueSlider} className="text-xs font-semibold text-white px-4 py-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 transition-all">
                            Next Step
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {i === 3 && (
                    <div className="space-y-4">
                      <p className="text-sm text-slate-200">Based on the updated belief ({config.updatedConfidence}%), what should the system do?</p>
                      <div className="flex gap-3">
                        {config.options.map(opt => {
                          const active = selectedOption === opt.value;
                          const isCorrect = decisionSubmitted && opt.value === config.correctOption;
                          const isWrong = decisionSubmitted && opt.value === selectedOption && opt.value !== config.correctOption;
                          return (
                            <button
                              key={opt.value}
                              onClick={() => handleSelectOption(opt.value)}
                              disabled={decisionSubmitted}
                              className={`flex-1 p-4 rounded-xl border text-sm font-semibold text-center transition-all ${
                                isCorrect
                                  ? 'bg-indigo-900/20 border-indigo-500/50 text-indigo-300'
                                  : isWrong
                                  ? 'bg-red-900/20 border-red-500/50 text-red-300'
                                  : active
                                  ? 'bg-indigo-900/20 border-indigo-500/50 text-indigo-300'
                                  : 'bg-slate-900/60 border-slate-700/40 text-slate-300 hover:border-indigo-500/40 hover:bg-slate-800/60'
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>

                      {!decisionSubmitted && selectedOption && (
                        <button onClick={handleSubmitDecision} className="w-full text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
                          Confirm Decision
                        </button>
                      )}

                      {decisionSubmitted && (
                        <div className="rounded-xl bg-indigo-900/15 border border-indigo-500/30 p-4 space-y-2">
                          <p className="text-xs font-bold text-indigo-300">{config.decisionExplanation}</p>
                          <button onClick={handleFinish} className="text-xs font-semibold text-white px-4 py-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 transition-all">
                            See Summary
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
