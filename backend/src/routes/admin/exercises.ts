// Fraylon - Phase 2.5 & 3
import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";

const router = Router({ mergeParams: true });
import { prisma } from "../../prisma.js";

router.use(requireAuth, requireRole('admin'));

router.get("/lessons/:lessonId/exercises", async (req, res) => {
  const exercises = await prisma.exercise.findMany({
    where: { lessonId: req.params.lessonId }
  });
  res.json(exercises);
});

router.post("/lessons/:lessonId/exercises", async (req, res) => {
  const { type, question, options, correctAnswer, hints, attemptsAllowed, points } = req.body;
  const exercise = await prisma.exercise.create({
    data: { lessonId: req.params.lessonId, type, question, options, correctAnswer, hints, attemptsAllowed, points }
  });
  res.json(exercise);
});

router.patch("/exercises/:exerciseId", async (req, res) => {
  const exercise = await prisma.exercise.update({
    where: { id: req.params.exerciseId },
    data: req.body
  });
  res.json(exercise);
});

router.delete("/exercises/:exerciseId", async (req, res) => {
  await prisma.exercise.delete({ where: { id: req.params.exerciseId } });
  res.json({ success: true });
});

export default router;
