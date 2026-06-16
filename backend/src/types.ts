export type UserRole = "student" | "instructor" | "admin";

export type User = {
<<<<<<< HEAD
  id: string;
=======
  id: number;
>>>>>>> 8245f18 (Initial commit)
  email: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SafeUser = Pick<User, "id" | "email" | "name" | "role" | "emailVerified">;

export type OAuthProvider = "github" | "linkedin" | "google";

export const OAUTH_PROVIDERS: OAuthProvider[] = ["github", "linkedin", "google"];

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type JwtAccessPayload = {
<<<<<<< HEAD
  sub: string;
=======
  sub: number;
>>>>>>> 8245f18 (Initial commit)
  email: string;
  role: UserRole;
  type: "access";
};

export type JwtRefreshPayload = {
<<<<<<< HEAD
  sub: string;
=======
  sub: number;
>>>>>>> 8245f18 (Initial commit)
  type: "refresh";
  jti: string;
};
