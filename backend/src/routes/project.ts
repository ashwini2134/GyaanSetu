import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { z } from "zod";

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

    res.json(progress);
  } catch (error) {
    next(error);
  }
});

export default router;
