import { prisma } from "./src/prisma.ts";

async function main() {
  console.log("Seeding Task 4.3 & 4.4 Mock Data...");

  // Get a user
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "test_seed_user@example.com",
        name: "Test Seed User",
      }
    });
  }
  
  let user2 = await prisma.user.findFirst({ where: { email: { not: user.email } } });
  if (!user2) {
      user2 = await prisma.user.create({
          data: {
              email: "another_test@example.com",
              name: "Another Tester",
          }
      });
  }

  // Get or create a course and project
  let course = await prisma.course.findFirst();
  if (!course) {
    course = await prisma.course.create({
      data: {
        title: "Seed Test Course",
        description: "Test Course",
        category: "Test",
        difficulty: "Beginner",
        estimatedDuration: 10,
        status: "PUBLISHED"
      }
    });
  }

  let project = await prisma.project.findFirst();
  if (!project) {
    project = await prisma.project.create({
      data: {
        title: "Seed Project",
        description: "Test",
        objectives: [],
        requirements: []
      }
    });
  }

  console.log("Creating Blocked Students mock data...");

  // 1. Blocked at Project step (PENDING, 3 days ago)
  await prisma.projectSubmission.create({
    data: {
      userId: user.id,
      studentId: user.id,
      projectId: project.id,
      courseId: course.id,
      githubUrl: "https://github.com/test/repo",
      status: "PENDING",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    }
  });

  // 2. Blocked at Certificate step (APPROVED 3 hours ago + passed quiz, no cert)
  // Create quiz attempt
  await prisma.quizAttempt.create({
    data: {
      userId: user2.id,
      courseId: course.id,
      lectureId: "mock_lecture_id_for_quiz",
      score: 100,
      passed: true,
      answers: {},
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
    }
  });
  
  // Create approved project
  await prisma.projectSubmission.create({
    data: {
      userId: user2.id,
      studentId: user2.id,
      projectId: project.id,
      courseId: course.id,
      githubUrl: "https://github.com/test/repo2",
      status: "APPROVED",
      updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    }
  });
  // Note: No certificate created, so this will trigger Condition 2.

  console.log("Creating AI Review Logs mock data...");

  // AI Review 1: APPROVED (85/100, all ✅)
  await prisma.projectSubmission.create({
    data: {
      userId: user.id,
      studentId: user.id,
      projectId: project.id,
      courseId: course.id,
      githubUrl: "https://github.com/test/approved",
      status: "APPROVED",
      score: 85,
      content: "def hello():\n  print('World')",
      feedback: "Great work! Your code is clean and well-structured.",
      aiReview: {
        criteriaScores: {
          "Code Quality": { score: 18, max: 20 },
          "Functionality": { score: 25, max: 30 },
          "Documentation": { score: 17, max: 20 },
          "Requirements Met": { score: 25, max: 30 }
        },
        strengths: ["Clean code structure", "Met all requirements"],
        improvements: ["Could add more comments"]
      },
      securityCheck: { passed: true, details: "No malicious patterns detected" },
      validationCheck: { passed: true, details: "Word count: 342. Required keywords found." },
      createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 mins ago
      updatedAt: new Date(Date.now() - 1 * 60 * 1000),
    }
  });

  // AI Review 2: REJECTED (45/100, AI check ❌)
  await prisma.projectSubmission.create({
    data: {
      userId: user2.id,
      studentId: user2.id,
      projectId: project.id,
      courseId: course.id,
      githubUrl: "https://github.com/test/rejected",
      status: "REJECTED",
      score: 45,
      content: "print(hello)",
      feedback: "Syntax error and missing requirements.",
      aiReview: {
        criteriaScores: {
          "Code Quality": { score: 10, max: 20 },
          "Functionality": { score: 5, max: 30 },
          "Documentation": { score: 10, max: 20 },
          "Requirements Met": { score: 20, max: 30 }
        }
      },
      securityCheck: { passed: true },
      validationCheck: { passed: true },
      createdAt: new Date(Date.now() - 65 * 60 * 1000), // 65 mins ago
      updatedAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    }
  });

  // AI Review 3: OVERRIDDEN (original 45, override to 75)
  await prisma.projectSubmission.create({
    data: {
      userId: user.id,
      studentId: user.id,
      projectId: project.id,
      courseId: course.id,
      githubUrl: "https://github.com/test/override",
      status: "APPROVED",
      score: 75,
      content: "import sys",
      feedback: "Manually approved by admin: AI misunderstood context",
      isOverridden: true,
      overrideReason: "AI misunderstood context",
      overriddenBy: "admin_123",
      overriddenAt: new Date(),
      aiReview: {
        originalScore: 45,
        criteriaScores: {
          "Code Quality": { score: 10, max: 20 },
          "Functionality": { score: 10, max: 30 },
          "Documentation": { score: 10, max: 20 },
          "Requirements Met": { score: 15, max: 30 }
        }
      },
      securityCheck: { passed: true },
      validationCheck: { passed: true },
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    }
  });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
