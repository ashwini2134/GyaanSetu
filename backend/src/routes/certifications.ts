import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../prisma.js';
import { COURSE_LECTURE_COUNTS } from './courses.js';
import { checkEligibility, issueCertForStudent } from '../services/certificationService.js';

const router = Router();

const isTestEnv = process.env.NODE_ENV === 'test';
const emailFilter = isTestEnv
  ? { NOT: [{ email: { endsWith: '@test.com' } }] }
  : { NOT: [{ email: { endsWith: '@test.com' } }, { email: { endsWith: '@example.com' } }] };

// Public: verify certificate authenticity by cert number
router.get('/verify/:certNumber', async (req, res, next) => {
  try {
    const { certNumber } = req.params;
    const cert = await prisma.issuedCertificate.findUnique({
      where: { certNumber },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    if (!cert) {
      res.status(404).json({ valid: false, error: 'Certificate not found' });
      return;
    }

    // Increment view count
    await prisma.issuedCertificate.update({
      where: { certNumber },
      data: { viewCount: { increment: 1 } }
    });

    const capstoneLectureId = String(COURSE_LECTURE_COUNTS[cert.courseSlug] - 1);
    const capstoneProgress = await prisma.progress.findFirst({
      where: {
        userId: cert.userId,
        courseSlug: cert.courseSlug,
        lectureId: capstoneLectureId,
        projectCompleted: true,
      },
      select: { projectId: true },
    });

    const CAPSTONE_PROJECT_NAMES: Record<string, string> = {
      student_management: 'Student Management System',
      expense_tracker: 'Expense Tracker',
      quiz_app: 'Quiz Application',
      todo_list: 'To-Do List',
    };

    const capstoneTitle = capstoneProgress?.projectId
      ? (CAPSTONE_PROJECT_NAMES[capstoneProgress.projectId] ?? capstoneProgress.projectId)
      : null;

    res.json({
      valid: true,
      certNumber: cert.certNumber,
      recipientName: cert.user.name,
      courseSlug: cert.courseSlug,
      issuedAt: cert.issuedAt.toISOString(),
      avgScore: cert.avgScore,
      capstoneTitle,
      templateId: cert.templateId,
      viewCount: cert.viewCount,
      shareCount: cert.shareCount,
    });
  } catch (err) { next(err); }
});

// Student: get their issued certificates
router.get('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const certs = await prisma.issuedCertificate.findMany({
      where: { userId: req.user!.id },
      orderBy: { issuedAt: 'desc' },
    });

    const CAPSTONE_PROJECT_NAMES: Record<string, string> = {
      student_management: 'Student Management System',
      expense_tracker: 'Expense Tracker',
      quiz_app: 'Quiz Application',
      todo_list: 'To-Do List',
    };

    const enrichedCerts = await Promise.all(certs.map(async cert => {
      const capstoneLectureId = String(COURSE_LECTURE_COUNTS[cert.courseSlug] - 1);
      const capstoneProgress = await prisma.progress.findFirst({
        where: {
          userId: cert.userId,
          courseSlug: cert.courseSlug,
          lectureId: capstoneLectureId,
          projectCompleted: true,
        },
        select: { projectId: true },
      });
      const capstoneTitle = capstoneProgress?.projectId
        ? (CAPSTONE_PROJECT_NAMES[capstoneProgress.projectId] ?? capstoneProgress.projectId)
        : null;
      return {
        ...cert,
        capstoneTitle,
        templateId: cert.templateId,
        viewCount: cert.viewCount,
        shareCount: cert.shareCount,
      };
    }));

    res.json({ certificates: enrichedCerts });
  } catch (err) { next(err); }
});

// Student: check their eligibility for each course
router.get('/eligibility', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const results: Record<string, Awaited<ReturnType<typeof checkEligibility>>> = {};
    
    for (const courseSlug of Object.keys(COURSE_LECTURE_COUNTS)) {
      try {
        results[courseSlug] = await checkEligibility(userId, courseSlug);
      } catch (err: any) {
        console.error(`Error checking eligibility for ${courseSlug}:`, err);
        results[courseSlug] = {
          eligible: false,
          alreadyIssued: false,
          conditions: {
            lecturesCompleted: { done: 0, required: COURSE_LECTURE_COUNTS[courseSlug], passed: false },
            practiceCompleted: { done: 0, required: COURSE_LECTURE_COUNTS[courseSlug], passed: false },
            quizzesAttempted: { done: 0, required: COURSE_LECTURE_COUNTS[courseSlug], passed: false },
            problemsSubmitted: { done: 0, required: 0, passed: true },
            projectCompleted: { done: 0, passed: false }
          },
          avgQuizScore: null
        };
      }
    }
    res.json({ eligibility: results });
  } catch (err) {
    console.error('Error in eligibility endpoint:', err);
    next(err);
  }
});

