import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { config } from "../config.js";
import { type AuthenticatedRequest, requireAuth, requireRole } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import { prisma } from "../prisma.js";
import { sendPasswordResetEmail } from "../services/emailService.js";
import {
  buildOAuthAuthorizeUrl,
  exchangeOAuthCode,
  getOAuthStateCookieName,
} from "../services/oauthService.js";
import {
  authenticateUser,
  consumeOAuthExchangeCode,
  consumePasswordResetToken,
  createOAuthExchangeCode,
  createPasswordResetToken,
  createUser,
  findOrCreateOAuthUser,
  findUserByEmail,
  findUserById,
  updatePassword,
  updateProfile,
} from "../services/userService.js";
import { verifyPassword } from "../utils/password.js";
import type { OAuthProvider } from "../types.js";
import { OAUTH_PROVIDERS } from "../types.js";
import {
  issueAuthTokens,
  isRefreshTokenValid,
  revokeAllRefreshTokens,
  revokeRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { generateSecureToken } from "../utils/tokens.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});



const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100).trim(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const forgotSchema = z.object({
  email: z.string().email(),
});

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

const REFRESH_COOKIE = "fa_refresh_token";

function setRefreshCookie(res: import("express").Response, token: string): void {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: !config.isDev,
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  });
}

function clearRefreshCookie(res: import("express").Response): void {
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
}

function tokenResponse(res: import("express").Response, tokens: { accessToken: string; refreshToken: string }) {
  setRefreshCookie(res, tokens.refreshToken);
  return { access_token: tokens.accessToken };
}

router.post("/register", authLimiter, async (req, res, next) => {
  try {
    console.log("[register] Attempting:", req.body.email);
    const body = registerSchema.parse(req.body);
    const user = await createUser(body);
    const tokens = await issueAuthTokens(user);
    res.status(201).json({ ...tokenResponse(res, tokens), user });
  } catch (err) {
    if (err instanceof Error && err.message === "Email already in use") {
      next(new AppError(err.message));
      return;
    }
    next(err instanceof z.ZodError ? new AppError(err.errors[0]?.message ?? "Invalid input") : err);
  }
});

router.post("/login", authLimiter, async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const user = await authenticateUser(body.email, body.password);
    const tokens = await issueAuthTokens(user);
    res.json({ ...tokenResponse(res, tokens), user });
  } catch (err) {
    if (err instanceof Error && err.message === "Invalid email or password") {
      next(new AppError(err.message, 401));
      return;
    }
    next(err instanceof z.ZodError ? new AppError("Invalid input") : err);
  }
});

router.post("/logout", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (req.user) {
      await revokeAllRefreshTokens(req.user.id);
    }
    clearRefreshCookie(res);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post("/refresh", async (req, res, next) => {
  try {
    const refreshToken = (req.cookies?.[REFRESH_COOKIE] as string | undefined) ?? req.body?.refresh_token;
    if (!refreshToken) throw new AppError("Refresh token required", 401);

    const payload = verifyRefreshToken(refreshToken);
    const isValid = await isRefreshTokenValid(payload.sub, payload.jti);
    if (!isValid) {
      throw new AppError("Invalid refresh token", 401);
    }

    const user = await findUserById(payload.sub);
    if (!user) throw new AppError("User not found", 401);

    await revokeRefreshToken(payload.sub, payload.jti);
    const tokens = await issueAuthTokens(user);
    res.json(tokenResponse(res, tokens));
  } catch (err) {
    next(err instanceof Error && !(err instanceof AppError) ? new AppError("Invalid refresh token", 401) : err);
  }
});

router.get("/me", requireAuth, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

const profileSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  bio: z.string().max(500).trim().optional(),
  avatarUrl: z.string().max(5000000).optional(),
  notificationPrefs: z.record(z.boolean()).optional(),
  currentPassword: z.string().min(1).optional(),
  password: z.string().min(8).max(128).optional(),
});

router.patch("/profile", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }
    const body = profileSchema.parse(req.body);
    
    const user = await updateProfile(req.user.id, {
      name: body.name,
      bio: body.bio,
      avatarUrl: body.avatarUrl,
    });

    if (body.notificationPrefs) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { notificationPrefs: body.notificationPrefs },
      });
    }
    
    if (body.password) {
      if (!body.currentPassword) {
        throw new AppError("Current password is required to set a new password.", 400);
      }
      const fullUser = await findUserByEmail(req.user.email);
      if (!fullUser?.passwordHash) {
        throw new AppError("Cannot change password for OAuth-only accounts.", 400);
      }
      const valid = await verifyPassword(body.currentPassword, fullUser.passwordHash);
      if (!valid) {
        throw new AppError("Current password is incorrect.", 401);
      }
      await updatePassword(req.user.id, body.password);
      await revokeAllRefreshTokens(req.user.id);
    }
    
    res.json({ user });
  } catch (err) {
    next(err instanceof z.ZodError ? new AppError(err.errors[0]?.message ?? "Invalid input") : err);
  }
});

router.post("/forgot-password", authLimiter, async (req, res, next) => {
  try {
    const { email } = forgotSchema.parse(req.body);
    const user = await findUserByEmail(email);
    if (user?.passwordHash) {
      const token = await createPasswordResetToken(user.id);
      const resetUrl = `${config.frontendUrl}/#/reset-password?token=${token}`;
      await sendPasswordResetEmail(email, resetUrl);
    }
    res.json({ message: "If an account exists, a reset link has been sent." });
  } catch (err) {
    next(err instanceof z.ZodError ? new AppError("Invalid email") : err);
  }
});

