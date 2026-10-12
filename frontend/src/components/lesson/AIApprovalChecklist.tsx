import { useState, useEffect, useRef, useMemo } from 'react';
import type { AIApprovalChecklistConfig } from '../../types/lesson';

if (typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.textContent = `
@keyframes aac-slide { 0% { opacity: 0; transform: translateY(14px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes aac-pop { 0% { opacity: 0; transform: scale(0.6); } 100% { opacity: 1; transform: scale(1); } }
@keyframes aac-shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }

.aac-slide { animation: aac-slide 0.5s ease-out forwards; }
.aac-pop { animation: aac-pop 0.4s ease-out forwards; }
.aac-shake { animation: aac-shake 0.4s ease-out; }
`;
  document.head.appendChild(s);
}

interface Props {
  config: AIApprovalChecklistConfig;
  onComplete: () => void;
  onAttempt?: () => void;
}

const CAROUSEL_SVGS = [
  <svg key="s1" className="w-16 h-16 mx-auto mb-4 text-[var(--brand-primary)]" viewBox="0 0 80 80" fill="none">
    <rect x="12" y="12" width="56" height="56" rx="12" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.05" />
    <path d="M30 36 L40 46 L54 30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M40 18 L40 26 M40 54 L40 62 M18 40 L26 40 M54 40 L62 40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>,

  <svg key="s3" className="w-16 h-16 mx-auto mb-4 text-emerald-400" viewBox="0 0 80 80" fill="none">
    <circle cx="40" cy="40" r="26" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.05" />
    <polyline points="28,40 38,50 54,32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>,
];

