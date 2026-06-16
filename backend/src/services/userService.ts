<<<<<<< HEAD
import { prisma } from "../prisma.js";
=======
import { getDb } from "../db.js";
>>>>>>> 8245f18 (Initial commit)
import type { OAuthProvider, SafeUser, UserRole } from "../types.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { generateSecureToken, hashToken } from "../utils/tokens.js";

<<<<<<< HEAD
function toSafeUser(user: any): SafeUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
    emailVerified: user.emailVerified,
  };
}

export async function findUserById(id: string): Promise<SafeUser | null> {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? toSafeUser(user) : null;
}

export async function findUserByEmail(email: string): Promise<(SafeUser & { passwordHash: string | null }) | null> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return null;
  return { ...toSafeUser(user), passwordHash: user.passwordHash };
=======
type UserRow = {
  id: number;
  email: string;
  name: string;
  password_hash: string | null;
  role: UserRole;
  email_verified: number;
  created_at: string;
  updated_at: string;
};

function toSafeUser(row: UserRow): SafeUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    emailVerified: Boolean(row.email_verified),
  };
}

export function findUserById(id: number): SafeUser | null {
  const db = getDb();
  const row = db.prepare(`SELECT * FROM users WHERE id = ?`).get(id) as UserRow | undefined;
  return row ? toSafeUser(row) : null;
}

export function findUserByEmail(email: string): (SafeUser & { passwordHash: string | null }) | null {
  const db = getDb();
  const row = db
    .prepare(`SELECT * FROM users WHERE email = ? COLLATE NOCASE`)
    .get(email) as UserRow | undefined;
  if (!row) return null;
  return { ...toSafeUser(row), passwordHash: row.password_hash };
>>>>>>> 8245f18 (Initial commit)
}

export async function createUser(input: {
  email: string;
  name: string;
  password?: string;
  role?: UserRole;
  emailVerified?: boolean;
}): Promise<SafeUser> {
<<<<<<< HEAD
  const passwordHash = input.password ? await hashPassword(input.password) : "";
  const role = input.role ?? "student";
  const emailVerified = input.emailVerified ?? false;

  try {
    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        name: input.name,
        passwordHash,
        role,
        emailVerified,
      },
    });
    return toSafeUser(user);
  } catch (err: any) {
    if (err.code === "P2002") {
=======
  const db = getDb();
  const passwordHash = input.password ? await hashPassword(input.password) : null;
  const role = input.role ?? "student";
  const emailVerified = input.emailVerified ? 1 : 0;

  try {
    const result = db
      .prepare(
        `INSERT INTO users (email, name, password_hash, role, email_verified)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(input.email.toLowerCase(), input.name, passwordHash, role, emailVerified);
    const user = findUserById(Number(result.lastInsertRowid));
    if (!user) throw new Error("Failed to create user");
    return user;
  } catch (err: unknown) {
    const sqliteErr = err as { code?: string; errcode?: number; message?: string };
    if (
      sqliteErr.code === "SQLITE_CONSTRAINT_UNIQUE" ||
      sqliteErr.errcode === 2067 ||
      sqliteErr.message?.includes("UNIQUE constraint failed")
    ) {
>>>>>>> 8245f18 (Initial commit)
      throw new Error("Email already in use");
    }
    throw err;
  }
}

export async function authenticateUser(email: string, password: string): Promise<SafeUser> {
<<<<<<< HEAD
  const user = await findUserByEmail(email);
=======
  const user = findUserByEmail(email);
>>>>>>> 8245f18 (Initial commit)
  if (!user || !user.passwordHash) throw new Error("Invalid email or password");
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) throw new Error("Invalid email or password");
  const { passwordHash: _, ...safe } = user;
  return safe;
}

<<<<<<< HEAD
export async function updatePassword(userId: string, newPassword: string): Promise<void> {
  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}

export async function findOAuthUser(provider: OAuthProvider, providerUserId: string): Promise<SafeUser | null> {
  const account = await prisma.oAuthAccount.findUnique({
    where: {
      provider_providerUserId: {
        provider,
        providerUserId,
      },
    },
    include: { user: true },
  });
  return account ? toSafeUser(account.user) : null;
=======
export async function updatePassword(userId: number, newPassword: string): Promise<void> {
  const db = getDb();
  const passwordHash = await hashPassword(newPassword);
  db.prepare(`UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?`).run(
    passwordHash,
    userId
  );
}

export function findOAuthUser(provider: OAuthProvider, providerUserId: string): SafeUser | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT u.* FROM users u
       JOIN oauth_accounts o ON o.user_id = u.id
       WHERE o.provider = ? AND o.provider_user_id = ?`
    )
    .get(provider, providerUserId) as UserRow | undefined;
  return row ? toSafeUser(row) : null;
}

export function linkOAuthAccount(userId: number, provider: OAuthProvider, providerUserId: string): void {
  const db = getDb();
  db.prepare(
    `INSERT OR IGNORE INTO oauth_accounts (user_id, provider, provider_user_id) VALUES (?, ?, ?)`
  ).run(userId, provider, providerUserId);
>>>>>>> 8245f18 (Initial commit)
}

export async function findOrCreateOAuthUser(input: {
  provider: OAuthProvider;
  providerUserId: string;
  email: string;
  name: string;
}): Promise<SafeUser> {
<<<<<<< HEAD
  const existingAccount = await findOAuthUser(input.provider, input.providerUserId);
  if (existingAccount) return existingAccount;

  let user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        name: input.name,
        passwordHash: "",
        emailVerified: true,
      },
    });
  }

  await prisma.oAuthAccount.create({
    data: {
      userId: user.id,
      provider: input.provider,
      providerUserId: input.providerUserId,
    },
  });

  return toSafeUser(user);
}

