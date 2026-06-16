import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { config } from "./config.js";
<<<<<<< HEAD
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

export function createApp() {
=======
import { getDb } from "./db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";
import progressRoutes from "./routes/progress.js";

export function createApp() {
  getDb();

>>>>>>> 8245f18 (Initial commit)
  const app = express();

  app.use(helmet());
  const allowedOrigins = new Set([
    config.frontendUrl.replace(/\/$/, ""),
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ]);
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/progress", progressRoutes);
<<<<<<< HEAD
  app.use("/api/projects", projectRoutes);
  app.use("/api/xp", xpRoutes);
  app.use("/api/achievements", achievementsRoutes);
  app.use("/api/streaks", streaksRoutes);
  app.use("/api/quiz-attempts", quizAttemptsRoutes);
  app.use("/api/drafts", codeDraftsRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/daily-missions", dailyMissionsRoutes);
=======
>>>>>>> 8245f18 (Initial commit)

  app.use(errorHandler);
  return app;
}
