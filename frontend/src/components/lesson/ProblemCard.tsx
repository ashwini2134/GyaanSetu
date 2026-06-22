import { useState, useEffect } from 'react';
import type { CodingProblem } from '../../types/lesson';
import CodeEditor from './CodeEditor';
import { runPython } from '../../utils/pythonRunner';
import { authFetch } from '../../authClient';

const DIFF_COLOR: Record<string, string> = {
  easy:   'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  hard:   'text-red-400 bg-red-500/10 border-red-500/20',
};

interface TestResult {
  label: string;
  passed: boolean;
  expected: string;
  actual: string;
  diffLines?: DiffLine[];
}

interface DiffLine {
  line: number;
  expected: string;
  actual: string;
  match: boolean;
  explanation?: string;
}

function lineDiff(expected: string, actual: string): { diffLines: DiffLine[]; explanation: string } {
  const expLines = expected.split('\n');
  const actLines = actual.split('\n');
  const maxLen = Math.max(expLines.length, actLines.length);
  const diffLines: DiffLine[] = [];
  let firstMismatchLine = -1;

  for (let i = 0; i < maxLen; i++) {
    const e = expLines[i] ?? '';
    const a = actLines[i] ?? '';
    const match = e === a;
    if (!match && firstMismatchLine < 0) firstMismatchLine = i;
    diffLines.push({ line: i + 1, expected: e, actual: a, match });
  }

  let explanation = 'Output must match exactly.';
  if (firstMismatchLine >= 0) {
    const e = diffLines[firstMismatchLine].expected;
    const a = diffLines[firstMismatchLine].actual;
    if (e.length !== a.length) {
      explanation = `Line ${firstMismatchLine + 1} has different lengths (expected ${e.length} chars, got ${a.length}).`;
    } else {
      for (let j = 0; j < Math.max(e.length, a.length); j++) {
        if (e[j] !== a[j]) {
          const expChar = e[j] ?? '(end)';
          const actChar = a[j] ?? '(end)';
          const desc: Record<string, string> = {
            ' ': 'space',
            ',': 'comma',
            '.': 'period',
            '!': 'exclamation mark',
            "'": 'single quote',
            '"': 'double quote',
            '\t': 'tab',
          };
          const expDesc = desc[expChar] ?? `"${expChar}"`;
          const actDesc = desc[actChar] ?? `"${actChar}"`;
          explanation = `Line ${firstMismatchLine + 1}, character ${j + 1}: expected ${expDesc} but found ${actDesc}.`;
          break;
        }
      }
    }
  }

  return { diffLines, explanation };
}

interface ProblemCardProps {
  problem: CodingProblem;
  index: number;
  completed?: boolean;
  onComplete?: (id: string) => void;
  onAttempt?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function ProblemCard({ problem, index, completed, onComplete, onAttempt, isOpen, onOpenChange }: ProblemCardProps) {
  const [localOpen, setLocalOpen] = useState(false);
  const open = isOpen !== undefined ? isOpen : localOpen;
  const setOpen = (val: boolean) => {
    setLocalOpen(val);
    onOpenChange?.(val);
  };
  const [tab, setTab] = useState<'description' | 'hints'>('description');
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [allPassed, setAllPassed] = useState(completed ?? false);
  const [showCompletion, setShowCompletion] = useState(false);

  // Run-only state (separate from submission)
  const [runOutput, setRunOutput] = useState<string | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  const [savedCode, setSavedCode] = useState<string | null>(null);
  const saveKey = `lms:problem:${problem.id}`;

  useEffect(() => {
    async function loadDraft() {
      try {
        const data = await authFetch<{ code?: string }>(`/drafts/${problem.id}?type=problem`);
        if (data && data.code) setSavedCode(data.code);
      } catch (err) {
        console.error('Failed to load problem draft', err);
      }
    }
    loadDraft();
  }, [problem.id]);

  useEffect(() => {
    if (completed) setAllPassed(true);
  }, [completed]);

  const handleSave = (code: string) => {
    setSavedCode(code);
    authFetch('/drafts', {
      method: 'POST',
      body: JSON.stringify({
        lectureId: problem.id,
        type: 'problem',
        code
      })
    })
    .then(() => {
      localStorage.removeItem(saveKey);
    })
    .catch(err => console.error('Failed to save problem draft', err));
  };

  // Run — just execute, show output, no test cases
  const handleRun = (code: string, output: string, error: string | null) => {
    onAttempt?.();
    setRunOutput(output);
    setRunError(error);
    setTestResults(null);
    handleSave(code);
  };

  // Submit — run test cases, show submission results, update progress
  const handleSubmit = (code: string, _output: string, _error: string | null) => {
    onAttempt?.();
    handleSave(code);
    if (allPassed) return;
    if (problem.testCases.length === 0) {
      completeProblem();
      return;
    }
    setTestResults(null);
    setRunOutput(null);
    setRunError(null);

    setTimeout(() => {
      const results: TestResult[] = [];
      for (const tc of problem.testCases) {
        let fullCode = code;
        if (tc.input) {
          fullCode = fullCode.replace(/input\([^)]*\)/g, `'${tc.input}'`);
        }
        const result = runPython(fullCode);
        const actual = result.error ? result.error : result.output;
        let passed = false;
        let diffLines: DiffLine[] = [];
        let explanation = '';

        if (tc.matchType === 'regex') {
          try {
            const regex = new RegExp(tc.expectedOutput);
            passed = regex.test(actual.trim());
          } catch (e) {}
          if (!passed) explanation = "Output does not match the required pattern.";
        } else if (tc.matchType === 'any_lines') {
          const expectedLinesCount = tc.expectedOutput.trim().split('\\n').length;
          const actualLines = actual.trim().split('\\n').filter(l => l.trim().length > 0);
          passed = actualLines.length === expectedLinesCount;
          if (!passed) explanation = `Expected exactly ${expectedLinesCount} non-empty lines, but got ${actualLines.length}.`;
        } else {
          const diff = lineDiff(tc.expectedOutput, actual);
          diffLines = diff.diffLines;
          explanation = diff.explanation;
          passed = actual.trim() === tc.expectedOutput.trim();
        }
        results.push({ label: tc.label, passed, expected: tc.expectedOutput, actual, diffLines });
        // Store explanation on first failed test case
        if (!passed && results.filter(r => !r.passed).length === 1) {
          results[results.length - 1].diffLines = diffLines.map(d => ({ ...d, explanation: d.match ? undefined : explanation }));
        }
      }
      setTestResults(results);
      if (results.every(r => r.passed)) {
        completeProblem();
      }
    }, 100);
  };

