import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { sendNotification } from "../services/notificationService.js";
import { z } from "zod";

const router = Router();

const ACHIEVEMENT_NAMES: Record<string, string> = {
  first_lecture: "First Steps",
  first_quiz: "Quiz Master",
  first_problem: "Project Solver",
  five_lectures: "Halfway There",
  ten_lectures: "10 Lectures Done",
  first_project: "First Project Submitted",
  course_completed: "Course Completed",
};

const customAchievementSchema = z.object({
  achievementId: z.string(),
  icon: z.string().optional(),
  description: z.string().optional(),
});

router.get("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const achievements = await prisma.achievement.findMany({
      where: { userId },
      orderBy: { unlockedAt: "desc" }
    });

    res.json({
      achievements: achievements.map(a => ({
        id: a.achievementId,
        unlockedAt: a.unlockedAt,
        custom: a.custom,
        icon: a.icon,
        description: a.description
      }))
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { achievementId, icon, description } = req.body;

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
        achievementId,
        custom: true,
        icon: icon,
        description: description
      }
    });

    const name = ACHIEVEMENT_NAMES[achievementId] || achievementId;
    await sendNotification(
      userId,
      "achievement",
      `🏆 Achievement Unlocked: ${name}`,
      description || `Congratulations! You've earned the "${name}" achievement!`,
      "/profile"
    );

    res.json({ achievement: achievement.achievementId });
  } catch (error) {
    next(error);
  }
});

// Create custom achievement (for special events, contests, etc.)
router.post("/custom", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const body = customAchievementSchema.parse(req.body);

    const achievement = await prisma.achievement.create({
      data: {
        userId,
        achievementId: body.achievementId,
        custom: true,
        icon: body.icon,
        description: body.description
      }
    });

    await sendNotification(
      userId,
      "achievement",
      `🏆 Special Achievement: ${body.achievementId}`,
      body.description || "You've earned a special achievement!",
      "/profile"
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
    const { achievementId } = req.params;

    const achievement = await prisma.achievement.findUnique({
      where: {
        userId_achievementId: { userId, achievementId }
      }
    });

    if (!achievement) {
      return res.status(404).json({ error: "Achievement not found" });
    }

    const name = ACHIEVEMENT_NAMES[achievementId] || achievementId;
    const description = achievement.description || "I earned this achievement on Fraylon Academy!";
    const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/#/profile`;

    // Generate share URLs for different platforms
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
        facebook: facebookUrl
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
