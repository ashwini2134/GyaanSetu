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
      // Mock/stub fallback when credentials are not configured
      return `${callbackUrl}?code=mock_github_code&state=${state}`;
    }
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      scope: "read:user user:email",
      state,
    });
    return `https://github.com/login/oauth/authorize?${params}`;
  }

  

  const { clientId, callbackUrl } = config.oauth.linkedin;
  if (!clientId) {
    // Mock/stub fallback when credentials are not configured
    return `${callbackUrl}?code=mock_linkedin_code&state=${state}`;
  }
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
  return exchangeLinkedInCode(code);
}

async function exchangeGitHubCode(code: string): Promise<OAuthProfile> {
  const { clientId, clientSecret, callbackUrl } = config.oauth.github;
  if (!clientId || !clientSecret) {
    // Mock profile response for local dev/testing
    return {
      providerUserId: "mock_github_user_12345",
      email: "mock.github.student@example.com",
      name: "Mock GitHub Student",
    };
  }

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

// Google support removed — only GitHub and LinkedIn supported now.

async function exchangeLinkedInCode(code: string): Promise<OAuthProfile> {
  const { clientId, clientSecret, callbackUrl } = config.oauth.linkedin;
  if (!clientId || !clientSecret) {
    // Mock profile response for local dev/testing
    return {
      providerUserId: "mock_linkedin_user_12345",
      email: "mock.linkedin.student@example.com",
      name: "Mock LinkedIn Student",
    };
  }

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
