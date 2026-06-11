export type UserRole = "student" | "instructor" | "admin";

export type User = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SafeUser = Pick<User, "id" | "email" | "name" | "role" | "emailVerified">;

export type OAuthProvider = "github" | "linkedin";

export const OAUTH_PROVIDERS: OAuthProvider[] = ["github", "linkedin"];

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type JwtAccessPayload = {
  sub: number;
  email: string;
  role: UserRole;
  type: "access";
};

export type JwtRefreshPayload = {
  sub: number;
  type: "refresh";
  jti: string;
};
