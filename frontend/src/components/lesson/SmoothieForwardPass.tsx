import { useState, useMemo } from 'react';
import type { SmoothieForwardPassConfig, SmoothieIngredient } from '../../types/lesson';
import { ArrowRight, CheckCircle2, Lightbulb, RotateCcw, Sparkles } from 'lucide-react';

interface Props {
  config: SmoothieForwardPassConfig;
  onAttempt?: () => void;
  onComplete?: () => void;
}

type Screen =
  | 'brief'
  | 'inputs'
  | 'weights'
  | 'blend'
  | 'mode'
  | 'result'
  | 'success'
  | 'reflection'
  | 'match'
  | 'final'
  | 'final-success';

type Mode = 'relu' | 'sigmoid' | 'tanh';
type Amounts = Record<string, number>;
type Weights = Record<string, number>;

function computeWeightedSum(ingredients: SmoothieIngredient[], amounts: Amounts, weights: Weights): number {
  return ingredients.reduce((sum, ing) => sum + (amounts[ing.key] ?? 0) * (weights[ing.key] ?? 0), 0);
}

function activate(weightedSum: number, mode: Mode): number {
  let raw: number;
  if (mode === 'relu') {
    raw = Math.max(0, weightedSum) / 15;
  } else if (mode === 'sigmoid') {
    raw = 10 / (1 + Math.exp(-(weightedSum - 100) / 20));
  } else {
    raw = 5 * (1 + Math.tanh((weightedSum - 100) / 40));
  }
  return Math.min(10, Math.max(0, raw));
}

const PROGRESS_ORDER: Screen[] = ['brief', 'inputs', 'weights', 'blend', 'mode', 'result', 'reflection', 'match', 'final'];

