import { useState, useCallback, useEffect, useRef } from "react";
import { RotateCcw, Sparkles } from "lucide-react";
import type { HierarchyExpandConfig } from "../../types/lesson";

interface ExpandUniverseProps {
  config: HierarchyExpandConfig;
  title?: string;
  learningGoal?: string;
  challenge?: string;
  onComplete: () => void;
}

type Phase = "start" | "ai_revealed" | "ml_revealed" | "dl_revealed" | "populate" | "complete";

interface ExampleItem {
  label: string;
  belongsTo: "ai" | "ml" | "dl" | "none";
  explanation: string;
  cx: number;
  cy: number;
  placed: boolean;
  w: number;
  lines: string[];
}

interface LevelColors {
  fill: string;
  stroke: string;
  text: string;
}

interface Theme {
  root: LevelColors;
  child: LevelColors;
  grandchild: LevelColors;
  bgGlow1: string;
  bgGlow2: string;
}

const THEMES: Record<string, Theme> = {
  ai: {
    root: { fill: "rgba(59,130,246,0.2)", stroke: "rgba(59,130,246,0.7)", text: "#93c5fd" },
    child: { fill: "rgba(217,119,6,0.25)", stroke: "rgba(217,119,6,0.7)", text: "#fbbf24" },
    grandchild: { fill: "rgba(16,185,129,0.3)", stroke: "rgba(16,185,129,0.7)", text: "#6ee7b7" },
    bgGlow1: "rgba(59,130,246,0.08)",
    bgGlow2: "rgba(217,119,6,0.06)",
  },
  vision: {
    root: { fill: "rgba(139,92,246,0.2)", stroke: "rgba(139,92,246,0.7)", text: "#c4b5fd" },
    child: { fill: "rgba(217,70,239,0.2)", stroke: "rgba(217,70,239,0.7)", text: "#f0abfc" },
    grandchild: { fill: "rgba(16,185,129,0.3)", stroke: "rgba(16,185,129,0.7)", text: "#6ee7b7" },
    bgGlow1: "rgba(139,92,246,0.08)",
    bgGlow2: "rgba(217,70,239,0.06)",
  },
};

const LEVEL_IDS = ["ai", "ml", "dl"] as const;
const LEVEL_KEYS = ["root", "child", "grandchild"] as const;

function getTheme(config: HierarchyExpandConfig): Theme {
  return THEMES[config.theme || "ai"] || THEMES.ai;
}

function shortLabel(label: string): string {
  if (label === "Convolutional Neural Network") return "CNN";
  const words = label.split(" ");
  if (words.length >= 2) {
    return words.map(w => w[0]).join("").toUpperCase();
  }
  return label.length > 6 ? label.slice(0, 3).toUpperCase() : label;
}

function makeExamples(config: HierarchyExpandConfig): ExampleItem[] {
  const items: ExampleItem[] = [];
  const examples = config.steps.find(s => s.id === "real-world")?.items || [];
  const cx = 280;
  const cy = 220;
  const r = 170;
  examples.forEach((ex, i) => {
    const angle = (i / examples.length) * Math.PI * 2 - Math.PI / 2;
    const cat = (["ai", "ml", "dl", "none"].includes(ex.category || "") ? ex.category : "none") as "ai" | "ml" | "dl" | "none";
    if (cat === "none") return;
    const label = ex.label;
    const lines = label.length > 12 && label.includes(" ")
      ? [label.slice(0, label.indexOf(" ")), label.slice(label.indexOf(" ") + 1)]
      : [label];
    const w = Math.max(90, Math.min(130, label.length * 6.5));
    items.push({
      label,
      belongsTo: cat,
      explanation: ex.explanation || `belongs to ${config.grandchild.label}`,
      cx: cx + Math.cos(angle) * r,
      cy: cy + Math.sin(angle) * r,
      placed: false,
      w,
      lines,
    });
  });
  return items;
}

const VW = 560;
const VH = 440;
const CX = VW / 2;
const CY = VH / 2;
const AI_R = 200;
const ML_R = 130;
const DL_R = 74;

