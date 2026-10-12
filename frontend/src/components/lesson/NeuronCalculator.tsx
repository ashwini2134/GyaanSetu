import { useState } from 'react';
import type { NeuronCalculatorConfig } from '../../types/lesson';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface Props {
  config: NeuronCalculatorConfig;
  onComplete?: () => void;
}

export default function NeuronCalculator({ config, onComplete }: Props) {
  const [problemIdx, setProblemIdx] = useState(0);
  const [step, setStep] = useState<'weighted-sum' | 'activation'>('weighted-sum');
  const [userWeightedSum, setUserWeightedSum] = useState('');
  const [userActivated, setUserActivated] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [completed, setCompleted] = useState(false);

  const problem = config.problems[problemIdx];
  const isLast = problemIdx >= config.problems.length - 1;

  const computeWeightedSum = (inputs: number[], weights: number[], bias: number) =>
    inputs.reduce((sum, x, i) => sum + x * weights[i], 0) + bias;

  const applyActivation = (val: number, activation: 'relu' | 'sigmoid') =>
    activation === 'relu' ? Math.max(0, val) : 1 / (1 + Math.exp(-val));

  const ws = computeWeightedSum(problem.inputs, problem.weights, problem.bias);
  const actVal = applyActivation(ws, problem.activation);

  const activationLabel = problem.activation === 'relu' ? 'ReLU' : 'Sigmoid';
  const activationFormula = problem.activation === 'relu'
    ? `ReLU(x) = max(0, x)`
    : `Sigmoid(x) = 1 / (1 + e⁻ˣ)`;

  const totalSteps = 2;
  const stepLabel = step === 'weighted-sum' ? 1 : 2;
  const pct = ((problemIdx * totalSteps + (stepLabel - 1)) / (config.problems.length * totalSteps)) * 100;

  const handleSubmitWeightedSum = () => {
    const expected = ws;
    const userVal = parseFloat(userWeightedSum);
    setFeedback(Math.abs(userVal - expected) < 0.01 ? 'correct' : 'wrong');
  };

  const handleSubmitActivation = () => {
    const expected = actVal;
    const userVal = parseFloat(userActivated);
    if (Math.abs(userVal - expected) < 0.01) {
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }
  };

  const handleNext = () => {
    if (step === 'weighted-sum' && feedback === 'correct') {
      setStep('activation');
      setFeedback(null);
    } else if (step === 'activation' && feedback === 'correct') {
      if (isLast) {
        setCompleted(true);
        onComplete?.();
      } else {
        setProblemIdx(i => i + 1);
        setStep('weighted-sum');
        setUserWeightedSum('');
        setUserActivated('');
        setFeedback(null);
      }
    }
  };

  const handleRetry = () => setFeedback(null);

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-5">
        <div className="w-20 h-20 rounded-full bg-green-500/15 border-2 border-green-400/40 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-green-400" />
        </div>
        <div>
          <p className="text-xl font-bold text-[var(--text-primary)]">All Problems Solved</p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">You successfully computed every neuron output.</p>
        </div>
      </div>
    );
  }

  const mathParts: string[] = [];
  problem.inputs.forEach((x, i) => {
    mathParts.push(`(${x} × ${problem.weights[i]})`);
  });

  return (
    <div className="space-y-5">
      <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="absolute inset-y-0 left-0 bg-[var(--brand-primary)] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[var(--brand-primary)] bg-[var(--brand-primary)]/10 px-2.5 py-1 rounded-md">
          Problem {problemIdx + 1} of {config.problems.length}
        </span>
        <span className="text-xs font-medium text-slate-300">
          Step {stepLabel} of {totalSteps}
        </span>
      </div>

      <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
        <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-2">The Neuron Formula</p>
        <div className="text-sm font-mono text-slate-800 space-y-1">
          <p>1. Weighted Sum = <span className="text-blue-700">x₁·w₁ + x₂·w₂ + x₃·w₃ + bias</span></p>
          <p>2. Output = <span className="text-[var(--success)]">{activationLabel}(</span><span className="text-blue-700">Weighted Sum</span><span className="text-[var(--success)]">)</span></p>
        </div>
      </div>

      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
        <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Given Values</p>
        <div className="grid grid-cols-[1fr_1fr_auto] gap-x-6 gap-y-2 text-sm">
          <div className="text-[11px] font-bold text-slate-300 uppercase">Input</div>
          <div className="text-[11px] font-bold text-slate-300 uppercase">Weight</div>
          <div className="text-[11px] font-bold text-slate-300 uppercase">Product</div>
          {problem.inputs.map((x, i) => (
            <div key={i} className="contents">
              <div className="font-mono text-slate-800 py-1">x{i+1} = {x}</div>
              <div className="font-mono text-slate-800 py-1">w{i+1} = {problem.weights[i]}</div>
              <div className="font-mono text-blue-600 py-1">{(x * problem.weights[i]).toFixed(2)}</div>
            </div>
          ))}
          <div className="col-span-3 border-t border-slate-100 pt-2 mt-1">
            <div className="flex justify-between font-mono text-sm">
              <span className="text-slate-300">bias</span>
              <span className="text-slate-800">{problem.bias}</span>
            </div>
          </div>
        </div>
      </div>

      {step === 'weighted-sum' && (
        <div className="p-5 rounded-xl bg-white border-2 border-blue-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">1</span>
            <p className="text-sm font-bold text-slate-800">Compute the weighted sum + bias</p>
          </div>
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
            <p className="text-xs font-mono text-slate-700 leading-relaxed">
              {mathParts.join(' + ')} <span className="text-blue-600 font-semibold">+ {problem.bias}</span>
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-300 mb-2">Enter the result:</p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.01"
                value={userWeightedSum}
                onChange={e => setUserWeightedSum(e.target.value)}
                placeholder="e.g. 0.35"
                className="w-36 px-3 py-2.5 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]/20"
              />
              <button
                onClick={handleSubmitWeightedSum}
                disabled={!userWeightedSum}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-white px-5 py-2.5 rounded-lg bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Check Answer
              </button>
            </div>
          </div>
          {feedback === 'correct' && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-[var(--success)]" />
                <span className="text-sm font-semibold text-[var(--success)]">Correct — weighted sum + bias = <span className="font-mono">{ws.toFixed(2)}</span></span>
              </div>
              <button onClick={handleNext} className="inline-flex items-center gap-1 text-sm font-semibold text-white px-4 py-2 rounded-lg bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] transition-all">
                Next Step <ArrowRight size={16} />
              </button>
            </div>
          )}
          {feedback === 'wrong' && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
              <XCircle size={18} className="text-red-600" />
              <span className="text-sm font-semibold text-red-800">Not correct</span>
              <button onClick={handleRetry} className="ml-auto text-sm font-semibold text-[var(--brand-primary)] hover:underline">Try Again</button>
            </div>
          )}
        </div>
      )}

      {step === 'activation' && (
        <div className="p-5 rounded-xl bg-white border-2 border-emerald-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">2</span>
            <p className="text-sm font-bold text-slate-800">Apply <span className="text-[var(--success)]">{activationLabel}</span> activation</p>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
            <p className="text-xs font-mono text-slate-700">
              {activationFormula}
            </p>
            <p className="text-xs text-slate-300 mt-2">
              The weighted sum is <span className="font-mono font-semibold text-slate-800">{ws.toFixed(2)}</span>.
              {problem.activation === 'relu'
                ? ' Since ReLU outputs max(0, x), what is the final output?'
                : ' Apply the sigmoid function to get a value between 0 and 1.'}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-300 mb-2">Enter the final output:</p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.001"
                value={userActivated}
                onChange={e => setUserActivated(e.target.value)}
                placeholder="e.g. 0.350"
                className="w-36 px-3 py-2.5 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]/20"
              />
              <button
                onClick={handleSubmitActivation}
                disabled={!userActivated}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-white px-5 py-2.5 rounded-lg bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Check Answer
              </button>
            </div>
          </div>
          {feedback === 'correct' && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-[var(--success)]" />
                <span className="text-sm font-semibold text-[var(--success)]">
                  Correct! Neuron output = <span className="font-mono">{actVal.toFixed(3)}</span>
                </span>
              </div>
              <button onClick={handleNext} className="inline-flex items-center gap-1 text-sm font-semibold text-white px-4 py-2 rounded-lg bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-dark)] transition-all">
                {isLast ? 'Finish' : 'Next Problem'} <ArrowRight size={16} />
              </button>
            </div>
          )}
          {feedback === 'wrong' && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
              <XCircle size={18} className="text-red-600" />
              <span className="text-sm font-semibold text-red-800">Not correct</span>
              <button onClick={handleRetry} className="ml-auto text-sm font-semibold text-[var(--brand-primary)] hover:underline">Try Again</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
