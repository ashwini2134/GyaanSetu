import { prisma } from "../prisma.js";
import { awardXp } from "../services/gamificationService.js";
import { sendNotification } from "../services/notificationService.js";
import { COURSE_LECTURE_COUNTS } from "../routes/courses.js";
import { ACHIEVEMENT_CATALOG } from "./catalog.js";
import type { AchievementDefinition, EvaluationContext, MetricKey } from "./types.js";

export interface UnlockedAchievementResult {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementDefinition["category"];
  xpReward: number;
  badgeColor: AchievementDefinition["badgeColor"];
  unlockedAt: string;
}

const NIGHT_HOURS = new Set([22, 23, 0, 1, 2, 3]);
const EARLY_HOURS = new Set([5, 6, 7, 8]);

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function buildContext(userId: string): Promise<EvaluationContext> {
  const [
    user,
    lecturesCompleted,
    practiceCompletedCount,
    problemsSolved,
    quizzesPassed,
    projectsSolved,
    milestonesCompleted,
    approvedProjectSubmissions,
    firstRepoSubmission,
    courseSlugs,
    issuedCertificates,
    hasPerfectQuizScore,
    portfolio,
    progressTimestamps,
    quizTimestamps,
  ] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { totalXp: true, currentStreak: true, longestStreak: true } }),
    prisma.progress.count({ where: { userId, status: "COMPLETED" } }),
    prisma.progress.count({ where: { userId, practiceCompleted: true } }),
    prisma.submission.count({ where: { userId, status: "PASSED" } }),
    prisma.quizAttempt.count({ where: { userId, passed: true } }),
    prisma.project.count({ where: { userId, status: "COMPLETED" } }),
    prisma.project.count({ where: { userId, status: "COMPLETED" } }), // milestones == completed Project rows today; no separate model
    prisma.projectSubmission.count({ where: { userId, status: "APPROVED" } }),
    prisma.projectSubmission.findFirst({ where: { userId }, select: { id: true } }),
    prisma.progress.groupBy({ by: ["courseSlug"], where: { userId } }),
    prisma.issuedCertificate.findMany({ where: { userId }, select: { courseSlug: true } }),
    prisma.quizAttempt.count({ where: { userId, score: { gte: 100 } } }),
    prisma.studentPortfolio.findUnique({ where: { studentId: userId }, select: { projects: true, screenshots: true } }),
    prisma.progress.findMany({ where: { userId, completedAt: { not: null } }, select: { completedAt: true } }),
    prisma.quizAttempt.findMany({ where: { userId }, select: { createdAt: true } }),
  ]);

  let coursesCompleted = 0;
  for (const { courseSlug } of courseSlugs) {
    const total = COURSE_LECTURE_COUNTS[courseSlug];
    if (!total) continue;
    const done = await prisma.progress.count({ where: { userId, courseSlug, status: "COMPLETED" } });
    if (done >= total) coursesCompleted++;
  }

  // Capstone detection: a course's capstone project is flagged via
  // CourseProject.isCapstone, matched to the submission's courseId.
  const approvedWithCourse = await prisma.projectSubmission.findMany({
    where: { userId, status: "APPROVED", courseId: { not: null } },
    select: { courseId: true },
  });
  let hasApprovedCapstone = false;
  if (approvedWithCourse.length > 0) {
    const capstoneProjects = await prisma.courseProject.findMany({
      where: { courseId: { in: approvedWithCourse.map((s) => s.courseId!) }, isCapstone: true },
      select: { courseId: true },
    });
    const capstoneCourseIds = new Set(capstoneProjects.map((c) => c.courseId));
    hasApprovedCapstone = approvedWithCourse.some((s) => s.courseId && capstoneCourseIds.has(s.courseId));
  }

  const timestamps: Date[] = [
    ...progressTimestamps.map((p) => p.completedAt as Date),
    ...quizTimestamps.map((q) => q.createdAt),
  ];

  const distinctDays = new Set(timestamps.map(toDateKey));
  const hasWeekendActivity = timestamps.some((d) => d.getDay() === 0 || d.getDay() === 6);
  const hasNightActivity = timestamps.some((d) => NIGHT_HOURS.has(d.getHours()));
  const hasEarlyBirdActivity = timestamps.some((d) => EARLY_HOURS.has(d.getHours()));

  // "Perfect week": every one of the last 7 calendar days (including today) has
  // at least one recorded activity timestamp.
  let hasPerfectWeek = true;
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (!distinctDays.has(toDateKey(d))) {
      hasPerfectWeek = false;
      break;
    }
  }

  const portfolioProjects = Array.isArray(portfolio?.projects) ? (portfolio!.projects as unknown[]) : [];
  const portfolioScreenshots = Array.isArray(portfolio?.screenshots) ? (portfolio!.screenshots as unknown[]) : [];

  const metrics: Record<MetricKey, number> = {
    lecturesCompleted,
    practiceCompletedCount,
    problemsSolved,
    quizzesPassed,
    projectsSolved,
    milestonesCompleted,
    approvedProjectSubmissions,
    currentStreak: user?.currentStreak ?? 0,
    longestStreak: user?.longestStreak ?? 0,
    totalXp: user?.totalXp ?? 0,
    coursesCompleted,
    portfolioProjectCount: portfolioProjects.length,
    portfolioScreenshotCount: portfolioScreenshots.length,
  };

  return {
    userId,
    metrics,
    issuedCertificateSlugs: issuedCertificates.map((c) => c.courseSlug),
    hasPerfectQuizScore: hasPerfectQuizScore > 0,
    hasApprovedCapstone,
    hasFirstRepo: !!firstRepoSubmission,
    distinctActiveDays: distinctDays.size,
    hasWeekendActivity,
    hasNightActivity,
    hasEarlyBirdActivity,
    hasPerfectWeek,
  };
}