export default function ExpandUniverse({ config, onComplete }: ExpandUniverseProps) {
  const theme = getTheme(config);
  const placedRef = useRef(0);
  const [phase, setPhase] = useState<Phase>("start");
  const [examples, setExamples] = useState<ExampleItem[]>([]);
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);
  const [placedFlash, setPlacedFlash] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [belongsMsg, setBelongsMsg] = useState<{ text: string; x: number; y: number } | null>(null);
  const [showContinue, setShowContinue] = useState(false);

  const totalExamples = examples.length;

  const levelLabel = (level: "ai" | "ml" | "dl") => {
    const idx = LEVEL_IDS.indexOf(level);
    const key = LEVEL_KEYS[idx];
    return config[key].label;
  };

  const levelColors = (level: "ai" | "ml" | "dl"): LevelColors => {
    if (level === "ai") return theme.root;
    if (level === "ml") return theme.child;
    return theme.grandchild;
  };

  const isRevealed = (level: "ai" | "ml" | "dl") => {
    if (level === "ai") return true;
    if (level === "ml") return ["ml_revealed", "dl_revealed", "populate", "complete"].includes(phase);
    if (level === "dl") return ["dl_revealed", "populate", "complete"].includes(phase);
    return false;
  };

  const handleNodeClick = useCallback((level: "ai" | "ml" | "dl") => {
    if (phase === "start" && level === "ai") {
      setPhase("ai_revealed");
      setTimeout(() => setPhase("ml_revealed"), 1200);
    } else if (phase === "ml_revealed" && level === "ml") {
      setPhase("dl_revealed");
      setTimeout(() => {
        setPhase("populate");
        setExamples(makeExamples(config));
      }, 1500);
    }
  }, [phase, config]);

  useEffect(() => {
    if (phase === "populate" && examples.length === 0) {
      setExamples(makeExamples(config));
    }
  }, [phase, config, examples.length]);

  const handleExampleClick = useCallback((idx: number) => {
    const item = examples[idx];
    if (!item || item.placed || placing) return;

    setPlacing(true);
    setWrongFlash(null);

    setTimeout(() => {
      setPlacedFlash(item.belongsTo);
      setBelongsMsg({ text: item.explanation, x: CX, y: CY - 10 });
      setExamples((prev) =>
        prev.map((e, i) => (i === idx ? { ...e, placed: true } : e))
      );
      placedRef.current += 1;

      setTimeout(() => {
        setPlacedFlash(null);
        setBelongsMsg(null);

        if (placedRef.current >= totalExamples) {
          setPhase("complete");
          setTimeout(() => setShowContinue(true), 1200);
        } else {
          setPlacing(false);
        }
      }, 2200);
    }, 600);
  }, [examples, placing, totalExamples]);

  const handleReset = () => {
    setPhase("start");
    setExamples([]);
    placedRef.current = 0;
    setShowContinue(false);
    setWrongFlash(null);
    setPlacedFlash(null);
    setPlacing(false);
    setBelongsMsg(null);
  };

  const NodeRing = ({ level }: { level: "ai" | "ml" | "dl" }) => {
    const colors = levelColors(level);
    const r = level === "ai" ? AI_R : level === "ml" ? ML_R : DL_R;
    const revealed = isRevealed(level);
    const isClickable = (phase === "start" && level === "ai") || (phase === "ml_revealed" && level === "ml");
    const labelY = level === "ai" ? CY - r + 24 : level === "ml" ? CY - r + 20 : CY + 5;
    const fullLabel = levelLabel(level);
    const abbr = shortLabel(fullLabel);
    const labelSize = fullLabel.length > 12 ? 10 : fullLabel.length > 8 ? 12 : 14;

    if (!revealed) return null;

    return (
      <g>
        <circle cx={CX} cy={CY} r={r + 6} fill="none" stroke={colors.stroke} strokeWidth={1} opacity={0.2}>
          <animate attributeName="r" values={`${r + 4};${r + 10};${r + 4}`} dur="5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.15;0.3;0.15" dur="5s" repeatCount="indefinite" />
        </circle>
        <circle
          cx={CX}
          cy={CY}
          r={r}
          fill={colors.fill}
          stroke={placedFlash === level ? "#10b981" : colors.stroke}
          strokeWidth={placedFlash === level ? 3 : 2.5}
          className={isClickable ? "cursor-pointer" : ""}
          onClick={() => handleNodeClick(level)}
        >
          <animate attributeName="ry" values={`${r};${r + 1.5};${r}`} dur="6s" repeatCount="indefinite" />
        </circle>
        {fullLabel.length > 8 ? (
          <>
            <text x={CX} y={labelY - 2} textAnchor="middle" fontSize={labelSize} fontWeight="bold" fill="white" className="pointer-events-none select-none">
              {abbr}
            </text>
            <text x={CX} y={labelY + 13} textAnchor="middle" fontSize={8} fill={colors.text} className="pointer-events-none select-none">
              {fullLabel}
            </text>
          </>
        ) : (
          <>
            <text x={CX} y={labelY} textAnchor="middle" fontSize={labelSize} fontWeight="bold" fill="white" className="pointer-events-none select-none">
              {fullLabel}
            </text>
            <text x={CX} y={labelY + 14} textAnchor="middle" fontSize={7} fill={colors.text} className="pointer-events-none select-none">
              {level === "ai"
                ? (config.theme === "vision" ? "Foundation of Vision AI" : "Artificial Intelligence")
                : level === "ml"
                  ? (config.theme === "vision" ? "Neural Networks at Scale" : "Machine Learning")
                  : (config.theme === "vision" ? "Image Understanding" : "Deep Learning")}
            </text>
          </>
        )}
        {isClickable && (
          <text x={CX} y={CY + r + 18} textAnchor="middle" fontSize={9} fill="#64748b" className="pointer-events-none select-none">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="2.5s" repeatCount="indefinite" />
            tap to expand
          </text>
        )}
        {placedFlash === level && (
          <circle cx={CX} cy={CY} r={r + 10} fill="none" stroke="#10b981" strokeWidth={3} opacity={0.7}>
            <animate attributeName="r" values={`${r + 6};${r + 22}`} dur="1.5s" repeatCount="1" />
            <animate attributeName="opacity" values="0.7;0" dur="1.5s" repeatCount="1" />
          </circle>
        )}
      </g>
    );
  };

  const hintText = (phase === "start"
    ? `\u2726 Tap ${config.root.label} to discover what's inside`
    : phase === "ml_revealed"
      ? `\u2726 Tap ${config.child.label} to see what's inside`
      : phase === "populate" && !belongsMsg
        ? `\u2726 Tap each example to see where it belongs`
        : null);

  return (
    <div className="rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm overflow-hidden">
      <div className="relative" style={{ aspectRatio: "560/440" }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute rounded-full" style={{ width: "380px", height: "380px", left: "50%", top: "45%", transform: "translate(-50%,-50%)", filter: "blur(80px)", backgroundColor: theme.bgGlow1 }} />
          <div className="absolute rounded-full" style={{ width: "260px", height: "260px", left: "50%", top: "50%", transform: "translate(-50%,-50%)", filter: "blur(60px)", backgroundColor: theme.bgGlow2 }} />
        </div>

        <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet">
          <NodeRing level="ai" />
          <NodeRing level="ml" />
          <NodeRing level="dl" />

          {phase === "populate" && examples.map((item, i) =>
            !item.placed && (
              <g key={i} className="cursor-pointer" onClick={() => handleExampleClick(i)}>
                <rect
                  x={item.cx - item.w / 2}
                  y={item.cy - 17}
                  width={item.w}
                  height={34}
                  rx={17}
                  fill="rgba(30,41,59,0.85)"
                  stroke={wrongFlash === item.label ? "rgba(239,68,68,0.6)" : "rgba(100,116,139,0.4)"}
                  strokeWidth={1}
                >
                  <animate attributeName="y" values={`${item.cy - 17};${item.cy - 22};${item.cy - 17}`} dur={`${5 + i * 0.6}s`} repeatCount="indefinite" />
                </rect>
                {item.lines.length === 1 ? (
                  <text x={item.cx} y={item.cy + 1} textAnchor="middle" dominantBaseline="central" fontSize={10} fill="#e2e8f0" className="pointer-events-none select-none">
                    {item.label}
                  </text>
                ) : (
                  <>
                    <text x={item.cx} y={item.cy - 5} textAnchor="middle" dominantBaseline="central" fontSize={8.5} fill="#e2e8f0" className="pointer-events-none select-none">
                      {item.lines[0]}
                    </text>
                    <text x={item.cx} y={item.cy + 7} textAnchor="middle" dominantBaseline="central" fontSize={8.5} fill="#e2e8f0" className="pointer-events-none select-none">
                      {item.lines[1]}
                    </text>
                  </>
                )}
                <text x={item.cx} y={item.cy + 26} textAnchor="middle" dominantBaseline="central" fontSize={7} fill="#64748b" className="pointer-events-none select-none">
                  tap
                </text>
              </g>
            )
          )}

          {belongsMsg && (
            <g>
              <rect x={belongsMsg.x - 190} y={belongsMsg.y - 14} width={380} height={28} rx={14} fill="rgba(15,23,42,0.9)" stroke="rgba(16,185,129,0.4)" strokeWidth={1} />
              <text x={belongsMsg.x} y={belongsMsg.y + 1} textAnchor="middle" fontSize={10} fill="#6ee7b7" className="pointer-events-none select-none">
                {"\u2726"} {belongsMsg.text}
              </text>
            </g>
          )}
        </svg>

        {hintText && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            <p className="text-xs font-medium text-slate-400 text-center px-4 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/30 backdrop-blur-sm">
              {hintText}
            </p>
          </div>
        )}
      </div>

      {phase === "complete" && (
        <div className="border-t border-slate-700/30">
          <div className="flex flex-col items-center justify-center py-8 px-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-4">
              <Sparkles size={26} className="text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Great Job</h3>
            <p className="text-xs text-slate-400 text-center max-w-xs mb-6">
              {config.completionMessage || "You explored the AI universe and discovered how each field nests inside the next."}
            </p>
            <div className="flex items-center gap-3">
              <button onClick={handleReset} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600/50 transition-all">
                <RotateCcw size={14} /> Try Again
              </button>
              {showContinue && (
                <button onClick={onComplete} className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all">
                  Continue
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
