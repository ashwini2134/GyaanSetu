import { useCallback, useMemo, useRef, useState } from "react";
import { CheckCircle, XCircle, RotateCcw, ArrowLeft, ArrowRight, Brain, Cpu, GripHorizontal } from "lucide-react";
import type { DragDropCardConfig, DragDropConfig } from "../../types/lesson";

export type { DragDropCardConfig, DragDropConfig };

interface DragDropPracticeExerciseProps {
  config: DragDropConfig;
  title?: string;
  challenge: string;
  learningGoal: string;
  promptHint?: string;
  onComplete: () => void;
  onAttempt?: () => void;
}



function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildShuffledCards(cards: DragDropCardConfig[]): DragDropCardConfig[] {
  const shuffled = shuffle(cards);
  for (let i = 2; i < shuffled.length; i++) {
    const a = shuffled[i].correctZone;
    const b = shuffled[i - 1].correctZone;
    const c = shuffled[i - 2].correctZone;
    if (a === b && b === c) {
      for (let j = i + 1; j < shuffled.length; j++) {
        if (shuffled[j].correctZone !== a) {
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          break;
        }
      }
    }
  }
  return shuffled;
}

function computeRotations(cards: DragDropCardConfig[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const card of cards) {
    map[card.id] = Math.floor(Math.random() * 9) - 4;
  }
  return map;
}

