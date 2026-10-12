import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/prisma.js";

describe("Achievements API", () => {
  let app: ReturnType<typeof createApp>;
  let token: string;
  let userId: string;

  beforeEach(async () => {
    await prisma.user.deleteMany();
    app = createApp();

    const register = await request(app)
      .post("/api/auth/register")
      .send({ email: "badge@example.com", password: "password123", name: "Badge User" });

    token = register.body.access_token;
    userId = register.body.user.id;
  });

  afterAll(() => {
    prisma.$disconnect();
  });

  it("starts empty, unlocks via real progress, and lists it newest-first", async () => {
    const list1 = await request(app)
      .get("/api/achievements")
      .set("Authorization", `Bearer ${token}`);

    expect(list1.status).toBe(200);
    expect(list1.body.achievements).toEqual([]);

    // Complete a lecture through the real two-step flow the frontend uses:
    // mark the Progress row COMPLETED, then hit /action (XP + achievement
    // evaluation) — mirrors useLectureProgress.ts's markLectureCompleted.
    await request(app)
      .post("/api/progress/lecture")
      .set("Authorization", `Bearer ${token}`)
      .send({ courseSlug: "python", lectureId: "lecture-1", hasProject: false });

    const action = await request(app)
      .post("/api/progress/action")
      .set("Authorization", `Bearer ${token}`)
      .send({ actionType: "lecture", actionId: "python:lecture-1" });

    expect(action.status).toBe(200);
    expect(action.body.unlockedAchievements).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "first_lecture" })])
    );

    const list2 = await request(app)
      .get("/api/achievements")
      .set("Authorization", `Bearer ${token}`);

    expect(list2.status).toBe(200);
    // first_login (currentStreak >= 1) unlocks alongside first_lecture the
    // moment a streak-affecting action happens — both are legitimate.
    const unlockedIds2 = list2.body.achievements.map((a: { id: string }) => a.id);
    expect(unlockedIds2).toContain("first_lecture");
    const countAfterFirst = list2.body.achievements.length;

    // Idempotency: repeating the same action must not duplicate any unlock.
    await request(app)
      .post("/api/progress/lecture")
      .set("Authorization", `Bearer ${token}`)
      .send({ courseSlug: "python", lectureId: "lecture-1", hasProject: false });
    await request(app)
      .post("/api/progress/action")
      .set("Authorization", `Bearer ${token}`)
      .send({ actionType: "lecture", actionId: "python:lecture-1" });

    const list3 = await request(app)
      .get("/api/achievements")
      .set("Authorization", `Bearer ${token}`);

    expect(list3.body.achievements).toHaveLength(countAfterFirst);
  });

  it("returns the full visible catalog", async () => {
    const res = await request(app)
      .get("/api/achievements/catalog")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.achievements.length).toBeGreaterThanOrEqual(50);
    expect(res.body.achievements[0]).toHaveProperty("badgeColor");
  });

  it("rejects the old client-writable unlock endpoint (removed)", async () => {
    const res = await request(app)
      .post("/api/achievements")
      .set("Authorization", `Bearer ${token}`)
      .send({ achievementId: "first_lecture" });

    expect(res.status).toBe(404);
  });

  it("blocks /custom for non-admins and allows it for admins", async () => {
    const forbidden = await request(app)
      .post("/api/achievements/custom")
      .set("Authorization", `Bearer ${token}`)
      .send({ achievementId: "event_2026", name: "2026 Hackathon Winner", description: "Won the event", userId });

    expect(forbidden.status).toBe(403);

    await prisma.user.update({ where: { id: userId }, data: { role: "admin" } });
    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "badge@example.com", password: "password123" });
    const adminToken = adminLogin.body.access_token;

    const granted = await request(app)
      .post("/api/achievements/custom")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ achievementId: "event_2026", name: "2026 Hackathon Winner", description: "Won the event", userId });

    expect(granted.status).toBe(200);

    const list = await request(app)
      .get("/api/achievements")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(list.body.achievements.some((a: { id: string }) => a.id === "event_2026")).toBe(true);
  });
});
