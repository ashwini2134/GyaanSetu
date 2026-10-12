import { Router } from "express";
import { prisma } from "../../prisma.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";

const router = Router({ mergeParams: true });

// Require admin for all roles routes
router.use(requireAuth);
router.use(requireRole("admin"));

router.get("/users", async (req, res, next) => {
  try {
    const search = req.query.search as string;

    let whereClause = {};
    if (search) {
      whereClause = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        avatarUrl: true,
      },
      take: 50,
    });

    const [adminCount, studentCount, instructorCount] = await Promise.all([
      prisma.user.count({ where: { role: "admin" } }),
      prisma.user.count({ where: { role: "student" } }),
      prisma.user.count({ where: { role: "instructor" } }),
    ]);

    res.json({
      users,
      adminCount,
      studentCount,
      instructorCount,
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/users/:id/role", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["admin", "student"].includes(role)) {
      return res.status(400).json({ error: "Invalid role specified." });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return res.status(404).json({ error: "User not found." });
    }

    // Safety checks
    if ((req as any).user?.id === id) {
      return res.status(400).json({ error: "Cannot change your own role." });
    }

    if (targetUser.role === "admin" && role !== "admin") {
      const adminCount = await prisma.user.count({ where: { role: "admin" } });
      if (adminCount <= 1) {
        return res.status(400).json({ error: "Cannot remove the last admin." });
      }
    }

    const oldRole = targetUser.role;

    const updatedUser = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id },
        data: { role },
        select: { id: true, name: true, email: true, role: true },
      });

      await tx.roleChangeHistory.create({
        data: {
          userId: id,
          changedById: (req as any).user!.id,
          fromRole: oldRole,
          toRole: role,
        },
      });

      return updated;
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
});

router.get("/history", async (req, res, next) => {
  try {
    const history = await prisma.roleChangeHistory.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Fetch user details for the history
    const userIds = new Set<string>();
    history.forEach(h => {
      userIds.add(h.userId);
      userIds.add(h.changedById);
    });

    const users = await prisma.user.findMany({
      where: { id: { in: Array.from(userIds) } },
      select: { id: true, name: true, email: true, avatarUrl: true },
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    const enrichedHistory = history.map(h => ({
      ...h,
      user: userMap.get(h.userId) || { name: "Unknown User" },
      changedBy: userMap.get(h.changedById) || { name: "Unknown Admin" },
    }));

    res.json(enrichedHistory);
  } catch (error) {
    next(error);
  }
});

export default router;
