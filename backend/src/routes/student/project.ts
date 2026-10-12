import { Router } from 'express';
import { prisma } from '../../prisma.js';
import { runProjectReview } from '../../services/aiReviewService.js';
import { requireAuth as authenticate } from '../../middleware/auth.js';
import { extractGithubUsername } from '../../lib/github.js';
import { sendNotification } from '../../services/notificationService.js';

const router = Router();

router.post('/:projectId/submit', authenticate, async (req: any, res: any) => {
  try {
    const rawProjectId = req.params.projectId;
    const { githubUrl, content, courseId } = req.body;
    const userId = req.user.id;

    if (!githubUrl && (!content || content.length < 10)) {
      return res.status(400).json({ error: 'A valid GitHub URL or project description is required.' });
    }

    // A submitted repo must belong to the student's own linked GitHub
    // profile — otherwise the AI review has no way to know who actually
    // wrote the code. Text-only submissions (no githubUrl) skip this check.
    if (githubUrl) {
      const profileUsername = extractGithubUsername(req.user.githubUrl);
      if (!profileUsername) {
        return res.status(400).json({
          error: 'Add your GitHub profile in Settings before submitting a project with a repo link — it\'s used to verify the submission is genuinely yours.',
          code: 'GITHUB_PROFILE_REQUIRED',
        });
      }

      const submissionUsername = extractGithubUsername(githubUrl);
      if (submissionUsername && submissionUsername !== profileUsername) {
        return res.status(400).json({
          error: `This repository doesn't belong to your linked GitHub profile (github.com/${profileUsername}). Update your profile or submit your own repo.`,
          code: 'GITHUB_OWNER_MISMATCH',
        });
      }
    }

    let userProject = await prisma.project.findUnique({
      where: { userId_projectId: { userId, projectId: rawProjectId } }
    });

    if (!userProject) {
      userProject = await prisma.project.create({
        data: { userId, projectId: rawProjectId, code: '', status: 'IN_PROGRESS' }
      });
    }

    const inFlight = await prisma.projectSubmission.findFirst({
      where: { userId, projectId: userProject.id, status: { in: ['PENDING', 'REVIEWING'] } }
    });
    if (inFlight) {
      return res.status(409).json({ error: 'You already have a submission in progress.' });
    }

    const allSubmissions = await prisma.projectSubmission.findMany({
      where: { userId, projectId: userProject.id }
    });

    const validAttempts = allSubmissions.filter((s: any) => {
      if (s.status === 'ERROR') return false;
      if (s.status === 'CANCELLED') return false;
      if (s.status === 'REJECTED' && s.feedback && (
        s.feedback.includes('Validation failed') ||
        s.feedback.includes('Security check failed') ||
        s.feedback.includes('parsing failed') ||
        s.feedback.includes('GitHub link doesn\'t appear to be valid')
      )) return false;
      return true;
    });

    if (validAttempts.length >= 3) {
      return res.status(403).json({ error: 'Maximum attempts (3) reached for this project.' });
    }

    const attemptNumber = validAttempts.length + 1;

    // Detect capstone: check if the course has a capstone CourseProject
    let isCapstone = false;
    if (courseId) {
      const courseProject = await prisma.courseProject.findFirst({
        where: { courseId, isCapstone: true },
        select: { id: true },
      });
      if (courseProject) isCapstone = true;
    }

    const submission = await prisma.projectSubmission.create({
      data: {
        userId,
        studentId: userId,
        projectId: userProject.id,
        courseId: courseId ?? null,
        githubUrl: githubUrl || '',
        content: content || '',
        status: 'PENDING',
        attemptNumber
      }
    });

    // Both the notification and the review kickoff are deferred to the same
    // tick, after the response — nothing extra runs before res.json() below,
    // so the in-flight duplicate-submission guard on the next request sees
    // exactly the same timing it always has.
    setImmediate(() => {
      sendNotification(
        userId,
        isCapstone ? 'capstone_submitted' : 'milestone_submitted',
        isCapstone ? 'Capstone Submitted' : 'Milestone Submitted',
        `Your submission for "${rawProjectId}" is now under review.`,
        courseId ? `/courses/${courseId}` : '/projects',
        'medium'
      ).catch((err: any) => console.error('[Submit] Notification failed:', err));

      runProjectReview(submission.id).catch((err: any) =>
        console.error('[Submit] Inline review failed:', err)
      );
    });

    return res.json({
      submissionId: submission.id,
      status: 'PENDING',
      message: isCapstone ? 'Capstone submitted. AI review running.' : 'Submitted. AI review running.',
      isCapstone
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/:projectId/submission', authenticate, async (req: any, res: any) => {
  const userProject = await prisma.project.findUnique({
    where: { userId_projectId: { userId: req.user.id, projectId: req.params.projectId } }
  });
  if (!userProject) return res.json({ status: 'NOT_SUBMITTED' });

  const submissions = await prisma.projectSubmission.findMany({
    where: { projectId: userProject.id, userId: req.user.id },
    orderBy: { createdAt: 'desc' }
  });
  const submission = submissions[0];
  if (!submission) return res.json({ status: 'NOT_SUBMITTED' });

  const validAttempts = submissions.filter((s: any) => {
    if (s.status === 'ERROR') return false;
    if (s.status === 'REJECTED' && s.feedback && (
      s.feedback.includes('Validation failed') ||
      s.feedback.includes('Security check failed') ||
      s.feedback.includes('parsing failed') ||
      s.feedback.includes('GitHub link doesn\'t appear to be valid')
    )) return false;
    return true;
  });

  return res.json({ ...submission, attemptsCount: validAttempts.length });
});

// POST /api/student/projects/:projectId/cancel
router.post('/:projectId/cancel', authenticate, async (req: any, res: any) => {
  try {
    const userProject = await prisma.project.findUnique({
      where: { userId_projectId: { userId: req.user.id, projectId: req.params.projectId } }
    });
    if (!userProject) {
      return res.status(404).json({ error: 'No submission found for this project.' });
    }

    const inFlight = await prisma.projectSubmission.findFirst({
      where: { projectId: userProject.id, userId: req.user.id, status: { in: ['PENDING', 'REVIEWING'] } }
    });
    if (!inFlight) {
      return res.status(404).json({ error: 'No pending submission to cancel.' });
    }

    await prisma.projectSubmission.update({
      where: { id: inFlight.id },
      data: { status: 'CANCELLED' }
    });

    return res.json({ message: 'Submission cancelled.', status: 'CANCELLED' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
