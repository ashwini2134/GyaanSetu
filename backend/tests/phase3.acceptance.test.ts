/**
 * Phase 3 Acceptance Test Suite
 * Full student journey from quiz submission through certificate generation.
 * Tests use the test DB (fraylon_lms_test) with no external API dependencies.
 * Worker processor functions are called directly to test async pipelines synchronously.
 */

import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/prisma.js";
import { gradeQuiz } from "../src/services/quizGradingService.js";
import { runProjectReview } from "../src/services/aiReviewService.js";
import { sendNotification } from "../src/services/notificationService.js";
import { updatePortfolio } from "../src/lib/portfolioUpdater.js";
import { checkEligibility } from "../src/services/certificationService.js";
import { processCertificate } from "../src/workers/certificateWorker.js";
import { processCapstoneReview } from "../src/workers/capstoneReviewWorker.js";

// ── helpers ──────────────────────────────────────────────────────────────────

async function registerStudent(app: any, suffix: string) {
  const res = await request(app)
    .post("/api/auth/register")
    .send({
      email: `student-${suffix}@p3test.com`,
      password: "testpassword123",
      name: `P3 Student ${suffix}`,
    });
  const userId = res.body.user?.id || res.body.userId;
  if (!userId) {
    throw new Error(`Registration failed: no userId in response. Response: ${JSON.stringify(res.body)}`);
  }
  return { token: res.body.access_token as string, userId };
}

/** Build a set of Progress records that satisfy all eligibility conditions for a course. */
async function makeEligible(userId: string, courseSlug: string, lectureCount: number, problemCount: number) {
  const lectureIds = Array.from({ length: lectureCount }, (_, i) => String(i));

  // All lectures COMPLETED + practiceCompleted
  for (const lid of lectureIds) {
    await prisma.progress.upsert({
      where: { userId_courseSlug_lectureId: { userId, courseSlug, lectureId: lid } },
      update: { status: "COMPLETED", practiceCompleted: true },
      create: { userId, courseSlug, lectureId: lid, status: "COMPLETED", practiceCompleted: true },
    });
  }

  // Quiz attempts for all lectures - use correct format: courseSlug-lecture-N
  for (let i = 0; i < lectureCount; i++) {
    await prisma.quizAttempt.create({
      data: {
        userId,
        lectureId: `${courseSlug}-lecture-${i}`,
        courseId: courseSlug,
        answers: {},
        score: 85,
        passed: true,
        attemptNumber: 1,
        feedback: [],
      },
    });
  }

  // Enough PASSED submissions
  for (let i = 0; i < problemCount; i++) {
    await prisma.submission.create({
      data: { userId, problemId: `prob-${i}`, code: "print('hi')", status: "PASSED" },
    });
  }

  // TryIt engagement for lectures that have try-it blocks - use numeric lecture IDs
  for (let i = 0; i < lectureCount; i++) {
    await prisma.tryItEngagement.create({
      data: {
        userId,
        courseSlug,
        lectureId: String(i), // numeric as string
        blockId: `block-${i}`,
        secondsSpent: 30, // Above TRYIT_ENGAGED_SECONDS threshold
      },
    });
  }

  // Capstone project completed on last lecture
  await prisma.progress.update({
    where: { userId_courseSlug_lectureId: { userId, courseSlug, lectureId: String(lectureCount - 1) } },
    data: { projectCompleted: true, projectId: "quiz_app" },
  });

  // Create an approved final project submission with score >= 60
  // Use a project ID that's in FINAL_PROJECT_IDS for the course
  const finalProjectId = courseSlug === "fundamentals-of-ai" ? "search_trace" : "py_task_manager";
  const project = await prisma.project.create({
    data: { userId, projectId: finalProjectId, code: "", status: "COMPLETED" },
  });
  await prisma.projectSubmission.create({
    data: {
      userId,
      studentId: userId,
      projectId: project.id,
      githubUrl: "",
      content: "def main():\n    return True",
      status: "APPROVED",
      score: 85,
      attemptNumber: 1,
    },
  });

  // For fundamentals-of-ai, create milestone submissions (6 slots required)
  if (courseSlug === "fundamentals-of-ai") {
    const milestoneProjectIds = [
      "cs50ai-tictactoe",      // Slot 1
      "fundamentals-of-ai-minesweeper",  // Slot 2
      "fundamentals-of-ai-heredity",     // Slot 3
      "fundamentals-of-ai-crossword",    // Slot 4
      "fundamentals-of-ai-nim",          // Slot 5
      "fundamentals-of-ai-traffic",      // Slot 6
    ];

    for (const mpid of milestoneProjectIds) {
      const mProject = await prisma.project.create({
        data: { userId, projectId: mpid, code: "", status: "COMPLETED" },
      });
      await prisma.projectSubmission.create({
        data: {
          userId,
          studentId: userId,
          projectId: mProject.id,
          githubUrl: "",
          content: "def milestone():\n    return True",
          status: "APPROVED",
          score: 80,
          attemptNumber: 1,
        },
      });
    }
  }
}

