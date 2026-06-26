import { authFetch } from '../authClient';
import type { QuizQuestion } from '../types/lesson';

export interface QuizSubmissionResult {
  score: number;
  passed: boolean;
  attemptId: string;
  feedback: {
    questionId: string;
    yourAnswer: string;
    correctAnswer: string;
    explanation: string;
  }[];
}

export async function submitQuiz(
  lectureId: string,
  courseId: string,
  answers: Record<string, string>,
  questions: QuizQuestion[]
): Promise<QuizSubmissionResult> {
  const formattedQuestions = questions.map(q => ({
    id: q.id,
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
      questions: formattedQuestions
    })
  });

  return response;
}
