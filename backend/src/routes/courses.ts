import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

// Dictionary of total lectures per course, falling back to 0 if unknown.
// This is used for percentage calculations.
const COURSE_LECTURE_COUNTS: Record<string, number> = {
  "python-programming": 14,
  "cs50p": 10,
  "cs50ai": 7,
  "ai": 7,
  // Add more courses here as needed
};

router.get("/progress", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;

    // Get all lecture progress for the user
    const progressRecords = await prisma.lectureProgress.findMany({
      where: { userId, isCompleted: true }
    });

    // Group by course and lecture
    const lectureCompletionMap: Record<string, Record<string, number>> = {};
    for (const p of progressRecords) {
      if (!lectureCompletionMap[p.courseSlug]) lectureCompletionMap[p.courseSlug] = {};
      if (!lectureCompletionMap[p.courseSlug][p.lectureId]) lectureCompletionMap[p.courseSlug][p.lectureId] = 0;
      lectureCompletionMap[p.courseSlug][p.lectureId]++;
    }

    // A course stats map
    const courseStats: Record<string, { courseId: string; completedLectures: number; inProgressLectures: number; totalLectures: number; percentage: number; status: "not_started" | "in_progress" | "completed" }> = {};

    for (const slug in lectureCompletionMap) {
      const total = COURSE_LECTURE_COUNTS[slug] || 10;
      courseStats[slug] = {
        courseId: slug,
        completedLectures: 0,
        inProgressLectures: 0,
        totalLectures: total,
        percentage: 0,
        status: "in_progress"
      };

      for (const lectureId in lectureCompletionMap[slug]) {
        // Assume 6 sections total required for a fully completed lecture as per rules
        const sectionsDone = lectureCompletionMap[slug][lectureId];
        if (sectionsDone >= 6) {
          courseStats[slug].completedLectures++;
        } else if (sectionsDone > 0) {
          courseStats[slug].inProgressLectures++;
        }
      }
    }

    // Calculate percentage and final status
    for (const slug in courseStats) {
      const stats = courseStats[slug];
      stats.percentage = Math.min(100, Math.round((stats.completedLectures / stats.totalLectures) * 100));
      if (stats.percentage >= 100) {
        stats.status = "completed";
      }
    }

    res.json(Object.values(courseStats));
  } catch (error) {
    next(error);
  }
});

export default router;
