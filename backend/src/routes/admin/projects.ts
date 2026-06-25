// Fraylon - Phase 2.5 & 3
import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";

const router = Router({ mergeParams: true });
import { prisma } from "../../prisma.js";

router.use(requireAuth, requireRole('admin'));

router.get("/courses/:courseId/project", async (req, res) => {
  const project = await prisma.courseProject.findUnique({
    where: { courseId: req.params.courseId }
  });
  res.json(project || null);
});

router.post("/courses/:courseId/project", async (req, res) => {
  const project = await prisma.courseProject.upsert({
    where: { courseId: req.params.courseId },
    update: req.body,
    create: { courseId: req.params.courseId, ...req.body }
  });
  res.json(project);
});

router.patch("/courses/:courseId/project", async (req, res) => {
  const project = await prisma.courseProject.update({
    where: { courseId: req.params.courseId },
    data: req.body
  });
  res.json(project);
});

export default router;
