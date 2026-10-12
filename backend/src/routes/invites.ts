import { Router, Response } from "express";
import { prisma } from "../prisma.js";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import crypto from "crypto";

const router = Router();

function generateRandomCode(name: string): string {
  const sanitized = name.toUpperCase().replace(/[^A-Z]/g, "").substring(0, 5);
  const randomStr = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `FRAY-${sanitized}-${randomStr}`;
}

// GET /api/invites/code - fetch or create the user's invite code
router.get("/code", requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;

    // Check if user already has an active code
    let inviteCode = await prisma.inviteCode.findFirst({
      where: { createdBy: userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!inviteCode) {
      // Create a new permanent code
      const newCodeStr = generateRandomCode(req.user!.name);
      inviteCode = await prisma.inviteCode.create({
        data: {
          code: newCodeStr,
          createdBy: userId,
        }
      });
    }

    res.json({ code: inviteCode.code });
  } catch (error) {
    next(error);
  }
});

// POST /api/invites/redeem - redeem a code
router.post("/redeem", requireAuth, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const { code } = req.body;

    if (!code || typeof code !== "string") {
      throw new AppError("Invalid code provided", 400);
    }

    const inviteCode = await prisma.inviteCode.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        _count: {
          select: { redemptions: true }
        }
      }
    });

    if (!inviteCode) {
      throw new AppError("Invalid or non-existent invite code", 404);
    }

    if (inviteCode.createdBy === userId) {
      throw new AppError("You cannot redeem your own invite code", 400);
    }

    if (inviteCode.expiresAt && new Date() > inviteCode.expiresAt) {
      throw new AppError("This invite code has expired", 400);
    }

    if (inviteCode.maxUses !== null && inviteCode._count.redemptions >= inviteCode.maxUses) {
      throw new AppError("This invite code has reached its maximum uses", 400);
    }

    // Check if already redeemed
    const existing = await prisma.redeemedCode.findUnique({
      where: {
        userId_inviteCodeId: {
          userId,
          inviteCodeId: inviteCode.id
        }
      }
    });

    if (existing) {
      throw new AppError("You have already redeemed this code", 400);
    }

    await prisma.redeemedCode.create({
      data: {
        userId,
        inviteCodeId: inviteCode.id
      }
    });

    res.json({ success: true, message: "Code successfully redeemed!" });
  } catch (error) {
    next(error);
  }
});

export default router;
