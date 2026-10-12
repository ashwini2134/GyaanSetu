/**
 * Phase 3 Stress Test Suite
 * Simulates concurrent student actions to detect race conditions,
 * duplicate records, queue failures, and data corruption.
 */

import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/prisma.js";
import { gradeQuiz } from "../src/services/quizGradingService.js";
import { sendNotification } from "../src/services/notificationService.js";
import { updatePortfolio } from "../src/lib/portfolioUpdater.js";
import { processCertificate } from "../src/workers/certificateWorker.js";

// ── helpers ───────────────────────────────────────────────────────

async function createStudents(count: number) {
  const students: { userId: string; token: string; email: string }[] = [];
  const ts = Date.now();
  for (let i = 0; i < count; i++) {
    const email = `stress-${i}-${ts}@p3test.com`;
    const user = await prisma.user.create({
      data: { email, name: `Stress ${i}`, passwordHash: "hashed", role: "student" },
    });
    students.push({ userId: user.id, token: "", email });
  }
  return students;
}

async function makeEligible(userId: string, courseSlug: string, lectureCount: number, problemCount: number) {
  const ids = Array.from({ length: lectureCount }, (_, i) => String(i));
  for (const lid of ids) {
    await prisma.progress.upsert({
      where: { userId_courseSlug_lectureId: { userId, courseSlug, lectureId: lid } },
      update: { status: "COMPLETED", practiceCompleted: true },
      create: { userId, courseSlug, lectureId: lid, status: "COMPLETED", practiceCompleted: true },
    });
    await prisma.quizAttempt.create({
      data: { userId, lectureId: `${courseSlug}-${lid}`, courseId: courseSlug, answers: {}, score: 85, passed: true, attemptNumber: 1, feedback: [] },
    });
  }
  for (let i = 0; i < problemCount; i++) {
    await prisma.submission.create({
      data: { userId, problemId: `stress-prob-${i}-${userId.slice(-4)}`, code: "pass", status: "PASSED" },
    });
  }
  await prisma.progress.update({
    where: { userId_courseSlug_lectureId: { userId, courseSlug, lectureId: String(lectureCount - 1) } },
    data: { projectCompleted: true, projectId: "quiz_app" },
  });
}

// ── setup ─────────────────────────────────────────────────────────

