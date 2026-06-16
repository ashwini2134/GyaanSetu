import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { config } from "../config.js";
import { type AuthenticatedRequest, requireAuth, requireRole } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
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
} from "../services/userService.js";
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
  max: 30,
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

router.post("/refresh", authLimiter, async (req, res, next) => {
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
      oauthErrorRedirect(res, "Unknown OAuth provider");
      return;
    }
    const state = generateSecureToken();
    res.cookie(getOAuthStateCookieName(), state, {
      httpOnly: true,
      secure: !config.isDev,
      sameSite: "lax",
      maxAge: 10 * 60 * 1000,
    });
    res.redirect(buildOAuthAuthorizeUrl(provider, state));
  } catch (err) {
    const message = err instanceof AppError ? err.message : "OAuth failed";
    oauthErrorRedirect(res, message);
  }
});

router.get("/oauth/:provider/callback", async (req, res) => {
  try {
    const provider = req.params.provider;
    if (!isOAuthProvider(provider)) {
      throw new AppError("Unknown OAuth provider", 400);
    }

    const { code, state, error } = req.query;
    if (error) throw new AppError(String(error), 400);
    if (!code || typeof code !== "string") throw new AppError("Missing authorization code", 400);

    const savedState = req.cookies?.[getOAuthStateCookieName()] as string | undefined;
    if (!savedState || savedState !== state) throw new AppError("Invalid OAuth state", 400);

    const profile = await exchangeOAuthCode(provider, code);
    const user = await findOrCreateOAuthUser({
      provider,
      providerUserId: profile.providerUserId,
      email: profile.email,
      name: profile.name,
    });

    const exchangeCode = await createOAuthExchangeCode(user.id);
    res.redirect(`${config.frontendUrl}/#/auth/oauth?code=${exchangeCode}`);
  } catch (err) {
    const message =
      err instanceof AppError ? err.message : err instanceof Error ? err.message : "OAuth failed";
    oauthErrorRedirect(res, message);
  }
});

router.post("/oauth/exchange", authLimiter, async (req, res, next) => {
  try {
    const code = z.string().min(1).parse(req.body?.code);
    const userId = await consumeOAuthExchangeCode(code);
    if (!userId) throw new AppError("Invalid or expired OAuth code", 400);
    
    const user = await findUserById(userId);
    if (!user) throw new AppError("User not found", 400);

    const tokens = await issueAuthTokens(user);
    res.json({ ...tokenResponse(res, tokens), user });
  } catch (err) {
    next(err instanceof z.ZodError ? new AppError("Invalid code") : err);
  }
});

router.get("/admin/users", requireAuth, requireRole("admin"), (_req, res) => {
  res.json({ message: "Admin endpoint — list users would go here" });
});

export default router;
