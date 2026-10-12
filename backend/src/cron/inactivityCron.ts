// Fraylon - Phase 2.5 & 3
import cron from 'node-cron';
import { sendNotification } from '../services/notificationService.js';
import { prisma } from "../prisma.js";

const isTestEnv = process.env.NODE_ENV === "test";
const emailFilter = isTestEnv
  ? { NOT: [{ email: { endsWith: "@test.com" } }] }
  : { NOT: [{ email: { endsWith: "@test.com" } }, { email: { endsWith: "@example.com" } }] };

export function startCronJobs() {
  // Run daily at 9am
  cron.schedule('0 9 * * *', async () => {
    console.log('[Cron] Running inactivity checker...');
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    try {
      const inactiveUsers = await prisma.user.findMany({
        where: {
          lastActiveAt: { lt: threeDaysAgo },
          role: 'student',
          ...emailFilter
        }
      });

      for (const user of inactiveUsers) {
        // sendNotification creates the in-app record and enqueues the email
        // with the correct { to, subject, body, link, html } format the worker expects.
        await sendNotification(
          user.id,
          'streak',
          "We miss you",
          `Hi ${user.name ?? 'there'}, it's been a few days since you last learned something new. Jump back in and keep your streak going!`,
          '/courses',
          'low'
        );
      }
      console.log(`[Cron] Queued ${inactiveUsers.length} inactive reminders.`);
    } catch (err) {
      console.error('[Cron] Error checking inactive users:', err);
    }
  });
}