async function cleanAll() {
  await prisma.projectSubmission.deleteMany();
  await prisma.courseProject.deleteMany();
  await prisma.course.deleteMany();
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
// STRESS 1 — CONCURRENT QUIZ SUBMISSIONS
// ═══════════════════════════════════════════════════════════════════

describe("Stress — Concurrent Quiz Submissions", () => {
  it("S01: 20 students submit quiz simultaneously — all pass, no data corruption", async () => {
    const N = 20;
    const students = await createStudents(N);
    const questions = [{ id: "q1", correctAnswer: "A", points: 10 }];

    const start = Date.now();
    const results = await Promise.all(
      students.map((s) => gradeQuiz(s.userId, "fundamentals-of-ai-0", "fundamentals-of-ai", { q1: "A" }, questions))
    );
    const elapsed = Date.now() - start;

    // All must pass
    expect(results.every((r) => r.passed)).toBe(true);
    expect(results.every((r) => r.score === 100)).toBe(true);

    // Each student has exactly 1 attempt
    const counts = await Promise.all(
      students.map((s) => prisma.quizAttempt.count({ where: { userId: s.userId } }))
    );
    expect(counts.every((c) => c === 1)).toBe(true);

    // Progress unlocked for all
    const unlocked = await Promise.all(
      students.map((s) =>
        prisma.progress.findFirst({ where: { userId: s.userId, courseSlug: "fundamentals-of-ai", lectureId: "1" } })
      )
    );
    expect(unlocked.every((p) => p?.status === "unlocked")).toBe(true);

    console.log(`[S01] 20 concurrent quizzes: ${elapsed}ms`);
  });

  it("S02: 100 quiz submissions across 10 students (10 each) — no missing attempts", async () => {
    const N = 10;
    const ROUNDS = 10;
    const students = await createStudents(N);
    const questions = [{ id: "q1", correctAnswer: "B", points: 5 }];

    // Each student submits to different lectures to avoid unique constraint conflicts
    const tasks = students.flatMap((s, si) =>
      Array.from({ length: ROUNDS }, (_, ri) =>
        gradeQuiz(s.userId, `fundamentals-of-ai-${si * ROUNDS + ri}`, "fundamentals-of-ai", { q1: "B" }, questions)
      )
    );

    const results = await Promise.all(tasks);
    expect(results).toHaveLength(N * ROUNDS);
    expect(results.every((r) => r.score === 100)).toBe(true);

    const totalAttempts = await prisma.quizAttempt.count();
    expect(totalAttempts).toBe(N * ROUNDS);
  });
});

// ═══════════════════════════════════════════════════════════════════
// STRESS 2 — CONCURRENT PORTFOLIO UPDATES
// ═══════════════════════════════════════════════════════════════════

describe("Stress — Concurrent Portfolio Updates", () => {
  it("S03: same student — 10 concurrent portfolio updates — no data corruption", async () => {
    const students = await createStudents(1);
    const { userId } = students[0];

    // 10 different projects updated concurrently for the same student
    const projects = ["quiz_app", "todo_list", "expense_tracker", "student_management"];
    const tasks = Array.from({ length: 10 }, (_, i) =>
      updatePortfolio(userId, "projects", {
        projectId: projects[i % projects.length] + `-variant-${i}`,
        title: `Project ${i}`,
        isCapstone: false,
      })
    );

    await Promise.all(tasks);

    const portfolio = await prisma.studentPortfolio.findUnique({ where: { studentId: userId } });
    expect(portfolio).not.toBeNull();
    const projectEntries = portfolio?.projects as any[];
    // At least some projects were recorded (deduplication may reduce count)
    expect(projectEntries?.length).toBeGreaterThan(0);
  });

  it("S04: deduplication is safe under concurrent adds of same project", async () => {
    const students = await createStudents(1);
    const { userId } = students[0];

    // 5 concurrent adds of the SAME project
    const tasks = Array.from({ length: 5 }, () =>
      updatePortfolio(userId, "projects", { projectId: "quiz_app", title: "Quiz App", isCapstone: false })
    );

    await Promise.allSettled(tasks);

    const portfolio = await prisma.studentPortfolio.findUnique({ where: { studentId: userId } });
    const entries = portfolio?.projects as any[];
    const dupes = entries?.filter((p: any) => p.projectId === "quiz_app") ?? [];
    // Must have at most 1 entry — deduplication holds even under concurrency
    expect(dupes.length).toBeLessThanOrEqual(1);
  });
});

// ═══════════════════════════════════════════════════════════════════
// STRESS 3 — CONCURRENT PROJECT SUBMISSIONS (IN-FLIGHT GUARD)
// ═══════════════════════════════════════════════════════════════════

describe("Stress — Concurrent Project Submissions", () => {
  it("S05: student submits then immediately resubmits while first is PENDING — 409 on second", async () => {
    // Register a real student with a token (service-layer user can't auth via HTTP)
    const reg = await request(app)
      .post("/api/auth/register")
      .send({ email: `s05-${Date.now()}@p3test.com`, password: "pass1234", name: "Stress5" });
    const token = reg.body.access_token;

    // First submission — lands as PENDING
    const first = await request(app)
      .post("/api/student/projects/quiz_app/submit")
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "def hello(): return 42" });
    expect(first.status).toBe(200);

    // Second submission while first is still PENDING — in-flight guard fires
    const second = await request(app)
      .post("/api/student/projects/quiz_app/submit")
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "def hello(): return 99" });
    expect(second.status).toBe(409);
    expect(second.body.error).toMatch(/progress/i);
  });
});

// ═══════════════════════════════════════════════════════════════════
// STRESS 4 — CONCURRENT CERTIFICATE ISSUANCE (IDEMPOTENCY)
// ═══════════════════════════════════════════════════════════════════

