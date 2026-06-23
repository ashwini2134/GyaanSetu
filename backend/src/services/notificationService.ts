import { prisma } from "../prisma.js";
import { config } from "../config.js";

type NotifType =
  | "course_update"
  | "deadline"
  | "quiz_result"
  | "achievement"
  | "streak"
  | "message"
  | "project_review"
  | "daily_mission";

const TYPE_TO_PREF_KEY: Record<NotifType, { email: string; inApp: string }> = {
  course_update:   { email: "emailCourseUpdates",   inApp: "inAppMessages" },
  deadline:        { email: "emailDeadlines",        inApp: "inAppMessages" },
  quiz_result:     { email: "emailQuizResults",      inApp: "inAppMessages" },
  achievement:     { email: "emailAchievements",     inApp: "inAppMessages" },
  streak:          { email: "emailStreakReminders",   inApp: "inAppMessages" },
  message:         { email: "emailCourseUpdates",     inApp: "inAppMessages" },
  project_review:  { email: "emailCourseUpdates",     inApp: "inAppProjectReviews" },
  daily_mission:   { email: "emailCourseUpdates",     inApp: "inAppDailyMissions" },
};

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
  link = ""
): Promise<void> {
  const prefs = await getUserNotifPrefs(userId);
  const { inApp } = TYPE_TO_PREF_KEY[type];
  if (!prefs[inApp]) return;

  await prisma.inAppNotification.create({
    data: { userId, type, title, body, link },
  });
}

export async function sendNotification(
  userId: string,
  type: NotifType,
  title: string,
  body: string,
  link = ""
): Promise<void> {
  const prefs = await getUserNotifPrefs(userId);
  const { email: emailKey, inApp: inAppKey } = TYPE_TO_PREF_KEY[type];

  // In-app
  if (prefs[inAppKey]) {
    await prisma.inAppNotification.create({
      data: { userId, type, title, body, link },
    });
  }

  // Email
  if (prefs[emailKey]) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });
    if (user) {
      await sendEmail(user.email, title, body, link);
    }
  }
}

async function sendEmail(to: string, subject: string, body: string, link: string): Promise<void> {
  const { host, port, user, pass, from } = config.smtp;
  const html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
    <h2 style="color:#3B82F6;">Fraylon Academy</h2>
    <p>${body}</p>
    ${link ? `<p><a href="${link}" style="display:inline-block;padding:10px 20px;background:#3B82F6;color:#fff;text-decoration:none;border-radius:6px;">View Details</a></p>` : ""}
    <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
    <p style="color:#888;font-size:12px;">You received this because your notification preferences are set to receive updates. <a href="${config.frontendUrl}/#/settings">Manage preferences</a>.</p>
  </div>`;

  if (host && user && process.env.NODE_ENV !== "test") {
    try {
      const transporter = (await import("nodemailer")).default.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      await transporter.sendMail({ from, to, subject, html });
      console.log(`[notifications] Email sent to ${to}: ${subject}`);
    } catch (err) {
      console.error(`[notifications] Failed to send email to ${to}:`, err);
    }
  } else {
    console.log("\n── Notification Email (dev mode fallback) ──");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    console.log("──────────────────────────────────────────────\n");
  }
}

export async function getInAppNotifications(
  userId: string,
  limit = 20
): Promise<Array<{ id: string; type: string; title: string; body: string; link: string; readAt: string | null; createdAt: string }>> {
  const notifs = await prisma.inAppNotification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return notifs.map((n) => ({
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
