import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { totalXp: true }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const history = await prisma.xpTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    res.json({
      totalXp: user.totalXp,
      history: history.map(tx => ({
        id: tx.id,
        action: tx.reason,
        xp: tx.amount,
        timestamp: tx.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
});

// Endpoint to manually add XP (if frontend still triggers manual XP adds for some reason)
router.post("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { amount, reason } = req.body;

    const tx = await prisma.$transaction(async (prismaTx) => {
      await prismaTx.xpTransaction.create({
        data: { userId, amount, reason }
      });
      const updatedUser = await prismaTx.user.update({
        where: { id: userId },
        data: { totalXp: { increment: amount } },
        select: { totalXp: true }
      });
      return updatedUser;
    });

    res.json({ totalXp: tx.totalXp });
  } catch (error) {
    next(error);
  }
});

export default router;
