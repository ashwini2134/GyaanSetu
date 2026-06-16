import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { z } from "zod";

const router = Router();

router.get("/:problemId", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const problemId = req.params.problemId as string;

    const messages = await prisma.chatMessage.findMany({
      where: { userId, problemId },
      orderBy: { createdAt: "asc" }
    });

    const mapped = messages.map(m => ({
      role: m.role,
      content: m.content,
      created_at: m.createdAt.toISOString()
    }));

    res.json(mapped);
  } catch (error) {
    next(error);
  }
});

const postChatSchema = z.object({
  problemId: z.string(),
  role: z.string(),
  content: z.string()
});

router.post("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { problemId, role, content } = postChatSchema.parse(req.body);

    const message = await prisma.chatMessage.create({
      data: {
        userId,
        problemId,
        role,
        content
      }
    });

    res.json({
      role: message.role,
      content: message.content,
      created_at: message.createdAt.toISOString()
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    await prisma.chatMessage.deleteMany({
      where: { userId }
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
