import { Router } from "express";
import { prisma } from "../../prisma.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";

const router = Router({ mergeParams: true });

router.use(requireAuth);
router.use(requireRole("admin"));

// GET all webhooks
router.get("/webhooks", async (req, res, next) => {
  try {
    const webhooks = await prisma.webhookEndpoint.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { deliveries: true }
        }
      }
    });

    res.json(webhooks);
  } catch (error) {
    next(error);
  }
});

// GET all deliveries (last 20)
router.get("/webhooks/deliveries", async (req, res, next) => {
  try {
    const deliveries = await prisma.webhookDelivery.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        webhook: {
          select: { url: true }
        }
      }
    });

    res.json(deliveries);
  } catch (error) {
    next(error);
  }
});

// POST new webhook
router.post("/webhooks", async (req, res, next) => {
  try {
    const { url, events, secretKey } = req.body;

    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: "Invalid URL format." });
    }

    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ error: "At least one event must be selected." });
    }

    const webhook = await prisma.webhookEndpoint.create({
      data: {
        url,
        events,
        secretKey: secretKey || null,
        isActive: true,
      }
    });

    res.status(201).json(webhook);
  } catch (error) {
    next(error);
  }
});

// PATCH edit webhook
router.patch("/webhooks/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { url, events, secretKey, isActive } = req.body;

    if (url) {
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ error: "Invalid URL format." });
      }
    }

    const data: any = {};
    if (url !== undefined) data.url = url;
    if (events !== undefined) data.events = events;
    if (secretKey !== undefined) data.secretKey = secretKey;
    if (isActive !== undefined) data.isActive = isActive;

    const webhook = await prisma.webhookEndpoint.update({
      where: { id },
      data
    });

    res.json(webhook);
  } catch (error) {
    next(error);
  }
});

// DELETE webhook
router.delete("/webhooks/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await prisma.$transaction([
      prisma.webhookDelivery.deleteMany({ where: { webhookId: id } }),
      prisma.webhookEndpoint.delete({ where: { id } })
    ]);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// POST retry delivery
router.post("/webhooks/:id/retry", async (req, res, next) => {
  try {
    const { id } = req.params; // this is delivery id
    
    const delivery = await prisma.webhookDelivery.findUnique({
      where: { id },
      include: { webhook: true }
    });

    if (!delivery) {
      return res.status(404).json({ error: "Delivery not found." });
    }

    // In a real system, you would enqueue a job here.
    // For now, we will just simulate a retry attempt.
    
    const newDelivery = await prisma.webhookDelivery.create({
      data: {
        webhookId: delivery.webhookId,
        event: delivery.event,
        payload: delivery.payload ? JSON.parse(JSON.stringify(delivery.payload)) : {},
        status: "200 OK", // Simulating success for the UI
        responseCode: 200,
      }
    });

    res.json(newDelivery);
  } catch (error) {
    next(error);
  }
});

export default router;
