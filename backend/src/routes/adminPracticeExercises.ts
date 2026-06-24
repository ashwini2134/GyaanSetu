import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { z } from "zod";

const router = Router();
router.use(requireAuth, requireRole("admin"));

// ── Validation schemas ──

const exerciseSchema = z.object({
  courseId: z.string().min(1),
  lectureId: z.string().min(1),
  sectionId: z.string().nullable().optional(),
  title: z.string().min(1),
  type: z.enum(["ai", "coding"]),
  status: z.enum(["draft", "published", "archived"]).optional(),
  learningGoal: z.string().min(1),
  challenge: z.string().min(1),
  promptHint: z.string().min(1),
  validationRules: z.array(z.string()).optional(),
  completionCriteria: z.array(z.string()).optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  estimatedTime: z.number().int().positive().nullable().optional(),

  // AI practice
  systemInstruction: z.string().nullable().optional(),
  aiWorkspaceEnabled: z.boolean().optional(),
  suggestedPrompt: z.string().nullable().optional(),
  aiResponseEvalCriteria: z.array(z.string()).optional(),
  reflectionRequirements: z.array(z.string()).optional(),
  aiCompletionRequirements: z.array(z.string()).optional(),

  // Coding practice
  starterCode: z.string().nullable().optional(),
  expectedOutput: z.string().nullable().optional(),
  testCases: z.array(z.object({
    input: z.string(),
    expected: z.string(),
  })).optional(),
  inputValues: z.string().nullable().optional(),
  hints: z.array(z.string()).optional(),
  solutionCode: z.string().nullable().optional(),
});

// ── LIST all exercises (with filters) ──

router.get("/practice-exercises/configs", async (req: AuthenticatedRequest, res, next) => {
  try {
    const courseId = req.query.courseId as string | undefined;
    const lectureId = req.query.lectureId as string | undefined;
    const status = req.query.status as string | undefined;
    const type = req.query.type as string | undefined;
    const search = String(req.query.search ?? "").trim();

    const where: Record<string, unknown> = {};
    if (courseId) where.courseId = courseId;
    if (lectureId) where.lectureId = lectureId;
    if (status) where.status = status;
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { challenge: { contains: search, mode: "insensitive" } },
      ];
    }

    const [exercises, total] = await Promise.all([
      prisma.practiceExercise.findMany({
        where,
        orderBy: [{ courseId: "asc" }, { lectureId: "asc" }, { createdAt: "desc" }],
        include: {
          _count: { select: { attempts: true } },
        },
      }),
      prisma.practiceExercise.count({ where }),
    ]);

    const result = exercises.map((e) => ({
      id: e.id,
      courseId: e.courseId,
      lectureId: e.lectureId,
      sectionId: e.sectionId,
      title: e.title,
      type: e.type,
      status: e.status,
      difficulty: e.difficulty,
      estimatedTime: e.estimatedTime,
      attemptCount: e._count.attempts,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    }));

    res.json({ exercises: result, total });
  } catch (err) { next(err); }
});

// ── GET single exercise ──

router.get("/practice-exercises/configs/:id", async (req: AuthenticatedRequest, res, next) => {
  try {
    const exercise = await prisma.practiceExercise.findUnique({
      where: { id: String(req.params.id) },
    });
    if (!exercise) return res.status(404).json({ error: "Exercise not found" });
    res.json({ exercise });
  } catch (err) { next(err); }
});

// ── CREATE exercise ──

router.post("/practice-exercises/configs", async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = exerciseSchema.parse(req.body);
    const exercise = await prisma.practiceExercise.create({
      data: {
        courseId: data.courseId,
        lectureId: data.lectureId,
        sectionId: data.sectionId ?? null,
        title: data.title,
        type: data.type,
        status: data.status ?? "draft",
        learningGoal: data.learningGoal,
        challenge: data.challenge,
        promptHint: data.promptHint,
        validationRules: data.validationRules ?? [],
        completionCriteria: data.completionCriteria ?? [],
        difficulty: data.difficulty ?? "beginner",
        estimatedTime: data.estimatedTime ?? null,
        systemInstruction: data.systemInstruction ?? null,
        aiWorkspaceEnabled: data.aiWorkspaceEnabled ?? true,
        suggestedPrompt: data.suggestedPrompt ?? null,
        aiResponseEvalCriteria: data.aiResponseEvalCriteria ?? [],
        reflectionRequirements: data.reflectionRequirements ?? [],
        aiCompletionRequirements: data.aiCompletionRequirements ?? [],
        starterCode: data.starterCode ?? null,
        expectedOutput: data.expectedOutput ?? null,
        testCases: data.testCases ?? [],
        inputValues: data.inputValues ?? null,
        hints: data.hints ?? [],
        solutionCode: data.solutionCode ?? null,
      },
    });
    res.status(201).json({ exercise });
  } catch (err) { next(err); }
});

