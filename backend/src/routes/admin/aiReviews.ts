import { Router } from "express";
import { prisma } from "../../prisma.js";
import type { Prisma } from "@prisma/client";

const router = Router({ mergeParams: true });

// GET /api/admin/ai-reviews
router.get("/", async (req, res, next) => {
  try {
    const statusFilter = (req.query.status as string) || "all";
    const search = (req.query.search as string) || "";
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 20);

    const where: Prisma.ProjectSubmissionWhereInput = {
      // By default, show AI reviews that are done (APPROVED/REJECTED) plus
      // anything the AI couldn't score at all — those need a human most.
      status: { in: ["APPROVED", "REJECTED", "NEEDS_REVIEW"] }
    };

    if (statusFilter === "passed") {
      where.status = "APPROVED";
      where.isOverridden = false;
    } else if (statusFilter === "failed") {
      where.status = "REJECTED";
      where.isOverridden = false;
    } else if (statusFilter === "needs_review") {
      where.status = "NEEDS_REVIEW";
    } else if (statusFilter === "overridden") {
      where.isOverridden = true;
    }

    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } }
        ]
      };
    }

    const total = await prisma.projectSubmission.count({ where });
    const submissions = await prisma.projectSubmission.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Summary stats for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalToday = await prisma.projectSubmission.count({
      where: {
        status: { in: ["APPROVED", "REJECTED"] },
        updatedAt: { gte: today }
      }
    });

    const passedToday = await prisma.projectSubmission.count({
      where: {
        status: "APPROVED",
        updatedAt: { gte: today }
      }
    });

    const totalOverrides = await prisma.projectSubmission.count({
      where: { isOverridden: true }
    });

    const passRateToday = totalToday > 0 ? Math.round((passedToday / totalToday) * 100) : 0;

    // Fetch related course names
    const courseIds = [...new Set(submissions.map(s => s.courseId).filter(Boolean))] as string[];
    const courses = await prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: { id: true, title: true }
    });
    const courseMap = new Map(courses.map(c => [c.id, c.title]));

    const mappedSubmissions = submissions.map(s => ({
      ...s,
      courseName: s.courseId ? (courseMap.get(s.courseId) || s.courseId) : "Unknown Course",
    }));

    return res.json({
      reviews: mappedSubmissions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      stats: {
        totalToday,
        passRateToday,
        totalOverrides
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/ai-reviews/:submissionId
router.get("/:submissionId", async (req, res, next) => {
  try {
    const { submissionId } = req.params;

    const submission = await prisma.projectSubmission.findUnique({
      where: { id: submissionId },
      include: {
        user: { select: { name: true, email: true } },
      }
    });

    if (!submission) return res.status(404).json({ error: "Submission not found" });

    let courseName = "Unknown Course";
    if (submission.courseId) {
      const course = await prisma.course.findUnique({ where: { id: submission.courseId } });
      if (course) courseName = course.title;
    }

    return res.json({
      ...submission,
      courseName,
      projectName: "Unknown Project"
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/ai-reviews/:submissionId/override
router.post("/:submissionId/override", async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const { overrideScore, reason } = req.body;
    const adminId = (req as any).user?.id || "admin";

    const submission = await prisma.projectSubmission.findUnique({
      where: { id: submissionId }
    });

    if (!submission) return res.status(404).json({ error: "Submission not found" });

    const updated = await prisma.projectSubmission.update({
      where: { id: submissionId },
      data: {
        status: "APPROVED",
        score: parseInt(overrideScore, 10),
        feedback: `Manually approved by admin: ${reason}`,
        isOverridden: true,
        overrideReason: reason,
        overriddenBy: adminId,
        overriddenAt: new Date()
      }
    });

    return res.json({ success: true, submission: updated });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/ai-reviews/:submissionId/flag
router.post("/:submissionId/flag", async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    
    const submission = await prisma.projectSubmission.findUnique({
      where: { id: submissionId }
    });

    if (!submission) return res.status(404).json({ error: "Submission not found" });

    const updated = await prisma.projectSubmission.update({
      where: { id: submissionId },
      data: {
        isFlagged: !submission.isFlagged
      }
    });

    return res.json({ success: true, isFlagged: updated.isFlagged });
  } catch (error) {
    next(error);
  }
});

export default router;
