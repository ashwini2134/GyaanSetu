import { useState, useEffect, useCallback } from 'react';
import type { BFSDFSGameConfig, BFSDFSGameEdge, BFSDFSGameRound } from '../../types/lesson';

interface Props {
  config: BFSDFSGameConfig;
  onComplete: () => void;
  onAttempt?: () => void;
}

type Phase = 'carousel' | 'predict' | 'simulate' | 'result' | 'complete';

// ── Explorer character SVGs (used in HTML context, NOT inside <svg>) ──────────
function ExplorerBFS({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 28 36" fill="none">
      {/* Hat */}
      <ellipse cx="14" cy="3" rx="8" ry="2.5" fill="#1d4ed8" />
      <rect x="10" y="0" width="8" height="5" rx="1" fill="#1e40af" />
      {/* Head */}
      <circle cx="14" cy="9" r="7" fill="#3b82f6" stroke="#60a5fa" strokeWidth="1" />
      <circle cx="11" cy="8" r="1.5" fill="white" />
      <circle cx="17" cy="8" r="1.5" fill="white" />
      <circle cx="11.5" cy="8.5" r="0.7" fill="#1e3a8a" />
      <circle cx="17.5" cy="8.5" r="0.7" fill="#1e3a8a" />
      <path d="M11.5 12 Q14 14 16.5 12" stroke="#1d4ed8" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      {/* Backpack */}
      <rect x="3" y="15" width="6" height="8" rx="2" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="0.5" />
      <rect x="4" y="17" width="4" height="2" rx="0.5" fill="#3b82f6" />
      {/* Body */}
      <rect x="8" y="16" width="12" height="11" rx="3" fill="#2563eb" stroke="#60a5fa" strokeWidth="0.8" />
      <rect x="8" y="14" width="12" height="4" rx="2" fill="#1d4ed8" />
      {/* Belt */}
      <rect x="8" y="23" width="12" height="2" rx="1" fill="#1e40af" />
      {/* Legs */}
      <rect x="9" y="27" width="4" height="7" rx="2" fill="#1d4ed8" />
      <rect x="15" y="27" width="4" height="7" rx="2" fill="#1d4ed8" />
      {/* Shoes */}
      <ellipse cx="11" cy="34" rx="3.5" ry="1.5" fill="#1e3a8a" />
      <ellipse cx="17" cy="34" rx="3.5" ry="1.5" fill="#1e3a8a" />
    </svg>
  );
}

function ExplorerDFS({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 28 36" fill="none">
      {/* Hat */}
      <ellipse cx="14" cy="3" rx="9" ry="3" fill="#92400e" />
      <path d="M5 3 Q14 -2 23 3" fill="#78350f" />
      {/* Head */}
      <circle cx="14" cy="9" r="7" fill="#ea580c" stroke="#fb923c" strokeWidth="1" />
      <circle cx="11" cy="8" r="1.5" fill="white" />
      <circle cx="17" cy="8" r="1.5" fill="white" />
      <circle cx="11.5" cy="8.5" r="0.7" fill="#7c2d12" />
      <circle cx="17.5" cy="8.5" r="0.7" fill="#7c2d12" />
      <path d="M12 12.5 Q14 11 16 12.5" stroke="#c2410c" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      {/* Body */}
      <rect x="8" y="16" width="12" height="11" rx="3" fill="#c2410c" stroke="#fb923c" strokeWidth="0.8" />
      <rect x="8" y="14" width="12" height="4" rx="2" fill="#9a3412" />
      {/* Vest straps */}
      <line x1="12" y1="16" x2="10" y2="27" stroke="#7c2d12" strokeWidth="1" />
      <line x1="16" y1="16" x2="18" y2="27" stroke="#7c2d12" strokeWidth="1" />
      {/* Belt */}
      <rect x="8" y="23" width="12" height="2" rx="1" fill="#9a3412" />
      {/* Legs */}
      <rect x="9" y="27" width="4" height="7" rx="2" fill="#c2410c" />
      <rect x="15" y="27" width="4" height="7" rx="2" fill="#c2410c" />
      {/* Shoes / boots */}
      <ellipse cx="11" cy="34" rx="3.5" ry="1.5" fill="#7c2d12" />
      <ellipse cx="17" cy="34" rx="3.5" ry="1.5" fill="#7c2d12" />
    </svg>
  );
}

