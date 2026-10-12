import { authFetch } from '../authClient';
import type { QuizQuestion } from '../types/lesson';

export interface QuizSubmissionResult {
  score: number;
  passed: boolean;
  attemptId: string;
  attemptNumber?: number;
  timeTaken?: number;
  feedback: {
    questionId: string;
    yourAnswer: string;
    correctAnswer: string;
    explanation: string;
  }[];
}

export interface QuizAttemptRecord {
  id: string;
  score: number;
  passed: boolean;
  attemptNumber: number;
  timeTaken: number | null;
  createdAt: string;
}

export interface QuizAttemptsResponse {
  attempts: QuizAttemptRecord[];
  bestScore: number;
  totalAttempts: number;
}

export async function submitQuiz(
  lectureId: string,
  courseId: string,
  answers: Record<string, string>,
  questions: QuizQuestion[],
  timeTaken: number
): Promise<QuizSubmissionResult> {
  const formattedQuestions = questions.map((q, index) => ({
    id: index.toString(),
    correctAnswer: q.answer, // mapped from QuizQuestion.answer
    explanation: q.explanation || "",
    points: q.points || 10
  }));

  const response = await authFetch<QuizSubmissionResult>('/quiz/submit', {
    method: 'POST',
    body: JSON.stringify({
      lectureId,
      courseId,
      answers,
      timeTaken,
      questions: formattedQuestions
    })
  });

  return response;
}

export async function getQuizAttempts(courseId: string, lectureId: string): Promise<QuizAttemptsResponse> {
  const response = await authFetch<QuizAttemptsResponse>(`/quiz/${courseId}/${lectureId}/attempts`);
  return response;
}
