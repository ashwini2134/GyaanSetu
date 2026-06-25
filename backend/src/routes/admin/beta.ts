// Fraylon - Phase 2.5 & 3
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth, requireRole } from "../../middleware/auth.js";

const router = Router({ mergeParams: true });
const prisma = new PrismaClient();

router.use(requireAuth, requireRole('admin'));

router.get("/courses/:courseId/beta", async (req, res) => {
  const testers = await prisma.betaTester.findMany({ where: { courseId: req.params.courseId } });
  const feedback = await prisma.betaFeedback.findMany({ where: { courseId: req.params.courseId } });
  
  res.json({ isBetaMode: true, testers, feedback });
});

router.patch("/courses/:courseId/beta/toggle", async (req, res) => {
  res.json({ success: true });
});

router.post("/courses/:courseId/beta/testers", async (req, res) => {
  const t = await prisma.betaTester.create({
    data: { courseId: req.params.courseId, userId: req.body.userId }
  });
  res.json(t);
});

router.delete("/courses/:courseId/beta/testers/:userId", async (req, res) => {
  await prisma.betaTester.delete({
    where: { courseId_userId: { courseId: req.params.courseId, userId: req.params.userId } }
  });
  res.json({ success: true });
});

router.get("/courses/:courseId/beta/feedback", async (req, res) => {
  const feedback = await prisma.betaFeedback.findMany({ where: { courseId: req.params.courseId } });
  res.json(feedback);
});

router.patch("/beta/feedback/:feedbackId/review", async (req, res) => {
  const feedback = await prisma.betaFeedback.update({
    where: { id: req.params.feedbackId },
    data: { isReviewed: true }
  });
  res.json(feedback);
});

export default router;