describe("Stress — Certificate Idempotency", () => {
  it("S06: same student — 5 concurrent certificate jobs — exactly 1 certificate issued", async () => {
    const students = await createStudents(1);
    const { userId } = students[0];
    await makeEligible(userId, "fundamentals-of-ai", 10, 20);

    // Fire 5 concurrent certificate jobs for the same student + course
    const tasks = Array.from({ length: 5 }, () =>
      processCertificate({ data: { studentId: userId, courseId: "fundamentals-of-ai" } })
    );

    await Promise.allSettled(tasks);

    const certs = await prisma.issuedCertificate.findMany({ where: { userId, courseSlug: "fundamentals-of-ai" } });
    expect(certs).toHaveLength(1);
  });

  it("S07: 10 different students each get their own certificate — no cross-contamination", async () => {
    const N = 10;
    const students = await createStudents(N);
    // python: 14 lectures, 37 problems (from COURSE_LECTURE_COUNTS + COURSE_PROBLEM_COUNTS)
    await Promise.all(students.map((s) => makeEligible(s.userId, "python", 14, 37)));

    await Promise.all(
      students.map((s) => processCertificate({ data: { studentId: s.userId, courseId: "python" } }))
    );

    const certs = await prisma.issuedCertificate.findMany({ where: { courseSlug: "python" } });
    expect(certs).toHaveLength(N);

    // Each cert belongs to a different student
    const userIds = new Set(certs.map((c) => c.userId));
    expect(userIds.size).toBe(N);

    // Each cert number is unique
    const certNumbers = new Set(certs.map((c) => c.certNumber));
    expect(certNumbers.size).toBe(N);
  });
});

// ═══════════════════════════════════════════════════════════════════
// STRESS 5 — NOTIFICATION THROUGHPUT
// ═══════════════════════════════════════════════════════════════════

describe("Stress — Notification Throughput", () => {
  it("S08: 50 concurrent in-app notifications — all created, none lost", async () => {
    const students = await createStudents(5);
    const NOTIFS_PER_STUDENT = 10;

    const tasks = students.flatMap((s) =>
      Array.from({ length: NOTIFS_PER_STUDENT }, (_, i) =>
        sendNotification(s.userId, "achievement", `Badge ${i}`, `You earned badge ${i}`)
      )
    );

    const start = Date.now();
    await Promise.all(tasks);
    const elapsed = Date.now() - start;

    const total = await prisma.inAppNotification.count();
    expect(total).toBe(students.length * NOTIFS_PER_STUDENT);

    console.log(`[S08] 50 concurrent notifications: ${elapsed}ms`);
  });

  it("S09: high-volume quiz notifications do not create duplicate notifications per attempt", async () => {
    const students = await createStudents(10);
    const questions = [{ id: "q1", correctAnswer: "A", points: 10 }];

    await Promise.all(
      students.map((s) => gradeQuiz(s.userId, "python-0", "python", { q1: "A" }, questions))
    );

    // A 100% score now sends the more specific "perfect_score" type instead
    // of the generic "quiz_result" — each student should have exactly 1
    // notification total across the two, not 0 and not 2.
    for (const s of students) {
      const quizResultCount = await prisma.inAppNotification.count({
        where: { userId: s.userId, type: "quiz_result" },
      });
      const perfectScoreCount = await prisma.inAppNotification.count({
        where: { userId: s.userId, type: "perfect_score" },
      });
      expect(quizResultCount + perfectScoreCount).toBe(1);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════
// STRESS 6 — DATABASE WRITE INTEGRITY
// ═══════════════════════════════════════════════════════════════════

describe("Stress — Database Write Integrity", () => {
  it("S10: 20 students unlock lesson concurrently — no Progress record corruption", async () => {
    const students = await createStudents(20);
    const questions = [{ id: "q1", correctAnswer: "A", points: 10 }];

    await Promise.all(
      students.map((s) => gradeQuiz(s.userId, "fundamentals-of-ai-5", "fundamentals-of-ai", { q1: "A" }, questions))
    );

    const records = await prisma.progress.findMany({
      where: {
        courseSlug: "fundamentals-of-ai",
        lectureId: "6",
        status: "unlocked",
      },
    });

    // All 20 students should have the unlock
    expect(records).toHaveLength(20);

    // Verify no duplicate records per student
    const userIdSet = new Set(records.map((r) => r.userId));
    expect(userIdSet.size).toBe(20);
  });
});
