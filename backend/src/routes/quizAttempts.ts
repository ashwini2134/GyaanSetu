import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const attempts = await prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
    res.json(attempts);
  } catch (error) {
    next(error);
  }
});

router.get("/:lectureId", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const lectureId = req.params.lectureId as string;

    const attempts = await prisma.quizAttempt.findMany({
      where: { userId, lectureId },
      orderBy: { createdAt: "asc" }
    });

    const mappedAttempts = attempts.map(attempt => ({
      id: attempt.id,
      timestamp: attempt.createdAt.getTime(),
      score: attempt.score,
      passed: attempt.passed,
      details: attempt.answers,
      feedback: attempt.feedback
    }));

    res.json(mappedAttempts);
  } catch (error) {
    next(error);
  }
});

export default router;
