import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { getXpCenterData, getCurrentWeekXp, getWeeklyGraph, getArchivedWeeks, getLifetimeStats, getRecentActivity, getWeekBounds, archiveCurrentWeek } from "../services/weeklyXpService.js";

const router = Router();

router.get("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const data = await getXpCenterData(userId);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/weekly", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const weeklyXp = await getCurrentWeekXp(userId);
    const { weekStart, weekEnd, weekNumber } = getWeekBounds();
    res.json({ weeklyXp, weekStart: weekStart.toISOString(), weekEnd: weekEnd.toISOString(), weekNumber });
  } catch (error) {
    next(error);
  }
});

router.get("/graph", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const graph = await getWeeklyGraph(userId);
    res.json(graph);
  } catch (error) {
    next(error);
  }
});

router.get("/activity", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const activity = await getRecentActivity(userId, limit);
    res.json(activity);
  } catch (error) {
    next(error);
  }
});

router.get("/weeks", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const weeks = await getArchivedWeeks(userId);
    res.json(weeks);
  } catch (error) {
    next(error);
  }
});

router.get("/lifetime", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const stats = await getLifetimeStats(userId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

router.post("/archive", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    await archiveCurrentWeek(userId);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

export default router;
