import { useState } from 'react';

const CATEGORIES = [
  { name: 'Shirt', icon: '👔', key: 'shirt' },
  { name: 'Pants', icon: '👖', key: 'pants' },
  { name: 'Shoes', icon: '👟', key: 'shoes' },
  { name: 'Watch', icon: '⌚', key: 'watch' },
];

const OPTIONS: Record<string, string[]> = {
  shirt: ['White', 'Blue', 'Striped'],
  pants: ['Black', 'Khaki', 'Grey'],
  shoes: ['Brown', 'Black', 'White'],
  watch: ['Silver', 'Gold', 'Black'],
};

const TOTAL = 81;

type Step = 'pick' | 'change' | 'reveal';

interface Outfit {
  shirt: string;
  pants: string;
  shoes: string;
  watch: string;
}

const DEFAULTS: Outfit = { shirt: 'White', pants: 'Black', shoes: 'Brown', watch: 'Silver' };

function pickLabel(cat: string, val: string) {
  return `${cat === 'shirt' ? '' : ''}${val}`;
}

export default function PasswordStateSpace() {
  const [step, setStep] = useState<Step>('pick');
  const [outfit, setOutfit] = useState<Outfit>(DEFAULTS);
  const [exploredCount, setExploredCount] = useState(0);

  const updateItem = (key: string, val: string) => {
    if (step === 'pick' && exploredCount === 0) {
      setOutfit(prev => ({ ...prev, [key]: val }));
    }
    if (step === 'change') {
      setOutfit(prev => ({ ...prev, [key]: val }));
      setExploredCount(2);
    }
  };

  const handlePickDone = () => {
    setExploredCount(1);
  };

  const handleStartChange = () => {
    setStep('change');
    setExploredCount(1);
  };

  const handleChangeDone = () => {
    setExploredCount(2);
  };

  const handleReveal = () => {
    setStep('reveal');
    setExploredCount(81);
  };

  const resetAll = () => {
    setStep('pick');
    setOutfit(DEFAULTS);
    setExploredCount(0);
  };

  return (
    <div className="mt-6 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-600/10 to-slate-900/40 p-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Try It Yourself</span>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed mb-5">
        <span className="text-amber-300 font-medium">Outfit State Space</span> — You're getting ready for an interview.
        Choose a shirt, pants, shoes, and watch. Each category has <strong className="text-white">3 options</strong> — that's{' '}
        <strong className="text-white">{TOTAL}</strong> possible outfits!
      </p>

      {/* Progress Steps */}
      <div className="flex gap-2 mb-6">
        {[
          { label: 'Pick Outfit', key: 'pick' },
          { label: 'Change One', key: 'change' },
          { label: 'Reveal', key: 'reveal' },
        ].map((s, i) => (
          <div key={s.key}
            className={`flex-1 text-center py-2 rounded-xl text-[10px] font-bold border transition-all ${
              step === s.key
                ? 'bg-amber-600/20 border-amber-500/40 text-amber-300'
                : ['pick', 'change', 'reveal'].indexOf(step) >= i
                ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400'
                : 'bg-slate-800/30 border-slate-700/50 text-slate-300'
            }`}>
            {s.label}
          </div>
        ))}
      </div>

      {/* Counter */}
      <div className="rounded-2xl border border-amber-500/20 bg-amber-900/10 p-4 mb-5 text-center">
        <div className="text-[10px] text-slate-300 uppercase tracking-wider mb-1">Possible Outfits Explored</div>
        <div className="text-3xl font-bold text-amber-300">
          {exploredCount}
          <span className="text-lg text-slate-300 font-normal"> / {TOTAL}</span>
        </div>
      </div>

      {/* Category Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {CATEGORIES.map(cat => (
          <div key={cat.key}
            className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{cat.icon}</span>
              <span className="text-[10px] font-bold text-slate-300 uppercase">{cat.name}</span>
            </div>
            <div className="space-y-1.5">
              {OPTIONS[cat.key].map(opt => {
                const selected = outfit[cat.key as keyof Outfit] === opt;
                const canChange = step !== 'pick' || exploredCount === 0;
                return (
                  <button key={opt} onClick={() => updateItem(cat.key, opt)}
                    disabled={!canChange}
                    className={`w-full px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all border ${
                      selected
                        ? 'bg-amber-600/20 border-amber-500/40 text-amber-300 scale-[1.02]'
                        : canChange
                        ? 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-700/40'
                        : 'bg-slate-800/20 border-slate-700/30 text-slate-300 cursor-not-allowed'
                    }`}>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Outfit Display */}
      <div className="rounded-2xl border border-slate-800/70 bg-slate-900/30 p-4 mb-5">
        <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-2">Your Outfit</div>
        <div className="flex items-center gap-4 text-sm text-slate-300">
          <span>👔 {outfit.shirt}</span>
          <span className="text-slate-300">|</span>
          <span>👖 {outfit.pants}</span>
          <span className="text-slate-300">|</span>
          <span>👟 {outfit.shoes}</span>
          <span className="text-slate-300">|</span>
          <span>⌚ {outfit.watch}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-5">
        {step === 'pick' && exploredCount === 0 && (
          <button onClick={handlePickDone}
            className="flex-1 px-4 py-2.5 rounded-xl bg-amber-600/20 border border-amber-500/30 text-xs font-bold text-amber-300 hover:bg-amber-600/30 transition-colors">
            Done — This is my first outfit
          </button>
        )}
        {step === 'pick' && exploredCount === 1 && (
          <button onClick={handleStartChange}
            className="flex-1 px-4 py-2.5 rounded-xl bg-amber-600/20 border border-amber-500/30 text-xs font-bold text-amber-300 hover:bg-amber-600/30 transition-colors">
            Change One Item →
          </button>
        )}
        {step === 'change' && exploredCount === 1 && (
          <button onClick={handleChangeDone}
            className="flex-1 px-4 py-2.5 rounded-xl bg-amber-600/20 border border-amber-500/30 text-xs font-bold text-amber-300 hover:bg-amber-600/30 transition-colors">
            Done — This is my second outfit
          </button>
        )}
        {step === 'change' && exploredCount === 2 && (
          <button onClick={handleReveal}
            className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-xs font-bold text-emerald-300 hover:bg-emerald-600/30 transition-colors">
            Show Me the Full State Space →
          </button>
        )}
      </div>

      {/* Step-specific content */}
      {step === 'pick' && exploredCount === 0 && (
        <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 px-4 py-2">
          <p className="text-xs text-slate-300 leading-relaxed">
            Pick one item from each category to build your first outfit. Each combination is one <span className="text-amber-300">state</span>.
          </p>
        </div>
      )}

      {step === 'pick' && exploredCount === 1 && (
        <div className="rounded-xl bg-emerald-900/20 border border-emerald-500/30 px-4 py-2">
          <p className="text-xs text-emerald-300 leading-relaxed">
            <span className="font-bold">Outfit 1</span> — You've explored <strong>1 state</strong> out of {TOTAL}.
            Now change just <strong>one item</strong> to reach a neighbor state.
          </p>
        </div>
      )}

      {step === 'change' && exploredCount === 2 && (
        <div className="rounded-xl bg-emerald-900/20 border border-emerald-500/30 px-4 py-2">
          <p className="text-xs text-emerald-300 leading-relaxed">
            <span className="font-bold">Outfit 2</span> — You changed one item and reached a new <strong>neighbor state</strong>.
            You've explored <strong>2 states</strong> out of {TOTAL}. Ready to see the full picture?
          </p>
        </div>
      )}

      {/* Reveal */}
      {step === 'reveal' && (
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-600/20 to-slate-900/40 p-5">
          <h4 className="text-xs font-bold text-amber-300 mb-3">The Full State Space</h4>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Every outfit combination is a <strong className="text-amber-300">state</strong>.
            All <strong>{TOTAL} combinations</strong> together form the{' '}
            <strong className="text-amber-300">state space</strong>.
          </p>
          <div className="rounded-xl bg-slate-800/40 border border-slate-700/50 p-3">
            <p className="text-[11px] text-slate-300 leading-relaxed">
              <span className="text-amber-400 font-semibold">Bottom Line:</span> AI often has to choose from{' '}
              <strong className="text-white">thousands or even millions</strong> of possible combinations
              before making a decision. The <span className="text-amber-300">state space</span> is the set of{' '}
              <strong className="text-white">all possible choices</strong>. AI searches through this space
              to find the best one.
            </p>
          </div>
          <button onClick={resetAll}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-700/30 border border-slate-700/50 text-xs font-bold text-slate-300 hover:bg-slate-700/50 transition-colors">
            Start Over
          </button>
        </div>
      )}
    </div>
  );
}
