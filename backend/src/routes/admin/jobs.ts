import { Router } from "express";
import { prisma } from "../../prisma.js";
import type { Prisma } from "@prisma/client";

const router = Router({ mergeParams: true });

function mapProjectSubmissionStatus(status: string) {
  if (status === "PENDING" || status === "REVIEWING") return "pending";
  if (status === "APPROVED" || status === "REJECTED") return "completed";
  if (status === "ERROR") return "failed";
  return "pending";
}

router.get("/", async (req, res, next) => {
  try {
    const statusFilter = (req.query.status as string) || "all";
    const search = (req.query.search as string) || "";
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 20);

    // Fetch from ProjectSubmission
    const psWhere: Prisma.ProjectSubmissionWhereInput = {};
    if (statusFilter === "pending") {
      psWhere.status = { in: ["PENDING", "REVIEWING"] };
    } else if (statusFilter === "completed") {
      psWhere.status = { in: ["APPROVED", "REJECTED"] };
    } else if (statusFilter === "failed") {
      psWhere.status = "ERROR";
    }

    const submissions = await prisma.projectSubmission.findMany({
      where: psWhere,
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100, // Fetch top 100 of each for combining, then sort
    });

    // Fetch from QuizAttempt
    const qaWhere: Prisma.QuizAttemptWhereInput = {};
    let attempts: any[] = [];
    if (statusFilter === "all" || statusFilter === "completed") {
      attempts = await prisma.quizAttempt.findMany({
        where: qaWhere,
        include: {
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
    }

    // Fetch from Certificate
    let certs: any[] = [];
    if (statusFilter === "all" || statusFilter === "completed") {
      certs = await prisma.certificate.findMany({
        orderBy: { issuedAt: "desc" },
        take: 100,
      });
    }

    // Fetch related courses
    const allCIds = [...new Set([
      ...submissions.map(s => s.courseId).filter(Boolean),
      ...attempts.map(a => a.courseId).filter(Boolean),
      ...certs.map(c => c.courseId).filter(Boolean)
    ])] as string[];

    const relatedCourses = await prisma.course.findMany({
      where: { id: { in: allCIds } },
      select: { id: true, title: true }
    });
    const courseMap = new Map(relatedCourses.map(c => [c.id, c.title]));

    // Fetch related users for certs
    const certUserIds = [...new Set(certs.map(c => c.studentId))];
    const certUsers = await prisma.user.findMany({
      where: { id: { in: certUserIds } },
      select: { id: true, name: true, email: true }
    });
    const userMap = new Map(certUsers.map(u => [u.id, u]));

    // Map Submissions
    const mappedSubmissions = submissions.map(ps => ({
      id: ps.id,
      type: "ai_review",
      studentName: ps.user?.name || "Unknown Student",
      studentEmail: ps.user?.email || "",
      courseName: ps.courseId ? (courseMap.get(ps.courseId) || "—") : "—",
      status: mapProjectSubmissionStatus(ps.status),
      submissionStatus: ps.status,
      score: ps.score,
      createdAt: ps.createdAt,
      completedAt: ps.status === "PENDING" || ps.status === "REVIEWING" ? null : ps.updatedAt,
    }));

    // Map Attempts
    const mappedAttempts = attempts.map(qa => ({
      id: qa.id,
      type: "quiz_grade",
      studentName: qa.user?.name || "Unknown Student",
      studentEmail: qa.user?.email || "",
      courseName: qa.courseId ? (courseMap.get(qa.courseId) || "—") : "—",
      status: "completed",
      score: qa.score,
      createdAt: qa.createdAt,
      completedAt: qa.createdAt,
    }));

    // Map Certs
    const mappedCerts = certs.map(cert => {
      const user = userMap.get(cert.studentId);
      return {
        id: cert.id,
        type: "certificate",
        studentName: user?.name || "Unknown Student",
        studentEmail: user?.email || "",
        courseName: courseMap.get(cert.courseId) || "—",
        status: "completed",
        createdAt: cert.issuedAt,
        completedAt: cert.issuedAt,
      };
    });

    // Combine all
    let allJobs = [
      ...mappedSubmissions,
      ...mappedAttempts,
      ...mappedCerts
    ];

    // Apply search filter (client-side in-memory)
    if (search) {
      const searchLower = search.toLowerCase();
      allJobs = allJobs.filter(j => 
        j.studentName.toLowerCase().includes(searchLower) ||
        j.studentEmail.toLowerCase().includes(searchLower) ||
        j.courseName.toLowerCase().includes(searchLower)
      );
    }

    // Sort by createdAt desc
    allJobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Compute summary stats before pagination
    const total = allJobs.length;
    let completedCount = 0;
    let pendingCount = 0;
    let failedCount = 0;

    for (const job of allJobs) {
      if (job.status === "completed") completedCount++;
      else if (job.status === "pending") pendingCount++;
      else if (job.status === "failed") failedCount++;
    }

    // Paginate
    const totalPages = Math.ceil(total / limit);
    const paginatedJobs = allJobs.slice((page - 1) * limit, page * limit);

    res.json({
      jobs: paginatedJobs,
      total,
      page,
      totalPages,
      summary: {
        total,
        completed: completedCount,
        pending: pendingCount,
        failed: failedCount
      }
    });

  } catch (error) {
    next(error);
  }
});

router.get("/:jobId", async (req, res, next) => {
  try {
    const { jobId } = req.params;

    // Check ProjectSubmission first
    const ps = await prisma.projectSubmission.findUnique({
      where: { id: jobId },
      include: {
        user: { select: { name: true, email: true } },
      }
    });

    if (ps) {
      const course = ps.courseId ? await prisma.course.findUnique({ where: { id: ps.courseId }}) : null;
      return res.json({
        id: ps.id,
        type: "ai_review",
        studentName: ps.user?.name || "Unknown Student",
        studentEmail: ps.user?.email || "",
        courseName: course?.title || "—",
        status: mapProjectSubmissionStatus(ps.status),
        submissionStatus: ps.status,
        score: ps.score,
        maxScore: ps.maxScore,
        feedback: ps.feedback,
        aiReview: ps.aiReview,
        securityCheck: ps.securityCheck,
        validationCheck: ps.validationCheck,
        createdAt: ps.createdAt,
        completedAt: ps.status === "PENDING" || ps.status === "REVIEWING" ? null : ps.updatedAt,
      });
    }

    // Check QuizAttempt
    const qa = await prisma.quizAttempt.findUnique({
      where: { id: jobId },
      include: {
        user: { select: { name: true, email: true } },
      }
    });

    if (qa) {
      const course = qa.courseId ? await prisma.course.findUnique({ where: { id: qa.courseId }}) : null;
      return res.json({
        id: qa.id,
        type: "quiz_grade",
        studentName: qa.user?.name || "Unknown Student",
        studentEmail: qa.user?.email || "",
        courseName: course?.title || "—",
        status: "completed",
        score: qa.score,
        passed: qa.passed,
        attemptNumber: qa.attemptNumber,
        createdAt: qa.createdAt,
        completedAt: qa.createdAt,
      });
    }

    // Check Certificate
    const cert = await prisma.certificate.findUnique({
      where: { id: jobId }
    });

    if (cert) {
      const user = await prisma.user.findUnique({ where: { id: cert.studentId } });
      const course = await prisma.course.findUnique({ where: { id: cert.courseId } });
      return res.json({
        id: cert.id,
        type: "certificate",
        studentName: user?.name || "Unknown Student",
        studentEmail: user?.email || "",
        courseName: course?.title || "—",
        status: "completed",
        verificationId: cert.verificationId,
        pdfUrl: cert.pdfUrl,
        createdAt: cert.issuedAt,
        completedAt: cert.issuedAt,
      });
    }

    return res.status(404).json({ error: "Job not found" });
  } catch (error) {
    next(error);
  }
});

router.post("/:jobId/retry", async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const ps = await prisma.projectSubmission.findUnique({
      where: { id: jobId }
    });

    if (!ps) {
      return res.status(404).json({ success: false, message: "This job cannot be retried (not found)" });
    }

    if (ps.status !== "ERROR") {
      return res.status(400).json({ success: false, message: "This job is not in a failed state" });
    }

    await prisma.projectSubmission.update({
      where: { id: jobId },
      data: { status: "PENDING" }
    });
    
    return res.json({ success: true, message: "Job queued for retry" });
  } catch (error) {
    next(error);
  }
});

export default router;
