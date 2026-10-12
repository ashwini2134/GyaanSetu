import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { z } from "zod";
import { awardXp } from "../services/gamificationService.js";
import { sendNotification } from "../services/notificationService.js";
import { COURSE_LECTURE_COUNTS } from "./courses.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const archiver: (...args: any[]) => any = require("archiver");

const router = Router();

const projectCompleteSchema = z.object({
  courseSlug: z.string(),
  lectureId: z.string(),
  projectId: z.string(),
  githubUrl: z.string().optional(),
});

router.get("/templates/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const template = await prisma.projectTemplate.findUnique({
      where: { id: id as string },
    });
    
    if (!template) {
      res.status(404).json({ error: "Project template not found" });
      return;
    }
    
    res.json(template);
  } catch (error) {
    console.error("Error fetching project template:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/complete", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { courseSlug, lectureId, projectId, githubUrl } = projectCompleteSchema.parse(req.body);

    const capstoneLectureId = String(COURSE_LECTURE_COUNTS[courseSlug] - 1);
    if (lectureId === capstoneLectureId) {
      const existingCompletedCapstone = await prisma.progress.findFirst({
        where: {
          userId,
          courseSlug,
          lectureId: capstoneLectureId,
          projectCompleted: true,
          projectId: {
            not: projectId,
          },
        },
      });

      if (existingCompletedCapstone) {
        res.status(400).json({
          error: "You have already completed your capstone project. Only one capstone project can be submitted per course.",
        });
        return;
      }
    }

    const progress = await prisma.progress.upsert({
      where: {
        userId_courseSlug_lectureId: {
          userId,
          courseSlug,
          lectureId,
        },
      },
      update: {
        projectCompleted: true,
        projectId: projectId,
        status: "COMPLETED",
        completedAt: new Date(),
      },
      create: {
        userId,
        courseSlug,
        lectureId,
        status: "COMPLETED",
        projectCompleted: true,
        projectId: projectId,
        completedAt: new Date(),
      },
    });

    // Also create/update project entry for leaderboard tracking
    await prisma.project.upsert({
      where: {
        userId_projectId: {
          userId,
          projectId
        }
      },
      update: {
        status: "COMPLETED",
        completedAt: new Date(),
        ...(githubUrl ? { githubUrl } : {})
      },
      create: {
        userId,
        projectId,
        code: "",
        status: "COMPLETED",
        completedAt: new Date(),
        ...(githubUrl ? { githubUrl } : {})
      }
    });

    await awardXp(userId, 100, "Completed Project", `project_complete_${courseSlug}_${projectId}`);

    await sendNotification(
      userId,
      "milestone_submitted",
      "Milestone Submitted",
      `You completed the project "${projectId}" in ${courseSlug}.`,
      `/course/${courseSlug}`,
      "medium"
    );

    res.json(progress);
  } catch (error) {
    next(error);
  }
});

/* GET /api/projects/files/:projectId — load all files for live workspace */
router.get("/files/:projectId", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = req.params.projectId as string;

    const dbFiles = await prisma.projectFile.findMany({
      where: { userId, projectId },
    });

    const fileMap = dbFiles.reduce((acc, f) => {
      acc[f.fileId] = f.content;
      return acc;
    }, {} as Record<string, string>);

    res.json(fileMap);
  } catch (err) {
    next(err);
  }
});

/* PUT /api/projects/files/:projectId — save one file */
const saveFileSchema = z.object({
  fileId: z.string(),
  content: z.string(),
});

router.put("/files/:projectId", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = req.params.projectId as string;
    const { fileId, content } = saveFileSchema.parse(req.body);

    await prisma.projectFile.upsert({
      where: {
        userId_projectId_fileId: { userId, projectId, fileId },
      },
      update: { content },
      create: { userId, projectId, fileId, content },
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

/* GET /api/projects/download/:projectId — download project as ZIP */
router.get("/download/:projectId", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = req.params.projectId as string;

    const dbFiles = await prisma.projectFile.findMany({
      where: { userId, projectId },
    });

    if (dbFiles.length === 0) {
      res.status(404).json({ error: "No files found for this project" });
      return;
    }

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${projectId}.zip"`);

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);

    for (const f of dbFiles) {
      const fileName = f.fileId === "html" ? "index.html"
        : f.fileId === "css" ? "style.css"
        : f.fileId === "js" ? "script.js"
        : `${f.fileId}.txt`;
      archive.append(f.content, { name: fileName });
    }

    await archive.finalize();
  } catch (err) {
    next(err);
  }
});

