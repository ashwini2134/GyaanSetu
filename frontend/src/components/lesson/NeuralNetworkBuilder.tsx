import { useState, useRef, useEffect } from 'react';
import type { NeuralNetworkConfig } from '../../types/lesson';

if (typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.textContent = `
@keyframes nn-fade { 0% { opacity: 0; } 100% { opacity: 1; } }
@keyframes nn-slide { 0% { opacity: 0; transform: translateY(14px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes nn-pop { 0% { opacity: 0; transform: scale(0.6); } 100% { opacity: 1; transform: scale(1); } }
@keyframes nn-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
@keyframes nn-bar { 0% { width: 0%; } }
@keyframes nn-particle { 0% { opacity: 1; } 100% { opacity: 0; } }
@keyframes nn-neuron-pulse { 0%,100% { r: 14; opacity: 0.4; } 50% { r: 17; opacity: 0.8; } }
@keyframes nn-glow-line { 0%,100% { stroke-opacity: 0.2; } 50% { stroke-opacity: 0.8; } }
@keyframes nn-count-up { 0% { opacity: 0; transform: translateY(6px); } 100% { opacity: 1; transform: translateY(0); } }
.nn-fade { animation: nn-fade 0.4s ease-out forwards; }
.nn-slide { animation: nn-slide 0.5s ease-out forwards; }
.nn-pop { animation: nn-pop 0.4s ease-out forwards; }
.nn-float { animation: nn-float 3s ease-in-out infinite; }
.nn-bar { animation: nn-bar 0.8s ease-out forwards; }
.nn-particle { animation: nn-particle 0.6s ease-out forwards; }
.nn-count-up { animation: nn-count-up 0.3s ease-out forwards; }
`;
  document.head.appendChild(s);
}

interface Props {
  config: NeuralNetworkConfig;
  onComplete: () => void;
  onAttempt?: () => void;
}

const ALL_CLASSES = ['Cat', 'Dog', 'Bird', 'Horse', 'Elephant', 'Fish', 'Car', 'Airplane'];
const OUTPUT_CLASSES = ['Cat', 'Dog', 'Bird', 'Fish', 'Horse', 'Elephant'];
const CLASS_COLORS: Record<string, string> = {
  Cat: '#f59e0b', Dog: '#3b82f6', Bird: '#22c55e',
  Fish: '#06b6d4', Horse: '#a855f7', Elephant: '#ef4444',
};

const CLASS_EMOJI: Record<string, string> = {
  Cat: '\ud83d\udc31', Dog: '\ud83d\udc36', Bird: '\ud83d\udc26',
  Fish: '\ud83d\udc1f', Horse: '\ud83d\udc34', Elephant: '\ud83d\udc18',
  Car: '\ud83d\ude97', Airplane: '\u2708\ufe0f',
};

const STAGE_LABELS = ['Load Data', 'Network Ready', 'Training', 'Test Model'];

const SVG_W = 960, SVG_H = 400;

const INPUT_R = { x: 30, y: 55, w: 200, h: 300 };
const HIDDEN_R = { x: 365, y: 55, w: 230, h: 300 };
const OUTPUT_R = { x: 720, y: 55, w: 210, h: 300 };

const HIDDEN_ROWS = 3, HIDDEN_COLS = 4;
const hiddenNeurons = Array.from({ length: HIDDEN_ROWS * HIDDEN_COLS }).map((_, i) => {
  const row = Math.floor(i / HIDDEN_COLS);
  const col = i % HIDDEN_COLS;
  return {
    x: HIDDEN_R.x + 30 + col * 50,
    y: HIDDEN_R.y + 40 + row * 70,
    idx: i,
  };
});

const OUTPUT_YS = OUTPUT_CLASSES.map((_, i) => OUTPUT_R.y + 30 + i * 43);

const INPUT_IMAGE_POSITIONS = ALL_CLASSES.map((_, i) => ({
  x: INPUT_R.x + 15 + (i % 2) * 90,
  y: INPUT_R.y + 35 + Math.floor(i / 2) * 65,
}));

const CONN_INPUT_HIDDEN = INPUT_IMAGE_POSITIONS.flatMap(inp =>
  hiddenNeurons.map(h => ({ fromX: inp.x + 85, fromY: inp.y + 28, toX: h.x, toY: h.y }))
);

const CONN_HIDDEN_OUTPUT = hiddenNeurons.flatMap(h =>
  OUTPUT_CLASSES.map((_, oi) => ({ fromX: h.x, fromY: h.y, toX: OUTPUT_R.x + 18, toY: OUTPUT_YS[oi] + 10 }))
);

