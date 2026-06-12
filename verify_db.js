require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('./generated/prisma');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("=== STEP 1: Insert Sample Test Records ===");
  const user = await prisma.user.create({
    data: {
      name: "Test Student",
      email: "test@fraylon.com",
      passwordHash: "hashed_password_123",
      totalXp: 0,
      currentStreak: 0,
      progress: {
        create: {
          courseSlug: "cs50-ai",
          lectureId: "lecture_1",
          status: "COMPLETED"
        }
      },
      quizAttempts: {
        create: {
          quizId: "quiz_lecture_1",
          score: 4,
          total: 6,
          passed: true,
          answers: { "q1": "BFS", "q2": "DFS", "q3": "Neural Network" }
        }
      },
      submissions: {
        create: {
          problemId: "problem_1",
          code: "print('Hello World')",
          status: "PASSED"
        }
      },
      projects: {
        create: {
          projectId: "final_project_1",
          code: "# Final project code here",
          status: "DRAFT"
        }
      },
      achievements: {
        create: {
          achievementId: "first_steps"
        }
      },
      xpHistory: {
        create: {
          amount: 50,
          reason: "Completed Lecture 1",
          actionId: "lecture_1_complete"
        }
      }
    }
  });
  console.log("SUCCESS: Created User and all related records. User ID:", user.id);

  console.log("\n=== STEP 2: Retrieve and Verify Records ===");
  const fetchedUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      progress: true,
      quizAttempts: true,
      submissions: true,
      projects: true,
      achievements: true,
      xpHistory: true
    }
  });
  console.log("SUCCESS: Fetched User:", JSON.stringify(fetchedUser, null, 2));

  console.log("\n=== STEP 3: Test Unique Constraints ===");
  try {
    await prisma.progress.create({
      data: {
        userId: user.id,
        courseSlug: "cs50-ai",
        lectureId: "lecture_1",
        status: "STARTED"
      }
    });
    console.log("ERROR: Progress unique constraint FAILED to block duplicate!");
  } catch (e) {
    console.log("SUCCESS: Progress unique constraint blocked duplicate. Error:", e.code);
  }

  try {
    await prisma.xpTransaction.create({
      data: {
        userId: user.id,
        amount: 10,
        reason: "Hacked",
        actionId: "lecture_1_complete"
      }
    });
    console.log("ERROR: XpTransaction unique constraint FAILED to block duplicate!");
  } catch (e) {
    console.log("SUCCESS: XpTransaction unique constraint blocked duplicate. Error:", e.code);
  }

  try {
    await prisma.achievement.create({
      data: {
        userId: user.id,
        achievementId: "first_steps"
      }
    });
    console.log("ERROR: Achievement unique constraint FAILED to block duplicate!");
  } catch (e) {
    console.log("SUCCESS: Achievement unique constraint blocked duplicate. Error:", e.code);
  }

  console.log("\n=== STEP 4: Test Cascading Delete ===");
  await prisma.user.delete({
    where: { id: user.id }
  });
  console.log("SUCCESS: Deleted User:", user.id);

  const remainingProgress = await prisma.progress.count({ where: { userId: user.id } });
  const remainingQuizzes = await prisma.quizAttempt.count({ where: { userId: user.id } });
  const remainingSubs = await prisma.submission.count({ where: { userId: user.id } });
  
  if (remainingProgress === 0 && remainingQuizzes === 0 && remainingSubs === 0) {
    console.log("SUCCESS: Cascading delete verified. All related records were automatically deleted.");
  } else {
    console.log("ERROR: Some related records survived the cascading delete!");
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
