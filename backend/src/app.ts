import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { config } from "./config.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";
import progressRoutes from "./routes/progress.js";
import projectRoutes from "./routes/project.js";
import xpRoutes from "./routes/xp.js";
import achievementsRoutes from "./routes/achievements.js";
import streaksRoutes from "./routes/streaks.js";
import quizAttemptsRoutes from "./routes/quizAttempts.js";
import quizRoutes from "./routes/quiz.js";
import codeDraftsRoutes from "./routes/codeDrafts.js";
import chatRoutes from "./routes/chat.js";
import dailyMissionsRoutes from "./routes/dailyMissions.js";
import notificationsRoutes from "./routes/notifications.js";
import inAppNotificationsRoutes from "./routes/inAppNotifications.js";
import profileRoutes from "./routes/profile.js";
import coursesRoutes from "./routes/courses.js";
import qaRoutes from "./routes/qa.js";
import practiceExercisesRoutes from "./routes/practiceExercises.js";
import assessmentsRoutes from "./routes/assessments.js";
import projectTasksRoutes from "./routes/projectTasks.js";
import certificationsRoutes from "./routes/certifications.js";
import portfolioRoutes from "./routes/portfolio.js";
import resumeRoutes from "./routes/resume.js";
import pushNotificationsRoutes from "./routes/pushNotifications.js";
import emailDigestRoutes from "./routes/emailDigest.js";
import adminRoutes from "./routes/admin.js";
import adminContentRoutes from "./routes/adminContent.js";
import adminPracticeExercisesRoutes from "./routes/adminPracticeExercises.js";
import reviewQueueRoutes from "./routes/reviewQueue.js";
import analyticsRoutes from "./routes/analytics.js";

// Phase 2.5 & 3 Admin Routes
import phase3CoursesRoutes from "./routes/admin/courses.js";
import phase3LessonsRoutes from "./routes/admin/lessons.js";
import phase3ExercisesRoutes from "./routes/admin/exercises.js";
import phase3QuizRoutes from "./routes/admin/quiz.js";
import phase3ProjectsRoutes from "./routes/admin/projects.js";
import phase3VersionsRoutes from "./routes/admin/versions.js";
import phase3BetaRoutes from "./routes/admin/beta.js";
import phase3OperationsRoutes from "./routes/admin/operations.js";

export function createApp() {
  const app = express();

  app.get("/api/test-db", async (_req, res) => {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();
      const count = await prisma.user.count();
      res.json({ status: "connected", userCount: count });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.use(helmet());
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3001',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'https://lms05.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean) as string[];

  app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.use(express.json({ limit: "5mb" }));
  app.use(cookieParser());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/admin/push-db", async (req, res) => {
    try {
      const { execSync } = await import("child_process");
      const output = execSync("npx prisma db push --accept-data-loss --url=\"$DATABASE_URL\"", { encoding: "utf-8" });
      res.json({ status: "success", env: process.env.DATABASE_URL?.substring(0, 20) + "...", output });
    } catch (err: any) {
      res.status(500).json({ error: "Failed", stdout: err.stdout?.toString(), stderr: err.stderr?.toString(), message: err.message });
    }
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/progress", progressRoutes);
  app.use("/api/projects", projectRoutes);
  app.use("/api/projects/tasks", projectTasksRoutes);
  app.use("/api/xp", xpRoutes);
  app.use("/api/achievements", achievementsRoutes);
  app.use("/api/streaks", streaksRoutes);
  app.use("/api/quiz-attempts", quizAttemptsRoutes);
  app.use("/api/quiz", quizRoutes);
  app.use("/api/drafts", codeDraftsRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/daily-missions", dailyMissionsRoutes);
  app.use("/api/notifications", notificationsRoutes);
  app.use("/api/notifications/in-app", inAppNotificationsRoutes);
  app.use("/api/profile", profileRoutes);
  app.use("/api/courses", coursesRoutes);
  app.use("/api/qa", qaRoutes);
  app.use("/api/practice-exercises", practiceExercisesRoutes);
  app.use("/api/assessments", assessmentsRoutes);
  app.use("/api/certifications", certificationsRoutes);
  app.use("/api/portfolio", portfolioRoutes);
  app.use("/api/resume", resumeRoutes);
  app.use("/api/push-notifications", pushNotificationsRoutes);
  app.use("/api/email-digest", emailDigestRoutes);
  // Phase 2.5 & 3 Admin Routes Mount
  app.use("/api/admin/courses", phase3CoursesRoutes);
  app.use("/api/admin", phase3LessonsRoutes);
  app.use("/api/admin", phase3ExercisesRoutes);
  app.use("/api/admin", phase3QuizRoutes);
  app.use("/api/admin", phase3ProjectsRoutes);
  app.use("/api/admin", phase3VersionsRoutes);
  app.use("/api/admin", phase3BetaRoutes);
  app.use("/api/admin/operations", phase3OperationsRoutes);

  app.use("/api/admin", adminRoutes);
  app.use("/api/admin/content", adminContentRoutes);
  app.use("/api/admin", adminPracticeExercisesRoutes);
  app.use("/api/admin", reviewQueueRoutes);
  app.use("/api/admin/analytics", analyticsRoutes);

  app.use(errorHandler);
  return app;
}
