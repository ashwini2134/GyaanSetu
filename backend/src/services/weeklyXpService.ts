import { prisma } from "../prisma.js";

export function getWeekBounds(date: Date = new Date()): { weekStart: Date; weekEnd: Date; weekNumber: number } {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(d);
  weekStart.setDate(diff);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const firstJan = new Date(d.getFullYear(), 0, 1);
  const days = Math.floor((weekStart.getTime() - firstJan.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + firstJan.getDay() + 1) / 7);

  return { weekStart, weekEnd, weekNumber };
}

export async function getCurrentWeekXp(userId: string): Promise<number> {
  const { weekStart, weekEnd } = getWeekBounds();
  const result = await prisma.xpTransaction.aggregate({
    where: {
      userId,
      createdAt: { gte: weekStart, lte: weekEnd },
    },
    _sum: { amount: true },
  });
  return result._sum.amount ?? 0;
}

export async function getWeeklyGraph(userId: string): Promise<{ date: string; xp: number }[]> {
  const { weekStart, weekEnd } = getWeekBounds();
  const days: { date: string; xp: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const dayStart = new Date(weekStart);
    dayStart.setDate(weekStart.getDate() + i);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);
    const result = await prisma.xpTransaction.aggregate({
      where: { userId, createdAt: { gte: dayStart, lte: dayEnd } },
      _sum: { amount: true },
    });
    days.push({
      date: dayStart.toISOString().split("T")[0],
      xp: result._sum.amount ?? 0,
    });
  }
  return days;
}

export async function getRecentActivity(userId: string, limit = 20): Promise<{
  id: string;
  amount: number;
  reason: string;
  createdAt: Date;
}[]> {
  return prisma.xpTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, amount: true, reason: true, createdAt: true },
  });
}

export async function archiveCurrentWeek(userId: string): Promise<void> {
  const { weekStart, weekEnd, weekNumber } = getWeekBounds();
  const totalXp = await getCurrentWeekXp(userId);
  const activities = await prisma.xpTransaction.count({
    where: { userId, createdAt: { gte: weekStart, lte: weekEnd } },
  });
  await prisma.weeklyXp.upsert({
    where: { userId_weekStart: { userId, weekStart } },
    update: { totalXp, activities, weekEnd, weekNumber },
    create: { userId, weekStart, weekEnd, weekNumber, totalXp, activities },
  });
}

export async function getArchivedWeeks(userId: string): Promise<{
  weekStart: Date;
  weekEnd: Date;
  weekNumber: number;
  totalXp: number;
  rank: number | null;
  activities: number;
}[]> {
  return prisma.weeklyXp.findMany({
    where: { userId },
    orderBy: { weekStart: "desc" },
    select: { weekStart: true, weekEnd: true, weekNumber: true, totalXp: true, rank: true, activities: true },
  });
}

export async function getWeeklyRank(userId: string, weekStart: Date): Promise<number | null> {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const allUsersXp = await prisma.xpTransaction.groupBy({
    by: ["userId"],
    where: { createdAt: { gte: weekStart, lte: weekEnd } },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
  });

  const index = allUsersXp.findIndex((u) => u.userId === userId);
  return index === -1 ? null : index + 1;
}

export async function getLifetimeStats(userId: string): Promise<{
  totalXp: number;
  lecturesCompleted: number;
  quizzesPassed: number;
  problemsSolved: number;
  practiceCompleted: number;
  milestoneProjects: number;
  capstoneProjects: number;
  coursesCompleted: number;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalXp: true },
  });
  if (!user) throw new Error("User not found");

  const [lecturesCompleted, quizzesPassed, problemsSolved, practiceCount, projectsCount, capstoneCount, coursesCompleted] = await Promise.all([
    prisma.progress.count({ where: { userId, status: "COMPLETED" } }),
    prisma.quizAttempt.count({ where: { userId, passed: true } }),
    prisma.submission.count({ where: { userId, status: "PASSED" } }),
    prisma.xpTransaction.count({ where: { userId, reason: { contains: "Practice" } } }),
    prisma.project.count({ where: { userId, status: "COMPLETED" } }),
    prisma.progress.count({ where: { userId, projectCompleted: true } }),
    prisma.issuedCertificate.count({ where: { userId } }),
  ]);

  return {
    totalXp: user.totalXp,
    lecturesCompleted,
    quizzesPassed,
    problemsSolved,
    practiceCompleted: practiceCount,
    milestoneProjects: projectsCount,
    capstoneProjects: capstoneCount,
    coursesCompleted,
  };
}

export async function getXpCenterData(userId: string): Promise<{
  weeklyXp: number;
  weeklyRank: number | null;
  totalLearners: number;
  weekStart: string;
  weekEnd: string;
  weekNumber: number;
  secondsUntilReset: number;
  dailyGraph: { date: string; xp: number }[];
  recentActivity: { id: string; amount: number; reason: string; createdAt: Date }[];
  previousWeeks: { weekStart: Date; weekEnd: Date; weekNumber: number; totalXp: number; rank: number | null; activities: number }[];
  lifetimeStats: {
    totalXp: number;
    lecturesCompleted: number;
    quizzesPassed: number;
    problemsSolved: number;
    practiceCompleted: number;
    milestoneProjects: number;
    capstoneProjects: number;
    coursesCompleted: number;
  };
}> {
  const { weekStart, weekEnd, weekNumber } = getWeekBounds();

  const [weeklyXp, dailyGraph, recentActivity, previousWeeks, lifetimeStats] = await Promise.all([
    getCurrentWeekXp(userId),
    getWeeklyGraph(userId),
    getRecentActivity(userId),
    getArchivedWeeks(userId),
    getLifetimeStats(userId),
  ]);

  const weeklyRank = await getWeeklyRank(userId, weekStart);

  const nextMonday = new Date(weekEnd);
  nextMonday.setDate(weekEnd.getDate() + 1);
  nextMonday.setHours(0, 0, 0, 0);
  const secondsUntilReset = Math.round((nextMonday.getTime() - Date.now()) / 1000);

  const totalLearners = await prisma.user.count({
    where: { role: "student" },
  });

  return {
    weeklyXp,
    weeklyRank,
    totalLearners,
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
    weekNumber,
    secondsUntilReset,
    dailyGraph,
    recentActivity,
    previousWeeks,
    lifetimeStats,
  };
}
