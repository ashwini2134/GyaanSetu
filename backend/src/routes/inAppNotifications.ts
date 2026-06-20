import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import {
  getInAppNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount,
} from "../services/notificationService.js";

const router = Router();

router.get("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const notifications = await getInAppNotifications(req.user!.id, limit);
    const unread = await getUnreadCount(req.user!.id);
    res.json({ notifications, unread });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/read", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    await markNotificationRead(String(req.params.id), req.user!.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post("/read-all", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    await markAllNotificationsRead(req.user!.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
