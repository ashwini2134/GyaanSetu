import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { z } from "zod";

const router = Router();

const digestPreferenceSchema = z.object({
  enabled: z.boolean(),
  frequency: z.enum(['daily', 'weekly']),
  dayOfWeek: z.number().min(0).max(6).optional(), // 0 = Sunday, 6 = Saturday
  timeOfDay: z.string().optional() // HH:MM format
});

// Update email digest preferences
router.patch("/preferences", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const prefs = digestPreferenceSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { notificationPrefs: true }
    });

    const currentPrefs = (user?.notificationPrefs as any) || {};
    currentPrefs.emailDigest = prefs;

    await prisma.user.update({
      where: { id: userId },
      data: { notificationPrefs: currentPrefs }
    });

    res.json({ ok: true, preferences: prefs });
  } catch (error) {
    next(error);
  }
});

// Get email digest preferences
router.get("/preferences", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { notificationPrefs: true }
    });

    const currentPrefs = (user?.notificationPrefs as any) || {};
    const digestPrefs = currentPrefs.emailDigest || {
      enabled: false,
      frequency: 'weekly'
    };

    res.json(digestPrefs);
  } catch (error) {
    next(error);
  }
});

// Generate email digest content (for preview)
router.get("/preview", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { days = 7 } = req.query;

    const dateLimit = new Date(Date.now() - (Number(days) * 24 * 60 * 60 * 1000));

    const [user, xpGained, completedLectures, completedProjects, certificates] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, totalXp: true, currentStreak: true }
      }),
      prisma.xpTransaction.aggregate({
        where: { userId, createdAt: { gte: dateLimit } },
        _sum: { amount: true }
      }),
      prisma.progress.count({
        where: { userId, status: "COMPLETED", completedAt: { gte: dateLimit } }
      }),
      prisma.project.count({
        where: { userId, status: "COMPLETED", completedAt: { gte: dateLimit } }
      }),
      prisma.issuedCertificate.count({
        where: { userId, issuedAt: { gte: dateLimit } }
      })
    ]);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const digest = {
      recipient: {
        name: user.name,
        email: user.email
      },
      period: {
        days: Number(days),
        startDate: dateLimit.toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      },
      summary: {
        xpGained: xpGained._sum.amount || 0,
        totalXp: user.totalXp,
        currentStreak: user.currentStreak,
        completedLectures,
        completedProjects,
        certificatesEarned: certificates
      },
      achievements: await prisma.achievement.findMany({
        where: { userId, unlockedAt: { gte: dateLimit } },
        orderBy: { unlockedAt: 'desc' }
      })
    };

    res.json(digest);
  } catch (error) {
    next(error);
  }
});

export default router;
