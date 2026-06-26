import { useState, useRef } from "react";
import type { BFSDFSConfig } from "../../types/lesson";

interface Props {
  config: BFSDFSConfig;
  onComplete: () => void;
  onAttempt?: () => void;
}

type Phase =
  | "carousel"
  | "bfs_playing"
  | "bfs_explain"
  | "dfs_playing"
  | "dfs_explain"
  | "compare"
  | "reflection"
  | "complete";

const BFS_COLOR = "#3b82f6";
const DFS_COLOR = "#8b5cf6";

const NODE_RADIUS = 22;

export default function GraphTraversalExercise({ config, onComplete, onAttempt }: Props) {
  const [phase, setPhase] = useState<Phase>("carousel");
  const [slideIndex, setSlideIndex] = useState(0);
  const [bfsVisited, setBfsVisited] = useState<string[]>([]);
  const [dfsVisited, setDfsVisited] = useState<string[]>([]);
  const [wrongNode, setWrongNode] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanationText, setExplanationText] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [animatingNodes, setAnimatingNodes] = useState<string[]>([]);
  const [compareAnimBfs, setCompareAnimBfs] = useState<string[]>([]);
  const [compareAnimDfs, setCompareAnimDfs] = useState<string[]>([]);
  const [compareDone, setCompareDone] = useState(false);
  const [reflectionChoice, setReflectionChoice] = useState<number | null>(null);
  const [reflectionSubmitted, setReflectionSubmitted] = useState(false);
  const graphContainerRef = useRef<HTMLDivElement>(null);

  const slides = config.slides;
  const graph = config.graph;
  const bfsOrder = config.bfsOrder;
  const dfsOrder = config.dfsOrder;

  const totalCorrect = phase === "bfs_playing" ? bfsVisited.length : dfsVisited.length;
  const totalExpected = phase === "bfs_playing" ? bfsOrder.length : dfsOrder.length;
  const isComplete = totalCorrect >= totalExpected;

  const currentPhase = phase === "bfs_playing" ? "BFS" : "DFS";

  function getCorrectExplanation(algo: string): string {
    return algo === "BFS"
      ? "Correct. Breadth First Search always visits every nearby room before moving deeper. That is why this node was chosen."
      : "Correct. Depth First Search keeps following one path until it cannot continue. Only then does it return and explore another branch.";
  }

  function getWrongExplanation(algo: string): string {
    return algo === "BFS"
      ? "Not quite. Breadth First Search still has unexplored rooms at the current level. It cannot move deeper yet. Try again."
      : "Not yet. DFS does not explore neighboring branches immediately. It always continues deeper whenever possible. Try again.";
  }

  function handleNodeClick(nodeId: string) {
    if (phase !== "bfs_playing" && phase !== "dfs_playing") return;
    if (showExplanation) return;

    const order = phase === "bfs_playing" ? bfsOrder : dfsOrder;
    const visited = phase === "bfs_playing" ? bfsVisited : dfsVisited;
    const setVisited = phase === "bfs_playing" ? setBfsVisited : setDfsVisited;

    if (visited.includes(nodeId)) return;
    onAttempt?.();

    if (nodeId === order[visited.length]) {
      setVisited([...visited, nodeId]);
      setIsCorrect(true);
      setExplanationText(getCorrectExplanation(currentPhase));
      setShowExplanation(true);
    } else {
      setWrongNode(nodeId);
      setIsCorrect(false);
      setExplanationText(getWrongExplanation(currentPhase));
      setShowExplanation(true);
      setTimeout(() => setWrongNode(null), 1200);
    }
  }

  function handleContinueClick() {
    setShowExplanation(false);
    setExplanationText("");

    if (isComplete) {
      if (phase === "bfs_playing") {
        animateBfsWave();
      } else if (phase === "dfs_playing") {
        animateDfsPath();
      }
    }
  }

  function animateBfsWave() {
    setPhase("bfs_explain");
    const levels: string[][] = [
      ["A"],
      ["B", "C"],
      ["D", "E", "F"],
    ];
    let delay = 0;
    levels.forEach((level) => {
      level.forEach((nodeId) => {
        setTimeout(() => {
          setAnimatingNodes((prev) => [...prev, nodeId]);
        }, delay);
      });
      delay += 800;
    });
  }

  function animateDfsPath() {
    setPhase("dfs_explain");
    dfsOrder.forEach((nodeId, i) => {
      setTimeout(() => {
        setAnimatingNodes((prev) => [...prev, nodeId]);
      }, i * 700);
    });
  }

  function handleStartDfs() {
    setAnimatingNodes([]);
    setPhase("dfs_playing");
  }

  function handleStartCompare() {
    setAnimatingNodes([]);
    setPhase("compare");
    animateComparison();
  }

  function animateComparison() {
    const bfsLen = bfsOrder.length;
    const dfsLen = dfsOrder.length;
    const maxLen = Math.max(bfsLen, dfsLen);
    bfsOrder.forEach((nodeId, i) => {
      setTimeout(() => {
        setCompareAnimBfs((prev) => [...prev, nodeId]);
      }, i * 500);
    });
    dfsOrder.forEach((nodeId, i) => {
      setTimeout(() => {
        setCompareAnimDfs((prev) => [...prev, nodeId]);
      }, i * 500);
    });
    setTimeout(() => {
      setCompareDone(true);
    }, maxLen * 500 + 300);
  }

  function handleReflectionSubmit() {
    if (reflectionChoice === null) return;
    setReflectionSubmitted(true);
  }

  function renderGraph(
    visitedList: string[],
    algorithm: string,
    size: "normal" | "small" = "normal",
    animList?: string[]
  ) {
    const isSmall = size === "small";
    const vw = isSmall ? 300 : 340;
    const vh = isSmall ? 220 : 260;
    const r = isSmall ? 16 : NODE_RADIUS;
    const highlight = algorithm === "BFS" ? BFS_COLOR : DFS_COLOR;

    return (
      <svg
        viewBox={`0 0 ${vw} ${vh}`}
        className={`${isSmall ? "w-full" : "w-full max-w-sm"} mx-auto`}
        style={{ maxHeight: isSmall ? "200px" : "260px" }}
      >
        {graph.edges.map((edge) => {
          const fromN = graph.nodes.find((n) => n.id === edge.from);
          const toN = graph.nodes.find((n) => n.id === edge.to);
          if (!fromN || !toN) return null;
          return (
            <line
              key={`${edge.from}-${edge.to}`}
              x1={fromN.x}
              y1={fromN.y}
              x2={toN.x}
              y2={toN.y}
              stroke="#475569"
              strokeWidth={isSmall ? 1.5 : 2}
            />
          );
        })}
        {graph.nodes.map((node) => {
          const isVisited = (animList || visitedList).includes(node.id);
          const isWrong = wrongNode === node.id && !isCorrect;
          const isStart = node.id === graph.startNode;
          const isNext =
            !showExplanation &&
            !isComplete &&
            !isVisited &&
            node.id ===
              (phase === "bfs_playing"
                ? bfsOrder[bfsVisited.length]
                : phase === "dfs_playing"
                ? dfsOrder[dfsVisited.length]
                : null);

          const fill = isWrong
            ? "#ef4444"
            : isVisited
            ? highlight
            : "none";
          const stroke = isWrong
            ? "#ef4444"
            : isVisited
            ? highlight
            : isNext
            ? "#94a3b8"
            : "#475569";
          const strokeW = isNext ? 2.5 : isVisited ? 2 : 1.5;

          return (
            <g
              key={node.id}
              onClick={() => handleNodeClick(node.id)}
              className={
                phase === "bfs_playing" || phase === "dfs_playing"
                  ? "cursor-pointer"
                  : ""
              }
              style={{ transition: "opacity 0.3s" }}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={r}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeW}
                className={
                  isVisited
                    ? "animate-pulse"
                    : isNext
                    ? "animate-pulse"
                    : ""
                }
                style={{
                  transition: "fill 0.3s, stroke 0.3s",
                }}
              />
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isVisited || isWrong ? "#fff" : "#cbd5e1"}
                fontSize={isSmall ? 12 : 14}
                fontWeight={600}
              >
                {node.label}
              </text>
              {isStart && !isVisited && (
                <text
                  x={node.x}
                  y={node.y + r + 14}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize={9}
                >
                  Start
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  }

  if (phase === "carousel") {
    const slide = slides[slideIndex];
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-slate-800/40 backdrop-blur-sm p-6">
          <div className="space-y-4 min-h-[200px]">
            <h3 className="text-lg font-bold text-white">{slide.title}</h3>
            <ul className="space-y-2">
              {slide.body.map((line, i) => (
                <li key={i} className="text-sm text-slate-300 leading-relaxed flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">-</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-700/30">
            <div className="flex gap-1.5">
              {slides.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === slideIndex ? "bg-blue-400" : "bg-slate-600"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => {
                if (slideIndex < slides.length - 1) {
                  setSlideIndex(slideIndex + 1);
                } else {
                  setPhase("bfs_playing");
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white px-4 py-2 rounded-lg bg-blue-600/80 hover:bg-blue-600 transition-all"
            >
              {slide.button}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "bfs_playing" || phase === "dfs_playing") {
    const visited = phase === "bfs_playing" ? bfsVisited : dfsVisited;
    const scenario = phase === "bfs_playing"
      ? "A rescue robot enters a building. It must inspect every room. The robot follows Breadth First Search. Which room should it visit next?"
      : "The same rescue robot now follows Depth First Search. Predict every move. Which room should it visit next?";

    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-slate-800/40 backdrop-blur-sm p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider mb-1">
                Scenario
              </p>
              <p className="text-sm text-slate-200 leading-relaxed">{scenario}</p>
            </div>
          </div>

          <div ref={graphContainerRef}>
            {renderGraph(visited, currentPhase, "normal")}
          </div>

          <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
            <span>
              Visited: {totalCorrect}/{totalExpected}
            </span>
            {isComplete && !showExplanation && (
              <span className="text-emerald-400 font-semibold">All rooms visited!</span>
            )}
          </div>
        </div>

        {showExplanation && (
          <div
            className={`rounded-xl border p-4 backdrop-blur-sm ${
              isCorrect
                ? "border-emerald-500/30 bg-emerald-900/10"
                : "border-red-500/30 bg-red-900/10"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  isCorrect ? "bg-emerald-600/20" : "bg-red-600/20"
                }`}
              >
                {isCorrect ? (
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-200 leading-relaxed">{explanationText}</p>
              </div>
            </div>
            {isCorrect && (
              <button
                onClick={handleContinueClick}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-white px-4 py-2 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 transition-all"
              >
                Continue
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  if (phase === "bfs_explain") {
    const allAnimated = animatingNodes.length >= bfsOrder.length;
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-slate-800/40 backdrop-blur-sm p-5">
          <h3 className="text-base font-bold text-white mb-3">BFS Exploration Complete</h3>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            Breadth First Search explored every nearby node before moving deeper.
            Because of this strategy, it always finds the shortest path in an unweighted graph.
          </p>
          <div>
            {renderGraph(animatingNodes, "BFS", "normal")}
          </div>
          {allAnimated && (
            <button
              onClick={handleStartDfs}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-white px-4 py-2 rounded-lg bg-blue-600/80 hover:bg-blue-600 transition-all"
            >
              Continue with DFS
            </button>
          )}
        </div>
      </div>
    );
  }

  if (phase === "dfs_explain") {
    const allAnimated = animatingNodes.length >= dfsOrder.length;
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-600/10 to-slate-800/40 backdrop-blur-sm p-5">
          <h3 className="text-base font-bold text-white mb-3">DFS Exploration Complete</h3>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            Depth First Search followed each path until it could not continue.
            Only then did it return and explore another branch.
          </p>
          <div>
            {renderGraph(animatingNodes, "DFS", "normal")}
          </div>
          {allAnimated && (
            <button
              onClick={handleStartCompare}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-white px-4 py-2 rounded-lg bg-purple-600/80 hover:bg-purple-600 transition-all"
            >
              Compare the Two
            </button>
          )}
        </div>
      </div>
    );
  }

  if (phase === "compare") {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-slate-500/20 bg-gradient-to-br from-slate-600/10 to-slate-800/40 backdrop-blur-sm p-5">
          <h3 className="text-base font-bold text-white mb-4">Compare the Two</h3>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="p-3 rounded-xl bg-blue-900/20 border border-blue-500/20">
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2 text-center">
                BFS
              </p>
              {renderGraph(compareAnimBfs, "BFS", "small")}
            </div>
            <div className="p-3 rounded-xl bg-purple-900/20 border border-purple-500/20">
              <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2 text-center">
                DFS
              </p>
              {renderGraph(compareAnimDfs, "DFS", "small")}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-700/30">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800/60">
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    BFS
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    DFS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {config.comparison.bfs.map((bfsItem, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2 text-sm text-slate-300">{bfsItem}</td>
                    <td className="px-4 py-2 text-sm text-slate-300">
                      {config.comparison.dfs[i] || ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {compareDone && (
            <button
              onClick={() => setPhase("reflection")}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-white px-4 py-2 rounded-lg bg-slate-600/80 hover:bg-slate-600 transition-all"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    );
  }

  if (phase === "reflection") {
    const reflection = config.reflection;
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-600/10 to-slate-800/40 backdrop-blur-sm p-5">
          <h3 className="text-base font-bold text-white mb-3">Final Question</h3>
          <p className="text-sm text-slate-200 leading-relaxed mb-4">
            {reflection.question}
          </p>

          <div className="space-y-2">
            {reflection.options.map((opt, i) => {
              const isSelected = reflectionChoice === i;
              const isCorrect = reflectionSubmitted && i === reflection.correctIndex;
              const isWrong = reflectionSubmitted && isSelected && i !== reflection.correctIndex;

              let borderColor = "border-slate-700/40";
              let bgColor = "bg-slate-900/30";
              if (isCorrect) {
                borderColor = "border-emerald-500/50";
                bgColor = "bg-emerald-900/20";
              } else if (isWrong) {
                borderColor = "border-red-500/50";
                bgColor = "bg-red-900/20";
              } else if (isSelected) {
                borderColor = "border-blue-500/50";
                bgColor = "bg-blue-900/20";
              }

              return (
                <button
                  key={i}
                  onClick={() => {
                    if (!reflectionSubmitted) setReflectionChoice(i);
                  }}
                  disabled={reflectionSubmitted}
                  className={`w-full text-left px-4 py-3 rounded-xl border ${borderColor} ${bgColor} transition-all disabled:opacity-80`}
                >
                  <span className="text-sm text-slate-200">{opt}</span>
                </button>
              );
            })}
          </div>

          {reflectionSubmitted && (
            <div className="mt-4 p-4 rounded-xl bg-emerald-900/20 border border-emerald-500/30">
              <p className="text-sm text-emerald-300 leading-relaxed">
                {reflection.explanation}
              </p>
            </div>
          )}

          {!reflectionSubmitted && (
            <button
              onClick={handleReflectionSubmit}
              disabled={reflectionChoice === null}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-white px-4 py-2 rounded-lg bg-amber-600/80 hover:bg-amber-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Submit Answer
            </button>
          )}

          {reflectionSubmitted && (
            <button
              onClick={() => setPhase("complete")}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-white px-4 py-2 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 transition-all"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-600/10 to-slate-800/40 backdrop-blur-sm p-6">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-600/20 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-bold text-white mb-1">Exercise Complete</p>
            <ul className="space-y-1">
              {config.completionMessages.map((msg, i) => (
                <li key={i} className="text-sm text-slate-300 leading-relaxed">
                  {msg}
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={onComplete}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white px-6 py-2.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 transition-all"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