router.post("/reset-password", authLimiter, async (req, res, next) => {
  try {
    const { token, password } = resetSchema.parse(req.body);
    const userId = await consumePasswordResetToken(token);
    if (!userId) throw new AppError("Invalid or expired reset token", 400);
    await updatePassword(userId, password);
    await revokeAllRefreshTokens(userId);
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    next(err instanceof z.ZodError ? new AppError("Invalid input") : err);
  }
});

function isOAuthProvider(value: string): value is OAuthProvider {
  return (OAUTH_PROVIDERS as string[]).includes(value);
}

function oauthErrorRedirect(res: import("express").Response, message: string): void {
  res.redirect(`${config.frontendUrl}/#/login?oauth_error=${encodeURIComponent(message)}`);
}

router.get("/oauth/:provider", (req, res) => {
  try {
    const provider = req.params.provider;
    if (!isOAuthProvider(provider)) {
      console.warn(`[oauth] Unknown provider requested: ${provider}`);
      oauthErrorRedirect(res, "Unknown OAuth provider");
      return;
    }
    console.log(`[oauth] Initiating ${provider} OAuth flow`);
    const state = generateSecureToken();
    res.cookie(getOAuthStateCookieName(), state, {
      httpOnly: false,
      secure: config.isDev ? false : true,
      sameSite: config.isDev ? "lax" : "none",
      path: "/",
      maxAge: 10 * 60 * 1000,
    });
    const url = buildOAuthAuthorizeUrl(provider, state);
    console.log(`[oauth] Redirecting to ${provider} authorize URL`);
    res.redirect(url);
  } catch (err) {
    const message = err instanceof AppError ? err.message : "OAuth failed";
    console.error(`[oauth] Init failed for ${req.params.provider}:`, message);
    oauthErrorRedirect(res, message);
  }
});

router.get("/oauth/:provider/callback", async (req, res) => {
  try {
    const provider = req.params.provider;
    if (!isOAuthProvider(provider)) {
      console.error(`[oauth] Unknown provider in callback: ${req.params.provider}`);
      throw new AppError("Unknown OAuth provider", 400);
    }

    const { code, state, error } = req.query;
    if (error) {
      console.error(`[oauth] ${provider} returned error:`, error);
      throw new AppError(String(error), 400);
    }
    if (!code || typeof code !== "string") {
      console.error(`[oauth] Missing authorization code from ${provider}`);
      throw new AppError("Missing authorization code", 400);
    }

    const savedState = req.cookies?.[getOAuthStateCookieName()] as string | undefined;
    if (!config.isDev && (!savedState || savedState !== state)) {
      console.error(`[oauth] State mismatch for ${provider}: cookie=${savedState?.slice(0, 8)}..., query=${(state as string)?.slice(0, 8)}...`);
      throw new AppError("Invalid OAuth state", 400);
    }
    console.log(`[oauth] ${provider} state validated, exchanging code...`);

    const profile = await exchangeOAuthCode(provider, code);
    console.log(`[oauth] ${provider} profile: providerUserId=${profile.providerUserId.slice(0, 12)}..., email=${profile.email}`);

    const user = await findOrCreateOAuthUser({
      provider,
      providerUserId: profile.providerUserId,
      email: profile.email,
      name: profile.name,
    });
    console.log(`[oauth] ${provider} user: id=${user.id}, email=${user.email}`);

    res.clearCookie(getOAuthStateCookieName(), {
      path: "/",
      secure: config.isDev ? false : true,
      sameSite: config.isDev ? "lax" : "none",
    });
    const exchangeCode = await createOAuthExchangeCode(user.id);
    const redirectUrl = `${config.frontendUrl}/#/auth/oauth?code=${exchangeCode}`;
    console.log(`[oauth] Redirecting to frontend with exchange code`);
    res.redirect(redirectUrl);
  } catch (err) {
    const message =
      err instanceof AppError ? err.message : err instanceof Error ? err.message : "OAuth failed";
    console.error(`[oauth] ${req.params.provider} callback error:`, message);
    oauthErrorRedirect(res, message);
  }
});

router.post("/oauth/exchange", authLimiter, async (req, res, next) => {
  try {
    const code = z.string().min(1).parse(req.body?.code);
    console.log(`[oauth] Exchanging OAuth code for tokens`);
    const userId = await consumeOAuthExchangeCode(code);
    if (!userId) {
      console.warn(`[oauth] Invalid or expired exchange code`);
      throw new AppError("Invalid or expired OAuth code", 400);
    }
    
    const user = await findUserById(userId);
    if (!user) {
      console.error(`[oauth] User not found for id=${userId}`);
      throw new AppError("User not found", 400);
    }

    const tokens = await issueAuthTokens(user);
    console.log(`[oauth] Tokens issued for user ${user.email}`);
    res.json({ ...tokenResponse(res, tokens), user });
  } catch (err) {
    next(err instanceof z.ZodError ? new AppError("Invalid code") : err);
  }
});

router.post("/admin/promote", requireAuth, requireRole("admin"), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { userId } = z.object({ userId: z.string().uuid() }).parse(req.body);
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: "admin" },
      select: { id: true, name: true, email: true, role: true },
    });
    res.json({ user });
  } catch (err) {
    next(err instanceof z.ZodError ? new AppError("Valid userId required") : err);
  }
});

router.get("/admin/users", requireAuth, requireRole("admin"), async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        totalXp: true,
        currentStreak: true,
        lastActiveAt: true,
        createdAt: true,
      },
    });
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

export default router;
