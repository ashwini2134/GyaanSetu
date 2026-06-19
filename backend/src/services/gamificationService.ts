import { prisma } from "../prisma.js";

export async function awardXp(userId: string, amount: number, reason: string, actionId?: string) {
  return prisma.$transaction(async (tx) => {
    // 1. If actionId is provided, check if transaction already exists
    if (actionId) {
      const existing = await tx.xpTransaction.findUnique({
        where: {
          userId_actionId: { userId, actionId },
        },
      });
      if (existing) {
        return; // XP already awarded for this action
      }
    }

    // 2. Insert XpTransaction
    await tx.xpTransaction.create({
      data: {
        userId,
        amount,
        reason,
        actionId,
      },
    });

    // 3. Update User stats (XP and Streaks)
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const lastActiveStr = user.lastActiveAt.toISOString().split("T")[0];

    let newCurrentStreak = user.currentStreak;
    let newLongestStreak = user.longestStreak;

    if (lastActiveStr !== todayStr) {
      // Check if lastActive was exactly yesterday
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

    await tx.user.update({
      where: { id: userId },
      data: {
        totalXp: { increment: amount },
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastActiveAt: now,
      },
    });
  });
}

export async function getLeaderboard(currentUserId?: string) {
  const users = await prisma.user.findMany({
    orderBy: [
      { totalXp: "desc" },
      { currentStreak: "desc" },
    ],
    take: 20,
    select: {
      id: true,
      name: true,
      email: true,
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

  const entries = users.map((u, index) => ({
    rank: index + 1,
    name: u.name,
    email: u.email,
    lecturesCompleted: u._count.progress,
    quizzesPassed: u._count.quizAttempts,
    problemsSolved: u._count.submissions,
    projectsCompleted: u._count.projects,
    streak: u.currentStreak,
    score: u.totalXp,
  }));

  if (currentUserId && !users.some((u) => u.id === currentUserId)) {
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: {
        id: true,
        name: true,
        email: true,
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

    if (currentUser) {
      const rank = await prisma.user.count({
        where: {
          OR: [
            { totalXp: { gt: currentUser.totalXp } },
            { totalXp: currentUser.totalXp, currentStreak: { gt: currentUser.currentStreak } }
          ]
        }
      }) + 1;

      entries.push({
        rank,
        name: currentUser.name,
        email: currentUser.email,
        lecturesCompleted: currentUser._count.progress,
        quizzesPassed: currentUser._count.quizAttempts,
        problemsSolved: currentUser._count.submissions,
        projectsCompleted: currentUser._count.projects,
        streak: currentUser.currentStreak,
        score: currentUser.totalXp,
      });
    }
  }

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
