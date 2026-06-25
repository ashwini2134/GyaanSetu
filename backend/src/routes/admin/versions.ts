// Fraylon - Phase 2.5 & 3
import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";

const router = Router({ mergeParams: true });
import { prisma } from "../../prisma.js";

router.use(requireAuth, requireRole('admin'));

router.get("/courses/:courseId/versions", async (req, res) => {
  const versions = await prisma.courseVersion.findMany({
    where: { courseId: req.params.courseId },
    orderBy: { versionNumber: 'desc' }
  });
  res.json(versions);
});

router.post("/courses/:courseId/versions", async (req, res) => {
  const course = await prisma.course.findUnique({
    where: { id: req.params.courseId },
    include: { lessons: true, quiz: { include: { questions: true } }, project: true }
  });

  const maxV = await prisma.courseVersion.aggregate({
    where: { courseId: req.params.courseId },
    _max: { versionNumber: true }
  });
  const vn = (maxV._max.versionNumber || 0) + 1;

  const v = await prisma.courseVersion.create({
    data: {
      courseId: req.params.courseId,
      versionNumber: vn,
      snapshot: course as any,
      changelog: `Saved snapshot v${vn}`
    }
  });
  res.json(v);
});

router.post("/courses/:courseId/versions/:versionId/restore", async (req, res) => {
  const v = await prisma.courseVersion.findUnique({ where: { id: req.params.versionId } });
  if (!v) return res.status(404).json({ error: "Not found" });

  const maxV = await prisma.courseVersion.aggregate({
    where: { courseId: req.params.courseId },
    _max: { versionNumber: true }
  });
  const vn = (maxV._max.versionNumber || 0) + 1;

  const restored = await prisma.courseVersion.create({
    data: {
      courseId: req.params.courseId,
      versionNumber: vn,
      snapshot: v.snapshot,
      changelog: `Restored from v${v.versionNumber}`
    }
  });
  res.json(restored);
});

export default router;
