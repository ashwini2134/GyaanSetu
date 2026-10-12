import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { z } from "zod";

const router = Router();

import { getUserSummary, getLeaderboard, awardXp } from "../services/gamificationService.js";
import { recordQuizAttempt } from "../services/progressTrackingService.js";
import { COURSE_LECTURE_COUNTS } from "./courses.js";
import { evaluateAndUnlockAchievements } from "../achievements/evaluationEngine.js";
import { sendNotification } from "../services/notificationService.js";
import { toInternalLectureIndex, getCourseLectures, getRequiredProblemIds, getQuizQuestionCount } from "../lib/courseLectures.js";

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
    const targetUserId = req.params.userId as string;
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        avatarUrl: true,
        githubUrl: true,
        linkedinUrl: true,
        portfolioUrl: true,
        createdAt: true,
        totalXp: true,
        currentStreak: true,
        longestStreak: true,
        overallProgress: true,
        profileVisibility: true,
        profileTheme: true,
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

    // Check profile visibility
    if (targetUser.profileVisibility === "private" && targetUserId !== req.user!.id) {
      return res.status(403).json({ error: "Profile is private" });
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

    const certificates = await prisma.issuedCertificate.findMany({
      where: { userId: targetUserId },
      orderBy: { issuedAt: 'desc' }
    });

    res.json({
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        bio: targetUser.bio,
        avatarUrl: targetUser.avatarUrl,
        githubUrl: targetUser.githubUrl,
        linkedinUrl: targetUser.linkedinUrl,
        portfolioUrl: targetUser.portfolioUrl,
        createdAt: targetUser.createdAt,
        role: "student",
        profileTheme: targetUser.profileTheme,
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
      overallProgress: targetUser.overallProgress,
      certificates
    });
  } catch (error) {
    next(error);
  }
});

const quizSchema = z.object({
  courseSlug: z.string(),
  lectureId: z.string(),
  score: z.number(),
  answers: z.any().optional(),
});

router.post("/quiz", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { courseSlug, lectureId, score, answers } = quizSchema.parse(req.body);
    const { attempt, passed } = await recordQuizAttempt(req.user!.id, courseSlug, lectureId, score, answers);
    res.json({ progress: attempt, passed, score, total: 100 });
  } catch (error) {
    next(error);
  }
});

const sectionProgressSchema = z.object({
  courseSlug: z.string(),
  lectureId: z.string(),
  practiceAttempted: z.boolean().optional(),
  practiceCompleted: z.boolean().optional(),
  lectureTitle: z.string().optional(),
});

router.post("/section", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id; // req.user.id is now a string
    const { courseSlug, lectureId, practiceAttempted, practiceCompleted, lectureTitle } = sectionProgressSchema.parse(req.body);

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
      await sendNotification(
        userId,
        "practice_completed",
        "Practice Exercise Completed",
        `${lectureTitle ?? `Lecture ${lectureId}`} practice exercise completed.`,
        `/course/${courseSlug}/lecture/${lectureId}`,
        "medium"
      );
    }

    res.json(progress);
  } catch (error) {
    next(error);
  }
});

const tryItSchema = z.object({
  courseSlug: z.string(),
  lectureId: z.string(),
  blockId: z.string(),
  secondsDelta: z.number().int().min(0).max(300), // clamp a single flush to 5 min — defends against a stale/runaway tab
});

// Cumulative time-on-task for "Try It Yourself" code blocks — feeds the
// certification-readiness engagement check (certificationService.ts). The
// frontend flushes elapsed seconds periodically while a block is expanded
// and once more on collapse/unmount, so this is called many times per
// block; each call just adds its delta rather than replacing the total.
router.post("/tryit", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { courseSlug, lectureId, blockId, secondsDelta } = tryItSchema.parse(req.body);

    const engagement = await prisma.tryItEngagement.upsert({
      where: {
        userId_courseSlug_lectureId_blockId: { userId, courseSlug, lectureId, blockId },
      },
      update: { secondsSpent: { increment: secondsDelta } },
      create: { userId, courseSlug, lectureId, blockId, secondsSpent: secondsDelta },
    });

    res.json({ secondsSpent: engagement.secondsSpent });
  } catch (error) {
    next(error);
  }
});

const lectureCompletionSchema = z.object({
  courseSlug: z.string(),
  lectureId: z.string(),
  hasProject: z.boolean(),
  lectureTitle: z.string().optional(),
});

router.post("/lecture", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { courseSlug, lectureId, hasProject, lectureTitle } = lectureCompletionSchema.parse(req.body);

    let progress = await prisma.progress.findUnique({
      where: {
        userId_courseSlug_lectureId: {
          userId,
          courseSlug,
          lectureId,
        },
      },
    });

    const wasAlreadyCompleted = progress?.status === "COMPLETED";
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

    if (shouldComplete && !wasAlreadyCompleted) {
      await sendNotification(
        userId,
        "lecture_completed",
        "Lecture Completed",
        `${lectureTitle ?? `Lecture ${lectureId}`} completed successfully.`,
        `/course/${courseSlug}/lecture/${lectureId}`,
        "medium"
      );
    }

    res.json(progress);
  } catch (error) {
    next(error);
  }
});

const actionSchema = z.object({
  actionType: z.enum(["section", "lecture", "quiz", "problem", "project", "course_start", "course_complete"]),
  actionId: z.string(),
  difficulty: z.string().optional(),
});

