import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { z } from "zod";

const router = Router();

const portfolioSchema = z.object({
  skills: z.array(z.string()).optional(),
  screenshots: z.array(z.object({
    projectId: z.string(),
    url: z.string(),
    caption: z.string().optional()
  })).optional(),
});

// Get user's portfolio
router.get("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    let portfolio = await prisma.studentPortfolio.findUnique({
      where: { studentId: userId }
    });

    if (!portfolio) {
      portfolio = await prisma.studentPortfolio.create({
        data: { studentId: userId }
      });
    }

    res.json(portfolio);
  } catch (error) {
    next(error);
  }
});

// Update user's portfolio
router.patch("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const body = portfolioSchema.parse(req.body);

    const portfolio = await prisma.studentPortfolio.upsert({
      where: { studentId: userId },
      update: {
        ...(body.skills && { skills: body.skills }),
        ...(body.screenshots && { screenshots: body.screenshots }),
      },
      create: {
        studentId: userId,
        ...(body.skills && { skills: body.skills }),
        ...(body.screenshots && { screenshots: body.screenshots }),
      }
    });

    res.json(portfolio);
  } catch (error) {
    next(error);
  }
});

// Auto-update portfolio with completed courses, certificates, and projects
router.post("/sync", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const [courses, certificates, projects, submissions] = await Promise.all([
      prisma.progress.findMany({
        where: { userId, status: "COMPLETED" },
        select: { courseSlug: true, lectureId: true, completedAt: true }
      }),
      prisma.issuedCertificate.findMany({
        where: { userId },
        select: { courseSlug: true, certNumber: true, issuedAt: true }
      }),
      prisma.project.findMany({
        where: { userId, status: "COMPLETED" },
        select: { projectId: true, completedAt: true, githubUrl: true, liveDemoUrl: true }
      }),
      prisma.submission.findMany({
        where: { userId, status: "PASSED" },
        select: { problemId: true, updatedAt: true }
      })
    ]);

    // Auto-generate skills based on completed courses and projects
    const skills = new Set<string>();
    courses.forEach(c => {
      if (c.courseSlug === 'python') skills.add('Python');
      if (c.courseSlug === 'cs50ai') skills.add('AI/ML');
    });
    projects.forEach(p => {
      const techMap: Record<string, string[]> = {
        'student_management': ['Python', 'SQLite', 'CLI', 'OOP'],
        'expense_tracker': ['Python', 'Data Analysis', 'Pandas', 'CSV'],
        'quiz_app': ['Python', 'Web Development', 'Flask', 'REST APIs'],
        'todo_list': ['Python', 'Data Structures', 'OOP', 'File I/O']
      };
      (techMap[p.projectId] || []).forEach(s => skills.add(s));
    });

    const portfolio = await prisma.studentPortfolio.upsert({
      where: { studentId: userId },
      update: {
        courses: courses as any,
        certificates: certificates as any,
        projects: projects as any,
        skills: Array.from(skills) as any,
      },
      create: {
        studentId: userId,
        courses: courses as any,
        certificates: certificates as any,
        projects: projects as any,
        skills: Array.from(skills) as any,
      }
    });

    res.json(portfolio);
  } catch (error) {
    next(error);
  }
});

export default router;
