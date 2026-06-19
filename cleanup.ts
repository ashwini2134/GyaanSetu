import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/index.js";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:amazon@localhost:5432/fraylon_lms";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  const deleteResult = await prisma.assessmentQuestion.deleteMany({
    where: { type: 'coding' }
  });
  console.log(`Deleted ${deleteResult.count} coding questions`);

  const codingCount = await prisma.assessmentQuestion.count({
    where: { type: 'coding' }
  });
  console.log(`Coding questions count: ${codingCount}`);

  const mcqCount = await prisma.assessmentQuestion.count({
    where: { type: 'mcq' }
  });
  console.log(`MCQ questions count: ${mcqCount}`);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
