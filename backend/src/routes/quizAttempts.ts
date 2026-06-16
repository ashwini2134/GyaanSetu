import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { z } from "zod";

const router = Router();

router.get("/:quizId", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const quizId = req.params.quizId as string;

    const attempts = await prisma.quizAttempt.findMany({
      where: { userId, quizId },
      orderBy: { createdAt: "asc" }
    });

    const mappedAttempts = attempts.map(attempt => ({
      id: attempt.id,
      timestamp: attempt.createdAt.getTime(),
      score: attempt.score,
      total: attempt.total,
      details: attempt.answers
    }));

    res.json(mappedAttempts);
  } catch (error) {
    next(error);
  }
});

const postAttemptSchema = z.object({
  quizId: z.string(),
  score: z.number(),
  total: z.number(),
  passed: z.boolean(),
  answers: z.any()
});

router.post("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { quizId, score, total, passed, answers } = postAttemptSchema.parse(req.body);

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        score,
        total,
        passed,
        answers
      }
    });

    res.json({
      id: attempt.id,
      timestamp: attempt.createdAt.getTime(),
      score: attempt.score,
      total: attempt.total,
      details: attempt.answers
    });
  } catch (error) {
    next(error);
  }
});

export default router;
