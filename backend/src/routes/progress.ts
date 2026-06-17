import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { z } from "zod";

const router = Router();

import { getUserSummary, getLeaderboard, awardXp } from "../services/gamificationService.js";
import { recordQuizAttempt } from "../services/progressTrackingService.js";

router.get("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const statsData = (user?.statsData as any) || {
      coursesStarted: 0,
      coursesCompleted: 0,
      lecturesCompleted: 0,
      quizzesPassed: 0,
      tasksSubmitted: 0,
      projectsSolved: 0,
    };
    
    // Satisfy specific legacy requirements plus frontend StatsData
    res.json({
      moduleProgress: statsData.coursesStarted || 0,
      lectureProgress: statsData.lecturesCompleted || 0,
      completedModules: statsData.coursesCompleted || 0,
      stats: statsData
    });
  } catch (error) { next(error); }
});

router.post("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const payload = req.body;
    await prisma.user.update({
      where: { id: userId },
      data: { statsData: payload }
    });
    res.json({ ok: true });
  } catch (error) { next(error); }
});

router.get("/overall", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    res.json({
      courseProgress: user?.overallProgress || 0,
      overallProgress: user?.overallProgress || 0
    });
  } catch (error) { next(error); }
});

router.post("/overall", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { overallProgress } = req.body;
    await prisma.user.update({
      where: { id: userId },
      data: { overallProgress: Number(overallProgress) || 0 }
    });
    res.json({ ok: true });
  } catch (error) { next(error); }
});

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

const actionSchema = z.object({
  actionType: z.enum(["section", "lecture", "quiz", "problem", "project", "course_start", "course_complete"]),
  actionId: z.string(),
});

router.post("/action", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { actionType, actionId } = actionSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    let stats = user.statsData as any;
    if (!stats) {
      stats = {
        coursesStarted: 0,
        coursesCompleted: 0,
        lecturesCompleted: 0,
        quizzesPassed: 0,
        tasksSubmitted: 0,
        projectsSolved: 0,
      };
    }

    let xpAmount = 0;
    let reason = "";

    switch (actionType) {
      case "section":
        xpAmount = 10;
        reason = "Section Completed";
        break;
      case "lecture":
        xpAmount = 50;
        reason = "Full Lecture Completed";
        stats.lecturesCompleted += 1;
        break;
      case "quiz":
        xpAmount = 30;
        reason = "Quiz Passed";
        stats.quizzesPassed += 1;
        break;
      case "problem":
        xpAmount = 20;
        reason = "Problem Solved";
        stats.tasksSubmitted += 1;
        break;
      case "project":
        xpAmount = 100;
        reason = "Capstone Project Solved";
        stats.projectsSolved += 1;
        break;
      case "course_start":
        stats.coursesStarted += 1;
        break;
      case "course_complete":
        xpAmount = 200;
        reason = "Course Completed";
        stats.coursesCompleted += 1;
        break;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { statsData: stats }
    });

    if (xpAmount > 0) {
      await awardXp(userId, xpAmount, reason, `${actionType}_${actionId}`);
    }

    res.json({ ok: true, stats });
  } catch (error) {
    next(error);
  }
});
export default router;
