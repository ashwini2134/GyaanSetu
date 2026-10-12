import React, { useState, useEffect } from 'react';
import type { QuizQuestion } from '../../types/lesson';
import { submitQuiz, getQuizAttempts, QuizSubmissionResult, QuizAttemptsResponse } from '../../services/quizService';
import { CheckCircle2, XCircle, Clock, ArrowRight } from 'lucide-react';

interface QuizEngineProps {
  lectureId: string;
  courseId: string;
  questions: QuizQuestion[];
  onComplete?: (score: number, total: number) => void;
}

export default function QuizEngine({ lectureId, courseId, questions, onComplete }: QuizEngineProps) {
  const [phase, setPhase] = useState<'answering' | 'answered_correct' | 'answered_wrong'>('answering');
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  const [attemptsData, setAttemptsData] = useState<QuizAttemptsResponse | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeTaken, setTimeTaken] = useState(0);

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  useEffect(() => {
    getQuizAttempts(courseId, lectureId).then(data => {
      setAttemptsData(data);
    }).catch(console.error);
  }, [courseId, lectureId]);

  if (!questions.length) {
    return (
      <div className="p-6 rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-card)] text-center text-[var(--text-secondary)] shadow-sm">
        No quiz questions available.
      </div>
    );
  }

  const total = questions.length;
  const currentQ = questions[current];

  // Helper to determine the actual correct text
  const getCorrectAnswerText = (q: QuizQuestion | any) => {
    if (q.answer) return q.answer;
    if (typeof q.correct === 'number') return q.options[q.correct];
    if (typeof q.correct === 'string') {
      const idx = parseInt(q.correct, 10);
      if (!isNaN(idx)) return q.options[idx];
      // Maybe it was text?
      return q.correct;
    }
    return q.options[0]; // fallback
  };

  const correctAnswerText = getCorrectAnswerText(currentQ);

  const handleSelect = (opt: string) => {
    if (phase !== 'answering') return; // prevent changing answer after submission
    setSelected(opt);
    
    // Check correctness instantly
    const isCorrect = opt === correctAnswerText;
    setPhase(isCorrect ? 'answered_correct' : 'answered_wrong');
    setAnswers(prev => ({ ...prev, [current.toString()]: opt }));
  };

  const handleNext = async () => {
    if (current < total - 1) {
      setCurrent(c => c + 1);
      setSelected(null);
      setPhase('answering');
    } else {
      // Finished all questions
      const endTime = Date.now();
      const secondsTaken = startTime ? Math.floor((endTime - startTime) / 1000) : 0;
      setTimeTaken(secondsTaken);

      try {
        const gradingResult = await submitQuiz(lectureId, courseId, answers, questions, secondsTaken);
        onComplete?.(gradingResult.score, total);
      } catch (err: any) {
        console.error('Failed to grade quiz:', err);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const isAnswering = phase === 'answering';
  const showFeedback = phase === 'answered_correct' || phase === 'answered_wrong';

  return (
    <div className="rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-8 shadow-sm relative overflow-hidden flex flex-col min-h-[400px]">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-[var(--surface-page)]">
        <div 
          className="h-full bg-blue-500 transition-all duration-500 ease-out" 
          style={{ width: `${((current) / total) * 100}%` }} 
        />
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-[var(--brand-primary)] bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20 px-3 py-1.5 rounded-lg">
            Question {current + 1} of {total}
          </span>
          {attemptsData && attemptsData.totalAttempts > 0 && (
            <span className="text-xs font-medium text-[var(--text-secondary)] bg-[var(--surface-container)] px-2 py-1 rounded-md border border-[var(--border-medium)]">
              Attempt {attemptsData.totalAttempts + 1}
            </span>
          )}
        </div>
        
        {startTime && (
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] bg-[var(--surface-container)] px-3 py-1.5 rounded-lg border border-[var(--border-medium)]">
            <Clock className="w-4 h-4" />
            {/* The time taken shouldn't update live since it distracts, just record it */}
            <span>Time recording...</span>
          </div>
        )}
      </div>

      <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-8 leading-relaxed">{currentQ.question}</h3>

      <div className="space-y-3 flex-1">
        {currentQ.options.map((opt, i) => {
          const isSelected = selected === opt;
          const isCorrectOption = opt === correctAnswerText;
          
          let btnClass = 'bg-[var(--surface-card)] border-[var(--border-medium)] text-[var(--text-secondary)] hover:bg-[var(--surface-card-hover)] hover:border-[var(--border-medium)]';
          let indicatorClass = 'border-[var(--border-medium)] group-hover:border-[var(--brand-primary)]';
          
          if (showFeedback) {
            // Grading visual states
            if (isCorrectOption) {
              btnClass = 'bg-green-500/10 border-green-500/50 text-[var(--success)] shadow-inner ring-1 ring-green-500/20';
              indicatorClass = 'border-green-500 bg-green-500 text-white';
            } else if (isSelected && !isCorrectOption) {
              btnClass = 'bg-red-500/10 border-red-500/50 text-red-700';
              indicatorClass = 'border-red-500 bg-red-500 text-white';
            } else {
              btnClass = 'bg-[var(--surface-container)] border-[var(--border-medium)] text-[var(--text-muted)] opacity-60';
              indicatorClass = 'border-[var(--border-medium)]';
            }
          } else if (isSelected) {
            btnClass = 'bg-[var(--brand-primary)]/20 border-[var(--brand-primary)]/50 text-[var(--text-primary)] shadow-inner';
            indicatorClass = 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/20';
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(opt)}
              disabled={!isAnswering}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center justify-between group ${btnClass}`}
            >
              <span className="pr-4 text-[15px]">{opt}</span>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${indicatorClass}`}>
                {showFeedback && isCorrectOption && <CheckCircle2 className="w-4 h-4 text-white" />}
                {showFeedback && isSelected && !isCorrectOption && <XCircle className="w-4 h-4 text-white" />}
                {!showFeedback && isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Immediate Feedback Panel */}
      <div className={`mt-8 transition-all duration-500 ease-in-out overflow-hidden ${showFeedback ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className={`p-6 rounded-xl border ${phase === 'answered_correct' ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
          <div className="flex gap-4">
            <div className={`mt-0.5 ${phase === 'answered_correct' ? 'text-green-400' : 'text-red-400'}`}>
              {phase === 'answered_correct' ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
            </div>
            <div>
              <h4 className={`text-lg font-bold mb-2 ${phase === 'answered_correct' ? 'text-green-400' : 'text-red-400'}`}>
                {phase === 'answered_correct' ? 'Correct!' : 'Not quite right.'}
              </h4>
              {phase === 'answered_wrong' && (
                <p className="text-[var(--text-secondary)] mb-3">
                  The correct answer is <span className="font-semibold text-[var(--text-primary)]">{correctAnswerText}</span>.
                </p>
              )}
              {currentQ.explanation && (
                <p className="text-[var(--text-secondary)] leading-relaxed text-[15px]">
                  {currentQ.explanation}
                </p>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 min-h-[44px] rounded-xl font-semibold text-white bg-[var(--button-primary-bg)] hover:bg-[var(--button-primary-hover)] transition-all shadow-md hover:-translate-y-0.5"
            >
              {current === total - 1 ? 'Finish Quiz' : 'Next Question'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
