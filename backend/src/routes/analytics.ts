import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import { COURSE_LECTURE_COUNTS } from "./courses.js";

const router = Router();
router.use(requireAuth, requireRole("admin"));

// ─────────────────────────────────────────────────────────────────────────────
// B — LEARNING ANALYTICS
// ─────────────────────────────────────────────────────────────────────────────

// Lecture completion rates per course with skip/revisit data
router.get("/learning/lectures", async (_req: AuthenticatedRequest, res, next) => {
  try {
    const courses = await prisma.progress.groupBy({
      by: ["courseSlug", "lectureId"],
      _count: { id: true },
      where: { status: "COMPLETED" },
    });

    const totalStudentsByCourse = await prisma.progress.groupBy({
      by: ["courseSlug"],
      _count: { userId: true },
    });

    const allProgress = await prisma.progress.findMany({
      select: { courseSlug: true, lectureId: true, userId: true, status: true },
    });

    // Per-lecture revisit count (multiple LectureProgress entries per lecture)
    const revisits = await prisma.lectureProgress.groupBy({
      by: ["courseSlug", "lectureId"],
      _count: { id: true },
    });

    // Count distinct users per course
    const enrolledCounts: Record<string, number> = {};
    for (const p of allProgress) {
      enrolledCounts[p.courseSlug] = (enrolledCounts[p.courseSlug] || 0) + 1;
    }

    const courseData: Record<string, any> = {};
    for (const c of courses) {
      if (!courseData[c.courseSlug]) {
        courseData[c.courseSlug] = {
          slug: c.courseSlug,
          totalLectures: COURSE_LECTURE_COUNTS[c.courseSlug] || 0,
          lectures: {},
        };
      }
      courseData[c.courseSlug].lectures[c.lectureId] = {
        lectureId: c.lectureId,
        completedCount: c._count.id,
        completionRate: null as number | null,
        revisitCount: 0,
        skipCount: 0,
      };
    }

    // Add revisit counts
    for (const r of revisits) {
      if (courseData[r.courseSlug]?.lectures[r.lectureId]) {
        courseData[r.courseSlug].lectures[r.lectureId].revisitCount = r._count.id;
      }
    }

    // Calculate skip rates and completion rates
    const lecturesByUser: Record<string, Set<string>> = {};
    for (const p of allProgress) {
      const key = `${p.userId}:${p.courseSlug}`;
      if (!lecturesByUser[key]) lecturesByUser[key] = new Set();
      lecturesByUser[key].add(p.lectureId);
    }

    const userCourseCounts: Record<string, Set<string>> = {};
    for (const p of allProgress) {
      const key = p.courseSlug;
      if (!userCourseCounts[key]) userCourseCounts[key] = new Set();
      userCourseCounts[key].add(p.userId);
    }

    const result: any[] = [];
    for (const [slug, cd] of Object.entries(courseData)) {
      const totalStudents = userCourseCounts[slug]?.size || 0;
      const lectureList = Object.values(cd.lectures) as any[];
      for (const lecture of lectureList) {
        lecture.completionRate = totalStudents > 0
          ? Math.round((lecture.completedCount / totalStudents) * 100)
          : 0;
        // Skipped = enrolled but no progress record for this lecture
        lecture.skipCount = Math.max(0, totalStudents - lecture.completedCount);
      }
      result.push({ slug, totalLectures: cd.totalLectures, totalStudents, lectures: lectureList });
    }

    res.json({ courses: result });
  } catch (err) { next(err); }
});

