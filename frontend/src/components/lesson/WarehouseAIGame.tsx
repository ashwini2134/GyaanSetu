import { useState, useEffect, useCallback } from 'react';
import type { WarehouseAIGameConfig } from '../../types/lesson';

interface Props {
  config: WarehouseAIGameConfig;
  onComplete: () => void;
  onAttempt?: () => void;
}

// ── Map geometry ──────────────────────────────────────────────────────────────
type NodeId = 'S' | 'A' | 'B' | 'C';

const NODES: Record<NodeId, { x: number; y: number; label: string }> = {
  S: { x: 200, y: 148, label: 'START' },
  A: { x: 348, y: 58,  label: 'A' },
  B: { x: 52,  y: 218, label: 'B' },
  C: { x: 200, y: 255, label: 'C' },
};

const EDGES: [NodeId, NodeId][] = [
  ['S', 'A'], ['S', 'B'], ['S', 'C'],
  ['A', 'B'], ['A', 'C'], ['B', 'C'],
];

// Greedy picks smallest h → S→A(9)→C(5)→B(6) = 20 steps
const GREEDY_PATH: NodeId[] = ['S', 'A', 'C', 'B'];
const GREEDY_COSTS = [9, 5, 6];
const GREEDY_TOTAL = 20;

// A* picks smallest f=g+h → S→C(3)→A(5)→B(8) = 16 steps
const ASTAR_PATH: NodeId[] = ['S', 'C', 'A', 'B'];
const ASTAR_COSTS = [3, 5, 8];
const ASTAR_TOTAL = 16;

// ── Binary decisions ──────────────────────────────────────────────────────────
const DECISIONS = [
  {
    context: 'Robot is at the start. Which order should it pick first?',
    left:  { name: 'Order A', travel: 9, after: 1 },
    right: { name: 'Order C', travel: 3, after: 5 },
    correctSide: 'right' as 'left' | 'right',
    feedback: {
      correct: "Nice! Order A's effort-after of 1 is a trap. The 9-step journey makes total cost 10. Order C costs only 8 total.",
      wrong:   "Order A's effort-after of 1 looks nearly done — but it's 9 steps away. Total cost: 10. Order C's total is just 8. A* picks C.",
    },
  },
  {
    context: 'Robot moved. Two orders remain. Which next?',
    left:  { name: 'Order X', travel: 7, after: 2 },
    right: { name: 'Order Y', travel: 3, after: 5 },
    correctSide: 'right' as 'left' | 'right',
    feedback: {
      correct: "Correct. Order X's effort-after of 2 looks close to done, but 7 steps to get there makes total 9. Order Y totals 8.",
      wrong:   "Order X had effort-after of 2 — very tempting. But 7 steps to reach it means total cost 9. Order Y costs 8 total. A* picks Y.",
    },
  },
  {
    context: 'Last decision. You know the pattern — trust it.',
    left:  { name: 'Order P', travel: 8, after: 1 },
    right: { name: 'Order Q', travel: 5, after: 3 },
    correctSide: 'right' as 'left' | 'right',
    feedback: {
      correct: "Spot on. P looks nearly finished (effort 1) but total cost is 9. Q totals 8. A* always picks the smaller total.",
      wrong:   "P's effort-after of 1 is the classic A* trap. Add the 8 steps to reach it: total 9. Q costs only 8 total — A* picks Q every time.",
    },
  },
] as const;

// ── Cost equation ─────────────────────────────────────────────────────────────
function CostEquation({ travel, after }: { travel: number; after: number }) {
  const total = travel + after;
  return (
    <div className="mt-4 flex items-center justify-center gap-3">
      <div className="text-center">
        <div className="text-2xl font-black text-blue-300 leading-none">{travel}</div>
        <div className="text-[10px] text-slate-300 mt-1">travel</div>
      </div>
      <div className="text-slate-300 text-base leading-none pb-4">+</div>
      <div className="text-center">
        <div className="text-2xl font-black text-orange-300 leading-none">{after}</div>
        <div className="text-[10px] text-slate-300 mt-1">after</div>
      </div>
      <div className="text-slate-300 text-base leading-none pb-4">=</div>
      <div className="text-center">
        <div className="text-3xl font-black text-indigo-200 leading-none">{total}</div>
        <div className="text-[10px] text-slate-300 mt-1">total</div>
      </div>
    </div>
  );
}

