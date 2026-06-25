// Fraylon - Phase 2.5 & 3
import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import multer from 'multer';
import fs from 'fs';

const router = Router();
import { prisma } from "../../prisma.js";

const uploadDir = 'uploads/thumbnails/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

router.use(requireAuth, requireRole('admin'));

router.get("/", async (req, res) => {
  const search = req.query.search as string;
  const status = req.query.status as string;

  const where: any = {};
  if (search) where.title = { contains: search, mode: 'insensitive' };
  if (status && status !== 'All') where.status = status.toUpperCase();

  const courses = await prisma.course.findMany({
    where,
    include: { _count: { select: { lessons: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json(courses);
});

router.post("/", async (req, res) => {
  const { title, description, thumbnailUrl, category, difficulty, estimatedDuration, prerequisites } = req.body;
  const course = await prisma.course.create({
    data: {
      title, description, thumbnailUrl, category, difficulty, estimatedDuration: parseInt(estimatedDuration) || 0,
      status: "DRAFT"
    }
  });
  res.json(course);
});

router.patch("/:id", async (req, res) => {
  const course = await prisma.course.update({
    where: { id: req.params.id },
    data: req.body
  });
  res.json(course);
});

router.patch("/:id/publish", async (req, res) => {
  const course = await prisma.course.findUnique({
    where: { id: req.params.id },
    include: { lessons: true, quiz: true, project: true }
  });

  if (!course) return res.status(404).json({ error: "Not found" });

  const missing = [];
  if (course.lessons.length === 0) missing.push("lessons");
  if (!course.quiz) missing.push("quiz");
  if (!course.project) missing.push("project");

  if (missing.length > 0) return res.status(400).json({ error: "Missing required sections", missing });

  const updated = await prisma.course.update({
    where: { id: req.params.id },
    data: { status: "PUBLISHED" }
  });

  await prisma.courseVersion.create({
    data: {
      courseId: course.id,
      versionNumber: 1,
      snapshot: course as any,
      changelog: `Published with ${course.lessons.length} lessons`
    }
  });

  res.json(updated);
});

router.patch("/:id/archive", async (req, res) => {
  const updated = await prisma.course.update({
    where: { id: req.params.id },
    data: { status: "ARCHIVED" }
  });
  res.json(updated);
});

router.get("/:id/publish-readiness", async (req, res) => {
  const course = await prisma.course.findUnique({
    where: { id: req.params.id },
    include: { lessons: true, quiz: true, project: true }
  });
  if (!course) return res.status(404).json({ error: "Not found" });
  res.json({
    hasLessons: course.lessons.length > 0,
    hasQuiz: !!course.quiz,
    hasProject: !!course.project
  });
});

router.post("/upload/thumbnail", upload.single('thumbnail'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  res.json({ url: `/uploads/thumbnails/${req.file.filename}` });
});

export default router;