function conditionMet(def: AchievementDefinition, ctx: EvaluationContext): boolean {
  if (def.condition.kind === "metric_gte") {
    return ctx.metrics[def.condition.metric] >= def.condition.threshold;
  }
  return def.condition.evaluate(ctx);
}

/**
 * Recomputes the user's current metrics, checks every catalog definition the
 * user hasn't already unlocked, and unlocks/announces any that now qualify.
 * Idempotent — safe to call redundantly from multiple trigger points or
 * concurrently for the same user (Achievement.upsert + awardXp's actionId
 * uniqueness absorb duplicate calls).
 */
export async function evaluateAndUnlockAchievements(
  userId: string,
  trigger?: string
): Promise<UnlockedAchievementResult[]> {
  const [ctx, alreadyUnlocked] = await Promise.all([
    buildContext(userId),
    prisma.achievement.findMany({ where: { userId }, select: { achievementId: true } }),
  ]);

  const unlockedIds = new Set(alreadyUnlocked.map((a) => a.achievementId));
  const newlyUnlocked: UnlockedAchievementResult[] = [];

  for (const def of ACHIEVEMENT_CATALOG) {
    if (unlockedIds.has(def.id)) continue;
    if (!conditionMet(def, ctx)) continue;

    const unlockedAt = new Date();
    await prisma.achievement.upsert({
      where: { userId_achievementId: { userId, achievementId: def.id } },
      update: {},
      create: { userId, achievementId: def.id, custom: false },
    });

    if (def.xpReward) {
      await awardXp(userId, def.xpReward, `Achievement: ${def.name}`, `achievement_${def.id}`);
    }

    newlyUnlocked.push({
      id: def.id,
      name: def.name,
      description: def.description,
      icon: def.icon,
      category: def.category,
      xpReward: def.xpReward ?? 0,
      badgeColor: def.badgeColor,
      unlockedAt: unlockedAt.toISOString(),
    });
  }

  // Notify once per evaluation pass, not once per achievement — a user who
  // completes an action that satisfies several thresholds at once (e.g. a
  // brand-new account's first activity hitting both "first_lecture" and
  // "first_login") gets one combined notification instead of a burst.
  // The single-unlock path carries a dedupeKey so a race between two
  // concurrent evaluation calls can never insert the same unlock twice —
  // the second insert hits the unique constraint and is silently dropped.
  if (newlyUnlocked.length === 1) {
    const a = newlyUnlocked[0];
    await sendNotification(
      userId,
      "achievement",
      a.name,
      a.description,
      "/profile",
      "medium",
      `achievement_${userId}_${a.id}`
    );
  } else if (newlyUnlocked.length > 1) {
    await sendNotification(
      userId,
      "achievement",
      `You unlocked ${newlyUnlocked.length} new achievements`,
      newlyUnlocked.map((a) => a.name).join(" • "),
      "/profile",
      "medium"
    );
  }

  if (newlyUnlocked.length > 0 && trigger) {
    console.log(`[achievements] unlocked ${newlyUnlocked.map((a) => a.id).join(", ")} for user ${userId} via ${trigger}`);
  }

  return newlyUnlocked;
}
