import { useState, useMemo } from 'react';
import type { PizzaOptimizationConfig, PizzaToppingConfig } from '../../types/lesson';

if (typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.textContent = `
@keyframes pz-topping-in { 0% { opacity: 0; transform: scale(0) rotate(-20deg); } 60% { transform: scale(1.1) rotate(3deg); } 100% { opacity: 1; transform: scale(1) rotate(0deg); } }
@keyframes pz-score-jump { 0% { transform: scale(1); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }
@keyframes pz-fade-in { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes pz-slide-in { 0% { opacity: 0; transform: translateX(-20px); } 100% { opacity: 1; transform: translateX(0); } }
@keyframes pz-slide-out { 0% { opacity: 1; transform: translateX(0); } 100% { opacity: 0; transform: translateX(20px); } }
@keyframes pz-glow { 0%,100% { box-shadow: 0 0 0 rgba(239,68,68,0); } 50% { box-shadow: 0 0 20px rgba(239,68,68,0.3); } }
@keyframes pz-check-pop { 0% { transform: scale(0); } 60% { transform: scale(1.3); } 100% { transform: scale(1); } }
.pz-anim-topping { animation: pz-topping-in 0.5s ease-out forwards; }
.pz-anim-score { animation: pz-score-jump 0.35s ease-out; }
.pz-anim-fade { animation: pz-fade-in 0.4s ease-out forwards; }
.pz-anim-slide-in { animation: pz-slide-in 0.4s ease-out forwards; }
.pz-anim-slide-out { animation: pz-slide-out 0.3s ease-in forwards; }
.pz-anim-glow { animation: pz-glow 1.5s ease-in-out infinite; }
.pz-anim-check { animation: pz-check-pop 0.5s ease-out forwards; }
`;
  document.head.appendChild(s);
}

interface Props {
  config: PizzaOptimizationConfig;
  onComplete: () => void;
  onAttempt?: () => void;
}

type Phase = 'carousel' | 'playing' | 'stopped' | 'complete';

const MAX_ROUNDS = 4;

const RATINGS = [
  { min: 0, label: 'Needs Work', color: '#ef4444' },
  { min: 55, label: 'Decent', color: '#f97316' },
  { min: 65, label: 'Good', color: '#eab308' },
  { min: 75, label: 'Great', color: '#22c55e' },
  { min: 85, label: 'Excellent', color: '#22c55e' },
];

