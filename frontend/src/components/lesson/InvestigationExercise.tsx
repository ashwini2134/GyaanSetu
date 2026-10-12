import { useState } from 'react';
import type { InvestigationConfig } from '../../types/lesson';

function MagnifyingGlass({ className = '', pulse = false }: { className?: string; pulse?: boolean }) {
  return (
    <svg className={`${className} ${pulse ? 'animate-pulse' : ''}`} viewBox="0 0 40 40" fill="none">
      <circle cx="17" cy="17" r="10" stroke="currentColor" strokeWidth="2.5" className="text-indigo-400" />
      <line x1="24" y1="24" x2="33" y2="33" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-indigo-400" />
      <circle cx="17" cy="17" r="4" fill="currentColor" className="text-amber-300/30" />
    </svg>
  );
}

function DetectiveHat({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 30" fill="none">
      <ellipse cx="20" cy="26" rx="16" ry="3" fill="currentColor" className="text-amber-700" />
      <path d="M8 26 L12 6 L28 6 L32 26" fill="currentColor" className="text-amber-600" />
      <rect x="14" y="3" width="12" height="4" rx="2" fill="currentColor" className="text-amber-500" />
    </svg>
  );
}

function Badge({ className = '', pulse = false }: { className?: string; pulse?: boolean }) {
  return (
    <svg className={`${className} ${pulse ? 'animate-bounce' : ''}`} viewBox="0 0 40 40" fill="none">
      <polygon points="20,2 25,14 38,14 28,22 31,36 20,28 9,36 12,22 2,14 15,14" fill="currentColor" className="text-amber-500" />
      <polygon points="20,6 24,15 34,15 26,21 28,32 20,26 12,32 14,21 6,15 16,15" fill="currentColor" className="text-indigo-400" />
      <circle cx="20" cy="19" r="4" fill="currentColor" className="text-amber-200" />
    </svg>
  );
}

function CaseFile({ className = '', animate = false }: { className?: string; animate?: boolean }) {
  return (
    <svg className={`${className} ${animate ? 'animate-pulse' : ''}`} viewBox="0 0 40 40" fill="none">
      <rect x="6" y="10" width="28" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" className="text-amber-500" />
      <rect x="6" y="10" width="28" height="5" rx="1" fill="currentColor" className="text-amber-500/30" />
      <circle cx="20" cy="23" r="3" stroke="currentColor" strokeWidth="1.5" className="text-indigo-400" />
      <line x1="20" y1="26" x2="20" y2="30" stroke="currentColor" strokeWidth="1.5" className="text-indigo-400" />
    </svg>
  );
}

const CATEGORY_VISUALS: Record<string, { gradient: string; border: string; icon: 'phone' | 'map' | 'shield' | 'tv' | 'chat' }> = {
  'Face Unlock': { gradient: 'from-violet-600/20 to-violet-900/10', border: 'border-violet-500/30', icon: 'phone' },
  'Google Maps': { gradient: 'from-emerald-600/20 to-emerald-900/10', border: 'border-emerald-500/30', icon: 'map' },
  'Spam Filter': { gradient: 'from-blue-600/20 to-blue-900/10', border: 'border-blue-500/30', icon: 'shield' },
  'Netflix': { gradient: 'from-red-600/20 to-red-900/10', border: 'border-red-500/30', icon: 'tv' },
  'ChatGPT': { gradient: 'from-teal-600/20 to-teal-900/10', border: 'border-teal-500/30', icon: 'chat' },
};

function CategoryVisual({ name }: { name: string }) {
  const meta = CATEGORY_VISUALS[name] ?? { gradient: 'from-slate-600/20 to-slate-900/10', border: 'border-slate-500/30' };
  return (
    <div className={`w-full rounded-xl bg-gradient-to-br ${meta.gradient} border ${meta.border} flex flex-col items-center justify-center py-5 px-4 relative overflow-hidden`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03)_0%,transparent_60%)]" />
      <span className="text-4xl mb-1.5 block">
        {meta.icon === 'phone' && '📱'}
        {meta.icon === 'map' && '📍'}
        {meta.icon === 'shield' && '🛡️'}
        {meta.icon === 'tv' && '🎬'}
        {meta.icon === 'chat' && '💬'}
      </span>
      <span className="text-sm font-bold text-white">{name}</span>
    </div>
  );
}

