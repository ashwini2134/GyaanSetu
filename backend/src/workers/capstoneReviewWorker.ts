import { runProjectReview } from '../services/aiReviewService.js';
import { updatePortfolio } from '../lib/portfolioUpdater.js';
import { certificateQueue } from '../lib/queue.js';
import { prisma } from '../prisma.js';

export async function processCapstoneReview(job: any) {
  const { submissionId } = job.data;
  console.log(`[CapstoneReviewWorker] Processing capstone submission ${submissionId}`);

  // Run the full real review pipeline (security → validation → AI review → approve/reject)
  // aiReviewService handles DB status updates and base notifications internally.
  await runProjectReview(submissionId);

  // After the review pipeline, read the final status to apply capstone-specific post-processing
  const submission = await prisma.projectSubmission.findUnique({
    where: { id: submissionId },
    select: {
      status: true,
      userId: true,
      courseId: true,
      projectId: true,
      score: true,
      feedback: true,
    },
  });

  if (!submission) return;

  if (submission.status === 'APPROVED') {
    // Look up the CourseProject to get the capstone title
    const courseProject = submission.courseId
      ? await prisma.courseProject.findFirst({
          where: { courseId: submission.courseId, isCapstone: true },
          select: { title: true, courseId: true },
        })
      : null;

    // Mark portfolio entry with isCapstone: true (distinct from regular project entries)
    await updatePortfolio(submission.userId, 'projects', {
      projectId: submission.projectId,
      title: courseProject?.title ?? 'Capstone Project',
      isCapstone: true,
      completedAt: new Date().toISOString(),
    });

    // Trigger certificate — capstone completion is the final gate
    if (courseProject?.courseId) {
      await certificateQueue.add('checkCertificate', {
        studentId: submission.userId,
        courseId: courseProject.courseId,
      });
    }

    // aiReviewService.ts already sent the "Capstone Approved" notification
    // for this event (runProjectReview, above) — no second notification here.
    console.log(`[CapstoneReviewWorker] Capstone ${submissionId} approved — certificate check queued`);
  } else {
    console.log(`[CapstoneReviewWorker] Capstone ${submissionId} → ${submission.status}`);
  }
}
