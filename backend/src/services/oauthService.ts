import { config } from "../config.js";
import type { OAuthProvider } from "../types.js";

type OAuthProfile = { providerUserId: string; email: string; name: string };

const OAUTH_STATE_COOKIE = "oauth_state";

export function getOAuthStateCookieName(): string {
  return OAUTH_STATE_COOKIE;
}

export function buildOAuthAuthorizeUrl(provider: OAuthProvider, state: string): string {
  if (provider === "github") {
    const { clientId, callbackUrl } = config.oauth.github;
    if (!clientId) {
      console.warn(`[oauth] GitHub clientId not configured — using mock fallback`);
      return `${callbackUrl}?code=mock_github_code&state=${state}`;
    }
    console.log(`[oauth] Building GitHub authorize URL with clientId=${clientId.slice(0, 8)}...`);
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      scope: "read:user user:email",
      state,
    });
    return `https://github.com/login/oauth/authorize?${params}`;
  }

  if (provider === "google") {
    const { clientId, callbackUrl } = config.oauth.google;
    if (!clientId) {
      console.warn(`[oauth] Google clientId not configured — using mock fallback`);
      return `${callbackUrl}?code=mock_google_code&state=${state}`;
    }
    console.log(`[oauth] Building Google authorize URL with clientId=${clientId.slice(0, 8)}...`);
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      response_type: "code",
      scope: "openid profile email",
      state,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  const { clientId, callbackUrl } = config.oauth.linkedin;
  if (!clientId) {
    console.warn(`[oauth] LinkedIn clientId not configured — using mock fallback`);
    return `${callbackUrl}?code=mock_linkedin_code&state=${state}`;
  }
  console.log(`[oauth] Building LinkedIn authorize URL with clientId=${clientId.slice(0, 8)}...`);
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: callbackUrl,
    // LinkedIn OpenID Connect scopes
    scope: "openid profile email",
    state,
  });
  // URLSearchParams encodes spaces as '+', but LinkedIn expects '%20' for scope separators.
  const qs = params.toString().replace(/\+/g, "%20");
  return `https://www.linkedin.com/oauth/v2/authorization?${qs}`;
}

export async function exchangeOAuthCode(provider: OAuthProvider, code: string): Promise<OAuthProfile> {
  if (provider === "github") return exchangeGitHubCode(code);
  if (provider === "google") return exchangeGoogleCode(code);
  return exchangeLinkedInCode(code);
}

async function exchangeGitHubCode(code: string): Promise<OAuthProfile> {
  const { clientId, clientSecret, callbackUrl } = config.oauth.github;
  if (!clientId || !clientSecret) {
    console.warn(`[oauth] GitHub clientId or clientSecret missing — using mock profile`);
    return {
      providerUserId: "mock_github_user_12345",
      email: "mock.github.student@example.com",
      name: "Mock GitHub Student",
    };
  }

  console.log(`[oauth] Exchanging GitHub code with clientId=${clientId.slice(0, 8)}... callbackUrl=${callbackUrl}`);
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: callbackUrl }),
  });
  const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string };
  const token = tokenData.access_token;
  if (!token) throw new Error("GitHub OAuth failed");

  const userRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  const user = (await userRes.json()) as { id: number; login: string; name?: string; email?: string };

  let email = user.email;
  if (!email) {
    const emailsRes = await fetch("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    const emails = (await emailsRes.json()) as { email: string; primary: boolean; verified: boolean }[];
    const primary = emails.find((e) => e.primary && e.verified) ?? emails[0];
    email = primary?.email;
  }
  if (!email) throw new Error("GitHub account has no public email");

  return {
    providerUserId: String(user.id),
    email,
    name: user.name ?? user.login,
  };
}

async function exchangeGoogleCode(code: string): Promise<OAuthProfile> {
  const { clientId, clientSecret, callbackUrl } = config.oauth.google;
  if (!clientId || !clientSecret) {
    console.warn(`[oauth] Google clientId or clientSecret missing — using mock profile`);
    return {
      providerUserId: "mock_google_user_12345",
      email: "mock.google.student@example.com",
      name: "Mock Google Student",
    };
  }

  console.log(`[oauth] Exchanging Google code with clientId=${clientId.slice(0, 8)}... callbackUrl=${callbackUrl}`);
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: callbackUrl,
      grant_type: "authorization_code",
    }),
  });
  const tokenData = (await tokenRes.json()) as { access_token?: string; id_token?: string; error?: string };
  const token = tokenData.access_token;
  if (!token) throw new Error("Google OAuth token exchange failed: " + (tokenData.error ?? "unknown"));

  const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const user = (await userRes.json()) as { sub: string; name: string; email: string; email_verified?: boolean };

  if (!user.email) throw new Error("Google account has no email");

  return {
    providerUserId: user.sub,
    email: user.email,
    name: user.name ?? user.email.split("@")[0],
  };
}

async function exchangeLinkedInCode(code: string): Promise<OAuthProfile> {
  const { clientId, clientSecret, callbackUrl } = config.oauth.linkedin;
  if (!clientId || !clientSecret) {
    console.warn(`[oauth] LinkedIn clientId or clientSecret missing — using mock profile`);
    return {
      providerUserId: "mock_linkedin_user_12345",
      email: "mock.linkedin.student@example.com",
      name: "Mock LinkedIn Student",
    };
  }

  console.log(`[oauth] Exchanging LinkedIn code with clientId=${clientId.slice(0, 8)}... callbackUrl=${callbackUrl}`);
  const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: callbackUrl,
    }),
  });
  const tokenData = (await tokenRes.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };
  const token = tokenData.access_token;
  if (!token) {
    const detail = tokenData.error_description ?? tokenData.error ?? "token exchange failed";
    throw new Error(`LinkedIn OAuth failed: ${detail}`);
  }

  // LinkedIn OpenID Connect userinfo endpoint
  const userInfoRes = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const userInfo = (await userInfoRes.json()) as {
    sub?: string;
    email?: string;
    name?: string;
  };

  if (!userInfo.email) throw new Error("LinkedIn account has no email");

  return {
    providerUserId: userInfo.sub ?? "",
    email: userInfo.email,
    name: userInfo.name || userInfo.email.split("@")[0],
  };
}
