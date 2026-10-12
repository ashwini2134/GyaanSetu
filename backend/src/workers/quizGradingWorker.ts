import { certificateQueue } from '../lib/queue.js';
import { prisma } from "../prisma.js";

export async function processQuizGrading(job: any) {
  const { studentId, lectureId, submissionAnswers } = job.data;
  console.log(`[QuizGradingWorker] Processing quiz ${lectureId} for student ${studentId}`);

  // Fetch quiz and questions
  const quiz = await prisma.quiz.findUnique({
    where: { id: lectureId },
    include: { questions: true }
  });

  if (!quiz) throw new Error("Quiz not found");

  let correctCount = 0;
  const total = quiz.questions.length;

  for (const question of quiz.questions) {
    const studentAnswer = submissionAnswers[question.id];
    // Exact match for now
    if (studentAnswer === question.correctAnswer) {
      correctCount++;
    }
  }

  const score = (correctCount / total) * 100;
  const passed = score >= quiz.passScore;

  // Save attempt
  await prisma.quizAttempt.create({
    data: {
      userId: studentId,
      lectureId,
      courseId: quiz.courseId,
      score,
      passed,
      answers: submissionAnswers,
    }
  });

  if (passed) {
    // Determine if course is fully complete to trigger certificate
    await certificateQueue.add('checkCertificate', { studentId, courseId: quiz.courseId });
  }

  console.log(`[QuizGradingWorker] Quiz graded. Score: ${score}%, Passed: ${passed}`);
}
