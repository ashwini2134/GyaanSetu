import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const today = new Date().toISOString().split("T")[0];

    let dm = await prisma.dailyMission.findUnique({
      where: { userId_date: { userId, date: today } }
    });

    if (!dm) {
      // Create new missions for today
      const missions = [
        { id: "login", title: "Daily Login", xp: 5, completed: false },
        { id: "lecture", title: "Complete 1 Lecture", xp: 15, completed: false },
        { id: "quiz", title: "Pass 1 Quiz", xp: 20, completed: false },
      ];
      dm = await prisma.dailyMission.create({
        data: {
          userId,
          date: today,
          missions
        }
      });
    }

    res.json({ missions: dm.missions });
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const today = new Date().toISOString().split("T")[0];
    const { missions } = req.body;

    const dm = await prisma.dailyMission.upsert({
      where: { userId_date: { userId, date: today } },
      update: { missions },
      create: { userId, date: today, missions }
    });

    res.json({ missions: dm.missions });
  } catch (error) {
    next(error);
  }
});

export default router;
