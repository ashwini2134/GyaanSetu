import { useState, useRef, useEffect } from 'react';
import type { TokenizationConfig } from '../../types/lesson';

interface Props {
  config: TokenizationConfig;
  onComplete: () => void;
  onAttempt?: () => void;
}

interface BowEntry {
  word: string;
  count: number;
  animCount: number;
  revealed: boolean;
}

const ROUNDS = [
  {
    id: 'r1',
    original: 'Artificial Intelligence is transforming education.',
    tokens: ['Artificial', 'Intelligence', 'is', 'transforming', 'education'],
    context: 'Computers see this sentence as one long string of characters. They cannot understand meaning until it is broken into individual tokens.',
    insight: 'Each token is now a separate unit. AI can process each word independently — this is the first step in Natural Language Processing.',
    lectureLink: 'The lecture explained that tokenization is like slicing a pizza. Each slice (token) can be processed separately.',
  },
  {
    id: 'r2',
    original: 'I love machine learning.',
    tokens: ['I', 'love', 'machine', 'learning'],
    context: 'Even short sentences need tokenization. The word "learning" could mean different things in different contexts — but tokenization first, understanding later.',
    insight: 'Every word becomes a separate token. Even tiny words like "I" carry meaning. AI preserves them all.',
    lectureLink: 'The lecture showed that "the cat sat on the mat" becomes ["the", "cat", "sat", "on", "the", "mat"]. Each word stands alone.',
  },
  {
    id: 'r3',
    original: 'Hello, world!',
    tokens: ['Hello', ',', 'world', '!'],
    context: 'Punctuation changes meaning. A comma signals a pause. An exclamation mark signals excitement. AI must capture these clues too.',
    insight: 'Punctuation marks become their own tokens. This helps AI understand sentence structure and emotional tone.',
    lectureLink: 'The lecture mentioned that language is hard for AI because the same word can mean different things. Punctuation tokens help disambiguate.',
  },
];

const BOW_SENTENCES = [
  'the cat sat on the mat',
  'the cat sat on the cat',
];

function getWordFreqs(texts: string[]): BowEntry[] {
  const map = new Map<string, number>();
  for (const t of texts) {
    for (const w of t.split(' ')) {
      map.set(w, (map.get(w) || 0) + 1);
    }
  }
  const entries: BowEntry[] = [];
  for (const [word, count] of map) {
    entries.push({ word, count, animCount: 0, revealed: false });
  }
  entries.sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));
  return entries;
}