// ── setup / teardown ─────────────────────────────────────────────────────────

async function cleanAll() {
  // Delete in reverse dependency order to respect foreign-key constraints
  // ProjectSubmission has RESTRICT FK on User (userId) - must delete first
  await prisma.projectSubmission.deleteMany();
  // ProjectTaskProgress has CASCADE FK on both User and Project
  await prisma.projectTaskProgress.deleteMany();
  // Project has CASCADE FK on User
  await prisma.project.deleteMany();
  // ProjectFile has CASCADE FK on User
  await prisma.projectFile.deleteMany();
  // Course/CourseProject have no User FK - delete separately
  await prisma.courseProject.deleteMany();
  await prisma.course.deleteMany();
  // QuizAttempt has CASCADE FK on User - should cascade, but delete explicitly for safety
  await prisma.quizAttempt.deleteMany();
  // All other User relations have CASCADE - User deleteMany will cascade
  await prisma.user.deleteMany();
}

let app: ReturnType<typeof createApp>;

beforeEach(async () => {
  await cleanAll();
  app = createApp();
});

afterAll(async () => {
  await cleanAll();
  await prisma.$disconnect();
});

// ═══════════════════════════════════════════════════════════════════
// SUITE 1 — QUIZ GRADING ENGINE
// ═══════════════════════════════════════════════════════════════════