export default function AIApprovalChecklist({ config, onComplete, onAttempt }: Props) {
  const [phase, setPhase] = useState<'carousel' | 'review' | 'dashboard' | 'decision' | 'complete'>('carousel');
  const [slideIdx, setSlideIdx] = useState(0);
  const [cardZones, setCardZones] = useState<Record<string, 'ready' | 'needs' | null>>({});
  const [wrongDrop, setWrongDrop] = useState<{ id: string; explanation: string } | null>(null);
  const [score, setScore] = useState(0);
  const [scoreAnimating, setScoreAnimating] = useState(false);
  const [decision, setDecision] = useState<'approve' | 'improve' | null>(null);
  const [decisionFeedback, setDecisionFeedback] = useState(false);
  const wrongTimer = useRef<number | null>(null);
  const scoreTimer = useRef<number | null>(null);

  const totalSlides = config.slides.length;
  const isLastSlide = slideIdx === totalSlides - 1;

  const shuffledCards = useMemo(() => {
    return [...config.cards].sort(() => Math.random() - 0.5);
  }, [config.cards]);

  const unplacedCards = shuffledCards.filter(c => cardZones[c.id] == null);
  const allPlaced = shuffledCards.every(c => cardZones[c.id] != null);

  useEffect(() => {
    return () => {
      if (wrongTimer.current) clearTimeout(wrongTimer.current);
      if (scoreTimer.current) clearTimeout(scoreTimer.current);
    };
  }, []);

  const handleSlideNext = () => {
    if (isLastSlide) setPhase('review');
    else setSlideIdx(i => i + 1);
  };

  const handleDrop = (e: React.DragEvent, zone: 'ready' | 'needs') => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain');
    if (!cardId || cardZones[cardId] != null) return;

    const card = config.cards.find(c => c.id === cardId);
    if (!card) return;

    if (card.expected !== zone) {
      onAttempt?.();
      setWrongDrop({ id: cardId, explanation: card.explanation });
      if (wrongTimer.current) clearTimeout(wrongTimer.current);
      wrongTimer.current = window.setTimeout(() => setWrongDrop(null), 2500);
      return;
    }

    onAttempt?.();
    setCardZones(prev => ({ ...prev, [cardId]: zone }));
  };

  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    if (cardZones[cardId] != null) return;
    e.dataTransfer.setData('text/plain', cardId);
  };

  useEffect(() => {
    if (allPlaced && phase === 'review') {
      const transitionTimer = setTimeout(() => {
        setPhase('dashboard');
        setScoreAnimating(true);
      }, 800);
      return () => clearTimeout(transitionTimer);
    }
  }, [allPlaced, phase]);

  useEffect(() => {
    if (scoreAnimating && phase === 'dashboard') {
      const dashTotal = config.dashboardItems.length;
      const passCount = config.dashboardItems.filter(item =>
        item.cardIds.every(cid => cardZones[cid] === 'ready')
      ).length;
      const target = Math.round((passCount / dashTotal) * 100);
      let current = 0;
      const step = Math.max(1, Math.floor(target / 25));
      const interval = setInterval(() => {
        current += step;
        if (current >= target) {
          setScore(target);
          clearInterval(interval);
        } else {
          setScore(current);
        }
      }, 50);
      scoreTimer.current = interval;
      return () => clearInterval(interval);
    }
  }, [scoreAnimating, phase, config.dashboardItems, cardZones]);

  const handleDecision = (choice: 'approve' | 'improve') => {
    if (decisionFeedback) return;
    onAttempt?.();
    setDecision(choice);
    setDecisionFeedback(true);
  };

  const handleContinueAfterDecision = () => {
    setPhase('complete');
  };

  const handleTryAgain = () => {
    if (wrongTimer.current) clearTimeout(wrongTimer.current);
    if (scoreTimer.current) clearTimeout(scoreTimer.current);
    setPhase('carousel');
    setSlideIdx(0);
    setCardZones({});
    setWrongDrop(null);
    setScore(0);
    setScoreAnimating(false);
    setDecision(null);
    setDecisionFeedback(false);
  };

  // ── Carousel ──
  if (phase === 'carousel') {
    const slide = config.slides[slideIdx];
    return (
      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-800/40 border-b border-slate-700/20 flex items-center justify-between">
          <p className="text-sm font-semibold text-blue-300 uppercase tracking-wider">AI Approval Checklist</p>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                i === slideIdx ? 'bg-blue-400 scale-125 shadow-sm shadow-blue-400/50' : i < slideIdx ? 'bg-blue-600/60' : 'bg-slate-600/50'
              }`} />
            ))}
          </div>
        </div>
        <div className="px-8 pt-6 pb-8">
          <div className="mx-auto text-center max-w-lg">
            <div className="aac-pop">{CAROUSEL_SVGS[slideIdx]}</div>
            <h3 className="text-2xl font-bold text-white">{slide.title}</h3>
            <p className="mt-3 text-base text-slate-300 leading-relaxed whitespace-pre-line">{slide.body}</p>
            <div className="mt-8">
              <button onClick={handleSlideNext} className="inline-flex items-center gap-2 text-base font-semibold text-white px-7 py-3 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] transition-all shadow-lg shadow-[var(--brand-primary)]/20 hover:scale-[1.03] hover:-translate-y-0.5 duration-[280ms]">
                {isLastSlide ? 'Start Review' : 'Next'}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Review (Drag Sorting) ──
  if (phase === 'review') {
    const placedReady = shuffledCards.filter(c => cardZones[c.id] === 'ready');
    const placedNeeds = shuffledCards.filter(c => cardZones[c.id] === 'needs');
    return (
      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-800/40 border-b border-slate-700/20">
          <p className="text-sm font-semibold text-blue-300 uppercase tracking-wider">AI Approval Checklist</p>
        </div>
        <div className="p-5 lg:p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {/* AI System Summary */}
            <div className="rounded-xl bg-slate-900/80 border border-slate-700/40 px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-base font-semibold text-slate-100">{config.systemName}</p>
                <p className="text-xs text-slate-300 mt-0.5">{config.systemPurpose}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-[11px] font-medium text-[var(--brand-primary)] bg-[var(--brand-primary)]/20 border border-[var(--brand-primary)]/30">Ready for Ethical Review</span>
            </div>

            {/* Draggable Cards Tray */}
            {unplacedCards.length > 0 && (
              <div>
                <p className="text-xs text-slate-300 mb-2 uppercase tracking-wider">Review Cards</p>
                <div className="flex flex-wrap gap-2">
                  {unplacedCards.map(card => (
                    <div key={card.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, card.id)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium cursor-grab active:cursor-grabbing select-none transition-all bg-slate-900/80 border border-slate-700/40 text-slate-200 hover:border-blue-500/40 ${wrongDrop?.id === card.id ? 'aac-shake border-rose-500/50' : ''}`}
                    >
                      {card.text}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {unplacedCards.length === 0 && (
              <div className="text-center py-3">
                <p className="text-sm text-emerald-400 font-medium">All items reviewed</p>
              </div>
            )}

            {/* Drop Zones */}
            <div className="grid grid-cols-2 gap-4">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, 'ready')}
                className="rounded-xl border-2 border-dashed border-emerald-500/30 bg-emerald-900/5 p-4 min-h-[120px] transition-all"
              >
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Ready for Release</p>
                {placedReady.map(card => (
                  <div key={card.id} className="px-3 py-2 rounded-lg bg-emerald-900/20 border border-emerald-500/20 text-sm text-emerald-200 mb-1.5 last:mb-0 aac-pop">
                    {card.text}
                  </div>
                ))}
              </div>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, 'needs')}
                className="rounded-xl border-2 border-dashed border-amber-500/30 bg-amber-900/5 p-4 min-h-[120px] transition-all"
              >
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Needs Attention</p>
                {placedNeeds.map(card => (
                  <div key={card.id} className="px-3 py-2 rounded-lg bg-amber-900/20 border border-amber-500/20 text-sm text-amber-200 mb-1.5 last:mb-0 aac-pop">
                    {card.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Wrong Drop Feedback */}
            {wrongDrop && (
              <div className="rounded-xl bg-rose-900/15 border border-rose-500/25 p-4 aac-slide">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-rose-300 mb-1">Try again</p>
                    <p className="text-sm text-rose-200/80">{wrongDrop.explanation}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Dashboard ──
  if (phase === 'dashboard') {
    const dashTotal = config.dashboardItems.length;
    const passCount = config.dashboardItems.filter(item =>
      item.cardIds.every(cid => cardZones[cid] === 'ready')
    ).length;
    const finalScore = passCount / dashTotal;
    const scoreLabel = finalScore >= 0.8 ? 'Ready to Deploy' : finalScore >= 0.5 ? 'Needs Improvement' : 'Significant Issues';
    const scoreColor = finalScore >= 0.8 ? 'text-emerald-400' : finalScore >= 0.5 ? 'text-amber-400' : 'text-rose-400';
    const scoreBorder = finalScore >= 0.8 ? 'border-emerald-500/30' : finalScore >= 0.5 ? 'border-amber-500/30' : 'border-rose-500/30';
    const scoreBg = finalScore >= 0.8 ? 'from-emerald-600/20' : finalScore >= 0.5 ? 'from-amber-600/20' : 'from-rose-600/20';

    return (
      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-800/40 border-b border-slate-700/20">
          <p className="text-sm font-semibold text-blue-300 uppercase tracking-wider">Ethical Readiness Dashboard</p>
        </div>
        <div className="p-6 lg:p-8">
          <div className="max-w-xl mx-auto space-y-6">
            {/* Checklist */}
            <div className="space-y-2">
              {config.dashboardItems.map(item => {
                const pass = item.cardIds.every(cid => cardZones[cid] === 'ready');
                return (
                  <div key={item.label} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700/30">
                    {pass ? (
                      <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <polyline points="20,6 9,17 4,12" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-rose-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                    )}
                    <span className={`text-sm font-medium ${pass ? 'text-emerald-200' : 'text-rose-200'}`}>{item.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Readiness Score */}
            <div className={`rounded-xl border ${scoreBorder} bg-gradient-to-br ${scoreBg} to-slate-800/40 p-6 text-center`}>
              <p className="text-xs text-slate-300 uppercase tracking-wider mb-3">Ethical Readiness Score</p>
              <div className="text-5xl font-bold text-white mb-2 aac-pop">{score}%</div>
              <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${scoreColor} bg-slate-900/60 border ${scoreBorder}`}>{scoreLabel}</span>
            </div>

            <div className="flex justify-center pt-2">
              <button onClick={() => setPhase('decision')}
                className="inline-flex items-center gap-2 text-base font-semibold text-white px-7 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-600/20">
                Continue to Final Decision
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Final Decision ──
  if (phase === 'decision') {
    const shouldImprove = config.cards.some(c => cardZones[c.id] === 'needs');
    const isCorrect = (decision === 'improve') === shouldImprove;

    return (
      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-800/40 border-b border-slate-700/20">
          <p className="text-sm font-semibold text-blue-300 uppercase tracking-wider">Final Decision</p>
        </div>
        <div className="p-6 lg:p-8">
          <div className="max-w-lg mx-auto space-y-6">
            <p className="text-base text-slate-200 text-center font-medium">Should this AI system be approved for public use?</p>

            {/* Decision Buttons */}
            <div className="flex flex-col items-center gap-3">
              <button onClick={() => handleDecision('approve')} disabled={decisionFeedback}
                className={`w-full max-w-xs px-6 py-3 rounded-xl text-base font-semibold transition-all ${
                  decisionFeedback
                    ? decision === 'approve'
                      ? isCorrect ? 'bg-emerald-900/30 border-2 border-emerald-500/60 text-emerald-300' : 'bg-rose-900/20 border-2 border-rose-500/30 text-rose-300'
                      : 'bg-slate-800/50 border border-slate-700/30 text-slate-300'
                    : 'bg-slate-900/60 border border-slate-700/40 text-slate-200 hover:border-emerald-500/40 hover:bg-slate-800/60'
                }`}>
                Approve AI System
              </button>
              <button onClick={() => handleDecision('improve')} disabled={decisionFeedback}
                className={`w-full max-w-xs px-6 py-3 rounded-xl text-base font-semibold transition-all ${
                  decisionFeedback
                    ? decision === 'improve'
                      ? isCorrect ? 'bg-emerald-900/30 border-2 border-emerald-500/60 text-emerald-300' : 'bg-rose-900/20 border-2 border-rose-500/30 text-rose-300'
                      : 'bg-slate-800/50 border border-slate-700/30 text-slate-300'
                    : 'bg-slate-900/60 border border-slate-700/40 text-slate-200 hover:border-amber-500/40 hover:bg-slate-800/60'
                }`}>
                Request Improvements
              </button>
            </div>

            {/* Decision Feedback */}
            {decisionFeedback && (
              <div className={`rounded-xl p-5 aac-slide ${
                isCorrect ? 'bg-emerald-900/15 border border-emerald-500/25' : 'bg-rose-900/15 border border-rose-500/25'
              }`}>
                <div className="flex items-start gap-3">
                  <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    {isCorrect
                      ? <polyline points="20,6 9,17 4,12" />
                      : <><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></>
                    }
                  </svg>
                  <div>
                    <p className="text-sm font-semibold mb-1">{isCorrect ? 'Responsible Decision' : 'Consider Carefully'}</p>
                    <p className={`text-sm leading-relaxed ${isCorrect ? 'text-[var(--text-primary)]' : 'text-rose-300'}`}>
                      {isCorrect
                        ? 'Ethical issues should be addressed before deployment.'
                        : 'The AI system still has unresolved ethical issues.'}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex justify-center">
                  <button onClick={handleContinueAfterDecision}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all">
                    See Results
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Complete ──
  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
      <div className="px-6 py-4 bg-slate-800/40 border-b border-slate-700/20" />
      <div className="p-8 space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-white">{config.completionTitle}</h3>
          <p className="text-base text-slate-300 max-w-lg mx-auto">{config.completionMessage}</p>
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          {config.takeaways.map((t, i) => (
            <div key={i} className="flex items-start gap-2.5 text-base text-slate-300">
              <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <polyline points="20,6 9,17 4,12" />
              </svg>
              {t}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-4 pt-3">
          <button onClick={handleTryAgain} className="px-5 py-2.5 text-sm font-semibold text-slate-300 rounded-xl border border-slate-700/50 bg-slate-800/50 hover:bg-slate-700/50 transition-all">
            Try Again
          </button>
          <button onClick={onComplete} className="px-6 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 transition-all shadow-lg shadow-emerald-600/20">
            Continue Learning
          </button>
        </div>
      </div>
    </div>
  );
}
