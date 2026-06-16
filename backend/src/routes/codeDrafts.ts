import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { z } from "zod";

const router = Router();

// GET /api/drafts/:lectureId?type=problem
router.get("/:lectureId", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const lectureId = req.params.lectureId as string;
    const type = (req.query.type as string) || "problem";

    const draft = await prisma.codeDraft.findUnique({
      where: {
        userId_lectureId_type: {
          userId,
          lectureId,
          type
        }
      }
    });

    res.json({ code: draft?.code || null });
  } catch (error) {
    next(error);
  }
});

const postDraftSchema = z.object({
  lectureId: z.string(),
  type: z.string(),
  code: z.string()
});

router.post("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { lectureId, type, code } = postDraftSchema.parse(req.body);

    const draft = await prisma.codeDraft.upsert({
      where: {
        userId_lectureId_type: {
          userId,
          lectureId,
          type
        }
      },
      update: {
        code,
        savedAt: new Date()
      },
      create: {
        userId,
        lectureId,
        type,
        code
      }
    });

    res.json({ success: true, id: draft.id });
  } catch (error) {
    next(error);
  }
});

export default router;
