import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

export const COURSE_LECTURE_COUNTS: Record<string, number> = {
  "python": 14,
  "cs50ai": 10,
};

router.get("/progress", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;

    // Use progress.status "COMPLETED" as authoritative lecture completion
    const completedLectures = await prisma.progress.findMany({
      where: { userId, status: "COMPLETED" },
      select: { courseSlug: true, lectureId: true },
    });

    const courseStatsMap: Record<string, {
      courseId: string;
      completedLectures: number;
      inProgressLectures: number;
      totalLectures: number;
      percentage: number;
      status: "not_started" | "in_progress" | "completed";
    }> = {};

    for (const [slug, total] of Object.entries(COURSE_LECTURE_COUNTS)) {
      const done = new Set(completedLectures.filter(p => p.courseSlug === slug).map(p => p.lectureId));
      const completed = done.size;
      courseStatsMap[slug] = {
        courseId: slug,
        completedLectures: completed,
        inProgressLectures: 0,
        totalLectures: total,
        percentage: Math.min(100, Math.round((completed / total) * 100)),
        status: completed === 0 ? "not_started" : completed >= total ? "completed" : "in_progress",
      };
    }

    // Also include any courses the user has progress in but aren't in the map
    const allSlugs = new Set(Object.keys(courseStatsMap));
    for (const p of completedLectures) {
      if (!allSlugs.has(p.courseSlug)) {
        courseStatsMap[p.courseSlug] = {
          courseId: p.courseSlug,
          completedLectures: 1,
          inProgressLectures: 0,
          totalLectures: COURSE_LECTURE_COUNTS[p.courseSlug] || 10,
          percentage: 0,
          status: "in_progress",
        };
        allSlugs.add(p.courseSlug);
      }
    }

    res.json(Object.values(courseStatsMap));
  } catch (error) {
    next(error);
  }
});

export default router;
