import jwt from "jsonwebtoken";
import { config } from "../config.js";
import type { AuthTokens, JwtAccessPayload, JwtRefreshPayload, SafeUser } from "../types.js";
import { generateSecureToken, hashToken } from "./tokens.js";
import { prisma } from "../prisma.js";

function parseDurationMs(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 15 * 60 * 1000;
  const n = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return n * (multipliers[unit] ?? 60_000);
}

export function signAccessToken(user: SafeUser): string {
  const payload: JwtAccessPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    type: "access",
  };
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  } as jwt.SignOptions);
}

export function signRefreshToken(userId: string): { token: string; jti: string } {
  const jti = generateSecureToken();
  const payload: JwtRefreshPayload = { sub: userId, type: "refresh", jti };
  const token = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as jwt.SignOptions);
  return { token, jti };
}

export function verifyAccessToken(token: string): JwtAccessPayload {
  const payload = jwt.verify(token, config.jwt.accessSecret) as unknown as JwtAccessPayload;
  if (payload.type !== "access") throw new Error("Invalid token type");
  return payload;
}

export function verifyRefreshToken(token: string): JwtRefreshPayload {
  const payload = jwt.verify(token, config.jwt.refreshSecret) as unknown as JwtRefreshPayload;
  if (payload.type !== "refresh") throw new Error("Invalid token type");
  return payload;
}

export async function storeRefreshToken(userId: string, jti: string): Promise<void> {
  const expiresAt = new Date(Date.now() + parseDurationMs(config.jwt.refreshExpiresIn));
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(jti),
      expiresAt,
    },
  });
}

export async function isRefreshTokenValid(userId: string, jti: string): Promise<boolean> {
  const record = await prisma.refreshToken.findFirst({
    where: {
      userId,
      tokenHash: hashToken(jti),
      revokedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
  });
  return Boolean(record);
}

export async function revokeRefreshToken(userId: string, jti: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: {
      userId,
      tokenHash: hashToken(jti),
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

export async function revokeAllRefreshTokens(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

export async function issueAuthTokens(user: SafeUser): Promise<AuthTokens> {
  const accessToken = signAccessToken(user);
  const { token: refreshToken, jti } = signRefreshToken(user.id);
  await storeRefreshToken(user.id, jti);
  return { accessToken, refreshToken };
}
