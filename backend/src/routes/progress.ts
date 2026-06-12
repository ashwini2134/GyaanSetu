import { Router } from "express";
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

export default router;