  const completeProblem = () => {
    setAllPassed(true);
    setShowCompletion(true);
    onComplete?.(problem.id);
    setTimeout(() => setShowCompletion(false), 1500);
  };

  const diffCls = DIFF_COLOR[problem.difficulty] ?? DIFF_COLOR.easy;
  const passedCount = testResults ? testResults.filter(r => r.passed).length : 0;
  const totalCount = problem.testCases.length;

  if (!open) {
    return (
      <div
        className={`rounded-2xl border transition-all duration-200 cursor-pointer group relative
          ${allPassed
            ? 'border-emerald-500/25 bg-gradient-to-br from-emerald-600/8 to-slate-800/40'
            : 'border-slate-700/30 bg-gradient-to-br from-slate-800/40 to-slate-900/40 hover:border-blue-500/30 hover:bg-slate-800/60'}`}
        onClick={() => setOpen(true)}
      >
        <div className="flex items-center gap-4 px-5 py-4">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold
            ${allPassed ? 'bg-emerald-600/20 text-emerald-400' : 'bg-blue-600/15 text-blue-400 group-hover:bg-blue-600/25'}`}>
            {allPassed ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors truncate">
              {problem.title}
            </p>
          </div>
          {allPassed ? (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Solved
            </span>
          ) : (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${diffCls}`}>
              {problem.difficulty}
            </span>
          )}
          <svg className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border overflow-hidden relative ${allPassed ? 'border-emerald-500/25' : 'border-slate-700/30'}`}>
      {showCompletion && (
        <div className="absolute inset-0 z-10 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in zoom-in duration-500">
          <div className="flex flex-col items-center gap-3 text-center px-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center animate-bounce">
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold text-white">Problem Solved</p>
              <p className="text-sm text-slate-400 mt-1">Great job!</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-5 py-3 bg-slate-800/40 border-b border-slate-700/30">
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${diffCls}`}>
            {problem.difficulty}
          </span>
          <h3 className="text-sm font-semibold text-white">{problem.title}</h3>
          {allPassed && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Solved
            </span>
          )}
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-slate-500 hover:text-slate-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex border-b border-slate-700/30 bg-slate-900/40">
        {(['description', 'hints'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-medium capitalize transition-all ${
              tab === t ? 'text-blue-300 border-b-2 border-blue-500' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="bg-slate-900/30">
        {tab === 'description' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="p-5 border-r border-slate-700/30 space-y-4">
              <div 
                className="prose prose-invert prose-sm max-w-none" 
                style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                onCopy={(e) => e.preventDefault()}
              >
                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">{problem.description}</p>
              </div>

              {allPassed && (
                <div className="mt-6 p-4 rounded-xl bg-slate-800/40 border border-slate-700/30">
                  <p className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Similar Problems to Try (Optional)
                  </p>
                  <ul className="space-y-2">
                    <li className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer transition-colors border-b border-slate-700/50 pb-1.5 last:border-0 last:pb-0">
                      → {problem.title.replace('Basic ', 'Advanced ').replace('Simple ', 'Complex ')} Challenge
                    </li>
                    <li className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer transition-colors">
                      → {problem.title} using built-in functions
                    </li>
                  </ul>
                </div>
              )}

              {totalCount > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Test Cases ({totalCount})</p>
                  {problem.testCases.map((tc, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="w-4 h-4 rounded-full bg-slate-700/50 flex items-center justify-center text-[9px] text-slate-500 font-bold">
                        {i + 1}
                      </span>
                      <span>{tc.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 space-y-4">
              <CodeEditor
                key={problem.id}
                initialCode={savedCode ?? problem.starterCode}
                language="python"
                height="240px"
                showSaveButton
                showSubmitButton
                onSave={handleSave}
                onRun={handleRun}
                onSubmit={handleSubmit}
              />

              {/* Run output — shown only when Run is clicked (no test cases) */}
              {runOutput !== null && !testResults && (
                <div className="p-3 rounded-xl border border-slate-700/30 bg-slate-900/50">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Console Output</p>
                  {runError ? (
                    <pre className="text-sm text-red-300 font-mono whitespace-pre-wrap">{runError}</pre>
                  ) : (
                    <pre className="text-sm text-green-300 font-mono whitespace-pre-wrap">{runOutput}</pre>
                  )}
                </div>
              )}

              {/* Run error — shown separately when there's an error on Run */}
              {runError !== null && !testResults && runOutput === null && (
                <div className="p-3 rounded-xl border border-red-700/30 bg-red-900/10">
                  <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-2">Error</p>
                  <pre className="text-sm text-red-300 font-mono whitespace-pre-wrap">{runError}</pre>
                </div>
              )}

              {/* Submission results — shown only after Submit */}
              {testResults && (
                <div className="space-y-3">
                  {testResults.every(r => r.passed) ? (
                    <div className="p-3 rounded-xl border border-emerald-700/30 bg-emerald-900/15 text-center">
                      <p className="text-sm font-semibold text-emerald-400">All tests passed!</p>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl border border-amber-700/30 bg-amber-900/15 text-center">
                      <p className="text-sm font-semibold text-amber-400">Passed: {passedCount}/{totalCount}</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Submission Result</p>
                    {testResults.map((r, i) => (
                      <div key={i} className={`p-3 rounded-xl border text-xs ${
                        r.passed ? 'border-emerald-700/30 bg-emerald-900/10' : 'border-red-700/30 bg-red-900/10'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={r.passed ? 'text-emerald-400' : 'text-red-400'}>
                            {r.passed ? (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </span>
                          <span className="text-slate-300 font-medium">{r.label}</span>
                        </div>

                        {!r.passed && (
                          <div className="ml-5 space-y-2">
                            {/* Line-by-line diff */}
                            {r.diffLines && (
                              <div className="space-y-0.5 font-mono text-[10px]">
                                <div className="text-slate-500 mb-1 text-[9px] uppercase tracking-wider">Line-by-line comparison:</div>
                                {r.diffLines.filter(d => !d.match).length > 0 && (
                                  <>
                                    <div className="text-green-400">Expected Output:</div>
                                    {r.diffLines.map((d) => (
                                      <div key={d.line} className={`${d.match ? 'text-slate-600' : 'text-green-400 bg-green-900/10 px-1 -mx-1 rounded'}`}>
                                        {d.expected || ' '}
                                      </div>
                                    ))}
                                    <div className="text-red-400 mt-2">Actual Output:</div>
                                    {r.diffLines.map((d) => (
                                      <div key={d.line} className={`${d.match ? 'text-slate-600' : 'text-red-400 bg-red-900/10 px-1 -mx-1 rounded'}`}>
                                        {d.actual || ' '}
                                      </div>
                                    ))}
                                  </>
                                )}
                              </div>
                            )}

                            {/* Explanation */}
                            {r.diffLines && r.diffLines.some(d => !d.match && d.explanation) && (
                              <div className="mt-2 p-2 rounded-lg bg-blue-900/20 border border-blue-700/30">
                                <p className="text-[10px] text-blue-400 font-medium">
                                  {r.diffLines.find(d => d.explanation)?.explanation ?? 'Output must match exactly.'}
                                </p>
                              </div>
                            )}

                            {/* Fallback raw display */}
                            {(!r.diffLines || r.diffLines.filter(d => !d.match).length === 0) && (
                              <div className="space-y-1 font-mono text-[10px]">
                                <div className="flex gap-2">
                                  <span className="text-slate-500 shrink-0">Expected:</span>
                                  <span className="text-emerald-400 whitespace-pre-wrap" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>{r.expected || '(empty)'}</span>
                                </div>
                                <div className="flex gap-2">
                                  <span className="text-slate-500 shrink-0">Actual:</span>
                                  <span className="text-red-400 whitespace-pre-wrap">{r.actual || '(empty)'}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-3">
            <div className="rounded-xl border border-blue-700/30 bg-blue-900/10 p-4">
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">Hints</p>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {problem.solution
                  ? splitHints(problem.solution)
                  : 'Try breaking the problem into smaller steps. Think about what each line of code needs to do.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function splitHints(solution: string): string {
  const lines = solution.split('\n').filter(l => l.trim());
  if (lines.length <= 2) return 'Think about what each part of your solution needs to accomplish.';
  return `• Start by thinking about what input you need\n• Then process it step by step\n• Make sure your output matches the expected format`;
}