router.post("/action", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { actionType, actionId, difficulty } = actionSchema.parse(req.body);

    let xpAmount = 0;
    let reason = "";

    switch (actionType) {
      case "section":
        xpAmount = 10;
        reason = "Section Completed";
        await sendNotification(
          userId,
          "section_completed",
          "Section Completed",
          "Section completed successfully.",
          "",
          "low",
          `section_${userId}_${actionId}`
        );
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
            ...(difficulty && { difficulty }),
          },
          create: {
            userId,
            problemId: actionId,
            status: "PASSED",
            code: "",
            difficulty,
          },
        });
        await sendNotification(
          userId,
          "problem_solved",
          "Problem Solved",
          `Problem "${actionId}" solved successfully.`,
          "",
          "medium",
          `problem_${userId}_${actionId}`
        );
        break;
      case "project":
        xpAmount = 100;
        reason = "Capstone Project Solved";
        // Create project entry for leaderboard tracking
        await prisma.project.upsert({
          where: {
            userId_projectId: {
              userId,
              projectId: actionId
            }
          },
          update: {
            status: "COMPLETED",
            completedAt: new Date()
          },
          create: {
            userId,
            projectId: actionId,
            code: "",
            status: "COMPLETED",
            completedAt: new Date()
          }
        });
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

    let unlockedAchievements: Awaited<ReturnType<typeof evaluateAndUnlockAchievements>> = [];
    try {
      unlockedAchievements = await evaluateAndUnlockAchievements(userId, `action:${actionType}`);
    } catch (e) {
      console.error("[achievements] evaluation failed after progress action", e);
    }

    res.json({ ok: true, unlockedAchievements });
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
        // QuizAttempt.lectureId is the internal lesson id (e.g.
        // "python20-lecture-0"), not "${courseSlug}-${displayNumber}" —
        // those only coincide for 0-indexed courses. Without this
        // conversion, fundamentals-of-ai (1-indexed display numbers) never
        // matches, so a passed quiz would appear un-taken again on reload.
        where: {
          userId,
          courseId: courseSlug,
          lectureId: `${courseSlug}-lecture-${toInternalLectureIndex(courseSlug, Number(lectureId))}`,
        },
        orderBy: { createdAt: 'desc' },
        take: 1
      })
    ]);
    res.json({
      sections,
      lectureCompleted: lectureProgress?.status === "COMPLETED",
      projectCompleted: lectureProgress?.projectCompleted || false,
      projectId: lectureProgress?.projectId || null,
      quizAttempt: quizAttempts[0] || null,
    });
  } catch (error) { next(error); }
});

router.get("/course/:courseSlug", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const courseSlug = String(req.params.courseSlug);
    const [sectionProgress, progressRows, quizAttempts, passedSubmissions] = await Promise.all([
      prisma.lectureProgress.findMany({
        where: { userId, courseSlug }
      }),
      prisma.progress.findMany({
        where: { userId, courseSlug },
        select: { lectureId: true, status: true, practiceCompleted: true, completedAt: true }
      }),
      prisma.quizAttempt.findMany({
        where: { userId, courseId: courseSlug },
        select: { lectureId: true, passed: true }
      }),
      prisma.submission.findMany({
        where: { userId, status: "PASSED" },
        select: { problemId: true }
      }),
    ]);

    const lectureCompletions = progressRows
      .filter((p) => p.status === "COMPLETED")
      .map((p) => ({ lectureId: p.lectureId, status: p.status, completedAt: p.completedAt }));

    // Per-lecture "fully complete" — sections watched, practice done, quiz
    // passed (if the lecture has one), and every real problem solved (if
    // the lecture has any). This is what actually gates the NEXT lecture,
    // not just "sections watched" — a student can't skip the quiz/problems
    // pages and still unlock what comes after.
    const progressByLecture = new Map(progressRows.map((p) => [p.lectureId, p]));
    const quizPassedLectureIds = new Set(quizAttempts.filter((q) => q.passed).map((q) => q.lectureId));
    const passedProblemIds = new Set(passedSubmissions.map((s) => s.problemId));

    const lectures = getCourseLectures(courseSlug);
    const fullyCompletedLectures: number[] = [];
    for (const lec of lectures) {
      const progress = progressByLecture.get(String(lec.number));
      const sectionsDone = progress?.status === "COMPLETED";
      const practiceDone = !!progress?.practiceCompleted;

      const internalIndex = toInternalLectureIndex(courseSlug, lec.number);
      const quizRequired = getQuizQuestionCount(courseSlug, lec.number) > 0;
      const quizDone = !quizRequired || quizPassedLectureIds.has(`${courseSlug}-lecture-${internalIndex}`);

      const requiredProblemIds = getRequiredProblemIds(courseSlug, lec.number);
      const problemsDone = requiredProblemIds.every((id) => passedProblemIds.has(id));

      if (sectionsDone && practiceDone && quizDone && problemsDone) {
        fullyCompletedLectures.push(lec.number);
      }
    }

    res.json({ sections: sectionProgress, lectureCompletions, fullyCompletedLectures });
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

    const [quizAttempts, lectureCompletions, practiceSubmissions, projectCompletions, assessmentCompletions] = await Promise.all([
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
      prisma.assessmentProgress.findMany({
        where: { userId, status: "completed", lastAttemptAt: { gte: since } },
        select: { lastAttemptAt: true },
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
    assessmentCompletions.forEach(a => tally(a.lastAttemptAt));

    const activity = Object.entries(counts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({ activity });
  } catch (error) { next(error); }
});

export default router;
