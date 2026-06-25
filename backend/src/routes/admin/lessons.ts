// Fraylon - Phase 2.5 & 3
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth, requireRole } from "../../middleware/auth.js";

const router = Router({ mergeParams: true });
const prisma = new PrismaClient();

router.use(requireAuth, requireRole('admin'));

router.get("/courses/:courseId/lessons", async (req, res) => {
  const lessons = await prisma.lesson.findMany({
    where: { courseId: req.params.courseId },
    orderBy: { order: 'asc' }
  });
  res.json(lessons);
});

router.post("/courses/:courseId/lessons", async (req, res) => {
  const { title, type } = req.body;
  const maxOrder = await prisma.lesson.aggregate({
    where: { courseId: req.params.courseId },
    _max: { order: true }
  });
  const order = (maxOrder._max.order || 0) + 1;

  const lesson = await prisma.lesson.create({
    data: { courseId: req.params.courseId, title, type: type || 'content', order }
  });
  res.json(lesson);
});

router.patch("/lessons/:lessonId", async (req, res) => {
  const lesson = await prisma.lesson.update({
    where: { id: req.params.lessonId },
    data: req.body
  });
  res.json(lesson);
});

router.delete("/lessons/:lessonId", async (req, res) => {
  await prisma.lesson.delete({ where: { id: req.params.lessonId } });
  res.json({ success: true });
});

router.patch("/courses/:courseId/lessons/reorder", async (req, res) => {
  const { lessonIds } = req.body;
  for (let i = 0; i < lessonIds.length; i++) {
    await prisma.lesson.update({
      where: { id: lessonIds[i] },
      data: { order: i }
    });
  }
  res.json({ success: true });
});

export default router;
