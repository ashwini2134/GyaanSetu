import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

import { prisma } from "../src/prisma.js";

describe("Progress API", () => {
  let app: ReturnType<typeof createApp>;
  let token: string;

  beforeEach(async () => {
    await prisma.user.deleteMany();
    app = createApp();

    const register = await request(app)
      .post("/api/auth/register")
      .send({ email: "progress@example.com", password: "password123", name: "Progress User" });

    token = register.body.access_token;
  });

  afterAll(() => {
    prisma.$disconnect();
  });

  it("tracks lecture section visits and returns progress summary", async () => {
    const section = await request(app)
      .post("/api/progress/section")
      .set("Authorization", `Bearer ${token}`)
      .send({ courseSlug: "cs50ai", lectureId: "lecture_0", practiceAttempted: true });

    expect(section.status).toBe(200);
    expect(section.body.practiceAttempted).toBe(true);

    const quiz = await request(app)
      .post("/api/progress/quiz")
      .set("Authorization", `Bearer ${token}`)
      .send({ courseSlug: "cs50ai", lectureId: "lecture_0", quizId: "quiz_0", score: 4, total: 5, answers: {} });

    expect(quiz.status).toBe(200);
    expect(quiz.body.passed).toBe(true);

    const problem = await request(app)
      .post("/api/progress/action")
      .set("Authorization", `Bearer ${token}`)
      .send({ actionType: "problem", actionId: "intro_problem" });

    expect(problem.status).toBe(200);
    expect(problem.body.ok).toBe(true);

    const complete = await request(app)
      .post("/api/progress/lecture")
      .set("Authorization", `Bearer ${token}`)
      .send({ courseSlug: "cs50ai", lectureId: "lecture_0", hasProject: false });

    expect(complete.status).toBe(200);
    expect(complete.body.status).toBe("COMPLETED");

    const me = await request(app)
      .get("/api/progress/me?courseSlug=cs50ai")
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
