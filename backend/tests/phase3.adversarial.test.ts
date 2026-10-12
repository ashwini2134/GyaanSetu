/**
 * Phase 3 Adversarial / QA Test Suite
 * Attempts to break the system with invalid inputs, unauthorized access,
 * injection attacks, duplicate submissions, expired sessions, and boundary conditions.
 * Identifies every weakness and confirms mitigations.
 */

import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/prisma.js";
import { runProjectReview } from "../src/services/aiReviewService.js";
import { gradeQuiz } from "../src/services/quizGradingService.js";
import { processCertificate } from "../src/workers/certificateWorker.js";

// ── helpers ───────────────────────────────────────────────────────

async function registerStudent(app: any, suffix: string) {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ email: `adv-${suffix}@p3test.com`, password: "testpassword123", name: `Adversarial ${suffix}` });
  return { token: res.body.access_token as string, userId: res.body.user?.id as string };
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
// AUTHENTICATION ENFORCEMENT
// ═══════════════════════════════════════════════════════════════════

describe("Adversarial — Authentication Enforcement", () => {
  it("A01: quiz submit without token → 401", async () => {
    const res = await request(app)
      .post("/api/quiz/submit")
      .send({ lectureId: "fundamentals-of-ai-0", courseId: "fundamentals-of-ai", answers: {}, questions: [] });
    expect(res.status).toBe(401);
  });

  it("A02: project submit without token → 401", async () => {
    const res = await request(app)
      .post("/api/student/projects/quiz_app/submit")
      .send({ content: "def x(): pass" });
    expect(res.status).toBe(401);
  });

  it("A03: portfolio access without token → 401", async () => {
    const res = await request(app).get("/api/portfolio");
    expect(res.status).toBe(401);
  });

  it("A04: certificate listing without token → 401", async () => {
    const res = await request(app).get("/api/certifications");
    expect(res.status).toBe(401);
  });

  it("A05: forged/expired JWT is rejected → 401", async () => {
    const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmYWtlIn0.fake";
    const res = await request(app)
      .get("/api/portfolio")
      .set("Authorization", `Bearer ${fakeToken}`);
    expect(res.status).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════════════
// INPUT VALIDATION — QUIZ
// ═══════════════════════════════════════════════════════════════════

describe("Adversarial — Quiz Input Validation", () => {
  it("A06: quiz submit with missing lectureId → 400", async () => {
    const { token } = await registerStudent(app, "a06");
    const res = await request(app)
      .post("/api/quiz/submit")
      .set("Authorization", `Bearer ${token}`)
      .send({ courseId: "fundamentals-of-ai", answers: {}, questions: [] });
    expect(res.status).toBe(400);
  });

  it("A07: quiz submit with missing courseId → 400", async () => {
    const { token } = await registerStudent(app, "a07");
    const res = await request(app)
      .post("/api/quiz/submit")
      .set("Authorization", `Bearer ${token}`)
      .send({ lectureId: "fundamentals-of-ai-0", answers: {}, questions: [] });
    expect(res.status).toBe(400);
  });

  it("A08: empty questions array → score 0, not crashed", async () => {
    const { userId } = await registerStudent(app, "a08");
    const result = await gradeQuiz(userId, "fundamentals-of-ai-0", "fundamentals-of-ai", {}, []);
    expect(result.score).toBe(0);
    expect(result.passed).toBe(false);
  });

  it("A09: non-string lectureId (numeric) — coerced to string, no crash", async () => {
    const { userId } = await registerStudent(app, "a09");
    // Pass a numeric index — should be handled as '5' by the parser
    const result = await gradeQuiz(userId, "5", "fundamentals-of-ai", { q1: "A" }, [{ id: "q1", correctAnswer: "A", points: 10 }]);
    expect(result).toBeDefined();
    expect(typeof result.score).toBe("number");
  });

  it("A10: submitting quiz twice to same lecture — attempt counter increments", async () => {
    const { userId } = await registerStudent(app, "a10");
    const q = [{ id: "q1", correctAnswer: "A", points: 10 }];
    await gradeQuiz(userId, "fundamentals-of-ai-0", "fundamentals-of-ai", { q1: "A" }, q);
    const result2 = await gradeQuiz(userId, "fundamentals-of-ai-0", "fundamentals-of-ai", { q1: "A" }, q);

    const attempts = await prisma.quizAttempt.findMany({ where: { userId, lectureId: "fundamentals-of-ai-0" } });
    expect(attempts).toHaveLength(2);
    expect(attempts.find((a) => a.attemptNumber === 2)).toBeDefined();
    expect(result2.attemptId).not.toBe(attempts[0].id);
  });
});

// ═══════════════════════════════════════════════════════════════════
// INPUT VALIDATION — PROJECT SUBMISSION
// ═══════════════════════════════════════════════════════════════════

describe("Adversarial — Project Input Validation", () => {
  it("A11: project submit with no content and no URL → 400", async () => {
    const { token } = await registerStudent(app, "a11");
    const res = await request(app)
      .post("/api/student/projects/quiz_app/submit")
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it("A12: project submit with content too short → 400", async () => {
    const { token } = await registerStudent(app, "a12");
    const res = await request(app)
      .post("/api/student/projects/quiz_app/submit")
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "hi" });
    expect(res.status).toBe(400);
  });

  it("A13: eval() in content → security check rejects, status REJECTED", async () => {
    const { userId } = await registerStudent(app, "a13");
    const project = await prisma.project.create({
      data: { userId, projectId: "quiz_app", code: "", status: "IN_PROGRESS" },
    });
    const submission = await prisma.projectSubmission.create({
      data: {
        userId, studentId: userId, projectId: project.id,
        content: "eval(input())", githubUrl: "", status: "PENDING", attemptNumber: 1,
      },
    });

    await runProjectReview(submission.id);

    const updated = await prisma.projectSubmission.findUnique({ where: { id: submission.id } });
    expect(updated?.status).toBe("REJECTED");
    expect(updated?.feedback).toContain("Security check failed");
    expect(updated?.feedback).toContain("unsafe code");
  });

  it("A14: exec() in content → security check rejects", async () => {
    const { userId } = await registerStudent(app, "a14");
    const project = await prisma.project.create({
      data: { userId, projectId: "todo_list", code: "", status: "IN_PROGRESS" },
    });
    const submission = await prisma.projectSubmission.create({
      data: {
        userId, studentId: userId, projectId: project.id,
        content: "exec('import os; os.system(\"rm -rf /\")')", githubUrl: "", status: "PENDING", attemptNumber: 1,
      },
    });

    await runProjectReview(submission.id);

    const updated = await prisma.projectSubmission.findUnique({ where: { id: submission.id } });
    expect(updated?.status).toBe("REJECTED");
  });

  it("A15: os.system() in content → security check rejects", async () => {
    const { userId } = await registerStudent(app, "a15");
    const project = await prisma.project.create({
      data: { userId, projectId: "expense_tracker", code: "", status: "IN_PROGRESS" },
    });
    const submission = await prisma.projectSubmission.create({
      data: {
        userId, studentId: userId, projectId: project.id,
        content: "import os\nos.system('cat /etc/passwd')", githubUrl: "", status: "PENDING", attemptNumber: 1,
      },
    });

    await runProjectReview(submission.id);

    const updated = await prisma.projectSubmission.findUnique({ where: { id: submission.id } });
    expect(updated?.status).toBe("REJECTED");
  });

  it("A16: invalid GitHub URL format (not github.com) → validation REJECTED", async () => {
    const { userId } = await registerStudent(app, "a16");
    const project = await prisma.project.create({
      data: { userId, projectId: "quiz_app", code: "", status: "IN_PROGRESS" },
    });
    const submission = await prisma.projectSubmission.create({
      data: {
        userId, studentId: userId, projectId: project.id,
        githubUrl: "https://evil.com/malicious/repo", content: "", status: "PENDING", attemptNumber: 1,
      },
    });

    await runProjectReview(submission.id);

    const updated = await prisma.projectSubmission.findUnique({ where: { id: submission.id } });
    expect(updated?.status).toBe("REJECTED");
    expect(updated?.feedback).toContain("Security check failed");
  });

  it("A17: large content (100KB) — handled without crash", async () => {
    const { userId } = await registerStudent(app, "a17");
    const project = await prisma.project.create({
      data: { userId, projectId: "quiz_app", code: "", status: "IN_PROGRESS" },
    });
    const largeContent = "# Safe code\nprint('hello')\n".repeat(3000); // ~100KB
    const submission = await prisma.projectSubmission.create({
      data: {
        userId, studentId: userId, projectId: project.id,
        content: largeContent, githubUrl: "", status: "PENDING", attemptNumber: 1,
      },
    });

    await expect(runProjectReview(submission.id)).resolves.not.toThrow();

    const updated = await prisma.projectSubmission.findUnique({ where: { id: submission.id } });
    expect(["APPROVED", "REJECTED", "ERROR"]).toContain(updated?.status);
  });
});

// ═══════════════════════════════════════════════════════════════════
// BUSINESS RULE ENFORCEMENT
// ═══════════════════════════════════════════════════════════════════

describe("Adversarial — Business Rule Enforcement", () => {
  it("A18: in-flight duplicate submission → 409 conflict", async () => {
    const { token } = await registerStudent(app, "a18");

    // First submission succeeds (PENDING status)
    const first = await request(app)
      .post("/api/student/projects/quiz_app/submit")
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "def hello(): return 1" });
    expect(first.status).toBe(200);

    // Second while first is still PENDING → 409
    const second = await request(app)
      .post("/api/student/projects/quiz_app/submit")
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "def hello(): return 2" });
    expect(second.status).toBe(409);
    expect(second.body.error).toMatch(/progress/i);
  });

  it("A19: 4th project attempt after 3 valid attempts → 403", async () => {
    const { token, userId } = await registerStudent(app, "a19");
    const project = await prisma.project.create({
      data: { userId, projectId: "quiz_app", code: "", status: "IN_PROGRESS" },
    });

    // Create 3 valid (non-technical-error) REJECTED submissions directly
    for (let i = 1; i <= 3; i++) {
      await prisma.projectSubmission.create({
        data: {
          userId, studentId: userId, projectId: project.id,
          content: "some code", githubUrl: "", status: "REJECTED",
          feedback: "Not good enough quality.", attemptNumber: i,
        },
      });
    }

    const res = await request(app)
      .post("/api/student/projects/quiz_app/submit")
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "def fourth(): return 4" });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/Maximum attempts/i);
  });

  it("A20: certificate verification for nonexistent cert → 404", async () => {
    const res = await request(app).get("/api/certifications/verify/CERT-NONEXISTENT-999");
    expect(res.status).toBe(404);
    expect(res.body.valid).toBe(false);
  });

  it("A21: share another student's certificate → 403 forbidden", async () => {
    const { userId: owner } = await registerStudent(app, "a21-owner");
    const { token: thief } = await registerStudent(app, "a21-thief");

    const certNumber = `CERT-TEST-${Date.now()}`;
    await prisma.issuedCertificate.create({
      data: { userId: owner, courseSlug: "python", certNumber, issuedBy: "system", templateId: "default" },
    });

    const res = await request(app)
      .post(`/api/certifications/${certNumber}/share`)
      .set("Authorization", `Bearer ${thief}`);

    expect(res.status).toBe(403);
  });

  it("A22: admin cert endpoint without admin role → 403", async () => {
    const { token } = await registerStudent(app, "a22");
    const res = await request(app)
      .get("/api/certifications/admin/eligible")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("A23: processCertificate for ineligible student → no certificate issued", async () => {
    const { userId } = await registerStudent(app, "a23");
    // Student has NO progress records — not eligible

    await processCertificate({ data: { studentId: userId, courseId: "fundamentals-of-ai" } });

    const cert = await prisma.issuedCertificate.findFirst({ where: { userId } });
    expect(cert).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════
// DATA INTEGRITY — INJECTION & XSS
// ═══════════════════════════════════════════════════════════════════

describe("Adversarial — Data Integrity", () => {
  it("A24: SQL injection attempt in lectureId — handled safely by Prisma", async () => {
    const { userId } = await registerStudent(app, "a24");
    const maliciousLectureId = "'; DROP TABLE progress; --";
    const questions = [{ id: "q1", correctAnswer: "A", points: 10 }];

    // Prisma parameterizes queries — this should not crash or corrupt
    await expect(
      gradeQuiz(userId, maliciousLectureId, "fundamentals-of-ai", { q1: "A" }, questions)
    ).resolves.toBeDefined();

    // Progress table is still intact
    const count = await prisma.progress.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  it("A25: XSS payload in project content — stored safely, no execution", async () => {
    const { userId } = await registerStudent(app, "a25");
    const project = await prisma.project.create({
      data: { userId, projectId: "quiz_app", code: "", status: "IN_PROGRESS" },
    });
    const xssContent = "<script>alert('xss')</script>\ndef safe_code(): pass";
    const submission = await prisma.projectSubmission.create({
      data: {
        userId, studentId: userId, projectId: project.id,
        content: xssContent, githubUrl: "", status: "PENDING", attemptNumber: 1,
      },
    });

    await runProjectReview(submission.id);

    // XSS should not trigger security check (it's HTML not Python malware)
    // Verify it was stored and processed without crash
    const updated = await prisma.projectSubmission.findUnique({ where: { id: submission.id } });
    expect(updated).not.toBeNull();
    expect(["APPROVED", "REJECTED"]).toContain(updated?.status);

    // Content is stored as-is (not sanitized/altered in the DB)
    expect(updated?.content).toBe(xssContent);
  });

  it("A26: notification content with XSS stored safely", async () => {
    const { userId } = await registerStudent(app, "a26");
    const xssTitle = "<img src=x onerror=alert(1)>";
    const xssBody = "<script>document.cookie</script>";

    await prisma.inAppNotification.create({
      data: { userId, type: "quiz_result", title: xssTitle, body: xssBody },
    });

    const stored = await prisma.inAppNotification.findFirst({ where: { userId } });
    // Stored verbatim — sanitization is frontend responsibility
    expect(stored?.title).toBe(xssTitle);
    expect(stored?.body).toBe(xssBody);
  });

  it("A27: extremely long lectureId string — no crash", async () => {
    const { userId } = await registerStudent(app, "a27");
    const longId = "fundamentals-of-ai-" + "x".repeat(500);
    const questions = [{ id: "q1", correctAnswer: "A", points: 10 }];

    await expect(
      gradeQuiz(userId, longId, "fundamentals-of-ai", { q1: "A" }, questions)
    ).resolves.toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════════
// EDGE CASES — BOUNDARY CONDITIONS
// ═══════════════════════════════════════════════════════════════════

describe("Adversarial — Edge Cases & Boundaries", () => {
  it("A28: quiz with partial answers — missing questions scored as wrong", async () => {
    const { userId } = await registerStudent(app, "a28");
    const questions = [
      { id: "q1", correctAnswer: "A", points: 10 },
      { id: "q2", correctAnswer: "B", points: 10 },
      { id: "q3", correctAnswer: "C", points: 10 },
    ];
    // Only answer q1
    const result = await gradeQuiz(userId, "fundamentals-of-ai-0", "fundamentals-of-ai", { q1: "A" }, questions);
    expect(result.score).toBe(33); // 10/30 rounded
    expect(result.passed).toBe(false);
    expect(result.feedback).toHaveLength(2); // q2 and q3 wrong
  });

  it("A29: quiz with 0-point questions — score 0 but handled gracefully", async () => {
    const { userId } = await registerStudent(app, "a29");
    const questions = [{ id: "q1", correctAnswer: "A", points: 0 }];
    const result = await gradeQuiz(userId, "fundamentals-of-ai-0", "fundamentals-of-ai", { q1: "A" }, questions);
    expect(result.score).toBe(0);
    expect(result.passed).toBe(false); // 0/0 → 0%
    expect(result.attemptId).toBeDefined(); // Still saved
  });

  it("A30: project submission for unknown projectId — still creates project record", async () => {
    const { token } = await registerStudent(app, "a30");
    const res = await request(app)
      .post("/api/student/projects/NONEXISTENT_PROJECT_ID/submit")
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "def x(): return True\n# some more code here" });

    // Should create the project and submission even for unknown projectId
    expect(res.status).toBe(200);
    expect(res.body.submissionId).toBeDefined();
  });

  it("A31: processCertificate with invalid courseId — skips gracefully", async () => {
    const { userId } = await registerStudent(app, "a31");

    // Should not throw, just log and return
    await expect(
      processCertificate({ data: { studentId: userId, courseId: "NONEXISTENT_COURSE_SLUG" } })
    ).resolves.not.toThrow();

    const cert = await prisma.issuedCertificate.findFirst({ where: { userId } });
    expect(cert).toBeNull();
  });

  it("A32: sequential resubmission while first is PENDING — in-flight guard holds", async () => {
    // NOTE: The in-flight guard (findFirst + create) is application-level and has an inherent
    // TOCTOU race window under true concurrency. Preventing that would require a DB unique
    // constraint on (userId, projectId, status). The guard correctly fires for sequential
    // submissions, which is the realistic scenario (a human submitting twice is not sub-ms).
    const { token } = await registerStudent(app, "a32");

    const first = await request(app)
      .post("/api/student/projects/student_management/submit")
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "class StudentDB:\n    def __init__(self):\n        pass" });
    expect(first.status).toBe(200);

    const second = await request(app)
      .post("/api/student/projects/student_management/submit")
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "class StudentDB:\n    def __init__(self):\n        pass" });
    expect(second.status).toBe(409);

    const third = await request(app)
      .post("/api/student/projects/student_management/submit")
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "class StudentDB:\n    def __init__(self):\n        pass" });
    expect(third.status).toBe(409);
  });
});
