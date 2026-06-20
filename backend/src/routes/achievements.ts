import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { sendNotification } from "../services/notificationService.js";

const router = Router();

const ACHIEVEMENT_NAMES: Record<string, string> = {
  first_step: "First Steps",
  pythonista: "Pythonista",
  streak_star: "Streak Star",
  master: "Master Hacker",
  speed_runner: "Speed Runner",
};

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

    const name = ACHIEVEMENT_NAMES[achievementId] || achievementId;
    await sendNotification(
      userId,
      "achievement",
      `🏆 Achievement Unlocked: ${name}`,
      `Congratulations! You've earned the "${name}" achievement!`,
      "/profile"
    );

    res.json({ achievement: achievement.achievementId });
  } catch (error) {
    next(error);
  }
});

export default router;
