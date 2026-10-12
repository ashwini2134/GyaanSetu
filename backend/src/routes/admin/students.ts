import { Router } from "express";
import { prisma } from "../../prisma.js";
import type { Prisma } from "@prisma/client";

const router = Router({ mergeParams: true });

// GET /api/admin/students/blocked
router.get("/blocked", async (req, res, next) => {
  try {
    const blockedStudents: any[] = [];

    // Condition 1: Project stuck
    // ProjectSubmission WHERE status = 'PENDING' AND createdAt < NOW() - 48 hours
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const stuckProjects = await prisma.projectSubmission.findMany({
      where: {
        status: "PENDING",
        createdAt: {
          lt: fortyEightHoursAgo
        }
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      }
    });

    for (const proj of stuckProjects) {
      if (!proj.user) continue;
      blockedStudents.push({
        studentId: proj.user.id,
        studentName: proj.user.name,
        studentEmail: proj.user.email,
        courseId: proj.courseId || "unknown",
        courseName: proj.courseId || "Unknown Course",
        blockType: "Project Submission",
        blockedReason: "AI Review Pending 48h+",
        blockedSince: proj.createdAt,
      });
    }

    // Condition 2: Certificate not generated
    // Passed quiz AND approved project AND NO Certificate AND > 2 hours since project approved
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    
    // We'll find all approved projects older than 2 hours
    const approvedProjects = await prisma.projectSubmission.findMany({
      where: {
        status: "APPROVED",
        updatedAt: {
          lt: twoHoursAgo
        }
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      }
    });

    for (const proj of approvedProjects) {
      if (!proj.user || !proj.courseId) continue;
      
      // Check if they passed a quiz in this course
      const passedQuiz = await prisma.quizAttempt.findFirst({
        where: {
          userId: proj.user.id,
          courseId: proj.courseId,
          passed: true
        }
      });
      
      if (!passedQuiz) continue;

      // Check if they have a certificate
      const cert = await prisma.certificate.findFirst({
        where: {
          studentId: proj.user.id,
          courseId: proj.courseId
        }
      });

      if (!cert) {
        blockedStudents.push({
          studentId: proj.user.id,
          studentName: proj.user.name,
          studentEmail: proj.user.email,
          courseId: proj.courseId,
          courseName: proj.courseId || "Unknown Course",
          blockType: "Certificate Generation",
          blockedReason: "Certificate job failed",
          blockedSince: proj.updatedAt, // Blocked since project was approved
        });
      }
    }

    // Condition 3: Lesson not unlocked
    // Quiz passed AND no StudentProgress record for next lesson AND > 1 hour since quiz passed
    const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000);
    const passedQuizzes = await prisma.quizAttempt.findMany({
      where: {
        passed: true,
        createdAt: {
          lt: oneHourAgo
        }
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      }
    });

    for (const quiz of passedQuizzes) {
      if (!quiz.user || !quiz.courseId) continue;

      // We don't necessarily know the "next lesson" without fetching course structure, 
      // but we can check if they have ANY progress in this course updated AFTER the quiz.
      // This is a simplified proxy check for "progress not updated".
      const recentProgress = await prisma.studentProgress.findFirst({
        where: {
          studentId: quiz.user.id,
          courseId: quiz.courseId,
          completedAt: {
            gt: quiz.createdAt
          }
        }
      });

      // If no progress updated since quiz passed, they might be stuck
      if (!recentProgress) {
        // Double check they didn't already finish the course (have a cert)
        const cert = await prisma.certificate.findFirst({
          where: { studentId: quiz.user.id, courseId: quiz.courseId }
        });

        if (!cert) {
          // ensure they aren't already listed as blocked at Certificate or Project
          if (!blockedStudents.some(b => b.studentId === quiz.user!.id && b.courseId === quiz.courseId)) {
            blockedStudents.push({
              studentId: quiz.user.id,
              studentName: quiz.user.name,
              studentEmail: quiz.user.email,
              courseId: quiz.courseId,
              courseName: quiz.courseId || "Unknown Course",
              blockType: "Lesson Unlock",
              blockedReason: "Progress not updated",
              blockedSince: quiz.createdAt,
            });
          }
        }
      }
    }

    // Get real course names
    const allCourseIds = [...new Set(blockedStudents.map(b => b.courseId))];
    const courses = await prisma.course.findMany({
      where: { id: { in: allCourseIds } },
      select: { id: true, title: true }
    });
    const courseMap = new Map(courses.map(c => [c.id, c.title]));

    blockedStudents.forEach(b => {
      b.courseName = courseMap.get(b.courseId) || b.courseName;
    });

    return res.json(blockedStudents);
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/students/unblock
router.post("/unblock", async (req, res, next) => {
  try {
    const { studentId, courseId, blockType, reason, blockedAt } = req.body;
    // req.user should exist since this is behind admin auth
    const adminId = (req as any).user?.id || "admin";

    if (blockType === "Project Submission") {
      // Find the stuck project
      const proj = await prisma.projectSubmission.findFirst({
        where: { userId: studentId, courseId: courseId, status: "PENDING" }
      });
      if (proj) {
        await prisma.projectSubmission.update({
          where: { id: proj.id },
          data: {
            status: "APPROVED",
            score: 75,
            feedback: "Manually approved by admin due to system error.",
            updatedAt: new Date()
          }
        });
      }
    } else if (blockType === "Certificate Generation") {
      // Instead of relying on a real queue (since we are not touching queue logic),
      // we'll directly create the certificate record to unblock them immediately.
      // Or in a real app, send it to the queue.
      // Here, we'll just create a mock cert record to fix the state.
      const existing = await prisma.certificate.findFirst({
        where: { studentId, courseId }
      });
      if (!existing) {
        await prisma.certificate.create({
          data: {
            studentId,
            courseId,
            pdfUrl: "https://example.com/certificate-pending.pdf", // placeholder
          }
        });
      }
    } else if (blockType === "Lesson Unlock") {
      const prog = await prisma.studentProgress.findFirst({
        where: { studentId, courseId },
        orderBy: { completedAt: "desc" }
      });
      if (prog) {
        await prisma.studentProgress.update({
          where: { id: prog.id },
          data: { completed: true, completedAt: new Date() }
        });
      }
    }

    return res.json({ success: true, message: "Student unblocked successfully." });
  } catch (error) {
    next(error);
  }
});

export default router;
