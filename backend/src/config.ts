import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 3001),
  nodeEnv: process.env.NODE_ENV ?? "development",
  isDev: (process.env.NODE_ENV ?? "development") !== "production",
  frontendUrl: required("FRONTEND_URL", "http://localhost:5173/LMS"),
  get databasePath() {
    return process.env.DATABASE_PATH ?? "./data/lms.db";
  },
  jwt: {
    accessSecret: required("JWT_ACCESS_SECRET", "dev-access-secret-change-in-production-32chars"),
    refreshSecret: required("JWT_REFRESH_SECRET", "dev-refresh-secret-change-in-production-32chars"),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "30d",
  },
  oauth: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      callbackUrl:
        process.env.GITHUB_CALLBACK_URL ??
        "http://localhost:3001/api/auth/oauth/github/callback",
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID ?? "",
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET ?? "",
      callbackUrl:
        process.env.LINKEDIN_CALLBACK_URL ??
        "http://localhost:3001/api/auth/oauth/linkedin/callback",
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      callbackUrl:
        process.env.GOOGLE_CALLBACK_URL ??
        "http://localhost:3001/api/auth/oauth/google/callback",
    },
  },
  smtpFrom: process.env.SMTP_FROM ?? "noreply@fraylon.academy",
};
