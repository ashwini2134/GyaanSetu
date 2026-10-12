import { useState, useCallback, useEffect, useRef } from 'react';
import type { MarkovChainPracticeConfig } from '../../types/lesson';

if (typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.textContent = `
@keyframes mc-fade { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes mc-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); } 50% { box-shadow: 0 0 0 10px rgba(99,102,241,0); } }
@keyframes mc-pop { 0% { transform: scale(0); } 60% { transform: scale(1.15); } 100% { transform: scale(1); } }
@keyframes mc-shake { 0%,100% { transform: translateX(0); } 20%,60% { transform: translateX(-4px); } 40%,80% { transform: translateX(4px); } }
.anim-mc-fade { animation: mc-fade 0.4s ease-out forwards; }
.anim-mc-pulse { animation: mc-pulse 2s ease-in-out infinite; }
.anim-mc-pop { animation: mc-pop 0.3s ease-out forwards; }
.anim-mc-shake { animation: mc-shake 0.4s ease-out; }
`;
  document.head.appendChild(s);
}

interface Props {
  config: MarkovChainPracticeConfig;
  onComplete: () => void;
  onAttempt?: () => void;
}

type Phase = 'intro' | 'simulate' | 'quiz' | 'complete';

const STATES = ['sunny', 'cloudy', 'rainy'];
const STATE_COLORS: Record<string, { label: string; text: string; bg: string; border: string; dot: string }> = {
  sunny: { label: 'Sunny', text: 'text-amber-300', bg: 'bg-amber-500/20', border: 'border-amber-500/30', dot: 'bg-amber-400' },
  cloudy: { label: 'Cloudy', text: 'text-slate-300', bg: 'bg-slate-500/20', border: 'border-slate-500/30', dot: 'bg-slate-400' },
  rainy: { label: 'Rainy', text: 'text-blue-300', bg: 'bg-blue-500/20', border: 'border-blue-500/30', dot: 'bg-blue-400' },
};