// ── Inline explorer markers drawn INSIDE the SVG map (no nested svg tags) ────
function BFSMarker({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x - 16}, ${y - 2})`}>
      <ellipse cx="0" cy="3" rx="8" ry="2" fill="#1d4ed8" opacity="0.6" />
      <rect x="-6" y="-8" width="12" height="9" rx="2.5" fill="#2563eb" />
      <circle cx="0" cy="-13" r="6" fill="#3b82f6" stroke="#60a5fa" strokeWidth="0.8" />
      <ellipse cx="0" cy="-18" rx="6" ry="2" fill="#1d4ed8" />
      <rect x="-3" y="-22" width="6" height="5" rx="1" fill="#1e3a8a" />
      <circle cx="-2" cy="-14" r="1.2" fill="white" />
      <circle cx="2" cy="-14" r="1.2" fill="white" />
      <rect x="-10" y="-6" width="5" height="7" rx="1.5" fill="#1e3a8a" />
    </g>
  );
}

function DFSMarker({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x + 16}, ${y - 2})`}>
      <ellipse cx="0" cy="3" rx="8" ry="2" fill="#9a3412" opacity="0.6" />
      <rect x="-6" y="-8" width="12" height="9" rx="2.5" fill="#c2410c" />
      <circle cx="0" cy="-13" r="6" fill="#ea580c" stroke="#fb923c" strokeWidth="0.8" />
      <path d="M-8 -17 Q0 -23 8 -17" fill="#92400e" />
      <circle cx="-2" cy="-14" r="1.2" fill="white" />
      <circle cx="2" cy="-14" r="1.2" fill="white" />
    </g>
  );
}