function ProgressBar({ screen }: { screen: Screen }) {
  const idx = PROGRESS_ORDER.indexOf(screen === 'success' ? 'result' : screen === 'final-success' ? 'final' : screen);
  const pct = idx < 0 ? 100 : ((idx + 1) / PROGRESS_ORDER.length) * 100;
  return (
    <div className="relative h-1.5 bg-slate-100 rounded-full overflow-hidden mb-5">
      <div className="absolute inset-y-0 left-0 bg-[var(--brand-primary)] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

function Slider({
  ing, value, onChange, min, max, step, suffix, disabled,
}: { ing: SmoothieIngredient; value: number; onChange: (v: number) => void; min: number; max: number; step: number; suffix?: string; disabled?: boolean }) {
  return (
    <div className={`p-4 rounded-xl border ${disabled ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
          <span className="text-base">{ing.emoji}</span> {ing.label}
        </span>
        <span className="text-sm font-mono font-bold text-[var(--brand-primary)]">{value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="ai-range-slider"
      />
    </div>
  );
}

export default function SmoothieForwardPass({ config, onAttempt, onComplete }: Props) {
  const { ingredients, blenderModes, targetScore, finalChallenge } = config;

  const [screen, setScreen] = useState<Screen>('brief');
  const [started, setStarted] = useState(false);

  const [amounts, setAmounts] = useState<Amounts>(() =>
    Object.fromEntries(ingredients.map((i) => [i.key, i.defaultInput]))
  );
  const [weights, setWeights] = useState<Weights>(() =>
    Object.fromEntries(ingredients.map((i) => [i.key, i.defaultWeight]))
  );
  const [mode, setMode] = useState<Mode | null>(null);
  const [blending, setBlending] = useState(false);

  const [finalAmounts, setFinalAmounts] = useState<Amounts>({});
  const [finalWeights, setFinalWeights] = useState<Weights>({});
  const [finalInitialized, setFinalInitialized] = useState(false);

  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [leftPick, setLeftPick] = useState<string | null>(null);
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);

  const weightedSum = useMemo(() => computeWeightedSum(ingredients, amounts, weights), [ingredients, amounts, weights]);
  const score = useMemo(() => (mode ? activate(weightedSum, mode) : 0), [weightedSum, mode]);
  const scoreDisplay = score.toFixed(1);
  const isSuccess = mode !== null && Math.abs(score - targetScore) < 0.05;

  const finalWeightedSum = useMemo(
    () => computeWeightedSum(ingredients, finalAmounts, finalWeights),
    [ingredients, finalAmounts, finalWeights]
  );
  const finalScore = useMemo(() => activate(finalWeightedSum, 'sigmoid'), [finalWeightedSum]);
  const finalScoreDisplay = finalScore.toFixed(1);
  const isFinalSuccess = Math.abs(finalScore - finalChallenge.targetScore) < 0.05;

  const goStart = () => {
    if (!started) { setStarted(true); onAttempt?.(); }
    setScreen('inputs');
  };

  const runBlend = () => {
    setBlending(true);
    setTimeout(() => { setBlending(false); setScreen('mode'); }, 900);
  };

  const pickMode = (m: Mode) => {
    setMode(m);
    setScreen(activate(weightedSum, m) - targetScore > -0.05 && activate(weightedSum, m) - targetScore < 0.05 ? 'success' : 'result');
  };

  const startFinalChallenge = () => {
    if (!finalInitialized) {
      const frozen: Amounts = {};
      const frozenW: Weights = {};
      ingredients.forEach((ing) => {
        frozen[ing.key] = finalChallenge.lockedKeys.includes(ing.key) ? amounts[ing.key] : ing.defaultInput;
        frozenW[ing.key] = finalChallenge.lockedKeys.includes(ing.key) ? weights[ing.key] : ing.defaultWeight;
      });
      setFinalAmounts(frozen);
      setFinalWeights(frozenW);
      setFinalInitialized(true);
    }
    setScreen('final');
  };

  const REFLECTION_ROWS = [
    ['Smoothie ingredients', 'Inputs'],
    ['Importance sliders', 'Weights'],
    ['The blender', 'Forward pass'],
    ['Blender mode', 'Activation function'],
    ['Sweetness score', 'Output'],
  ];

  const handlePick = (side: 'left' | 'right', key: string) => {
    if (matched.has(key.split(':')[1])) return;
    if (side === 'left') {
      setLeftPick(key);
      return;
    }
    if (!leftPick) return;
    const leftKey = leftPick.split(':')[1];
    const rightKey = key.split(':')[1];
    if (leftKey === rightKey) {
      setMatched((prev) => new Set(prev).add(leftKey));
      setLeftPick(null);
    } else {
      setWrongFlash(rightKey);
      setTimeout(() => { setWrongFlash(null); setLeftPick(null); }, 450);
    }
  };

  const allMatched = matched.size === REFLECTION_ROWS.length;

  return (
    <div className="ai-card-surface rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-[var(--brand-primary)]/20 flex items-center justify-center flex-shrink-0 text-lg">
          🍹
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-[var(--brand-primary)] uppercase tracking-wider mb-1">Practice Exercise</p>
          <p className="text-sm font-medium text-[var(--text-primary)]">Build the Perfect Smoothie</p>
        </div>
      </div>

      <ProgressBar screen={screen} />

      {/* ── Screen 1: Mission Brief ── */}
      {screen === 'brief' && (
        <div className="p-5 rounded-xl bg-gradient-to-br from-orange-50 to-pink-50 border border-orange-100 space-y-4">
          <p className="text-lg font-bold text-slate-800">🍹 Smoothie Challenge</p>
          <p className="text-sm text-slate-300 leading-relaxed">
            Your customer wants a smoothie with a sweetness score of <span className="font-bold text-[var(--brand-primary)]">{targetScore}/10</span>. Every ingredient has a different importance.
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">Just like an AI neuron, you must:</p>
          <ul className="space-y-1.5 text-sm text-slate-700">
            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" /> Choose ingredient amounts</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" /> Adjust ingredient importance</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" /> Blend everything together</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" /> Apply a blender mode (Activation Function)</li>
          </ul>
          <p className="text-xs text-slate-300">If you reach {targetScore}/10, the customer is happy!</p>
          <button
            onClick={goStart}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] transition-all"
          >
            Start Blending <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* ── Screen 2: Inputs ── */}
      {screen === 'inputs' && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-bold text-slate-800">Step 1: Add Ingredients</p>
            <p className="text-xs text-slate-300 mt-0.5">Move the sliders to set how much of each ingredient goes in.</p>
          </div>
          <div className="space-y-2.5">
            {ingredients.map((ing) => (
              <Slider key={ing.key} ing={ing} value={amounts[ing.key]} min={0} max={100} step={1}
                onChange={(v) => setAmounts((a) => ({ ...a, [ing.key]: v }))} />
            ))}
          </div>
          <button
            onClick={() => setScreen('weights')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] transition-all"
          >
            Next <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* ── Screen 3: Weights ── */}
      {screen === 'weights' && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-bold text-slate-800">Step 2: Decide How Important Each Ingredient Is</p>
            <p className="text-xs text-slate-300 mt-0.5">Not every ingredient affects sweetness equally. Assign a weight.</p>
          </div>
          <div className="space-y-2.5">
            {ingredients.map((ing) => (
              <Slider key={ing.key} ing={ing} value={weights[ing.key]} min={0} max={1} step={0.05}
                onChange={(v) => setWeights((w) => ({ ...w, [ing.key]: v }))} />
            ))}
          </div>
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 flex items-start gap-2">
            <Lightbulb size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">Increasing a weight makes that ingredient influence the final result more.</p>
          </div>
          <button
            onClick={() => setScreen('blend')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] transition-all"
          >
            Next <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* ── Screen 4: Blend (forward pass) ── */}
      {screen === 'blend' && (
        <div className="space-y-4">
          <p className="text-sm font-bold text-slate-800">Step 3: Blend the Smoothie</p>
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">Weighted Sum</p>
            <p className="text-sm font-mono text-slate-700 leading-relaxed">
              {ingredients.map((ing, i) => (
                <span key={ing.key}>
                  {i > 0 && ' + '}({amounts[ing.key]} × {weights[ing.key]})
                </span>
              ))}
            </p>
            {!blending && weightedSum > 0 && screen === 'blend' && (
              <p className="text-xs text-slate-300 mt-2">Press Blend to calculate the result.</p>
            )}
          </div>

          <div className="flex flex-col items-center gap-3 py-4">
            <div className={`text-5xl ${blending ? 'animate-spin' : ''}`}>🥤</div>
            <button
              onClick={runBlend}
              disabled={blending}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] transition-all disabled:opacity-50"
            >
              {blending ? 'Blending…' : 'Blend'}
            </button>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            This is exactly what a neuron does during a forward pass — it multiplies each input by its weight and adds everything together.
          </p>
        </div>
      )}

      {/* ── Screen 5: Mode ── */}
      {screen === 'mode' && (
        <div className="space-y-4">
          <p className="text-sm font-bold text-slate-800">Step 4: Pick a Blender Mode</p>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-300">Weighted Sum</p>
            <p className="text-lg font-mono font-bold text-slate-800">{weightedSum.toFixed(1)}</p>
          </div>
          <div className="grid gap-2.5">
            {blenderModes.map((m) => (
              <button
                key={m.key}
                onClick={() => pickMode(m.key)}
                className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5 transition-all text-left"
              >
                <span className="text-2xl flex-shrink-0">{m.emoji}</span>
                <div>
                  <p className="text-sm font-bold text-slate-800">{m.label} <span className="text-slate-300 font-normal">({m.subtitle})</span></p>
                  <p className="text-xs text-slate-300 mt-0.5">{m.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Screen 6a: Result (not yet at target) ── */}
      {screen === 'result' && !isSuccess && (
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-2 py-4">
            <div className="text-4xl">🥤</div>
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Sweetness Score</p>
            <p className="text-4xl font-black text-slate-800">{scoreDisplay} <span className="text-lg text-slate-300 font-normal">/ 10</span></p>
            <p className="text-sm text-slate-300">🙂 Almost!</p>
          </div>
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
            <Lightbulb size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              {score < targetScore
                ? 'Try increasing Honey, or increasing the Mango weight.'
                : 'Try reducing Honey, or reducing the Mango amount.'}
            </p>
          </div>
          <p className="text-xs text-slate-300">Can you reach exactly {targetScore}/10?</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setScreen('inputs')} className="text-xs font-semibold text-[var(--brand-primary)] border border-[var(--brand-primary)]/30 px-4 py-2 rounded-lg hover:bg-[var(--brand-primary)]/5 transition-all">
              Adjust Ingredients
            </button>
            <button onClick={() => setScreen('weights')} className="text-xs font-semibold text-[var(--brand-primary)] border border-[var(--brand-primary)]/30 px-4 py-2 rounded-lg hover:bg-[var(--brand-primary)]/5 transition-all">
              Adjust Weights
            </button>
            <button onClick={() => setScreen('mode')} className="inline-flex items-center gap-1.5 text-xs font-semibold text-white px-4 py-2 rounded-lg bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] transition-all">
              <RotateCcw size={13} /> Try Again
            </button>
          </div>
        </div>
      )}

      {/* ── Screen 6b: Success ── */}
      {screen === 'success' && isSuccess && (
        <div className="flex flex-col items-center text-center gap-3 py-6">
          <Sparkles className="text-amber-400" size={32} />
          <p className="text-lg font-bold text-slate-800">🎉 Perfect Smoothie!</p>
          <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Sweetness</p>
          <p className="text-4xl font-black text-[var(--success)]">{scoreDisplay} <span className="text-lg text-slate-300 font-normal">/ 10</span></p>
          <p className="text-xl">⭐⭐⭐⭐⭐</p>
          <p className="text-sm text-slate-300">Excellent! Congratulations — you successfully completed a forward pass.</p>
          <button
            onClick={() => setScreen('reflection')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] transition-all mt-1"
          >
            Continue <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* ── Reflection ── */}
      {screen === 'reflection' && (
        <div className="space-y-4">
          <p className="text-sm font-bold text-slate-800">Think Like an AI</p>
          <div className="space-y-2 text-sm text-slate-300">
            <p>The smoothie ingredients were your <b className="text-slate-800">inputs</b>.</p>
            <p>The importance sliders were the <b className="text-slate-800">weights</b>.</p>
            <p>The blender calculated the <b className="text-slate-800">weighted sum</b>.</p>
            <p>The blender mode acted like the <b className="text-slate-800">activation function</b>.</p>
            <p>The final sweetness score was the <b className="text-slate-800">output</b>.</p>
          </div>
          <button
            onClick={() => setScreen('match')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] transition-all"
          >
            Knowledge Check <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* ── Knowledge check: match the analogy ── */}
      {screen === 'match' && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-bold text-slate-800">Match the Analogy</p>
            <p className="text-xs text-slate-300 mt-0.5">Tap a smoothie term, then its matching neural network term.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              {REFLECTION_ROWS.map(([left], i) => {
                const key = `left:${i}`;
                const isMatched = matched.has(String(i));
                return (
                  <button
                    key={key}
                    onClick={() => handlePick('left', `left:${i}`)}
                    disabled={isMatched}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium border transition-all ${
                      isMatched ? 'bg-emerald-50 border-emerald-200 text-[var(--success)]'
                        : leftPick === `left:${i}` ? 'bg-[var(--brand-primary)]/10 border-[var(--brand-primary)] text-[var(--brand-primary)]'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {left}
                  </button>
                );
              })}
            </div>
            <div className="space-y-2">
              {[...REFLECTION_ROWS].map(([, right], i) => {
                const isMatched = matched.has(String(i));
                const isWrong = wrongFlash === String(i);
                return (
                  <button
                    key={`right:${i}`}
                    onClick={() => handlePick('right', `right:${i}`)}
                    disabled={isMatched}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium border transition-all ${
                      isMatched ? 'bg-emerald-50 border-emerald-200 text-[var(--success)]'
                        : isWrong ? 'bg-red-50 border-red-300 text-red-600'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {right}
                  </button>
                );
              })}
            </div>
          </div>
          {allMatched && (
            <button
              onClick={startFinalChallenge}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] transition-all"
            >
              Final Challenge <ArrowRight size={16} />
            </button>
          )}
        </div>
      )}

      {/* ── Final challenge ── */}
      {screen === 'final' && !isFinalSuccess && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-bold text-slate-800">Final Challenge</p>
            <p className="text-xs text-slate-300 mt-0.5">
              Can you create another smoothie with <span className="font-bold text-[var(--brand-primary)]">{finalChallenge.targetScore}/10</span> without changing {ingredients.filter(i => finalChallenge.lockedKeys.includes(i.key)).map(i => i.label).join(' or ')}? Only adjust {ingredients.filter(i => !finalChallenge.lockedKeys.includes(i.key)).map(i => i.label).join(' and ')}.
            </p>
          </div>
          <div className="space-y-2.5">
            {ingredients.map((ing) => {
              const locked = finalChallenge.lockedKeys.includes(ing.key);
              return (
                <Slider key={ing.key} ing={ing} value={finalAmounts[ing.key] ?? 0} min={0} max={100} step={1} disabled={locked}
                  onChange={(v) => setFinalAmounts((a) => ({ ...a, [ing.key]: v }))} />
              );
            })}
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Sweetness Score</span>
            <span className="text-lg font-mono font-bold text-slate-800">{finalScoreDisplay} / 10</span>
          </div>
          <p className="text-[11px] text-slate-300">Changing only some inputs still changes the neuron's output — this is exactly how a real network responds to a partial change upstream.</p>
        </div>
      )}

      {screen === 'final' && isFinalSuccess && (
        <div className="flex flex-col items-center text-center gap-3 py-6">
          <Sparkles className="text-amber-400" size={32} />
          <p className="text-lg font-bold text-slate-800">🎉 Nailed It!</p>
          <p className="text-4xl font-black text-[var(--success)]">{finalScoreDisplay} <span className="text-lg text-slate-300 font-normal">/ 10</span></p>
          <p className="text-sm text-slate-300 max-w-sm">
            You changed only {ingredients.filter(i => !finalChallenge.lockedKeys.includes(i.key)).map(i => i.label).join(' and ')} — and the output still moved. That's a forward pass responding to a partial change in its inputs.
          </p>
          <button
            onClick={() => { setScreen('final-success'); onComplete?.(); }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] transition-all mt-1"
          >
            Finish <ArrowRight size={16} />
          </button>
        </div>
      )}

      {screen === 'final-success' && (
        <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-500/15 border-2 border-green-400/40 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <p className="text-lg font-bold text-[var(--text-primary)]">Exercise Complete</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">You've built a forward pass from scratch — inputs, weights, weighted sum, and activation.</p>
          </div>
        </div>
      )}
    </div>
  );
}
