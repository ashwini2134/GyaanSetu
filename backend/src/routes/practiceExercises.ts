import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { z } from "zod";
import { awardXp } from "../services/gamificationService.js";
import { generateContent } from "../services/gemini.js";

const router = Router();

const generateSchema = z.object({
  lessonId: z.string(),
  prompt: z.string().min(1),
  exerciseType: z.string(),
  exerciseTitle: z.string(),
  exerciseDescription: z.string(),
  systemInstruction: z.string(),
});

router.post("/generate", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { prompt, systemInstruction } = generateSchema.parse(req.body);
    const generatedOutput = await generateContent(systemInstruction, prompt);
    res.json({ generatedOutput });
  } catch (error) {
    next(error);
  }
});

const submitSchema = z.object({
  courseId: z.string(),
  lectureId: z.string(),
  prompt: z.string().min(1),
  response: z.string().min(1),
});

router.post("/:courseId/:lectureId/submit", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const courseId = String(req.params.courseId);
    const lectureId = String(req.params.lectureId);
    const { prompt, response } = submitSchema.parse(req.body);

    const existing = await prisma.practiceSubmission.findUnique({
      where: {
        userId_courseId_lectureId: { userId, courseId, lectureId },
      },
    });
    if (existing) {
      res.status(409).json({ error: "Practice already completed for this lecture" });
      return;
    }

    const submission = await prisma.practiceSubmission.create({
      data: {
        userId,
        courseId,
        lectureId,
        prompt,
        response,
        completed: true,
      },
    });

    await awardXp(userId, 30, "AI Practice Completed", `practice_${courseId}_${lectureId}`);

    await prisma.progress.upsert({
      where: {
        userId_courseSlug_lectureId: { userId, courseSlug: courseId, lectureId },
      },
      update: { practiceCompleted: true },
      create: {
        userId,
        courseSlug: courseId,
        lectureId,
        status: "STARTED",
        practiceCompleted: true,
      },
    });

    res.json({ submission, xpAwarded: 30 });
  } catch (error) {
    next(error);
  }
});

router.get("/:courseId/:lectureId/status", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const courseId = String(req.params.courseId);
    const lectureId = String(req.params.lectureId);

    const submission = await prisma.practiceSubmission.findUnique({
      where: {
        userId_courseId_lectureId: { userId, courseId, lectureId },
      },
    });

    res.json({
      completed: submission?.completed ?? false,
      submission: submission ?? null,
    });
  } catch (error) {
    next(error);
  }
});

// Student-facing: get practice exercise config from database
router.get("/config/:courseId/:lectureId", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const courseId = String(req.params.courseId);
    const lectureId = String(req.params.lectureId);
    const sectionId = req.query.sectionId ? String(req.query.sectionId) : null;

    const where: any = {
      courseId,
      lectureId,
      status: "published",
    };
    if (sectionId) where.sectionId = sectionId;

    const exercise = await prisma.practiceExercise.findFirst({
      where,
      orderBy: { updatedAt: "desc" },
    });

    if (!exercise) {
      res.json({ exercise: null });
      return;
    }

    // Map DB fields to the student-facing config shape
    const dragDropConfig = exercise.type === 'drag_drop'
      ? (exercise.validationRules as { zones: { id: string; label: string }[]; cards: { id: string; text: string; correctZone: string }[] } | null)
      : null;

    const hierarchyExpandConfig = exercise.type === 'hierarchy_expand'
      ? (exercise.validationRules as {
          root: { label: string; icon: string };
          child: { label: string; icon: string };
          grandchild: { label: string; icon: string };
          theme?: string;
          onboarding?: string[];
          completionMessage?: string;
          steps: { id: string; type: string; question?: string; options?: string[]; correctIndex?: number; correctIndices?: number[]; items?: { label: string; icon: string; category?: string; explanation?: string }[] }[];
          finalTree: { label: string; icon: string; children: { label: string; icon: string; children?: { label: string; icon: string }[] }[] }[];
          nonAIExamples: string[];
        } | null)
      : null;

    res.json({
      exercise: {
        id: exercise.id,
        title: exercise.title,
        learningGoal: exercise.learningGoal,
        challenge: exercise.challenge,
        promptHint: exercise.promptHint,
        systemInstruction: exercise.systemInstruction,
        successCriteria: exercise.completionCriteria as string[] | [],
        type: exercise.type,
        difficulty: exercise.difficulty,
        estimatedTime: exercise.estimatedTime,
        dragDropConfig: dragDropConfig ?? undefined,
        hierarchyExpandConfig: hierarchyExpandConfig ?? undefined,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
