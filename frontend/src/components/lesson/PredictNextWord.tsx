import { useState, useEffect, useRef } from 'react';
import type { PredictNextWordConfig } from '../../types/lesson';

if (typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.textContent = `
@keyframes pnw-pulse { 0%,100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 1; transform: scale(1.2); } }
@keyframes pnw-slide { 0% { opacity: 0; transform: translateY(14px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes pnw-pop { 0% { opacity: 0; transform: scale(0.6); } 100% { opacity: 1; transform: scale(1); } }
@keyframes pnw-think { 0% { opacity: 0.3; } 50% { opacity: 1; } 100% { opacity: 0.3; } }
.pnw-slide { animation: pnw-slide 0.5s ease-out forwards; }
.pnw-pop { animation: pnw-pop 0.4s ease-out forwards; }
.pnw-think { animation: pnw-think 1.2s ease-in-out infinite; }
`;
  document.head.appendChild(s);
}

interface Props {
  config: PredictNextWordConfig;
  onComplete: () => void;
  onAttempt?: () => void;
}

interface PredictionRound {
  sentence: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

const PREDICTION_ROUNDS: PredictionRound[] = [
  {
    sentence: 'Artificial Intelligence is changing ______',
    options: ['Education', 'Banana', 'Window', 'Elephant'],
    correctIdx: 0,
    explanation: 'The previous words create a context about technology. "Education" is the most likely continuation because AI is commonly discussed in the context of transforming learning.',
  },
  {
    sentence: 'The capital of France is ______',
    options: ['Paris', 'Football', 'Tokyo', 'Apple'],
    correctIdx: 0,
    explanation: 'Language models learn relationships between words from massive text collections. "Paris" and "France" appear together so often that the model knows they are related.',
  },
  {
    sentence: 'I forgot my umbrella because it was ______',
    options: ['Raining', 'Keyboard', 'Sleeping', 'Pizza'],
    correctIdx: 0,
    explanation: 'The earlier words strongly suggest weather. "Umbrella" creates a strong association with "raining" — language models learn these patterns from millions of texts.',
  },
  {
    sentence: 'The cat chased the ______',
    options: ['Mouse', 'Laptop', 'Cloud', 'Building'],
    correctIdx: 0,
    explanation: 'The prediction comes from context rather than memorising complete sentences. "Cat" and "mouse" have a strong learned association from countless stories and descriptions.',
  },
];

interface ContextPair {
  sentence: string;
  options: string[];
  correctIdx: number;
  context: string;
}

const CONTEXT_PAIRS: ContextPair[] = [
  {
    sentence: 'The fisherman sat on the river ______',
    options: ['Bank', 'Banana', 'School', 'Rocket'],
    correctIdx: 0,
    context: 'Here "bank" means the edge of a river — a geographical feature.',
  },
  {
    sentence: 'The manager went to the ______ to deposit money.',
    options: ['Bank', 'Banana', 'Forest', 'Mountain'],
    correctIdx: 0,
    context: 'Here "bank" means a financial institution where money is kept.',
  },
];

interface SimilarityWord {
  word: string;
  correctZone: 'very' | 'similar' | 'not';
}

const SIMILARITY_WORDS: SimilarityWord[] = [
  { word: 'Queen', correctZone: 'very' },
  { word: 'Prince', correctZone: 'similar' },
  { word: 'Apple', correctZone: 'not' },
  { word: 'Banana', correctZone: 'not' },
];

type Zone = 'very' | 'similar' | 'not';
const ZONE_LABELS: Record<Zone, string> = { very: 'Very Similar', similar: 'Similar', not: 'Not Similar' };


export default function PredictNextWord({ config, onComplete, onAttempt }: Props) {
  const [phase, setPhase] = useState<'carousel' | 'build' | 'complete'>('carousel');
  const [slideIdx, setSlideIdx] = useState(0);
  const [stage, setStage] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [thinking, setThinking] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [contextIdx, setContextIdx] = useState(0);
  const [contextDone, setContextDone] = useState(false);
  const [dragWord, setDragWord] = useState<string | null>(null);
  const [zones, setZones] = useState<Record<string, Zone>>({});
  const [similarityRevealed, setSimilarityRevealed] = useState(false);
  const thinkTimer = useRef<number | null>(null);

  const totalSlides = config.slides.length;
  const isLastSlide = slideIdx === totalSlides - 1;

  useEffect(() => {
    return () => {
      if (thinkTimer.current) clearTimeout(thinkTimer.current);
    };
  }, []);

  const handleSlideNext = () => {
    if (isLastSlide) setPhase('build');
    else setSlideIdx(i => i + 1);
  };

  const resetRound = () => {
    setSelectedAnswer(null);
    setThinking(false);
    setRevealed(false);
  };

  const handlePredict = (idx: number) => {
    if (revealed || thinking) return;
    onAttempt?.();
    setSelectedAnswer(idx);
    setThinking(true);
    thinkTimer.current = window.setTimeout(() => {
      setThinking(false);
      setRevealed(true);
    }, 1200);
  };

  const handleNextRound = () => {
    const next = stage + 1;
    if (next < PREDICTION_ROUNDS.length) {
      setStage(next);
      resetRound();
    } else {
      setStage(PREDICTION_ROUNDS.length);
      setContextIdx(0);
      setContextDone(false);
      resetRound();
    }
  };

  const isInPrediction = stage < PREDICTION_ROUNDS.length;
  const isInContext = stage === PREDICTION_ROUNDS.length && !contextDone;
  const isInSimilarity = stage === PREDICTION_ROUNDS.length + 1 || (contextDone && stage >= PREDICTION_ROUNDS.length);

  const handleContextPredict = (idx: number) => {
    if (revealed || thinking) return;
    onAttempt?.();
    setSelectedAnswer(idx);
    setThinking(true);
    thinkTimer.current = window.setTimeout(() => {
      setThinking(false);
      setRevealed(true);
    }, 1200);
  };

  const handleNextContext = () => {
    if (contextIdx < CONTEXT_PAIRS.length - 1) {
      setContextIdx(i => i + 1);
      resetRound();
    } else {
      setContextDone(true);
      setStage(PREDICTION_ROUNDS.length + 1);
      resetRound();
    }
  };

  const handleDragStart = (e: React.DragEvent, word: string) => {
    e.dataTransfer.setData('text/plain', word);
    setDragWord(word);
  };

  const handleDropOnZone = (e: React.DragEvent, zone: Zone) => {
    e.preventDefault();
    const word = e.dataTransfer.getData('text/plain');
    if (!word) return;
    onAttempt?.();
    setZones(prev => ({ ...prev, [word]: zone }));
    setDragWord(null);
  };

  const handleSimilarityReveal = () => {
    setSimilarityRevealed(true);
    onAttempt?.();
  };

  const allPlaced = SIMILARITY_WORDS.every(w => zones[w.word]);

  const handleTryAgain = () => {
    if (thinkTimer.current) clearTimeout(thinkTimer.current);
    thinkTimer.current = null;
    setPhase('carousel');
    setSlideIdx(0);
    setStage(0);
    setSelectedAnswer(null);
    setThinking(false);
    setRevealed(false);
    setContextIdx(0);
    setContextDone(false);
    setDragWord(null);
    setZones({});
    setSimilarityRevealed(false);
  };

  // ── Carousel ──
  if (phase === 'carousel') {
    const slide = config.slides[slideIdx];
    const slideSvgs = [
      <svg key="s1" className="w-16 h-16 mx-auto mb-4 text-purple-400" viewBox="0 0 80 80" fill="none">
        <rect x="8" y="20" width="64" height="16" rx="8" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.25" />
        <text x="40" y="31" textAnchor="middle" fontSize="9" fill="currentColor" fillOpacity="0.9">AI is changing</text>
        <rect x="16" y="48" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
        <rect x="38" y="48" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
        <rect x="60" y="48" width="12" height="18" rx="4" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3,2" />
        <text x="25" y="59" textAnchor="middle" fontSize="6" fill="currentColor" fillOpacity="0.75">Educ</text>
        <text x="47" y="59" textAnchor="middle" fontSize="6" fill="currentColor" fillOpacity="0.75">Banana</text>
        <text x="66" y="59" textAnchor="middle" fontSize="6" fill="currentColor" fillOpacity="0.6">?</text>
      </svg>,
      <svg key="s2" className="w-16 h-16 mx-auto mb-4 text-purple-400" viewBox="0 0 80 80" fill="none">
        <rect x="12" y="12" width="56" height="56" rx="12" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.12" />
        <rect x="22" y="22" width="36" height="10" rx="4" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.25" />
        <text x="40" y="29" textAnchor="middle" fontSize="6" fill="currentColor" fillOpacity="0.9">Context</text>
        <line x1="40" y1="32" x2="40" y2="44" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="40" cy="50" r="6" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.25" />
        <text x="40" y="53" textAnchor="middle" fontSize="8" fill="currentColor">?</text>
        <path d="M34 50 L28 44 M46 50 L52 44" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </svg>,
      <svg key="s3" className="w-16 h-16 mx-auto mb-4 text-emerald-400" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="24" stroke="currentColor" strokeWidth="2" strokeDasharray="4,4" fill="currentColor" fillOpacity="0.12" />
        <circle cx="40" cy="40" r="14" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.25" />
        <circle cx="40" cy="40" r="5" fill="currentColor" fillOpacity="0.5" />
        <path d="M40 14 L40 18 M40 62 L40 66 M14 40 L18 40 M62 40 L66 40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>,
    ];
    return (
      <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-800/40 border-b border-slate-700/20 flex items-center justify-between">
          <p className="text-sm font-semibold text-purple-300 uppercase tracking-wider">Predict the Next Word</p>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                i === slideIdx ? 'bg-purple-400 scale-125 shadow-sm shadow-purple-400/50' : i < slideIdx ? 'bg-purple-500/70' : 'bg-slate-500/60'
              }`} />
            ))}
          </div>
        </div>
        <div className="px-8 pt-6 pb-8">
          <div className="mx-auto text-center max-w-lg">
            <div className="pnw-pop">{slideSvgs[slideIdx] || slideSvgs[0]}</div>
            <h3 className="text-2xl font-bold text-white">{slide.title}</h3>
            <p className="mt-3 text-base text-slate-300 leading-relaxed whitespace-pre-line">{slide.body}</p>
            <div className="mt-8">
              <button onClick={handleSlideNext} className="inline-flex items-center gap-2 text-base font-semibold text-white px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
                {isLastSlide ? 'Start Predicting' : 'Next'}
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

  // ── Build ──
  if (phase === 'build') {
    const stageLabel = isInPrediction
      ? `Round ${stage + 1} of 4`
      : isInContext
        ? `Context Demo ${contextIdx + 1} of 2`
        : 'Word Similarity';

    return (
      <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-800/40 border-b border-slate-700/20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-purple-200 uppercase tracking-wider">Predict the Next Word</p>
            <p className="text-xs text-slate-200">{stageLabel}</p>
          </div>
        </div>

        <div className="p-6 lg:p-8">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* ── Conversation header ── */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-600/50">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <span className="text-[10px] text-white font-bold">AI</span>
              </div>
              <span className="text-xs text-slate-200">Language Model</span>
            </div>

            {/* ── Prediction Rounds ── */}
            {isInPrediction && (() => {
              const round = PREDICTION_ROUNDS[stage];
              return (
                <>
                  <div className="rounded-xl bg-slate-900/90 border border-slate-600/50 px-6 py-5">
                    <p className="text-sm text-slate-200 mb-1">Complete the sentence</p>
                    <p className="text-lg font-medium text-slate-100 leading-relaxed">
                      {round.sentence.split('______').map((part, i, arr) => (
                        <span key={i}>
                          {part}
                          {i < arr.length - 1 && (
                            <span className="inline-block min-w-[100px] border-b-2 border-dashed border-purple-400/70 mx-1 pb-0.5 text-purple-200">
                              {revealed ? round.options[round.correctIdx] : ''}
                            </span>
                          )}
                        </span>
                      ))}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {round.options.map((opt, i) => (
                      <button key={i} onClick={() => handlePredict(i)}
                        disabled={revealed || thinking}
                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          revealed && i === round.correctIdx
                            ? 'bg-emerald-900/30 border-2 border-emerald-500/60 text-emerald-200 scale-105'
                            : revealed && i === selectedAnswer
                              ? 'bg-red-900/20 border-2 border-red-500/30 text-red-200'
                              : selectedAnswer === i && thinking
                                ? 'bg-purple-900/20 border-2 border-purple-500/40 text-purple-200'
                                : 'bg-slate-900/60 border border-slate-700/40 text-slate-200 hover:border-purple-500/40 hover:bg-slate-800/60'
                      }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {thinking && (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-900/25 border border-purple-500/30">
                      <div className="w-3 h-3 rounded-full bg-purple-400 pnw-pulse" />
                      <p className="text-sm text-purple-200 font-medium pnw-think">Thinking...</p>
                    </div>
                  )}

                  {revealed && (
                    <div className="rounded-xl bg-slate-900/90 border border-purple-500/40 px-5 py-4 pnw-slide">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-purple-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                          <polyline points="20,6 9,17 4,12" />
                        </svg>
                        <p className="text-sm font-semibold text-purple-200">Prediction</p>
                      </div>
                      <p className="text-base text-slate-200 leading-relaxed">{round.explanation}</p>
                      <div className="mt-4 flex justify-center">
                        <button onClick={handleNextRound}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 transition-all"
                        >
                          {stage < PREDICTION_ROUNDS.length - 1 ? 'Next Sentence' : 'Continue'}
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}

            {/* ── Context Demonstration ── */}
            {isInContext && !contextDone && (() => {
              const pair = CONTEXT_PAIRS[contextIdx];
              return (
                <>
                  {contextIdx === 0 && (
                    <div className="rounded-xl bg-blue-900/20 border border-blue-500/30 px-5 py-3">
                      <p className="text-xs text-blue-200 leading-relaxed">Watch how the same word can mean completely different things depending on the surrounding words.</p>
                    </div>
                  )}

                  <div className="rounded-xl bg-slate-900/90 border border-slate-600/50 px-6 py-5">
                    <p className="text-sm text-slate-200 mb-1">Complete the sentence</p>
                    <p className="text-lg font-medium text-slate-100 leading-relaxed">
                      {pair.sentence.split('______').map((part, i, arr) => (
                        <span key={i}>
                          {part}
                          {i < arr.length - 1 && (
                            <span className="inline-block min-w-[80px] border-b-2 border-dashed border-blue-400/70 mx-1 pb-0.5 text-blue-200">
                              {revealed ? pair.options[pair.correctIdx] : ''}
                            </span>
                          )}
                        </span>
                      ))}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {pair.options.map((opt, i) => (
                      <button key={i} onClick={() => handleContextPredict(i)}
                        disabled={revealed || thinking}
                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          revealed && i === pair.correctIdx
                            ? 'bg-emerald-900/30 border-2 border-emerald-500/60 text-emerald-300 scale-105'
                            : revealed && i === selectedAnswer
                              ? 'bg-red-900/20 border-2 border-red-500/30 text-red-300'
                              : selectedAnswer === i && thinking
                                ? 'bg-purple-900/20 border-2 border-purple-500/40 text-purple-300'
                                : 'bg-slate-900/60 border border-slate-700/40 text-slate-200 hover:border-blue-500/40 hover:bg-slate-800/60'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {thinking && (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-900/25 border border-purple-500/30">
                      <div className="w-3 h-3 rounded-full bg-purple-400 pnw-pulse" />
                      <p className="text-sm text-purple-200 font-medium pnw-think">Thinking...</p>
                    </div>
                  )}

                  {revealed && (
                    <div className="rounded-xl bg-slate-900/90 border border-blue-500/40 px-5 py-4 pnw-slide">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-blue-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                          <polyline points="20,6 9,17 4,12" />
                        </svg>
                        <p className="text-sm font-semibold text-blue-200">Context Matters</p>
                      </div>
                      <p className="text-base text-slate-200 leading-relaxed">{pair.context}</p>
                      <p className="text-sm text-slate-200 mt-2">Although the predicted word is the same, its meaning changes completely depending on the surrounding words. Language models use context to understand meaning.</p>
                      <div className="mt-4 flex justify-center">
                        <button onClick={handleNextContext}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 transition-all"
                        >
                          {contextIdx < CONTEXT_PAIRS.length - 1 ? 'Next Sentence' : 'Continue to Word Similarity'}
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}

            {/* ── Word Similarity ── */}
            {isInSimilarity && (
              <>
                <div className="rounded-xl bg-blue-900/20 border border-blue-500/30 px-5 py-3">
                  <p className="text-xs text-blue-200 leading-relaxed">In the lecture you learned that word embeddings represent words as numbers. Similar words are positioned closer together in mathematical space. Drag each word into the zone that best describes its similarity to <span className="text-blue-100 font-medium">King</span>.</p>
                </div>

                <div className="rounded-xl bg-slate-900/90 border border-slate-600/50 px-6 py-5 text-center">
                  <p className="text-xs text-slate-200 mb-2 uppercase tracking-wider">Reference Word</p>
                  <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-900/30 border border-amber-500/40">
                    <span className="text-lg font-bold text-amber-200">King</span>
                  </div>
                </div>

                {/* Draggable words */}
                <div className="flex flex-wrap gap-3 justify-center">
                  {SIMILARITY_WORDS.map(w => {
                    const placedInZone = zones[w.word];
                    const isCorrect = similarityRevealed && placedInZone === w.correctZone;
                    const isWrong = similarityRevealed && placedInZone && placedInZone !== w.correctZone;
                    return (
                      <div key={w.word}
                        draggable={!similarityRevealed}
                        onDragStart={(e) => handleDragStart(e, w.word)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-grab active:cursor-grabbing select-none ${
                          isCorrect
                            ? 'bg-emerald-900/30 border-2 border-emerald-500/60 text-emerald-300 scale-105'
                            : isWrong
                              ? 'bg-red-900/20 border-2 border-red-500/30 text-red-300'
                              : placedInZone
                                ? 'bg-slate-700 border border-slate-500 text-slate-200'
                                : 'bg-slate-900/60 border border-slate-700/40 text-slate-200 hover:border-purple-500/40'
                        }`}
                      >
                        {w.word}
                      </div>
                    );
                  })}
                </div>

                {/* Drop zones */}
                <div className="grid grid-cols-3 gap-3">
                  {(Object.keys(ZONE_LABELS) as Zone[]).map(zone => (
                    <div key={zone}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDropOnZone(e, zone)}
                      className={`rounded-xl border-2 border-dashed px-3 py-4 text-center transition-all min-h-[80px] ${
                        dragWord ? 'border-purple-500/50 bg-purple-900/10' : 'border-slate-600/40 bg-slate-800/40'
                      }`}
                    >
                      <p className="text-[11px] text-slate-200 uppercase tracking-wider mb-2">{ZONE_LABELS[zone]}</p>
                      <div className="flex flex-wrap gap-1.5 justify-center">
                        {Object.entries(zones).filter(([, v]) => v === zone).map(([word]) => (
                          <span key={word} className="px-2 py-1 rounded text-xs font-medium bg-slate-700 text-slate-200 border border-slate-600">{word}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {!similarityRevealed && (
                  <div className="flex justify-center">
                    <button onClick={handleSimilarityReveal} disabled={!allPlaced}
                      className={`inline-flex items-center gap-2 text-base font-semibold px-5 py-3 rounded-xl transition-all ${
                        allPlaced ? 'text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/20' : 'text-slate-300 bg-slate-600/50 cursor-not-allowed border border-slate-500/50'
                      }`}>
                      Reveal Similarity
                    </button>
                  </div>
                )}

                {similarityRevealed && (
                  <div className="rounded-xl bg-slate-900/90 border border-purple-500/40 px-5 py-4 pnw-slide space-y-2">
                    <p className="text-sm font-semibold text-purple-200">Similarity Results</p>
                    {SIMILARITY_WORDS.map(w => {
                      const label = w.correctZone === 'very' ? 'Very Similar' : w.correctZone === 'similar' ? 'Similar' : 'Not Similar';
                      const color = w.correctZone === 'very' ? 'text-emerald-300' : w.correctZone === 'similar' ? 'text-blue-300' : 'text-slate-300';
                      return (
                        <div key={w.word} className="flex items-center gap-2 text-sm">
                          <span className="text-slate-200 font-medium w-16">King</span>
                          <span className="text-slate-200">&harr;</span>
                          <span className="text-slate-200 w-16">{w.word}</span>
                          <span className={`${color} font-medium`}>{label}</span>
                        </div>
                      );
                    })}
                    <p className="text-xs text-slate-200 mt-3 pt-3 border-t border-slate-700/30">Word embeddings represent words as numbers. Words with similar meanings are positioned closer together in mathematical space — just like the lecture described using cosine similarity.</p>
                    <div className="flex justify-center pt-2">
                      <button onClick={() => { if (thinkTimer.current) clearTimeout(thinkTimer.current); onComplete(); }}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20">
                        Complete Exercise
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </>
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
          <button onClick={onComplete} className="px-6 py-2.5 text-sm font-semibold text-white rounded-xl bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20">
            Continue Learning
          </button>
        </div>
      </div>
    </div>
  );
}