// Admin: list pending projects for review
router.get("/admin/pending", requireAuth, requireRole("admin"), async (_req: AuthenticatedRequest, res, next) => {
  try {
    const pending = await prisma.project.findMany({
      where: { status: "PENDING_REVIEW" },
      orderBy: { completedAt: "asc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
    res.json({ pending });
  } catch (err) {
    next(err);
  }
});

const reviewSchema = z.object({ userId: z.string(), notes: z.string().optional() });

router.post("/admin/approve/:projectId", requireAuth, requireRole("admin"), async (req: AuthenticatedRequest, res, next) => {
  try {
    const projectId = req.params.projectId as string;
    const { userId, notes } = reviewSchema.parse(req.body);

    const project = await prisma.project.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const updated = await prisma.project.update({
      where: { userId_projectId: { userId, projectId } },
      data: { status: "COMPLETED" },
    });

    await awardXp(userId, 150, "Approved Project", `general_project_approved_${projectId}`);

    await sendNotification(
      userId,
      "milestone_approved",
      "Milestone Approved",
      `Your project "${projectId}" has been approved${notes ? ` — ${notes}` : ""}.`,
      "/projects",
      "high"
    );

    // Resolve review queue item
    await prisma.reviewQueue.updateMany({
      where: { itemType: "project", itemId: projectId, userId, status: "pending" },
      data: { status: "resolved", resolvedAt: new Date(), resolvedBy: req.user!.id, notes: notes ?? null },
    });

    res.json({ project: updated });
  } catch (err) {
    next(err);
  }
});

router.post("/admin/reject/:projectId", requireAuth, requireRole("admin"), async (req: AuthenticatedRequest, res, next) => {
  try {
    const projectId = req.params.projectId as string;
    const { userId, notes } = reviewSchema.parse(req.body);

    const project = await prisma.project.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const updated = await prisma.project.update({
      where: { userId_projectId: { userId, projectId } },
      data: { status: "REJECTED" },
    });

    await sendNotification(
      userId,
      "project_rejected",
      "Project Needs Revision",
      `Your project "${projectId}" needs changes${notes ? ` — ${notes}` : ""}. Please review and resubmit.`,
      "/projects",
      "high"
    );

    // Reject review queue item
    await prisma.reviewQueue.updateMany({
      where: { itemType: "project", itemId: projectId, userId, status: "pending" },
      data: { status: "rejected", resolvedAt: new Date(), resolvedBy: req.user!.id, notes: notes ?? null },
    });

    res.json({ project: updated });
  } catch (err) {
    next(err);
  }
});

router.get("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const templates = await prisma.projectTemplate.findMany();
    const userProjects = await prisma.project.findMany({ where: { userId } });
    
    const projectMap = new Map(userProjects.map(p => [p.projectId, p]));
    
    const result = templates.map(t => {
      const p = projectMap.get(t.id);
      return {
        ...t,
        status: p ? p.status : "NOT_STARTED",
        code: p?.code,
        startedAt: p?.startedAt,
        completedAt: p?.completedAt,
        githubUrl: p?.githubUrl,
        liveDemoUrl: p?.liveDemoUrl,
        submittedDescription: p?.description
      };
    });
    
    res.json(result);
  } catch(e) { next(e); }
});

router.get("/:projectId", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = req.params.projectId as string;
    // ensure it's not matching 'status'
    if (projectId === "status") return next();

    const t = await prisma.projectTemplate.findUnique({ where: { id: projectId } });
    if (!t) return res.status(404).json({ error: "Not found" });
    const p = await prisma.project.findUnique({ where: { userId_projectId: { userId, projectId } } });
    res.json({
      ...t,
      status: p ? p.status : "NOT_STARTED",
      code: p?.code,
      startedAt: p?.startedAt,
      completedAt: p?.completedAt,
      githubUrl: p?.githubUrl,
      liveDemoUrl: p?.liveDemoUrl,
      submittedDescription: p?.description
    });
  } catch(e) { next(e); }
});

router.get("/status", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const projects = await prisma.project.findMany({
      where: { userId }
    });
    const statusMap = projects.reduce((acc, p) => {
      acc[p.projectId] = {
        status: p.status,
        githubUrl: p.githubUrl,
        liveDemoUrl: p.liveDemoUrl,
        description: p.description
      };
      return acc;
    }, {} as Record<string, any>);
    res.json(statusMap);
  } catch (err) {
    next(err);
  }
});

router.patch("/:projectId/start", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = req.params.projectId as string;

    const project = await prisma.project.upsert({
      where: {
        userId_projectId: {
          userId,
          projectId
        }
      },
      update: {
        status: "IN_PROGRESS",
        startedAt: new Date()
      },
      create: {
        userId,
        projectId,
        code: "",
        status: "IN_PROGRESS",
        startedAt: new Date()
      }
    });

    res.json(project);
  } catch (err) {
    next(err);
  }
});

router.patch("/:projectId/complete", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = req.params.projectId as string;

    const { code, githubUrl, liveDemoUrl, description } = req.body;

    const project = await prisma.project.upsert({
      where: {
        userId_projectId: {
          userId,
          projectId
        }
      },
      update: {
        status: "PENDING_REVIEW",
        code: code || "",
        githubUrl,
        liveDemoUrl,
        description,
        completedAt: new Date()
      },
      create: {
        userId,
        projectId,
        code: code || "",
        githubUrl,
        liveDemoUrl,
        description,
        status: "PENDING_REVIEW",
        completedAt: new Date()
      }
    });

    await sendNotification(
      userId,
      "milestone_submitted",
      "Milestone Submitted",
      `Your project "${projectId}" has been submitted and is pending admin review.`,
      "/projects",
      "medium"
    );

    // Insert into review queue
    await prisma.reviewQueue.create({
      data: {
        itemType: "project",
        itemId: projectId,
        userId,
        priority: "medium",
        status: "pending",
        title: `Project: ${projectId}`,
        description: description || `Project "${projectId}" submitted for review`,
        metadata: { githubUrl, liveDemoUrl },
      },
    });

    res.json(project);
  } catch (err) {
    next(err);
  }
});

export default router;
