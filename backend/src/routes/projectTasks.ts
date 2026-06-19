import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { awardXp } from "../services/gamificationService.js";

const router = Router();

/* GET /api/projects/tasks/:projectId — get all task statuses for a project */
router.get("/:projectId", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = req.params.projectId as string;

    const tasks = await prisma.projectTaskProgress.findMany({
      where: { userId, projectId },
    });

    const statusMap = tasks.reduce((acc, t) => {
      acc[t.taskId] = {
        status: t.status,
        completedAt: t.completedAt?.toISOString(),
      };
      return acc;
    }, {} as Record<string, { status: string; completedAt?: string }>);

    res.json(statusMap);
  } catch (err) {
    next(err);
  }
});

/* PATCH /api/projects/tasks/:projectId/:taskId/start — start a task */
router.patch("/:projectId/:taskId/start", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = req.params.projectId as string;
    const taskId = req.params.taskId as string;

    const taskProgress = await prisma.projectTaskProgress.upsert({
      where: {
        userId_projectId_taskId: { userId, projectId, taskId },
      },
      update: {
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
      create: {
        userId,
        projectId,
        taskId,
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
    });

    res.json(taskProgress);
  } catch (err) {
    next(err);
  }
});

/* PATCH /api/projects/tasks/:projectId/:taskId/complete — complete a task */
router.patch("/:projectId/:taskId/complete", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = req.params.projectId as string;
    const taskId = req.params.taskId as string;

    const taskProgress = await prisma.projectTaskProgress.upsert({
      where: {
        userId_projectId_taskId: { userId, projectId, taskId },
      },
      update: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
      create: {
        userId,
        projectId,
        taskId,
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    await awardXp(userId, 25, `Task completed: ${taskId}`, `project_task_complete_${projectId}_${taskId}`);

    res.json(taskProgress);
  } catch (err) {
    next(err);
  }
});

export default router;
