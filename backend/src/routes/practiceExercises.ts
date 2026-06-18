import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { z } from "zod";
import { awardXp } from "../services/gamificationService.js";

const router = Router();

router.get("/:lessonId", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const lessonId = String(req.params.lessonId);
    const exercises = await prisma.practiceExercise.findMany({
      where: { lessonId },
    });
    res.json(exercises);
  } catch (error) {
    next(error);
  }
});

const submitSchema = z.object({
  exerciseId: z.string(),
  promptUsed: z.string().min(1),
  generatedOutput: z.string().min(1),
  reflection: z.string().min(1),
});

router.post("/submit", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { exerciseId, promptUsed, generatedOutput, reflection } = submitSchema.parse(req.body);

    const existing = await prisma.practiceSubmission.findUnique({
      where: {
        userId_exerciseId: { userId, exerciseId },
      },
    });
    if (existing) {
      res.status(409).json({ error: "Already submitted this exercise" });
      return;
    }

    const exercise = await prisma.practiceExercise.findUnique({
      where: { id: exerciseId },
    });
    if (!exercise) {
      res.status(404).json({ error: "Practice exercise not found" });
      return;
    }

    const submission = await prisma.practiceSubmission.create({
      data: {
        exerciseId,
        userId,
        promptUsed,
        generatedOutput,
        reflection,
      },
    });

    await awardXp(userId, exercise.xpReward, "AI Practice Completed", `practice_exercise_${exerciseId}`);

    const lessonId = exercise.lessonId;
    const [courseSlug, lectureId] = lessonId.includes("_")
      ? [lessonId.split("_")[0], lessonId.split("_").slice(1).join("_")]
      : [lessonId, "0"];

    await prisma.progress.upsert({
      where: {
        userId_courseSlug_lectureId: { userId, courseSlug, lectureId },
      },
      update: { practiceCompleted: true },
      create: {
        userId,
        courseSlug,
        lectureId,
        status: "STARTED",
        practiceCompleted: true,
      },
    });

    res.json({ submission, xpAwarded: exercise.xpReward });
  } catch (error) {
    next(error);
  }
});

router.get("/submissions/:lessonId", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const lessonId = String(req.params.lessonId);
    const submissions = await prisma.practiceSubmission.findMany({
      where: {
        userId,
        exercise: { lessonId },
      },
      include: { exercise: true },
      orderBy: { submittedAt: "desc" },
    });
    res.json(submissions);
  } catch (error) {
    next(error);
  }
});

export default router;
