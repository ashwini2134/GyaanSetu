import { PartyPopper, Book } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { QuizQuestion } from '../../types/lesson';

interface QuizEngineProps {
  quizId?: string;
  questions: QuizQuestion[];
  onComplete?: (score: number, total: number) => void;
}

type Phase = 'start' | 'question' | 'result';

interface AttemptRecord {
  id: string;
  timestamp: number;
  score: number;
  total: number;
  details: { qNum: number; passed: boolean; userAns: string }[];
}

export default function QuizEngine({ quizId = 'default', questions, onComplete }: QuizEngineProps) {
  const [phase, setPhase] = useState<Phase>('start');
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>(questions);
  const [history, setHistory] = useState<AttemptRecord[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`lms:quiz_history:${quizId}`);
      if (saved) setHistory(JSON.parse(saved));
    } catch {}
  }, [quizId]);

  if (!questions.length) {
    return (
      <div className="p-6 rounded-2xl border border-slate-700/30 bg-slate-800/30 text-center text-slate-400">
        No quiz questions available.
      </div>
    );
  }

  const total = activeQuestions.length;
  const score = Object.entries(answers).filter(([i, a]) => a === activeQuestions[Number(i)].answer).length;

  const handleSelect = (opt: string) => {
    if (submitted) return;
    setSelected(opt);
  };

  const handleSubmit = () => {
    if (!selected) return;
    setAnswers(prev => ({ ...prev, [current]: selected }));
    setSubmitted(true);
  };

  const handleNext = () => {
    if (current < total - 1) {
      setCurrent(c => c + 1);
      setSelected(null);
      setSubmitted(false);
    } else {
      const finalScore = Object.entries({ ...answers, [current]: selected! })
        .filter(([i, a]) => a === activeQuestions[Number(i)].answer).length;
      
      const details = activeQuestions.map((q, i) => {
        const userAns = i === current ? selected! : (answers[i] ?? '');
        return { qNum: i + 1, passed: userAns === q.answer, userAns };
      });
      
      const newAttempt: AttemptRecord = {
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
        score: finalScore,
        total,
        details
      };
      
      const updatedHistory = [...history, newAttempt];
      setHistory(updatedHistory);
      try {
        localStorage.setItem(`lms:quiz_history:${quizId}`, JSON.stringify(updatedHistory));
      } catch {}

      onComplete?.(finalScore, total);
      setPhase('result');
    }
  };

  const handleRestart = () => {
    setCurrent(0);
    setSelected(null);
    setAnswers({});
    setSubmitted(false);
    
    // Jumble questions
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setActiveQuestions(shuffled);
    
    setPhase('question');
  };

  if (phase === 'start') {
    return (
      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 to-slate-800/40 p-6 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-600/20 flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-lg font-bold text-white">Ready for the Quiz?</p>
          <p className="text-sm text-slate-400 mt-1">{total} questions · Functions &amp; Variables</p>
        </div>
        <button
          onClick={() => setPhase('question')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-600/20 transition-all"
        >
          Start Quiz
        </button>
      </div>
    );
  }

  if (phase === 'result') {
    const pct = Math.round((score / total) * 100);
    const passed = pct >= 70;
    return (
      <div className={`rounded-2xl border p-6 text-center space-y-5 ${passed ? 'border-green-500/25 bg-gradient-to-br from-green-600/10 to-slate-800/40' : 'border-orange-500/25 bg-gradient-to-br from-orange-600/10 to-slate-800/40'}`}>
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${passed ? 'bg-green-600/20' : 'bg-orange-600/20'}`}>
          <span className="text-3xl">{passed ? <PartyPopper size={32} className="text-green-400" /> : <Book size={32} className="text-orange-400" />}</span>
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{pct}%</p>
          <p className={`text-sm font-medium mt-1 ${passed ? 'text-green-300' : 'text-orange-300'}`}>
            {passed ? 'Great job!' : 'Keep studying!'}
          </p>
          <p className="text-sm text-slate-400 mt-1">{score} of {total} correct</p>
        </div>

        {/* Review answers */}
        <div className="space-y-3 text-left">
          {activeQuestions.map((q, i) => {
            const userAns = answers[i] ?? '';
            const correct = userAns === q.answer;
            return (
              <div key={i} className={`p-4 rounded-xl border ${correct ? 'border-green-700/30 bg-green-900/10' : 'border-red-700/30 bg-red-900/10'}`}>
                <p className="text-xs font-semibold text-slate-400 mb-1">Q{i + 1}</p>
                <p className="text-sm text-slate-200 mb-2 whitespace-pre-line">{q.question}</p>
                <p className={`text-xs font-medium ${correct ? 'text-green-400' : 'text-red-400'}`}>
                  Your answer: {userAns || '(skipped)'}
                </p>
                {!correct && <p className="text-xs text-green-400">Correct: {q.answer}</p>}
                {q.explanation && <p className="text-xs text-slate-400 mt-1">{q.explanation}</p>}
              </div>
            );
          })}
        </div>

        {/* Attempt History */}
        {history.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-700/30 text-left">
            <h4 className="text-sm font-bold text-white mb-4">Attempt History</h4>
            <div className="space-y-6">
              {history.map((att, i) => (
                <div key={att.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/40">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-slate-200">Attempt {i + 1} <span className="ml-2 text-xs font-normal text-slate-400">({att.score}/{att.total})</span></span>
                    <span className="text-xs text-slate-500">{new Date(att.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-700/50 text-slate-400">
                          <th className="pb-2 font-semibold">Question No.</th>
                          <th className="pb-2 font-semibold">Status</th>
                          <th className="pb-2 font-semibold">User's Answer</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {att.details.map((d, j) => (
                          <tr key={j} className="text-slate-300">
                            <td className="py-2">Q{d.qNum}</td>
                            <td className="py-2">
                              {d.passed ? (
                                <span className="inline-flex items-center gap-1 text-green-400">✅ Passed</span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-red-400">❌ Failed</span>
                              )}
                            </td>
                            <td className="py-2 whitespace-pre-wrap">{d.userAns || '(skipped)'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleRestart}
          className={`inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-3 rounded-xl transition-all ${
            passed ? 'bg-green-600 hover:bg-green-500' : 'bg-orange-600 hover:bg-orange-500'
          }`}
        >
          Retake Quiz
        </button>
      </div>
    );
  }

  const q = activeQuestions[current];
  const isCorrect = submitted && selected === q.answer;

  return (
    <div className="rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 space-y-5">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400">Question {current + 1} of {total}</span>
        <div className="flex gap-1">
          {activeQuestions.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all ${
              i < current
                ? (answers[i] === activeQuestions[i].answer ? 'bg-green-500' : 'bg-red-500')
                : i === current ? 'bg-blue-500 scale-125' : 'bg-slate-600'
            }`} />
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/30">
        <p className="text-sm font-medium text-white whitespace-pre-line leading-relaxed">{q.question}</p>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {q.options.map(opt => {
          let cls = 'border-slate-700/40 bg-slate-800/30 text-slate-300 hover:border-blue-500/40 hover:bg-blue-500/5';
          if (!submitted && selected === opt) cls = 'border-blue-500/60 bg-blue-600/15 text-white';
          if (submitted && opt === q.answer) cls = 'border-green-500/60 bg-green-600/15 text-green-300';
          if (submitted && selected === opt && opt !== q.answer) cls = 'border-red-500/60 bg-red-600/15 text-red-300';

          return (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              disabled={submitted}
              className={`w-full text-left p-4 rounded-xl border text-sm transition-all duration-150 disabled:cursor-default ${cls}`}
            >
              <span className="flex items-center gap-3">
                <span className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                  submitted && opt === q.answer ? 'border-green-500 bg-green-500/20' :
                  submitted && selected === opt && opt !== q.answer ? 'border-red-500 bg-red-500/20' :
                  selected === opt ? 'border-blue-500 bg-blue-500/20' : 'border-slate-600'
                }`}>
                  {submitted && opt === q.answer ? '✓' : submitted && selected === opt ? '✗' : ''}
                </span>
                {opt}
              </span>
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {submitted && (
        <div className={`p-3 rounded-xl ${isCorrect ? 'bg-green-900/20 border border-green-700/30' : 'bg-red-900/20 border border-red-700/30'}`}>
          <p className={`text-sm font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {isCorrect ? '✓ Correct!' : `✗ Incorrect. Correct answer: ${q.answer}`}
          </p>
          {q.explanation && <p className="text-xs text-slate-400 mt-1">{q.explanation}</p>}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-500">{current + 1} / {total}</span>
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={!selected}
            className="text-sm font-semibold text-white px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="text-sm font-semibold text-white px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 transition-all flex items-center gap-2"
          >
            {current < total - 1 ? 'Next Question' : 'See Results'}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
