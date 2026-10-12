import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { sendNotification } from "../services/notificationService.js";
import { z } from "zod";
import { ACHIEVEMENT_CATALOG, getAchievementById } from "../achievements/catalog.js";
import { evaluateAndUnlockAchievements } from "../achievements/evaluationEngine.js";

const router = Router();

const customAchievementSchema = z.object({
  achievementId: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string().optional(),
  userId: z.string(),
});

function toAchievementDto(row: { achievementId: string; unlockedAt: Date; icon: string | null; description: string | null }) {
  const def = getAchievementById(row.achievementId);
  if (def) {
    return {
      id: def.id,
      name: def.name,
      description: def.description,
      icon: def.icon,
      category: def.category,
      xpReward: def.xpReward ?? 0,
      badgeColor: def.badgeColor,
      unlockedAt: row.unlockedAt,
    };
  }
  // Legacy/custom achievement with no catalog entry — fall back to whatever
  // was stored on the row itself.
  return {
    id: row.achievementId,
    name: row.achievementId,
    description: row.description ?? "",
    icon: row.icon ?? "award",
    category: "community" as const,
    xpReward: 0,
    badgeColor: "bronze" as const,
    unlockedAt: row.unlockedAt,
  };
}

// User's unlocked achievements, newest first. Runs a cheap opportunistic
// evaluation pass first so this endpoint is always eventually-consistent,
// even for trigger points that aren't directly wired.
router.get("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    try {
      await evaluateAndUnlockAchievements(userId, "get_achievements");
    } catch (e) {
      console.error("[achievements] safety-net evaluation failed", e);
    }

    const rows = await prisma.achievement.findMany({
      where: { userId },
      orderBy: { unlockedAt: "desc" },
    });

    res.json({ achievements: rows.map(toAchievementDto) });
  } catch (error) {
    next(error);
  }
});

// All visible catalog definitions, no per-user unlock state — used to render
// locked+unlocked grids (e.g. Dashboard).
router.get("/catalog", requireAuth, async (_req, res) => {
  const visible = ACHIEVEMENT_CATALOG.filter((a) => a.visibility === "visible").map((a) => ({
    id: a.id,
    name: a.name,
    description: a.description,
    icon: a.icon,
    category: a.category,
    xpReward: a.xpReward ?? 0,
    badgeColor: a.badgeColor,
  }));
  res.json({ achievements: visible });
});

// Latest N unlocked achievements — dedicated endpoint so the DB does the
// `take` instead of the client slicing a larger list.
router.get("/recent", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const limit = Math.min(Math.max(Number(req.query.limit) || 5, 1), 20);

    try {
      await evaluateAndUnlockAchievements(userId, "get_recent");
    } catch (e) {
      console.error("[achievements] safety-net evaluation failed", e);
    }

    const rows = await prisma.achievement.findMany({
      where: { userId },
      orderBy: { unlockedAt: "desc" },
      take: limit,
    });

    res.json({ achievements: rows.map(toAchievementDto) });
  } catch (error) {
    next(error);
  }
});

// Admin-only: grant a one-off achievement (contests, special events) that
// isn't in the catalog. Real unlocks never go through a client-writable
// endpoint — this is the sole exception, and it requires admin role.
router.post("/custom", requireAuth, requireRole("admin"), async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = customAchievementSchema.parse(req.body);

    const achievement = await prisma.achievement.create({
      data: {
        userId: body.userId,
        achievementId: body.achievementId,
        custom: true,
        icon: body.icon,
        description: body.description,
      },
    });

    await sendNotification(
      body.userId,
      "achievement",
      body.name,
      body.description,
      "/profile",
      "medium",
      `achievement_${body.userId}_${body.achievementId}`
    );

    res.json(achievement);
  } catch (error) {
    next(error);
  }
});

// Generate shareable content for an achievement
router.get("/:achievementId/share", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const achievementId = req.params.achievementId as string;

    const achievement = await prisma.achievement.findUnique({
      where: {
        userId_achievementId: { userId, achievementId },
      },
    });

    if (!achievement) {
      return res.status(404).json({ error: "Achievement not found" });
    }

    const def = getAchievementById(achievementId);
    const name = def?.name ?? achievementId;
    const description = def?.description ?? achievement.description ?? "I earned this achievement on GyanSetu!";
    const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/#/profile`;

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`🏆 I just earned the "${name}" achievement! ${description}`)}&url=${encodeURIComponent(shareUrl)}`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(`I just earned the "${name}" achievement!`)}`;

    res.json({
      name,
      description,
      shareUrl,
      platforms: {
        twitter: twitterUrl,
        linkedin: linkedInUrl,
        facebook: facebookUrl,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
