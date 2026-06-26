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
    const { lectureId, courseId, answers, questions } = submitQuizSchema.parse(req.body);

    const result = await gradeQuiz(userId, lectureId, courseId, answers, questions);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
