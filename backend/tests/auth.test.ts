import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

import { prisma } from "../src/prisma.js";

describe("Auth API", () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(async () => {
    await prisma.user.deleteMany();
    app = createApp();
  });

  afterAll(() => {
    prisma.$disconnect();
  });

  it("registers a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "alice@example.com", password: "password123", name: "Alice" });

    expect(res.status).toBe(201);
    expect(res.body.access_token).toBeDefined();
    expect(res.body.user.email).toBe("alice@example.com");
    expect(res.body.user.role).toBe("student");
  });

  it("rejects duplicate email registration", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ email: "bob@example.com", password: "password123", name: "Bob" });

    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "bob@example.com", password: "otherpass1", name: "Bob 2" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/already in use/i);
  });

  it("logs in with valid credentials", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ email: "carol@example.com", password: "password123", name: "Carol" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "carol@example.com", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body.access_token).toBeDefined();
  });

  it("rejects invalid login", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "wrongpass" });

    expect(res.status).toBe(401);
  });

  it("returns current user from /me", async () => {
    const register = await request(app)
      .post("/api/auth/register")
      .send({ email: "dave@example.com", password: "password123", name: "Dave" });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${register.body.access_token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe("Dave");
  });

  it("rejects unauthenticated /me", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("handles forgot-password without revealing account existence", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "ghost@example.com" });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/reset link/i);
  });

  it("resets password with valid token", async () => {
    const { createPasswordResetToken } = await import("../src/services/userService.js");
    const { createUser } = await import("../src/services/userService.js");

    const user = await createUser({
      email: "eve@example.com",
      name: "Eve",
      password: "oldpassword1",
    });
    const token = await createPasswordResetToken(user.id);

    const reset = await request(app)
      .post("/api/auth/reset-password")
      .send({ token, password: "newpassword1" });

    expect(reset.status).toBe(200);

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "eve@example.com", password: "newpassword1" });

    expect(login.status).toBe(200);
  });

  it("denies admin endpoint for students", async () => {
    const register = await request(app)
      .post("/api/auth/register")
      .send({ email: "student@example.com", password: "password123", name: "Student" });

    const res = await request(app)
      .get("/api/auth/admin/users")
      .set("Authorization", `Bearer ${register.body.access_token}`);

    expect(res.status).toBe(403);
  });

  it("logs out successfully", async () => {
    const register = await request(app)
      .post("/api/auth/register")
      .send({ email: "frank@example.com", password: "password123", name: "Frank" });

    const res = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${register.body.access_token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