// ── Treasure marker inline in SVG ─────────────────────────────────────────────
function TreasureMarker({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y - 30})`}>
      {/* Glow */}
      <circle cx="0" cy="8" r="20" fill="rgba(217,119,6,0.15)" />
      {/* Chest bottom */}
      <rect x="-12" y="4" width="24" height="14" rx="3" fill="#92400e" stroke="#d97706" strokeWidth="1.5" />
      {/* Chest lid */}
      <rect x="-12" y="-2" width="24" height="8" rx="2" fill="#b45309" stroke="#f59e0b" strokeWidth="1.5" />
      <path d="M-12 2 Q0 -4 12 2" fill="#d97706" />
      {/* Lock */}
      <circle cx="0" cy="8" r="3.5" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
      {/* Shimmer rays */}
      <line x1="0" y1="-8" x2="0" y2="-14" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <line x1="8" y1="-5" x2="12" y2="-9" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="-8" y1="-5" x2="-12" y2="-9" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </g>
  );
}

// ── Data structure visualization ──────────────────────────────────────────────
function DataStructureRow({ items, type, maxSlots = 8 }: { items: string[]; type: 'queue' | 'stack'; maxSlots?: number }) {
  const slots = Array.from({ length: maxSlots }).map((_, i) => items[i] ?? null);
  const isQueue = type === 'queue';
  return (
    <div className="flex items-center gap-1">
      {isQueue && <span className="text-[9px] text-slate-300 font-mono font-bold w-8 flex-shrink-0">FRONT</span>}
      <div className="flex gap-0.5 flex-1">
        {slots.map((item, i) => (
          <div
            key={i}
            className={`flex-1 h-7 rounded flex items-center justify-center text-[10px] font-bold font-mono transition-all duration-300 ${
              item
                ? isQueue
                  ? 'bg-blue-900/40 border border-blue-500/40 text-blue-200'
                  : 'bg-indigo-900/40 border border-indigo-500/40 text-indigo-200'
                : 'border border-dashed border-slate-700/40'
            }`}
          >
            {item ?? ''}
          </div>
        ))}
      </div>
      {!isQueue && <span className="text-[9px] text-slate-300 font-mono font-bold w-6 flex-shrink-0 text-right">TOP</span>}
    </div>
  );
}


// ── Queue/Stack computation ───────────────────────────────────────────────────
function computeBFSQueue(bfsOrder: string[], step: number, edges: BFSDFSGameEdge[]): string[] {
  if (step < 0) return [];
  const visited = bfsOrder.slice(0, step + 1);
  const visitedSet = new Set(visited);
  const queue: string[] = [];
  const enqueued = new Set<string>();
  for (const v of visited) {
    const neighbors = edges.filter(e => e[0] === v || e[1] === v)
      .map(e => (e[0] === v ? e[1] : e[0]))
      .filter(n => !visitedSet.has(n) && !enqueued.has(n));
    for (const n of neighbors) { queue.push(n); enqueued.add(n); }
  }
  return queue;
}

function computeDFSStack(dfsOrder: string[], step: number, edges: BFSDFSGameEdge[]): string[] {
  if (step < 0) return [];
  const visited = dfsOrder.slice(0, step + 1);
  const visitedSet = new Set(visited);
  const stack: string[] = [];
  for (const v of visited) {
    const neighbors = edges.filter(e => e[0] === v || e[1] === v)
      .map(e => (e[0] === v ? e[1] : e[0]))
      .filter(n => !visitedSet.has(n));
    for (const n of neighbors) stack.push(n);
  }
  return stack;
}

// ── Map SVG ───────────────────────────────────────────────────────────────────
function MapSVG({
  config, round, visitedBFS, visitedDFS, animStep, selectedPrediction,
}: {
  config: BFSDFSGameConfig;
  round: BFSDFSGameRound;
  visitedBFS: Set<string>;
  visitedDFS: Set<string>;
  animStep: number;
  selectedPrediction: 'bfs' | 'dfs' | null;
}) {
  const startNode = config.nodes.find(n => n.id === round.startNode)!;
  const treasureNode = config.nodes.find(n => n.id === round.treasureNode)!;

  // Where each doll currently stands
  const bfsPosId = visitedBFS.size > 0
    ? round.bfsOrder[visitedBFS.size - 1]
    : round.startNode;
  const dfsPosId = visitedDFS.size > 0
    ? round.dfsOrder[visitedDFS.size - 1]
    : round.startNode;
  const bfsPos = config.nodes.find(n => n.id === bfsPosId) ?? startNode;
  const dfsPos = config.nodes.find(n => n.id === dfsPosId) ?? startNode;

  // Position labels near treasure node (avoid going off-canvas)
  const tlx = Math.min(treasureNode.x - 20, 380);
  const tly = treasureNode.y > 240 ? treasureNode.y - 52 : treasureNode.y - 48;

  return (
    <svg viewBox="0 0 440 300" className="w-full h-auto" style={{ maxHeight: 340 }}>
      <defs>
        <radialGradient id="bg-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a2e1a" />
          <stop offset="100%" stopColor="#0a140a" />
        </radialGradient>
        <radialGradient id="treasure-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="start-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
        </radialGradient>
        <filter id="node-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Jungle background */}
      <rect width="440" height="300" rx="12" fill="url(#bg-grad)" />

      {/* Tree shapes */}
      {([
        [30, 60, 28], [15, 120, 22], [25, 200, 20], [400, 50, 25],
        [420, 140, 20], [410, 220, 24], [380, 270, 18], [45, 270, 22],
      ] as [number, number, number][]).map(([cx, cy, r], i) => (
        <g key={i}>
          <ellipse cx={cx} cy={cy} rx={r} ry={r * 1.3} fill="#0f3b0f" opacity="0.7" />
          <ellipse cx={cx} cy={cy - 8} rx={r * 0.7} ry={r} fill="#145214" opacity="0.6" />
        </g>
      ))}

      {/* Waterfall */}
      <rect x="395" y="40" width="18" height="220" rx="8" fill="rgba(59,130,246,0.08)" />
      <rect x="399" y="60" width="4" height="180" rx="2" fill="rgba(147,197,253,0.15)" />
      <rect x="406" y="80" width="3" height="140" rx="1.5" fill="rgba(147,197,253,0.1)" />

      {/* Ground paths */}
      {config.edges.map((e, i) => {
        const a = config.nodes.find(n => n.id === e[0]);
        const b = config.nodes.find(n => n.id === e[1]);
        if (!a || !b) return null;
        return <line key={`path-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
          stroke="rgba(92,76,50,0.4)" strokeWidth={8} strokeLinecap="round" />;
      })}

      {/* Active edges */}
      {config.edges.map((e, i) => {
        const a = config.nodes.find(n => n.id === e[0]);
        const b = config.nodes.find(n => n.id === e[1]);
        if (!a || !b) return null;
        const bfsVis = visitedBFS.has(e[0]) && visitedBFS.has(e[1]);
        const dfsVis = visitedDFS.has(e[0]) && visitedDFS.has(e[1]);
        if (!bfsVis && !dfsVis) return null;
        const color = bfsVis && dfsVis ? 'rgba(167,139,250,0.6)' :
          bfsVis ? 'rgba(96,165,250,0.55)' : 'rgba(251,146,60,0.55)';
        return <line key={`active-${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
          stroke={color} strokeWidth={4} strokeLinecap="round" className="transition-all duration-500" />;
      })}

      {/* START glow */}
      <ellipse cx={startNode.x} cy={startNode.y} rx="35" ry="20" fill="url(#start-glow)" />

      {/* TREASURE pulsing glow — always visible in all phases */}
      <ellipse cx={treasureNode.x} cy={treasureNode.y} rx="48" ry="30" fill="url(#treasure-glow)" />
      <circle cx={treasureNode.x} cy={treasureNode.y} r="34" fill="none"
        stroke="rgba(251,191,36,0.25)" strokeWidth="2" className="animate-ping" />

      {/* Nodes */}
      {config.nodes.map(n => {
        const bfsVis = visitedBFS.has(n.id);
        const dfsVis = visitedDFS.has(n.id);
        const isCurrentBFS = animStep > 0 && bfsPosId === n.id;
        const isCurrentDFS = animStep > 0 && dfsPosId === n.id;
        const isTreasure = n.id === round.treasureNode;

        let plateFill = '#2d2a1e';
        let plateStroke = '#5c4e28';
        let innerFill = '#1e1a0f';
        let innerStroke = 'rgba(148,163,184,0.2)';
        let textColor = '#94a3b8';

        // Treasure node always glows gold
        if (isTreasure) {
          plateStroke = 'rgba(217,119,6,0.8)'; innerFill = 'rgba(120,53,15,0.4)'; textColor = '#fbbf24';
        }
        if (bfsVis && dfsVis) {
          plateFill = '#2d1e4a'; plateStroke = 'rgba(167,139,250,0.7)';
          innerFill = 'rgba(67,56,202,0.3)'; textColor = '#c4b5fd';
        } else if (bfsVis) {
          plateFill = '#1e2d4a'; plateStroke = 'rgba(96,165,250,0.7)';
          innerFill = 'rgba(29,78,216,0.3)'; textColor = '#93c5fd';
        } else if (dfsVis) {
          plateFill = '#4a2010'; plateStroke = 'rgba(251,146,60,0.7)';
          innerFill = 'rgba(194,65,12,0.3)'; textColor = '#fdba74';
        }

        const pulsing = isCurrentBFS || isCurrentDFS;
        const pulseColor = isCurrentBFS && isCurrentDFS ? 'rgba(167,139,250,0.5)'
          : isCurrentBFS ? 'rgba(96,165,250,0.5)' : 'rgba(251,146,60,0.5)';

        return (
          <g key={n.id} filter="url(#node-shadow)">
            {pulsing && (
              <circle cx={n.x} cy={n.y} r="30" fill="none"
                stroke={pulseColor} strokeWidth="2" className="animate-ping" />
            )}
            <ellipse cx={n.x} cy={n.y + 4} rx="22" ry="6" fill="rgba(0,0,0,0.3)" />
            <circle cx={n.x} cy={n.y} r="22" fill={plateFill} stroke={plateStroke} strokeWidth="1.5" className="transition-all duration-300" />
            <circle cx={n.x} cy={n.y} r="18" fill={innerFill} stroke={innerStroke} strokeWidth="1" className="transition-all duration-300" />
            <line x1={n.x - 5} y1={n.y - 8} x2={n.x - 2} y2={n.y + 2} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
            <line x1={n.x + 3} y1={n.y - 6} x2={n.x + 6} y2={n.y + 4} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fill={textColor}
              fontSize="12" fontFamily="ui-monospace,monospace" fontWeight="800"
              className="pointer-events-none transition-colors duration-300">
              {n.label}
            </text>
          </g>
        );
      })}

      {/* Treasure chest — always visible, on top of node */}
      <TreasureMarker x={treasureNode.x} y={treasureNode.y} />

      {/* Floating TREASURE label near chest */}
      <g transform={`translate(${tlx}, ${tly})`}>
        <rect x="0" y="0" width="60" height="18" rx="4"
          fill="rgba(30,20,0,0.9)" stroke="rgba(251,191,36,0.7)" strokeWidth="1" />
        <text x="30" y="13" textAnchor="middle" fill="#fbbf24"
          fontSize="8.5" fontFamily="system-ui,sans-serif" fontWeight="700" letterSpacing="0.5">
          TREASURE
        </text>
      </g>

      {/* START label */}
      <g transform="translate(8, 8)">
        <rect x="0" y="0" width="48" height="18" rx="4"
          fill="rgba(20,30,20,0.9)" stroke="rgba(96,165,250,0.5)" strokeWidth="1" />
        <text x="24" y="13" textAnchor="middle" fill="#93c5fd"
          fontSize="8.5" fontFamily="system-ui,sans-serif" fontWeight="700" letterSpacing="0.5">
          START
        </text>
      </g>

      {/* BFS doll — outer g handles position (CSS transition), inner g handles bounce */}
      <g style={{
        transform: `translate(${bfsPos.x - 18}px, ${bfsPos.y - 32}px)`,
        transition: 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <g style={{
          animation: animStep < 0 && selectedPrediction === 'bfs' ? 'bounce 0.65s ease-in-out infinite' : undefined,
        }}>
          <BFSMarker x={18} y={32} />
        </g>
      </g>

      {/* DFS doll — outer g handles position (CSS transition), inner g handles bounce */}
      <g style={{
        transform: `translate(${dfsPos.x + 2}px, ${dfsPos.y - 32}px)`,
        transition: 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <g style={{
          animation: animStep < 0 && selectedPrediction === 'dfs' ? 'bounce 0.65s ease-in-out infinite' : undefined,
        }}>
          <DFSMarker x={0} y={32} />
        </g>
      </g>

      {/* Bounce keyframes injected via style tag in SVG */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function BFSDFSGame({ config, onComplete, onAttempt }: Props) {
  const [phase, setPhase] = useState<Phase>('carousel');
  const [slideIdx, setSlideIdx] = useState(0);
  const [roundIdx, setRoundIdx] = useState(0);
  const [selectedPrediction, setSelectedPrediction] = useState<'bfs' | 'dfs' | null>(null);
  const [prediction, setPrediction] = useState<'bfs' | 'dfs' | null>(null);
  const [animStep, setAnimStep] = useState(-1);
  const [animRunning, setAnimRunning] = useState(false);
  const [speed, setSpeed] = useState<'normal' | 'fast'>('normal');
  const [visitedBFS, setVisitedBFS] = useState<Set<string>>(new Set());
  const [visitedDFS, setVisitedDFS] = useState<Set<string>>(new Set());
  const [showResult, setShowResult] = useState(false);

  const round: BFSDFSGameRound | undefined = config.rounds[roundIdx];
  const totalSlides = config.slides.length;
  const isCarouselLast = slideIdx === totalSlides - 1;

  const resetRound = useCallback(() => {
    setSelectedPrediction(null);
    setPrediction(null);
    setAnimStep(-1);
    setAnimRunning(false);
    setVisitedBFS(new Set());
    setVisitedDFS(new Set());
    setShowResult(false);
    setSpeed('normal');
  }, []);

  const handleSubmitPrediction = useCallback(() => {
    if (!selectedPrediction || !round) return;
    setPrediction(selectedPrediction);
    setAnimStep(0);
    setAnimRunning(true);
    setPhase('simulate');
    onAttempt?.();
  }, [selectedPrediction, round, onAttempt]);

  useEffect(() => {
    if (!animRunning || !round) return;
    if (animStep >= Math.max(round.bfsOrder.length, round.dfsOrder.length)) {
      setAnimRunning(false);
      setShowResult(true);
      return;
    }
    const delay = speed === 'fast' ? 400 : 1200;
    const t = setTimeout(() => {
      setVisitedBFS(new Set(round.bfsOrder.slice(0, Math.min(animStep + 1, round.bfsOrder.length))));
      setVisitedDFS(new Set(round.dfsOrder.slice(0, Math.min(animStep + 1, round.dfsOrder.length))));
      setAnimStep(i => i + 1);
    }, delay);
    return () => clearTimeout(t);
  }, [animRunning, animStep, round, speed]);

  const bfsQueue = round ? computeBFSQueue(round.bfsOrder, visitedBFS.size - 1, config.edges) : [];
  const dfsStack = round ? computeDFSStack(round.dfsOrder, visitedDFS.size - 1, config.edges) : [];

  const handleSlideNext = () => {
    if (isCarouselLast) { resetRound(); setPhase('predict'); }
    else setSlideIdx(i => i + 1);
  };


  const handleNextRound = () => {
    if (roundIdx + 1 >= config.rounds.length) {
      setPhase('complete');
    } else {
      resetRound();
      setRoundIdx(i => i + 1);
      setPhase('predict');
    }
  };

  const handleTryAgain = () => {
    setSlideIdx(0);
    setPhase('carousel');
    setRoundIdx(0);
    resetRound();
  };

  // ── Complete screen ──────────────────────────────────────────────────────────
  if (phase === 'complete') {
    return (
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-slate-800/40 backdrop-blur-sm p-8 space-y-6 text-center">
        <div className="text-4xl">🏆</div>
        <h3 className="text-xl font-bold text-white">{config.completionTitle}</h3>
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line max-w-lg mx-auto">{config.completionMessage}</p>
        <div className="max-w-md mx-auto space-y-2">
          {config.rounds.map((r, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/30">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                r.winner === 'bfs' ? 'bg-blue-900/30 text-blue-300 border border-blue-500/30' : 'bg-indigo-900/30 text-indigo-300 border border-indigo-500/30'
              }`}>{i + 1}</div>
              <div className="flex-1 text-left">
                <p className="text-xs text-slate-300">{r.mission}</p>
                <p className="text-xs font-semibold text-slate-200">{r.winner === 'bfs' ? 'BFS Explorer won' : 'DFS Explorer won'}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-slate-300">{config.closingMessage}</p>
        <div className="flex justify-center gap-3">
          <button onClick={handleTryAgain} className="px-4 py-2 text-xs font-semibold text-slate-300 rounded-lg border border-slate-700/50 bg-slate-800/50 hover:bg-slate-700/50 transition-all">
            Try Again
          </button>
          <button onClick={onComplete} className="px-5 py-2 text-xs font-semibold text-white rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
            Continue Learning
          </button>
        </div>
      </div>
    );
  }

  // ── Carousel ─────────────────────────────────────────────────────────────────
  if (phase === 'carousel') {
    const slide = config.slides[slideIdx];
    return (
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-700/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">🗺️</span>
            <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Treasure Hunt Expedition</p>
          </div>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${
                i === slideIdx ? 'bg-indigo-400 scale-125' : i < slideIdx ? 'bg-indigo-600/60' : 'bg-slate-600/50'
              }`} />
            ))}
          </div>
        </div>
        <div className="p-8 max-w-xl mx-auto space-y-5">
          <h3 className="text-xl font-bold text-white text-center">{slide.title}</h3>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{slide.body}</p>
          <div className="text-center pt-2">
            <button onClick={handleSlideNext}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20">
              {isCarouselLast ? 'Start Expedition →' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!round) return null;

  const treasureFoundBFS = visitedBFS.has(round.treasureNode);
  const treasureFoundDFS = visitedDFS.has(round.treasureNode);

  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="px-5 py-2.5 bg-slate-800/60 border-b border-slate-700/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">
            ROUND {roundIdx + 1} OF {config.rounds.length}
          </span>
          <div className="flex items-center gap-1 ml-3">
            {config.rounds.map((_, i) => (
              <div key={i} className={`h-1.5 w-8 rounded-full transition-all ${
                i < roundIdx ? 'bg-indigo-500' : i === roundIdx ? 'bg-indigo-400' : 'bg-slate-700'
              }`} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span>🏔️</span>
          <span>{round.mission}</span>
        </div>
      </div>

      {/* ── Map ───────────────────────────────────────────────────────────── */}
      <div className="relative">
        <MapSVG
          config={config}
          round={round}
          visitedBFS={visitedBFS}
          visitedDFS={visitedDFS}
          animStep={animStep}
          selectedPrediction={selectedPrediction}
        />
      </div>

      {/* ── Phase-driven bottom panel ──────────────────────────────────────── */}

      {/* PREDICT: pick an explorer */}
      {!prediction && (
        <div className="px-6 py-5 space-y-4 border-t border-slate-700/30 max-w-xl mx-auto w-full">
          <div className="text-center space-y-1">
            <p className="text-base font-bold text-white">Who do you think will find the treasure first?</p>
            <p className="text-sm text-slate-300">Study the map, then make your prediction.</p>
          </div>

          <div className="space-y-2">
            {/* BFS option */}
            <button
              onClick={() => setSelectedPrediction('bfs')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border transition-all ${
                selectedPrediction === 'bfs'
                  ? 'border-blue-500/60 bg-blue-900/25 ring-1 ring-blue-500/30'
                  : 'border-slate-700/40 bg-slate-800/30 hover:border-blue-500/20 hover:bg-blue-900/10'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                selectedPrediction === 'bfs' ? 'border-blue-400' : 'border-slate-600'
              }`}>
                {selectedPrediction === 'bfs' && <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />}
              </div>
              <ExplorerBFS size={44} />
              <div className="text-left flex-1">
                <p className="text-sm font-bold text-blue-300">BFS Explorer</p>
                <p className="text-xs text-slate-300 mt-0.5">Explores all nearby paths before going deeper.</p>
              </div>
            </button>

            {/* DFS option */}
            <button
              onClick={() => setSelectedPrediction('dfs')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border transition-all ${
                selectedPrediction === 'dfs'
                  ? 'border-indigo-500/60 bg-indigo-900/25 ring-1 ring-indigo-500/30'
                  : 'border-slate-700/40 bg-slate-800/30 hover:border-indigo-500/20 hover:bg-indigo-900/10'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                selectedPrediction === 'dfs' ? 'border-indigo-400' : 'border-slate-600'
              }`}>
                {selectedPrediction === 'dfs' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />}
              </div>
              <ExplorerDFS size={44} />
              <div className="text-left flex-1">
                <p className="text-sm font-bold text-indigo-300">DFS Explorer</p>
                <p className="text-xs text-slate-300 mt-0.5">Explores one path completely before trying another.</p>
              </div>
            </button>
          </div>

          <button
            onClick={handleSubmitPrediction}
            disabled={!selectedPrediction}
            className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
              selectedPrediction
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-slate-800 text-slate-300 border border-slate-700/40 cursor-not-allowed'
            }`}
          >
            {selectedPrediction ? 'Submit Prediction →' : 'Select an explorer first'}
          </button>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="px-4 py-3 rounded-lg bg-slate-800/50 border border-blue-500/15 space-y-1">
              <p className="text-xs font-semibold text-blue-400">BFS uses a Queue</p>
              <p className="text-xs text-slate-300 leading-relaxed">Visits neighbors level by level — guarantees the shortest path.</p>
            </div>
            <div className="px-4 py-3 rounded-lg bg-slate-800/50 border border-indigo-500/15 space-y-1">
              <p className="text-xs font-semibold text-indigo-400">DFS uses a Stack</p>
              <p className="text-xs text-slate-300 leading-relaxed">Dives deep into one branch before backtracking.</p>
            </div>
          </div>
        </div>
      )}

      {/* SIMULATE: animation running */}
      {prediction && animRunning && (
        <div className="px-6 py-5 border-t border-slate-700/30 space-y-4 max-w-xl mx-auto w-full">
          <p className="text-base font-bold text-white text-center">Both explorers are searching...</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="px-4 py-3 rounded-xl bg-blue-900/15 border border-blue-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-blue-300">BFS Explorer</p>
                {treasureFoundBFS && <span className="text-xs font-bold text-indigo-400">✓ Found!</span>}
              </div>
              <p className="text-xs text-slate-300">{visitedBFS.size} nodes visited</p>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Queue</p>
                <DataStructureRow items={bfsQueue} type="queue" maxSlots={6} />
              </div>
            </div>
            <div className="px-4 py-3 rounded-xl bg-indigo-900/15 border border-indigo-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-indigo-300">DFS Explorer</p>
                {treasureFoundDFS && <span className="text-xs font-bold text-indigo-400">✓ Found!</span>}
              </div>
              <p className="text-xs text-slate-300">{visitedDFS.size} nodes visited</p>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Stack</p>
                <DataStructureRow items={dfsStack} type="stack" maxSlots={6} />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setSpeed(s => s === 'normal' ? 'fast' : 'normal')}
              className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/50 transition-colors"
            >
              {speed === 'normal' ? '⏩ Speed Up' : '⏸ Normal Speed'}
            </button>
            <button
              onClick={() => {
                setAnimRunning(false);
                setVisitedBFS(new Set(round.bfsOrder));
                setVisitedDFS(new Set(round.dfsOrder));
                setAnimStep(Math.max(round.bfsOrder.length, round.dfsOrder.length));
                setShowResult(true);
              }}
              className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/50 transition-colors"
            >
              ⏭ Skip to Result
            </button>
          </div>
        </div>
      )}

      {/* RESULT: show outcome + explanation */}
      {showResult && (
        <div className="px-6 py-5 border-t border-slate-700/30 space-y-4 max-w-xl mx-auto w-full">
          {/* Outcome banner */}
          <div className={`px-4 py-3 rounded-xl text-center border ${
            round.winner === prediction
              ? 'bg-indigo-900/25 border-indigo-500/30'
              : 'bg-slate-800/60 border-slate-700/30'
          }`}>
            <p className={`text-sm font-bold ${round.winner === prediction ? 'text-indigo-300' : 'text-slate-300'}`}>
              {round.winner === prediction ? '🎯 Correct! Your prediction was right.' : '📚 Not quite — but this is the real learning moment.'}
            </p>
          </div>

          {/* Winner comparison */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
              round.winner === 'bfs' ? 'bg-blue-900/25 border-blue-500/40' : 'bg-slate-800/30 border-slate-700/30'
            }`}>
              <ExplorerBFS size={40} />
              <div>
                <p className={`text-sm font-bold ${round.winner === 'bfs' ? 'text-blue-300' : 'text-slate-300'}`}>
                  {round.winner === 'bfs' ? '🏆 BFS won' : 'BFS'}
                </p>
                <p className="text-xs text-slate-300 mt-0.5">{visitedBFS.size} nodes visited</p>
              </div>
            </div>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
              round.winner === 'dfs' ? 'bg-indigo-900/25 border-indigo-500/40' : 'bg-slate-800/30 border-slate-700/30'
            }`}>
              <ExplorerDFS size={40} />
              <div>
                <p className={`text-sm font-bold ${round.winner === 'dfs' ? 'text-indigo-300' : 'text-slate-300'}`}>
                  {round.winner === 'dfs' ? '🏆 DFS won' : 'DFS'}
                </p>
                <p className="text-xs text-slate-300 mt-0.5">{visitedDFS.size} nodes visited</p>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <p className="text-sm text-slate-300 leading-relaxed">{round.explanation}</p>

          <button
            onClick={handleNextRound}
            className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
          >
            {roundIdx + 1 >= config.rounds.length ? '🏆 See Final Results' : `Next Round (${roundIdx + 2} of ${config.rounds.length}) →`}
          </button>
        </div>
      )}
    </div>
  );
}
