import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { COURSE_FULL_NAMES } from "../lib/courseNames.js";

const router = Router();

// Get resume data for a user
router.get("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const [user, courses, certificates, projects, submissions] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
          bio: true,
          githubUrl: true,
          linkedinUrl: true,
          portfolioUrl: true,
          createdAt: true,
        }
      }),
      prisma.progress.findMany({
        where: { userId, status: "COMPLETED" },
        select: { courseSlug: true, completedAt: true }
      }),
      prisma.issuedCertificate.findMany({
        where: { userId },
        select: { courseSlug: true, certNumber: true, issuedAt: true, avgScore: true }
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

    // Calculate skills based on completed courses and projects
    const skills = new Set<string>();
    courses.forEach(c => {
      if (c.courseSlug === 'python20') skills.add('Python');
      if (c.courseSlug === 'fundamentals-of-ai') skills.add('AI/ML');
    });
    projects.forEach(p => {
      const techMap: Record<string, string[]> = {
        'search_trace': ['Search Algorithms', 'BFS', 'DFS', 'A*', 'Heuristics'],
        'logic_puzzle': ['Propositional Logic', 'Inference', 'Model Checking'],
        'ml_classifier_intro': ['Machine Learning', 'NLP', 'TF-IDF', 'k-NN'],
        'csp_formulation': ['CSP', 'Backtracking', 'AC-3', 'Constraint Propagation']
      };
      (techMap[p.projectId] || []).forEach(s => skills.add(s));
    });

    const resumeData = {
      personal: {
        name: user?.name || '',
        email: user?.email || '',
        bio: user?.bio || '',
        github: user?.githubUrl || '',
        linkedin: user?.linkedinUrl || '',
        portfolio: user?.portfolioUrl || '',
        joinedDate: user?.createdAt || new Date()
      },
      education: courses.map(c => ({
        course: COURSE_FULL_NAMES[c.courseSlug] ?? c.courseSlug,
        completedAt: c.completedAt,
        certificate: certificates.find(cert => cert.courseSlug === c.courseSlug)?.certNumber
      })),
      certifications: certificates.map(c => ({
        name: c.courseSlug === 'python20' ? 'Python Fundamentals' :
              c.courseSlug === 'fundamentals-of-ai' ? 'AI Foundations' : c.courseSlug,
        issuedAt: c.issuedAt,
        certNumber: c.certNumber,
        avgScore: c.avgScore
      })),
      projects: projects.map(p => ({
        name: p.projectId,
        completedAt: p.completedAt,
        githubUrl: p.githubUrl,
        liveDemoUrl: p.liveDemoUrl
      })),
      skills: Array.from(skills),
      statistics: {
        coursesCompleted: courses.length,
        certificatesEarned: certificates.length,
        projectsCompleted: projects.length,
        problemsSolved: submissions.length
      }
    };

    res.json(resumeData);
  } catch (error) {
    next(error);
  }
});

export default router;