export default function DragDropPracticeExercise({
  config,
  challenge,
  learningGoal,
  promptHint,
  onComplete,
  onAttempt,
}: DragDropPracticeExerciseProps) {
  const [stage, setStage] = useState(0);
  const [exitingStage, setExitingStage] = useState<number | null>(null);
  const [exitDir, setExitDir] = useState<"left" | "right">("left");
  const [showExercise, setShowExercise] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  // Immutable card pool — only replaced on reset/shuffle
  const [cardPool, setCardPool] = useState<DragDropCardConfig[]>(() => buildShuffledCards(config.cards));
  const rotations = useMemo(() => computeRotations(cardPool), [cardPool]);
  // Index into cardPool — only advances on correct classification
  const [activeCardIdx, setActiveCardIdx] = useState(0);
  const [zoneCards, setZoneCards] = useState<Record<string, DragDropCardConfig[]>>(() => {
    const init: Record<string, DragDropCardConfig[]> = {};
    for (const z of config.zones) init[z.id] = [];
    return init;
  });
  const [correctCount, setCorrectCount] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<"correct" | "incorrect" | null>(null);
  const [glowZone, setGlowZone] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);
  const [taintedCards, setTaintedCards] = useState<Set<string>>(new Set());
  // Track whether a card is being dragged (CSS class only)
  const draggingRef = useRef(false);

  const totalCards = config.cards.length;
  const activeCard = cardPool[activeCardIdx] ?? null;
  const backgroundCards = cardPool.slice(activeCardIdx + 1, activeCardIdx + 4);

  const hasTip = !!promptHint;
  const instructionCount = hasTip ? 4 : 3;
  const exerciseStage = instructionCount;

  const goNext = () => {
    if (stage + 1 === exerciseStage) {
      setExitingStage(stage);
      setExitDir("left");
      setTimeout(() => {
        setShowExercise(true);
        setExitingStage(null);
      }, 300);
      return;
    }
    setExitDir("left");
    setExitingStage(stage);
    setTimeout(() => {
      setStage((s) => s + 1);
      setExitingStage(null);
    }, 300);
  };

  const goPrev = () => {
    if (stage === 0) return;
    setExitDir("right");
    setExitingStage(stage);
    setTimeout(() => {
      setStage((s) => s - 1);
      setExitingStage(null);
    }, 300);
  };

  const handleDragStart = useCallback((e: React.DragEvent) => {
    if (!activeCard) return;
    e.dataTransfer.setData("text/plain", activeCard.id);
    e.dataTransfer.effectAllowed = "move";
    draggingRef.current = true;
  }, [activeCard]);

  const handleDragEnd = useCallback(() => {
    draggingRef.current = false;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const advanceCard = useCallback(() => {
    setActiveCardIdx((prev) => {
      if (prev + 1 >= totalCards) {
        setTimeout(() => setShowCompletion(true), 200);
      }
      return prev + 1;
    });
    setGlowZone(null);
    setFeedbackType(null);
    setFeedbackMsg(null);
    setShaking(false);
  }, [totalCards]);

  const placeCard = useCallback((zoneId: string) => {
    setZoneCards((prev) => ({
      ...prev,
      [zoneId]: [...prev[zoneId], activeCard!],
    }));
  }, [activeCard]);

  const handleDrop = useCallback(
    (e: React.DragEvent, zoneId: string) => {
      e.preventDefault();
      draggingRef.current = false;
      const cardId = e.dataTransfer.getData("text/plain");
      if (!cardId || !activeCard || activeCard.id !== cardId) return;

      onAttempt?.();

      if (activeCard.correctZone === zoneId) {
        const wasTainted = taintedCards.has(activeCard.id);
        if (!wasTainted) setCorrectCount((prev) => prev + 1);
        placeCard(zoneId);
        setGlowZone(zoneId);
        setFeedbackType("correct");
        setFeedbackMsg(null);
        setTimeout(() => advanceCard(), 400);
      } else {
        setTaintedCards((prev) => new Set(prev).add(activeCard.id));
        setShaking(true);
        setFeedbackType("incorrect");
        setFeedbackMsg("Incorrect. Try again.");
        setTimeout(() => setShaking(false), 600);
      }
    },
    [activeCard, taintedCards, advanceCard, placeCard, onAttempt]
  );

  const handleTryAgain = () => {
    const fresh = buildShuffledCards(config.cards);
    setCardPool(fresh);
    setActiveCardIdx(0);
    const init: Record<string, DragDropCardConfig[]> = {};
    for (const z of config.zones) init[z.id] = [];
    setZoneCards(init);
    setCorrectCount(0);
    setTaintedCards(new Set());
    setFeedbackMsg(null);
    setFeedbackType(null);
    setGlowZone(null);
    setShaking(false);
    setShowCompletion(false);
    setShowExercise(false);
    setStage(0);
    setExitingStage(null);
  };

  const handleClose = () => {
    onComplete();
  };

  const isPerfect = correctCount === totalCards;

  const renderInstructionStage = (stageIdx: number) => {
    switch (stageIdx) {
      case 0:
        return (
          <div className="flex flex-col items-center justify-center py-8 px-6">
            <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-[0.2em] mb-3">What You'll Learn</p>
            <p className="text-base text-slate-100 text-center leading-relaxed max-w-md">{learningGoal}</p>
          </div>
        );
      case 1:
        return (
          <div className="flex flex-col items-center justify-center py-8 px-6">
            <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-[0.2em] mb-3">Your Challenge</p>
            <p className="text-base text-slate-100 text-center leading-relaxed max-w-md">{challenge}</p>
          </div>
        );
      case 2:
        if (hasTip) {
          return (
            <div className="flex flex-col items-center justify-center py-8 px-6">
              <p className="text-[10px] font-semibold text-violet-400 uppercase tracking-[0.2em] mb-3">Learning Tip</p>
              <p className="text-base text-violet-200 text-center leading-relaxed max-w-md">{promptHint}</p>
            </div>
          );
        }
        // fall through to ready if no tip
        return (
          <div className="flex flex-col items-center justify-center py-8 px-6">
            <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-[0.2em] mb-3">Ready to Try?</p>
            <p className="text-sm text-slate-300 text-center mb-6">You will classify {totalCards} cards.</p>
            <button
              onClick={goNext}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-blue-600/20 transition-all"
            >
              Start Exercise
            </button>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col items-center justify-center py-8 px-6">
            <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-[0.2em] mb-3">Ready to Try?</p>
            <p className="text-sm text-slate-300 text-center mb-6">You will classify {totalCards} cards.</p>
            <button
              onClick={goNext}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-blue-600/20 transition-all"
            >
              Start Exercise
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm overflow-hidden">
      {/* ── INSTRUCTION CAROUSEL ── */}
      {!showExercise && !showCompletion && (
        <div className="relative overflow-hidden" style={{ minHeight: "200px" }}>
          {/* Static stage content */}
          <div
            className={`transition-all duration-300 ease-in-out ${
              exitingStage === stage ? "opacity-0 scale-95" : "opacity-100 scale-100"
            }`}
          >
            {renderInstructionStage(stage)}
          </div>

          {/* Exiting stage content slides out */}
          {exitingStage !== null && exitingStage !== stage && (
            <div
              className={`absolute inset-0 transition-all duration-300 ease-in-out ${
                exitDir === "left"
                  ? "opacity-0 -translate-x-8"
                  : "opacity-0 translate-x-8"
              }`}
            >
              {renderInstructionStage(exitingStage)}
            </div>
          )}

          {/* Bottom navigation */}
          <div className="flex items-center justify-between px-6 pb-5">
            <button
              onClick={goPrev}
              disabled={stage === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 text-xs font-semibold border border-slate-700/40 transition-all"
            >
              <ArrowLeft size={13} /> Previous
            </button>
            <span className="text-[10px] text-slate-600 font-mono">
              {stage + 1} / {instructionCount}
            </span>
            {stage < instructionCount - 1 && (
              <button
                onClick={goNext}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all"
              >
                Next <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── EXERCISE SECTION ── */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          showExercise && !showCompletion
            ? "opacity-100 max-h-[800px]"
            : "opacity-0 max-h-0 overflow-hidden"
        }`}
      >
        <div className="p-6">
          {/* Progress */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/40">
              <span className="text-sm font-bold text-blue-400">{correctCount}</span>
              <span className="text-sm text-slate-500">/</span>
              <span className="text-sm text-slate-400">{totalCards}</span>
            </div>
          </div>

          {/* Card Stack */}
          <div className="flex flex-col items-center mb-5">
            <div className="relative w-full max-w-xs" style={{ height: "110px" }}>
              {/* Active card — always cardPool[activeCardIdx] */}
              {activeCard && (
                <div
                  key={activeCard.id}
                  className={`absolute left-0 w-full rounded-xl border-2 select-none z-10 ${
                    shaking
                      ? "border-red-500/60 bg-red-500/10 animate-shake"
                      : "border-blue-500/40 bg-slate-800 cursor-grab active:cursor-grabbing will-change-transform"
                  }`}
                  style={{ top: 0 }}
                  draggable
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className={`w-1 h-8 rounded-full flex-shrink-0 ${
                      shaking ? "bg-red-400" : "bg-blue-400"
                    }`} />
                    <p className="text-sm font-medium text-slate-100">{activeCard.text}</p>
                  </div>
                </div>
              )}

              {/* Background cards — decorative only */}
              {backgroundCards.map((card, idx) => {
                const depth = idx + 1;
                const offsetY = depth * 10;
                const scale = 1 - depth * 0.04;
                const rotate = rotations[card.id] ?? 0;
                return (
                  <div
                    key={card.id}
                    className="absolute left-0 w-full rounded-xl border-2 border-slate-700/30 bg-slate-800/30 opacity-30 blur-[1px] pointer-events-none select-none"
                    style={{
                      top: `${offsetY}px`,
                      transform: `scale(${scale}) rotate(${rotate}deg)`,
                      zIndex: 0,
                    }}
                  >
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="w-1 h-8 rounded-full bg-slate-600 flex-shrink-0" />
                      <p className="text-sm font-medium text-slate-600">{card.text}</p>
                    </div>
                  </div>
                );
              })}

              {!activeCard && backgroundCards.length === 0 && (
                <div className="flex items-center justify-center h-full rounded-xl border-2 border-dashed border-emerald-500/30 bg-emerald-500/5">
                  <span className="flex items-center gap-2 text-sm text-emerald-400">
                    <CheckCircle size={18} /> All done!
                  </span>
                </div>
              )}
            </div>

            {activeCard && (
              <div className="flex items-center gap-1.5 mt-3 text-slate-500">
                <GripHorizontal size={14} />
                <span className="text-xs">Drag to the correct category</span>
              </div>
            )}

            {feedbackMsg && (
              <div className="flex flex-col items-center gap-2 mt-2">
                <div className="flex items-center gap-1.5 text-xs text-red-300">
                  <XCircle size={12} /> {feedbackMsg}
                </div>
                {feedbackType === "incorrect" && (
                  <button
                    onClick={() => advanceCard()}
                    className="text-[10px] text-slate-500 hover:text-slate-300 underline transition-colors"
                  >
                    Skip this card
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Drop Zones */}
          <div className="flex gap-4">
            {config.zones.map((zone) => {
              const ZoneIcon = zone.id === "ai" || zone.id === "brain" ? Brain : Cpu;
              const isBlue = zone.id === "ai" || zone.id === "brain" || zone.id === "supervised";
              const placed = zoneCards[zone.id] || [];
              const isCorrectGlow = glowZone === zone.id && feedbackType === "correct";

              return (
                <div
                  key={zone.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, zone.id)}
                  className={`flex-1 rounded-xl border-2 border-dashed transition-all duration-300 ${
                    isCorrectGlow
                      ? "border-emerald-400/60 bg-emerald-500/15 shadow-lg shadow-emerald-500/20 scale-[1.02]"
                      : isBlue
                        ? "border-blue-500/30 bg-blue-500/5 hover:border-blue-400/60 hover:bg-blue-500/10"
                        : "border-amber-500/30 bg-amber-500/5 hover:border-amber-400/60 hover:bg-amber-500/10"
                  }`}
                >
                  <div className="p-4">
                    <div className="flex flex-col items-center gap-2 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isCorrectGlow
                          ? "bg-emerald-500/20 text-emerald-400"
                          : isBlue
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-amber-500/20 text-amber-400"
                      }`}>
                        {isCorrectGlow ? <CheckCircle size={20} /> : <ZoneIcon size={20} />}
                      </div>
                      <p className="text-xs font-bold text-slate-200 uppercase tracking-wider text-center">{zone.label}</p>
                    </div>

                    <div className="min-h-[40px] space-y-1">
                      {placed.length === 0 && (
                        <p className="text-[10px] text-slate-600 text-center">
                          {activeCard ? "Drop here" : "Drop cards here"}
                        </p>
                      )}
                      {placed.map((card) => (
                        <div
                          key={card.id}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/25 transition-all duration-300"
                        >
                          <CheckCircle size={10} className="text-emerald-400 flex-shrink-0" />
                          <span className="text-[11px] text-emerald-300 truncate">{card.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── COMPLETION SECTION ── */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          showCompletion
            ? "opacity-100 max-h-[400px]"
            : "opacity-0 max-h-0 overflow-hidden"
        }`}
      >
          <div className="flex flex-col items-center justify-center py-10 px-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-5">
            <CheckCircle size={32} className="text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Exercise Complete</h3>
          <p className="text-lg text-emerald-400 font-semibold mb-8">{correctCount} / {totalCards} Correct</p>

          {isPerfect ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/25 mb-8">
              <span className="text-sm font-semibold text-emerald-400">Perfect Score!</span>
            </div>
          ) : (
            <p className="text-sm text-slate-400 mb-8">Try Again to improve your score.</p>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleTryAgain}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-600/50 transition-all"
            >
              <RotateCcw size={15} /> Try Again
            </button>
            <button
              onClick={handleClose}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-sm font-semibold shadow-lg shadow-emerald-600/20 transition-all"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
