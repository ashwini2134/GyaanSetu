import { useEffect, useState } from 'react';
import type { QuizQuestion } from '../../types/lesson';
import { getQuizAttempts } from '../../services/quizService';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

function getCorrectAnswerText(q: QuizQuestion | any): string {
  if (q.answer) return q.answer;
  if (typeof q.correct === 'number') return q.options[q.correct];
  if (typeof q.correct === 'string') {
    const idx = parseInt(q.correct, 10);
    if (!isNaN(idx)) return q.options[idx];
    return q.correct;
  }
  return q.options[0];
}

interface QuizReviewCardProps {
  courseId: string;
  lectureId: string;
  questions: QuizQuestion[];
}

export default function QuizReviewCard({ courseId, lectureId, questions }: QuizReviewCardProps) {
  const [answers, setAnswers] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getQuizAttempts(courseId, lectureId)
      .then((data: any) => {
        if (!mounted) return;
        setAnswers(data.attempts?.[0]?.answers ?? null);
      })
      .catch(() => { if (mounted) setAnswers(null); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [courseId, lectureId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-sm text-[var(--text-secondary)]">
        <Loader2 size={16} className="animate-spin" />
        Loading your answers...
      </div>
    );
  }

  if (!answers) {
    return null;
  }

  return (
    <div className="space-y-4">
      {questions.map((q, i) => {
        const correctText = getCorrectAnswerText(q);
        const yourAnswer = answers[String(i)] ?? '';
        const isCorrect = yourAnswer === correctText;

        return (
          <div key={i} className="rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 shrink-0 ${isCorrect ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                {isCorrect ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{i + 1}. {q.question}</p>
                <div className="mt-3 space-y-1.5">
                  {q.options.map((opt, oi) => {
                    const isYours = opt === yourAnswer;
                    const isRight = opt === correctText;
                    return (
                      <div
                        key={oi}
                        className={`text-xs px-3 py-2 rounded-lg border ${
                          isRight
                            ? 'bg-[var(--success)]/10 border-[var(--success)]/30 text-[var(--success)] font-medium'
                            : isYours
                            ? 'bg-[var(--danger)]/10 border-[var(--danger)]/30 text-[var(--danger)]'
                            : 'bg-[var(--surface-container)] border-[var(--border-light)] text-[var(--text-muted)]'
                        }`}
                      >
                        {opt}
                        {isYours && !isRight && <span className="ml-2 font-semibold">— your answer</span>}
                        {isRight && <span className="ml-2 font-semibold">— correct answer</span>}
                      </div>
                    );
                  })}
                </div>
                {!isCorrect && q.explanation && (
                  <p className="text-xs text-[var(--text-secondary)] mt-3 leading-relaxed">{q.explanation}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
