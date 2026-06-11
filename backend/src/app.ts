import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { config } from "./config.js";
import { getDb } from "./db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";

export function createApp() {
  getDb();

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

  app.use(errorHandler);
  return app;
}
