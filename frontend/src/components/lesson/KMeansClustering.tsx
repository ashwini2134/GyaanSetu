import { useState, useCallback, useRef, useEffect } from 'react';

const W = 480, H = 320;
const COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6'];
const PTS = 60;

function randPt() {
  return { x: 30 + Math.random() * (W - 60), y: 30 + Math.random() * (H - 60) };
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

type Point = { x: number; y: number };

export default function KMeansClustering() {
  const [k, setK] = useState(3);
  const [points] = useState<Point[]>(() => Array.from({ length: PTS }, randPt));
  const [centroids, setCentroids] = useState<Point[]>([]);
  const [assignments, setAssignments] = useState<number[]>([]);
  const [phase, setPhase] = useState<'init' | 'assign' | 'update' | 'done'>('init');
  const [iteration, setIteration] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => () => cancelAnimationFrame(animRef.current), []);

  const initialize = useCallback(() => {
    const shuffled = [...points].sort(() => Math.random() - 0.5);
    const initCents = shuffled.slice(0, k);
    setCentroids(initCents);
    setAssignments([]);
    setPhase('assign');
    setIteration(0);
    setLog(['Initialized ' + k + ' cluster centers randomly']);
  }, [k, points]);

  const runStep = useCallback(() => {
    if (phase === 'done' || centroids.length === 0) return;

    if (phase === 'assign') {
      const newAssign = points.map(p => {
        let best = 0, bestD = dist(p, centroids[0]);
        for (let i = 1; i < centroids.length; i++) {
          const d = dist(p, centroids[i]);
          if (d < bestD) { bestD = d; best = i; }
        }
        return best;
      });
      setAssignments(newAssign);
      setPhase('update');
      setLog(l => [...l, `Iteration ${iteration + 1}: assigned each point to nearest centroid`]);
    } else {
      const sums = centroids.map(() => ({ x: 0, y: 0, count: 0 }));
      points.forEach((p, i) => {
        sums[assignments[i]].x += p.x;
        sums[assignments[i]].y += p.y;
        sums[assignments[i]].count++;
      });
      const newCents = sums.map(s => s.count > 0 ? { x: s.x / s.count, y: s.y / s.count } : randPt());

      const moved = newCents.some((c, i) => dist(c, centroids[i]) > 0.5);
      setCentroids(newCents);
      setIteration(i => i + 1);
      setLog(l => [...l, `Moved centroids to cluster centers` + (moved ? '' : ' — no change, converged!')]);

      if (!moved) {
        setPhase('done');
        setLog(l => [...l, '✓ K-means converged!']);
      } else {
        setPhase('assign');
      }
    }
  }, [phase, centroids, points, assignments, iteration]);

  const runToEnd = useCallback(() => {
    const step = () => {
      runStep();
      if (phase !== 'done') animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
  }, [runStep, phase]);

  const reset = useCallback(() => {
    setCentroids([]);
    setAssignments([]);
    setPhase('init');
    setIteration(0);
    setLog([]);
  }, []);

  const canStep = phase === 'assign' || phase === 'update';

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-white">K-Means Clustering</h4>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-300">k =</label>
          <select
            value={k}
            onChange={e => { setK(Number(e.target.value)); reset(); }}
            disabled={phase !== 'init'}
            className="px-2 py-1 rounded bg-slate-800 text-white text-xs border border-slate-600"
          >
            {[2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* Canvas */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto rounded-lg bg-slate-950/80 border border-slate-700/30">
        {/* Grid lines */}
        {Array.from({ length: 8 }, (_, i) => (
          <line key={`gx${i}`} x1={i * (W / 8)} y1={0} x2={i * (W / 8)} y2={H}
            stroke="#1e293b" strokeWidth="0.5" />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <line key={`gy${i}`} x1={0} y1={i * (H / 6)} x2={W} y2={i * (H / 6)}
            stroke="#1e293b" strokeWidth="0.5" />
        ))}

        {/* Assignment lines */}
        {assignments.length > 0 && centroids.length > 0 && points.map((p, i) => (
          <line key={`al${i}`} x1={p.x} y1={p.y}
            x2={centroids[assignments[i]].x} y2={centroids[assignments[i]].y}
            stroke={COLORS[assignments[i] % COLORS.length]}
            strokeWidth="0.5" strokeOpacity="0.25" />
        ))}

        {/* Data points */}
        {points.map((p, i) => {
          const cIdx = assignments.length > 0 ? assignments[i] : -1;
          const fill = cIdx >= 0 ? COLORS[cIdx % COLORS.length] : '#475569';
          return (
            <circle key={i} cx={p.x} cy={p.y} r="4"
              fill={fill} fillOpacity={cIdx >= 0 ? '0.7' : '0.35'}
              stroke={cIdx >= 0 ? fill : '#64748b'}
              strokeWidth="0.5"
            />
          );
        })}

        {/* Centroids */}
        {centroids.map((c, i) => (
          <g key={`c${i}`}>
            <circle cx={c.x} cy={c.y} r="8" fill={COLORS[i % COLORS.length]} fillOpacity="0.2"
              stroke={COLORS[i % COLORS.length]} strokeWidth="2" />
            <circle cx={c.x} cy={c.y} r="4" fill={COLORS[i % COLORS.length]} />
          </g>
        ))}
      </svg>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {phase === 'init' ? (
          <button onClick={initialize}
            className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-colors">
            Initialize Centers
          </button>
        ) : (
          <>
            <button onClick={runStep} disabled={!canStep}
              className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-30 text-white text-xs font-bold transition-colors">
              {phase === 'assign' ? 'Assign Points' : 'Update Centers'}
            </button>
            <button onClick={runToEnd}
              className="px-4 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-colors">
              Run to End
            </button>
            <button onClick={reset}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </button>
          </>
        )}
        {phase === 'done' && (
          <span className="text-xs font-bold text-emerald-400">✓ Converged</span>
        )}
        {iteration > 0 && (
          <span className="text-xs text-slate-300 ml-auto">Iteration {iteration}</span>
        )}
      </div>

      {/* Log */}
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
