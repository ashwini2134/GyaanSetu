import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

export const COURSE_LECTURE_COUNTS: Record<string, number> = {
  "python": 14,
  "cs50ai": 10,
};
router.get("/", requireAuth, async (_req, res, next) => {
  try {
    const courses = await prisma.course.findMany({
      where: {
        status: { equals: "PUBLISHED", mode: "insensitive" }
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        difficulty: true
      }
    });
    res.json(courses);
  } catch (error) {
    next(error);
  }
});

router.get("/progress", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const [lectureProgressRecords, completedLectures] = await Promise.all([
      prisma.lectureProgress.findMany({
        where: { userId, isCompleted: true },
      }),
      prisma.progress.findMany({
        where: { userId, status: "COMPLETED" },
        select: { courseSlug: true, lectureId: true },
      }),
    ]);

    const lectureCompletedSet = new Set(
      completedLectures.map(p => `${p.courseSlug}:${p.lectureId}`)
    );

    const sectionsPerLecture: Record<string, Record<string, number>> = {};
    for (const record of lectureProgressRecords) {
      if (!sectionsPerLecture[record.courseSlug]) {
        sectionsPerLecture[record.courseSlug] = {};
      }
      sectionsPerLecture[record.courseSlug][record.lectureId] =
        (sectionsPerLecture[record.courseSlug][record.lectureId] || 0) + 1;
    }

    const courseStatsMap: Record<string, {
      courseId: string;
      completedLectures: number;
      inProgressLectures: number;
      totalLectures: number;
      percentage: number;
      status: "not_started" | "in_progress" | "completed";
    }> = {};

    function isLectureCompleted(courseSlug: string, lectureId: string): boolean {
      if (lectureCompletedSet.has(`${courseSlug}:${lectureId}`)) return true;
      const sectionCount = sectionsPerLecture[courseSlug]?.[lectureId] ?? 0;
      return sectionCount >= 6;
    }

    const allCourseSlugs = new Set(Object.keys(COURSE_LECTURE_COUNTS));
    for (const p of completedLectures) allCourseSlugs.add(p.courseSlug);
    for (const p of lectureProgressRecords) allCourseSlugs.add(p.courseSlug);

    for (const slug of allCourseSlugs) {
      const total = COURSE_LECTURE_COUNTS[slug] ?? 10;

      const lectureIds = new Set<string>();
      for (const key of lectureCompletedSet) {
        const [cs, lid] = key.split(":");
        if (cs === slug) lectureIds.add(lid);
      }
      for (const lid of Object.keys(sectionsPerLecture[slug] || {})) {
        lectureIds.add(lid);
      }

      let completedCount = 0;
      let inProgressCount = 0;
      for (const lid of lectureIds) {
        if (isLectureCompleted(slug, lid)) {
          completedCount++;
        } else {
          inProgressCount++;
        }
      }

      courseStatsMap[slug] = {
        courseId: slug,
        completedLectures: completedCount,
        inProgressLectures: inProgressCount,
        totalLectures: total,
        percentage: Math.min(100, Math.round((completedCount / total) * 100)),
        status: completedCount === 0 && inProgressCount === 0 ? "not_started" : completedCount >= total ? "completed" : "in_progress",
      };
    }

    res.json(Object.values(courseStatsMap));
  } catch (error) {
    next(error);
  }
});

export default router;
