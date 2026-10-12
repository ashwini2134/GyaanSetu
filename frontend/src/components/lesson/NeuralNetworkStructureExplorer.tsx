import { useState } from 'react';

export default function NeuralNetworkStructureExplorer() {
  const [phase, setPhase] = useState<'idle' | 'animating' | 'done'>('idle');
  const [step, setStep] = useState(0);
  const [activations, setActivations] = useState<number[][]>([[1, 0.5, 0.8], [0, 0, 0, 0], [0, 0]]);
  const LAYER_LABELS = ['Input\nLayer', 'Hidden\nLayer', 'Output\nLayer'];

  const runForward = () => {
    setPhase('animating');
    setStep(0);
    const inputActs = [1, 0.5, 0.8];
    const w1 = [[0.3, 0.7, 0.2], [0.8, 0.1, 0.6], [0.4, 0.9, 0.3], [0.6, 0.2, 0.7]];
    const b1 = [0.1, 0.2, 0.1, 0.3];
    const w2 = [[0.5, 0.3, 0.8, 0.2], [0.7, 0.4, 0.1, 0.9]];
    const b2 = [0.1, 0.2];
    const hiddenRaw = w1.map((row, j) => row.reduce((s, w, i) => s + w * inputActs[i], 0) + b1[j]);
    const hiddenActs = hiddenRaw.map(x => Math.max(0, x));
    const outputRaw = w2.map((row, j) => row.reduce((s, w, i) => s + w * hiddenActs[i], 0) + b2[j]);
    const outputActs = outputRaw.map(x => Math.max(0, x));
    setActivations([inputActs, hiddenActs, outputActs]);
    const timer = setInterval(() => {
      setStep(p => {
        if (p >= 3) { clearInterval(timer); setPhase('done'); return 3; }
        return p + 1;
      });
    }, 600);
  };

  const resetNetwork = () => {
    setPhase('idle');
    setStep(0);
    setActivations([[1, 0.5, 0.8], [0, 0, 0, 0], [0, 0]]);
  };

  const getActiveNeurons = (layerIdx: number) => {
    if (layerIdx === 0 && step >= 0) return [true, true, true];
    if (layerIdx === 1 && step >= 1) return [true, true, true, true];
    if (layerIdx === 2 && step >= 2) return [true, true];
    return activations[layerIdx].map(() => false);
  };

  const maxAct = Math.max(...activations.flat(), 0.01);

  return (
    <div className="mt-6 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-600/10 to-slate-900/40 p-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Try It Yourself</span>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed mb-5">
        This is a <span className="text-emerald-300 font-medium">3-layer neural network</span> with 3 input neurons, 4 hidden neurons, and 2 output neurons.
        Each connection has a weight. Click <span className="text-emerald-400">Run Forward Pass</span> to see data flow from input to hidden to output.
      </p>
      <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-4 mb-4">
        <div className="flex justify-center">
          <svg viewBox="0 0 400 300" className="w-full max-w-md">
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>

            {[[0, 1], [1, 2]].map(([fromL, toL]) => (
              activations[fromL].map((_, fi) =>
                activations[toL].map((_, ti) => {
                  const active = getActiveNeurons(fromL)[fi] && getActiveNeurons(toL)[ti];
                  const fx = 100 + fromL * 140; const fy = 40 + (fromL === 0 ? 50 : fromL === 1 ? 40 : 50) + fi * 45;
                  const tx = 100 + toL * 140; const ty = 40 + (toL === 0 ? 50 : toL === 1 ? 40 : 50) + ti * 45;
                  return (
                    <line key={`${fromL}-${fi}-${toL}-${ti}`}
                      x1={fx} y1={fy} x2={tx} y2={ty}
                      stroke={active ? 'var(--illustration-primary)' : 'var(--illustration-surface-alt)'}
                      strokeWidth={active ? 1.2 : 0.6}
                      opacity={active ? 0.5 : 0.15}
                    />
                  );
                })
              )
            ))}

            {activations.map((layer, li) =>
              layer.map((act, ni) => {
                const active = getActiveNeurons(li)[ni];
                const x = 100 + li * 140;
                const y = 40 + (li === 0 ? 50 : li === 1 ? 40 : 50) + ni * 45;
                const intensity = active ? 0.3 + 0.7 * (act / maxAct) : 0;
                return (
                  <g key={`${li}-${ni}`}>
                    <circle cx={x} cy={y} r="14"
                      fill={active ? `rgba(52,211,153,${intensity})` : 'var(--illustration-surface)'}
                      stroke={active ? 'var(--illustration-success-dim)' : 'var(--illustration-surface-alt)'}
                      strokeWidth={active ? 2 : 1}
                      filter={active ? 'url(#glow)' : undefined}
                    >
                      {active && (
                        <animate attributeName="r" values="12;15;12" dur="1.5s" repeatCount="indefinite" />
                      )}
                    </circle>
                    <text x={x} y={y + 3} textAnchor="middle" fill={active ? '#fff' : 'var(--illustration-muted-light)'} fontSize="8" fontFamily="monospace" fontWeight="700">
                      {act.toFixed(2)}
                    </text>
                  </g>
                );
              })
            )}

            {LAYER_LABELS.map((label, i) => (
              <text key={i} x={100 + i * 140} y={275} textAnchor="middle" fill="var(--illustration-element-dim)" fontSize="8" fontFamily="system-ui" fontWeight="600">
                {label.split('\n').map((l, j) => <tspan key={j} x={100 + i * 140} dy={j === 0 ? 0 : 10}>{l}</tspan>)}
              </text>
            ))}
          </svg>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {phase === 'idle' && (
          <button onClick={runForward}
            className="px-4 py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-xs font-bold text-emerald-300 hover:bg-emerald-600/30 transition-colors">
            Run Forward Pass
          </button>
        )}
        {phase === 'animating' && (
          <span className="px-4 py-2.5 rounded-xl bg-amber-600/20 border border-amber-500/30 text-xs font-bold text-amber-300">
            Propagating data through layer {step + 1}...
          </span>
        )}
        {phase === 'done' && (
          <button onClick={resetNetwork}
            className="px-4 py-2.5 rounded-xl bg-slate-700/30 border border-slate-700/50 text-xs font-bold text-slate-300 hover:bg-slate-700/50 transition-colors">
            Reset
          </button>
        )}
      </div>
      <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 px-4 py-2">
        <p className="text-xs text-slate-300 leading-relaxed">
          <span className="text-emerald-400 font-semibold">Forward pass:</span> Input values flow through weighted connections to the hidden layer, where each neuron computes sum(input * weight) + bias, then applies ReLU. The result flows to the output layer. This one-directional computation is how neural networks make predictions.
        </p>
      </div>
    </div>
  );
}