export default function MarkovChainPractice({ config, onComplete, onAttempt }: Props) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [slideIdx, setSlideIdx] = useState(0);
  const [current, setCurrent] = useState('sunny');
  const [history, setHistory] = useState<string[]>(['sunny']);
  const [animating, setAnimating] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [lastTransition, setLastTransition] = useState<{ from: string; to: string } | null>(null);
  const autoRef = useRef<number | null>(null);
  const [quizIdx, setQuizIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showingResult, setShowingResult] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const slides = [
    { title: 'Markov Chains & Weather', body: 'Weather follows patterns. If today is Sunny, tomorrow is likely Sunny too — but not guaranteed. A Markov Chain models this using transition probabilities between states.' },
    { title: 'The Transition Matrix', body: 'Each row shows the probabilities of moving FROM a state TO every other state. The probabilities in each row must sum to 1.0 (100%).' },
    { title: 'Your Task', body: 'First, step through the chain day by day to see how it behaves. Then answer questions about the probabilities to test your understanding.' },
  ];

  const totalSlides = slides.length;
  const isLastSlide = slideIdx === totalSlides - 1;

  const handleSlideNext = () => {
    if (isLastSlide) {
      setPhase('simulate');
    } else {
      setSlideIdx(i => i + 1);
    }
  };

  const tm = config.transitionMatrix;

  const step = useCallback(() => {
    if (animating) return;
    setShowResult(false);
    setAnimating(true);
    const probs = tm[current];
    const r = Math.random();
    let cumulative = 0;
    let next = STATES[0];
    for (const s of STATES) {
      cumulative += probs[s] || 0;
      if (r < cumulative) { next = s; break; }
    }
    setLastTransition({ from: current, to: next });
    setTimeout(() => {
      setCurrent(next);
      setHistory(prev => [...prev, next]);
      setAnimating(false);
      setShowResult(true);
    }, 400);
  }, [current, animating, tm]);

  useEffect(() => {
    if (autoPlay) {
      autoRef.current = window.setInterval(step, 800);
      return () => { if (autoRef.current) clearInterval(autoRef.current); };
    } else {
      if (autoRef.current) clearInterval(autoRef.current);
    }
  }, [autoPlay, step]);

  const startQuiz = () => {
    if (autoRef.current) clearInterval(autoRef.current);
    setAutoPlay(false);
    onAttempt?.();
    setPhase('quiz');
  };

  const handleAnswer = (idx: number) => {
    if (showingResult) return;
    setSelectedAnswer(idx);
    setShowingResult(true);
  };

  const nextQuestion = () => {
    if (selectedAnswer !== null) {
      setAnswers(prev => [...prev, selectedAnswer]);
    }
    if (quizIdx < config.questions.length - 1) {
      setQuizIdx(i => i + 1);
      setSelectedAnswer(null);
      setShowingResult(false);
    } else {
      if (selectedAnswer !== null) {
        const finalAnswers = [...answers, selectedAnswer];
        const correct = finalAnswers.filter((a, i) => a === config.questions[i].correctIndex).length;
        if (correct === config.questions.length) {
          onComplete();
        }
      }
      setPhase('complete');
    }
  };

  const total = history.length;
  const distribution = STATES.reduce((acc, s) => {
    acc[s] = total > 0 ? ((history.filter(h => h === s).length / total) * 100).toFixed(1) : '0.0';
    return acc;
  }, {} as Record<string, string>);
  const probs = tm[current];

  const resetSim = () => {
    if (autoRef.current) clearInterval(autoRef.current);
    setAutoPlay(false);
    setCurrent('sunny');
    setHistory(['sunny']);
    setLastTransition(null);
    setShowResult(false);
  };

  if (phase === 'intro') {
    return (
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-700/20 flex items-center justify-between">
          <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Markov Chain Practice</p>
          <p className="text-[10px] text-slate-300">{slideIdx + 1} / {totalSlides}</p>
        </div>
        <div className="p-5">
          <div key={slideIdx} className="anim-mc-fade space-y-4">
            <h3 className="text-sm font-bold text-white">{slides[slideIdx].title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{slides[slideIdx].body}</p>
            {slideIdx === 1 && (
              <div className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-3">
                <div className="grid grid-cols-4 gap-1 text-[9px] font-medium text-slate-300 mb-1">
                  <div />
                  {STATES.map(s => <div key={s} className={`text-center ${STATE_COLORS[s].text}`}>{STATE_COLORS[s].label}</div>)}
                </div>
                {STATES.map(from => (
                  <div key={from} className="grid grid-cols-4 gap-1 text-[9px] py-1 border-b border-slate-800/40 last:border-0">
                    <div className={`font-medium ${STATE_COLORS[from].text}`}>{STATE_COLORS[from].label}</div>
                    {STATES.map(to => (
                      <div key={to} className="text-center text-slate-300">{(tm[from][to] * 100).toFixed(0)}%</div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={handleSlideNext}
              className="px-4 py-2 text-xs font-semibold text-white rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
              {isLastSlide ? 'Start Simulating' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'simulate') {
    return (
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-700/20 flex items-center justify-between">
          <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Weather Simulation</p>
          <p className="text-[10px] text-slate-300">{total - 1} steps taken</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-4 text-center">
              <p className="text-[10px] text-slate-300 mb-2">Current weather</p>
              <div className={`text-lg font-bold ${STATE_COLORS[current].text}`}>{STATE_COLORS[current].label}</div>
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${STATE_COLORS[current].bg} border ${STATE_COLORS[current].border} text-lg font-bold ${STATE_COLORS[current].text} mt-2 mb-3`}>
                {current.charAt(0).toUpperCase()}
              </div>
              <div className="flex gap-2 justify-center">
                <button onClick={step} disabled={animating}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-xs font-bold text-indigo-300 hover:bg-indigo-600/30 transition-colors disabled:opacity-40">
                  {animating ? '...' : 'Next Day'}
                </button>
                <button onClick={() => setAutoPlay(p => !p)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${autoPlay ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-300' : 'bg-slate-700/30 border-slate-700/50 text-slate-300 hover:bg-slate-700/50'}`}>
                  {autoPlay ? 'Pause' : 'Auto'}
                </button>
                <button onClick={resetSim}
                  className="px-3 py-1.5 rounded-lg border border-slate-700/50 text-xs font-bold text-slate-300 hover:bg-slate-700/30 transition-colors">
                  Reset
                </button>
              </div>
            </div>
            <div className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-4">
              <p className="text-[10px] text-slate-300 mb-2">What happened</p>
              {showResult && lastTransition ? (
                <div className="space-y-1">
                  <p className="text-xs text-slate-300">
                    <span className={STATE_COLORS[lastTransition.from].text}>{STATE_COLORS[lastTransition.from].label}</span>
                    <span className="text-slate-300"> → </span>
                    <span className={STATE_COLORS[lastTransition.to].text}>{STATE_COLORS[lastTransition.to].label}</span>
                  </p>
                  <p className="text-[10px] text-slate-300">
                    Took the <span className="text-indigo-400 font-medium">{(tm[lastTransition.from][lastTransition.to] * 100).toFixed(0)}%</span> probability path
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-300">Press <span className="text-indigo-400">Next Day</span> to advance.</p>
              )}
              {animating && (
                <div className="mt-2 flex items-center gap-1 text-[10px] text-indigo-400">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                  Picking next state...
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-3">
              <p className="text-[10px] font-bold text-slate-300 mb-2">Distribution ({total} days)</p>
              <div className="space-y-1.5">
                {STATES.map(s => {
                  const pct = distribution[s];
                  return (
                    <div key={s}>
                      <div className="flex justify-between text-[10px] mb-0.5">
                        <span className={`font-medium ${STATE_COLORS[s].text}`}>{STATE_COLORS[s].label}</span>
                        <span className="text-slate-300">{pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className={`h-full rounded-full ${STATE_COLORS[s].dot} transition-all duration-500 opacity-60`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-3">
              <p className="text-[10px] font-bold text-slate-300 mb-2">Path</p>
              <div className="flex flex-wrap gap-0.5">
                {history.map((s, i) => (
                  <div key={i} className={`w-4 h-4 rounded text-[7px] font-bold flex items-center justify-center ${STATE_COLORS[s].bg} ${STATE_COLORS[s].text} border ${STATE_COLORS[s].border} ${i === history.length - 1 ? 'ring-1 ring-indigo-500/40' : ''}`}>
                    {s.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {total >= 5 && (
            <div className="anim-mc-fade">
              <button onClick={startQuiz}
                className="w-full px-4 py-2.5 text-xs font-semibold text-white rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
                Test Your Understanding
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'quiz') {
    const q = config.questions[quizIdx];
    const isCorrect = showingResult && selectedAnswer === q.correctIndex;
    const isWrong = showingResult && selectedAnswer !== null && selectedAnswer !== q.correctIndex;
    const scoreSoFar = [...answers, ...(showingResult && selectedAnswer !== null ? [selectedAnswer] : [])];
    const correctSoFar = scoreSoFar.filter((a, i) => a === config.questions[i].correctIndex).length;

    if (showingResult) {
      setTimeout(() => {}, 0);
    }

    return (
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-700/20 flex items-center justify-between">
          <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Quiz</p>
          <p className="text-[10px] text-slate-300">{quizIdx + 1} / {config.questions.length}</p>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-1 mb-3">
            {config.questions.map((_, i) => {
              const ans = answers[i];
              const answered = ans !== undefined;
              const isAnsCorrect = answered && ans === config.questions[i].correctIndex;
              return (
                <div key={i} className={`w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center border ${
                  i === quizIdx && !showingResult ? 'border-indigo-500 bg-indigo-900/20 text-indigo-300' :
                  answered && isAnsCorrect ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300' :
                  answered && !isAnsCorrect ? 'border-red-500 bg-red-900/20 text-red-300' :
                  'border-slate-700/50 bg-slate-800/50 text-slate-300'
                }`}>{i + 1}</div>
              );
            })}
          </div>
          <p className="text-xs text-slate-300 mb-1">Question {quizIdx + 1} of {config.questions.length}</p>
          <p className="text-sm font-bold text-white mb-4">{q.question}</p>
          <div className="space-y-2 mb-4">
            {q.options.map((opt, i) => {
              const isSelected = selectedAnswer === i;
              return (
                <button key={i} onClick={() => handleAnswer(i)}
                  disabled={showingResult}
                  className={`w-full text-left px-4 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                    showingResult && i === q.correctIndex
                      ? 'border-indigo-500/50 bg-indigo-900/20 text-indigo-300'
                      : showingResult && isSelected && i !== q.correctIndex
                      ? 'border-red-500/50 bg-red-900/20 text-red-300'
                      : isSelected
                      ? 'border-indigo-500/30 bg-indigo-900/10 text-indigo-300'
                      : 'border-slate-700/50 bg-slate-800/50 text-slate-300 hover:border-slate-600/50'
                  }`}>
                  {opt}
                </button>
              );
            })}
          </div>
          {showingResult && (
            <div className={`rounded-xl p-3 mb-3 ${isCorrect ? 'bg-indigo-900/15 border border-indigo-500/30' : 'bg-red-900/15 border border-red-500/30'}`}>
              <p className={`text-xs font-bold mb-1 ${isCorrect ? 'text-indigo-300' : 'text-red-300'}`}>
                {isCorrect ? 'Correct!' : 'Not quite.'}
              </p>
              <p className="text-[11px] text-slate-300">{q.explanation}</p>
            </div>
          )}
          <div className="flex justify-between items-center">
            <p className="text-[10px] text-slate-300">Score: {correctSoFar}/{quizIdx + (showingResult ? 1 : 0)}</p>
            {showingResult && (
              <button onClick={nextQuestion}
                className="px-4 py-2 text-xs font-semibold text-white rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
                {quizIdx < config.questions.length - 1 ? 'Next Question' : 'See Results'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const finalAnswers = answers;
  const correctCount = finalAnswers.filter((a, i) => a === config.questions[i].correctIndex).length;
  const allCorrect = correctCount === config.questions.length;

  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
      <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-700/20">
        <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">{config.completionTitle}</p>
      </div>
      <div className="p-5 text-center space-y-4">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${allCorrect ? 'bg-indigo-600/20' : 'bg-amber-600/20'} mb-2`}>
          {allCorrect ? (
            <svg className="w-8 h-8 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20,6 9,17 4,12" />
            </svg>
          ) : (
            <span className="text-2xl text-amber-400">{correctCount}/{config.questions.length}</span>
          )}
        </div>
        <p className="text-sm font-bold text-white">{allCorrect ? config.completionMessage : `You got ${correctCount} of ${config.questions.length} correct.`}</p>
        <div className="max-w-md mx-auto">
          <p className="text-xs text-slate-300 leading-relaxed">{allCorrect ? 'You understand how Markov Chains transition between states and how probabilities determine the next state.' : 'Review the transition matrix and try stepping through more days to see the patterns.'}</p>
        </div>
        {allCorrect && (
          <div className="rounded-xl bg-slate-900/30 border border-slate-800/60 p-4 max-w-md mx-auto text-left">
            <p className="text-[10px] font-bold text-indigo-300 mb-2 uppercase tracking-wider">Key Takeaways</p>
            <ul className="space-y-1">
              {config.takeaways.map((t, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-indigo-400 mt-0.5">-</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}
        <button onClick={onComplete}
          className="px-5 py-2 text-xs font-semibold text-white rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
          {allCorrect ? 'Continue Learning' : 'Try Again'}
        </button>
      </div>
    </div>
  );
}
