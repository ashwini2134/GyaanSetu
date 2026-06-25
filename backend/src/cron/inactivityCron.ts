// Fraylon - Phase 2.5 & 3
import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { notificationQueue } from '../lib/queue.js';

const prisma = new PrismaClient();

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
          role: 'student'
        }
      });

      for (const user of inactiveUsers) {
        await notificationQueue.add('inactiveReminder', {
          type: 'INACTIVE_REMINDER',
          userId: user.id,
          email: user.email,
          name: user.name
        });
      }
      console.log(`[Cron] Queued ${inactiveUsers.length} inactive reminders.`);
    } catch (err) {
      console.error('[Cron] Error checking inactive users:', err);
    }
  });
}
