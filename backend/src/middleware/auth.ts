import type { NextFunction, Request, Response } from "express";
import { findUserById } from "../services/userService.js";
import type { SafeUser, UserRole } from "../types.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { AppError } from "./errorHandler.js";

export type AuthenticatedRequest = Request & { user?: SafeUser };

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(new AppError("Not authenticated", 401));
    return;
  }
  try {
    const payload = verifyAccessToken(header.slice(7));
    const user = await findUserById(payload.sub);
    if (!user) {
      next(new AppError("User not found", 401));
      return;
    }
    req.user = user;
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("Not authenticated", 401));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new AppError("Forbidden", 403));
      return;
    }
    next();
  };
}
