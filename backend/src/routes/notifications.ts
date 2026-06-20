import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

const DEFAULT_PREFS = {
  emailCourseUpdates: true,
  emailDeadlines: true,
  emailQuizResults: true,
  emailAchievements: true,
  emailStreakReminders: true,
  inAppMessages: true,
  inAppProjectReviews: true,
  inAppDailyMissions: true,
};

router.get("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { notificationPrefs: true },
    });
    const prefs = user?.notificationPrefs
      ? { ...DEFAULT_PREFS, ...(user.notificationPrefs as Record<string, boolean>) }
      : DEFAULT_PREFS;
    res.json({ prefs });
  } catch (err) {
    next(err);
  }
});

router.put("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { prefs } = req.body;
    if (!prefs || typeof prefs !== "object") {
      return res.status(400).json({ error: "Invalid preferences" });
    }
    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: { notificationPrefs: prefs },
      select: { notificationPrefs: true },
    });
    const merged = { ...DEFAULT_PREFS, ...(updated.notificationPrefs as Record<string, boolean>) };
    res.json({ prefs: merged });
  } catch (err) {
    next(err);
  }
});

export default router;
