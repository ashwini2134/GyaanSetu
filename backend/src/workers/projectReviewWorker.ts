// Fraylon - Phase 2.5 & 3
import { PrismaClient } from '@prisma/client';
import { notificationQueue, certificateQueue } from '../lib/queue.js';
import { updatePortfolio } from '../lib/portfolioUpdater.js';

import { prisma } from "../prisma.js";

export async function processProjectReview(job: any) {
  const { submissionId } = job.data;
  console.log(`[ProjectReviewWorker] Processing submission ${submissionId}`);

  const submission = await prisma.projectSubmission.findUnique({
    where: { id: submissionId }
  });

  if (!submission) throw new Error("Submission not found");

  // Mocking AI Review step
  console.log(`[ProjectReviewWorker] Calling Claude API (Mocked)...`);
  await new Promise(r => setTimeout(r, 1000));
  
  const mockAiReview = {
    score: 85,
    maxScore: 100,
    feedback: "Great job! Your code is clean and meets all requirements. A few minor improvements could be made in error handling.",
    passed: true,
    criteriaScores: [
      { criteria: "Code Quality", score: 18, maxScore: 20, comment: "Very good" },
      { criteria: "Functionality", score: 67, maxScore: 80, comment: "Works as expected" }
    ]
  };

  const status = mockAiReview.passed ? "APPROVED" : "REJECTED";

  await prisma.projectSubmission.update({
    where: { id: submissionId },
    data: {
      status,
      score: mockAiReview.score,
      feedback: mockAiReview.feedback,
      aiReview: mockAiReview as any,
      reviewedAt: new Date()
    }
  });

  await notificationQueue.add('projectResult', { submissionId, status });

  if (status === "APPROVED") {
    const project = await prisma.courseProject.findUnique({ where: { id: submission.projectId } });
    if (project) {
      await updatePortfolio(submission.studentId, 'projects', { projectId: project.id, title: project.title });
      await certificateQueue.add('checkCertificate', { studentId: submission.studentId, courseId: project.courseId });
    }
  }
}
