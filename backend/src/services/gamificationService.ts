import { prisma } from "../prisma.js";
import { sendInAppNotification } from "./notificationService.js";

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 365];

function getStreakMultiplier(streak: number): number {
  if (streak >= 30) return 3.0;
  if (streak >= 14) return 2.5;
  if (streak >= 7)  return 2.0;
  if (streak >= 3)  return 1.5;
  return 1.0;
}

export async function awardXp(userId: string, amount: number, reason: string, actionId?: string) {
  let newStreak = 0;
  await prisma.$transaction(async (tx) => {
    if (actionId) {
      const existing = await tx.xpTransaction.findUnique({
        where: {
          userId_actionId: { userId, actionId },
        },
      });
      if (existing) {
        return;
      }
    }

    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const lastActiveStr = user.lastActiveAt.toISOString().split("T")[0];

    let newCurrentStreak = user.currentStreak;
    let newLongestStreak = user.longestStreak;

    if (lastActiveStr !== todayStr) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      if (lastActiveStr === yesterdayStr) {
        newCurrentStreak += 1;
      } else {
        newCurrentStreak = 1;
      }

      if (newCurrentStreak > newLongestStreak) {
        newLongestStreak = newCurrentStreak;
      }
    } else if (newCurrentStreak === 0) {
      newCurrentStreak = 1;
      if (newCurrentStreak > newLongestStreak) {
        newLongestStreak = newCurrentStreak;
      }
    }

    newStreak = newCurrentStreak;
    const multiplier = getStreakMultiplier(newStreak);
    const finalAmount = Math.round(amount * multiplier);

    await tx.xpTransaction.create({
      data: {
        userId,
        amount: finalAmount,
        reason: `${reason} (${multiplier}x streak)`,
        actionId,
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: {
        totalXp: { increment: finalAmount },
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastActiveAt: now,
      },
    });
  });

  if (STREAK_MILESTONES.includes(newStreak)) {
    await sendInAppNotification(
      userId,
      "streak",
      `🔥 ${newStreak}-Day Streak!`,
      `You've reached a ${newStreak}-day streak! Keep it going!`
    );
  }
}

function dateDaysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dateRange(daysAgoStart: number, daysAgoEnd: number): { gte: Date; lt: Date } {
  return { gte: dateDaysAgo(daysAgoEnd), lt: dateDaysAgo(daysAgoStart) };
}

async function getRealUserIds(): Promise<Set<string>> {
  const users = await prisma.user.findMany({
    where: { email: { not: { endsWith: "@test.com" } } },
    select: { id: true },
  });
  return new Set(users.map(u => u.id));
}

async function getXpByPeriod(period: "all" | "week" | "month"): Promise<Map<string, number>> {
  const xpMap = new Map<string, number>();
  const realIds = await getRealUserIds();

  if (period === "all") {
    const users = await prisma.user.findMany({
      where: { email: { not: { endsWith: "@test.com" } } },
      select: { id: true, totalXp: true },
    });
    for (const u of users) {
      if (u.totalXp > 0) xpMap.set(u.id, u.totalXp);
    }
    return xpMap;
  }

  const days = period === "week" ? 7 : 30;
  const txns = await prisma.xpTransaction.findMany({
    where: { createdAt: { gte: dateDaysAgo(days) } },
    select: { userId: true, amount: true },
  });

  for (const t of txns) {
    if (realIds.has(t.userId)) {
      xpMap.set(t.userId, (xpMap.get(t.userId) ?? 0) + t.amount);
    }
  }

  return xpMap;
}

async function getXpBreakdown(userId: string, period: "all" | "week" | "month"): Promise<Record<string, number>> {
  const where = period === "all"
    ? { userId }
    : { userId, createdAt: { gte: dateDaysAgo(period === "week" ? 7 : 30) } };

  const txns = await prisma.xpTransaction.findMany({
    where,
    select: { reason: true, amount: true },
  });

  const breakdown: Record<string, number> = {};
  for (const t of txns) {
    const category = t.reason.includes("Lecture") ? "lectures"
      : t.reason.includes("Quiz") ? "quizzes"
      : t.reason.includes("Practice") ? "practice"
      : t.reason.includes("Problem") || t.reason.includes("Solved") ? "problems"
      : t.reason.includes("Project") || t.reason.includes("Capstone") ? "projects"
      : t.reason.includes("Course Completed") ? "courseComplete"
      : t.reason.includes("Section") ? "sections"
      : "other";
    breakdown[category] = (breakdown[category] ?? 0) + t.amount;
  }
  return breakdown;
}

