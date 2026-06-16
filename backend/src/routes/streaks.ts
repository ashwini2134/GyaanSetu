import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

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
    const { currentStreak, longestStreak, lastLoginDate } = req.body;

    await prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak,
        longestStreak,
        lastActiveAt: lastLoginDate ? new Date(lastLoginDate) : new Date()
      }
    });

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

export default router;
