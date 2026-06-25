// Fraylon - Phase 2.5 & 3
import { PrismaClient } from '@prisma/client';
import { certificateQueue } from '../lib/queue.js';

import { prisma } from "../prisma.js";

export async function processQuizGrading(job: any) {
  const { studentId, quizId, submissionAnswers } = job.data;
  console.log(`[QuizGradingWorker] Processing quiz ${quizId} for student ${studentId}`);

  // Fetch quiz and questions
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
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
      quizId,
      score,
      total,
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