export default function TokenizationExercise({ config, onComplete, onAttempt }: Props) {
  const [phase, setPhase] = useState<'carousel' | 'build' | 'complete'>('carousel');
  const [slideIdx, setSlideIdx] = useState(0);
  const [roundIdx, setRoundIdx] = useState(0);
  const [splits, setSplits] = useState<boolean[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [bowEntries, setBowEntries] = useState<BowEntry[]>([]);
  const [bowRevealed, setBowRevealed] = useState(false);
  const [bowDone, setBowDone] = useState(false);
  const [showBowLectureLink, setShowBowLectureLink] = useState(false);
  const revealIdx = useRef(0);
  const bowInterval = useRef<number | null>(null);

  const isInBowRound = roundIdx >= 3;

  useEffect(() => {
    return () => {
      if (bowInterval.current) clearInterval(bowInterval.current);
    };
  }, []);

  const totalSlides = config.slides.length;
  const isLastSlide = slideIdx === totalSlides - 1;

  const handleSlideNext = () => {
    if (isLastSlide) setPhase('build');
    else setSlideIdx(i => i + 1);
  };

  const initRound = (idx: number) => {
    const round = ROUNDS[idx];
    if (!round) return;
    setSplits(new Array(round.tokens.length - 1).fill(false));
    setShowFeedback(false);
  };

  const handleSplit = (gapIdx: number) => {
    if (showFeedback) return;
    onAttempt?.();
    setSplits(prev => {
      if (prev[gapIdx]) return prev;
      const next = [...prev];
      next[gapIdx] = true;
      return next;
    });
  };

  const allSplit = splits.every(s => s) && splits.length > 0;

  const handleContinue = () => {
    setShowFeedback(true);
    if (!allSplit) return;
  };

  const handleNextRound = () => {
    const next = roundIdx + 1;
    if (next >= ROUNDS.length) {
      setRoundIdx(3);
      setBowEntries(getWordFreqs(BOW_SENTENCES));
      setBowRevealed(false);
      setBowDone(false);
      setShowBowLectureLink(false);
    } else {
      setRoundIdx(next);
      initRound(next);
    }
  };

  const handleBowGenerate = () => {
    onAttempt?.();
    setBowRevealed(true);
    setBowEntries(prev => prev.map((e, i) => ({ ...e, revealed: i === 0 })));
    revealIdx.current = 0;

    bowInterval.current = window.setInterval(() => {
      revealIdx.current++;
      setBowEntries(prev => {
        if (revealIdx.current >= prev.length) {
          if (bowInterval.current) clearInterval(bowInterval.current);
          bowInterval.current = null;
          setBowDone(true);
          setTimeout(() => setShowBowLectureLink(true), 600);
          return prev.map(e => ({ ...e, revealed: true, animCount: e.count }));
        }
        return prev.map((e, i) => {
          if (i === revealIdx.current) return { ...e, revealed: true };
          if (i < revealIdx.current) return { ...e, animCount: e.count };
          return e;
        });
      });

      let c = 0;
      const countUp = setInterval(() => {
        c++;
        const entryIdx = revealIdx.current;
        setBowEntries(prev => {
          const next = [...prev];
          if (entryIdx < next.length) {
            next[entryIdx] = { ...next[entryIdx], animCount: Math.min(c, next[entryIdx].count) };
          }
          if (c >= (prev[entryIdx]?.count || 0)) {
            clearInterval(countUp);
          }
          return next;
        });
      }, 200);
    }, 700);
  };

  const handleTryAgain = () => {
    if (bowInterval.current) clearInterval(bowInterval.current);
    bowInterval.current = null;
    setBowEntries([]);
    setBowRevealed(false);
    setBowDone(false);
    setShowBowLectureLink(false);
    setPhase('carousel');
    setSlideIdx(0);
    setRoundIdx(0);
    setSplits([]);
    setShowFeedback(false);
  };

  // ── Carousel ──
  if (phase === 'carousel') {
    const slide = config.slides[slideIdx];
    return (
      <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-800/40 border-b border-slate-700/20 flex items-center justify-between">
          <p className="text-sm font-semibold text-violet-300 uppercase tracking-wider">Break It Down</p>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                i === slideIdx ? 'bg-violet-400 scale-125 shadow-sm shadow-violet-400/50' : i < slideIdx ? 'bg-violet-600/60' : 'bg-slate-600/50'
              }`} />
            ))}
          </div>
        </div>
        <div className="px-8 pt-4 pb-8">
          <div className="mx-auto text-center max-w-lg">
            <h3 className="text-2xl font-bold text-white">{slide.title}</h3>
            <p className="mt-4 text-base text-slate-300 leading-relaxed whitespace-pre-line">{slide.body}</p>
            <div className="mt-8">
              <button onClick={handleSlideNext} className="inline-flex items-center gap-2 text-base font-semibold text-white px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
                {isLastSlide ? 'Start Building' : 'Next'}
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
    return (
      <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/40 border-b border-slate-700/20">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <p className="text-sm font-semibold text-violet-300 uppercase tracking-wider">Break It Down</p>
            <p className="text-xs text-slate-300">{isInBowRound ? 'Step 4 of 4' : `Step ${roundIdx + 1} of 4`}</p>
          </div>
          <div className="flex items-center gap-2">
            {['Tokenize', 'Tokenize', 'Tokenize', 'Bag of Words'].map((label, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 flex-shrink-0 ${
                  i < roundIdx ? 'bg-emerald-400' : i === roundIdx ? 'bg-violet-400 scale-125 shadow-sm shadow-violet-400/50' : 'bg-slate-600/50'
                }`} />
                <span className={`text-xs transition-colors whitespace-nowrap ${
                  i <= roundIdx ? 'text-slate-300' : 'text-slate-300'
                }`}>{label}</span>
                {i < 3 && <div className="flex-1 h-px bg-slate-700/50" />}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 lg:p-8">
          {!isInBowRound && (() => {
            const round = ROUNDS[roundIdx];
            if (!round) return null;
            return (
              <div className="max-w-2xl mx-auto space-y-5">
                {/* Lecture context */}
                <div className="rounded-xl bg-blue-900/15 border border-blue-500/25 px-5 py-3">
                  <p className="text-xs text-blue-300 uppercase tracking-wider font-medium mb-1">From the lecture</p>
                  <p className="text-sm text-blue-200/80 leading-relaxed">{round.lectureLink}</p>
                </div>

                {/* Why this matters */}
                <div className="rounded-xl bg-slate-900/80 border border-slate-700/40 px-5 py-4">
                  <p className="text-xs text-slate-300 mb-2 uppercase tracking-wider font-medium">{roundIdx === 0 ? 'Why tokenize?' : 'What is happening?'}</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{round.context}</p>
                </div>

                {/* Sentence card */}
                <div className="rounded-xl bg-slate-900/80 border border-slate-700/40 px-6 py-5">
                  <p className="text-xs text-slate-300 mb-3 uppercase tracking-wider font-medium">Click between words to split</p>
                  <div className="flex flex-wrap items-center gap-0">
                    {round.tokens.map((token, ti) => (
                      <span key={ti} className="inline-flex items-center">
                        <span className={`px-1 py-1 rounded text-lg font-medium text-slate-200 transition-all duration-300 ${
                          ti > 0 && splits[ti - 1] ? 'ml-2' : ''
                        }`}>
                          {token}
                        </span>
                        {ti < round.tokens.length - 1 && (
                          <span
                            onClick={() => handleSplit(ti)}
                            className={`inline-flex items-center justify-center w-8 h-8 mx-0.5 rounded-full cursor-pointer transition-all duration-300 select-none ${
                              showFeedback ? 'pointer-events-none' : 'hover:bg-violet-500/20'
                            } ${splits[ti] ? 'text-violet-400' : 'text-transparent hover:text-violet-400/60'}`}
                          >
                            {splits[ti] ? (
                              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                <line x1="12" y1="4" x2="12" y2="20" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <circle cx="12" cy="12" r="2" />
                              </svg>
                            )}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Feedback */}
                {showFeedback && allSplit && (
                  <div className="rounded-xl bg-emerald-900/15 border border-emerald-500/30 p-4 nn-slide">
                    <p className="text-sm font-semibold text-emerald-400 mb-2">Sentence Tokenized</p>
                    <p className="text-sm text-slate-300 leading-relaxed">{round.insight}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-300">
                      {round.tokens.map((t, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-medium text-sm">{t}</span>
                          {i < round.tokens.length - 1 && <span className="text-slate-300">|</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {showFeedback && !allSplit && (
                  <div className="rounded-xl bg-amber-900/15 border border-amber-500/30 p-4 text-center">
                    <p className="text-sm text-amber-300">Click between words to split the sentence into tokens.</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-center">
                  {!showFeedback && (
                    <button onClick={handleContinue} disabled={!allSplit}
                      className={`inline-flex items-center gap-2 text-base font-semibold px-5 py-3 rounded-xl transition-all ${
                        allSplit ? 'text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-600/20' : 'text-slate-300 bg-slate-800/50 cursor-not-allowed'
                      }`}>
                      {allSplit ? 'Continue' : `Split all words (${splits.filter(Boolean).length}/${round.tokens.length - 1})`}
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                  {showFeedback && allSplit && (
                    <button onClick={handleNextRound}
                      className="inline-flex items-center gap-2 text-base font-semibold text-white px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-600/20">
                      {roundIdx < 2 ? 'Next Sentence' : 'Continue to Bag of Words'}
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ── Bag of Words Round ── */}
          {isInBowRound && (
            <div className="max-w-2xl mx-auto space-y-5">
              {/* Lecture connection */}
              <div className="rounded-xl bg-blue-900/15 border border-blue-500/25 px-5 py-3">
                <p className="text-xs text-blue-300 uppercase tracking-wider font-medium mb-1">From the lecture</p>
                <p className="text-sm text-blue-200/80 leading-relaxed">The lecture introduced Bag of Words with "the cat sat on the mat". Let us apply the same technique to count words across two sentences.</p>
              </div>

              {/* Sentences display */}
              <div className="rounded-xl bg-slate-900/80 border border-slate-700/40 px-6 py-5">
                <p className="text-xs text-slate-300 mb-3 uppercase tracking-wider font-medium">Source Sentences</p>
                <div className="space-y-2">
                  {BOW_SENTENCES.map((s, i) => (
                    <p key={i} className="text-base text-slate-300">
                      <span className="text-violet-400 font-mono text-sm mr-2">{i + 1}.</span>
                      {s}
                    </p>
                  ))}
                </div>
              </div>

              {/* Bag of Words panel */}
              {bowRevealed && (
                <div className="rounded-xl bg-slate-900/80 border border-violet-500/30 px-6 py-5 nn-slide">
                  <p className="text-xs text-slate-300 mb-3 uppercase tracking-wider font-medium">Bag of Words — Word Frequencies</p>
                  <p className="text-xs text-slate-300 mb-4">AI converts text into numbers by counting how often each word appears. Word order is ignored.</p>
                  <div className="space-y-2">
                    {bowEntries.map((entry, i) => (
                      <div key={entry.word}
                        className={`flex items-center gap-3 transition-all duration-500 ${
                          entry.revealed ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                        }`}
                        style={{ transitionDelay: entry.revealed ? `${i * 100}ms` : '0ms' }}
                      >
                        <span className="text-sm font-mono text-slate-300 w-24 text-right">{entry.word}</span>
                        <div className="flex-1 h-7 rounded-md bg-slate-800 overflow-hidden relative">
                          <div className="h-full rounded-md bg-gradient-to-r from-violet-600/60 to-indigo-600/40 transition-all duration-500"
                            style={{ width: `${bowDone ? (entry.count / Math.max(...bowEntries.map(e => e.count))) * 100 : 0}%` }} />
                        </div>
                        <span className="text-lg font-bold text-violet-300 w-8 text-right tabular-nums">
                          {entry.revealed ? entry.animCount : '-'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {showBowLectureLink && (
                    <div className="mt-4 pt-4 border-t border-slate-700/30 space-y-2">
                      <p className="text-sm text-slate-300 leading-relaxed">
                        These numbers are how AI <span className="text-violet-300 font-medium">represents text numerically</span>. The word "the" appears 4 times, "cat" appears 2 times — this is the Bag of Words representation the lecture described.
                      </p>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        Notice that <span className="text-slate-300">word order is lost</span>. "the cat sat on the mat" and "the mat sat on the cat" would produce the same counts. This is why more advanced methods like word embeddings (also covered in the lecture) are needed for understanding meaning.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-center">
                {!bowRevealed && (
                  <button onClick={handleBowGenerate}
                    className="inline-flex items-center gap-2 text-base font-semibold text-white px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-600/20">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                    Generate Bag of Words
                  </button>
                )}
                {bowDone && (
                  <button onClick={() => { if (bowInterval.current) clearInterval(bowInterval.current); onComplete(); }}
                    className="inline-flex items-center gap-2 text-base font-semibold text-white px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 transition-all shadow-lg shadow-emerald-600/20">
                    Complete Exercise
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}
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
