import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { z } from "zod";

const router = Router();

import { getUserSummary, getLeaderboard, awardXp } from "../services/gamificationService.js";
import { recordQuizAttempt } from "../services/progressTrackingService.js";
import { COURSE_LECTURE_COUNTS } from "./courses.js";

router.get("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const [completedLectures, quizzesPassedCount, submissionsCount, projectsCount] = await Promise.all([
      prisma.progress.count({ where: { userId, status: "COMPLETED" } }),
      prisma.quizAttempt.count({ where: { userId, passed: true } }),
      prisma.submission.count({ where: { userId, status: "PASSED" } }),
      prisma.project.count({ where: { userId, status: "COMPLETED" } }),
    ]);

    const courseSlugs = await prisma.progress.groupBy({
      by: ['courseSlug'],
      where: { userId },
    });
    const coursesStarted = courseSlugs.length;

    let coursesCompleted = 0;
    for (const { courseSlug } of courseSlugs) {
      const total = COURSE_LECTURE_COUNTS[courseSlug];
      if (!total) continue;
      const done = await prisma.progress.count({
        where: { userId, courseSlug, status: "COMPLETED" }
      });
      if (done >= total) coursesCompleted++;
    }

    const stats = {
      coursesStarted,
      coursesCompleted,
      lecturesCompleted: completedLectures,
      quizzesPassed: quizzesPassedCount,
      tasksSubmitted: submissionsCount,
      projectsSolved: projectsCount,
    };

    res.json({
      moduleProgress: coursesStarted,
      lectureProgress: completedLectures,
      completedModules: coursesCompleted,
      stats,
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
    const timeframe = typeof req.query.timeframe === "string" ? req.query.timeframe : "all-time";
    const data = await getLeaderboard(req.user!.id, timeframe);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/profile/public/:userId", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const targetUserId = req.params.userId;
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        totalXp: true,
        currentStreak: true,
        longestStreak: true,
        _count: {
          select: {
            progress: { where: { status: "COMPLETED" } },
            quizAttempts: { where: { passed: true } },
            submissions: { where: { status: "PASSED" } },
            projects: { where: { status: "COMPLETED" } },
            issuedCertificates: true
          }
        }
      }
    });

    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const projects = await prisma.project.findMany({
      where: { userId: targetUserId },
      orderBy: { updatedAt: "desc" }
    });

    const timeline = await prisma.xpTransaction.findMany({
      where: { userId: targetUserId },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    const courseProgress = await prisma.progress.findMany({
      where: { userId: targetUserId }
    });

    res.json({
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        bio: targetUser.bio,
        avatarUrl: targetUser.avatarUrl,
        createdAt: targetUser.createdAt,
        role: "student",
      },
      stats: {
        coursesCompleted: targetUser._count.issuedCertificates,
        projectsSolved: targetUser._count.projects,
        lecturesCompleted: targetUser._count.progress,
        tasksSubmitted: targetUser._count.submissions,
        xp: targetUser.totalXp,
        streak: targetUser.currentStreak,
        longestStreak: targetUser.longestStreak,
      },
      projects,
      timeline,
      courseProgress,
      overallProgress: targetUser.overallProgress
    });
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
        break;
      case "quiz":
        xpAmount = 30;
        reason = "Quiz Passed";
        break;
      case "problem":
        xpAmount = 20;
        reason = "Problem Solved";
        await prisma.submission.upsert({
          where: {
            userId_problemId: {
              userId,
              problemId: actionId,
            },
          },
          update: {
            status: "PASSED",
          },
          create: {
            userId,
            problemId: actionId,
            status: "PASSED",
            code: "",
          },
        });
        break;
      case "project":
        xpAmount = 100;
        reason = "Capstone Project Solved";
        break;
      case "course_start":
        break;
      case "course_complete":
        xpAmount = 200;
        reason = "Course Completed";
        break;
    }

    if (xpAmount > 0) {
      await awardXp(userId, xpAmount, reason, `${actionType}_${actionId}`);
    }

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.get("/lecture/:courseSlug/:lectureId", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const courseSlug = String(req.params.courseSlug);
    const lectureId = String(req.params.lectureId);
    const [sections, lectureProgress, quizAttempts] = await Promise.all([
      prisma.lectureProgress.findMany({
        where: { userId, courseSlug, lectureId }
      }),
      prisma.progress.findUnique({
        where: {
          userId_courseSlug_lectureId: { userId, courseSlug, lectureId }
        }
      }),
      prisma.quizAttempt.findMany({
        where: { userId, quizId: `${courseSlug}-${lectureId}` },
        orderBy: { createdAt: 'desc' },
        take: 1
      })
    ]);
    res.json({
      sections,
      lectureCompleted: lectureProgress?.status === "COMPLETED",
      quizAttempt: quizAttempts[0] || null,
    });
  } catch (error) { next(error); }
});

router.get("/course/:courseSlug", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const courseSlug = String(req.params.courseSlug);
    const [sectionProgress, lectureCompletions] = await Promise.all([
      prisma.lectureProgress.findMany({
        where: { userId, courseSlug }
      }),
      prisma.progress.findMany({
        where: { userId, courseSlug, status: "COMPLETED" },
        select: { lectureId: true, status: true, completedAt: true }
      })
    ]);
    res.json({ sections: sectionProgress, lectureCompletions });
  } catch (error) { next(error); }
});

router.patch("/lecture/:courseSlug/:lectureId", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const courseSlug = String(req.params.courseSlug);
    const lectureId = String(req.params.lectureId);
    const { sectionIndex, isCompleted } = req.body;

    if (typeof sectionIndex !== 'number' || typeof isCompleted !== 'boolean') {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const progress = await prisma.lectureProgress.upsert({
      where: {
        userId_courseSlug_lectureId_sectionIndex: {
          userId,
          courseSlug,
          lectureId,
          sectionIndex
        }
      },
      update: { isCompleted },
      create: {
        userId,
        courseSlug,
        lectureId,
        sectionIndex,
        isCompleted
      }
    });

    res.json(progress);
  } catch (error) { next(error); }
});

router.get("/activity", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const days = Math.min(Math.max(Number(req.query.days) || 28, 1), 90);

    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    since.setHours(0, 0, 0, 0);

    const [quizAttempts, lectureCompletions, practiceSubmissions, projectCompletions] = await Promise.all([
      prisma.quizAttempt.findMany({
        where: { userId, createdAt: { gte: since } },
        select: { createdAt: true },
      }),
      prisma.progress.findMany({
        where: { userId, status: "COMPLETED", completedAt: { gte: since } },
        select: { completedAt: true },
      }),
      prisma.practiceSubmission.findMany({
        where: { userId, completed: true, createdAt: { gte: since } },
        select: { createdAt: true },
      }),
      prisma.project.findMany({
        where: { userId, status: "COMPLETED", completedAt: { gte: since } },
        select: { completedAt: true },
      }),
    ]);

    const counts: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      counts[d.toISOString().split("T")[0]] = 0;
    }

    const tally = (date: Date | null | undefined) => {
      if (!date) return;
      const key = date.toISOString().split("T")[0];
      if (key in counts) counts[key]++;
    };

    quizAttempts.forEach(a => tally(a.createdAt));
    lectureCompletions.forEach(p => tally(p.completedAt));
    practiceSubmissions.forEach(p => tally(p.createdAt));
    projectCompletions.forEach(p => tally(p.completedAt));

    const activity = Object.entries(counts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({ activity });
  } catch (error) { next(error); }
});

export default router;