interface InvestigationExerciseProps {
  config: InvestigationConfig;
  onComplete: () => void;
  onAttempt?: () => void;
}

export default function InvestigationExercise({ config, onComplete, onAttempt }: InvestigationExerciseProps) {
  const [slideIdx, setSlideIdx] = useState(0);
  const [questionIdx, setQuestionIdx] = useState<number | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  const isCarousel = questionIdx === null && !showCompletion;
  const totalSlides = config.slides.length;
  const isLastSlide = slideIdx === totalSlides - 1;
  const currentQuestion = questionIdx !== null ? config.questions[questionIdx] : null;

  const handleNextSlide = () => {
    if (isLastSlide) {
      setQuestionIdx(0);
    } else {
      setSlideIdx(i => i + 1);
    }
  };

  const handleSelect = (opt: string) => {
    if (submitted) return;
    setSelected(opt);
  };

  const handleSubmit = () => {
    if (!selected || !currentQuestion || submitted) return;
    setSubmitted(true);
    onAttempt?.();
  };

  const handleNextQuestion = () => {
    const next = questionIdx! + 1;
    if (next >= config.questions.length) {
      setShowCompletion(true);
    } else {
      setQuestionIdx(next);
      setSelected(null);
      setSubmitted(false);
    }
  };

  const handleTryAgain = () => {
    setSlideIdx(0);
    setQuestionIdx(null);
    setSelected(null);
    setSubmitted(false);
    setShowCompletion(false);
  };

  if (showCompletion) {
    return (
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-5 bg-slate-800/40 border-b border-slate-700/20 flex flex-col items-center gap-2">
          <Badge className="w-10 h-10" pulse />
          <p className="text-sm font-bold text-indigo-300 uppercase tracking-wider">Case Closed</p>
        </div>
        <div className="p-6 space-y-5">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-bold text-white">{config.completionTitle}</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{config.completionMessage}</p>
          </div>

          <div className="space-y-2">
            {config.completionSummary.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/30 group hover:border-indigo-500/20 transition-all">
                <span className="text-lg group-hover:scale-110 transition-transform">{item.label === 'Face Unlock' ? '📱' : item.label === 'Google Maps' ? '📍' : item.label === 'Spam Filter' ? '🛡️' : item.label === 'Netflix' ? '🎬' : '💬'}</span>
                <span className="text-sm text-slate-300 flex-1">
                  <span className="text-slate-200 font-medium">{item.label}</span>
                  <span className="text-slate-300 mx-1.5">&rarr;</span>
                  <span className="text-indigo-300 font-medium">{item.value}</span>
                </span>
                <MagnifyingGlass className="w-4 h-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button onClick={handleTryAgain} className="px-4 py-2 text-xs font-semibold text-slate-300 rounded-lg border border-slate-700/50 bg-slate-800/50 hover:bg-slate-700/50 transition-all">
              Solve Again
            </button>
            <button onClick={onComplete} className="px-5 py-2 text-xs font-semibold text-white rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
              Continue Learning
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isCarousel) {
    const slide = config.slides[slideIdx];
    return (
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-700/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MagnifyingGlass className="w-5 h-5 text-indigo-400" pulse />
            <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">AI Detective</p>
          </div>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${
                i === slideIdx ? 'bg-indigo-400 scale-125 shadow-sm shadow-indigo-400/50' : i < slideIdx ? 'bg-indigo-600' : 'bg-slate-600'
              }`} />
            ))}
          </div>
        </div>

        <div className="p-6">
          <div className="max-w-lg mx-auto text-center space-y-5">
            <div className="flex justify-center">
              {slideIdx === 0 && <MagnifyingGlass className="w-14 h-14 text-indigo-400" pulse />}
              {slideIdx === 1 && <DetectiveHat className="w-14 h-14 text-amber-500" />}
              {slideIdx === 2 && <Badge className="w-14 h-14 text-amber-500" pulse />}
            </div>
            <h3 className="text-lg font-bold text-white">{slide.title}</h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{slide.body}</p>
            <button onClick={handleNextSlide} className="inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
              {isLastSlide ? 'Start Investigation' : 'Next'}
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const isCorrect = submitted && selected === currentQuestion.correct;
  const total = config.questions.length;
  const qIdx = questionIdx!;

  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
      <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-700/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CaseFile className="w-5 h-5 text-indigo-400" animate />
          <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Case {qIdx + 1} of {total}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${
              i < qIdx ? 'bg-indigo-500' : i === qIdx ? 'bg-indigo-400 scale-125 shadow-sm shadow-indigo-400/50' : 'bg-slate-600'
            }`} />
          ))}
        </div>
      </div>

      <div className="p-5 space-y-4">
        <CategoryVisual name={currentQuestion.category} />

        <div className="relative p-4 rounded-xl bg-slate-800/50 border border-slate-700/30 overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500/40 to-transparent" />
          <p className="text-sm text-slate-200 leading-relaxed pl-2">{currentQuestion.scenario}</p>
        </div>

        <p className="text-sm font-bold text-white flex items-center gap-2">
          <MagnifyingGlass className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          {currentQuestion.question}
        </p>

        <div className="space-y-2">
          {currentQuestion.options.map((opt, i) => {
            let border = 'border-slate-700/50 hover:border-slate-500/50';
            let bg = 'bg-slate-800/40 hover:bg-slate-700/40';
            let textColor = 'text-slate-200';

            if (submitted) {
              if (opt === currentQuestion.correct) {
                border = 'border-indigo-500/50';
                bg = 'bg-indigo-900/20';
                textColor = 'text-indigo-300';
              } else if (opt === selected) {
                border = 'border-red-500/50';
                bg = 'bg-red-900/20';
                textColor = 'text-red-300';
              } else {
                border = 'border-slate-700/30';
                bg = 'bg-slate-800/30';
                textColor = 'text-slate-300';
              }
            } else if (opt === selected) {
              border = 'border-indigo-500/50';
              bg = 'bg-indigo-900/20';
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(opt)}
                disabled={submitted}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border ${border} ${bg} text-left transition-all disabled:cursor-default group`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all ${
                  submitted && opt === currentQuestion.correct
                    ? 'bg-indigo-500/20 text-indigo-400'
                    : submitted && opt === selected
                    ? 'bg-red-500/20 text-red-400'
                    : opt === selected
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : 'bg-slate-700/40 text-slate-300 group-hover:bg-slate-600/40 group-hover:text-slate-300'
                }`}>
                  {submitted && opt === currentQuestion.correct ? '\u2713' : submitted && opt === selected ? '\u2717' : String.fromCharCode(65 + i)}
                </span>
                <span className={`text-sm ${textColor}`}>{opt}</span>
              </button>
            );
          })}
        </div>

        {!submitted && selected && (
          <button onClick={handleSubmit} className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-white px-5 min-h-[44px] rounded-xl bg-[var(--button-primary-bg)] hover:bg-[var(--button-primary-hover)] transition-all shadow-md">
            Submit Answer
          </button>
        )}

        {submitted && (
          <div className={`p-4 rounded-xl ${isCorrect ? 'bg-indigo-900/15 border border-indigo-500/30' : 'bg-red-900/15 border border-red-500/30'}`}>
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? (
                <Badge className="w-6 h-6 text-indigo-400" />
              ) : (
                <MagnifyingGlass className="w-5 h-5 text-red-400" />
              )}
              <p className={`text-sm font-bold ${isCorrect ? 'text-indigo-300' : 'text-red-300'}`}>
                {isCorrect ? 'Correct!' : 'Not quite.'}
              </p>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed pl-8">{currentQuestion.explanation}</p>
            <button onClick={handleNextQuestion} className="mt-3 ml-8 inline-flex items-center gap-2 text-xs font-semibold text-white px-4 py-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 transition-all">
              {qIdx + 1 >= total ? 'Close Case' : 'Next Case'}
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
