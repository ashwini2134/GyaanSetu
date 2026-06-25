// Fraylon - Phase 2.5 & 3
import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";

const router = Router();
router.use(requireAuth, requireRole('admin'));

router.get("/health", async (req, res) => {
  res.json({ redis: process.env.REDIS_URL ? 'UP' : 'DOWN', email: 'MOCKED', ai: 'MOCKED', db: 'UP' });
});

router.get("/jobs", async (req, res) => {
  res.json([]);
});

router.get("/blocked-students", async (req, res) => {
  res.json([]);
});

router.get("/ai-review-logs", async (req, res) => {
  res.json([]);
});

export default router;
