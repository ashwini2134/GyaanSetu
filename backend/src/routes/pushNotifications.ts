import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { z } from "zod";

const router = Router();

const pushSubscriptionSchema = z.object({
  endpoint: z.string(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string()
  })
});

// Register push notification subscription
router.post("/subscribe", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const subscription = pushSubscriptionSchema.parse(req.body);

    // Store subscription in user's notificationPrefs
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { notificationPrefs: true }
    });

    const currentPrefs = (user?.notificationPrefs as any) || {};
    currentPrefs.pushSubscription = subscription;

    await prisma.user.update({
      where: { id: userId },
      data: { notificationPrefs: currentPrefs }
    });

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

// Unregister push notification subscription
router.post("/unsubscribe", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { notificationPrefs: true }
    });

    const currentPrefs = (user?.notificationPrefs as any) || {};
    delete currentPrefs.pushSubscription;

    await prisma.user.update({
      where: { id: userId },
      data: { notificationPrefs: currentPrefs }
    });

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

// Get current push subscription status
router.get("/status", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { notificationPrefs: true }
    });

    const currentPrefs = (user?.notificationPrefs as any) || {};
    const isSubscribed = !!currentPrefs.pushSubscription;

    res.json({ subscribed: isSubscribed });
  } catch (error) {
    next(error);
  }
});

export default router;
