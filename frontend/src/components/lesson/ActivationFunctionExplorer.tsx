import { useState } from 'react';

export default function ActivationFunctionExplorer() {
  const [selectedFn, setSelectedFn] = useState<'relu' | 'sigmoid' | 'softmax'>('relu');
  const [xVal, setXVal] = useState(0);

  const relu = (x: number) => Math.max(0, x);
  const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
  const softmax = (vals: number[]) => {
    const max = Math.max(...vals);
    const exps = vals.map(v => Math.exp(v - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(e => e / sum);
  };
  const samplePoints = [-5, -3, -1, 1, 3, 5];
  const sampleScores = samplePoints.map(x => x + 2);

  const fnLabel = selectedFn === 'relu' ? 'ReLU(x) = max(0, x)' : selectedFn === 'sigmoid' ? 'Sigmoid(x) = 1/(1+e-x)' : 'Softmax(xi) = exi/sum(exj)';

  return (
    <div className="mt-6 rounded-3xl border border-sky-500/20 bg-gradient-to-br from-sky-600/10 to-slate-900/40 p-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Try It Yourself</span>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed mb-5">
        Activation functions introduce <span className="text-sky-300 font-medium">non-linearity</span>. Without them, stacked layers collapse to a single linear transformation.
      </p>

      <div className="flex flex-wrap gap-2 mb-5">
        {(['relu', 'sigmoid', 'softmax'] as const).map(fn => (
          <button key={fn} onClick={() => setSelectedFn(fn)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              selectedFn === fn
                ? 'bg-sky-600/30 border border-sky-500/50 text-sky-200'
                : 'bg-slate-700/30 border border-slate-700/50 text-slate-300 hover:bg-slate-700/50'
            }`}>
            {fn.charAt(0).toUpperCase() + fn.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-4">
          <svg viewBox="0 0 260 200" className="w-full">
            {[-4, -2, 0, 2, 4].map(v => (
              <g key={v}>
                <line x1="30" y1={100 - v * 20} x2="250" y2={100 - v * 20} stroke="var(--illustration-surface-alt)" strokeWidth="0.5" opacity="0.3" />
                <text x="28" y={100 - v * 20 + 3} textAnchor="end" fill="var(--illustration-element-dim)" fontSize="6">{v}</text>
              </g>
            ))}
            <line x1="30" y1="100" x2="250" y2="100" stroke="var(--illustration-surface-alt)" strokeWidth="0.8" opacity="0.4" />
            <text x="140" y="195" textAnchor="middle" fill="var(--illustration-element-dim)" fontSize="7">Input (x)</text>
            <text x="12" y="100" textAnchor="middle" fill="var(--illustration-element-dim)" fontSize="7" transform="rotate(-90,12,100)">Output</text>

            {selectedFn === 'relu' && (() => {
              const points: { x: number; y: number }[] = [];
              for (let px = 30; px <= 250; px++) {
                const x = (px - 30) / 220 * 10 - 5;
                const y = relu(x);
                points.push({ x: px, y: 100 - y * 20 });
              }
              const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
              return <path d={d} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />;
            })()}
            {selectedFn === 'sigmoid' && (() => {
              const points: { x: number; y: number }[] = [];
              for (let px = 30; px <= 250; px++) {
                const x = (px - 30) / 220 * 10 - 5;
                const y = sigmoid(x);
                points.push({ x: px, y: 100 - (y - 0.5) * 40 });
              }
              const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
              return <path d={d} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />;
            })()}
            {selectedFn === 'softmax' && (() => {
              const probs = softmax(sampleScores);
              const barW = 25;
              return (
                <g>
                  {probs.map((p, i) => (
                    <g key={i}>
                      <rect x={40 + i * 35} y={100 - p * 80} width={barW} height={p * 80} rx="3"
                        fill={`rgba(56,189,248,${0.3 + 0.5 * p})`} stroke="#38bdf8" strokeWidth="1" opacity={0.8} />
                      <text x={40 + i * 35 + barW / 2} y={105} textAnchor="middle" fill="var(--illustration-muted-light)" fontSize="7" fontFamily="monospace">{samplePoints[i]}</text>
                      <text x={40 + i * 35 + barW / 2} y={95 - p * 80} textAnchor="middle" fill="#38bdf8" fontSize="7" fontFamily="monospace">{p.toFixed(2)}</text>
                    </g>
                  ))}
                  <text x="140" y="140" textAnchor="middle" fill="var(--illustration-element-dim)" fontSize="6">Raw scores probabilities summing to 1</text>
                </g>
              );
            })()}
          </svg>
        </div>

        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-5">
          <h4 className="text-xs font-bold text-slate-300 mb-3">{fnLabel}</h4>
          {selectedFn !== 'softmax' && (
            <div className="mb-4">
              <label className="text-[10px] text-slate-300 block mb-1.5">Input value: {xVal.toFixed(1)}</label>
              <input type="range" min="-5" max="5" step="0.1" value={xVal}
                onChange={e => setXVal(parseFloat(e.target.value))}
                className="ai-range-slider" />
              <div className="mt-2 flex justify-between text-[10px] text-slate-300">
                <span>-5</span><span>0</span><span>5</span>
              </div>
            </div>
          )}
          <div className="rounded-xl bg-slate-800/40 border border-slate-700/50 px-4 py-3">
            {selectedFn === 'relu' && (
              <p className="text-sm font-mono text-sky-300">ReLU({xVal.toFixed(1)}) = <span className="text-white font-bold">{relu(xVal).toFixed(1)}</span></p>
            )}
            {selectedFn === 'sigmoid' && (
              <p className="text-sm font-mono text-sky-300">Sigmoid({xVal.toFixed(1)}) = <span className="text-white font-bold">{sigmoid(xVal).toFixed(4)}</span></p>
            )}
            {selectedFn === 'softmax' && (
              <div className="text-xs text-sky-300 leading-relaxed">
                <p className="mb-1">Raw scores: [{sampleScores.map(s => s.toFixed(0)).join(', ')}]</p>
                <p>Probabilities: [{softmax(sampleScores).map(p => p.toFixed(3)).join(', ')}]</p>
                <p className="mt-1 text-slate-300 text-[10px]">All probabilities sum to {softmax(sampleScores).reduce((a, b) => a + b, 0).toFixed(1)}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 px-4 py-2">
        <p className="text-xs text-slate-300 leading-relaxed">
          <span className="text-sky-400 font-semibold">Why activation matters:</span> Without non-linear activations, stacking layers is mathematically equivalent to a single layer. ReLU is the default for hidden layers - it is cheap, avoids vanishing gradients, and makes deep networks trainable.
        </p>
      </div>
    </div>
  );
}
