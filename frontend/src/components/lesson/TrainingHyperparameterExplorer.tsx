import { useState } from 'react';

export default function TrainingHyperparameterExplorer() {
  const [lr, setLr] = useState(0.1);
  const [epochs, setEpochs] = useState(30);
  const [lossHistory, setLossHistory] = useState<number[]>([]);
  const [training, setTraining] = useState(false);
  const [done, setDone] = useState(false);

  const runTraining = () => {
    setTraining(true);
    setDone(false);
    const history: number[] = [];
    let currentLoss = 2.5;
    const iterations = Math.min(epochs, 60);

    const interval = setInterval(() => {
      const lrEffect = lr < 0.05 ? 0.97 : lr > 0.5 ? 0.8 + Math.random() * 0.15 : 0.92;
      currentLoss = currentLoss * (lrEffect - 0.005 * (epochs / 100)) + (Math.random() - 0.5) * (lr > 0.5 ? 0.15 : 0.02);
      if (lr > 0.5 && Math.random() > 0.85) currentLoss += 0.3;
      currentLoss = Math.max(0.05, currentLoss);
      history.push(currentLoss);

      if (history.length >= iterations) {
        clearInterval(interval);
        setTraining(false);
        setDone(true);
      }
      setLossHistory([...history]);
    }, 80);
  };

  const resetTrainer = () => {
    setLossHistory([]);
    setDone(false);
    setTraining(false);
  };

  const maxLoss = 3;
  const svgHeight = 140;
  const svgWidth = 260;

  return (
    <div className="mt-6 rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-600/10 to-slate-900/40 p-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Try It Yourself</span>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed mb-5">
        Adjust <span className="text-violet-300 font-medium">learning rate</span> and <span className="text-violet-300 font-medium">epochs</span>, then click <span className="text-violet-400">Train</span> to see how they affect convergence.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-4">
          <label className="text-[10px] font-bold text-slate-300 block mb-2">Learning Rate: {lr.toFixed(2)}</label>
          <input type="range" min="0.01" max="1.0" step="0.01" value={lr}
            onChange={e => setLr(parseFloat(e.target.value))}
            className="ai-range-slider" />
          <div className="flex justify-between text-[9px] text-slate-300 mt-1">
            <span>0.01</span>
            <span className={lr > 0.5 ? 'text-red-400' : 'text-violet-400'}>{lr > 0.5 ? 'Too high' : lr < 0.05 ? 'Slow' : 'Good'}</span>
            <span>1.0</span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-4">
          <label className="text-[10px] font-bold text-slate-300 block mb-2">Epochs: {epochs}</label>
          <input type="range" min="5" max="100" step="1" value={epochs}
            onChange={e => setEpochs(parseInt(e.target.value))}
            className="ai-range-slider" />
          <div className="flex justify-between text-[9px] text-slate-300 mt-1">
            <span>5</span><span>50</span><span>100</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {!training && !done && (
          <button onClick={runTraining}
            className="px-4 py-2.5 rounded-xl bg-violet-600/20 border border-violet-500/30 text-xs font-bold text-violet-300 hover:bg-violet-600/30 transition-colors">
            Start Training
          </button>
        )}
        {training && (
          <span className="px-4 py-2.5 rounded-xl bg-amber-600/20 border border-amber-500/30 text-xs font-bold text-amber-300">
            Training... Epoch {lossHistory.length}/{Math.min(epochs, 60)}
          </span>
        )}
        {done && (
          <button onClick={resetTrainer}
            className="px-4 py-2.5 rounded-xl bg-slate-700/30 border border-slate-700/50 text-xs font-bold text-slate-300 hover:bg-slate-700/50 transition-colors">
            Reset
          </button>
        )}
      </div>

      {lossHistory.length > 0 && (
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-4 mb-4">
          <h4 className="text-[10px] font-bold text-slate-300 mb-2">Loss Curve</h4>
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full max-w-sm">
            {[0, 1, 2, 3].map(v => {
              const y = svgHeight - (v / maxLoss) * svgHeight;
              return (
                <g key={v}>
                  <line x1="30" y1={y} x2={svgWidth - 5} y2={y} stroke="var(--illustration-surface-alt)" strokeWidth="0.3" opacity="0.3" />
                  <text x="28" y={y + 3} textAnchor="end" fill="var(--illustration-element-dim)" fontSize="6">{v}</text>
                </g>
              );
            })}
            <line x1="30" y1="0" x2="30" y2={svgHeight - 5} stroke="var(--illustration-surface-alt)" strokeWidth="0.5" opacity="0.4" />
            <line x1="30" y1={svgHeight - 5} x2={svgWidth - 5} y2={svgHeight - 5} stroke="var(--illustration-surface-alt)" strokeWidth="0.5" opacity="0.4" />
            <text x="15" y="70" textAnchor="middle" fill="var(--illustration-element-dim)" fontSize="6" transform="rotate(-90,15,70)">Loss</text>
            <text x="140" y={svgHeight - 2} textAnchor="middle" fill="var(--illustration-element-dim)" fontSize="6">Epoch</text>

            {lossHistory.length > 1 && (() => {
              const points = lossHistory.map((loss, i) => {
                const x = 30 + (i / (lossHistory.length - 1)) * (svgWidth - 35);
                const y = svgHeight - 5 - (loss / maxLoss) * (svgHeight - 5);
                return `${x.toFixed(1)},${y.toFixed(1)}`;
              });
              const d = `M${points.join(' L')}`;
              return (
                <path d={d} fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ filter: 'drop-shadow(0 0 3px rgba(167,139,250,0.5))' }} />
              );
            })()}

            {done && lossHistory.length > 0 && (
              <text x="200" y="18" fill="#a78bfa" fontSize="8" fontFamily="monospace" fontWeight="700">
                Final Loss: {lossHistory[lossHistory.length - 1].toFixed(3)}
              </text>
            )}
          </svg>
        </div>
      )}

      <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 px-4 py-2">
        <p className="text-xs text-slate-300 leading-relaxed">
          <span className="text-violet-400 font-semibold">Hyperparameters in action:</span> Low learning rates converge slowly but steadily. High rates converge faster but may oscillate or diverge. More epochs let the model train longer.
        </p>
      </div>
    </div>
  );
}
