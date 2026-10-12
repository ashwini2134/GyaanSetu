import { useState } from 'react';

const PROD_A_PROFIT = 50;
const PROD_B_PROFIT = 80;
const LABOR_TOTAL = 20;
const MATERIAL_TOTAL = 90;
const LABOR_A = 5;
const LABOR_B = 2;
const MAT_A = 10;
const MAT_B = 12;

const MAX_A = 6;
const MAX_B = 8;

export default function FactoryPlanner() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [showOptimal, setShowOptimal] = useState(false);

  const laborUsed = a * LABOR_A + b * LABOR_B;
  const materialUsed = a * MAT_A + b * MAT_B;
  const profit = a * PROD_A_PROFIT + b * PROD_B_PROFIT;
  const laborOk = laborUsed <= LABOR_TOTAL;
  const materialOk = materialUsed <= MATERIAL_TOTAL;
  const feasible = laborOk && materialOk;

  const optimal = { a: 0, b: 7, profit: 560 };

  return (
    <div className="mt-6 rounded-3xl border border-sky-500/20 bg-gradient-to-br from-sky-600/10 to-slate-900/40 p-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Try It Yourself</span>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed mb-5">
        <span className="text-sky-300 font-medium">Factory Production Planner</span> — Two products compete for limited resources.
        Product A: <span className="text-amber-300">$50/unit</span> profit, uses 5 labor + 10 materials.
        Product B: <span className="text-amber-300">$80/unit</span> profit, uses 2 labor + 12 materials.
        Total: <strong className="text-white">20 labor</strong>, <strong className="text-white">90 materials</strong>.
        Maximize profit!
      </p>

      {/* Sliders */}
      <div className="grid md:grid-cols-2 gap-5 mb-5">
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-slate-300">Product A</label>
            <span className="text-sm font-mono font-bold text-amber-300">{a}</span>
          </div>
          <input type="range" min={0} max={MAX_A} value={a}
            onChange={e => setA(Number(e.target.value))}
            className="ai-range-slider" />
          <div className="flex justify-between text-[10px] text-slate-300 mt-1">
            <span>0</span>
            <span>{MAX_A}</span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-slate-300">Product B</label>
            <span className="text-sm font-mono font-bold text-amber-300">{b}</span>
          </div>
          <input type="range" min={0} max={MAX_B} value={b}
            onChange={e => setB(Number(e.target.value))}
            className="ai-range-slider" />
          <div className="flex justify-between text-[10px] text-slate-300 mt-1">
            <span>0</span>
            <span>{MAX_B}</span>
          </div>
        </div>
      </div>

      {/* Constraints + Profit */}
      <div className="grid md:grid-cols-3 gap-3 mb-5">
        <div className={`rounded-xl border p-3 ${laborOk ? 'bg-slate-800/40 border-slate-700/50' : 'bg-rose-900/20 border-rose-500/30'}`}>
          <div className="text-[10px] text-slate-300 mb-1">Labor Used</div>
          <div className="flex justify-between items-center">
            <span className={`text-sm font-bold font-mono ${laborOk ? 'text-slate-300' : 'text-rose-300'}`}>
              {laborUsed} / {LABOR_TOTAL}
            </span>
            {!laborOk && <span className="text-[10px] text-rose-400 font-bold">Exceeded</span>}
          </div>
          <div className="h-1.5 rounded-full bg-slate-700/50 overflow-hidden mt-2">
            <div className={`h-full rounded-full ${laborOk ? 'bg-sky-500' : 'bg-rose-500'}`}
              style={{ width: `${Math.min(100, (laborUsed / LABOR_TOTAL) * 100)}%` }} />
          </div>
        </div>
        <div className={`rounded-xl border p-3 ${materialOk ? 'bg-slate-800/40 border-slate-700/50' : 'bg-rose-900/20 border-rose-500/30'}`}>
          <div className="text-[10px] text-slate-300 mb-1">Materials Used</div>
          <div className="flex justify-between items-center">
            <span className={`text-sm font-bold font-mono ${materialOk ? 'text-slate-300' : 'text-rose-300'}`}>
              {materialUsed} / {MATERIAL_TOTAL}
            </span>
            {!materialOk && <span className="text-[10px] text-rose-400 font-bold">Exceeded</span>}
          </div>
          <div className="h-1.5 rounded-full bg-slate-700/50 overflow-hidden mt-2">
            <div className={`h-full rounded-full ${materialOk ? 'bg-sky-500' : 'bg-rose-500'}`}
              style={{ width: `${Math.min(100, (materialUsed / MATERIAL_TOTAL) * 100)}%` }} />
          </div>
        </div>
        <div className="rounded-xl border border-amber-500/30 bg-amber-900/10 p-3">
          <div className="text-[10px] text-slate-300 mb-1">Total Profit</div>
          <div className="text-lg font-bold font-mono text-amber-300">${profit}</div>
          {showOptimal && (
            <div className="text-[10px] text-emerald-400 mt-1">
              Optimal: ${optimal.profit} (A={optimal.a}, B={optimal.b})
            </div>
          )}
        </div>
      </div>

      {/* Feasibility message */}
      {a > 0 || b > 0 ? (
        feasible ? (
          <div className="rounded-xl bg-emerald-900/20 border border-emerald-500/30 px-4 py-2 mb-4">
            <p className="text-xs text-emerald-300 leading-relaxed">
              {'\u2713'} Feasible solution — profit: <strong>${profit}</strong>.
              {a === optimal.a && b === optimal.b
                ? ' This is the optimal solution!'
                : ' Can you find a higher profit?'}
            </p>
          </div>
        ) : (
          <div className="rounded-xl bg-rose-900/20 border border-rose-500/30 px-4 py-2 mb-4">
            <p className="text-xs text-rose-300 leading-relaxed">
              {'\u2717'} Infeasible — constraints violated. Reduce production.
            </p>
          </div>
        )
      ) : null}

      <div className="flex gap-3">
        <button onClick={() => setShowOptimal(true)}
          className="px-4 py-2 rounded-xl bg-sky-600/20 border border-sky-500/30 text-xs font-bold text-sky-300 hover:bg-sky-600/30 transition-colors">
          Show Optimal Solution
        </button>
        <button onClick={() => { setA(0); setB(0); setShowOptimal(false); }}
          className="px-4 py-2 rounded-xl bg-slate-700/30 border border-slate-700/50 text-xs font-bold text-slate-300 hover:bg-slate-700/50 transition-colors">
          Reset
        </button>
      </div>

      <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 px-4 py-2 mt-4">
        <p className="text-xs text-slate-300 leading-relaxed">
          <span className="text-sky-400 font-semibold">Linear Programming:</span> The feasible region is defined by constraints.
          The optimal solution lies at a <span className="text-sky-300">vertex</span> of this region.
          Algorithms like <span className="text-sky-300">Simplex</span> walk along vertices to find the optimum.
        </p>
      </div>
    </div>
  );
}