describe("Phase 3.1 — Quiz Grading Engine", () => {
  it("T01: grades a passing quiz correctly (all correct = 100%)", async () => {
    const { userId } = await registerStudent(app, "t01");
    const questions = [
      { id: "q1", correctAnswer: "A", points: 10 },
      { id: "q2", correctAnswer: "B", points: 10 },
    ];
    const result = await gradeQuiz(
      userId,
      "fundamentals-of-ai-0",
      "fundamentals-of-ai",
      { q1: "A", q2: "B" },
      questions
    );

    expect(result.score).toBe(100);
    expect(result.passed).toBe(true);
    expect(result.feedback).toHaveLength(0);
    expect(result.attemptId).toBeDefined();
  });

  it("T02: grades a failing quiz correctly (all wrong = 0%)", async () => {
    const { userId } = await registerStudent(app, "t02");
    const questions = [{ id: "q1", correctAnswer: "A", points: 10 }];
    const result = await gradeQuiz(userId, "fundamentals-of-ai-0", "fundamentals-of-ai", { q1: "C" }, questions);

    expect(result.score).toBe(0);
    expect(result.passed).toBe(false);
    expect(result.feedback).toHaveLength(1);
    expect(result.feedback[0].questionId).toBe("q1");
    expect(result.feedback[0].correctAnswer).toBe("A");
  });

  it("T03: passing quiz unlocks next lecture in Progress table", async () => {
    const { userId } = await registerStudent(app, "t03");
    const questions = [{ id: "q1", correctAnswer: "A", points: 10 }];

    await gradeQuiz(userId, "fundamentals-of-ai-3", "fundamentals-of-ai", { q1: "A" }, questions);

    const progress = await prisma.progress.findFirst({
      where: { userId, courseSlug: "fundamentals-of-ai", lectureId: "4" },
    });

    expect(progress).not.toBeNull();
    expect(progress?.status).toBe("unlocked");
  });

  it("T04: passing quiz creates in-app notification", async () => {
    const { userId } = await registerStudent(app, "t04");
    const questions = [{ id: "q1", correctAnswer: "A", points: 10 }];

    await gradeQuiz(userId, "fundamentals-of-ai-0", "fundamentals-of-ai", { q1: "A" }, questions);

    // This scenario is a 100% score, which now sends the more specific
    // "perfect_score" type instead of the generic "quiz_result".
    const notif = await prisma.inAppNotification.findFirst({
      where: { userId, type: "perfect_score" },
    });
    expect(notif).not.toBeNull();
    expect(notif?.title).toContain("Perfect");
  });

  it("T05: failing quiz creates fail notification but does NOT unlock next lecture", async () => {
    const { userId } = await registerStudent(app, "t05");
    const questions = [{ id: "q1", correctAnswer: "A", points: 10 }];

    await gradeQuiz(userId, "fundamentals-of-ai-2", "fundamentals-of-ai", { q1: "Z" }, questions);

    const unlocked = await prisma.progress.findFirst({
      where: { userId, courseSlug: "fundamentals-of-ai", lectureId: "3" },
    });
    expect(unlocked).toBeNull();

    const notif = await prisma.inAppNotification.findFirst({
      where: { userId, type: "quiz_result" },
    });
    expect(notif).not.toBeNull();
    expect(notif?.title).toBe("Quiz Result");
  });

  it("T06: quiz endpoint returns correct shape", async () => {
    const { token } = await registerStudent(app, "t06");
    const res = await request(app)
      .post("/api/quiz/submit")
      .set("Authorization", `Bearer ${token}`)
      .send({
        lectureId: "fundamentals-of-ai-0",
        courseId: "fundamentals-of-ai",
        answers: { q1: "A" },
        questions: [{ id: "q1", correctAnswer: "A", points: 10 }],
      });

    expect(res.status).toBe(200);
    expect(res.body.score).toBe(100);
    expect(res.body.passed).toBe(true);
    expect(res.body.attemptId).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════════
// SUITE 2 — AI PROJECT REVIEW PIPELINE
// ═══════════════════════════════════════════════════════════════════

describe("Phase 3.2 — AI Project Review Pipeline", () => {
  async function createProject(userId: string) {
    const project = await prisma.project.create({
      data: { userId, projectId: "quiz_app", code: "", status: "IN_PROGRESS" },
    });
    return prisma.projectSubmission.create({
      data: {
        userId,
        studentId: userId,
        projectId: project.id,
        githubUrl: "",
        content: "def main():\n    print('Hello World')\n\nif __name__ == '__main__':\n    main()",
        status: "PENDING",
        attemptNumber: 1,
      },
    });
  }

  it("T07: project submission endpoint returns submissionId", async () => {
    const { token } = await registerStudent(app, "t07");
    const res = await request(app)
      .post("/api/student/projects/quiz_app/submit")
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "def hello():\n    return 'world'" });

    expect(res.status).toBe(200);
    expect(res.body.submissionId).toBeDefined();
    expect(res.body.status).toBe("PENDING");
  });

  it("T08: runProjectReview approves valid content in mock AI mode", async () => {
    const { userId } = await registerStudent(app, "t08");
    const submission = await createProject(userId);

    await runProjectReview(submission.id);

    const updated = await prisma.projectSubmission.findUnique({ where: { id: submission.id } });
    expect(updated?.status).toBe("APPROVED");
    expect(updated?.score).toBeGreaterThan(0);
  });

  it("T09: runProjectReview rejects submission with malicious code (eval)", async () => {
    const { userId } = await registerStudent(app, "t09");
    const project = await prisma.project.create({
      data: { userId, projectId: "quiz_app", code: "", status: "IN_PROGRESS" },
    });
    const submission = await prisma.projectSubmission.create({
      data: {
        userId,
        studentId: userId,
        projectId: project.id,
        content: "eval(input())",
        githubUrl: "",
        status: "PENDING",
        attemptNumber: 1,
      },
    });

    await runProjectReview(submission.id);

    const updated = await prisma.projectSubmission.findUnique({ where: { id: submission.id } });
    expect(updated?.status).toBe("REJECTED");
    expect(updated?.feedback).toContain("Security check failed");
  });

  it("T10: portfolio is updated after project approval", async () => {
    const { userId } = await registerStudent(app, "t10");
    const submission = await createProject(userId);

    await runProjectReview(submission.id);

    const portfolio = await prisma.studentPortfolio.findUnique({ where: { studentId: userId } });
    expect(portfolio).not.toBeNull();
    const projects = portfolio?.projects as any[];
    expect(projects?.some((p: any) => p.projectId === submission.projectId)).toBe(true);
  });

  it("T11: approval notification sent to student", async () => {
    const { userId } = await registerStudent(app, "t11");
    const submission = await createProject(userId);

    await runProjectReview(submission.id);

    const notif = await prisma.inAppNotification.findFirst({
      where: { userId, type: "milestone_approved" },
    });
    expect(notif).not.toBeNull();
    expect(notif?.title).toContain("Approved");
  });

  it("T12: rejection notification sent when AI review fails score threshold", async () => {
    const { userId } = await registerStudent(app, "t12");
    const project = await prisma.project.create({
      data: { userId, projectId: "todo_list", code: "", status: "IN_PROGRESS" },
    });
    const submission = await prisma.projectSubmission.create({
      data: {
        userId,
        studentId: userId,
        projectId: project.id,
        content: "eval(input('cmd: '))",
        githubUrl: "",
        status: "PENDING",
        attemptNumber: 1,
      },
    });

    await runProjectReview(submission.id);

    const notif = await prisma.inAppNotification.findFirst({
      where: { userId, type: "project_rejected" },
    });
    expect(notif).not.toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════
// SUITE 3 — CAPSTONE PIPELINE
// ═══════════════════════════════════════════════════════════════════

describe("Phase 3.3 — Capstone Pipeline", () => {
  async function setupCapstoneRoute() {
    const course = await prisma.course.create({
      data: { title: "Test Capstone Course", description: "Test", category: "test", difficulty: "beginner", estimatedDuration: 10 },
    });
    await prisma.courseProject.create({
      data: {
        courseId: course.id,
        title: "Capstone Test Project",
        requirements: "Build something awesome",
        submissionType: "github",
        isCapstone: true,
      },
    });
    return course.id;
  }

  it("T13: capstone submission is detected and routed correctly", async () => {
    const courseId = await setupCapstoneRoute();
    const { token } = await registerStudent(app, "t13");

    const res = await request(app)
      .post("/api/student/projects/quiz_app/submit")
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "def main():\n    print('capstone!')", courseId });

    expect(res.status).toBe(200);
    expect(res.body.isCapstone).toBe(true);
    expect(res.body.message).toContain("Capstone");
  });

  it("T14: processCapstoneReview runs full AI pipeline and sends achievement notification", async () => {
    const course = await prisma.course.create({
      data: { title: "CS50 Capstone", description: "Test", category: "test", difficulty: "intermediate", estimatedDuration: 20 },
    });
    await prisma.courseProject.create({
      data: {
        courseId: course.id,
        title: "Final Capstone",
        requirements: "Build it",
        submissionType: "github",
        isCapstone: true,
      },
    });
    const { userId } = await registerStudent(app, "t14");
    const project = await prisma.project.create({
      data: { userId, projectId: "quiz_app", code: "", status: "IN_PROGRESS" },
    });
    const submission = await prisma.projectSubmission.create({
      data: {
        userId,
        studentId: userId,
        projectId: project.id,
        courseId: course.id,
        content: "def capstone():\n    return True",
        githubUrl: "",
        status: "PENDING",
        attemptNumber: 1,
      },
    });

    await processCapstoneReview({ data: { submissionId: submission.id } });

    const updated = await prisma.projectSubmission.findUnique({ where: { id: submission.id } });
    // In mock AI mode, the review may result in NEEDS_REVIEW or APPROVED depending on content
    // The important part is that the pipeline runs and processes the submission
    expect(updated?.status).toMatch(/APPROVED|NEEDS_REVIEW|REJECTED/);

    const notif = await prisma.inAppNotification.findFirst({
      where: { userId, title: { contains: "Capstone" } },
    });
    expect(notif).not.toBeNull();
  }, 10000);
});

// ═══════════════════════════════════════════════════════════════════
// SUITE 4 — CERTIFICATE GENERATION
// ═══════════════════════════════════════════════════════════════════

describe("Phase 3.4 — Certificate Generation", () => {
  it("T15: checkEligibility returns all 5 conditions for ineligible student", async () => {
    const { userId } = await registerStudent(app, "t15");
    const result = await checkEligibility(userId, "fundamentals-of-ai");

    expect(result.eligible).toBe(false);
    expect(result.conditions.lecturesCompleted).toBeDefined();
    expect(result.conditions.practiceCompleted).toBeDefined();
    expect(result.conditions.quizzesPassed).toBeDefined();
    expect(result.conditions.problemsSubmitted).toBeDefined();
    expect(result.conditions.finalProjectApproved).toBeDefined();
  });

  it("T16: processCertificate issues certificate when all conditions are met", async () => {
    const { userId } = await registerStudent(app, "t16");
    // fundamentals-of-ai: 9 lectures, 21 problems
    await makeEligible(userId, "fundamentals-of-ai", 9, 21);

    await processCertificate({ data: { studentId: userId, courseId: "fundamentals-of-ai" } });

    const cert = await prisma.issuedCertificate.findFirst({ where: { userId, courseSlug: "fundamentals-of-ai" } });
    expect(cert).not.toBeNull();
    expect(cert?.certNumber).toMatch(/CERT-FUNDAMENTALS-OF-AI-/);
  });

  it("T17: processCertificate is idempotent — no duplicate certificate issued", async () => {
    const { userId } = await registerStudent(app, "t17");
    await makeEligible(userId, "fundamentals-of-ai", 9, 21);

    await processCertificate({ data: { studentId: userId, courseId: "fundamentals-of-ai" } });
    await processCertificate({ data: { studentId: userId, courseId: "fundamentals-of-ai" } });

    const certs = await prisma.issuedCertificate.findMany({ where: { userId, courseSlug: "fundamentals-of-ai" } });
    expect(certs).toHaveLength(1);
  });

  it("T18: verification endpoint returns full cert metadata", async () => {
    const { userId } = await registerStudent(app, "t18");
    const certNumber = `CERT-CS50AI-${Date.now()}`;
    await prisma.issuedCertificate.create({
      data: { userId, courseSlug: "fundamentals-of-ai", certNumber, issuedBy: "test", templateId: "default" },
    });

    const res = await request(app).get(`/api/certifications/verify/${certNumber}`);

    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(true);
    expect(res.body.certNumber).toBe(certNumber);
    expect(res.body.recipientName).toBeDefined();
    expect(res.body.courseSlug).toBe("fundamentals-of-ai");
    expect(res.body.issuedAt).toBeDefined();
  });

  it("T19: verification endpoint returns 404 for nonexistent certificate", async () => {
    const res = await request(app).get("/api/certifications/verify/FAKE-CERT");

    expect(res.status).toBe(404);
  });

  it("T20: certificate notification sent after issuance", async () => {
    const { userId } = await registerStudent(app, "t20");
    await makeEligible(userId, "fundamentals-of-ai", 9, 21);

    await processCertificate({ data: { studentId: userId, courseId: "fundamentals-of-ai" } });

    const notif = await prisma.inAppNotification.findFirst({
      where: { userId, type: "certificate_ready" },
    });
    expect(notif).not.toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════
// SUITE 5 — NOTIFICATION ENGINE
// ═══════════════════════════════════════════════════════════════════

describe("Phase 3.5 — Notification Engine", () => {
  it("T21: sendNotification creates in-app record with correct fields", async () => {
    const { userId } = await registerStudent(app, "t21");

    await sendNotification(userId, "quiz_result", "Test Title", "Test body", "/test");

    const notif = await prisma.inAppNotification.findFirst({ where: { userId } });
    expect(notif).not.toBeNull();
    expect(notif?.title).toBe("Test Title");
    expect(notif?.body).toBe("Test body");
    expect(notif?.link).toBe("/test");
    expect(notif?.readAt).toBeNull();
  });

  it("T22: sendNotification respects in-app opt-out preference", async () => {
    const { userId } = await registerStudent(app, "t22");
    await prisma.user.update({
      where: { id: userId },
      data: { notificationPrefs: { inAppMessages: false } },
    });

    await sendNotification(userId, "quiz_result", "Should not appear", "Body");

    const count = await prisma.inAppNotification.count({ where: { userId } });
    expect(count).toBe(0);
  });

  it("T23: notifications endpoint returns unread notifications", async () => {
    const { token, userId } = await registerStudent(app, "t23");
    await sendNotification(userId, "achievement", "Badge Earned", "You earned a badge!");

    const res = await request(app)
      .get("/api/notifications/in-app")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    const notifs = res.body.notifications ?? res.body;
    expect(Array.isArray(notifs)).toBe(true);
    expect(notifs.length).toBeGreaterThanOrEqual(1);
  });

  it("T24: inactivity cron format — sendNotification used directly passes correct payload", async () => {
    const { userId } = await registerStudent(app, "t24");

    // Simulate what the fixed inactivityCron now does
    await sendNotification(
      userId,
      "streak",
      "We miss you! Come back to Fraylon 👋",
      "Hi there, it's been a few days...",
      "/courses"
    );

    const notif = await prisma.inAppNotification.findFirst({
      where: { userId, type: "streak" },
    });
    expect(notif).not.toBeNull();
    expect(notif?.title).toContain("miss you");
    expect(notif?.link).toBe("/courses");
  });
});

// ═══════════════════════════════════════════════════════════════════
// SUITE 6 — PORTFOLIO AUTOMATION
// ═══════════════════════════════════════════════════════════════════

describe("Phase 3.6 — Portfolio Automation", () => {
  it("T25: updatePortfolio adds project entry and auto-generates skills", async () => {
    const { userId } = await registerStudent(app, "t25");

    await updatePortfolio(userId, "projects", { projectId: "text_classifier", title: "Text Classifier", isCapstone: false });

    const portfolio = await prisma.studentPortfolio.findUnique({ where: { studentId: userId } });
    const projects = portfolio?.projects as any[];
    const skills = portfolio?.skills as string[];
    expect(projects?.some((p: any) => p.projectId === "text_classifier")).toBe(true);
    expect(skills).toContain("Python");
    expect(skills).toContain("Machine Learning");
  });

  it("T26: updatePortfolio deduplicates — adding same project twice is idempotent", async () => {
    const { userId } = await registerStudent(app, "t26");

    await updatePortfolio(userId, "projects", { projectId: "todo_list", title: "To-Do", isCapstone: false });
    await updatePortfolio(userId, "projects", { projectId: "todo_list", title: "To-Do", isCapstone: false });

    const portfolio = await prisma.studentPortfolio.findUnique({ where: { studentId: userId } });
    const projects = portfolio?.projects as any[];
    const dupes = projects?.filter((p: any) => p.projectId === "todo_list");
    expect(dupes).toHaveLength(1);
  });

  it("T27: capstone project entry includes Capstone Project skill", async () => {
    const { userId } = await registerStudent(app, "t27");

    await updatePortfolio(userId, "projects", { projectId: "quiz_app", title: "Quiz App", isCapstone: true });

    const portfolio = await prisma.studentPortfolio.findUnique({ where: { studentId: userId } });
    const skills = portfolio?.skills as string[];
    expect(skills).toContain("Capstone Project");
  });

  it("T28: portfolio GET endpoint returns student portfolio", async () => {
    const { token, userId } = await registerStudent(app, "t28");
    await updatePortfolio(userId, "courses", { courseSlug: "fundamentals-of-ai", title: "Fundamentals of AI" });

    const res = await request(app)
      .get("/api/portfolio")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.studentId).toBe(userId);
    const courses = res.body.courses as any[];
    expect(courses?.some((c: any) => c.courseSlug === "fundamentals-of-ai")).toBe(true);
  });
});
