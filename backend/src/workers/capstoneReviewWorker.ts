// Fraylon - Phase 2.5 & 3
import { PrismaClient } from '@prisma/client';
import { notificationQueue, certificateQueue } from '../lib/queue.js';
import { updatePortfolio } from '../lib/portfolioUpdater.js';

const prisma = new PrismaClient();

export async function processCapstoneReview(job: any) {
  const { submissionId } = job.data;
  console.log(`[CapstoneReviewWorker] Processing submission ${submissionId}`);

  const submission = await prisma.projectSubmission.findUnique({
    where: { id: submissionId }
  });

  if (!submission) throw new Error("Submission not found");

  // Mocking advanced Capstone Review
  console.log(`[CapstoneReviewWorker] Running security checks...`);
  await new Promise(r => setTimeout(r, 500));
  
  console.log(`[CapstoneReviewWorker] Running plagiarism checks...`);
  await new Promise(r => setTimeout(r, 500));
  
  console.log(`[CapstoneReviewWorker] Calling Claude API for complex review (Mocked)...`);
  await new Promise(r => setTimeout(r, 1000));
  
  const mockAiReview = {
    qualityScore: 92,
    functionalityScore: 90,
    structureScore: 95,
    plagiarismRisk: 'LOW',
    objectivesMet: true,
    overallPassed: true,
    detailedFeedback: "Exceptional capstone project. High structural integrity and completely fulfills the learning objectives.",
    suggestions: ["Consider adding more unit tests", "Optimize the database queries for larger datasets"]
  };

  const status = mockAiReview.overallPassed ? "APPROVED" : "REJECTED";

  await prisma.projectSubmission.update({
    where: { id: submissionId },
    data: {
      status,
      score: mockAiReview.qualityScore,
      feedback: mockAiReview.detailedFeedback,
      aiReview: mockAiReview as any,
      reviewedAt: new Date()
    }
  });

  await notificationQueue.add('capstoneResult', { submissionId, status });

  if (status === "APPROVED") {
    const project = await prisma.courseProject.findUnique({ where: { id: submission.projectId } });
    if (project) {
      await updatePortfolio(submission.studentId, 'projects', { projectId: project.id, title: project.title, isCapstone: true });
      await certificateQueue.add('checkCertificate', { studentId: submission.studentId, courseId: project.courseId });
    }
  }
}
