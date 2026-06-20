export type UserRole = "student" | "instructor" | "admin";

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
  bio: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type SafeUser = Pick<User, "id" | "email" | "name" | "role" | "emailVerified" | "bio" | "avatarUrl" | "createdAt">;

export type OAuthProvider = "github" | "linkedin" | "google";

export const OAUTH_PROVIDERS: OAuthProvider[] = ["github", "linkedin", "google"];

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type JwtAccessPayload = {
  sub: string;
  email: string;
  role: UserRole;
  type: "access";
};

export type JwtRefreshPayload = {
  sub: string;
  type: "refresh";
  jti: string;
};