async function getCourseUserIds(courseSlug: string): Promise<Set<string>> {
  const rows = await prisma.progress.findMany({
    where: { courseSlug },
    select: { userId: true },
    distinct: ["userId"],
  });
  return new Set(rows.map(r => r.userId));
}

async function computeRanks(xpMap: Map<string, number>): Promise<Map<string, number>> {
  const sorted = [...xpMap.entries()].sort((a, b) => b[1] - a[1]);
  const ranks = new Map<string, number>();
  sorted.forEach(([id], i) => ranks.set(id, i + 1));
  return ranks;
}

interface LeaderboardParams {
  period?: "all" | "week" | "month";
  courseSlug?: string;
}

interface LeaderboardEntryResult {
  rank: number;
  name: string;
  email: string;
  lecturesCompleted: number;
  quizzesPassed: number;
  problemsSolved: number;
  projectsCompleted: number;
  streak: number;
  score: number;
  rankChange: number;
  breakdown: Record<string, number>;
  xpToNext: number | null;
  nextRankName: string | null;
}

export async function getLeaderboard(currentUserId?: string, params?: LeaderboardParams) {
  const period = params?.period ?? "all";
  const courseSlug = params?.courseSlug;

  const currentXpMap = await getXpByPeriod(period);
  const currentRanks = await computeRanks(currentXpMap);

  let previousXpMap: Map<string, number> | null = null;
  let previousRanks: Map<string, number> | null = null;

  if (period === "week") {
    const prevTxns = await prisma.xpTransaction.findMany({
      where: { createdAt: { gte: dateDaysAgo(14), lt: dateDaysAgo(7) } },
      select: { userId: true, amount: true },
    });
    previousXpMap = new Map();
    for (const t of prevTxns) {
      previousXpMap.set(t.userId, (previousXpMap.get(t.userId) ?? 0) + t.amount);
    }
    previousRanks = await computeRanks(previousXpMap);
  } else if (period === "month") {
    const prevTxns = await prisma.xpTransaction.findMany({
      where: { createdAt: { gte: dateDaysAgo(60), lt: dateDaysAgo(30) } },
      select: { userId: true, amount: true },
    });
    previousXpMap = new Map();
    for (const t of prevTxns) {
      previousXpMap.set(t.userId, (previousXpMap.get(t.userId) ?? 0) + t.amount);
    }
    previousRanks = await computeRanks(previousXpMap);
  }

  let allowedUserIds: Set<string> | null = null;
  if (courseSlug) {
    allowedUserIds = await getCourseUserIds(courseSlug);
  }

  const allIds = [...currentXpMap.keys()];
  let sortedIds = allIds.sort((a, b) => (currentXpMap.get(b) ?? 0) - (currentXpMap.get(a) ?? 0));

  if (allowedUserIds) {
    sortedIds = sortedIds.filter(id => allowedUserIds!.has(id));
  }

  const topIds = sortedIds.slice(0, 20);

  const users = await prisma.user.findMany({
    where: { id: { in: topIds } },
    select: {
      id: true,
      name: true,
      email: true,
      currentStreak: true,
      _count: {
        select: {
          progress: { where: { status: "COMPLETED" } },
          quizAttempts: { where: { passed: true } },
          submissions: { where: { status: "PASSED" } },
          projects: { where: { status: "COMPLETED" } },
        },
      },
    },
  });

  const userMap = new Map(users.map(u => [u.id, u]));

  const entries: LeaderboardEntryResult[] = [];

  for (const id of topIds) {
    const u = userMap.get(id);
    if (!u) continue;
    const score = currentXpMap.get(id) ?? 0;
    const prevRank = previousRanks?.get(id) ?? null;
    const currRank = currentRanks.get(id) ?? 0;

    const rankChange = prevRank !== null ? prevRank - currRank : 0;

    const breakdown = await getXpBreakdown(id, period);

    const idx = sortedIds.indexOf(id);
    const nextId = idx > 0 ? sortedIds[idx - 1] : null;
    let xpToNext: number | null = null;
    let nextRankName: string | null = null;
    if (nextId) {
      const nextUser = await prisma.user.findUnique({ where: { id: nextId }, select: { name: true } });
      if (nextUser) {
        xpToNext = (currentXpMap.get(nextId) ?? 0) - score;
        nextRankName = nextUser.name;
      }
    }

    entries.push({
      rank: currRank,
      name: u.name,
      email: u.email,
      lecturesCompleted: u._count.progress,
      quizzesPassed: u._count.quizAttempts,
      problemsSolved: u._count.submissions,
      projectsCompleted: u._count.projects,
      streak: u.currentStreak,
      score,
      rankChange,
      breakdown,
      xpToNext,
      nextRankName,
    });
  }

  if (currentUserId && !topIds.includes(currentUserId)) {
    const currentScore = currentXpMap.get(currentUserId) ?? 0;
    if (currentScore > 0) {
      const currentUser = await prisma.user.findUnique({
        where: { id: currentUserId },
        select: {
          id: true,
          name: true,
          email: true,
          currentStreak: true,
          _count: {
            select: {
              progress: { where: { status: "COMPLETED" } },
              quizAttempts: { where: { passed: true } },
              submissions: { where: { status: "PASSED" } },
              projects: { where: { status: "COMPLETED" } },
            },
          },
        },
      });

      if (currentUser && (!allowedUserIds || allowedUserIds.has(currentUserId))) {
        const currRank = currentRanks.get(currentUserId) ?? 0;
        const prevRank = previousRanks?.get(currentUserId) ?? null;
        const rankChange = prevRank !== null ? prevRank - currRank : 0;
        const breakdown = await getXpBreakdown(currentUserId, period);

        const idx = sortedIds.indexOf(currentUserId);
        const nextId = idx > 0 ? sortedIds[idx - 1] : null;
        let xpToNext: number | null = null;
        let nextRankName: string | null = null;
        if (nextId) {
          const nextUser = await prisma.user.findUnique({ where: { id: nextId }, select: { name: true } });
          if (nextUser) {
            xpToNext = (currentXpMap.get(nextId) ?? 0) - currentScore;
            nextRankName = nextUser.name;
          }
        }

        entries.push({
          rank: currRank,
          name: currentUser.name,
          email: currentUser.email,
          lecturesCompleted: currentUser._count.progress,
          quizzesPassed: currentUser._count.quizAttempts,
          problemsSolved: currentUser._count.submissions,
          projectsCompleted: currentUser._count.projects,
          streak: currentUser.currentStreak,
          score: currentScore,
          rankChange,
          breakdown,
          xpToNext,
          nextRankName,
        });
      }
    }
  }

  entries.sort((a, b) => a.rank - b.rank);

  return entries;
}

export async function getUserSummary(userId: string, courseSlug?: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      totalXp: true,
      currentStreak: true,
      _count: {
        select: {
          progress: { where: { status: "COMPLETED" } },
          quizAttempts: { where: { passed: true } },
          submissions: { where: { status: "PASSED" } },
          projects: { where: { status: "COMPLETED" } }
        }
      }
    }
  });

  if (!user) throw new Error("User not found");

  const progressRecords = await prisma.progress.findMany({
    where: {
      userId,
      ...(courseSlug && { courseSlug })
    },
    orderBy: [
      { courseSlug: 'asc' },
      { lectureId: 'asc' }
    ]
  });

  return {
    lecturesCompleted: user._count.progress,
    quizzesPassed: user._count.quizAttempts,
    problemsSolved: user._count.submissions,
    projectsCompleted: user._count.projects,
    xp: user.totalXp,
    streak: user.currentStreak,
    lectureProgress: progressRecords,
  };
}
