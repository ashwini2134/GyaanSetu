import { Router } from "express";
<<<<<<< HEAD
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

=======
import { z } from "zod";
import { type AuthenticatedRequest, requireAuth } from "../middleware/auth.js";
import {
  addProjectSubmission,
  getLeaderboard,
  getLectureProgressEntry,
  getUserSummary,
  recordActivity,
  upsertLectureProgress,
} from "../services/progressService.js";

const router = Router();

const lectureBaseSchema = z.object({
  courseSlug: z.string().min(1),
  lectureNumber: z.number().int().nonnegative(),
});

const sectionSchema = lectureBaseSchema.extend({
  sectionId: z.string().min(1),
  lastSection: z.string().min(1).optional(),
});

const quizSchema = lectureBaseSchema.extend({
  score: z.number().int().min(0),
  total: z.number().int().min(1),
});

const problemSchema = lectureBaseSchema.extend({
  problemId: z.string().min(1),
});

const lectureCompleteSchema = lectureBaseSchema.extend({
  totalSections: z.number().int().min(0),
  totalProblems: z.number().int().min(0),
  hasQuiz: z.boolean(),
});

const projectSchema = z.object({
  courseSlug: z.string().min(1),
  projectId: z.string().min(1),
});

router.get("/me", requireAuth, (req: AuthenticatedRequest, res) => {
  const courseSlug = typeof req.query.courseSlug === "string" ? req.query.courseSlug : undefined;
  const summary = getUserSummary(req.user!.id, courseSlug);
  res.json(summary);
});

// Get a specific lecture's progress
router.get("/lecture/:courseSlug/:lectureNumber", requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const courseSlug = req.params.courseSlug as string;
    const lectureNumber = parseInt(req.params.lectureNumber as string, 10);
    
    if (isNaN(lectureNumber)) {
      res.status(400).json({ error: "Invalid lecture number" });
      return;
    }
    
    const progress = getLectureProgressEntry(req.user!.id, courseSlug, lectureNumber);
    if (!progress) {
      // Return empty progress record if not found
      const empty = {
        courseSlug,
        lectureNumber,
        sections: {},
        quizScore: null,
        quizCompleted: false,
        problemsCompleted: [],
        handsOnTaskCompleted: false,
        lectureCompleted: false,
        lastSection: "overview",
        updatedAt: new Date().toISOString(),
      };
      res.json({ progress: empty });
      return;
    }
    
    res.json({ progress });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

router.post("/lecture/section", requireAuth, (req: AuthenticatedRequest, res, next) => {
  try {
    const body = sectionSchema.parse(req.body);
    const progress = upsertLectureProgress(req.user!.id, body.courseSlug, body.lectureNumber, {
      sections: {
        [body.sectionId]: {
          visited: true,
          practiceAttempted: false,
          practiceCompleted: false,
        },
      },
      lastSection: body.lastSection ?? body.sectionId,
    });
    recordActivity(req.user!.id, "progress_update", { courseSlug: body.courseSlug, lectureNumber: body.lectureNumber, sectionId: body.sectionId });
    res.json({ progress });
  } catch (err) {
    next(err);
  }
});

router.post("/lecture/quiz", requireAuth, (req: AuthenticatedRequest, res, next) => {
  try {
    const body = quizSchema.parse(req.body);
    const passed = body.score / body.total >= 0.7;
    const existing = getLectureProgressEntry(req.user!.id, body.courseSlug, body.lectureNumber);
    const progress = upsertLectureProgress(req.user!.id, body.courseSlug, body.lectureNumber, {
      quizScore: body.score,
      quizCompleted: passed,
      lastSection: "quiz",
    });

    if (passed) {
      recordActivity(req.user!.id, "quiz_passed", { courseSlug: body.courseSlug, lectureNumber: body.lectureNumber, score: body.score, total: body.total });
    } else {
      recordActivity(req.user!.id, "progress_update", { courseSlug: body.courseSlug, lectureNumber: body.lectureNumber, score: body.score, total: body.total });
    }

    res.json({ progress, passed, score: body.score, total: body.total, previousScore: existing?.quizScore ?? null });
  } catch (err) {
    next(err);
  }
});

router.post("/lecture/problem", requireAuth, (req: AuthenticatedRequest, res, next) => {
  try {
    const body = problemSchema.parse(req.body);
    const progress = upsertLectureProgress(req.user!.id, body.courseSlug, body.lectureNumber, {
      problemsCompleted: [body.problemId],
      lastSection: "problems",
    });
    recordActivity(req.user!.id, "problem_solved", { courseSlug: body.courseSlug, lectureNumber: body.lectureNumber, problemId: body.problemId });
    res.json({ progress });
  } catch (err) {
    next(err);
  }
});

router.post("/lecture/complete", requireAuth, (req: AuthenticatedRequest, res, next) => {
  try {
    const body = lectureCompleteSchema.parse(req.body);
    const progress = getLectureProgressEntry(req.user!.id, body.courseSlug, body.lectureNumber);

    if (!progress) {
      throw new Error("Progress record not found for this lecture");
    }

    const sectionsVisited = Object.values(progress.sections).filter((section) => section.visited).length;
    const quizDone = !body.hasQuiz || progress.quizCompleted;
    const problemsDone = progress.problemsCompleted.length >= body.totalProblems;

    if (sectionsVisited < body.totalSections || !quizDone || !problemsDone) {
      res.status(400).json({
        error: "Lecture cannot be completed yet. Ensure you have visited every section, passed the quiz, and completed all problems.",
      });
      return;
    }

    const updated = upsertLectureProgress(req.user!.id, body.courseSlug, body.lectureNumber, {
      lectureCompleted: true,
      handsOnTaskCompleted: true,
      lastSection: "summary",
    });
    recordActivity(req.user!.id, "lecture_complete", { courseSlug: body.courseSlug, lectureNumber: body.lectureNumber });
    res.json({ progress: updated });
  } catch (err) {
    next(err);
  }
});

router.post("/project", requireAuth, (req: AuthenticatedRequest, res, next) => {
  try {
    const body = projectSchema.parse(req.body);
    addProjectSubmission(req.user!.id, body.courseSlug, body.projectId);
    res.json({ ok: true, projectId: body.projectId });
  } catch (err) {
    next(err);
  }
});

router.get("/leaderboard", requireAuth, (req: AuthenticatedRequest, res) => {
  const leaderboard = getLeaderboard();
  res.json({ leaderboard });
});

>>>>>>> 8245f18 (Initial commit)
export default router;
