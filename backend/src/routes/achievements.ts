import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const achievements = await prisma.achievement.findMany({
      where: { userId },
      orderBy: { unlockedAt: "desc" }
    });

    res.json({
      achievements: achievements.map(a => a.achievementId)
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { achievementId } = req.body;

    // Use upsert to avoid unique constraint violations if triggered twice
    const achievement = await prisma.achievement.upsert({
      where: {
        userId_achievementId: {
          userId,
          achievementId
        }
      },
      update: {},
      create: {
        userId,
        achievementId
      }
    });

    res.json({ achievement: achievement.achievementId });
  } catch (error) {
    next(error);
  }
});

export default router;
