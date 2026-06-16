import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

import { awardXp } from "../services/gamificationService.js";

router.get("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { currentStreak: true, longestStreak: true, lastActiveAt: true }
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastLoginDate: user.lastActiveAt
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    // Trigger Gamification Service to evaluate streak and award Daily Login XP
    await awardXp(userId, 5, "Daily Login", `daily_login_${todayStr}`);

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

export default router;