function AnimalSvg({ cls, size }: { cls: string; size?: number }) {
  const s = size || 40;
  const color = CLASS_COLORS[cls] || '#64748b';
  return (
    <div className="inline-flex items-center justify-center" style={{ width: s, height: s }}>
      <div className="w-full h-full rounded-xl flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${color}20, ${color}08)`, border: `1.5px solid ${color}40` }}>
        <span style={{ fontSize: Math.max(s * 0.55, 14), lineHeight: 1 }}>{CLASS_EMOJI[cls] || '?'}</span>
      </div>
    </div>
  );
}

interface Particle {
  id: number;
  fromX: number; fromY: number;
  toX: number; toY: number;
  progress: number;
}

export default function NeuralNetworkBuilder({ config, onComplete, onAttempt }: Props) {
  const [phase, setPhase] = useState<'carousel' | 'build' | 'complete'>('carousel');
  const [slideIdx, setSlideIdx] = useState(0);
  const [stage, setStage] = useState(0);
  const [placedImages, setPlacedImages] = useState<string[]>([]);
  const [shownWeights, setShownWeights] = useState(false);
  const [training, setTraining] = useState(false);
  const [trained, setTrained] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [loss, setLoss] = useState(2.1);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [activeNeurons, setActiveNeurons] = useState<Set<number>>(new Set());
  const [testImage, setTestImage] = useState('');
  const [tested, setTested] = useState(false);
  const [prediction, setPrediction] = useState('');
  const [predConfidence, setPredConfidence] = useState(0);
  const [classProbs, setClassProbs] = useState<Record<string, number>>({});
  const [testResults, setTestResults] = useState<Array<{ image: string; prediction: string; confidence: number }>>([]);
  const [testRound, setTestRound] = useState(0);
  const dragClass = useRef<string | null>(null);
  const pid = useRef(0);
  const trainInterval = useRef<number | null>(null);
  const particleInterval = useRef<number | null>(null);

  const unplaced = ALL_CLASSES.filter(c => !placedImages.includes(c));

  const totalSlides = config.slides.length;
  const isLastSlide = slideIdx === totalSlides - 1;

  useEffect(() => {
    return () => {
      if (trainInterval.current) clearInterval(trainInterval.current);
      if (particleInterval.current) clearInterval(particleInterval.current);
    };
  }, []);

  const handleSlideNext = () => {
    if (isLastSlide) setPhase('build');
    else setSlideIdx(i => i + 1);
  };

  const handleDragStart = (cls: string) => { dragClass.current = cls; };
  const handleDropOnInput = () => {
    if (!dragClass.current) return;
    const cls = dragClass.current;
    dragClass.current = null;
    if (placedImages.includes(cls)) return;
    setPlacedImages(p => [...p, cls]);
    onAttempt?.();
  };

  const startTraining = () => {
    setTraining(true);
    setEpoch(0);
    setAccuracy(0);
    setLoss(2.1);
    const duration = 4200;
    const startTime = Date.now();
    const maxEpoch = 20;

    let ep = 0;
    let acc = 0;
    let ls = 2.1;

    trainInterval.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(elapsed / duration, 1);
      const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;

      const newEpoch = Math.floor(eased * maxEpoch);
      if (newEpoch !== ep) {
        ep = newEpoch;
        setEpoch(ep);
        setActiveNeurons(new Set(hiddenNeurons.map(n => n.idx).filter(() => Math.random() > 0.3)));
      }

      acc = Math.round(eased * 96);
      ls = +(2.1 - eased * 2.02).toFixed(2);
      setAccuracy(acc);
      setLoss(ls);

      if (p >= 1) {
        if (trainInterval.current) clearInterval(trainInterval.current);
        trainInterval.current = null;
        if (particleInterval.current) clearInterval(particleInterval.current);
        particleInterval.current = null;
        setTrained(true);
        setTraining(false);
        setParticles([]);
        setActiveNeurons(new Set());
      }
    }, 80);

    particleInterval.current = window.setInterval(() => {
      const numP = 5 + Math.floor(Math.random() * 6);
      setParticles(prev => {
        const next = prev.filter(pt => pt.progress < 1).slice(-30);
        for (let i = 0; i < numP; i++) {
          const fromIh = CONN_INPUT_HIDDEN[Math.floor(Math.random() * CONN_INPUT_HIDDEN.length)];
          const fromHo = CONN_HIDDEN_OUTPUT[Math.floor(Math.random() * CONN_HIDDEN_OUTPUT.length)];
          const conn = Math.random() < 0.6 ? fromIh : fromHo;
          next.push({ id: pid.current++, fromX: conn.fromX, fromY: conn.fromY, toX: conn.toX, toY: conn.toY, progress: 0 });
        }
        return next;
      });
      setParticles(prev => prev.map(pt => ({ ...pt, progress: pt.progress + 0.04 })));
    }, 60);
  };

  const handleRevealImage = () => {
    const unseen = OUTPUT_CLASSES[Math.floor(Math.random() * OUTPUT_CLASSES.length)];
    setTestImage(unseen);
  };

  const handleTest = () => {
    const unseen = testImage || OUTPUT_CLASSES[Math.floor(Math.random() * OUTPUT_CLASSES.length)];

    const trueConf = 89 + Math.floor(Math.random() * 10);
    const probs: Record<string, number> = {};
    let remaining = 100 - trueConf;
    const others = OUTPUT_CLASSES.filter(c => c !== unseen);
    for (let i = 0; i < others.length; i++) {
      if (i === others.length - 1) probs[others[i]] = remaining;
      else {
        const v = Math.floor(Math.random() * remaining * 0.6);
        probs[others[i]] = v;
        remaining -= v;
      }
    }
    probs[unseen] = trueConf;

    setClassProbs(probs);
    setTested(true);
    setPrediction(unseen);
    setPredConfidence(trueConf);
    setTestResults(prev => [...prev, { image: unseen, prediction: unseen, confidence: trueConf }]);
    onAttempt?.();
  };

  const handleNextTest = () => {
    setTestImage('');
    setTested(false);
    setPrediction('');
    setPredConfidence(0);
    setClassProbs({});
    setTestRound(r => r + 1);
  };

  const handleTryAgain = () => {
    if (trainInterval.current) clearInterval(trainInterval.current);
    if (particleInterval.current) clearInterval(particleInterval.current);
    setStage(0);
    setPlacedImages([]);
    setShownWeights(false);
    setTraining(false);
    setTrained(false);
    setEpoch(0);
    setAccuracy(0);
    setLoss(2.1);
    setParticles([]);
    setActiveNeurons(new Set());
    setTestImage('');
    setTested(false);
    setPrediction('');
    setPredConfidence(0);
    setClassProbs({});
    setTestResults([]);
    setTestRound(0);
    setPhase('carousel');
    setSlideIdx(0);
  };

  // ── Carousel ──
  if (phase === 'carousel') {
    const slide = config.slides[slideIdx];
    return (
      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-800/40 border-b border-slate-700/20 flex items-center justify-between">
          <p className="text-sm font-semibold text-blue-300 uppercase tracking-wider">Neural Network Builder</p>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                i === slideIdx ? 'bg-blue-400 scale-125 shadow-sm shadow-blue-400/50' : i < slideIdx ? 'bg-blue-600/60' : 'bg-slate-600/50'
              }`} />
            ))}
          </div>
        </div>
        <div className="px-8 pt-4 pb-8">
          <div className="mx-auto text-center max-w-lg">
            <div className="flex justify-center mb-5 nn-float text-4xl">
              {slideIdx === 0 && <span>🧠</span>}
              {slideIdx === 1 && <span>🔗</span>}
              {slideIdx === 2 && <span>🎯</span>}
            </div>
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
    const stats = [
      { label: 'Layers', value: '3' },
      { label: 'Neurons', value: `${hiddenNeurons.length + 2}` },
      { label: 'Connections', value: `${CONN_INPUT_HIDDEN.length + CONN_HIDDEN_OUTPUT.length}` },
      { label: 'Images', value: `${placedImages.length}` },
    ];

    const displayEpoch = training || trained ? epoch : '-';
    const displayAcc = training || trained ? `${accuracy}%` : '-';
    const displayLoss = training || trained ? loss.toFixed(2) : '-';

    return (
      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-slate-800/40 backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/40 border-b border-slate-700/20">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <p className="text-sm font-semibold text-blue-300 uppercase tracking-wider">Neural Network Builder</p>
            <p className="text-xs text-slate-300">Step {stage + 1} of {STAGE_LABELS.length}</p>
          </div>
          <div className="flex items-center gap-2">
            {STAGE_LABELS.map((label, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 flex-shrink-0 ${
                  i < stage ? 'bg-emerald-400' : i === stage ? 'bg-blue-400 scale-125 shadow-sm shadow-blue-400/50' : 'bg-slate-600/50'
                }`} />
                <span className={`text-xs transition-colors whitespace-nowrap ${
                  i <= stage ? 'text-slate-300' : 'text-slate-300'
                }`}>{label}</span>
                {i < STAGE_LABELS.length - 1 && <div className="flex-1 h-px bg-slate-700/50" />}
              </div>
            ))}
          </div>
          {/* Stats Bar */}
          {(stage >= 1 || placedImages.length > 0) && (
            <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-slate-700/30">
              {stats.map(s => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-300">{s.label}:</span>
                  <span className="text-sm font-semibold text-slate-200">{s.value}</span>
                </div>
              ))}
              {stage >= 1 && (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-300">Epoch:</span>
                    <span className="text-sm font-semibold text-slate-200">{displayEpoch}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-300">Accuracy:</span>
                    <span className="text-sm font-semibold text-emerald-400">{displayAcc}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-300">Loss:</span>
                    <span className="text-sm font-semibold text-amber-400">{displayLoss}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="p-4 lg:p-6 flex flex-col lg:flex-row gap-5">
          {/* Network SVG */}
          <div className="flex-1 min-w-0 flex justify-center">
            <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full max-w-[800px] h-auto"
              onDragOver={(e) => { if (stage === 0) e.preventDefault(); }}
              onDrop={(e) => { e.preventDefault(); handleDropOnInput(); }}
            >
              <defs>
                <filter id="nb-glow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                <filter id="nb-glow-soft"><feGaussianBlur stdDeviation="2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0 0 L8 3 L0 6 Z" fill="#3b82f6" /></marker>
              </defs>

              {/* Background grid (subtle) */}
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
              <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="url(#grid)" opacity="0.3" />

              {/* Connection arrows between layers */}
              {placedImages.length > 0 && (
                <g>
                  {/* Input → Hidden */}
                  <path d={`M ${INPUT_R.x + INPUT_R.w} ${INPUT_R.y + INPUT_R.h / 2} Q ${(INPUT_R.x + INPUT_R.w + HIDDEN_R.x) / 2} ${INPUT_R.y + INPUT_R.h / 2 - 30} ${HIDDEN_R.x} ${HIDDEN_R.y + HIDDEN_R.h / 2}`}
                    fill="none" stroke="#3b82f6" strokeWidth={training ? 3 : 2} strokeOpacity={training ? 0.6 : 0.25} markerEnd="url(#arrow)"
                    className={training ? 'nn-glow-line' : ''} style={training ? { animationDuration: '1.2s' } : undefined} />
                  {/* Hidden → Output */}
                  <path d={`M ${HIDDEN_R.x + HIDDEN_R.w} ${HIDDEN_R.y + HIDDEN_R.h / 2} Q ${(HIDDEN_R.x + HIDDEN_R.w + OUTPUT_R.x) / 2} ${HIDDEN_R.y + HIDDEN_R.h / 2 + 30} ${OUTPUT_R.x} ${OUTPUT_R.y + OUTPUT_R.h / 2}`}
                    fill="none" stroke="#a855f7" strokeWidth={training ? 3 : 2} strokeOpacity={training ? 0.6 : 0.25} markerEnd="url(#arrow)"
                    className={training ? 'nn-glow-line' : ''} style={training ? { animationDuration: '1.2s' } : undefined} />

                  {/* Individual weight lines between neurons (shown during training) */}
                  {(training || (stage >= 1 && shownWeights)) && hiddenNeurons.map((hn, hi) =>
                    placedImages.slice(0, Math.min(placedImages.length, 8)).map((_, ii) => {
                      const ip = INPUT_IMAGE_POSITIONS[ii];
                      return (
                        <line key={`ih-${hi}-${ii}`} x1={ip.x + 85} y1={ip.y + 28} x2={hn.x} y2={hn.y}
                          stroke={training ? '#3b82f6' : '#334155'} strokeWidth={training ? 1 : 0.5}
                          strokeOpacity={training ? (Math.random() > 0.7 ? 0.6 : 0.15) : 0.3} />
                      );
                    })
                  )}
                  {(training || (stage >= 1 && shownWeights)) && hiddenNeurons.map((hn, hi) =>
                    OUTPUT_CLASSES.map((_, oi) => (
                      <line key={`ho-${hi}-${oi}`} x1={hn.x} y1={hn.y} x2={OUTPUT_R.x + 18} y2={OUTPUT_YS[oi] + 10}
                        stroke={training ? '#a855f7' : '#334155'} strokeWidth={training ? 1 : 0.5}
                        strokeOpacity={training ? (Math.random() > 0.7 ? 0.6 : 0.15) : 0.3} />
                    ))
                  )}
                </g>
              )}

              {/* Particles */}
              {particles.map(pt => (
                <circle key={pt.id}
                  cx={pt.fromX + (pt.toX - pt.fromX) * pt.progress}
                  cy={pt.fromY + (pt.toY - pt.fromY) * pt.progress}
                  r={2.5} fill="#60a5fa" opacity={1 - pt.progress * 0.5}
                  filter="url(#nb-glow-soft)"
                />
              ))}

              {/* ── INPUT LAYER ── */}
              <rect x={INPUT_R.x} y={INPUT_R.y} width={INPUT_R.w} height={INPUT_R.h} rx="12"
                fill="#0f172a" stroke="#3b82f6" strokeWidth={1.5} strokeOpacity={0.5} />
              <rect x={INPUT_R.x} y={INPUT_R.y} width={INPUT_R.w} height={32} rx="12" fill="#1e293b" />
              <rect x={INPUT_R.x} y={INPUT_R.y + 20} width={INPUT_R.w} height={12} fill="#1e293b" />
              <text x={INPUT_R.x + INPUT_R.w / 2} y={INPUT_R.y + 21} textAnchor="middle" fill="#3b82f6" fontSize="24" fontWeight="bold">Input Layer</text>

              {placedImages.length === 0 && stage === 0 && (
                <>
                  <rect x={INPUT_R.x + 20} y={INPUT_R.y + 60} width={INPUT_R.w - 40} height={INPUT_R.h - 80} rx="8"
                    fill="none" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="6,4" strokeOpacity={0.5} />
                  <text x={INPUT_R.x + INPUT_R.w / 2} y={INPUT_R.y + INPUT_R.h / 2} textAnchor="middle" fill="#64748b" fontSize="18">
                    Drop images here
                  </text>
                </>
              )}

              {placedImages.map((cls, i) => {
                const pos = INPUT_IMAGE_POSITIONS[i] || { x: INPUT_R.x + 15 + ((i % 2) * 90), y: INPUT_R.y + 35 + Math.floor(i / 2) * 65 };
                return (
                  <g key={cls}>
                    <rect x={pos.x} y={pos.y} width={80} height={65} rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1" className="nn-pop" />
                    <text x={pos.x + 40} y={pos.y + 32} textAnchor="middle" fontSize="26">{CLASS_EMOJI[cls]}</text>
                    <text x={pos.x + 40} y={pos.y + 54} textAnchor="middle" fill="#94a3b8" fontSize="15">{cls}</text>
                    {/* Small incoming particle animation when placed */}
                    {training && (
                      <circle cx={pos.x + 80} cy={pos.y + 10} r="2" fill="#60a5fa" opacity={Math.random() * 0.5 + 0.3}>
                        <animate attributeName="cx" from={pos.x + 80} to={HIDDEN_R.x} dur="0.8s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.8" to="0" dur="0.8s" repeatCount="indefinite" />
                      </circle>
                    )}
                  </g>
                );
              })}

              {/* ── HIDDEN LAYER ── */}
              <rect x={HIDDEN_R.x} y={HIDDEN_R.y} width={HIDDEN_R.w} height={HIDDEN_R.h} rx="12"
                fill="#0f172a" stroke="#22c55e" strokeWidth={1.5} strokeOpacity={placedImages.length > 0 ? 0.7 : 0.3} />
              <rect x={HIDDEN_R.x} y={HIDDEN_R.y} width={HIDDEN_R.w} height={32} rx="12" fill="#1e293b" />
              <rect x={HIDDEN_R.x} y={HIDDEN_R.y + 20} width={HIDDEN_R.w} height={12} fill="#1e293b" />
              <text x={HIDDEN_R.x + HIDDEN_R.w / 2} y={HIDDEN_R.y + 21} textAnchor="middle" fill="#22c55e" fontSize="24" fontWeight="bold">Hidden Layer</text>

              {hiddenNeurons.map(hn => {
                const isActive = training && activeNeurons.has(hn.idx);
                return (
                  <g key={hn.idx}>
                    <circle cx={hn.x} cy={hn.y} r="14" fill={isActive ? '#22c55e' : '#1e293b'}
                      stroke={isActive ? '#22c55e' : '#334155'} strokeWidth={isActive ? 2 : 1}
                      filter={isActive ? 'url(#nb-glow)' : undefined}
                      className={isActive ? '' : ''}
                    >
                      {isActive && <animate attributeName="r" values="14;17;14" dur="0.6s" repeatCount="indefinite" />}
                    </circle>
                    {/* Weight label above neuron */}
                    {(training || shownWeights) && (
                      <text x={hn.x} y={hn.y - 20} textAnchor="middle" fill="#64748b" fontSize="14"
                        className={training ? 'nn-fade' : ''}>
                        w={+(Math.random() * 2 - 0.5).toFixed(2)}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* ── OUTPUT LAYER ── */}
              <rect x={OUTPUT_R.x} y={OUTPUT_R.y} width={OUTPUT_R.w} height={OUTPUT_R.h} rx="12"
                fill="#0f172a" stroke="#a855f7" strokeWidth={1.5} strokeOpacity={placedImages.length > 0 ? 0.7 : 0.3} />
              <rect x={OUTPUT_R.x} y={OUTPUT_R.y} width={OUTPUT_R.w} height={32} rx="12" fill="#1e293b" />
              <rect x={OUTPUT_R.x} y={OUTPUT_R.y + 20} width={OUTPUT_R.w} height={12} fill="#1e293b" />
              <text x={OUTPUT_R.x + OUTPUT_R.w / 2} y={OUTPUT_R.y + 21} textAnchor="middle" fill="#a855f7" fontSize="24" fontWeight="bold">Output Layer</text>

              {OUTPUT_CLASSES.map((cls, i) => {
                const y = OUTPUT_YS[i];
                const isPredicted = tested && prediction === cls;
                const prob = classProbs[cls] ?? 0;
                const color = CLASS_COLORS[cls] || '#64748b';
                return (
                  <g key={cls}>
                    <rect x={OUTPUT_R.x + 15} y={y} width={OUTPUT_R.w - 30} height={34} rx="6"
                      fill={tested && isPredicted ? `${color}20` : 'transparent'}
                      stroke={tested && isPredicted ? color : 'transparent'} strokeWidth={1} />
                    <text x={OUTPUT_R.x + 25} y={y + 22} fill={tested ? '#cbd5e1' : '#64748b'} fontSize="18" fontWeight={isPredicted ? 'bold' : 'normal'}>{cls}</text>
                    {tested && (
                      <>
                        <rect x={OUTPUT_R.x + 75} y={y + 8} width={80} height="14" rx="4" fill="#1e293b" />
                        <rect x={OUTPUT_R.x + 75} y={y + 8} width={Math.min(prob * 0.8, 80)} height="14" rx="4" fill={color} className="nn-bar" />
                        <text x={OUTPUT_R.x + 160} y={y + 24} fill={isPredicted ? color : '#64748b'} fontSize="18" fontWeight={isPredicted ? 'bold' : 'normal'}>{prob}%</text>
                        {isPredicted && <circle cx={OUTPUT_R.x + 12} cy={y + 17} r="4" fill={color} filter="url(#nb-glow)" />}
                      </>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Right: Stage Content */}
          <div className="w-full lg:w-72 xl:w-80 space-y-4">
            <p className="text-sm text-slate-300 uppercase tracking-wider font-semibold">{STAGE_LABELS[stage]}</p>

            {/* Stage 0: Load Data */}
            {stage === 0 && (
              <div className="space-y-4 nn-slide">
                <p className="text-base text-slate-300 leading-relaxed">
                  Drag training images into the <span className="text-blue-400 font-semibold">Input Layer</span>.
                  The network learns by studying many examples.
                </p>
                <div className="rounded-xl bg-slate-900/60 border border-slate-700/40 p-3">
                  <p className="text-xs text-slate-300 mb-2">Available images ({unplaced.length})</p>
                  <div className="grid grid-cols-2 gap-2">
                    {unplaced.map(cls => (
                      <div key={cls} draggable onDragStart={() => handleDragStart(cls)}
                        className="flex items-center gap-2 rounded-lg bg-slate-800/80 border border-slate-700/50 px-3 py-2.5 cursor-grab active:cursor-grabbing hover:border-blue-500/50 hover:bg-slate-800 transition-all select-none"
                      >
                        <AnimalSvg cls={cls} size={24} />
                        <span className="text-sm text-slate-300">{cls}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl bg-blue-900/10 border border-blue-500/20 p-3">
                  <p className="text-xs text-blue-300">💡 Hold and drag images into the Input Layer above</p>
                </div>
                <button onClick={() => setStage(1)} disabled={placedImages.length < 2}
                  className={`w-full inline-flex items-center justify-center gap-2 text-base font-semibold px-5 py-3 rounded-xl transition-all ${
                    placedImages.length >= 2 ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/20' : 'text-slate-300 bg-slate-800/50 cursor-not-allowed'
                  }`}>
                  Continue ({placedImages.length} images loaded)
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {/* Stage 1: Network Ready */}
            {stage === 1 && (
              <div className="space-y-4 nn-slide">
                <p className="text-base text-slate-300 leading-relaxed">
                  Your neural network is assembled. Connection weights are randomly initialised before training.
                </p>
                <div className="rounded-xl bg-slate-900/60 border border-slate-700/40 p-4 space-y-3">
                  <p className="text-sm font-semibold text-slate-200">Network Summary</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-300">Layers</span><span className="text-slate-200 font-medium">3</span></div>
                    <div className="flex justify-between"><span className="text-slate-300">Neurons</span><span className="text-slate-200 font-medium">{hiddenNeurons.length + 2}</span></div>
                    <div className="flex justify-between"><span className="text-slate-300">Connections</span><span className="text-slate-200 font-medium">{CONN_INPUT_HIDDEN.length + CONN_HIDDEN_OUTPUT.length}</span></div>
                    <div className="flex justify-between"><span className="text-slate-300">Training images</span><span className="text-slate-200 font-medium">{placedImages.length}</span></div>
                  </div>
                  <div className="border-t border-slate-700/30 pt-2">
                    <p className="text-xs text-slate-300">Sample weights: <span className="text-blue-300 font-mono text-[13px]">w₁ = 0.42, w₂ = -0.15, w₃ = 0.78</span></p>
                  </div>
                </div>
                {!shownWeights && (
                  <button onClick={() => { setShownWeights(true); onAttempt?.(); }}
                    className="w-full inline-flex items-center justify-center gap-2 text-base font-semibold text-white px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-600/20">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    Show Connection Weights
                  </button>
                )}
                {shownWeights && (
                  <button onClick={() => setStage(2)}
                    className="w-full inline-flex items-center justify-center gap-2 text-base font-semibold text-white px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 transition-all shadow-lg shadow-emerald-600/20">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M6 4l14 8-14 8V4z" />
                    </svg>
                    Train Network
                  </button>
                )}
              </div>
            )}

            {/* Stage 2: Training */}
            {stage === 2 && (
              <div className="space-y-4 nn-slide">
                <p className="text-base text-slate-300 leading-relaxed">
                  Training adjusts connection weights to reduce error. Watch the network learn from thousands of samples.
                </p>

                <div className="rounded-xl bg-slate-900/60 border border-slate-700/40 p-4 space-y-4">
                  <div>
                    <p className="text-xs text-slate-300 mb-1">Epoch</p>
                    <p className="text-lg font-bold text-white">{training || trained ? epoch : '-'} <span className="text-sm text-slate-300">/ 20</span></p>
                    <div className="mt-1.5 h-2 rounded-full bg-slate-700/50 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-300 bg-blue-500" style={{ width: `${training || trained ? (epoch / 20) * 100 : 0}%` }} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-300 mb-1">Accuracy</p>
                    <p className="text-lg font-bold text-emerald-400">{training || trained ? accuracy : 0}<span className="text-sm text-slate-300">%</span></p>
                    <div className="mt-1.5 h-2 rounded-full bg-slate-700/50 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-300 bg-emerald-500" style={{ width: `${training || trained ? accuracy : 0}%` }} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-300 mb-1">Loss</p>
                    <p className="text-lg font-bold text-amber-400">{training || trained ? loss.toFixed(2) : '0.00'}</p>
                    <div className="mt-1.5 h-2 rounded-full bg-slate-700/50 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-300 bg-amber-500" style={{ width: `${training || trained ? Math.max(0, Math.min(100, (2.1 - loss) / 2.1 * 100)) : 0}%` }} />
                    </div>
                  </div>
                </div>

                {!training && !trained && (
                  <button onClick={startTraining}
                    className="w-full inline-flex items-center justify-center gap-2 text-base font-semibold text-white px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 transition-all shadow-lg shadow-emerald-600/20">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M6 4l14 8-14 8V4z" />
                    </svg>
                    Train Network
                  </button>
                )}
                {training && (
                  <div className="rounded-xl bg-blue-900/15 border border-blue-500/30 p-3 flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-400" style={{ animation: 'nn-pulse 0.8s ease-in-out infinite' }} />
                    <p className="text-sm text-blue-300 font-medium">Training in progress...</p>
                  </div>
                )}
                {trained && (
                  <div className="space-y-3">
                    <div className="rounded-xl bg-emerald-900/15 border border-emerald-500/30 p-3 text-center nn-pop">
                      <p className="text-base font-bold text-emerald-400">✓ Training Complete</p>
                      <p className="text-xs text-slate-300 mt-1">Accuracy: {accuracy}% | Loss: {loss.toFixed(2)}</p>
                    </div>
                    <button onClick={() => setStage(3)}
                      className="w-full inline-flex items-center justify-center gap-2 text-base font-semibold text-white px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-600/20">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M9 5l7 7-7 7" />
                      </svg>
                      Test the Network
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Stage 3: Test Model */}
            {stage === 3 && (
              <div className="space-y-4 nn-slide">
                <p className="text-base text-slate-300 leading-relaxed">
                  Test {testRound + 1} of 3 — the network has never seen this image.
                </p>

                <div className="flex items-center justify-center gap-1.5 mb-2">
                  {[0, 1, 2].map(i => (
                    <div key={i} className={`w-2 h-2 rounded-full ${i < testRound ? 'bg-emerald-400' : i === testRound ? 'bg-blue-400 scale-125' : 'bg-slate-600'}`} />
                  ))}
                  <span className="text-[11px] text-slate-300 ml-2">{testResults.length}/3 tested</span>
                </div>

                {testResults.length > 0 && (
                  <div className="flex gap-1.5 justify-center flex-wrap">
                    {testResults.map((r, i) => (
                      <div key={i} className="flex items-center gap-1 rounded-lg bg-slate-800 border border-slate-700/50 px-2 py-1">
                        <AnimalSvg cls={r.prediction} size={18} />
                        <span className="text-[10px] text-emerald-400 font-medium">{r.confidence}%</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="rounded-xl bg-slate-900/60 border border-slate-700/40 p-4 text-center">
                  {!testImage && (
                    <>
                      <div className="w-20 h-20 rounded-xl bg-slate-800 border-2 border-dashed border-slate-600 mx-auto flex items-center justify-center mb-2">
                        <span className="text-3xl text-slate-300 font-bold">?</span>
                      </div>
                      <p className="text-sm text-slate-300">Tap to reveal an unseen test image</p>
                    </>
                  )}
                  {testImage && !tested && (
                    <>
                      <div className="w-20 h-20 rounded-xl bg-slate-800 border border-slate-600 mx-auto flex items-center justify-center mb-2 nn-pop">
                        <AnimalSvg cls={testImage} size={64} />
                      </div>
                      <p className="text-base text-slate-300">What animal is this?</p>
                    </>
                  )}
                  {tested && (
                    <>
                      <div className="w-20 h-20 rounded-xl bg-slate-800 border-2 border-emerald-500/50 mx-auto flex items-center justify-center mb-2 nn-pop">
                        <AnimalSvg cls={prediction} size={64} />
                      </div>
                      <p className="text-xl font-bold text-emerald-400">{prediction}</p>
                      <p className="text-sm text-slate-300">Confidence: <span className="text-emerald-400 font-semibold">{predConfidence}%</span></p>
                      <div className="mt-3 space-y-1.5">
                        {OUTPUT_CLASSES.map(cls => {
                          const prob = classProbs[cls] ?? 0;
                          const isPred = cls === prediction;
                          const color = CLASS_COLORS[cls] || '#64748b';
                          return (
                            <div key={cls} className="flex items-center gap-2">
                              <span className="text-xs text-slate-300 w-14 text-right">{cls}</span>
                              <div className="flex-1 h-4 rounded-full bg-slate-800 overflow-hidden">
                                <div className="h-full rounded-full nn-bar" style={{ width: `${prob}%`, backgroundColor: color }} />
                              </div>
                              <span className={`text-xs w-10 text-right ${isPred ? 'text-white font-semibold' : 'text-slate-300'}`}>{prob}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {!tested && !testImage && (
                  <button onClick={handleRevealImage}
                    className="w-full inline-flex items-center justify-center gap-2 text-base font-semibold text-white px-5 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 transition-all shadow-lg shadow-amber-600/20">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    Reveal Test Image
                  </button>
                )}
                {testImage && !tested && (
                  <button onClick={handleTest}
                    className="w-full inline-flex items-center justify-center gap-2 text-base font-semibold text-white px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 transition-all shadow-lg shadow-emerald-600/20">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                    Test Model
                  </button>
                )}
                {tested && testRound < 2 && (
                  <button onClick={handleNextTest}
                    className="w-full inline-flex items-center justify-center gap-2 text-base font-semibold text-white px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-600/20">
                    Next Image ({3 - testRound - 1} remaining)
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
                {tested && testRound >= 2 && (
                  <button onClick={() => {
                    if (trainInterval.current) clearInterval(trainInterval.current);
                    if (particleInterval.current) clearInterval(particleInterval.current);
                    onComplete();
                  }}
                    className="w-full inline-flex items-center justify-center gap-2 text-base font-semibold text-white px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 transition-all shadow-lg shadow-emerald-600/20">
                    Complete Exercise
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
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
          <button onClick={onComplete} className="px-6 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 transition-all shadow-lg shadow-emerald-600/20">
            Continue Learning
          </button>
        </div>
      </div>
    </div>
  );
}