// ── Route map SVG ─────────────────────────────────────────────────────────────
function RouteMap({
  path,
  costs,
  edgeColor,
  nodeActiveColor,
  label,
  total,
}: {
  path: NodeId[];
  costs: number[];
  edgeColor: string;
  nodeActiveColor: string;
  label: string;
  total: number;
}) {
  const activeNodes = new Set(path);
  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 400 285" className="w-full h-auto" style={{ maxHeight: 200 }}>
        <rect width="400" height="285" rx="10" fill="#060a14" />
        {EDGES.map(([a, b], i) => (
          <line key={i}
            x1={NODES[a].x} y1={NODES[a].y}
            x2={NODES[b].x} y2={NODES[b].y}
            stroke="rgba(51,65,85,0.25)" strokeWidth="1.5" />
        ))}
        {path.slice(0, -1).map((n, i) => {
          const next = path[i + 1];
          const mx = (NODES[n].x + NODES[next].x) / 2;
          const my = (NODES[n].y + NODES[next].y) / 2;
          return (
            <g key={i}>
              <line
                x1={NODES[n].x} y1={NODES[n].y}
                x2={NODES[next].x} y2={NODES[next].y}
                stroke={edgeColor} strokeWidth="2.5" strokeLinecap="round"
              />
              <text x={mx} y={my - 7} textAnchor="middle"
                fill={edgeColor} fontSize="10" fontWeight="700" fontFamily="ui-monospace,monospace">
                {costs[i]}
              </text>
            </g>
          );
        })}
        {(Object.entries(NODES) as [NodeId, typeof NODES[NodeId]][]).map(([id, pos]) => {
          const isStart = id === 'S';
          const active = activeNodes.has(id);
          return (
            <g key={id}>
              <circle cx={pos.x} cy={pos.y} r={isStart ? 20 : 15}
                fill={isStart ? '#1e1b4b' : active ? 'rgba(30,41,59,0.95)' : 'rgba(15,23,42,0.7)'}
                stroke={isStart ? '#7c3aed' : active ? nodeActiveColor : 'rgba(51,65,85,0.35)'}
                strokeWidth={active ? 2 : 1} />
              <text x={pos.x} y={pos.y + 4} textAnchor="middle"
                fill={active ? 'rgba(226,232,240,0.95)' : 'rgba(100,116,139,0.45)'}
                fontSize={9} fontWeight="800" fontFamily="ui-monospace,monospace">
                {pos.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="text-center">
        <div className="text-xs text-slate-300 uppercase tracking-wider mb-0.5">{label}</div>
        <div className="text-3xl font-black" style={{ color: edgeColor }}>{total} steps</div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
type Phase = 'carousel' | 'watch' | 'play' | 'compare' | 'complete';
type PickResult = 'correct' | 'wrong' | null;

export default function WarehouseAIGame({ config, onComplete, onAttempt }: Props) {
  const slides = config.slides ?? [];

  const [phase, setPhase] = useState<Phase>('carousel');
  const [slideIdx, setSlideIdx] = useState(0);

  // Watch phase
  const [watchStep, setWatchStep] = useState(-1);
  const [watchRunning, setWatchRunning] = useState(false);
  const [stepTotal, setStepTotal] = useState(0);

  // Play phase
  const [decisionIdx, setDecisionIdx] = useState(0);
  const [pickResult, setPickResult] = useState<PickResult>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!watchRunning) return;
    if (watchStep >= GREEDY_COSTS.length - 1) {
      setWatchRunning(false);
      return;
    }
    const tid = setTimeout(() => {
      const next = watchStep + 1;
      setWatchStep(next);
      setStepTotal(t => t + GREEDY_COSTS[next]);
    }, 1300);
    return () => clearTimeout(tid);
  }, [watchRunning, watchStep]);

  const startWatch = useCallback(() => {
    setWatchStep(0);
    setStepTotal(GREEDY_COSTS[0]);
    setWatchRunning(true);
    onAttempt?.();
  }, [onAttempt]);

  const watchDone = !watchRunning && watchStep === GREEDY_COSTS.length - 1;

  function handlePick(side: 'left' | 'right') {
    if (pickResult !== null) return;
    const d = DECISIONS[decisionIdx];
    const correct = side === d.correctSide;
    setPickResult(correct ? 'correct' : 'wrong');
    if (correct) setScore(s => s + 1);
  }

  function nextDecision() {
    if (decisionIdx < DECISIONS.length - 1) {
      setDecisionIdx(i => i + 1);
      setPickResult(null);
    } else {
      setPhase('compare');
    }
  }

  // ── Carousel ─────────────────────────────────────────────────────────────────
  if (phase === 'carousel') {
    const slide = slides[slideIdx];
    const isLast = slideIdx === slides.length - 1;
    return (
      <div className="flex flex-col rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="flex justify-center gap-2 pt-6">
          {slides.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === slideIdx ? 'w-6 bg-indigo-400' : 'w-1.5 bg-slate-700'}`} />
          ))}
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-8 max-w-lg mx-auto w-full text-center gap-6">
          <div className="text-5xl">🤖</div>
          <h2 className="text-2xl font-bold text-white leading-tight">{slide?.title}</h2>
          <p className="text-slate-300 text-base leading-relaxed whitespace-pre-line">{slide?.body}</p>
        </div>
        <div className="px-8 pb-8 flex justify-between items-center">
          <button
            onClick={() => setSlideIdx(i => Math.max(0, i - 1))}
            disabled={slideIdx === 0}
            className="text-sm text-slate-300 disabled:opacity-0 hover:text-slate-300 transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={() => { if (isLast) setPhase('watch'); else setSlideIdx(i => i + 1); }}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {isLast ? 'Start →' : 'Next →'}
          </button>
        </div>
      </div>
    );
  }

  // ── Watch phase ───────────────────────────────────────────────────────────────
  if (phase === 'watch') {
    const highlightedPath = watchStep >= 0 ? GREEDY_PATH.slice(0, watchStep + 2) : (['S'] as NodeId[]);
    const highlightedCosts = GREEDY_COSTS.slice(0, watchStep + 1);
    const activeNodes = new Set(highlightedPath);

    const stepLabels = [
      { from: 'START', to: 'A', why: 'effort-after = 1 (smallest)' },
      { from: 'A', to: 'C',     why: 'effort-after = 5 (next smallest)' },
      { from: 'C', to: 'B',     why: 'only one left' },
    ];

    return (
      <div className="flex flex-col rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-6 pt-5 pb-4 border-b border-slate-800 text-center">
          <h2 className="text-base font-bold text-white">Watch Greedy navigate</h2>
          <p className="text-xs text-slate-300 mt-1">It always picks the smallest "effort remaining" — see where that leads.</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
          {/* Animated map */}
          <div className="relative">
            <svg viewBox="0 0 400 285" className="w-full h-auto rounded-xl" style={{ maxHeight: 220 }}>
              <rect width="400" height="285" rx="0" fill="#060a14" />
              {EDGES.map(([a, b], i) => (
                <line key={i}
                  x1={NODES[a].x} y1={NODES[a].y}
                  x2={NODES[b].x} y2={NODES[b].y}
                  stroke="rgba(51,65,85,0.2)" strokeWidth="1.5" />
              ))}
              {highlightedPath.slice(0, -1).map((n, i) => {
                const next = highlightedPath[i + 1];
                const mx = (NODES[n].x + NODES[next].x) / 2;
                const my = (NODES[n].y + NODES[next].y) / 2;
                return (
                  <g key={i}>
                    <line x1={NODES[n].x} y1={NODES[n].y} x2={NODES[next].x} y2={NODES[next].y}
                      stroke="rgba(239,68,68,0.8)" strokeWidth="3" strokeLinecap="round" />
                    <text x={mx} y={my - 7} textAnchor="middle"
                      fill="rgba(239,68,68,0.9)" fontSize="11" fontWeight="700" fontFamily="ui-monospace,monospace">
                      {highlightedCosts[i]}
                    </text>
                  </g>
                );
              })}
              {(Object.entries(NODES) as [NodeId, typeof NODES[NodeId]][]).map(([id, pos]) => {
                const isStart = id === 'S';
                const active = activeNodes.has(id);
                return (
                  <g key={id}>
                    <circle cx={pos.x} cy={pos.y} r={isStart ? 21 : 15}
                      fill={isStart ? '#1e1b4b' : active ? 'rgba(30,41,59,0.95)' : 'rgba(15,23,42,0.7)'}
                      stroke={isStart ? '#7c3aed' : active ? 'rgba(239,68,68,0.8)' : 'rgba(51,65,85,0.35)'}
                      strokeWidth={active ? 2 : 1} />
                    <text x={pos.x} y={pos.y + 4} textAnchor="middle"
                      fill={active ? 'rgba(226,232,240,0.95)' : 'rgba(100,116,139,0.45)'}
                      fontSize={9} fontWeight="800" fontFamily="ui-monospace,monospace">
                      {pos.label}
                    </text>
                  </g>
                );
              })}
              {/* Robot emoji */}
              {watchStep < 0 && (
                <text x={NODES.S.x} y={NODES.S.y - 24} textAnchor="middle" fontSize="16">🤖</text>
              )}
              {watchStep >= 0 && (() => {
                const p = NODES[GREEDY_PATH[watchStep + 1]];
                return <text x={p.x} y={p.y - 22} textAnchor="middle" fontSize="16">🤖</text>;
              })()}
            </svg>
            {watchStep >= 0 && (
              <div className="absolute top-3 right-3 bg-red-950/80 border border-red-800/60 rounded-xl px-3 py-1.5 text-center">
                <div className="text-xs text-red-400 font-medium">Steps used</div>
                <div className="text-2xl font-black text-red-300">{stepTotal}</div>
              </div>
            )}
          </div>

          {/* Step log */}
          {watchStep < 0 && (
            <p className="text-center text-slate-300 text-sm">Press Play to watch Greedy choose</p>
          )}
          {watchStep >= 0 && (
            <div className="space-y-2">
              {stepLabels.slice(0, watchStep + 1).map((s, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl bg-slate-800/30 px-4 py-2.5">
                  <span className="text-red-400 text-sm shrink-0">❌</span>
                  <span className="text-white text-sm font-medium flex-1">{s.from} → {s.to}</span>
                  <span className="text-red-400 text-sm font-bold shrink-0">+{GREEDY_COSTS[i]}</span>
                </div>
              ))}
            </div>
          )}

          {watchDone && (
            <div className="text-center py-2">
              <div className="text-3xl mb-1">😬</div>
              <div className="text-2xl font-black text-red-300">{GREEDY_TOTAL} steps total</div>
              <div className="text-xs text-slate-300 mt-1">Greedy chased what looked easy and zigzagged the map.</div>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 pt-3 border-t border-slate-800">
          {!watchRunning && !watchDone && (
            <button onClick={startWatch}
              className="w-full py-3 bg-red-700 hover:bg-red-600 text-white font-bold rounded-xl transition-colors">
              ▶ Play Greedy's Route
            </button>
          )}
          {watchRunning && (
            <div className="w-full py-3 bg-slate-800 text-slate-300 font-semibold rounded-xl text-center text-sm">
              Animating...
            </div>
          )}
          {watchDone && (
            <button onClick={() => setPhase('play')}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors">
              Now you try with A* →
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Play phase ────────────────────────────────────────────────────────────────
  if (phase === 'play') {
    const d = DECISIONS[decisionIdx];
    const feedbackText = pickResult ? d.feedback[pickResult] : null;

    return (
      <div className="flex flex-col rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-6 pt-5 pb-4 border-b border-slate-800 text-center">
          <h2 className="text-sm font-bold text-white mb-3">You navigate as A*</h2>
          <div className="flex items-center justify-center gap-2">
            {DECISIONS.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
                i < decisionIdx ? 'w-5 bg-indigo-400' : i === decisionIdx ? 'w-5 bg-indigo-500' : 'w-1.5 bg-slate-700'
              }`} />
            ))}
          </div>
          <p className="text-xs text-slate-300 mt-2">Decision {decisionIdx + 1} of {DECISIONS.length}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          <p className="text-center text-base font-semibold text-white leading-snug px-2">{d.context}</p>

          <div className="grid grid-cols-2 gap-3">
            {(['left', 'right'] as const).map(side => {
              const opt = d[side];
              const isCorrectSide = side === d.correctSide;
              const wasClicked =
                pickResult !== null &&
                ((pickResult === 'correct' && side === d.correctSide) ||
                  (pickResult === 'wrong' && side !== d.correctSide));

              const borderClass = pickResult === null
                ? 'border-slate-700/50 hover:border-indigo-500/60 cursor-pointer hover:bg-slate-800/60'
                : isCorrectSide
                ? 'border-green-500/50 bg-green-950/20'
                : wasClicked
                ? 'border-red-500/40 bg-red-950/10'
                : 'border-slate-700/20 opacity-40';

              return (
                <button
                  key={side}
                  onClick={() => handlePick(side)}
                  disabled={pickResult !== null}
                  className={`flex flex-col items-center rounded-2xl border-2 p-4 text-center transition-all duration-200 ${borderClass}`}
                >
                  <span className="text-xl mb-1">📦</span>
                  <span className="font-bold text-sm text-white mb-1">{opt.name}</span>
                  {pickResult !== null && (
                    <span className={`text-sm font-bold ${isCorrectSide ? 'text-green-400' : wasClicked ? 'text-red-400' : 'text-transparent'}`}>
                      {isCorrectSide ? '✓ A* choice' : wasClicked ? '✗ Greedy trap' : '·'}
                    </span>
                  )}
                  <CostEquation travel={opt.travel} after={opt.after} />
                </button>
              );
            })}
          </div>

          {feedbackText && (
            <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              pickResult === 'correct'
                ? 'bg-green-950/25 border border-green-700/30 text-green-200'
                : 'bg-indigo-950/25 border border-indigo-700/30 text-indigo-200'
            }`}>
              {pickResult === 'correct' ? '✅ ' : '💡 '}{feedbackText}
            </div>
          )}
        </div>

        {pickResult && (
          <div className="px-5 pb-5 pt-3 border-t border-slate-800">
            <button onClick={nextDecision}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors text-sm">
              {decisionIdx < DECISIONS.length - 1 ? 'Next decision →' : 'See the comparison →'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Compare phase ─────────────────────────────────────────────────────────────
  if (phase === 'compare') {
    return (
      <div className="flex flex-col rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-6 pt-5 pb-4 border-b border-slate-800 text-center">
          <h2 className="text-base font-bold text-white">The difference A* makes</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
          <div className="bg-slate-800/40 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-indigo-300">
              {score}/{DECISIONS.length} decisions correct
            </div>
            <div className="text-sm text-slate-300 mt-1">
              {score === DECISIONS.length
                ? 'Perfect — you navigated like a true A* agent!'
                : score >= 2
                ? 'Good job — A* logic is clicking for you.'
                : 'Check the comparison below to see where A* wins.'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <RouteMap
              path={GREEDY_PATH}
              costs={GREEDY_COSTS}
              edgeColor="rgba(239,68,68,0.85)"
              nodeActiveColor="rgba(239,68,68,0.8)"
              label="Greedy's route"
              total={GREEDY_TOTAL}
            />
            <RouteMap
              path={ASTAR_PATH}
              costs={ASTAR_COSTS}
              edgeColor="rgba(167,139,250,0.9)"
              nodeActiveColor="rgba(167,139,250,0.85)"
              label="A* route"
              total={ASTAR_TOTAL}
            />
          </div>

          <div className="text-center py-1">
            <div className="text-3xl font-black text-green-300 mb-0.5">−{GREEDY_TOTAL - ASTAR_TOTAL} steps</div>
            <div className="text-sm text-slate-300">A* saved by checking the full picture, not just what looks close</div>
          </div>

          <div className="bg-slate-800/30 rounded-2xl px-5 py-4 border border-slate-700/30 text-center">
            <p className="text-xs text-slate-300 uppercase tracking-widest mb-2 font-semibold">The rule</p>
            <p className="text-white font-bold text-base">
              f = <span className="text-blue-300">g</span> + <span className="text-orange-300">h</span>
            </p>
            <p className="text-sm text-slate-300 mt-1">
              <span className="text-blue-300">cost so far</span> + <span className="text-orange-300">estimated cost ahead</span>.
              Greedy ignores the first part. A* never does.
            </p>
          </div>
        </div>

        <div className="px-5 pb-5 pt-3 border-t border-slate-800">
          <button
            onClick={() => setPhase('complete')}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors text-sm"
          >
            Complete exercise ✓
          </button>
        </div>
      </div>
    );
  }

  // ── Complete phase ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden items-center justify-center px-8 py-10 text-center gap-6">
      <div className="text-6xl">🎉</div>
      <div>
        <h2 className="text-2xl font-black text-white mb-2">{config.completionTitle || 'Exercise Complete!'}</h2>
        <p className="text-slate-300 text-base leading-relaxed">{config.completionMessage || 'You now understand why A* beats Greedy.'}</p>
      </div>
      <div className="bg-indigo-950/50 border border-indigo-700/40 rounded-2xl px-6 py-4 max-w-sm">
        <p className="text-indigo-200 text-sm leading-relaxed">
          {config.closingMessage || 'f = g + h. That single formula is why A* finds optimal paths where Greedy wanders.'}
        </p>
      </div>
      <button
        onClick={onComplete}
        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors"
      >
        Continue →
      </button>
    </div>
  );
}
