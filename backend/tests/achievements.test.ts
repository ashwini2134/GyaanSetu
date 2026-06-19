import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/prisma.js";

describe("Achievements API", () => {
  let app: ReturnType<typeof createApp>;
  let token: string;

  beforeEach(async () => {
    await prisma.user.deleteMany();
    app = createApp();

    const register = await request(app)
      .post("/api/auth/register")
      .send({ email: "badge@example.com", password: "password123", name: "Badge User" });

    token = register.body.access_token;
  });

  afterAll(() => {
    prisma.$disconnect();
  });

  it("checks initial achievements list is empty, unlocks achievement, and lists it", async () => {
    // 1. Get achievements
    const list1 = await request(app)
      .get("/api/achievements")
      .set("Authorization", `Bearer ${token}`);

    expect(list1.status).toBe(200);
    expect(list1.body.achievements).toEqual([]);

    // 2. Unlock achievement
    const unlock = await request(app)
      .post("/api/achievements")
      .set("Authorization", `Bearer ${token}`)
      .send({ achievementId: "first_lecture" });

    expect(unlock.status).toBe(200);
    expect(unlock.body.achievement).toBe("first_lecture");

    // 3. Get achievements again
    const list2 = await request(app)
      .get("/api/achievements")
      .set("Authorization", `Bearer ${token}`);

    expect(list2.status).toBe(200);
    expect(list2.body.achievements).toEqual(["first_lecture"]);

    // 4. Try re-unlocking same achievement (idempotent check)
    const reUnlock = await request(app)
      .post("/api/achievements")
      .set("Authorization", `Bearer ${token}`)
      .send({ achievementId: "first_lecture" });

    expect(reUnlock.status).toBe(200);
    expect(reUnlock.body.achievement).toBe("first_lecture");

    const list3 = await request(app)
      .get("/api/achievements")
      .set("Authorization", `Bearer ${token}`);

    expect(list3.status).toBe(200);
    expect(list3.body.achievements).toEqual(["first_lecture"]);
  });
});
