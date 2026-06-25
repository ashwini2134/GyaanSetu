// Fraylon - Phase 2.5 & 3
import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";

const router = Router({ mergeParams: true });
import { prisma } from "../../prisma.js";

router.use(requireAuth, requireRole('admin'));

router.get("/courses/:courseId/quiz", async (req, res) => {
  const quiz = await prisma.quiz.findUnique({
    where: { courseId: req.params.courseId },
    include: { questions: { orderBy: { order: 'asc' } } }
  });
  res.json(quiz || null);
});

router.post("/courses/:courseId/quiz", async (req, res) => {
  const { passScore, timeLimit, maxAttempts, shuffle } = req.body;
  const quiz = await prisma.quiz.upsert({
    where: { courseId: req.params.courseId },
    update: { passScore, timeLimit, maxAttempts, shuffle },
    create: { courseId: req.params.courseId, passScore, timeLimit, maxAttempts, shuffle }
  });
  res.json(quiz);
});

router.post("/courses/:courseId/quiz/questions", async (req, res) => {
  const quiz = await prisma.quiz.findUnique({ where: { courseId: req.params.courseId } });
  if (!quiz) return res.status(404).json({ error: "Quiz settings not created yet" });

  const maxOrder = await prisma.quizQuestion.aggregate({
    where: { quizId: quiz.id },
    _max: { order: true }
  });
  const order = (maxOrder._max.order || 0) + 1;

  const question = await prisma.quizQuestion.create({
    data: { quizId: quiz.id, ...req.body, order }
  });
  res.json(question);
});

router.patch("/quiz/questions/:questionId", async (req, res) => {
  const question = await prisma.quizQuestion.update({
    where: { id: req.params.questionId },
    data: req.body
  });
  res.json(question);
});

router.delete("/quiz/questions/:questionId", async (req, res) => {
  await prisma.quizQuestion.delete({ where: { id: req.params.questionId } });
  res.json({ success: true });
});

router.patch("/courses/:courseId/quiz/questions/reorder", async (req, res) => {
  const { questionIds } = req.body;
  for (let i = 0; i < questionIds.length; i++) {
    await prisma.quizQuestion.update({
      where: { id: questionIds[i] },
      data: { order: i }
    });
  }
  res.json({ success: true });
});

export default router;
