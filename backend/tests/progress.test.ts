import path from "node:path";
import { fileURLToPath } from "node:url";
import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { closeDb, resetDbForTests } from "../src/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testDbPath = path.join(__dirname, "test-progress.db");

describe("Progress API", () => {
  let app: ReturnType<typeof createApp>;
  let token: string;

  beforeEach(async () => {
    resetDbForTests(testDbPath);
    app = createApp();

    const register = await request(app)
      .post("/api/auth/register")
      .send({ email: "progress@example.com", password: "password123", name: "Progress User" });

    token = register.body.access_token;
  });

  afterAll(() => {
    closeDb();
  });

  it("tracks lecture section visits and returns progress summary", async () => {
    const section = await request(app)
      .post("/api/progress/lecture/section")
      .set("Authorization", `Bearer ${token}`)
      .send({ courseSlug: "cs50ai", lectureNumber: 0, sectionId: "overview" });

    expect(section.status).toBe(200);
    expect(section.body.progress.sections.overview.visited).toBe(true);

    const quiz = await request(app)
      .post("/api/progress/lecture/quiz")
      .set("Authorization", `Bearer ${token}`)
      .send({ courseSlug: "cs50ai", lectureNumber: 0, score: 4, total: 5 });

    expect(quiz.status).toBe(200);
    expect(quiz.body.passed).toBe(true);

    const problem = await request(app)
      .post("/api/progress/lecture/problem")
      .set("Authorization", `Bearer ${token}`)
      .send({ courseSlug: "cs50ai", lectureNumber: 0, problemId: "intro_problem" });

    expect(problem.status).toBe(200);
    expect(problem.body.progress.problemsCompleted).toContain("intro_problem");

    const complete = await request(app)
      .post("/api/progress/lecture/complete")
      .set("Authorization", `Bearer ${token}`)
      .send({ courseSlug: "cs50ai", lectureNumber: 0, totalSections: 1, totalProblems: 1, hasQuiz: true });

    expect(complete.status).toBe(200);
    expect(complete.body.progress.lectureCompleted).toBe(true);

    const me = await request(app)
      .get("/api/progress/me")
      .set("Authorization", `Bearer ${token}`);

    expect(me.status).toBe(200);
    expect(me.body.lecturesCompleted).toBe(1);
    expect(me.body.quizzesPassed).toBe(1);
    expect(me.body.problemsSolved).toBe(1);
  });

  it("returns leaderboard data", async () => {
    const res = await request(app)
      .get("/api/progress/leaderboard")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.leaderboard)).toBe(true);
    expect(res.body.leaderboard[0]).toHaveProperty("rank");
    expect(res.body.leaderboard[0]).toHaveProperty("score");
  });
});
