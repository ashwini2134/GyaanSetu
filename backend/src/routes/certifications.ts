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

// Student: get their issued certificates
router.get('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const certs = await prisma.issuedCertificate.findMany({
      where: { userId: req.user!.id },
      orderBy: { issuedAt: 'desc' },
    });
    res.json({ certificates: certs });
  } catch (err) { next(err); }
});

// Student: check their eligibility for each course
router.get('/eligibility', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const results: Record<string, Awaited<ReturnType<typeof checkEligibility>>> = {};
    for (const courseSlug of Object.keys(COURSE_LECTURE_COUNTS)) {
      results[courseSlug] = await checkEligibility(userId, courseSlug);
    }
    res.json({ eligibility: results });
  } catch (err) { next(err); }
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
    const { userId, courseSlug } = req.body as { userId: string; courseSlug: string };
    if (!userId || !courseSlug) {
      res.status(400).json({ error: 'userId and courseSlug are required' });
      return;
    }
    const { certNumber } = await issueCertForStudent(req.user!.id, userId, courseSlug);
    res.json({ ok: true, certNumber });
  } catch (err: any) {
    res.status(400).json({ error: err.message ?? 'Failed to issue certificate' });
  }
});

export default router;
