import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { requireRole, type AuthenticatedRequest } from "../src/middleware/auth.js";

function mockReq(user?: { role: string }): AuthenticatedRequest {
  return { user: user ? { id: 1, name: "Test", email: "test@test.com", role: user.role as any, emailVerified: true, createdAt: new Date(), avatarUrl: null } : undefined } as AuthenticatedRequest;
}

function mockRes(): Response {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
}

describe("requireRole middleware", () => {
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    res = mockRes();
    next = vi.fn() as unknown as NextFunction;
  });

  it("returns 401 when no user on request", () => {
    const req = mockReq(undefined);
    requireRole("admin")(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = (next as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(error.status).toBe(401);
    expect(error.message).toBe("Not authenticated");
  });

  it("returns 403 when user role is student (not admin)", () => {
    const req = mockReq({ role: "student" });
    requireRole("admin")(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = (next as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(error.status).toBe(403);
    expect(error.message).toBe("Forbidden");
  });

  it("calls next() when user role is admin", () => {
    const req = mockReq({ role: "admin" });
    requireRole("admin")(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect((next as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBeUndefined();
  });

  it("allows multiple roles to pass", () => {
    const req = mockReq({ role: "instructor" });
    requireRole("admin", "instructor")(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect((next as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBeUndefined();
  });
});
