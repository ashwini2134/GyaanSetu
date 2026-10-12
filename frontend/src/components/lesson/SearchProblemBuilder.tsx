import { useState, useEffect } from 'react';
import type { SearchProblemBuilderConfig, SearchProblemBuilderLocation } from '../../types/lesson';

interface SearchProblemBuilderProps {
  config: SearchProblemBuilderConfig;
  onComplete: () => void;
  onAttempt?: () => void;
}

type Phase = 'carousel' | 'scenario' | 'start' | 'goal' | 'actions' | 'cost' | 'validation' | 'complete';

const LOC_W = 160;
const LOC_H = 34;
const LOC_R = 6;
const MAP_W = 500;
const MAP_H = 340;

const ROOM_COLORS: Record<string, { fill: string; stroke: string; text: string; icon: string }> = {
  entrance: { fill: 'rgba(5,150,105,0.15)', stroke: 'rgba(52,211,153,0.3)', text: '#6ee7b7', icon: 'S' },
  reception: { fill: 'rgba(37,99,235,0.12)', stroke: 'rgba(96,165,250,0.25)', text: '#93c5fd', icon: 'R' },
  hallway: { fill: 'rgba(100,116,139,0.15)', stroke: 'rgba(148,163,184,0.25)', text: '#cbd5e1', icon: 'H' },
  pharmacy: { fill: 'rgba(147,51,234,0.12)', stroke: 'rgba(192,132,252,0.25)', text: '#d8b4fe', icon: 'P' },
  elevator: { fill: 'rgba(234,179,8,0.12)', stroke: 'rgba(253,224,71,0.25)', text: '#fde68a', icon: 'E' },
  lab: { fill: 'rgba(220,38,38,0.12)', stroke: 'rgba(252,129,129,0.25)', text: '#fca5a5', icon: 'L' },
  room101: { fill: 'rgba(30,41,59,0.6)', stroke: 'rgba(148,163,184,0.2)', text: '#94a3b8', icon: '101' },
  room102: { fill: 'rgba(30,41,59,0.6)', stroke: 'rgba(148,163,184,0.2)', text: '#94a3b8', icon: '102' },
  room201: { fill: 'rgba(30,41,59,0.6)', stroke: 'rgba(148,163,184,0.2)', text: '#94a3b8', icon: '201' },
  room202: { fill: 'rgba(234,179,8,0.15)', stroke: 'rgba(253,224,71,0.35)', text: '#fde68a', icon: '202' },
};

function getRoomColor(id: string) {
  return ROOM_COLORS[id] || { fill: 'rgba(30,41,59,0.6)', stroke: 'rgba(148,163,184,0.2)', text: '#94a3b8', icon: '' };
}

function RobotMarker({ x, y, className = '' }: { x: number; y: number; className?: string }) {
  return (
    <g className={className}>
      <animateTransform attributeName="transform" type="translate" values={`${x - 20},${y - 28};${x - 20},${y - 32};${x - 20},${y - 28}`} dur="2s" repeatCount="indefinite" />
      <rect x={x - 8} y={y - 16} width="16" height="12" rx="2" fill="rgba(52,211,153,0.9)" stroke="#6ee7b7" strokeWidth="1" />
      <circle cx={x - 3} cy={y - 11} r="1.5" fill="#064e3b" />
      <circle cx={x + 3} cy={y - 11} r="1.5" fill="#064e3b" />
      <rect x={x - 4} y={y - 20} width="8" height="5" rx="1" fill="rgba(52,211,153,0.7)" />
      <line x1={x - 6} y1={y - 4} x2={x - 9} y2={y - 1} stroke="#6ee7b7" strokeWidth="1.5" strokeLinecap="round" />
      <line x1={x + 6} y1={y - 4} x2={x + 9} y2={y - 1} stroke="#6ee7b7" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  );
}

