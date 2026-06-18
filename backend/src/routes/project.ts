import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { z } from "zod";
import { awardXp } from "../services/gamificationService.js";

const router = Router();

const projectCompleteSchema = z.object({
  courseSlug: z.string(),
  lectureId: z.string(),
  projectId: z.string(),
});

router.post("/complete", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { courseSlug, lectureId, projectId } = projectCompleteSchema.parse(req.body);

    const progress = await prisma.progress.upsert({
      where: {
        userId_courseSlug_lectureId: {
          userId,
          courseSlug,
          lectureId,
        },
      },
      update: {
        projectCompleted: true,
        projectId: projectId,
        status: "COMPLETED",
        completedAt: new Date(),
      },
      create: {
        userId,
        courseSlug,
        lectureId,
        status: "COMPLETED",
        projectCompleted: true,
        projectId: projectId,
        completedAt: new Date(),
      },
    });

    await awardXp(userId, 100, "Completed Project", `project_complete_${courseSlug}_${projectId}`);

    res.json(progress);
  } catch (error) {
    next(error);
  }
});

router.get("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const templates = await prisma.projectTemplate.findMany();
    const userProjects = await prisma.project.findMany({ where: { userId } });
    
    const projectMap = new Map(userProjects.map(p => [p.projectId, p]));
    
    const result = templates.map(t => {
      const p = projectMap.get(t.id);
      return {
        ...t,
        status: p ? p.status : "NOT_STARTED",
        code: p?.code,
        startedAt: p?.startedAt,
        completedAt: p?.completedAt,
        githubUrl: p?.githubUrl,
        liveDemoUrl: p?.liveDemoUrl,
        submittedDescription: p?.description
      };
    });
    
    res.json(result);
  } catch(e) { next(e); }
});

router.get("/:projectId", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { projectId } = req.params;
    // ensure it's not matching 'status'
    if (projectId === "status") return next();

    const t = await prisma.projectTemplate.findUnique({ where: { id: projectId } });
    if (!t) return res.status(404).json({ error: "Not found" });
    const p = await prisma.project.findUnique({ where: { userId_projectId: { userId, projectId } } });
    res.json({
      ...t,
      status: p ? p.status : "NOT_STARTED",
      code: p?.code,
      startedAt: p?.startedAt,
      completedAt: p?.completedAt,
      githubUrl: p?.githubUrl,
      liveDemoUrl: p?.liveDemoUrl,
      submittedDescription: p?.description
    });
  } catch(e) { next(e); }
});

router.get("/status", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const projects = await prisma.project.findMany({
      where: { userId }
    });
    const statusMap = projects.reduce((acc, p) => {
      acc[p.projectId] = {
        status: p.status,
        githubUrl: p.githubUrl,
        liveDemoUrl: p.liveDemoUrl,
        description: p.description
      };
      return acc;
    }, {} as Record<string, any>);
    res.json(statusMap);
  } catch (err) {
    next(err);
  }
});

router.patch("/:projectId/start", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { projectId } = req.params;

    const project = await prisma.project.upsert({
      where: {
        userId_projectId: {
          userId,
          projectId
        }
      },
      update: {
        status: "IN_PROGRESS",
        startedAt: new Date()
      },
      create: {
        userId,
        projectId,
        code: "",
        status: "IN_PROGRESS",
        startedAt: new Date()
      }
    });

    res.json(project);
  } catch (err) {
    next(err);
  }
});

router.patch("/:projectId/complete", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { projectId } = req.params;

    const { code, githubUrl, liveDemoUrl, description } = req.body;

    const project = await prisma.project.upsert({
      where: {
        userId_projectId: {
          userId,
          projectId
        }
      },
      update: {
        status: "COMPLETED",
        code: code || "",
        githubUrl,
        liveDemoUrl,
        description,
        completedAt: new Date()
      },
      create: {
        userId,
        projectId,
        code: code || "",
        githubUrl,
        liveDemoUrl,
        description,
        status: "COMPLETED",
        completedAt: new Date()
      }
    });

    await awardXp(userId, 150, "Completed Project", `general_project_complete_${projectId}`);

    res.json(project);
  } catch (err) {
    next(err);
  }
});

export default router;
