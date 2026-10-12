/**
 * One-off cleanup for the historical achievement-notification duplication
 * bug (pre-redesign: the old client-side checkAchievements() re-notified
 * already-unlocked achievements on every Dashboard mount).
 *
 * Scope: ONLY rows where type = "achievement". Groups by (userId, title),
 * keeps the earliest row in each group, deletes the rest. Never touches
 * project/quiz/certificate/review/streak/etc. notifications.
 *
 * Usage:
 *   npx tsx scripts/cleanup_duplicate_achievement_notifications.ts            # dry run (default, no deletes)
 *   npx tsx scripts/cleanup_duplicate_achievement_notifications.ts --apply    # actually deletes
 */
import { prisma } from "../src/prisma.js";

const APPLY = process.argv.includes("--apply");

async function main() {
  const rows = await prisma.inAppNotification.findMany({
    where: { type: "achievement" },
    select: { id: true, userId: true, title: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const groups = new Map<string, typeof rows>();
  for (const row of rows) {
    const key = `${row.userId}::${row.title}`;
    const group = groups.get(key);
    if (group) group.push(row);
    else groups.set(key, [row]);
  }

  const toDelete: string[] = [];
  const perUser = new Map<string, number>();

  for (const group of groups.values()) {
    if (group.length <= 1) continue;
    const [, ...duplicates] = group; // keep the earliest (index 0)
    for (const dup of duplicates) {
      toDelete.push(dup.id);
      perUser.set(dup.userId, (perUser.get(dup.userId) ?? 0) + 1);
    }
  }

  console.log(`Total "achievement" notification rows: ${rows.length}`);
  console.log(`Distinct (user, title) groups: ${groups.size}`);
  console.log(`Duplicate rows found: ${toDelete.length}`);
  console.log(`Affected users: ${perUser.size}`);
  console.log("\nTop 10 affected users by duplicate count:");
  const sorted = [...perUser.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  for (const [userId, count] of sorted) {
    console.log(`  ${userId}: ${count} duplicates`);
  }

  if (!APPLY) {
    console.log("\nDry run only — no rows deleted. Re-run with --apply to delete.");
    return;
  }

  console.log(`\nDeleting ${toDelete.length} duplicate rows...`);
  const result = await prisma.inAppNotification.deleteMany({
    where: { id: { in: toDelete } },
  });
  console.log(`Deleted ${result.count} rows.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
