import { runProjectReview } from '../services/aiReviewService.js';

export async function processProjectReview(job: any) {
  const { submissionId } = job.data;
  console.log(`[ProjectReviewWorker] Processing submission ${submissionId}`);
  
  if (!submissionId) {
    throw new Error('No submissionId provided in job data');
  }

  // The actual review logic is inside runProjectReview, which handles
  // DB status updates, AI requests, security checks, and gamification
  await runProjectReview(submissionId);
}