// ── UPDATE exercise ──

router.put("/practice-exercises/configs/:id", async (req: AuthenticatedRequest, res, next) => {
  try {
    const existing = await prisma.practiceExercise.findUnique({ where: { id: String(req.params.id) } });
    if (!existing) return res.status(404).json({ error: "Exercise not found" });

    const data = exerciseSchema.partial().parse(req.body);
    const exercise = await prisma.practiceExercise.update({
      where: { id: String(req.params.id) },
      data: {
        ...(data.courseId !== undefined && { courseId: data.courseId }),
        ...(data.lectureId !== undefined && { lectureId: data.lectureId }),
        ...(data.sectionId !== undefined && { sectionId: data.sectionId }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.learningGoal !== undefined && { learningGoal: data.learningGoal }),
        ...(data.challenge !== undefined && { challenge: data.challenge }),
        ...(data.promptHint !== undefined && { promptHint: data.promptHint }),
        ...(data.validationRules !== undefined && { validationRules: data.validationRules }),
        ...(data.completionCriteria !== undefined && { completionCriteria: data.completionCriteria }),
        ...(data.difficulty !== undefined && { difficulty: data.difficulty }),
        ...(data.estimatedTime !== undefined && { estimatedTime: data.estimatedTime }),
        ...(data.systemInstruction !== undefined && { systemInstruction: data.systemInstruction }),
        ...(data.aiWorkspaceEnabled !== undefined && { aiWorkspaceEnabled: data.aiWorkspaceEnabled }),
        ...(data.suggestedPrompt !== undefined && { suggestedPrompt: data.suggestedPrompt }),
        ...(data.aiResponseEvalCriteria !== undefined && { aiResponseEvalCriteria: data.aiResponseEvalCriteria }),
        ...(data.reflectionRequirements !== undefined && { reflectionRequirements: data.reflectionRequirements }),
        ...(data.aiCompletionRequirements !== undefined && { aiCompletionRequirements: data.aiCompletionRequirements }),
        ...(data.starterCode !== undefined && { starterCode: data.starterCode }),
        ...(data.expectedOutput !== undefined && { expectedOutput: data.expectedOutput }),
        ...(data.testCases !== undefined && { testCases: data.testCases }),
        ...(data.inputValues !== undefined && { inputValues: data.inputValues }),
        ...(data.hints !== undefined && { hints: data.hints }),
        ...(data.solutionCode !== undefined && { solutionCode: data.solutionCode }),
      },
    });
    res.json({ exercise });
  } catch (err) { next(err); }
});

// ── DELETE exercise ──

