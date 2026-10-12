import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load from backend/.env first, then fall back to root .env
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("[Prisma] DATABASE_URL environment variable is not set.");
  console.error("[Prisma] Checked paths:");
  console.error(`[Prisma] - ${path.resolve(__dirname, "../.env")}`);
  console.error(`[Prisma] - ${path.resolve(__dirname, "../../.env")}`);
  throw new Error("DATABASE_URL environment variable is not set. Please configure it in backend/.env or root .env file.");
}

console.log("[Prisma] DATABASE_URL is set (credentials hidden for security)");

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

