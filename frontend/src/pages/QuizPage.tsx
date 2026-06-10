import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QuizEngine } from '../components/lesson';
import { useProgress } from '../hooks/useProgress';
import type { QuizQuestion } from '../types/lesson';

const BASE = import.meta.env.BASE_URL ?? '/';

export default function QuizPage() {
  const { slug, number } = useParams<{ slug: string; number: string }>();
  const navigate = useNavigate();
  const lectureNumber = Number(number ?? 0);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { progress, markQuizCompleted } = useProgress(slug, lectureNumber);

  useEffect(() => {
    const path = BASE.replace(/\/$/, '') + `/data/${slug}/lecture_${number}/quiz.json`;
    fetch(path)
      .then(r => {
        if (!r.ok) throw new Error('No quiz available for this lecture.');
        return r.json() as Promise<QuizQuestion[]>;
      })
      .then(data => { setQuestions(data); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [slug, number]);

  const courseTitle = slug === 'cs50p' ? 'CS50 Python' : slug === 'cs50ai' ? 'AI' : (slug ?? '').toUpperCase();

  return (
    <div className="min-h-screen bg-slate-900 p-6 md:p-10">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6">
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4">
          <button onClick={() => navigate('/')} className="text-blue-400 hover:text-blue-300 transition-colors">Dashboard</button>
          <span className="text-slate-600">/</span>
          <button onClick={() => navigate(`/course/${slug}`)} className="text-blue-400 hover:text-blue-300 transition-colors">{courseTitle}</button>
          <span className="text-slate-600">/</span>
          <button onClick={() => navigate(`/course/${slug}/lecture/${number}`)} className="text-blue-400 hover:text-blue-300 transition-colors">
            Lecture {number}
          </button>
          <span className="text-slate-600">/</span>
          <span className="text-white font-medium">Quiz</span>
        </nav>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Lecture {number} Quiz</h1>
          <button
            onClick={() => navigate(`/course/${slug}/lecture/${number}`)}
            className="text-sm text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/40 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Lecture
          </button>
        </div>

        {progress.quizCompleted && (
          <div className="mt-3 flex items-center gap-2 text-sm text-green-400 bg-green-900/20 border border-green-700/30 rounded-xl px-4 py-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Previously scored {progress.quizScore}/{questions.length}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="h-7 w-7 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-slate-700/30 bg-slate-800/30 p-8 text-center text-slate-400">
            {error}
          </div>
        ) : (
          <QuizEngine
            questions={questions}
            onComplete={(score) => {
              markQuizCompleted(score);
              setTimeout(() => navigate(`/course/${slug}/lecture/${number}`), 1500);
            }}
          />
        )}
      </div>
    </div>
  );
}
