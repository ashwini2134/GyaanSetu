import { Router } from "express";
import { prisma } from "../../prisma.js";
import { Redis } from "ioredis";

const router = Router({ mergeParams: true });

router.get("/", async (req, res, next) => {
  console.log("Health API hit");
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // AI Review Service Check
    let aiStatus = "unknown";
    let aiProvider = "mock";
    let aiModel = "gemini-2.0-flash";
    
    try {
      console.log("Checking AI Config");
      const aiConfig = await prisma.aIConfiguration.findFirst();
      if (aiConfig) {
        aiProvider = aiConfig.provider;
        aiModel = aiConfig.model;
      }
      
      const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.ANTHROPIC_API_KEY;
      if (apiKey) {
        aiStatus = "running";
      } else {
        aiStatus = "down";
      }
    } catch (e) {
      aiStatus = "down";
      console.log("AI check failed", e);
    }

    console.log("Checking AI Reviews");
    const aiReviewsQuery = await prisma.projectSubmission.aggregate({
      where: {
        status: { in: ["APPROVED", "REJECTED"] },
        updatedAt: { gte: today }
      },
      _count: true,
      _max: { updatedAt: true }
    });

    const aiLastReview = aiReviewsQuery._max.updatedAt;
    const aiReviewsToday = aiReviewsQuery._count;

    // Certificates Check
    let certStatus = "down";
    let certIssuedToday = 0;
    let certTotal = 0;
    let certLastIssued: Date | null = null;

    try {
      console.log("Checking Certificates");
      const certsQuery = await prisma.certificate.aggregate({
        _count: true,
        _max: { issuedAt: true }
      });
      certTotal = certsQuery._count;
      certLastIssued = certsQuery._max.issuedAt;

      const certsTodayQuery = await prisma.certificate.count({
        where: { issuedAt: { gte: today } }
      });
      certIssuedToday = certsTodayQuery;
      
      certStatus = "running";
    } catch (e) {
      console.log("Cert check failed", e);
      certStatus = "down";
    }

    // Email Check
    let emailStatus = "not_configured";
    let emailProvider = "none";
    let emailApiKeySet = false;

    if (process.env.RESEND_API_KEY) {
      emailStatus = "configured";
      emailProvider = "resend";
      emailApiKeySet = true;
    }

    // Background Jobs Check
    let jobsStatus = "mock";
    let jobsMode = "mock";
    let redisConnected = false;

    if (process.env.REDIS_URL) {
      jobsMode = "bullmq";
      let client: Redis | null = null;
      try {
        console.log("Checking Redis");
        client = new Redis(process.env.REDIS_URL, {
          connectTimeout: 1000,
          maxRetriesPerRequest: 0,
          retryStrategy: () => null, // Do not retry
          enableOfflineQueue: false, // Prevent hanging
        });
        
        console.log("Pinging Redis");
        // Timeout the ping just in case
        const pingPromise = client.ping();
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 1000));
        await Promise.race([pingPromise, timeoutPromise]);
        
        redisConnected = true;
        jobsStatus = "running";
        console.log("Redis connected");
      } catch (e) {
        console.log("Redis check failed", e);
        jobsStatus = "down";
      } finally {
        if (client) {
          console.log("Disconnecting Redis");
          client.disconnect();
        }
      }
    }

    console.log("Checking pending jobs");
    const pendingJobs = await prisma.projectSubmission.count({
      where: { status: "PENDING" }
    });

    const completedJobsToday = await prisma.projectSubmission.count({
      where: {
        status: { in: ["APPROVED", "REJECTED"] },
        updatedAt: { gte: today }
      }
    });

    const failedJobsToday = await prisma.projectSubmission.count({
      where: {
        status: "ERROR",
        updatedAt: { gte: today }
      }
    });

    // Stats
    console.log("Checking stats");
    const activeStudents = await prisma.user.count({
      where: {
        lastActiveAt: { gte: sevenDaysAgo },
        role: "student"
      }
    });

    console.log("Sending response");
    res.json({
      timestamp: new Date().toISOString(),
      services: {
        aiReview: {
          status: aiStatus,
          provider: aiProvider,
          model: aiModel,
          lastReviewAt: aiLastReview,
          reviewsToday: aiReviewsToday
        },
        certificates: {
          status: certStatus,
          issuedToday: certIssuedToday,
          totalIssued: certTotal,
          lastIssuedAt: certLastIssued
        },
        email: {
          status: emailStatus,
          provider: emailProvider,
          apiKeySet: emailApiKeySet
        },
        backgroundJobs: {
          status: jobsStatus,
          mode: jobsMode,
          redisConnected,
          pendingJobs,
          completedToday: completedJobsToday,
          failedToday: failedJobsToday
        }
      },
      stats: {
        activeStudents,
        reviewsToday: aiReviewsToday,
        certsToday: certIssuedToday,
        failedJobs: failedJobsToday
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
