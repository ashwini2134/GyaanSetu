import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

router.get("/projects", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const userProjects = await prisma.project.findMany({
      where: { userId, status: "COMPLETED" },
      orderBy: { updatedAt: "desc" }
    });

    const templates = await prisma.projectTemplate.findMany({
      where: { id: { in: userProjects.map(p => p.projectId) } }
    });

    const templateMap = new Map(templates.map(t => [t.id, t]));

    const formattedProjects = userProjects.map(p => {
      const t = templateMap.get(p.projectId);
      return {
        id: p.id,
        projectId: p.projectId,
        name: t?.title || p.projectId,
        description: t?.shortDescription || "",
        submittedDescription: p.description,
        techStack: t?.technologies?.join(", ") || "Programming",
        status: p.status,
        githubUrl: p.githubUrl,
        liveDemoUrl: p.liveDemoUrl,
        completedAt: p.completedAt ? formatDate(p.completedAt) : null,
        createdAt: formatDate(p.updatedAt)
      };
    });

    res.json(formattedProjects);
  } catch (err) {
    next(err);
  }
});

router.get("/timeline", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const events: { date: string; rawDate: Date; type: string; title: string; description?: string; projectId?: string }[] = [];

    // 1. User joined event
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      events.push({
        rawDate: user.createdAt,
        date: formatDate(user.createdAt),
        type: "joined",
        title: "Joined GyanSetu"
      });
    }

    // 2. CourseProgress / Progress
    const progress = await prisma.progress.findMany({
      where: { userId, completedAt: { not: null } }
    });
    
    // We group progress by courseSlug if we only want "Completed [Course Name]"
    // Or we emit "Completed [Lecture]" for each lecture. The prompt says:
    // each row = "Completed [Course Name]" event. In this schema, Progress is per lecture.
    // Let's emit an event per completed lecture to match "Completed Python Fundamentals"
    progress.forEach(p => {
      if (p.completedAt) {
        const title = `Completed ${p.courseSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Lecture ${p.lectureId}`;
        events.push({
          rawDate: p.completedAt,
          date: formatDate(p.completedAt),
          type: "course",
          title
        });
      }
    });

    // 3. Projects
    const projects = await prisma.project.findMany({
      where: { userId, status: "COMPLETED", completedAt: { not: null } }
    });
    
    if (projects.length > 0) {
      const templates = await prisma.projectTemplate.findMany({
        where: { id: { in: projects.map(p => p.projectId) } }
      });
      const templateMap = new Map(templates.map(t => [t.id, t]));
      
      projects.forEach(p => {
        if (p.completedAt) {
          const t = templateMap.get(p.projectId);
          const name = t?.title || p.projectId;
          events.push({
            rawDate: p.completedAt,
            date: formatDate(p.completedAt),
            type: "project",
            projectId: p.projectId,
            title: `Completed ${name} Project`
          });
        }
      });
    }

    // 4. QuizAttempt
    const quizzes = await prisma.quizAttempt.findMany({
      where: { userId, passed: true }
    });
    quizzes.forEach(q => {
      const quizName = (q.courseId || q.lectureId || 'Unknown Quiz').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      events.push({
        rawDate: q.createdAt,
        date: formatDate(q.createdAt),
        type: "quiz",
        title: `Passed ${quizName} Quiz`
      });
    });

    // Sort ascending by rawDate
    events.sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());

    const formattedEvents = events.map((e: any) => ({
      date: e.date,
      type: e.type,
      title: e.title,
      description: e.description,
      projectId: e.projectId
    }));

    res.json(formattedEvents);
  } catch (err) {
    next(err);
  }
});

export default router;
