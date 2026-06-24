import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

type QueueItemWithUser = Prisma.ReviewQueueGetPayload<{
  include: { user: { select: { id: true; name: true; email: true } } };
}>;

const router = Router();

router.use(requireAuth, requireRole("admin"));

const PRIORITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

function sortByPriority(items: any[]) {
  return items.sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99));
}

router.get("/review-queue", async (_req: AuthenticatedRequest, res, next) => {
  try {
    const now = new Date();

    // 1. Fetch queue items from review_queue table
    const queueItems = await prisma.reviewQueue.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    const mapped = queueItems.map((item: QueueItemWithUser) => ({
      id: item.id,
      itemType: item.itemType,
      itemId: item.itemId,
      userId: item.userId,
      user: item.user,
      priority: item.priority,
      title: item.title,
      description: item.description,
      metadata: item.metadata,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));

    // 2. Compute inactive student alerts (last active > 30 days ago)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const inactiveStudents = await prisma.user.findMany({
      where: {
        role: "student",
        lastActiveAt: { lt: thirtyDaysAgo },
        email: { not: { endsWith: "@test.com" } },
      },
      select: {
        id: true,
        name: true,
        email: true,
        lastActiveAt: true,
        totalXp: true,
      },
      orderBy: { lastActiveAt: "asc" },
    });

    const inactiveAlerts = inactiveStudents.map((s) => ({
      id: `inactive_${s.id}`,
      itemType: "inactive_student",
      itemId: s.id,
      userId: s.id,
      user: { id: s.id, name: s.name, email: s.email },
      priority: "high",
      title: `Inactive Student: ${s.name}`,
      description: `Last active ${Math.floor((now.getTime() - s.lastActiveAt.getTime()) / (1000 * 60 * 60 * 24))} days ago`,
      metadata: { lastActiveAt: s.lastActiveAt.toISOString(), totalXp: s.totalXp },
      createdAt: s.lastActiveAt.toISOString(),
    }));

    // 3. Merge and sort by priority
    const all = sortByPriority([...mapped, ...inactiveAlerts]);

    const counts = {
      total: all.length,
      byPriority: {
        critical: all.filter((i) => i.priority === "critical").length,
        high: all.filter((i) => i.priority === "high").length,
        medium: all.filter((i) => i.priority === "medium").length,
        low: all.filter((i) => i.priority === "low").length,
      },
      byType: {} as Record<string, number>,
    };

    for (const item of all) {
      counts.byType[item.itemType] = (counts.byType[item.itemType] || 0) + 1;
    }

    res.json({ items: all, counts });
  } catch (err) {
    next(err);
  }
});

const resolveSchema = z.object({
  status: z.enum(["resolved", "rejected"]),
  notes: z.string().optional(),
});

router.patch("/review-queue/:id", async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = req.params.id as string;
    const { status, notes } = resolveSchema.parse(req.body);

    const adminId = req.user!.id;

    if (id.startsWith("inactive_")) {
      const userId = id.replace("inactive_", "");
      await prisma.user.update({
        where: { id: userId },
        data: { lastActiveAt: new Date() },
      });
      return res.json({ success: true, message: `Student marked as active` });
    }

    const updated = await prisma.reviewQueue.update({
      where: { id },
      data: {
        status,
        resolvedAt: new Date(),
        resolvedBy: adminId,
        notes: notes ?? null,
      },
    });

    res.json({ success: true, item: updated });
  } catch (err) {
    next(err);
  }
});

router.get("/review-queue/counts", async (_req: AuthenticatedRequest, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [pendingItems, inactiveCount] = await Promise.all([
      prisma.reviewQueue.count({ where: { status: "pending" } }),
      prisma.user.count({
        where: {
          role: "student",
          lastActiveAt: { lt: thirtyDaysAgo },
          email: { not: { endsWith: "@test.com" } },
        },
      }),
    ]);

    res.json({ total: pendingItems + inactiveCount, pendingItems, inactiveCount });
  } catch (err) {
    next(err);
  }
});

export default router;