function getRating(score: number) {
  let best = RATINGS[0];
  for (const r of RATINGS) {
    if (score >= r.min) best = r;
  }
  return best;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const BAD_OPTIONS = [
  { id: 'burnt-crust', name: 'Burnt Crust', score: -8, color: '#57534e' },
  { id: 'too-much-sauce', name: 'Too Much Sauce', score: -6, color: '#b91c1c' },
  { id: 'stale-cheese', name: 'Stale Cheese', score: -5, color: '#a16207' },
  { id: 'soggy-dough', name: 'Soggy Dough', score: -7, color: '#78716c' },
  { id: 'cold-toppings', name: 'Cold Toppings', score: -4, color: '#94a3b8' },
];

interface RoundOption {
  topping: PizzaToppingConfig;
  outcome: 'improve' | 'reduce' | 'neutral';
}

function evaluateOutcome(score: number): 'improve' | 'reduce' | 'neutral' {
  if (score > 0) return 'improve';
  if (score < 0) return 'reduce';
  return 'neutral';
}

function randomPizzaPos(): { x: number; y: number } {
  const angle = Math.random() * Math.PI * 2;
  const r = 10 + Math.random() * 25;
  return { x: 50 + Math.cos(angle) * r, y: 50 + Math.sin(angle) * r };
}

function ToppingShape({ topping, x, y, size }: { topping: PizzaToppingConfig; x: number; y: number; size: number }) {
  const s = size;
  const h = s / 2;
  switch (topping.id) {
    case 'pepperoni':
      return (
        <g>
          <circle cx={x} cy={y} r={h} fill={topping.color} fillOpacity="0.9" />
          <circle cx={x - h * 0.25} cy={y - h * 0.25} r={h * 0.35} fill={topping.color} fillOpacity="0.6" />
          <circle cx={x + h * 0.2} cy={y + h * 0.2} r={h * 0.25} fill={topping.color} fillOpacity="0.5" />
        </g>
      );
    case 'mushrooms':
      return (
        <g>
          <ellipse cx={x} cy={y - h * 0.2} rx={h * 0.8} ry={h * 0.6} fill={topping.color} fillOpacity="0.85" />
          <rect x={x - h * 0.15} y={y - h * 0.1} width={h * 0.3} height={h * 0.7} rx={h * 0.1} fill="#57534e" fillOpacity="0.7" />
          <ellipse cx={x} cy={y - h * 0.3} rx={h * 0.2} ry={h * 0.15} fill="#a8a29e" fillOpacity="0.4" />
        </g>
      );
    case 'olives':
      return (
        <g>
          <ellipse cx={x} cy={y} rx={h * 0.6} ry={h * 0.4} transform={`rotate(${Math.random() * 60 - 30},${x},${y})`} fill={topping.color} fillOpacity="0.85" />
          <ellipse cx={x} cy={y} rx={h * 0.2} ry={h * 0.15} fill="#065f46" fillOpacity="0.5" />
        </g>
      );
    case 'capsicum':
      return (
        <g>
          <path d={`M${x} ${y - h} Q${x + h} ${y - h * 0.5} ${x + h * 0.8} ${y} Q${x + h * 0.5} ${y + h * 0.8} ${x} ${y} Q${x - h * 0.5} ${y + h * 0.8} ${x - h * 0.8} ${y} Q${x - h} ${y - h * 0.5} ${x} ${y - h}Z`} fill={topping.color} fillOpacity="0.8" stroke="#16a34a" strokeWidth="0.5" />
          <line x1={x} y1={y - h * 0.8} x2={x} y2={y - h * 0.2} stroke="#15803d" strokeWidth="0.8" />
        </g>
      );
    case 'tomatoes':
      return (
        <g>
          <circle cx={x} cy={y} r={h} fill={topping.color} fillOpacity="0.85" />
          <path d={`M${x} ${y - h * 0.7} Q${x + h * 0.3} ${y - h * 0.8} ${x + h * 0.1} ${y - h * 0.3}`} stroke="#b91c1c" strokeWidth="0.6" fill="none" />
          <circle cx={x - h * 0.15} cy={y - h * 0.15} r={h * 0.15} fill="#fca5a5" fillOpacity="0.3" />
        </g>
      );
    case 'corn':
      return (
        <g>
          <ellipse cx={x} cy={y} rx={h * 0.5} ry={h * 0.8} fill={topping.color} fillOpacity="0.85" />
          {Array.from({ length: 4 }).map((_, i) => (
            <ellipse key={i} cx={x + (i - 1.5) * h * 0.25} cy={y - h * 0.3 + i * h * 0.2} rx={h * 0.15} ry={h * 0.2} fill="#ca8a04" fillOpacity="0.5" />
          ))}
        </g>
      );
    case 'jalapenos':
      return (
        <g>
          <path d={`M${x} ${y + h} C${x - h * 0.5} ${y + h * 0.3} ${x - h * 0.8} ${y - h * 0.3} ${x} ${y - h} C${x + h * 0.8} ${y - h * 0.3} ${x + h * 0.5} ${y + h * 0.3} ${x} ${y + h}Z`} fill={topping.color} fillOpacity="0.8" stroke="#4d7c0f" strokeWidth="0.5" />
          <line x1={x} y1={y - h * 0.6} x2={x} y2={y + h * 0.6} stroke="#3f6212" strokeWidth="0.5" />
        </g>
      );
    case 'onions':
      return (
        <g>
          <circle cx={x} cy={y} r={h} fill={topping.color} fillOpacity="0.7" stroke="#cbd5e1" strokeWidth="0.5" />
          <path d={`M${x} ${y - h * 0.8} Q${x + h * 0.4} ${y} ${x} ${y + h * 0.8}`} stroke="#94a3b8" strokeWidth="0.4" fill="none" />
          <path d={`M${x} ${y - h * 0.8} Q${x - h * 0.4} ${y} ${x} ${y + h * 0.8}`} stroke="#94a3b8" strokeWidth="0.4" fill="none" />
        </g>
      );
    default:
      return <circle cx={x} cy={y} r={h} fill={topping.color} fillOpacity="0.85" />;
  }
}

function getNeighborFeedback(outcome: 'improve' | 'reduce' | 'neutral'): string {
  switch (outcome) {
    case 'improve': return 'This neighbour improves your pizza.';
    case 'reduce': return 'This option would reduce the overall quality.';
    case 'neutral': return 'This neighbour does not change the score.';
  }
}

export default function PizzaOptimization({ config, onComplete, onAttempt }: Props) {
  const [phase, setPhase] = useState<Phase>('carousel');
  const [slideIdx, setSlideIdx] = useState(0);
  const [selectedToppings, setSelectedToppings] = useState<PizzaToppingConfig[]>([]);
  const [scoreAnim, setScoreAnim] = useState(false);
  const [round, setRound] = useState(0);
  const [scoreHistory, setScoreHistory] = useState<number[]>([config.baseScore]);
  const [compositionHistory, setCompositionHistory] = useState<string[]>(['Cheese']);
  const [roundOptions, setRoundOptions] = useState<RoundOption[]>([]);
  const [chosenOptionId, setChosenOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [fadingIds, setFadingIds] = useState<string[]>([]);
  const [conclusion, setConclusion] = useState<'local' | 'global'>('local');

  const totalSlides = config.slides.length;
  const isLastSlide = slideIdx === totalSlides - 1;

  const TOOLTIP_POOL = useMemo(() => {
    return config.toppings.filter(t => t.id !== 'cheese');
  }, [config.toppings]);

  const currentScore = useMemo(() => {
    return config.baseScore + selectedToppings.reduce((sum, t) => sum + t.score, 0);
  }, [selectedToppings, config.baseScore]);

  const usedIds = useMemo(() => new Set(selectedToppings.map(t => t.id)), [selectedToppings]);
  const availablePool = useMemo(() => TOOLTIP_POOL.filter(t => !usedIds.has(t.id)), [TOOLTIP_POOL, usedIds]);

  const bestPossibleScore = useMemo(() => {
    const sorted = [...TOOLTIP_POOL].filter(t => t.score > 0).sort((a, b) => b.score - a.score);
    return config.baseScore + sorted.slice(0, MAX_ROUNDS).reduce((sum, t) => sum + t.score, 0);
  }, [TOOLTIP_POOL, config.baseScore]);

  const toppingPositions = useMemo(() => {
    return selectedToppings.map(() => randomPizzaPos());
  }, [selectedToppings.length]);

  const rating = getRating(currentScore);

  const generateRound = () => {
    const avail = availablePool;
    const shuffled = shuffle(avail);
    const chosen = shuffled.slice(0, 3);

    if (chosen.length === 0) {
      doStopRound();
      return;
    }

    const options: RoundOption[] = chosen.map(t => ({
      topping: t,
      outcome: evaluateOutcome(t.score),
    }));

    setRoundOptions(options);
    setChosenOptionId(null);
    setFadingIds([]);
    setFeedback(null);
    setPhase('playing');
  };

  const doStopRound = () => {
    const badPool = shuffle(BAD_OPTIONS).slice(0, 3);
    const options: RoundOption[] = badPool.map(b => ({
      topping: b as PizzaToppingConfig,
      outcome: 'reduce',
    }));
    setRoundOptions(options);
    setChosenOptionId(null);
    setFadingIds([]);
    setFeedback(null);
    setPhase('stopped');
    onAttempt?.();
  };

  const handleSlideNext = () => {
    if (isLastSlide) {
      setPhase('playing');
      setTimeout(generateRound, 200);
    } else {
      setSlideIdx(i => i + 1);
    }
  };

  const handleChoose = (option: RoundOption) => {
    setChosenOptionId(option.topping.id);

    // Fade out unchosen options
    const otherIds = roundOptions.filter(o => o.topping.id !== option.topping.id).map(o => o.topping.id);
    setFadingIds(otherIds);

    // Show feedback
    setFeedback(getNeighborFeedback(option.outcome));
    setScoreAnim(true);
    setTimeout(() => setScoreAnim(false), 350);

    // Update state after animation delay
    setTimeout(() => {
      const newSelected = [...selectedToppings, option.topping];
      const newScore = config.baseScore + newSelected.reduce((sum, t) => sum + t.score, 0);

      setSelectedToppings(newSelected);
      setRound(r => r + 1);
      setScoreHistory(prev => [...prev, newScore]);

      const lastCombo = compositionHistory[compositionHistory.length - 1];
      setCompositionHistory(prev => [...prev, `${lastCombo} + ${option.topping.name}`]);

      setRoundOptions([]);
      setChosenOptionId(null);
      setFadingIds([]);
      setFeedback(null);

      onAttempt?.();

      // Next round or stop
      if (round + 1 >= MAX_ROUNDS) {
        setTimeout(doStopRound, 400);
      } else {
        setTimeout(generateRound, 400);
      }
    }, 600);
  };

  const handleViewResults = () => {
    // Determine if student reached global optimum
    const reachedBest = currentScore >= bestPossibleScore;
    setConclusion(reachedBest ? 'global' : 'local');
    setPhase('complete');
  };

  const handleContinue = () => {
    onComplete();
  };

  const handleTryAgain = () => {
    setSelectedToppings([]);
    setScoreHistory([config.baseScore]);
    setCompositionHistory(['Cheese']);
    setRound(0);
    setPhase('carousel');
    setSlideIdx(0);
    setRoundOptions([]);
    setChosenOptionId(null);
    setFadingIds([]);
    setFeedback(null);
  };

  const maxScoreBar = Math.max(...scoreHistory, bestPossibleScore);

  // ── Carousel ──
  if (phase === 'carousel') {
    const slide = config.slides[slideIdx];
    return (
      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-700/20 flex items-center justify-between">
          <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Optimization in Action</p>
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
                  <circle cx="24" cy="24" r="18" stroke="#f59e0b" strokeWidth="1.5" fill="#f59e0b" fillOpacity="0.1" />
                  <circle cx="24" cy="24" r="14" stroke="#f97316" strokeWidth="1" fill="#f97316" fillOpacity="0.15" />
                  <circle cx="19" cy="20" r="3" fill="#e11d48" fillOpacity="0.5" />
                  <circle cx="29" cy="22" r="3" fill="#e11d48" fillOpacity="0.5" />
                  <circle cx="24" cy="30" r="3" fill="#e11d48" fillOpacity="0.5" />
                </svg>
              )}
              {slideIdx === 1 && (
                <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                  <rect x="4" y="14" width="12" height="20" rx="2" stroke="#f59e0b" strokeWidth="1.5" fill="#f59e0b" fillOpacity="0.1" />
                  <text x="10" y="12" fontSize="5" fill="#22c55e" textAnchor="middle">+8</text>
                  <rect x="18" y="14" width="12" height="20" rx="2" stroke="#f59e0b" strokeWidth="1.5" fill="#f59e0b" fillOpacity="0.1" />
                  <text x="24" y="12" fontSize="5" fill="#eab308" textAnchor="middle">+4</text>
                  <rect x="32" y="14" width="12" height="20" rx="2" stroke="#f59e0b" strokeWidth="1.5" fill="#f59e0b" fillOpacity="0.1" />
                  <text x="38" y="12" fontSize="5" fill="#ef4444" textAnchor="middle">-10</text>
                </svg>
              )}
              {slideIdx === 2 && (
                <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                  <polyline points="6,36 14,28 22,30 30,18 38,20" stroke="#f59e0b" strokeWidth="1.5" fill="none" />
                  <circle cx="6" cy="36" r="3" fill="#475569" />
                  <circle cx="30" cy="18" r="3" fill="#f59e0b" />
                  <circle cx="42" cy="18" r="3" fill="#34d399" stroke="#34d399" strokeWidth="1.5" strokeDasharray="3 2" />
                  <text x="6" y="42" fontSize="4" fill="#94a3b8" textAnchor="middle">Start</text>
                  <text x="30" y="16" fontSize="4" fill="#f59e0b" textAnchor="middle">You</text>
                  <text x="42" y="16" fontSize="4" fill="#34d399" textAnchor="middle">Best</text>
                </svg>
              )}
            </div>
            <h3 className="text-lg font-bold text-white">{slide.title}</h3>
            <p className="mt-4 text-sm text-slate-300 leading-relaxed whitespace-pre-line max-w-md mx-auto">{slide.body}</p>
            <div className="mt-7">
              <button onClick={handleSlideNext} className="inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 transition-all shadow-lg shadow-amber-600/20">
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

  // ── Complete (Summary) ──
  if (phase === 'complete') {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-4 bg-slate-800/40 border-b border-slate-700/20 text-center">
          <p className="text-sm font-bold text-emerald-300 uppercase tracking-wider">Optimization Complete</p>
        </div>
        <div className="p-6 space-y-5">
          {/* Journey visualization */}
          <div className="rounded-xl bg-slate-900/60 border border-slate-700/40 p-4">
            <p className="text-[10px] text-slate-300 uppercase tracking-wider mb-3 text-center">Your Optimization Journey</p>
            <div className="flex items-center justify-center gap-1 flex-wrap">
              {scoreHistory.map((s, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className={`rounded-lg px-2.5 py-1.5 ${i === 0 ? 'bg-slate-800/80 border border-slate-700/40' : 'bg-amber-900/20 border border-amber-500/30'}`}>
                    <p className="text-[9px] text-slate-300 font-mono">{compositionHistory[i] || `Step ${i}`}</p>
                    <p className="text-xs font-bold font-mono text-center text-amber-300">{s}</p>
                  </div>
                  {i < scoreHistory.length - 1 && <span className="text-slate-300 text-xs mt-0.5">↓</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Score bars */}
          <div className="rounded-xl bg-slate-900/60 border border-slate-700/40 p-4">
            <p className="text-[10px] text-slate-300 uppercase tracking-wider mb-3 text-center">Score Comparison</p>
            <div className="flex items-end justify-center gap-4 h-28">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-mono font-bold text-slate-300">{config.baseScore}</span>
                <div className="w-8 rounded-t" style={{ height: `${(config.baseScore / maxScoreBar) * 80}px`, backgroundColor: '#475569' }} />
                <span className="text-[8px] text-slate-300">Start</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-mono font-bold text-amber-300">{currentScore}</span>
                <div className="w-8 rounded-t" style={{ height: `${(currentScore / maxScoreBar) * 80}px`, backgroundColor: '#f59e0b' }} />
                <span className="text-[8px] text-slate-300">Your Pizza</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-mono font-bold text-emerald-400">{bestPossibleScore}</span>
                <div className="w-8 rounded-t" style={{ height: `${(bestPossibleScore / maxScoreBar) * 80}px`, backgroundColor: '#34d399' }} />
                <span className="text-[8px] text-slate-300">Best Possible</span>
              </div>
            </div>
          </div>

          {/* Local vs Global explanation */}
          <div className={`rounded-xl p-4 ${conclusion === 'global' ? 'bg-emerald-900/15 border border-emerald-500/30' : 'bg-amber-900/15 border border-amber-500/30'}`}>
            <p className={`text-xs font-bold mb-2 ${conclusion === 'global' ? 'text-emerald-300' : 'text-amber-300'}`}>
              {conclusion === 'global'
                ? 'Congratulations. This time the Local Optimum was also the Global Optimum.'
                : 'You reached a Local Optimum.'}
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              {conclusion === 'global'
                ? 'Every neighbour you evaluated improved your pizza, and you found the best possible combination. In Hill Climbing terms, the search found the global peak because every move led uphill to the highest point.'
                : `Every neighbouring topping made the pizza worse, so the search stopped. However, a better combination existed elsewhere (score ${bestPossibleScore}). This is exactly how Hill Climbing works — it finds a peak, but not always the highest one.`}
            </p>
          </div>

          {/* Connection to lecture */}
          <div className="rounded-xl bg-gradient-to-br from-amber-600/10 to-slate-800/40 border border-amber-500/20 p-4">
            <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2">How This is Optimization</p>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold flex-shrink-0">1.</span>
                <span>Started with one solution: <span className="text-amber-300">Cheese pizza (score {config.baseScore})</span></span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold flex-shrink-0">2.</span>
                <span>Each round, evaluated <span className="text-amber-300">neighbouring options</span> (nearby solutions)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold flex-shrink-0">3.</span>
                <span>Always picked the <span className="text-amber-300">best improvement</span> — just like Hill Climbing</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold flex-shrink-0">4.</span>
                <span>Stopped when <span className="text-amber-300">no neighbour improved</span> the score</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold flex-shrink-0">5.</span>
                <span>{conclusion === 'global' ? 'Found the global optimum' : 'Reached a local optimum, but a global optimum existed'}</span>
              </div>
            </div>
          </div>

          {/* Takeaways */}
          <div className="space-y-1.5">
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
            <button onClick={handleContinue} className="px-5 py-2 text-xs font-semibold text-white rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 transition-all shadow-lg shadow-emerald-600/20">
              Continue Learning
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Stopped ──
  if (phase === 'stopped') {
    return (
      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-700/20">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Optimization in Action</p>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-700/40">
                <span className="text-[10px] text-slate-300">Round: </span>
                <span className="text-xs font-bold text-white">{round + 1}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="max-w-lg mx-auto space-y-5">
            {/* Pizza */}
            <div className="flex justify-center">
              <div className="rounded-xl bg-slate-900/60 border border-slate-700/40 p-4">
                <svg viewBox="0 0 100 100" className="w-48 h-48">
                  <defs>
                    <radialGradient id="pc2" cx="50%" cy="50%" r="50%">
                      <stop offset="85%" stopColor="#92400e" />
                      <stop offset="100%" stopColor="#78350f" />
                    </radialGradient>
                    <radialGradient id="ps2" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#dc2626" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.35" />
                    </radialGradient>
                  </defs>
                  <circle cx="50" cy="50" r="48" fill="url(#pc2)" stroke="#78350f" strokeWidth="1.5" />
                  <circle cx="50" cy="50" r="41" fill="url(#ps2)" />
                  <circle cx="50" cy="50" r="39" fill="#fef08a" fillOpacity="0.12" />
                  {selectedToppings.map((topping, i) => {
                    const pos = toppingPositions[i];
                    return (
                      <g key={`${topping.id}-${i}`} className="pz-anim-topping">
                        <ToppingShape topping={topping} x={pos.x} y={pos.y} size={10} />
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* No Better Neighbour */}
            <div className="rounded-xl bg-red-900/15 border border-red-500/30 p-4 text-center pz-anim-glow">
              <p className="text-sm font-bold text-red-300 mb-1">No Better Neighbouring Solution Exists</p>
              <p className="text-xs text-slate-300">Every available topping would reduce the pizza score. Hill Climbing stops here.</p>
            </div>

            {/* Optimization Journey */}
            <div className="rounded-xl bg-slate-900/60 border border-slate-700/40 p-4">
              <p className="text-[10px] text-slate-300 uppercase tracking-wider mb-2">Optimization Journey</p>
              <div className="flex items-center gap-1 flex-wrap">
                {compositionHistory.map((step, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className={`text-xs font-mono font-bold ${i === compositionHistory.length - 1 ? 'text-amber-300' : 'text-slate-300'}`}>
                      {step.split(' + ').pop()}
                    </span>
                    <span className={`text-[9px] font-mono ${i === compositionHistory.length - 1 ? 'text-amber-400' : 'text-slate-300'}`}>
                      ({scoreHistory[i]})
                    </span>
                    {i < compositionHistory.length - 1 && <span className="text-slate-300 text-[10px]">→</span>}
                  </span>
                ))}
              </div>
            </div>

            {/* Optimization Progress */}
            <div className="rounded-xl bg-slate-900/60 border border-slate-700/40 p-4">
              <p className="text-[10px] text-slate-300 uppercase tracking-wider mb-2">Optimization Progress</p>
              <div className="flex items-center gap-1 flex-wrap">
                {Array.from({ length: round + 1 }).map((_, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${i < round ? 'bg-amber-900/30 text-amber-300 border border-amber-500/30' : 'bg-red-900/30 text-red-300 border border-red-500/30'}`}>
                      {i < round ? `Round ${i + 1}` : 'Stopped'}
                    </span>
                    {i < round && <span className="text-slate-300 text-[10px]">↓</span>}
                  </span>
                ))}
              </div>
            </div>

            <button onClick={handleViewResults} className="w-full min-h-[44px] text-xs font-semibold text-white rounded-xl bg-[var(--button-primary-bg)] hover:bg-[var(--button-primary-hover)] transition-all shadow-md">
              View Results
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Playing (Round) ──
  return (
    <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
      <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-700/20">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Optimization in Action</p>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-700/40">
              <span className="text-[10px] text-slate-300">Score: </span>
              <span className={`text-xs font-bold text-amber-300 ${scoreAnim ? 'pz-anim-score' : ''}`}>{currentScore}</span>
            </div>
            <div className="px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-700/40">
              <span className="text-[10px] text-slate-300">Round: </span>
              <span className="text-xs font-bold text-white">{round + 1}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="flex gap-5 flex-col md:flex-row">
          {/* Pizza */}
          <div className="flex-shrink-0 flex flex-col items-center">
            <div className="rounded-xl bg-slate-900/60 border border-slate-700/40 p-4">
              <svg viewBox="0 0 100 100" className="w-48 h-48 md:w-56 md:h-56">
                <defs>
                  <radialGradient id="pc" cx="50%" cy="50%" r="50%">
                    <stop offset="85%" stopColor="#92400e" />
                    <stop offset="100%" stopColor="#78350f" />
                  </radialGradient>
                  <radialGradient id="ps" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#dc2626" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.35" />
                  </radialGradient>
                </defs>
                <circle cx="50" cy="50" r="48" fill="url(#pc)" stroke="#78350f" strokeWidth="1.5" />
                <circle cx="50" cy="50" r="41" fill="url(#ps)" />
                <circle cx="50" cy="50" r="39" fill="#fef08a" fillOpacity="0.12" />
                {selectedToppings.map((topping, i) => {
                  const pos = toppingPositions[i];
                  return (
                    <g key={`${topping.id}-${i}`} className="pz-anim-topping">
                      <ToppingShape topping={topping} x={pos.x} y={pos.y} size={10} />
                    </g>
                  );
                })}
                {selectedToppings.length === 0 && (
                  <text x="50" y="48" textAnchor="middle" fontSize="5" fill="#64748b">Cheese Pizza</text>
                )}
              </svg>
              <p className="text-center text-[10px] text-slate-300 mt-1">
                {selectedToppings.length === 0 ? 'This is your starting solution.' : `${selectedToppings.length} topping${selectedToppings.length !== 1 ? 's' : ''} placed`}
              </p>
            </div>
          </div>

          {/* Right panel */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Score & Rating */}
            <div className="rounded-xl bg-slate-900/60 border border-slate-700/40 p-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-slate-300">Pizza Score</p>
                  <p className={`text-2xl font-bold ${scoreAnim ? 'pz-anim-score' : ''}`} style={{ color: rating.color }}>{currentScore}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-300">Rating</p>
                  <p className="text-sm font-bold text-white" style={{ color: rating.color }}>{rating.label}</p>
                </div>
              </div>
              {currentScore > config.baseScore && (
                <p className="text-[10px] text-slate-300 mt-2">
                  Improved by <span className="text-emerald-400 font-bold">+{currentScore - config.baseScore}</span>
                </p>
              )}
            </div>

            {/* Neighbour Choices */}
            <div>
              <p className="text-[10px] text-slate-300 uppercase tracking-wider mb-2">
                Round {round + 1} — Choose a Neighbour
              </p>
              <div className="space-y-2">
                {roundOptions.map(option => {
                  const isChosen = chosenOptionId === option.topping.id;
                  const isFading = fadingIds.includes(option.topping.id);
                  return (
                    <button
                      key={option.topping.id}
                      onClick={() => { if (!chosenOptionId) handleChoose(option); }}
                      disabled={chosenOptionId !== null}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left ${
                        isChosen
                          ? 'bg-emerald-900/20 border-emerald-500/50 opacity-100'
                          : isFading
                            ? 'bg-slate-900/40 border-slate-700/20 opacity-30 pz-anim-slide-out'
                            : chosenOptionId
                              ? 'bg-slate-900/40 border-slate-700/20 opacity-30'
                              : 'bg-slate-900/60 border-slate-700/40 hover:border-amber-500/50 hover:bg-slate-800/60'
                      } ${!chosenOptionId && !isFading ? 'pz-anim-slide-in' : ''}`}
                    >
                      {isChosen && (
                        <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 pz-anim-check">
                          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                            <polyline points="20,6 9,17 4,12" />
                          </svg>
                        </span>
                      )}
                      {!isChosen && (
                        <span className="w-5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: option.topping.color }} />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium ${isChosen ? 'text-emerald-300' : 'text-slate-200'}`}>{option.topping.name}</p>
                        <p className={`text-[10px] font-mono ${option.outcome === 'improve' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {option.topping.score >= 0 ? `+${option.topping.score}` : option.topping.score}
                        </p>
                      </div>
                      {isChosen && (
                        <span className="text-[10px] text-emerald-400 font-medium">{getNeighborFeedback(option.outcome)}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback */}
            {feedback && (
              <div className="rounded-xl bg-amber-900/15 border border-amber-500/30 p-3 pz-anim-fade">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-slate-300">{feedback}</p>
                </div>
              </div>
            )}

            {/* Optimization Journey */}
            <div className="rounded-xl bg-slate-900/60 border border-slate-700/40 p-3">
              <p className="text-[10px] text-slate-300 uppercase tracking-wider mb-1.5">Optimization Journey</p>
              <div className="flex flex-wrap items-center gap-1 text-xs">
                {compositionHistory.map((step, i) => (
                  <span key={i} className="inline-flex items-center gap-1">
                    <span className={`text-[10px] font-mono font-bold ${i === compositionHistory.length - 1 ? 'text-amber-300' : 'text-slate-300'}`}>
                      {step.split(' + ').pop()}
                    </span>
                    {i < compositionHistory.length - 1 && <span className="text-slate-300 text-[10px]">→</span>}
                  </span>
                ))}
              </div>
            </div>

            {/* Optimization Progress */}
            <div className="rounded-xl bg-slate-900/60 border border-slate-700/40 p-3">
              <p className="text-[10px] text-slate-300 uppercase tracking-wider mb-1.5">Optimization Progress</p>
              <div className="flex items-center gap-1 flex-wrap">
                {Array.from({ length: round + 1 }).map((_, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${i < round ? 'bg-amber-900/30 text-amber-300 border border-amber-500/30' : 'bg-slate-800/60 text-slate-300 border border-slate-700/40'}`}>
                      Round {i + 1}
                    </span>
                    {i < round && <span className="text-slate-300 text-[10px]">→</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
