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

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) {
          callback(null, true);
          return;
        }
        const allowedOrigins = new Set([
          config.frontendUrl.replace(/\/$/, ""),
          "http://localhost:5173",
          "http://127.0.0.1:5173",
          "http://localhost:4173",
          "http://127.0.0.1:4173",
        ]);
        if (allowedOrigins.has(origin)) {
          callback(null, true);
          return;
        }
        callback(null, true);
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: "5mb" }));
  app.use(cookieParser());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/progress", progressRoutes);
  app.use("/api/projects", projectRoutes);
  app.use("/api/projects/tasks", projectTasksRoutes);
  app.use("/api/xp", xpRoutes);
  app.use("/api/achievements", achievementsRoutes);
  app.use("/api/streaks", streaksRoutes);
  app.use("/api/quiz-attempts", quizAttemptsRoutes);
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

  app.use(errorHandler);
  return app;
}
