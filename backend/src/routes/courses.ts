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

    const lectureProgressRecords = await prisma.lectureProgress.findMany({
      where: { userId, isCompleted: true },
    });

    const completedSectionsMap: Record<string, Record<string, number>> = {};
    for (const record of lectureProgressRecords) {
      if (!completedSectionsMap[record.courseSlug]) {
        completedSectionsMap[record.courseSlug] = {};
      }
      completedSectionsMap[record.courseSlug][record.lectureId] = (completedSectionsMap[record.courseSlug][record.lectureId] || 0) + 1;
    }

    const courseStatsMap: Record<string, {
      courseId: string;
      completedLectures: number;
      inProgressLectures: number;
      totalLectures: number;
      percentage: number;
      status: "not_started" | "in_progress" | "completed";
    }> = {};

    for (const [slug, total] of Object.entries(COURSE_LECTURE_COUNTS)) {
      const lecturesForCourse = completedSectionsMap[slug] || {};
      let completedLectures = 0;
      let inProgressLectures = 0;

      for (const sectionsCount of Object.values(lecturesForCourse)) {
        if (sectionsCount >= 6) {
          completedLectures++;
        } else if (sectionsCount > 0) {
          inProgressLectures++;
        }
      }

      courseStatsMap[slug] = {
        courseId: slug,
        completedLectures,
        inProgressLectures,
        totalLectures: total,
        percentage: Math.min(100, Math.round((completedLectures / total) * 100)),
        status: completedLectures === 0 && inProgressLectures === 0 ? "not_started" : completedLectures >= total ? "completed" : "in_progress",
      };
    }

    // Also include any courses the user has progress in but aren't in the map
    const allSlugs = new Set(Object.keys(courseStatsMap));
    for (const p of lectureProgressRecords) {
      if (!allSlugs.has(p.courseSlug)) {
        const lecturesForCourse = completedSectionsMap[p.courseSlug] || {};
        let completedLectures = 0;
        let inProgressLectures = 0;

        for (const sectionsCount of Object.values(lecturesForCourse)) {
          if (sectionsCount >= 6) {
            completedLectures++;
          } else if (sectionsCount > 0) {
            inProgressLectures++;
          }
        }

        const total = COURSE_LECTURE_COUNTS[p.courseSlug] || 10;

        courseStatsMap[p.courseSlug] = {
          courseId: p.courseSlug,
          completedLectures,
          inProgressLectures,
          totalLectures: total,
          percentage: Math.min(100, Math.round((completedLectures / total) * 100)),
          status: completedLectures === 0 && inProgressLectures === 0 ? "not_started" : completedLectures >= total ? "completed" : "in_progress",
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
