import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { z } from "zod";
import { gradeQuiz } from "../services/quizGradingService.js";

const router = Router();

const submitQuizSchema = z.object({
  lectureId: z.string(),
  courseId: z.string(),
  answers: z.record(z.string()),
  timeTaken: z.number().optional(),
  questions: z.array(z.object({
    id: z.string(),
    correctAnswer: z.string(),
    explanation: z.string().optional(),
    points: z.number()
  }))
});

router.post("/submit", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { lectureId, courseId, answers, timeTaken, questions } = submitQuizSchema.parse(req.body);

    const result = await gradeQuiz(userId, lectureId, courseId, answers, questions, timeTaken);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/:courseId/:lectureId/attempts", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { courseId, lectureId } = req.params;
    
    // We import prisma here or from a shared file, let's just use the service since we need to query
    const { prisma } = await import("../prisma.js");
    
    const attempts = await prisma.quizAttempt.findMany({
      where: { userId, courseId: courseId as string, lectureId: lectureId as string },
      orderBy: { createdAt: 'desc' }
    });
    
    const bestScore = attempts.reduce((max, attempt) => Math.max(max, attempt.score), 0);
    
    res.json({
      attempts,
      bestScore,
      totalAttempts: attempts.length
    });
  } catch (error) {
    next(error);
  }
});

export default router;
