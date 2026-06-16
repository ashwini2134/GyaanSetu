import jwt from "jsonwebtoken";
import { config } from "../config.js";
import type { AuthTokens, JwtAccessPayload, JwtRefreshPayload, SafeUser } from "../types.js";
import { generateSecureToken, hashToken } from "./tokens.js";
<<<<<<< HEAD
import { prisma } from "../prisma.js";
=======
import { getDb } from "../db.js";
>>>>>>> 8245f18 (Initial commit)

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

<<<<<<< HEAD
export function signRefreshToken(userId: string): { token: string; jti: string } {
=======
export function signRefreshToken(userId: number): { token: string; jti: string } {
>>>>>>> 8245f18 (Initial commit)
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

<<<<<<< HEAD
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
=======
export function storeRefreshToken(userId: number, jti: string): void {
  const db = getDb();
  const expiresAt = new Date(Date.now() + parseDurationMs(config.jwt.refreshExpiresIn)).toISOString();
  db.prepare(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)`
  ).run(userId, hashToken(jti), expiresAt);
}

export function isRefreshTokenValid(userId: number, jti: string): boolean {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT id FROM refresh_tokens
       WHERE user_id = ? AND token_hash = ? AND revoked_at IS NULL AND expires_at > datetime('now')`
    )
    .get(userId, hashToken(jti)) as { id: number } | undefined;
  return Boolean(row);
}

export function revokeRefreshToken(userId: number, jti: string): void {
  const db = getDb();
  db.prepare(
    `UPDATE refresh_tokens SET revoked_at = datetime('now')
     WHERE user_id = ? AND token_hash = ? AND revoked_at IS NULL`
  ).run(userId, hashToken(jti));
}

export function revokeAllRefreshTokens(userId: number): void {
  const db = getDb();
  db.prepare(
    `UPDATE refresh_tokens SET revoked_at = datetime('now')
     WHERE user_id = ? AND revoked_at IS NULL`
  ).run(userId);
}

export function issueAuthTokens(user: SafeUser): AuthTokens {
  const accessToken = signAccessToken(user);
  const { token: refreshToken, jti } = signRefreshToken(user.id);
  storeRefreshToken(user.id, jti);
>>>>>>> 8245f18 (Initial commit)
  return { accessToken, refreshToken };
}
