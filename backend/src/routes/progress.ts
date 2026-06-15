import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { z } from "zod";

const router = Router();

import { getUserSummary, getLeaderboard, awardXp } from "../services/gamificationService.js";
import { recordQuizAttempt } from "../services/progressTrackingService.js";

router.get("/me", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const courseSlug = typeof req.query.courseSlug === "string" ? req.query.courseSlug : undefined;
    const summary = await getUserSummary(req.user!.id, courseSlug);
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

router.get("/leaderboard", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const leaderboard = await getLeaderboard();
    res.json({ leaderboard });
  } catch (error) {
    next(error);
  }
});

const quizSchema = z.object({
  courseSlug: z.string(),
  lectureId: z.string(),
  quizId: z.string(),
  score: z.number(),
  total: z.number(),
  answers: z.any().optional(),
});

router.post("/quiz", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { courseSlug, lectureId, quizId, score, total, answers } = quizSchema.parse(req.body);
    const { attempt, passed } = await recordQuizAttempt(req.user!.id, courseSlug, lectureId, quizId, score, total, answers);
    res.json({ progress: attempt, passed, score, total });
  } catch (error) {
    next(error);
  }
});

const sectionProgressSchema = z.object({
  courseSlug: z.string(),
  lectureId: z.string(),
  practiceAttempted: z.boolean().optional(),
  practiceCompleted: z.boolean().optional(),
});

router.post("/section", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id; // req.user.id is now a string
    const { courseSlug, lectureId, practiceAttempted, practiceCompleted } = sectionProgressSchema.parse(req.body);

    const existingProgress = await prisma.progress.findUnique({
      where: {
        userId_courseSlug_lectureId: {
          userId,
          courseSlug,
          lectureId,
        },
      },
    });

    const progress = await prisma.progress.upsert({
      where: {
        userId_courseSlug_lectureId: {
          userId,
          courseSlug,
          lectureId,
        },
      },
      update: {
        ...(practiceAttempted !== undefined && { practiceAttempted }),
        ...(practiceCompleted !== undefined && { practiceCompleted }),
      },
      create: {
        userId,
        courseSlug,
        lectureId,
        status: "STARTED",
        practiceAttempted: practiceAttempted ?? false,
        practiceCompleted: practiceCompleted ?? false,
      },
    });

    if (practiceCompleted && !existingProgress?.practiceCompleted) {
      await awardXp(userId, 20, "Completed Practice", `practice_complete_${courseSlug}_${lectureId}`);
    }

    res.json(progress);
  } catch (error) {
    next(error);
  }
});

const lectureCompletionSchema = z.object({
  courseSlug: z.string(),
  lectureId: z.string(),
  hasProject: z.boolean(),
});

router.post("/lecture", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { courseSlug, lectureId, hasProject } = lectureCompletionSchema.parse(req.body);

    let progress = await prisma.progress.findUnique({
      where: {
        userId_courseSlug_lectureId: {
          userId,
          courseSlug,
          lectureId,
        },
      },
    });

    const shouldComplete = !hasProject || progress?.projectCompleted;

    progress = await prisma.progress.upsert({
      where: {
        userId_courseSlug_lectureId: {
          userId,
          courseSlug,
          lectureId,
        },
      },
      update: {
        ...(shouldComplete && {
          status: "COMPLETED",
          completedAt: new Date(),
        }),
      },
      create: {
        userId,
        courseSlug,
        lectureId,
        status: shouldComplete ? "COMPLETED" : "STARTED",
        ...(shouldComplete && { completedAt: new Date() }),
      },
    });

    if (shouldComplete) {
      await awardXp(userId, 50, "Completed Lecture", `lecture_complete_${courseSlug}_${lectureId}`);
    }

    res.json(progress);
  } catch (error) {
    next(error);
  }
});

export default router;
