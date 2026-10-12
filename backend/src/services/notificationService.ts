import { prisma } from "../prisma.js";
import { config } from "../config.js";
import { notificationQueue } from "../lib/queue.js";

export type NotifType =
  | "course_update"
  | "deadline"
  | "quiz_result"
  | "achievement"
  | "streak"
  | "message"
  | "project_review"
  | "project_approved"
  | "project_rejected"
  | "daily_mission"
  | "lecture_completed"
  | "section_completed"
  | "practice_completed"
  | "problem_solved"
  | "perfect_score"
  | "milestone_started"
  | "milestone_submitted"
  | "milestone_approved"
  | "capstone_submitted"
  | "capstone_approved"
  | "portfolio_updated"
  | "certificate_ready"
  | "weekly_xp_milestone"
  | "course_released";

export type NotifPriority = "high" | "medium" | "low";

const TYPE_TO_PREF_KEY: Record<NotifType, { email: string; inApp: string }> = {
  course_update:   { email: "emailCourseUpdates",   inApp: "inAppMessages" },
  deadline:        { email: "emailDeadlines",        inApp: "inAppMessages" },
  quiz_result:     { email: "emailQuizResults",      inApp: "inAppMessages" },
  achievement:     { email: "emailAchievements",     inApp: "inAppMessages" },
  streak:          { email: "emailStreakReminders",   inApp: "inAppMessages" },
  message:         { email: "emailCourseUpdates",     inApp: "inAppMessages" },
  project_review:   { email: "emailCourseUpdates",     inApp: "inAppProjectReviews" },
  project_approved: { email: "emailCourseUpdates",     inApp: "inAppProjectReviews" },
  project_rejected: { email: "emailCourseUpdates",     inApp: "inAppProjectReviews" },
  daily_mission:    { email: "emailCourseUpdates",     inApp: "inAppDailyMissions" },
  lecture_completed:  { email: "emailCourseUpdates", inApp: "inAppMessages" },
  section_completed:  { email: "emailCourseUpdates", inApp: "inAppMessages" },
  practice_completed: { email: "emailCourseUpdates", inApp: "inAppMessages" },
  problem_solved:     { email: "emailCourseUpdates", inApp: "inAppMessages" },
  perfect_score:      { email: "emailQuizResults",   inApp: "inAppMessages" },
  milestone_started:   { email: "emailCourseUpdates", inApp: "inAppProjectReviews" },
  milestone_submitted: { email: "emailCourseUpdates", inApp: "inAppProjectReviews" },
  milestone_approved:  { email: "emailCourseUpdates", inApp: "inAppProjectReviews" },
  capstone_submitted:  { email: "emailCourseUpdates", inApp: "inAppProjectReviews" },
  capstone_approved:   { email: "emailCourseUpdates", inApp: "inAppProjectReviews" },
  portfolio_updated:   { email: "emailCourseUpdates", inApp: "inAppMessages" },
  certificate_ready:   { email: "emailCourseUpdates", inApp: "inAppMessages" },
  weekly_xp_milestone: { email: "emailAchievements",  inApp: "inAppMessages" },
  course_released:     { email: "emailCourseUpdates", inApp: "inAppMessages" },
};

// P2002 = unique constraint violation. Used when a caller passes a
// dedupeKey — a second concurrent attempt to create the same notification
// hits this and is treated as "already sent," not an error.
function isUniqueConstraintError(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === "P2002";
}

export async function getUserNotifPrefs(userId: string): Promise<Record<string, boolean>> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { notificationPrefs: true },
  });
  const defaults = {
    emailCourseUpdates: true,
    emailDeadlines: true,
    emailQuizResults: true,
    emailAchievements: true,
    emailStreakReminders: true,
    inAppMessages: true,
    inAppProjectReviews: true,
    inAppDailyMissions: true,
  };
  return user?.notificationPrefs
    ? { ...defaults, ...(user.notificationPrefs as Record<string, boolean>) }
    : defaults;
}

export async function sendInAppNotification(
  userId: string,
  type: NotifType,
  title: string,
  body: string,
  link = "",
  priority: NotifPriority = "medium",
  dedupeKey?: string
): Promise<void> {
  const prefs = await getUserNotifPrefs(userId);
  const { inApp } = TYPE_TO_PREF_KEY[type];
  if (!prefs[inApp]) return;

  try {
    await prisma.inAppNotification.create({
      data: { userId, type, title, body, link, priority, dedupeKey },
    });
  } catch (err) {
    if (!isUniqueConstraintError(err)) throw err;
  }
}

export async function sendNotification(
  userId: string,
  type: NotifType,
  title: string,
  body: string,
  link = "",
  priority: NotifPriority = "medium",
  dedupeKey?: string
): Promise<void> {
  const prefs = await getUserNotifPrefs(userId);
  const { email: emailKey, inApp: inAppKey } = TYPE_TO_PREF_KEY[type];

  // In-app
  if (prefs[inAppKey]) {
    try {
      await prisma.inAppNotification.create({
        data: { userId, type, title, body, link, priority, dedupeKey },
      });
    } catch (err) {
      if (!isUniqueConstraintError(err)) throw err;
      // Already sent (dedupeKey collision) — skip the email below too.
      return;
    }
  }

  // Email — enqueue async so the request cycle is not blocked
  if (prefs[emailKey]) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });
    if (user) {
      const html = buildEmailHtml(body, link);
      await notificationQueue.add(
        'send-email',
        { to: user.email, subject: title, body, link, html },
        { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
      );
    }
  }
}

function buildEmailHtml(body: string, link: string): string {
  return `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
    <h2 style="color:#3B82F6;">GyanSetu</h2>
    <p>${body}</p>
    ${link ? `<p><a href="${link}" style="display:inline-block;padding:10px 20px;background:#3B82F6;color:#fff;text-decoration:none;border-radius:6px;">View Details</a></p>` : ""}
    <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
    <p style="color:#888;font-size:12px;">You received this because your notification preferences are set to receive updates. <a href="${config.frontendUrl}/#/settings">Manage preferences</a>.</p>
  </div>`;
}

const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, normal: 1, low: 2 };

export async function getInAppNotifications(
  userId: string,
  limit = 20
): Promise<Array<{ id: string; type: string; title: string; body: string; link: string; readAt: string | null; createdAt: string; priority: string; category: string }>> {
  // Fetch a wider recent window than `limit`, then sort by priority-then-date
  // in JS — priority is a small closed set of strings, not a natural SQL
  // ORDER BY order, and the feed is small enough that this is cheap.
  const notifs = await prisma.inAppNotification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: Math.min(limit * 3, 60),
  });
  const sorted = notifs.sort((a, b) => {
    const rankDiff = (PRIORITY_RANK[a.priority] ?? 1) - (PRIORITY_RANK[b.priority] ?? 1);
    if (rankDiff !== 0) return rankDiff;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
  return sorted.slice(0, limit).map((n) => ({
    ...n,
    createdAt: n.createdAt instanceof Date ? n.createdAt.toISOString() : n.createdAt,
    readAt: n.readAt instanceof Date ? n.readAt.toISOString() : n.readAt,
  }));
}

export async function markNotificationRead(notificationId: string, userId: string): Promise<void> {
  await prisma.inAppNotification.updateMany({
    where: { id: notificationId, userId },
    data: { readAt: new Date() },
  });
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await prisma.inAppNotification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.inAppNotification.count({
    where: { userId, readAt: null },
  });
}