// Practice exercise aggregate stats
router.get("/learning/practice", async (_req: AuthenticatedRequest, res, next) => {
  try {
    const [exercises, attempts, submissions] = await Promise.all([
      prisma.practiceExercise.findMany({
        where: { status: "published" },
        select: { id: true, courseId: true, title: true, difficulty: true, estimatedTime: true },
      }),
      prisma.practiceAttempt.findMany({
        select: { exerciseId: true, passed: true, hintUsed: true, timeSpent: true, failureReason: true },
      }),
      prisma.practiceSubmission.findMany({
        select: { courseId: true, lectureId: true, completed: true },
      }),
    ]);

    // Per-exercise stats
    const attemptMap: Record<string, { total: number; passed: number; hintUsed: number; failures: string[]; timeSpent: number[] }> = {};
    for (const a of attempts) {
      if (!attemptMap[a.exerciseId]) {
        attemptMap[a.exerciseId] = { total: 0, passed: 0, hintUsed: 0, failures: [], timeSpent: [] };
      }
      attemptMap[a.exerciseId].total++;
      if (a.passed) attemptMap[a.exerciseId].passed++;
      if (a.hintUsed) attemptMap[a.exerciseId].hintUsed++;
      if (a.timeSpent) attemptMap[a.exerciseId].timeSpent.push(a.timeSpent);
      if (a.failureReason) attemptMap[a.exerciseId].failures.push(a.failureReason);
    }

    const exercisesWithStats = exercises.map(ex => {
      const stats = attemptMap[ex.id] || { total: 0, passed: 0, hintUsed: 0, failures: [], timeSpent: [] };
      const avgTime = stats.timeSpent.length > 0
        ? Math.round(stats.timeSpent.reduce((s, t) => s + t, 0) / stats.timeSpent.length)
        : null;
      return {
        id: ex.id,
        courseId: ex.courseId,
        title: ex.title,
        difficulty: ex.difficulty,
        estimatedTime: ex.estimatedTime,
        totalAttempts: stats.total,
        passRate: stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0,
        hintUsageRate: stats.total > 0 ? Math.round((stats.hintUsed / stats.total) * 100) : 0,
        averageTimeSeconds: avgTime,
        failureRate: stats.total > 0 ? Math.round(((stats.total - stats.passed) / stats.total) * 100) : 0,
        mostCommonFailure: stats.failures.length > 0
          ? Object.entries(stats.failures.reduce((acc: Record<string, number>, f) => { acc[f] = (acc[f] || 0) + 1; return acc; }, {}))
              .sort(([, a], [, b]) => b - a)[0]?.[0] || null
          : null,
      };
    });

    // Aggregate by course
    const byCourse: Record<string, { total: number; passRate: number; hintRate: number; avgTime: number | null }> = {};
    for (const ex of exercisesWithStats) {
      if (!byCourse[ex.courseId]) byCourse[ex.courseId] = { total: 0, passRate: 0, hintRate: 0, avgTime: null };
      const c = byCourse[ex.courseId];
      // Accumulate for averaging later (handled below)
    }

    // Submission-based stats
    const totalSubmissions = submissions.length;
    const completedSubmissions = submissions.filter(s => s.completed).length;
    const submissionsByCourse: Record<string, { total: number; completed: number }> = {};
    for (const s of submissions) {
      if (!submissionsByCourse[s.courseId]) submissionsByCourse[s.courseId] = { total: 0, completed: 0 };
      submissionsByCourse[s.courseId].total++;
      if (s.completed) submissionsByCourse[s.courseId].completed++;
    }

    // Hint usage across all exercises
    const hintUsedCount = attempts.filter(a => a.hintUsed).length;
    const overallHintRate = attempts.length > 0 ? Math.round((hintUsedCount / attempts.length) * 100) : 0;

    res.json({
      exercises: exercisesWithStats,
      summary: {
        totalExercises: exercises.length,
        totalAttempts: attempts.length,
        totalCompletions: completedSubmissions,
        overallPassRate: attempts.length > 0
          ? Math.round((attempts.filter(a => a.passed).length / attempts.length) * 100)
          : 0,
        overallHintUsageRate: overallHintRate,
        averageTimeSeconds: attempts.filter(a => a.timeSpent != null).length > 0
          ? Math.round(attempts.filter(a => a.timeSpent != null).reduce((s, a) => s + a.timeSpent!, 0) / attempts.filter(a => a.timeSpent != null).length)
          : null,
      },
      byCourse: submissionsByCourse,
    });
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────────────────────
// C — ASSESSMENT ANALYTICS
// ─────────────────────────────────────────────────────────────────────────────

router.get("/assessments", async (_req: AuthenticatedRequest, res, next) => {
  try {
    const [questions, progress] = await Promise.all([
      prisma.assessmentQuestion.findMany({
        select: { id: true, category: true, subsection: true, type: true, difficulty: true, correctAnswer: true },
      }),
      prisma.assessmentProgress.findMany({
        select: {
          category: true, subsection: true, score: true, totalQuestions: true,
          attempts: true, status: true, timeTaken: true,
          userId: true,
        },
      }),
    ]);

    // Per-question difficulty analysis
    // Group attempts by (category, subsection) to derive question-level stats
    const subsectionStats: Record<string, { total: number; passed: number; avgScore: number; avgTime: number; retakeCount: number; attemptsCount: number }> = {};
    for (const p of progress) {
      const key = `${p.category}:${p.subsection}`;
      if (!subsectionStats[key]) {
        subsectionStats[key] = { total: 0, passed: 0, avgScore: 0, avgTime: 0, retakeCount: 0, attemptsCount: 0 };
      }
      const s = subsectionStats[key];
      s.total++;
      s.attemptsCount += p.attempts;
      if (p.status === "completed") s.passed++;
      s.avgScore += p.score;
      s.avgTime += p.timeTaken;
      if (p.attempts > 1) s.retakeCount++;
    }

    // Calculate averages
    for (const key of Object.keys(subsectionStats)) {
      const s = subsectionStats[key];
      if (s.total > 0) {
        s.avgScore = Math.round(s.avgScore / s.total);
        s.avgTime = Math.round(s.avgTime / s.total);
      }
    }

    // Hardest/easiest subsections by score
    const sortedByScore = Object.entries(subsectionStats)
      .map(([key, stats]) => ({ key, ...stats }))
      .sort((a, b) => a.avgScore - b.avgScore);

    const hardest = sortedByScore.slice(0, 10);
    const easiest = sortedByScore.slice(-10).reverse();

    // Category-level aggregation
    const byCategory: Record<string, { total: number; passed: number; avgScore: number; avgTime: number; retakeRate: number }> = {};
    for (const p of progress) {
      if (!byCategory[p.category]) {
        byCategory[p.category] = { total: 0, passed: 0, avgScore: 0, avgTime: 0, retakeRate: 0 };
      }
      const c = byCategory[p.category];
      c.total++;
      if (p.status === "completed") c.passed++;
      c.avgScore += p.score;
      c.avgTime += p.timeTaken;
    }
    for (const key of Object.keys(byCategory)) {
      const c = byCategory[key];
      if (c.total > 0) {
        c.avgScore = Math.round(c.avgScore / c.total);
        c.avgTime = Math.round(c.avgTime / c.total);
      }
    }

    // Retake stats globally
    const retakeStudents = progress.filter(p => p.attempts > 1).length;
    const multipleAttempts = progress.filter(p => p.attempts > 1);

    res.json({
      summary: {
        totalAssessments: progress.length,
        totalCategories: Object.keys(byCategory).length,
        overallPassRate: progress.length > 0
          ? Math.round((progress.filter(p => p.status === "completed").length / progress.length) * 100)
          : 0,
        overallAvgScore: progress.length > 0
          ? Math.round(progress.reduce((s, p) => s + p.score, 0) / progress.length)
          : 0,
        retakeRate: progress.length > 0
          ? Math.round((retakeStudents / progress.length) * 100)
          : 0,
      },
      byCategory,
      hardestSubsections: hardest.slice(0, 5),
      easiestSubsections: easiest.slice(0, 5),
      subsectionStats,
    });
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────────────────────
// D — PROJECT ANALYTICS
// ─────────────────────────────────────────────────────────────────────────────

router.get("/projects", async (_req: AuthenticatedRequest, res, next) => {
  try {
    const [projects, templates] = await Promise.all([
      prisma.project.findMany({
        select: {
          id: true, projectId: true, status: true, startedAt: true, completedAt: true,
          userId: true,
        },
      }),
      prisma.projectTemplate.count(),
    ]);

    const total = projects.length;
    const byStatus: Record<string, number> = {};
    let completedWithTime = 0;
    let totalCompletionTime = 0;
    const abandoned: string[] = [];

    for (const p of projects) {
      byStatus[p.status] = (byStatus[p.status] || 0) + 1;

      if (p.status === "APPROVED" && p.startedAt && p.completedAt) {
        const days = Math.round((p.completedAt.getTime() - p.startedAt.getTime()) / (1000 * 60 * 60 * 24));
        totalCompletionTime += days;
        completedWithTime++;
      }

      // Abandoned = STARTED but not completed after 30+ days
      if (p.status === "STARTED" && p.startedAt) {
        const daysSinceStart = Math.round((Date.now() - p.startedAt.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceStart >= 30) abandoned.push(p.projectId);
      }
    }

    const submissionCount = byStatus["SUBMITTED"] || 0;
    const approvedCount = byStatus["APPROVED"] || 0;
    const startedCount = byStatus["STARTED"] || 0;

    // Approval rate: approved / (submitted + approved)
    const approvalRate = (submissionCount + approvedCount) > 0
      ? Math.round((approvedCount / (submissionCount + approvedCount)) * 100)
      : 0;

    // Completion rate: approved / total
    const completionRate = total > 0
      ? Math.round((approvedCount / total) * 100)
      : 0;

    const avgCompletionDays = completedWithTime > 0
      ? Math.round(totalCompletionTime / completedWithTime)
      : null;

    // Per-template stats
    const templateStats: Record<string, { total: number; approved: number }> = {};
    for (const p of projects) {
      if (!templateStats[p.projectId]) templateStats[p.projectId] = { total: 0, approved: 0 };
      templateStats[p.projectId].total++;
      if (p.status === "APPROVED") templateStats[p.projectId].approved++;
    }
    const templateRates = Object.entries(templateStats).map(([id, s]) => ({
      projectId: id,
      total: s.total,
      approved: s.approved,
      approvalRate: s.total > 0 ? Math.round((s.approved / s.total) * 100) : 0,
    }));

    // Most common project templates
    const mostCommon = templateRates.sort((a, b) => b.total - a.total).slice(0, 10);

    res.json({
      summary: {
        total,
        templatesCount: templates,
        byStatus,
        submissionCount,
        approvedCount,
        startedCount,
        completionRate,
        approvalRate,
        averageCompletionDays: avgCompletionDays,
        abandonedCount: abandoned.length,
      },
      mostCommonProjects: mostCommon,
    });
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────────────────────
// E — CERTIFICATION ANALYTICS (expansion of existing)
// ─────────────────────────────────────────────────────────────────────────────

router.get("/certifications", async (_req: AuthenticatedRequest, res, next) => {
  try {
    const [
      total,
      byCourse,
      byStatus,
      totalEligible,
      issuedRecords,
      students,
    ] = await Promise.all([
      prisma.issuedCertificate.count(),
      prisma.issuedCertificate.groupBy({ by: ["courseSlug"], _count: { id: true } }),
      prisma.issuedCertificate.groupBy({ by: ["status"], _count: { id: true } }),
      prisma.user.count({ where: { role: "student", email: { not: { endsWith: "@test.com" } } } }),
      prisma.issuedCertificate.findMany({ select: { issuedAt: true, status: true, courseSlug: true } }),
      prisma.user.findMany({
        where: { role: "student", email: { not: { endsWith: "@test.com" } } },
        select: { id: true },
      }),
    ]);

    const revokedCount = issuedRecords.filter(c => c.status === "revoked").length;
    const revocationRate = total > 0 ? Math.round((revokedCount / total) * 100) : 0;

    // Calculate eligible count (students who completed all lectures in any course)
    let eligibleCount = 0;
    for (const student of students) {
      for (const [slug, lectureCount] of Object.entries(COURSE_LECTURE_COUNTS)) {
        const done = await prisma.progress.count({
          where: { userId: student.id, courseSlug: slug, status: "COMPLETED" },
        });
        if (done >= lectureCount) {
          const issued = await prisma.issuedCertificate.findUnique({
            where: { userId_courseSlug: { userId: student.id, courseSlug: slug } },
          });
          if (!issued) {
            eligibleCount++;
            break;
          }
        }
      }
    }

    // Monthly issuance breakdown
    const byMonth: Record<string, number> = {};
    for (const c of issuedRecords) {
      const key = c.issuedAt.toISOString().slice(0, 7);
      byMonth[key] = (byMonth[key] || 0) + 1;
    }
    const months = Object.keys(byMonth).sort();
    const monthlyTrend = months.map(m => ({ month: m, count: byMonth[m] }));

    res.json({
      summary: {
        total,
        byCourse: Object.fromEntries(byCourse.map(b => [b.courseSlug, b._count.id])),
        byStatus: Object.fromEntries(byStatus.map(b => [b.status, b._count.id])),
        revokedCount,
        revocationRate,
        eligibleCount,
        totalStudents: students.length,
        eligibilityConversionRate: total > 0
          ? Math.round((total / (total + eligibleCount)) * 100)
          : 0,
        issuedToEligibleRate: students.length > 0
          ? Math.round((total / students.length) * 100)
          : 0,
      },
      monthlyTrend,
    });
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────────────────────
// F — STUDENT ANALYTICS
// ─────────────────────────────────────────────────────────────────────────────

router.get("/students", async (_req: AuthenticatedRequest, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const students = await prisma.user.findMany({
      where: { role: "student", email: { not: { endsWith: "@test.com" } } },
      select: {
        id: true, name: true, email: true, totalXp: true, currentStreak: true,
        status: true, createdAt: true, lastActiveAt: true, overallProgress: true,
        _count: {
          select: {
            progress: true,
            quizAttempts: true,
            submissions: true,
            projects: true,
            issuedCertificates: true,
            practiceSubmissions: true,
          },
        },
      },
    });

    // Recent activity (within 7 days)
    const recentActivityMap: Record<string, boolean> = {};
    const recentProgress = await prisma.progress.findMany({
      where: { completedAt: { gte: sevenDaysAgo } },
      select: { userId: true },
      distinct: ["userId"],
    });
    for (const p of recentProgress) {
      recentActivityMap[p.userId] = true;
    }

    // Active in last 30 days
    const activeMap: Record<string, boolean> = {};
    for (const s of students) {
      if (s.lastActiveAt >= thirtyDaysAgo) activeMap[s.id] = true;
    }

    const performers = students.map(s => ({
      id: s.id,
      name: s.name,
      email: s.email,
      xp: s.totalXp,
      streak: s.currentStreak,
      status: s.status,
      joinedAt: s.createdAt,
      lastActive: s.lastActiveAt,
      overallProgress: s.overallProgress,
      lecturesStarted: s._count.progress,
      quizzesTaken: s._count.quizAttempts,
      problemsSolved: s._count.submissions,
      projectsCount: s._count.projects,
      practiceCompleted: s._count.practiceSubmissions,
      certificatesIssued: s._count.issuedCertificates,
      recentlyActive: !!recentActivityMap[s.id],
      activeLast30: !!activeMap[s.id],
    }));

    // Rankings
    const byXp = [...performers].sort((a, b) => b.xp - a.xp);
    const topPerformers = byXp.slice(0, 20);
    const mostActive = [...performers].filter(p => p.recentlyActive).sort((a, b) => b.xp - a.xp).slice(0, 20);

    // Inactive (no activity in 30+ days)
    const inactive = performers.filter(p => !p.activeLast30);

    // At-risk: low progress, no recent activity
    const atRisk = performers.filter(p => !p.activeLast30 && p.overallProgress < 50 && p.joinedAt < thirtyDaysAgo);

    // Behind schedule: started courses but low progress relative to time since joining
    const behindSchedule = performers.filter(p => {
      const daysSinceJoin = Math.round((Date.now() - p.joinedAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceJoin < 14) return false; // too new to judge
      const expectedMinProgress = Math.min(100, Math.round((daysSinceJoin / 90) * 100)); // expect ~1 lecture per 3 days
      return p.overallProgress < expectedMinProgress && p.overallProgress < 60;
    }).slice(0, 50);

    // Near certification eligibility: completed most lectures in any course
    const nearEligible: any[] = [];
    for (const s of performers) {
      for (const [slug, lectureCount] of Object.entries(COURSE_LECTURE_COUNTS)) {
        const done = await prisma.progress.count({
          where: { userId: s.id, courseSlug: slug, status: "COMPLETED" },
        });
        if (done >= lectureCount - 2 && done < lectureCount) {
          // Within 2 lectures of eligibility
          const cert = await prisma.issuedCertificate.findUnique({
            where: { userId_courseSlug: { userId: s.id, courseSlug: slug } },
          });
          if (!cert) {
            nearEligible.push({ ...s, nearCourse: slug, nearProgress: `${done}/${lectureCount}` });
          }
        }
      }
    }
    nearEligible.sort((a, b) => b.xp - a.xp);

    res.json({
      summary: {
        total: performers.length,
        activeLast30: activeMap.size,
        inactive: inactive.length,
        atRisk: atRisk.length,
        behindSchedule: behindSchedule.length,
        nearEligible: nearEligible.length,
        avgXp: performers.length > 0
          ? Math.round(performers.reduce((s, p) => s + p.xp, 0) / performers.length)
          : 0,
        avgProgress: performers.length > 0
          ? Math.round(performers.reduce((s, p) => s + p.overallProgress, 0) / performers.length)
          : 0,
      },
      topPerformers,
      mostActive,
      inactive: inactive.slice(0, 20),
      atRisk: atRisk.slice(0, 20),
      behindSchedule: behindSchedule.slice(0, 20),
      nearEligible,
    });
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT — aggregate all analytics into a single payload
// ─────────────────────────────────────────────────────────────────────────────

router.get("/full-report", async (_req: AuthenticatedRequest, res, next) => {
  try {
    const [students, progress, quizAttempts, submissions, projects, certs, practiceAttempts, practiceSubmissions, assessments] = await Promise.all([
      prisma.user.count({ where: { role: "student", email: { not: { endsWith: "@test.com" } } } }),
      prisma.progress.count(),
      prisma.quizAttempt.count(),
      prisma.submission.count({ where: { status: "PASSED" } }),
      prisma.project.count(),
      prisma.issuedCertificate.count(),
      prisma.practiceAttempt.count(),
      prisma.practiceSubmission.count({ where: { completed: true } }),
      prisma.assessmentProgress.count({ where: { status: "completed" } }),
    ]);

    res.json({
      generatedAt: new Date().toISOString(),
      totals: {
        students,
        progressRecords: progress,
        quizAttempts,
        passedSubmissions: submissions,
        projects,
        certificates: certs,
        practiceAttempts,
        practiceCompletions: practiceSubmissions,
        completedAssessments: assessments,
      },
    });
  } catch (err) { next(err); }
});

export default router;