function HospitalMap({
  locations,
  edges,
  selectedId,
  onLocationClick,
  disabled,
  showRobot,
  robotLocationId,
}: {
  locations: SearchProblemBuilderLocation[];
  edges: [string, string][];
  selectedId?: string;
  onLocationClick?: (id: string) => void;
  disabled?: boolean;
  showRobot?: boolean;
  robotLocationId?: string;
}) {
  const locMap = new Map(locations.map(l => [l.id, l]));
  const robotLoc = robotLocationId ? locMap.get(robotLocationId) : null;

  return (
    <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="w-full h-auto max-w-lg mx-auto">
      <rect x="0" y="0" width={MAP_W} height={MAP_H} rx="12" fill="rgba(15,23,42,0.6)" stroke="rgba(148,163,184,0.15)" strokeWidth="1" />
      <rect x="4" y="4" width={MAP_W - 8} height={MAP_H - 8} rx="10" fill="none" stroke="rgba(148,163,184,0.06)" strokeWidth="1" strokeDasharray="4 4" />
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill="none" stroke="rgba(148,163,184,0.03)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect x="8" y="8" width={MAP_W - 16} height={MAP_H - 16} fill="url(#grid)" rx="8" />

      {edges.map(([from, to], i) => {
        const a = locMap.get(from);
        const b = locMap.get(to);
        if (!a || !b) return null;
        const isHighlighted = selectedId === from || selectedId === to || robotLocationId === from || robotLocationId === to;
        return (
          <line
            key={`edge-${i}`}
            x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke={isHighlighted ? 'rgba(148,163,184,0.35)' : 'rgba(148,163,184,0.15)'}
            strokeWidth={isHighlighted ? '2' : '1.5'}
            strokeDasharray="4 3"
            className="transition-all duration-500"
          />
        );
      })}

      {locations.map(loc => {
        const isSelected = selectedId === loc.id;
        const room = getRoomColor(loc.id);
        let fill = room.fill;
        let stroke = room.stroke;
        let textFill = room.text;
        let glow = false;

        if (isSelected) {
          fill = 'rgba(6,78,59,0.6)';
          stroke = 'rgba(52,211,153,0.8)';
          textFill = '#6ee7b7';
          glow = true;
        }

        return (
          <g
            key={loc.id}
            onClick={() => !disabled && onLocationClick?.(loc.id)}
            className={onLocationClick && !disabled ? 'cursor-pointer' : ''}
          >
            {glow && (
              <rect
                x={loc.x - LOC_W / 2 - 3}
                y={loc.y - LOC_H / 2 - 3}
                width={LOC_W + 6}
                height={LOC_H + 6}
                rx={LOC_R + 2}
                fill="none"
                stroke="rgba(52,211,153,0.3)"
                strokeWidth="2"
                className="animate-pulse"
              />
            )}
            <rect
              x={loc.x - LOC_W / 2}
              y={loc.y - LOC_H / 2}
              width={LOC_W}
              height={LOC_H}
              rx={LOC_R}
              fill={fill}
              stroke={stroke}
              strokeWidth={isSelected ? 2 : 1.5}
              className="transition-all duration-500"
            />
            <text
              x={loc.x}
              y={loc.y + 4}
              textAnchor="middle"
              fill={textFill}
              fontSize="11"
              fontFamily="ui-monospace, SFMono-Regular, monospace"
              fontWeight="500"
              className="transition-colors duration-500 pointer-events-none"
            >
              {loc.label}
            </text>
          </g>
        );
      })}

      {showRobot && robotLoc && (
        <RobotMarker x={robotLoc.x} y={robotLoc.y} className="drop-shadow-lg" />
      )}
    </svg>
  );
}

function CheckCircle({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="M6 10l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MapPin({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="9" r="2.5" fill="currentColor" />
    </svg>
  );
}

function PuzzlePiece({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M4 7h3V4a2 2 0 014 0v3h3a2 2 0 010 4h-3v3a2 2 0 01-4 0v-3H4a2 2 0 010-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function RobotIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect x="5" y="8" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="9" cy="13" r="1.5" fill="currentColor" />
      <circle cx="15" cy="13" r="1.5" fill="currentColor" />
      <rect x="10" y="3" width="4" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <line x1="7" y1="20" x2="5" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="17" y1="20" x2="19" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function Sparkle({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <path d="M8 0l1.5 5.5L15 7l-5.5 1.5L8 14l-1.5-5.5L1 7l5.5-1.5L8 0z" fill="currentColor" />
    </svg>
  );
}

function MiniProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1 rounded-full transition-all duration-500 ${
            i < current ? 'w-5 bg-emerald-500' : i === current ? 'w-5 bg-[var(--brand-primary)] shadow-sm shadow-[var(--brand-primary)]/50' : 'w-2 bg-slate-600'
          }`}
        />
      ))}
    </div>
  );
}

export default function SearchProblemBuilder({ config, onComplete, onAttempt }: SearchProblemBuilderProps) {
  const [phase, setPhase] = useState<Phase>('carousel');
  const [slideIdx, setSlideIdx] = useState(0);
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedActions, setSelectedActions] = useState<Set<string>>(new Set());
  const [selectedCost, setSelectedCost] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submittedActions, setSubmittedActions] = useState(false);
  const [submittedCost, setSubmittedCost] = useState(false);
  const [validIdx, setValidIdx] = useState(-1);
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  const [showGoalConfirm, setShowGoalConfirm] = useState(false);

  const totalSlides = config.slides.length;
  const isLastSlide = slideIdx === totalSlides - 1;

  useEffect(() => {
    if (phase !== 'validation') return;
    if (validIdx >= config.validationSteps.length) {
      const t = setTimeout(() => {
        setPhase('complete');
      }, 800);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setValidIdx(i => i + 1);
    }, 900);
    return () => clearTimeout(t);
  }, [phase, validIdx, config.validationSteps.length]);

  const handleNextSlide = () => {
    if (isLastSlide) {
      setPhase('scenario');
    } else {
      setSlideIdx(i => i + 1);
    }
  };

  const handleScenarioStart = () => {
    setPhase('start');
    onAttempt?.();
  };

  const handleLocationClick = (id: string) => {
    if (phase === 'start') {
      if (id === config.startState.correctId) {
        setSelectedStart(id);
        setShowStartConfirm(true);
        setError(null);
        setTimeout(() => {
          setShowStartConfirm(false);
          setPhase('goal');
        }, 2000);
      } else {
        setError(config.startState.errorMessage);
      }
    } else if (phase === 'goal') {
      if (id === config.goalState.correctId) {
        setSelectedGoal(id);
        setShowGoalConfirm(true);
        setError(null);
        setTimeout(() => {
          setShowGoalConfirm(false);
          setPhase('actions');
        }, 2000);
      } else {
        setError(config.goalState.errorMessage);
      }
    }
  };

  const toggleAction = (id: string) => {
    if (submittedActions) return;
    setSelectedActions(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmitActions = () => {
    const correctIds = config.actions.options.filter(o => o.correct).map(o => o.id);
    const selectedIncorrect = config.actions.options.filter(o => selectedActions.has(o.id) && !o.correct);
    if (selectedIncorrect.length > 0) {
      setError(selectedIncorrect[0].feedback || 'This action is not possible in this environment.');
      return;
    }
    const missingIds = correctIds.filter(id => !selectedActions.has(id));
    if (missingIds.length > 0) {
      const missingLabels = missingIds.map(id => config.actions.options.find(o => o.id === id)?.label).filter(Boolean);
      setError(`You missed: ${missingLabels.join(', ')}. The robot needs these to navigate.`);
      return;
    }
    setSubmittedActions(true);
    setError(null);
    setTimeout(() => setPhase('cost'), 600);
  };

  const handleSelectCost = (id: string) => {
    if (submittedCost) return;
    setSelectedCost(id);
  };

  const handleSubmitCost = () => {
    if (!selectedCost) return;
    const opt = config.pathCost.options.find(o => o.id === selectedCost);
    if (!opt) return;
    if (opt.correct) {
      setSubmittedCost(true);
      setError(null);
      setTimeout(() => {
        setPhase('validation');
        setValidIdx(0);
      }, 600);
    } else {
      setError(opt.feedback || 'Think about what the robot should optimise for.');
    }
  };

  const handleTryAgain = () => {
    setSlideIdx(0);
    setPhase('carousel');
    setSelectedStart(null);
    setSelectedGoal(null);
    setSelectedActions(new Set());
    setSelectedCost(null);
    setError(null);
    setSubmittedActions(false);
    setSubmittedCost(false);
    setValidIdx(-1);
    setShowStartConfirm(false);
    setShowGoalConfirm(false);
  };

  const confirmStartAfter = () => showStartConfirm && phase === 'start' && (
    <div className="text-center animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="inline-flex items-center gap-2.5 text-sm font-semibold text-emerald-400 px-5 py-3 rounded-xl bg-emerald-900/25 border border-emerald-500/40 shadow-lg shadow-emerald-900/30">
        <div className="relative">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <Sparkle className="w-3 h-3 text-emerald-300 absolute -top-1 -right-1 animate-ping" />
        </div>
        <span>Start State Selected — Hospital Entrance</span>
      </div>
    </div>
  );

  const confirmGoalAfter = () => showGoalConfirm && phase === 'goal' && (
    <div className="text-center animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="inline-flex items-center gap-2.5 text-sm font-semibold text-emerald-400 px-5 py-3 rounded-xl bg-emerald-900/25 border border-emerald-500/40 shadow-lg shadow-emerald-900/30">
        <div className="relative">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <Sparkle className="w-3 h-3 text-emerald-300 absolute -top-1 -right-1 animate-ping" />
        </div>
        <span>Goal State Selected — Room 202</span>
      </div>
    </div>
  );

  if (phase === 'complete') {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-6 py-6 bg-gradient-to-r from-emerald-900/30 to-slate-800/40 border-b border-emerald-500/20 flex flex-col items-center gap-3">
          <div className="relative">
            <CheckCircle className="w-12 h-12 text-emerald-400" />
            <Sparkle className="w-4 h-4 text-emerald-300 absolute -top-1 -right-1 animate-ping" />
          </div>
          <p className="text-sm font-bold text-emerald-300 uppercase tracking-wider">Mission Complete</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white text-center">{config.completionTitle}</h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{config.completionMessage}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
            {[
              { label: 'Start State', value: config.locations.find(l => l.id === config.startState.correctId)?.label, color: 'emerald' },
              { label: 'Goal State', value: config.locations.find(l => l.id === config.goalState.correctId)?.label, color: 'emerald' },
              { label: 'Actions', value: config.actions.options.filter(o => o.correct).map(o => o.label).join(', '), color: 'emerald' },
              { label: 'Path Cost', value: config.pathCost.options.find(o => o.correct)?.label, color: 'emerald' },
            ].map((item, i) => (
              <div key={i} className={`p-3 rounded-xl bg-${item.color}-900/10 border border-${item.color}-500/20`}>
                <p className={`text-[10px] font-semibold text-${item.color}-400 uppercase tracking-wider mb-1`}>{item.label}</p>
                <p className="text-xs text-slate-300 font-medium">{item.value}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-300 text-center">{config.closingMessage}</p>
          <div className="flex justify-center gap-3">
            <button onClick={handleTryAgain} className="px-4 py-2 text-xs font-semibold text-slate-300 rounded-lg border border-slate-700/50 bg-slate-800/50 hover:bg-slate-700/50 transition-all">
              Try Again
            </button>
            <button onClick={onComplete} className="px-5 py-2 text-xs font-semibold text-white rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 transition-all shadow-lg shadow-emerald-600/20">
              Continue Learning
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'carousel') {
    const slide = config.slides[slideIdx];
    return (
      <div className="rounded-2xl border border-[var(--brand-primary)]/20 bg-gradient-to-br from-[var(--brand-primary)]/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-700/20 flex items-center justify-between">
          <p className="text-xs font-semibold text-[var(--brand-primary)] uppercase tracking-wider">Build the Search Problem</p>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${
                i === slideIdx ? 'bg-[var(--brand-primary)] scale-125 shadow-sm shadow-[var(--brand-primary)]/50' : i < slideIdx ? 'bg-[var(--brand-primary)]/60' : 'bg-slate-600/50'
              }`} />
            ))}
          </div>
        </div>
        <div className="p-8">
          <div className="max-w-lg mx-auto space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--brand-primary)]/20 to-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/30 flex items-center justify-center">
                {slideIdx === 0 && <MapPin className="w-8 h-8 text-[var(--brand-primary)]" />}
                {slideIdx === 1 && <PuzzlePiece className="w-8 h-8 text-[var(--brand-primary)]" />}
                {slideIdx === 2 && <RobotIcon className="w-8 h-8 text-[var(--brand-primary)]" />}
              </div>
            </div>
            <h3 className="text-xl font-bold text-white text-center">{slide.title}</h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line text-left">{slide.body}</p>
            <div className="text-center pt-2">
              <button onClick={handleNextSlide} className="inline-flex items-center gap-2 text-sm font-semibold text-white px-7 py-3 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] transition-all shadow-lg shadow-[var(--brand-primary)]/20 hover:scale-[1.03] hover:-translate-y-0.5 duration-[280ms]">
                {isLastSlide ? 'Start Building' : 'Next'}
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

  if (phase === 'scenario') {
    return (
      <div className="rounded-2xl border border-[var(--brand-primary)]/20 bg-gradient-to-br from-[var(--brand-primary)]/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-700/20">
          <p className="text-xs font-semibold text-[var(--brand-primary)] uppercase tracking-wider">Scenario</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-start gap-4 max-w-lg mx-auto">
            <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)]/20 border border-[var(--brand-primary)]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <RobotIcon className="w-5 h-5 text-[var(--brand-primary)]" />
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">{config.scenarioText}</p>
          </div>
          <HospitalMap
            locations={config.locations}
            edges={config.edges}
            showRobot
            robotLocationId="entrance"
          />
          <div className="text-center">
            <button onClick={handleScenarioStart} className="inline-flex items-center gap-2 text-sm font-semibold text-white px-7 py-3 rounded-xl bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-primary)] hover:from-[var(--brand-primary)] hover:to-[var(--brand-primary)] transition-all shadow-lg shadow-[var(--brand-primary)]/20 hover:scale-[1.03] hover:-translate-y-0.5 duration-[280ms]">
              Start Building
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'validation') {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-3 bg-gradient-to-r from-emerald-900/30 to-slate-800/40 border-b border-emerald-500/20">
          <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">AI Validation</p>
        </div>
        <div className="p-10 text-center space-y-6">
          <div className="relative inline-flex">
            <div className="animate-spin w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full" />
            <Sparkle className="w-4 h-4 text-emerald-300 absolute -top-1 -right-1" />
          </div>
          <p className="text-sm text-slate-300 font-medium">Analysing Search Problem...</p>
          <div className="max-w-sm mx-auto space-y-3">
            {config.validationSteps.map((step, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 text-sm transition-all duration-700 ${
                  i < validIdx ? 'text-emerald-400' : i === validIdx ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                  i < validIdx ? 'border-emerald-500 bg-emerald-500/20 scale-100' : i === validIdx ? 'border-slate-500 bg-slate-800/50 scale-110' : 'border-slate-700 bg-transparent scale-100'
                }`}>
                  {i < validIdx && (
                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 20 20">
                      <path d="M6 10l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {i === validIdx && (
                    <div className="w-2 h-2 rounded-full bg-[var(--brand-primary)] animate-pulse" />
                  )}
                </div>
                <span className={i < validIdx ? 'line-through decoration-emerald-500/40' : ''}>{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stepNames: Record<string, { num: number; label: string }> = {
    start: { num: 1, label: 'Start State' },
    goal: { num: 2, label: 'Goal State' },
    actions: { num: 3, label: 'Allowed Actions' },
    cost: { num: 4, label: 'Path Cost' },
  };

  const step = stepNames[phase];
  const completedSteps = {
    start: selectedStart !== null,
    goal: selectedGoal !== null,
    actions: submittedActions,
    cost: submittedCost,
  };
  const completedCount = [completedSteps.start, completedSteps.goal, completedSteps.actions, completedSteps.cost].filter(Boolean).length;

  return (
      <div className="rounded-2xl border border-[var(--brand-primary)]/20 bg-gradient-to-br from-[var(--brand-primary)]/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-700/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-[var(--brand-primary)] uppercase tracking-wider">
            Step {step.num} of 4 — {step.label}
          </p>
          <MiniProgress current={completedCount} total={4} />
        </div>
        <div className="flex items-center gap-2">
          {([1, 2, 3, 4] as const).map(n => {
            const key = n === 1 ? 'start' : n === 2 ? 'goal' : n === 3 ? 'actions' : 'cost';
            return (
              <div key={n} className="flex-1">
                <div className={`h-1 rounded-full transition-all duration-500 ${
                  completedSteps[key] ? 'bg-emerald-500' : n === step.num ? 'bg-[var(--brand-primary)]' : 'bg-slate-700/50'
                }`} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {(phase === 'start' || phase === 'goal') && (
          <>
            <p className="text-sm font-medium text-white text-center max-w-lg mx-auto">
              {phase === 'start' ? 'Where should the robot begin?' : 'Where should the robot finish?'}
            </p>
            <HospitalMap
              locations={config.locations}
              edges={config.edges}
              selectedId={phase === 'start' ? selectedStart ?? undefined : selectedGoal ?? undefined}
              onLocationClick={handleLocationClick}
              disabled={showStartConfirm || showGoalConfirm}
            />
            {phase === 'start' && confirmStartAfter()}
            {phase === 'goal' && confirmGoalAfter()}
          </>
        )}

        {phase === 'actions' && (
          <>
            <p className="text-sm font-medium text-white text-center max-w-lg mx-auto">What actions should the robot be allowed to perform?</p>
            <div className="max-w-lg mx-auto space-y-2">
              {config.actions.options.map(opt => {
                const isSelected = selectedActions.has(opt.id);
                const isCorrectAction = opt.correct;
                let border = 'border-slate-700/50 hover:border-slate-500/50';
                let bg = 'bg-slate-800/40 hover:bg-slate-700/40';
                let textColor = 'text-slate-200';
                if (submittedActions) {
                  if (isCorrectAction) {
                    border = 'border-emerald-500/50';
                    bg = 'bg-emerald-900/20';
                    textColor = 'text-emerald-300';
                  } else if (isSelected) {
                    border = 'border-red-500/50';
                    bg = 'bg-red-900/20';
                    textColor = 'text-red-300';
                  } else {
                    border = 'border-slate-700/30';
                    bg = 'bg-slate-800/30';
                    textColor = 'text-slate-300';
                  }
                } else if (isSelected) {
                  border = 'border-[var(--brand-primary)]/50';
                  bg = 'bg-[var(--brand-primary)]/20';
                }
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleAction(opt.id)}
                    disabled={submittedActions}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border ${border} ${bg} text-left transition-all disabled:cursor-default group`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      isSelected
                        ? 'bg-[var(--brand-primary)]/20 border-[var(--brand-primary)] text-[var(--brand-primary)]'
                        : 'border-slate-600 group-hover:border-slate-500'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm ${textColor}`}>{opt.label}</span>
                  </button>
                );
              })}
            </div>
            {!submittedActions && (
              <div className="text-center">
                <button
                  onClick={handleSubmitActions}
                  disabled={selectedActions.size === 0}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-2.5 rounded-xl bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-primary)] hover:from-[var(--brand-primary)] hover:to-[var(--brand-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-[var(--brand-primary)]/20 hover:scale-[1.03] hover:-translate-y-0.5 duration-[280ms]"
                >
                  Confirm Actions
                </button>
              </div>
            )}
          </>
        )}

        {phase === 'cost' && (
          <>
            <p className="text-sm font-medium text-white text-center max-w-lg mx-auto">How should the robot compare two possible paths?</p>
            <div className="max-w-lg mx-auto space-y-2">
              {config.pathCost.options.map(opt => {
                const isSelected = selectedCost === opt.id;
                let border = 'border-slate-700/50 hover:border-slate-500/50';
                let bg = 'bg-slate-800/40 hover:bg-slate-700/40';
                let textColor = 'text-slate-200';
                if (submittedCost) {
                  if (opt.correct) {
                    border = 'border-emerald-500/50';
                    bg = 'bg-emerald-900/20';
                    textColor = 'text-emerald-300';
                  } else if (isSelected) {
                    border = 'border-red-500/50';
                    bg = 'bg-red-900/20';
                    textColor = 'text-red-300';
                  } else {
                    border = 'border-slate-700/30';
                    bg = 'bg-slate-800/30';
                    textColor = 'text-slate-300';
                  }
                } else if (isSelected) {
                  border = 'border-[var(--brand-primary)]/50';
                  bg = 'bg-[var(--brand-primary)]/20';
                }
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectCost(opt.id)}
                    disabled={submittedCost}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border ${border} ${bg} text-left transition-all disabled:cursor-default group`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      isSelected ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/20' : 'border-slate-600 group-hover:border-slate-500'
                    }`}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[var(--brand-primary)]" />}
                    </div>
                    <span className={`text-sm ${textColor}`}>{opt.label}</span>
                  </button>
                );
              })}
            </div>
            {!submittedCost && selectedCost && (
              <div className="text-center">
                <button
                  onClick={handleSubmitCost}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-2.5 rounded-xl bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-primary)] hover:from-[var(--brand-primary)] hover:to-[var(--brand-primary)] transition-all shadow-lg shadow-[var(--brand-primary)]/20 hover:scale-[1.03] hover:-translate-y-0.5 duration-[280ms]"
                >
                  Confirm Path Cost
                </button>
              </div>
            )}
          </>
        )}

        {error && (
          <div className="max-w-lg mx-auto p-3 rounded-xl bg-red-900/15 border border-red-500/30 text-sm text-red-300 animate-in fade-in slide-in-from-top-2 duration-200">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