export async function createPasswordResetToken(userId: string): Promise<string> {
  const token = generateSecureToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return token;
}

export async function consumePasswordResetToken(token: string): Promise<string> {
  const tokenHash = hashToken(token);
  
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw new Error("Invalid or expired reset token");
  }

  await prisma.passwordResetToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return record.userId;
}

export async function createOAuthExchangeCode(userId: string): Promise<string> {
  const code = generateSecureToken();
  const codeHash = hashToken(code);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

  await prisma.oAuthExchangeCode.create({
    data: {
      userId,
      codeHash,
      expiresAt,
    },
  });

  return code;
}

export async function consumeOAuthExchangeCode(code: string): Promise<string> {
  const codeHash = hashToken(code);

  const record = await prisma.oAuthExchangeCode.findUnique({
    where: { codeHash },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw new Error("Invalid or expired exchange code");
  }

  await prisma.oAuthExchangeCode.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return record.userId;
=======
  const existing = findOAuthUser(input.provider, input.providerUserId);
  if (existing) return existing;

  const byEmail = findUserByEmail(input.email);
  if (byEmail) {
    linkOAuthAccount(byEmail.id, input.provider, input.providerUserId);
    return { id: byEmail.id, email: byEmail.email, name: byEmail.name, role: byEmail.role, emailVerified: byEmail.emailVerified };
  }

  const user = await createUser({
    email: input.email,
    name: input.name,
    emailVerified: true,
  });
  linkOAuthAccount(user.id, input.provider, input.providerUserId);
  return user;
}

export function createPasswordResetToken(userId: number): string {
  const db = getDb();
  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  db.prepare(`UPDATE password_reset_tokens SET used_at = datetime('now') WHERE user_id = ? AND used_at IS NULL`).run(
    userId
  );
  db.prepare(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)`
  ).run(userId, hashToken(token), expiresAt);
  return token;
}

export function consumePasswordResetToken(token: string): number | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT user_id FROM password_reset_tokens
       WHERE token_hash = ? AND used_at IS NULL AND expires_at > datetime('now')`
    )
    .get(hashToken(token)) as { user_id: number } | undefined;
  if (!row) return null;
  db.prepare(`UPDATE password_reset_tokens SET used_at = datetime('now') WHERE token_hash = ?`).run(
    hashToken(token)
  );
  return row.user_id;
}

export function createOAuthExchangeCode(userId: number): string {
  const db = getDb();
  const code = generateSecureToken();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  db.prepare(
    `INSERT INTO oauth_exchange_codes (code_hash, user_id, expires_at) VALUES (?, ?, ?)`
  ).run(hashToken(code), userId, expiresAt);
  return code;
}

export function consumeOAuthExchangeCode(code: string): SafeUser | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT user_id FROM oauth_exchange_codes
       WHERE code_hash = ? AND used_at IS NULL AND expires_at > datetime('now')`
    )
    .get(hashToken(code)) as { user_id: number } | undefined;
  if (!row) return null;
  db.prepare(`UPDATE oauth_exchange_codes SET used_at = datetime('now') WHERE code_hash = ?`).run(
    hashToken(code)
  );
  return findUserById(row.user_id);
>>>>>>> 8245f18 (Initial commit)
}
