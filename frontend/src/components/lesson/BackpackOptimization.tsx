import { useState } from 'react';

interface Item { id: string; name: string; icon: string; weight: number; usefulness: number; }

const ITEMS: Item[] = [
  { id: 'water', name: 'Water', icon: '🥤', weight: 2, usefulness: 9 },
  { id: 'food', name: 'Food', icon: '🍎', weight: 3, usefulness: 8 },
  { id: 'jacket', name: 'Jacket', icon: '🧥', weight: 4, usefulness: 6 },
  { id: 'flashlight', name: 'Flashlight', icon: '🔦', weight: 1, usefulness: 5 },
  { id: 'firstaid', name: 'First Aid Kit', icon: '🩹', weight: 2, usefulness: 7 },
  { id: 'camera', name: 'Camera', icon: '📷', weight: 3, usefulness: 4 },
  { id: 'powerbank', name: 'Power Bank', icon: '🔋', weight: 2, usefulness: 3 },
];

const MAX_WEIGHT = 10;

export default function BackpackOptimization() {
  const [packed, setPacked] = useState<string[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);

  const toggleItem = (id: string) => {
    setPacked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    setShowAnswer(false);
  };

  const totalWeight = packed.reduce((s, id) => s + ITEMS.find(i => i.id === id)!.weight, 0);
  const totalUsefulness = packed.reduce((s, id) => s + ITEMS.find(i => i.id === id)!.usefulness, 0);
  const overLimit = totalWeight > MAX_WEIGHT;

  return (
    <div className="mt-6 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-600/10 to-slate-900/40 p-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Try It Yourself</span>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed mb-5">
        <span className="text-amber-300 font-medium">Pack the Perfect Backpack!</span> You're going on a mountain trek. Your backpack can carry only <strong>10 kg</strong>.
        Click items to add them. Try to maximize usefulness without exceeding the weight limit.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-4">
          <h4 className="text-[10px] font-bold text-slate-300 mb-3">Available Items</h4>
          <div className="space-y-2">
            {ITEMS.map(item => {
              const inPack = packed.includes(item.id);
              return (
                <button key={item.id} onClick={() => toggleItem(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    inPack
                      ? 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-300'
                      : 'bg-slate-800/40 border border-slate-700/50 text-slate-300 hover:bg-slate-700/40'
                  }`}>
                  <span className="text-base">{item.icon}</span>
                  <span className="flex-1 text-left">{item.name}</span>
                  <span className="text-slate-300">{item.weight}kg</span>
                  <span className="text-amber-400">{'★'.repeat(item.usefulness > 5 ? 1 : 0)}{item.usefulness}</span>
                  <span>{inPack ? '✓' : '+'}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-4">
          <h4 className="text-[10px] font-bold text-slate-300 mb-3">Your Backpack</h4>
          {packed.length === 0 ? (
            <p className="text-xs text-slate-300 italic">Click items to pack them...</p>
          ) : (
            <div className="flex flex-wrap gap-2 mb-3">
              {packed.map(id => {
                const item = ITEMS.find(i => i.id === id)!;
                return (
                  <span key={id} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300">
                    {item.icon} {item.name}
                    <button onClick={() => toggleItem(id)} className="ml-1 text-slate-300 hover:text-red-400">&times;</button>
                  </span>
                );
              })}
            </div>
          )}

          <div className={`rounded-xl border p-3 ${overLimit ? 'border-red-500/40 bg-red-900/20' : 'border-slate-700/50 bg-slate-800/40'}`}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">Weight</span>
              <span className={overLimit ? 'text-red-400 font-bold' : 'text-slate-300'}>{totalWeight} / {MAX_WEIGHT} kg</span>
            </div>
            <div className="h-2 rounded-full bg-slate-700/50 overflow-hidden">
              <div className={`h-full rounded-full transition-all ${overLimit ? 'bg-red-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, (totalWeight / MAX_WEIGHT) * 100)}%` }} />
            </div>
            {overLimit && <p className="text-[10px] text-red-400 mt-1">Too heavy! Remove some items.</p>}
          </div>

          <div className="mt-3 rounded-xl border border-slate-700/50 bg-slate-800/40 p-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Usefulness</span>
              <span className="text-amber-400 font-bold">{totalUsefulness}</span>
            </div>
          </div>

          {!overLimit && packed.length > 0 && (
            <div className="mt-3">
              <button onClick={() => setShowAnswer(true)}
                className="w-full px-3 py-2 rounded-xl bg-amber-600/20 border border-amber-500/30 text-xs font-bold text-amber-300 hover:bg-amber-600/30 transition-colors">
                Check Best Possible
              </button>
            </div>
          )}

          {showAnswer && (
            <div className="mt-3 rounded-xl bg-emerald-900/20 border border-emerald-500/30 p-3">
              <p className="text-xs text-emerald-300 font-bold mb-1">Best solution found!</p>
              <p className="text-[10px] text-slate-300 leading-relaxed">
                Many combinations fit within 10 kg. The one with the highest usefulness is the optimal solution.
                Optimization is about finding the <strong className="text-emerald-300">most useful</strong> combination among all valid ones.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 px-4 py-2">
        <p className="text-xs text-slate-300 leading-relaxed">
          <span className="text-amber-400 font-semibold">Optimization in a nutshell:</span> Many solutions fit the constraints (weight limit).
          Optimization is choosing the <span className="text-amber-300">most useful</span> one — maximizing your objective given what's available.
        </p>
      </div>
    </div>
  );
}