router.delete("/practice-exercises/configs/:id", async (req: AuthenticatedRequest, res, next) => {
  try {
    const existing = await prisma.practiceExercise.findUnique({ where: { id: String(req.params.id) } });
    if (!existing) return res.status(404).json({ error: "Exercise not found" });

    await prisma.practiceAttempt.deleteMany({ where: { exerciseId: String(req.params.id) } });
    await prisma.practiceExercise.delete({ where: { id: String(req.params.id) } });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ── PATCH status (publish / archive / draft) ──

router.patch("/practice-exercises/configs/:id/status", async (req: AuthenticatedRequest, res, next) => {
  try {
    const { status } = z.object({ status: z.enum(["draft", "published", "archived"]) }).parse(req.body);
    const existing = await prisma.practiceExercise.findUnique({ where: { id: String(req.params.id) } });
    if (!existing) return res.status(404).json({ error: "Exercise not found" });

    const exercise = await prisma.practiceExercise.update({
      where: { id: String(req.params.id) },
      data: { status },
    });
    res.json({ exercise });
  } catch (err) { next(err); }
});

// ── ANALYTICS for a single exercise ──

router.get("/practice-exercises/analytics/:id", async (req: AuthenticatedRequest, res, next) => {
  try {
    const exercise = await prisma.practiceExercise.findUnique({ where: { id: String(req.params.id) } });
    if (!exercise) return res.status(404).json({ error: "Exercise not found" });

    const attempts = await prisma.practiceAttempt.findMany({
      where: { exerciseId: String(req.params.id) },
    });

    const totalAttempts = attempts.length;
    const uniqueUsers = new Set(attempts.map((a) => a.userId)).size;
    const passedAttempts = attempts.filter((a) => a.passed).length;
    const hintUsedAttempts = attempts.filter((a) => a.hintUsed).length;
    const failedAttempts = attempts.filter((a) => !a.passed);

    const completionRate = uniqueUsers > 0
      ? Math.round((new Set(attempts.filter((a) => a.passed).map((a) => a.userId)).size / uniqueUsers) * 100)
      : 0;

    const averageAttempts = uniqueUsers > 0
      ? Math.round((totalAttempts / uniqueUsers) * 10) / 10
      : 0;

    const timeSpentValues = attempts.filter((a) => a.timeSpent != null).map((a) => a.timeSpent!);
    const averageTimeSpent = timeSpentValues.length > 0
      ? Math.round(timeSpentValues.reduce((s, v) => s + v, 0) / timeSpentValues.length)
      : null;

    const failureRate = totalAttempts > 0
      ? Math.round((failedAttempts.length / totalAttempts) * 100)
      : 0;

    const hintUsageRate = totalAttempts > 0
      ? Math.round((hintUsedAttempts / totalAttempts) * 100)
      : 0;

    // Most common failure reasons
    const failureReasons: Record<string, number> = {};
    for (const fa of failedAttempts) {
      if (fa.failureReason) {
        failureReasons[fa.failureReason] = (failureReasons[fa.failureReason] || 0) + 1;
      }
    }
    const mostCommonFailures = Object.entries(failureReasons)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([reason, count]) => ({ reason, count }));

    res.json({
      exerciseId: exercise.id,
      totalAttempts,
      uniqueUsers,
      completionRate,
      averageAttempts,
      averageTimeSpent,
      hintUsageRate,
      failureRate,
      mostCommonFailures,
    });
  } catch (err) { next(err); }
});

// ── GLOBAL practice exercise stats ──

router.get("/practice-exercises/analytics", async (_req: AuthenticatedRequest, res, next) => {
  try {
    const [totalExercises, byType, byStatus, totalAttempts, passedAttempts] = await Promise.all([
      prisma.practiceExercise.count(),
      prisma.practiceExercise.groupBy({ by: ["type"], _count: { id: true } }),
      prisma.practiceExercise.groupBy({ by: ["status"], _count: { id: true } }),
      prisma.practiceAttempt.count(),
      prisma.practiceAttempt.count({ where: { passed: true } }),
    ]);

    res.json({
      totalExercises,
      byType: Object.fromEntries(byType.map((b) => [b.type, b._count.id])),
      byStatus: Object.fromEntries(byStatus.map((b) => [b.status, b._count.id])),
      totalAttempts,
      passedAttempts,
      overallPassRate: totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0,
    });
  } catch (err) { next(err); }
});

// ── COURSE / LECTURE reference data for dropdowns ──

router.get("/practice-exercises/course-lectures", async (_req: AuthenticatedRequest, res, next) => {
  try {
    const { readFileSync, existsSync } = await import("fs");
    const { join } = await import("path");
    const _dirname = new URL("../../..", import.meta.url).pathname;

    const coursesPath = join(_dirname, "frontend", "public", "data", "courses.json");
    const courses: { slug: string; title: string }[] = existsSync(coursesPath) ? JSON.parse(readFileSync(coursesPath, "utf-8")) : [];

    const courseLectureMap: Record<string, { number: number; title: string }[]> = {};
    for (const course of courses) {
      const lecturesPath = join(_dirname, "frontend", "public", "data", course.slug, "lectures.json");
      try {
        const lectures: { number: number; title: string }[] = existsSync(lecturesPath)
          ? JSON.parse(readFileSync(lecturesPath, "utf-8"))
          : [];
        courseLectureMap[course.slug] = lectures;
      } catch {
        courseLectureMap[course.slug] = [];
      }
    }

    res.json({ courses, courseLectureMap });
  } catch (err) { next(err); }
});

// ── CONNECTIVITY VALIDATION ──

router.get("/practice-exercises/connectivity-check/:id", async (req: AuthenticatedRequest, res, next) => {
  try {
    const exercise = await prisma.practiceExercise.findUnique({ where: { id: String(req.params.id) } });
    if (!exercise) return res.status(404).json({ error: "Exercise not found" });

    const warnings: { section: string; message: string; severity: "low" | "medium" | "high" }[] = [];

    // 1. Challenge reinforces learning objective
    const goalWords = new Set(exercise.learningGoal.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    const challengeWords = new Set(exercise.challenge.toLowerCase().split(/\s+/));
    const goalOverlap = [...goalWords].filter(w => challengeWords.has(w));
    if (goalOverlap.length < 2) {
      warnings.push({
        section: "Challenge → Learning Objective",
        message: "The challenge does not share key terms with the learning objective. Students may not connect the activity to the intended goal.",
        severity: "high",
      });
    } else if (goalOverlap.length < 4) {
      warnings.push({
        section: "Challenge → Learning Objective",
        message: "The challenge weakly aligns with the learning objective. Consider making the connection more explicit.",
        severity: "medium",
      });
    }

    // 2. Hint helps complete the challenge
    const hintWords = new Set(exercise.promptHint.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    const hintOverlap = [...challengeWords].filter(w => hintWords.has(w));
    if (hintOverlap.length < 1) {
      warnings.push({
        section: "Hint → Challenge",
        message: "The hint does not reference any key concepts from the challenge. It may not help students make progress.",
        severity: "high",
      });
    } else if (hintOverlap.length < 3) {
      warnings.push({
        section: "Hint → Challenge",
        message: "The hint aligns weakly with the challenge. Consider adding more specific guidance.",
        severity: "medium",
      });
    }

    // 3. Check for unrelated concepts in the challenge
    const lectureTitleWords = new Set<string>();
    try {
      const { readFileSync, existsSync } = await import("fs");
      const { join } = await import("path");
      const _dirname = new URL("../../..", import.meta.url).pathname;
      const lecturesPath = join(_dirname, "frontend", "public", "data", exercise.courseId, "lectures.json");
      if (existsSync(lecturesPath)) {
        const lectures: { number: number; title: string }[] = JSON.parse(readFileSync(lecturesPath, "utf-8"));
        const lecture = lectures.find((l) => String(l.number) === exercise.lectureId);
        if (lecture?.title) {
          lecture.title.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3).forEach((w: string) => lectureTitleWords.add(w));
        }
      }
    } catch { /* ignore */ }

    if (lectureTitleWords.size > 0) {
      const challengeWordsForCheck = new Set(exercise.challenge.toLowerCase().split(/\s+/).filter(w => w.length > 3));
      const lectureOverlap = [...lectureTitleWords].filter(w => challengeWordsForCheck.has(w));
      if (lectureOverlap.length === 0) {
        warnings.push({
          section: "Challenge → Lecture Topic",
          message: "The challenge does not reference the lecture topic. Students may not see how this relates to the current lesson.",
          severity: "medium",
        });
      }
    }

    // 4. Hint introduces unrelated concepts
    const hintOnlyWords = [...hintWords].filter(w => !challengeWords.has(w) && !goalWords.has(w));
    if (hintOnlyWords.length > 5) {
      warnings.push({
        section: "Hint Scope",
        message: `The hint introduces ${hintOnlyWords.length} terms not found in the challenge or learning objective (e.g., "${hintOnlyWords.slice(0, 3).join(", ")}"). This may distract from the core concept.`,
        severity: "low",
      });
    }

    // 5. Length balance check
    const goalLength = exercise.learningGoal.split(/\s+/).length;
    const challengeLength = exercise.challenge.split(/\s+/).length;
    const hintLength = exercise.promptHint.split(/\s+/).length;

    if (challengeLength < 5) {
      warnings.push({
        section: "Your Challenge",
        message: "The challenge is very short. Students may need more context to understand the task.",
        severity: "medium",
      });
    }

    if (hintLength > goalLength * 3 && goalLength > 0) {
      warnings.push({
        section: "Hint Verbosity",
        message: "The hint is disproportionately long compared to the learning objective. It may give away too much.",
        severity: "low",
      });
    }

    const alignment = warnings.length === 0 ? "strong" : warnings.filter(w => w.severity === "high").length > 0 ? "weak" : "moderate";

    res.json({
      exerciseId: exercise.id,
      alignment,
      warnings,
      sections: {
        learningObjective: exercise.learningGoal,
        challenge: exercise.challenge,
        hint: exercise.promptHint,
      },
    });
  } catch (err) { next(err); }
});

export default router;
