import { prisma } from "../prisma.js";
import type { OAuthProvider, SafeUser, UserRole } from "../types.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { generateSecureToken, hashToken } from "../utils/tokens.js";

function toSafeUser(user: any): SafeUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
    emailVerified: user.emailVerified,
    bio: user.bio,
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
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
}

export async function createUser(input: {
  email: string;
  name: string;
  password?: string;
  role?: UserRole;
  emailVerified?: boolean;
}): Promise<SafeUser> {
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
      throw new Error("Email already in use");
    }
    throw err;
  }
}

export async function authenticateUser(email: string, password: string): Promise<SafeUser> {
  const user = await findUserByEmail(email);
  if (!user || !user.passwordHash) throw new Error("Invalid email or password");
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) throw new Error("Invalid email or password");
  const { passwordHash: _, ...safe } = user;
  return safe;
}

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
}

export async function findOrCreateOAuthUser(input: {
  provider: OAuthProvider;
  providerUserId: string;
  email: string;
  name: string;
}): Promise<SafeUser> {
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

export async function consumePasswordResetToken(token: string): Promise<string | null> {
  const tokenHash = hashToken(token);
  
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return null;
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

export async function consumeOAuthExchangeCode(code: string): Promise<string | null> {
  const codeHash = hashToken(code);

  const record = await prisma.oAuthExchangeCode.findUnique({
    where: { codeHash },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return null;
  }

  await prisma.oAuthExchangeCode.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return record.userId;
}

export async function updateProfile(userId: string, input: { name?: string; bio?: string }): Promise<SafeUser> {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.bio !== undefined && { bio: input.bio }),
    },
  });
  return toSafeUser(updatedUser);
}