// Admin: list all students eligible for each course (not yet issued)
router.get('/admin/eligible', requireAuth, requireRole('admin'), async (_req, res, next) => {
  try {
    const students = await prisma.user.findMany({
      where: {
        role: 'student',
        ...emailFilter
      },
      select: { id: true, name: true, email: true },
    });

    const report: {
      userId: string; name: string; email: string;
      courseSlug: string; avgQuizScore: number | null; conditions: object;
    }[] = [];

    for (const student of students) {
      for (const courseSlug of Object.keys(COURSE_LECTURE_COUNTS)) {
        const result = await checkEligibility(student.id, courseSlug);
        if (result.eligible && !result.alreadyIssued) {
          report.push({
            userId: student.id,
            name: student.name,
            email: student.email,
            courseSlug,
            avgQuizScore: result.avgQuizScore,
            conditions: result.conditions,
          });
        }
      }
    }

    res.json({ eligible: report });
  } catch (err) { next(err); }
});

// Admin: issue a certificate for a specific student + course
router.post('/admin/issue', requireAuth, requireRole('admin'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { userId, courseSlug, templateId } = req.body as { userId: string; courseSlug: string; templateId?: string };
    if (!userId || !courseSlug) {
      res.status(400).json({ error: 'userId and courseSlug are required' });
      return;
    }
    const { certNumber } = await issueCertForStudent(req.user!.id, userId, courseSlug, templateId);
    res.json({ ok: true, certNumber });
  } catch (err: any) {
    res.status(400).json({ error: err.message ?? 'Failed to issue certificate' });
  }
});

// Student: share certificate to LinkedIn (increments share count)
router.post('/:certNumber/share', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { certNumber } = req.params;
    const cert = await prisma.issuedCertificate.findUnique({
      where: { certNumber }
    });

    if (!cert) {
      res.status(404).json({ error: 'Certificate not found' });
      return;
    }

    if (cert.userId !== req.user!.id) {
      res.status(403).json({ error: 'You can only share your own certificates' });
      return;
    }

    await prisma.issuedCertificate.update({
      where: { certNumber },
      data: { shareCount: { increment: 1 } }
    });

    // Generate LinkedIn share URL
    const courseName = cert.courseSlug === 'python' ? 'CS50P: Introduction to Python' : 
                     cert.courseSlug === 'cs50ai' ? 'CS50 AI with Python' : cert.courseSlug;
    const certUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/#/verify/${certNumber}`;
    const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(courseName)}&organizationId=0&issueYear=${new Date(cert.issuedAt).getFullYear()}&certUrl=${encodeURIComponent(certUrl)}`;

    res.json({ linkedInUrl, certUrl });
  } catch (err) {
    next(err);
  }
});

// Student: update certificate template preference
router.patch('/:certNumber/template', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { certNumber } = req.params;
    const { templateId } = req.body as { templateId: string };

    const cert = await prisma.issuedCertificate.findUnique({
      where: { certNumber }
    });

    if (!cert) {
      res.status(404).json({ error: 'Certificate not found' });
      return;
    }

    if (cert.userId !== req.user!.id) {
      res.status(403).json({ error: 'You can only update your own certificates' });
      return;
    }

    const updated = await prisma.issuedCertificate.update({
      where: { certNumber },
      data: { templateId }
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Generate digital badge for a certificate
router.get('/:certNumber/badge', async (req, res, next) => {
  try {
    const { certNumber } = req.params;
    const cert = await prisma.issuedCertificate.findUnique({
      where: { certNumber },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });

    if (!cert) {
      res.status(404).json({ error: 'Certificate not found' });
      return;
    }

    const courseName = cert.courseSlug === 'python' ? 'Python Fundamentals' : 
                     cert.courseSlug === 'cs50ai' ? 'AI Foundations' : cert.courseSlug;
    
    // Generate SVG badge
    const badgeSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <linearGradient id="badge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6" />
      <stop offset="100%" stop-color="#8B5CF6" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- Background circle -->
  <circle cx="200" cy="200" r="180" fill="url(#badge-grad)" filter="url(#shadow)" />
  
  <!-- Inner circle -->
  <circle cx="200" cy="200" r="160" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2" />
  
  <!-- Award icon -->
  <circle cx="200" cy="160" r="50" fill="rgba(255,255,255,0.2)" />
  <path d="M 200 120 L 215 150 L 250 155 L 225 180 L 230 215 L 200 200 L 170 215 L 175 180 L 150 155 L 185 150 Z" 
        fill="#FBBF24" stroke="#F59E0B" stroke-width="2" />
  
  <!-- Text -->
  <text x="200" y="260" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="white">
    ${courseName}
  </text>
  <text x="200" y="285" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="rgba(255,255,255,0.8)">
    Certificate
  </text>
  <text x="200" y="310" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="rgba(255,255,255,0.6)">
    Fraylon Academy
  </text>
</svg>`.trim();

    // Set content type and send SVG
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Content-Disposition', `attachment; filename="badge-${certNumber}.svg"`);
    res.send(badgeSvg);
  } catch (err) {
    next(err);
  }
});

export default router;
