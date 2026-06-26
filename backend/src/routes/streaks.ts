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

// Use streak freeze to protect streak for a day
router.post("/freeze", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { streakFreezeCount: true, streakFreezeUsedAt: true }
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.streakFreezeCount <= 0) {
      return res.status(400).json({ error: "No streak freezes available" });
    }

    // Check if freeze was used in the last 24 hours
    if (user.streakFreezeUsedAt) {
      const hoursSinceLastUse = (Date.now() - user.streakFreezeUsedAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastUse < 24) {
        return res.status(400).json({ error: "Streak freeze can only be used once every 24 hours" });
      }
    }

    // Use a streak freeze
    await prisma.user.update({
      where: { id: userId },
      data: {
        streakFreezeCount: { decrement: 1 },
        streakFreezeUsedAt: new Date()
      }
    });

    res.json({ ok: true, remainingFreezes: user.streakFreezeCount - 1 });
  } catch (error) {
    next(error);
  }
});

// Get streak freeze status
router.get("/freeze-status", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { streakFreezeCount: true, streakFreezeUsedAt: true }
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    let canUse = user.streakFreezeCount > 0;
    let cooldownRemaining = 0;

    if (user.streakFreezeUsedAt) {
      const hoursSinceLastUse = (Date.now() - user.streakFreezeUsedAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastUse < 24) {
        canUse = false;
        cooldownRemaining = Math.ceil(24 - hoursSinceLastUse);
      }
    }

    res.json({
      remainingFreezes: user.streakFreezeCount,
      canUse,
      cooldownRemaining
    });
  } catch (error) {
    next(error);
  }
});

export default router;
