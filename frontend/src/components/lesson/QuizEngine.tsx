import { useState } from 'react';
import type { QuizQuestion } from '../../types/lesson';
import { submitQuiz, QuizSubmissionResult } from '../../services/quizService';
import { QuizResultModal } from '../QuizResultModal';
import { Loader2 } from 'lucide-react';

interface QuizEngineProps {
  lectureId: string;
  courseId: string;
  questions: QuizQuestion[];
  onComplete?: (score: number, total: number) => void;
}

export default function QuizEngine({ lectureId, courseId, questions, onComplete }: QuizEngineProps) {
  const [phase, setPhase] = useState<'start' | 'question' | 'grading' | 'result'>('start');
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizSubmissionResult | null>(null);

  if (!questions.length) {
    return (
      <div className="p-6 rounded-2xl border border-slate-700/30 bg-slate-800/30 text-center text-slate-400">
        No quiz questions available.
      </div>
    );
  }

  const total = questions.length;
  const currentQ = questions[current];

  const handleSelect = (opt: string) => {
    setSelected(opt);
  };

  const handleNext = async () => {
    if (!selected) return;
    
    const newAnswers = { ...answers, [currentQ.id]: selected };
    setAnswers(newAnswers);
    
    if (current < total - 1) {
      setCurrent(c => c + 1);
      setSelected(null);
    } else {
      // Last question - submit for grading
      setPhase('grading');
      try {
        const gradingResult = await submitQuiz(lectureId, courseId, newAnswers, questions);
        setResult(gradingResult);
        setPhase('result');
      } catch (err) {
        console.error('Failed to grade quiz:', err);
        // Fallback or error handling could go here
        setPhase('start');
      }
    }
  };

  const handleRestart = () => {
    setCurrent(0);
    setSelected(null);
    setAnswers({});
    setResult(null);
    setPhase('question');
  };

  const handleCloseResult = () => {
    if (result?.passed) {
      onComplete?.(result.score, total);
    }
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
          <p className="text-sm text-slate-400 mt-1">{total} questions to test your knowledge</p>
        </div>
        <button
          onClick={() => setPhase('question')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-white px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40"
        >
          Start Quiz
        </button>
      </div>
    );
  }

  if (phase === 'grading') {
    return (
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-12 text-center flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-lg font-medium text-slate-300">Grading your answers...</p>
      </div>
    );
  }

  if (phase === 'result' && result) {
    return (
      <QuizResultModal 
        result={result} 
        onClose={handleCloseResult} 
        onRetry={handleRestart} 
      />
    );
  }

  // Phase 'question'
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6 shadow-xl relative overflow-hidden">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
        <div 
          className="h-full bg-blue-500 transition-all duration-300" 
          style={{ width: `${((current) / total) * 100}%` }} 
        />
      </div>

      <div className="mb-6 flex items-center justify-between mt-2">
        <span className="text-sm font-semibold text-blue-400 bg-blue-900/20 px-3 py-1 rounded-full">
          Question {current + 1} of {total}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-slate-100 mb-6">{currentQ.question}</h3>

      <div className="space-y-3">
        {currentQ.options.map((opt, i) => {
          const isSelected = selected === opt;
          return (
            <button
              key={i}
              onClick={() => handleSelect(opt)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between group ${
                isSelected 
                  ? 'bg-blue-600/20 border-blue-500/50 text-white shadow-inner' 
                  : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <span className="pr-4">{opt}</span>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                isSelected ? 'border-blue-400 bg-blue-500/20' : 'border-slate-600 group-hover:border-slate-500'
              }`}>
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleNext}
          disabled={!selected}
          className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
            selected 
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 hover:-translate-y-0.5' 
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          {current === total - 1 ? 'Submit Answers' : 'Next Question'}
        </button>
      </div>
    </div>
  );
}
