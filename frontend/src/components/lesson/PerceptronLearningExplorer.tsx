import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

const W = 480, H = 320;
const RANGE = 6; // normalized coordinate range [-RANGE, RANGE]
const LR = 0.15;

function toSvg(x: number, y: number) {
  return { sx: (x + RANGE) / (2 * RANGE) * W, sy: H - (y + RANGE) / (2 * RANGE) * H };
}

type Point = { x: number; y: number; label: 1 | -1 };

function makePoints(): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < 12; i++) {
    pts.push({ x: 1.5 + Math.random() * 3.5, y: 1.5 + Math.random() * 3.5, label: 1 });
    pts.push({ x: -1.5 - Math.random() * 3.5, y: -1.5 - Math.random() * 3.5, label: -1 });
  }
  return pts;
}

export default function PerceptronLearningExplorer() {
  const [points] = useState<Point[]>(makePoints);
  const [w, setW] = useState({ w1: 0, w2: 0, b: 0 });
  const [phase, setPhase] = useState<'ready' | 'running' | 'done'>('ready');
  const [updates, setUpdates] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => () => cancelAnimationFrame(animRef.current), []);

  const predict = useCallback((p: { x: number; y: number }, weights: typeof w) =>
    (weights.w1 * p.x + weights.w2 * p.y + weights.b >= 0 ? 1 : -1), []);

  const misclassified = useMemo(() => points.filter(p => predict(p, w) !== p.label), [points, w, predict]);

  const step = useCallback(() => {
    setW(cur => {
      const bad = points.find(p => predict(p, cur) !== p.label);
      if (!bad) {
        setPhase('done');
        setLog(l => [...l, '✓ All points correctly classified — perceptron converged!']);
        return cur;
      }
      const next = {
        w1: cur.w1 + LR * bad.label * bad.x,
        w2: cur.w2 + LR * bad.label * bad.y,
        b: cur.b + LR * bad.label,
      };
      setUpdates(u => u + 1);
      setLog(l => [...l.slice(-4), `Misclassified point (label ${bad.label > 0 ? '+1' : '-1'}) → nudged weights toward it`]);
      return next;
    });
  }, [points, predict]);

  const runToEnd = useCallback(() => {
    setPhase('running');
    let iterations = 0;
    const tick = () => {
      iterations++;
      step();
      if (iterations < 60) {
        animRef.current = requestAnimationFrame(tick);
      }
    };
    animRef.current = requestAnimationFrame(tick);
  }, [step]);

  const reset = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    setW({ w1: 0, w2: 0, b: 0 });
    setPhase('ready');
    setUpdates(0);
    setLog([]);
  }, []);

  // Stop the animation loop once converged
  useEffect(() => {
    if (phase === 'done') cancelAnimationFrame(animRef.current);
  }, [phase]);

  // Decision boundary line: w1*x + w2*y + b = 0  =>  y = -(w1*x + b) / w2
  const boundaryLine = useMemo(() => {
    if (Math.abs(w.w2) < 1e-6) return null;
    const y1 = -(w.w1 * -RANGE + w.b) / w.w2;
    const y2 = -(w.w1 * RANGE + w.b) / w.w2;
    const p1 = toSvg(-RANGE, Math.max(-RANGE, Math.min(RANGE, y1)));
    const p2 = toSvg(RANGE, Math.max(-RANGE, Math.min(RANGE, y2)));
    return { x1: p1.sx, y1: p1.sy, x2: p2.sx, y2: p2.sy };
  }, [w]);

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-white">Perceptron Learning — Try It Yourself</h4>
        <span className="text-xs text-slate-300">{misclassified.length} misclassified</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950/80 border border-slate-700/30">
        {Array.from({ length: 8 }, (_, i) => (
          <line key={`gx${i}`} x1={i * (W / 8)} y1={0} x2={i * (W / 8)} y2={H} stroke="#1e293b" strokeWidth="0.5" />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <line key={`gy${i}`} x1={0} y1={i * (H / 6)} x2={W} y2={i * (H / 6)} stroke="#1e293b" strokeWidth="0.5" />
        ))}

        {boundaryLine && (
          <line x1={boundaryLine.x1} y1={boundaryLine.y1} x2={boundaryLine.x2} y2={boundaryLine.y2}
            stroke="var(--brand-primary)" strokeWidth="2" strokeDasharray="6,3" opacity="0.9" />
        )}

        {points.map((p, i) => {
          const { sx, sy } = toSvg(p.x, p.y);
          const correct = predict(p, w) === p.label;
          const color = p.label === 1 ? '#6366f1' : '#f43f5e';
          return (
            <circle key={i} cx={sx} cy={sy} r={correct ? 5 : 6.5}
              fill={color} fillOpacity={correct ? 0.75 : 0.3}
              stroke={correct ? color : '#f59e0b'} strokeWidth={correct ? 0.5 : 2} />
          );
        })}
      </svg>

      <div className="flex items-center gap-2 flex-wrap">
        {phase !== 'done' && (
          <>
            <button onClick={step} disabled={phase === 'running'}
              className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-30 text-white text-xs font-bold transition-colors">
              Update Weights
            </button>
            <button onClick={runToEnd} disabled={phase === 'running'}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-30 text-white text-xs font-bold transition-colors">
              Run to End
            </button>
          </>
        )}
        <button onClick={reset}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset
        </button>
        {phase === 'done' && (
          <span className="text-xs font-bold text-emerald-400">✓ Converged after {updates} updates</span>
        )}
        {updates > 0 && phase !== 'done' && (
          <span className="text-xs text-slate-300 ml-auto">{updates} update{updates !== 1 ? 's' : ''}</span>
        )}
      </div>

      {log.length > 0 && (
        <div className="bg-slate-950/60 rounded-lg p-2 max-h-20 overflow-y-auto space-y-0.5">
          {log.map((l, i) => (
            <p key={i} className="text-xs font-mono text-slate-300">{l}</p>
          ))}
        </div>
      )}
    </div>
  );
}
