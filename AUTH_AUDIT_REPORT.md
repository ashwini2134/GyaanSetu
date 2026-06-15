# Authentication & Authorization Audit Report

**Project:** Fraylon Academy LMS
**Date:** June 12, 2026
**Scope:** Full authentication architecture, authorization, session management, route protection, OAuth, gamification, localStorage security

---

## 1. Authentication Architecture Review

### 1.1 How Users Sign Up

**Finding:** Email/password registration via backend API with Zod validation on both client and server.

**Evidence:**
- `frontend/src/pages/Register.tsx:15` — Calls `register()` from `useAuth()` hook
- `frontend/src/auth.tsx:51-54` — `register()` calls `authApi.register()` then stores token and user:
  ```typescript
  const register = async (email: string, password: string, name: string) => {
    const { access_token, user: me } = await authApi.register(email, password, name);
    setToken(access_token);
    setUser(me);
  };
  ```
- `frontend/src/authClient.ts:79-82` — Register API call:
  ```typescript
  register: (email, password, name) =>
    authFetch<{ access_token: string; user: AuthUser }>("/auth/register", {
      method: "POST", body: JSON.stringify({ email, password, name }),
    }),
  ```
- `backend/src/routes/auth.ts:87-100` — Server creates user and issues tokens:
  ```typescript
  router.post("/register", authLimiter, async (req, res, next) => {
    const body = registerSchema.parse(req.body);
    const user = await createUser(body);
    const tokens = issueAuthTokens(user);
    res.status(201).json({ ...tokenResponse(res, tokens), user });
  });
  ```

**Risk Level:** LOW
**Impact:** Standard email/password registration with rate limiting (30 req/15min), server-side hashing, and duplicate email detection (`"Email already in use"`).

---

### 1.2 How Users Sign In

**Finding:** Email/password login, same flow as register — backend authenticates, returns JWT + refresh cookie.

**Evidence:**
- `frontend/src/pages/Login.tsx:25-32`:
  ```typescript
  async function onSubmit(e) {
    await login(email, password);
  }
  ```
- `frontend/src/auth.tsx:47-50`:
  ```typescript
  const login = async (email: string, password: string) => {
    const { access_token, user: me } = await authApi.login(email, password);
    setToken(access_token);
    setUser(me);
  };
  ```
- `backend/src/routes/auth.ts:102-115`: Server validates password via `authenticateUser()`.

**Risk Level:** LOW
**Impact:** Standard login flow with rate limiting.

---

### 1.3 How Logout Works

**Finding:** Logout calls backend API which revokes ALL refresh tokens for the user, then clears client-side token.

**Evidence:**
- `frontend/src/auth.tsx:56-59`:
  ```typescript
  const logout = async () => {
    await authApi.logout();
    clearToken();
    setUser(null);
  };
  ```
- `backend/src/routes/auth.ts:117-125`:
  ```typescript
  router.post("/logout", requireAuth, (req, res, next) => {
    if (req.user) revokeAllRefreshTokens(req.user.id);
    clearRefreshCookie(res);
    res.json({ ok: true });
  });
  ```
- `frontend/src/authClient.ts:89-91` — Logout is fire-and-forget (error suppressed):
  ```typescript
  logout: () =>
    authFetch<{ ok: boolean }>("/auth/logout", { method: "POST" }).catch(() => ({ ok: true })),
  ```

**Risk Level:** MEDIUM
**Impact:** Server-side token revocation is good. However, the frontend `logout()` clears the token synchronously **before** the API call completes (no `await` on `clearToken()`? Actually yes, the order is: API call → `clearToken()` → `setUser(null)`, all awaited because `authApi.logout()` is awaited). The `.catch(() => ({ ok: true }))` means if the API call fails (e.g., network), local state is still cleared. This is acceptable for UX but means the server may not revoke tokens if the call fails.

---

### 1.4 How Authentication State Is Managed

**Finding:** React Context with `useState` in `AuthProvider`. Token persisted in localStorage.

**Evidence:**
- `frontend/src/auth.tsx:30-38` — Two state variables:
  ```typescript
  const [user, setUser] = useState<User>(null);
  const [ready, setReady] = useState(false);
  ```
- `frontend/src/auth.tsx:40-48` — On mount, validates existing token:
  ```typescript
  const loadMe = useCallback(async () => {
    if (!getToken()) { setUser(null); setReady(true); return; }
    try {
      const { user: me } = await authApi.me();
      setUser(me);
    } catch {
      clearToken(); setUser(null);
    } finally { setReady(true); }
  }, []);
  ```

**Risk Level:** LOW (auth state) / HIGH (gamification state — see section 6)
**Impact:** Auth state is validated server-side on every page load. The `ready` flag prevents flash-of-unauthenticated-content.

---

### 1.5 Sessions, Tokens, Passwords

| Feature | Implementation | Evidence |
|---|---|---|
| **Access Token** | JWT, stored in `localStorage` as `fa_token`, sent via `Authorization: Bearer <token>` | `authClient.ts:18-19`, `authClient.ts:49-50` |
| **Refresh Token** | JWT, stored in httpOnly secure cookie `fa_refresh_token`, path-restricted to `/api/auth` | `routes/auth.ts:68-76` |
| **Token Refresh** | Automatic: `authFetch()` detects 401, calls `POST /auth/refresh`, retries once | `authClient.ts:59-73` |
| **Token Revocation** | Refresh tokens revoked on logout, rotated on each refresh (rotation: revoke old, issue new) | `routes/auth.ts:117-125`, `routes/auth.ts:127-146` |
| **Password Storage** | `bcrypt` hashed on server, never stored client-side | `backend/src/services/userService.ts` (implied by `authenticateUser()` comparing hash) |

**Risk Level:** LOW
**Impact:** Refresh token rotation, httpOnly cookie, and path restriction follow security best practices.

---

### 1.6 OAuth Implementation

**Finding:** Real OAuth flow with backend support for GitHub and LinkedIn. Not mocked.

**Evidence:**
- `frontend/src/authClient.ts:99-102` — OAuth URL generation:
  ```typescript
  oauthUrl: (provider: OAuthProvider) => `${BACKEND_BASE}/api/auth/oauth/${provider}`,
  ```
- `frontend/src/pages/OAuthCallback.tsx` — Reads `code` from query params, calls `completeOAuth(code)`.
- `frontend/src/components/OAuthButtons.tsx` — Redirects to `authApi.oauthUrl(provider)`.
- `backend/src/routes/auth.ts` — Has OAuth endpoints: `POST /auth/oauth/exchange`, `GET /auth/oauth/:provider`, `GET /auth/oauth/:provider/callback`.
- `backend/src/services/oauthService.ts` — `buildOAuthAuthorizeUrl()`, `exchangeOAuthCode()`.
- `backend/src/services/userService.ts` — `findOrCreateOAuthUser()`.

**Risk Level:** LOW
**Impact:** Real OAuth with both providers. Duplicate account handling via email matching in `findOrCreateOAuthUser()`.

---

## 2. Login Flow Verification

### 2.1 Complete Login Flow

```
Login Page (Login.tsx)
  → user submits email + password
  → useAuth().login(email, password) (auth.tsx:47-50)
    → authApi.login(email, password) (authClient.ts:84-87)
      → authFetch("POST /auth/login") (authClient.ts:49-73)
        → attaches Bearer token (none for login, it's public)
        → sends POST to /api/auth/login with credentials: "include"
    → Backend: validate input (zod), authenticate, issue JWT (routes/auth.ts:102-115)
    → Response: { access_token: string, user: AuthUser }
  → setToken(access_token) → localStorage.setItem("fa_token", token)
  → setUser({ id, email, name, role, emailVerified })
  → React re-render → Login page sees `user` is truthy → <Navigate to="/" />
  → Shell.tsx renders Dashboard
```

### 2.2 Where User Data Is Stored

| Data | Location | Format |
|---|---|---|
| JWT Access Token | `localStorage["fa_token"]` | Plain string |
| User Object | React Context (memory) | `AuthUser` type: `{ id, email, name, role, emailVerified }` |
| Refresh Token | httpOnly cookie (browser-managed) | JWT string, never accessible to JS |
| Password | Nowhere client-side | — |

### 2.3 What Data Is Stored

Only the JWT access token string is persisted. The `AuthUser` object is re-fetched via `GET /auth/me` on every page load.

### 2.4 How Authentication Is Restored After Page Refresh

1. `AuthProvider` mounts → calls `loadMe()` (auth.tsx:32-45)
2. `getToken()` reads `localStorage["fa_token"]` — if null, user stays null
3. If token exists, calls `GET /auth/me` with Bearer token
4. If valid → populates `user` state
5. If invalid/expired → clears token, user stays null

### 2.5 What Happens If localStorage Is Manually Edited

**Finding:** Editing `fa_token` in DevTools:
- If set to a valid token for User B → User B's data is loaded → **identity takeover**
- If set to an expired/invalid token → `GET /auth/me` fails → token cleared → user logged out
- If deleted → app treats user as unauthenticated → redirects to `/login`

**Evidence:** `authClient.ts:59-73` — authFetch() auto-refreshes on 401. If refresh fails:
```typescript
} catch {
  clearToken();
  window.dispatchEvent(new Event("fa:logout"));
}
```

**Risk Level:** HIGH
**Impact:** Storing a JWT in localStorage makes it accessible to any JavaScript on the same origin. An XSS vulnerability would expose the active session. Additionally, a user who obtains another user's token can impersonate them.

---

## 3. Logout Flow Verification

### 3.1 What Data Is Cleared

| Item | Cleared? | Evidence |
|---|---|---|
| `localStorage["fa_token"]` | YES | `clearToken()` in `authClient.ts:25-27`, called from `auth.tsx:58` |
| `AuthUser` context state | YES | `setUser(null)` in `auth.tsx:59` |
| Server-side refresh tokens | YES | `revokeAllRefreshTokens(user.id)` in `routes/auth.ts:119` |
| Refresh cookie | YES | `clearRefreshCookie(res)` in `routes/auth.ts:120` |

### 3.2 What Data Remains After Logout

**ALL gamification and progress data persists in localStorage:**

| Key | Data | Remains? |
|---|---|---|
| `lms:progress` | All lecture progress, quiz scores, completions | YES — never cleared |
| `fa_completed_projects` | All completed projects | YES — never cleared |
| `fa_completed_quizzes` | All quiz scores | YES — never cleared |
| `fa_total_xp` | Total XP | YES — never cleared |
| `fa_streak_count`, `fa_last_submission_date` | Streak data | YES — never cleared |
| `fa_chat` | Chat history | YES — never cleared |
| `fa_code_<id>` | Project code drafts | YES — never cleared |
| `fa_submission_history` | Heatmap data | YES — never cleared |
| `fa_daily_missions_<date>` | Daily missions | YES — never cleared |
| `fa_recent_searches` | Search history | YES — never cleared |
| `lms:quiz_history:<id>` | Quiz attempt records | YES — never cleared |
| `lms:problem:<id>` | Problem code drafts | YES — never cleared |
| `lms:practice:<title>` | Practice code drafts | YES — never cleared |
| `fraylon_xp` | Secondary XP | YES — never cleared |
| `fraylon_*` | All secondary gamification data | YES — never cleared |

### 3.3 Can User B Inherit User A's Data?

**Finding:** YES. Directly.

**Evidence:** The `logout()` function in `auth.tsx:56-59` only:
1. Calls `POST /auth/logout`
2. Removes `fa_token` from localStorage
3. Sets user context to null

It does **NOT** clear any progress, XP, streak, achievement, quiz history, chat history, or any other localStorage key.

If User B logs in on the same browser/device, they will inherit ALL of User A's:
- Lecture progress and completions
- XP totals (from both `fa_total_xp` and `fraylon_xp`)
- Streak count
- Quiz scores and history
- Completed projects
- Chat history with AI mentor
- Code drafts for projects and problems
- Achievement unlocks
- Submission history
- Daily missions
- Leaderboard position

**Example scenario:**
```
1. User A completes 10 lectures, earns 5000 XP, achieves a 30-day streak
2. User A logs out — only `fa_token` is removed
3. User B logs in on the same browser
4. Dashboard shows: 10 lectures completed, 5000 XP, 30-day streak — User B inherits everything
```

**Impact:** CRITICAL — Complete progress/identity leakage between users on shared devices.

**Risk Level:** CRITICAL

---

## 4. Route Protection Audit

### 4.1 Protected Routes

| Route | Component | Protected? | Guard | Bypassable? |
|---|---|---|---|---|
| `/login` | Login | No (Public) | None | N/A |
| `/register` | Register | No (Public) | None | N/A |
| `/forgot-password` | ForgotPassword | No (Public) | None | N/A |
| `/reset-password` | ResetPassword | No (Public) | None | N/A |
| `/auth/oauth` | OAuthCallback | No (Public) | None | N/A |
| `/` (dashboard) | Dashboard | **Yes** | `RequireAuth` | Frontend-only |
| `/courses` | CoursesPage | **Yes** | `RequireAuth` (parent) | Frontend-only |
| `/course/:slug` | CoursePage | **Yes** | `RequireAuth` (parent) | Frontend-only |
| `/course/:slug/lecture/:number` | LecturePage | **Yes** | `RequireAuth` (parent) | Frontend-only |
| `/course/:slug/lecture/:number/quiz` | QuizPage | **Yes** | `RequireAuth` (parent) | Frontend-only |
| `/course/:slug/lecture/:number/project` | ProjectPage | **Yes** | `RequireAuth` (parent) | Frontend-only |
| `/course/:slug/lecture/:number/project/:id` | CodingProjectPage | **Yes** | `RequireAuth` (parent) | Frontend-only |
| `/leaderboard` | LeaderboardPage | **Yes** | `RequireAuth` (parent) | Frontend-only |

### 4.2 Route Guard Implementation

**Evidence:** `frontend/src/App.tsx:115-132`
```typescript
function RequireAuth({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  if (!ready) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
```

Routes structure:
```typescript
<Route path="/" element={<RequireAuth><Shell /></RequireAuth>}>
  <Route index element={<Dashboard />} />
  {/* ... all private child routes ... */}
</Route>
```

### 4.3 Can Unauthenticated Users Access Protected Routes?

**Finding:** Yes — frontend-only protection. Disabling JavaScript or directly accessing the API would bypass route guards.

**Evidence:** The `RequireAuth` guard is purely a React component that conditionally renders children. It only works when the React app loads. Direct API calls bypass this entirely. However, all protected backend endpoints have their own `requireAuth` middleware.

**Backend protection:** `backend/src/middleware/auth.ts:9-27` — validates JWT on every protected endpoint. The `/auth/me`, `/auth/logout`, and `/auth/admin/users` endpoints are server-protected.

**Backend gap:** There is NO backend API for progress, XP, achievements, leaderboard, or any gamification data. All of these are purely client-side. This means:

**Evidence:** `frontend/src/api.ts` — All progress/XP/streak operations use localStorage only. No backend calls for gamification data.

### 4.4 `RequireRole` Is Defined But Unused

**Evidence:** `frontend/src/App.tsx:134-148`
```typescript
function RequireRole({ roles, children }: { roles: UserRole[]; children: ReactNode }) {
  const { user, ready, hasRole } = useAuth();
  if (!ready) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!hasRole(...roles)) return <Navigate to="/" replace />;
  return <>{children}</>;
}
```

Not wired to any route. The backend also has `requireRole()` middleware in `backend/src/middleware/auth.ts:29-40` which returns 403 for role mismatches.

**Risk Level:** MEDIUM
**Impact:** Basic route protection exists on frontend (redirect to login) and backend (JWT validation). However, role-based restrictions are not enforced anywhere in the frontend routes. The backend `/api/auth/admin/users` endpoint does require admin role.

---

## 5. OAuth Audit

### 5.1 Implementation Status

| Provider | Implementation | Status |
|---|---|---|
| **GitHub** | Backend: `buildOAuthAuthorizeUrl("github")`, `exchangeOAuthCode("github")` | Real |
| **LinkedIn** | Backend: `buildOAuthAuthorizeUrl("linkedin")`, `exchangeOAuthCode("linkedin")` | Real |
| **Frontend Buttons** | `OAuthButtons.tsx` — redirects to `BACKEND_BASE/api/auth/oauth/{provider}` | Real |

### 5.2 OAuth Flow

```
1. User clicks "Sign in with GitHub" on Login page
2. OAuthButtons.tsx: window.location.href = BACKEND_BASE/api/auth/oauth/github
3. Backend redirects to GitHub: https://github.com/login/oauth/authorize?client_id=...&redirect_uri=...&state=...
4. User authorizes on GitHub
5. GitHub redirects to backend callback: /api/auth/oauth/github/callback?code=...&state=...
6. Backend exchanges code with GitHub for access_token
7. Backend calls GitHub API to get user email
8. Backend creates/updates user via findOrCreateOAuthUser()
9. Backend creates an OAuth exchange code, redirects to:
   frontend/#/auth/oauth?code=...
10. OAuthCallback.tsx reads code, calls POST /auth/oauth/exchange
11. Backend verifies exchange code, issues JWT tokens
12. Frontend stores access_token, sets user
```

### 5.3 Account Creation Flow

**Evidence:** `backend/src/services/userService.ts` — `findOrCreateOAuthUser()`:
- Looks up user by email from OAuth provider
- If exists: updates OAuth fields, returns existing user
- If not: creates new user with OAuth provider info

### 5.4 Email Handling

The OAuth exchange code is a one-time use, server-generated token (not the OAuth provider's token exposed to the frontend). This is a secure pattern.

### 5.5 Duplicate Account Handling

**Finding:** Duplicate detection is email-based. If a user signs up with email AND later uses OAuth with the same email, `findOrCreateOAuthUser()` returns the existing user.

**Risk Level:** LOW
**Impact:** Standard and secure OAuth implementation.

---

## 6. Authorization Audit — Client-Side Manipulation

### 6.1 XP Manipulation

**Finding:** XP is stored in TWO separate localStorage locations and is trivially manipulable.

**Evidence — System A (`fa_total_xp`):**
```typescript
// frontend/src/api.ts:392-403
export function getTotalXp(): number {
  return Number(localStorage.getItem("fa_total_xp") ?? "0");
}
export function addXp(amount: number) {
  const current = Number(localStorage.getItem("fa_total_xp") ?? "0");
  localStorage.setItem("fa_total_xp", String(current + amount));
}
```
User can run: `localStorage.setItem("fa_total_xp", "999999")` in DevTools.

**Evidence — System B (`fraylon_xp`):**
```typescript
// frontend/src/progress.ts:55-64
function safeGet<T>(key: string, fallback: T): T {
  try { const val = localStorage.getItem(key); return val ? JSON.parse(val) : fallback; } catch { return fallback; }
}
function safeSet(key: string, val: any) { localStorage.setItem(key, JSON.stringify(val)); }
```

**Risk Level:** CRITICAL

### 6.2 Streak Manipulation

**Evidence — System A:**
```typescript
// frontend/src/api.ts:319-348
export function getStreak() {
  const count = Number(localStorage.getItem("fa_streak_count") ?? "0");
  const lastDate = localStorage.getItem("fa_last_submission_date");
  ...
}
export function updateStreak() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const { count, lastDate } = getStreak();
  ...
  localStorage.setItem("fa_streak_count", String(newCount));
  localStorage.setItem("fa_last_submission_date", todayStr);
}
```
User can manipulate streak count, last date, AND change system clock to break date logic.

**Risk Level:** CRITICAL

### 6.3 Course/Lecture Completion Manipulation

**Evidence:**
```typescript
// frontend/src/hooks/useProgress.ts:9-17
function readAll(): Record<string, LectureProgress> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}'); } catch { return {}; }
}
function writeAll(data: Record<string, LectureProgress>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
```
User can mark any lecture complete, set any quiz score, set any section as visited.

**Risk Level:** CRITICAL

### 6.4 Quiz Score Manipulation

**Evidence:** `frontend/src/components/lesson/QuizEngine.tsx:92-94`
```typescript
localStorage.setItem(`lms:quiz_history:${quizId}`, JSON.stringify(updatedHistory));
```
User can edit quiz history to change scores or pass/fail status.

Additionally, three different pass thresholds exist:
- `useProgress.ts:155`: 60% to award XP
- `QuizEngine.tsx:144`: 70% to show "passed" result
- `LecturePage.tsx:455`: 70% to auto-complete section

**Risk Level:** HIGH

### 6.5 Achievement Manipulation

**Evidence:** `frontend/src/progress.ts:187-210`
```typescript
const achievements = safeGet<string[]>(KEYS.achievements, []);
// Check conditions and add achievement ID
achievements.push(achievement.id);
safeSet(KEYS.achievements, achievements);
```
User can add any achievement ID: `localStorage.setItem("fraylon_achievements", JSON.stringify(["first_lecture","course_completed","ten_lectures"]))`

**Risk Level:** HIGH

### 6.6 Leaderboard Manipulation

**Finding:** The leaderboard page computes data from localStorage for the current user only.

**Evidence:** `frontend/src/pages/LeaderboardPage.tsx:79-92`
```typescript
const currentUserEntry: LeaderboardEntry = {
  rank: 1, name: user?.name ?? 'You', email: user?.email ?? '',
  lecturesCompleted: lecturesCompleted.size,
  quizzesPassed: quizzesPassed.size, tasksCompleted: tasksCompleted.size,
  projectsSolved: projectsCount, totalXp: totalXp, streak: streak.count,
  completionPercent,
};
setEntries([currentUserEntry]);  // Only ONE entry
```

The leaderboard has NO multi-user data at all (implementer's own comment: "In a real app, this would be a server endpoint"). The mock data in `api.ts:743-766` creates fake entries but is never fed into the leaderboard page.

**Risk Level:** HIGH (leaderboard is non-functional, not insecure per se)

### 6.7 XP Awarded Twice for Same Action

**Finding:** When a project is completed, both gamification systems award XP independently.

**Evidence:**
1. `CodingProjectPage.tsx:298-307` — handleSubmit calls `saveCompletedProject()` which adds XP via `api.ts`'s `addXp()`
2. `CodingProjectPage.tsx:300-301` — handleSubmit calls `markProjectCompletedDirect()` which triggers `completeAction('project', ...)` via dynamic import → adds XP via `progress.ts`'s `awardXp()`

**Risk Level:** MEDIUM (data integrity issue, not security)

---

## 7. Session Security Audit

### 7.1 Session Expiration

| Token Type | Storage | Expiration | Rotation |
|---|---|---|---|
| **Access Token** (JWT) | `localStorage` | Short-lived (details in backend config) | N/A |
| **Refresh Token** (JWT) | httpOnly cookie `fa_refresh_token` | 30 days (`maxAge: 30 * 24 * 60 * 60 * 1000`) | Rotated on each use; old token revoked |

**Evidence:** `backend/src/routes/auth.ts:68-76`:
```typescript
res.cookie(REFRESH_COOKIE, token, {
  httpOnly: true,
  secure: !config.isDev,
  sameSite: "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: "/api/auth",
});
```

### 7.2 Token Refresh

**Evidence:** `frontend/src/authClient.ts:59-73`:
```typescript
if (res.status === 401 && retry && token && !path.includes("/refresh")) {
  const refreshed = await parseResponse<{ access_token: string }>(
    await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
  );
  setToken(refreshed.access_token);
  return authFetch<T>(path, init, false);
}
```

Automatic 401 → refresh → retry (once). On refresh failure: `clearToken()` + dispatch `fa:logout` event.

### 7.3 Remember Me

**Finding:** No "Remember Me" functionality exists. The token always persists to localStorage.

**Risk Level:** LOW — There's no option for "session-only" auth (e.g., using sessionStorage). The token always persists in localStorage.

### 7.4 Multi-Device Behavior

**Finding:** No session sharing or limiting mechanism. Each device/browser independently authenticates and stores its own token.

- Logout on one device does NOT invalidate sessions on other devices
- Token refresh on one device does NOT affect other devices
- No device management UI exists

**Risk Level:** MEDIUM

### 7.5 Multi-Tab Behavior

**Finding:** Cross-tab auth synchronization is partially implemented via the `fa:logout` custom event. When a 401 refresh fails in one tab, `clearToken()` + `fa:logout` event fires, and `AuthProvider` in other tabs listens for this event to null the user.

**Evidence:**
- `authClient.ts:71`: `window.dispatchEvent(new Event("fa:logout"));`
- `auth.tsx:30-34`:
  ```typescript
  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener("fa:logout", onLogout);
    return () => window.removeEventListener("fa:logout", onLogout);
  }, []);
  ```
- **Missing:** Login in one tab does NOT propagate to other tabs. The `storage` event listener in `useProgress.ts` handles progress data, but not auth state.

**Risk Level:** LOW

---

## 8. Local Storage Audit

### 8.1 Authentication Keys

| Key | Purpose | Stored Data | Security Risk | Migration Required? |
|---|---|---|---|---|
| `fa_token` | JWT access token | Plain string JWT | **HIGH** — XSS exposure, identity takeover if stolen | YES → httpOnly cookie |

### 8.2 Progress Keys

| Key | Purpose | Stored Data | Security Risk | Migration Required? |
|---|---|---|---|---|
| `lms:progress` | All lecture progress | JSON `Record<string, LectureProgress>` | **CRITICAL** — Cliente-side manipulation, user-to-user leakage | YES → database |
| `fa_completed_projects` | Completed projects | JSON `Record<string, boolean>` | **CRITICAL** — Client-side manipulation | YES → database |
| `fa_completed_quizzes` | Completed quizzes + scores | JSON `Record<string, number>` | **CRITICAL** — Client-side manipulation | YES → database |

### 8.3 Gamification Keys

| Key | Purpose | Stored Data | Security Risk | Migration Required? |
|---|---|---|---|---|
| `fa_total_xp` | Total XP | String number | **CRITICAL** — Arbitrary XP manipulation | YES → database |
| `fa_streak_count` | Streak count | String number | **CRITICAL** — Arbitrary streak setting | YES → database |
| `fa_last_submission_date` | Streak date tracker | Date string | **HIGH** — System clock manipulation | YES → database |
| `fa_submission_history` | Heatmap data | JSON `Record<string, number>` | **MEDIUM** — Data integrity | YES → database |
| `fraylon_xp` | Secondary XP | JSON number | **CRITICAL** — Duplicate XP system | YES → database |
| `fraylon_xp_history` | XP transaction log | JSON array | **MEDIUM** — Audit trail is local-only | YES → database |
| `fraylon_achievements` | Unlocked achievement IDs | JSON string array | **HIGH** — Arbitrary achievement unlocking | YES → database |
| `fraylon_streak` | Streak data (secondary) | JSON `StreakData` | **CRITICAL** — Duplicate streak system | YES → database |
| `fraylon_stats` | Aggregate stats | JSON `StatsData` | **HIGH** — Integrity, duplicate system | YES → database |
| `fraylon_completed_actions` | Deduplication list | JSON string array | **MEDIUM** — Integrity | YES → database |
| `fraylon_overall_progress` | Overall progress % | JSON number | **HIGH** — Client-side manipulation | YES → database |

### 8.4 Data Keys

| Key | Purpose | Stored Data | Security Risk | Migration Required? |
|---|---|---|---|---|
| `fa_chat` | AI mentor chat history | JSON `Record<string, ChatMsg[]>` | **LOW** — User's own data, no auth relevance | YES (optional) |
| `fa_code_<projectId>` | Project code drafts | Plain string code | **LOW** — User's own code | YES (optional) |
| `lms:problem:<id>` | Problem code drafts | Plain string code | **LOW** — User's own code | NO |
| `lms:practice:<title>` | Practice code drafts | Plain string code | **LOW** — User's own code | NO |
| `lms:quiz_history:<quizId>` | Quiz attempt records | JSON `AttemptRecord[]` | **MEDIUM** — User can retake and change scores | YES (optional) |
| `fa_daily_missions_<date>` | Daily missions | JSON `DailyMission[]` | **LOW** — Missions are local-only | YES (optional) |
| `fa_recent_searches` | Search history | JSON string array | **LOW** — Not auth-related | NO |

### 8.5 Total Summary

- **Total unique keys:** 22
- **Keys with CRITICAL risk:** 9 (`lms:progress`, `fa_completed_projects`, `fa_completed_quizzes`, `fa_total_xp`, `fa_streak_count`, `fraylon_xp`, `fraylon_streak`, `fraylon_achievements`, `fraylon_stats`)
- **Keys with HIGH risk:** 4 (`fa_token`, `fa_last_submission_date`, `fraylon_overall_progress`, `fraylon_completed_actions`)
- **Keys never cleared on logout:** 22 out of 22

---

## 9. Vulnerability Assessment

### CRITICAL VULNERABILITIES

| # | Vulnerability | Evidence | Impact |
|---|---|---|---|
| **V1** | **Progress/X/Streak fully client-side in localStorage** | `useProgress.ts:9-17`, `api.ts:392-403`, `api.ts:319-348` | User can arbitrarily set XP, complete any course/lecture, set any streak. No server validation exists. |
| **V2** | **No data cleared on logout — complete identity leakage** | `auth.tsx:56-59` clears only `fa_token`; 22 localStorage keys remain | User B logging in on same device inherits User A's complete progress, XP, quizzes, and achievements. |
| **V3** | **Two independent XP/streak systems with no synchronization** | `api.ts:392-403` (`fa_total_xp`) vs `progress.ts:55-64` (`fraylon_xp`) | XP awarded twice for same actions; data inconsistency guarantees integrity failure. |
| **V4** | **Leaderboard computed from local, manipulable data** | `LeaderboardPage.tsx:79-92` uses only `getAllProgress()` + `getTotalXp()` + `getStreak()` | Leaderboard data is entirely fabricated from client-side storage. Multi-user leaderboard is non-functional. |

### HIGH VULNERABILITIES

| # | Vulnerability | Evidence | Impact |
|---|---|---|---|
| **V5** | **JWT stored in localStorage** | `authClient.ts:11`, `authClient.ts:21-23` | XSS vulnerability exposes active session; no httpOnly protection. |
| **V6** | **Quiz pass threshold inconsistency** | `useProgress.ts:155` (60%) vs `QuizEngine.tsx:144` (70%) vs `LecturePage.tsx:455` (70%) | A quiz passed at 60% gets XP awarded but shows as "failed" in UI; inconsistent UX and logic. |
| **V7** | **Achievements stored as plain JSON array in localStorage** | `progress.ts:187-210` | User can add any achievement ID to their account. |
| **V8** | **`RequireRole` not wired to any route** | `App.tsx:134-148` defined but unused | No role-based access control on frontend; admin routes exist (`/api/auth/admin/users`) but no frontend guard. |
| **V9** | **`REVIEW_MODE = true` hardcoded** | `useProgress.ts:267` | Sequential lecture locking is permanently disabled. Not a security issue but an architectural concern for production. |

### MEDIUM VULNERABILITIES

| # | Vulnerability | Evidence | Impact |
|---|---|---|---|
| **V10** | **Logout API call is fire-and-forget** | `authClient.ts:89-91` catches errors | If server is unreachable during logout, refresh tokens are NOT revoked on server side. |
| **V11** | **No "Remember Me" / session-only auth option** | No sessionStorage usage anywhere | Token always persists in localStorage; no way to have a "private browsing" session. |
| **V12** | **No multi-device session management** | No device tracking in backend | Logout on one device does not invalidate other devices' sessions. |
| **V13** | **Cross-tab login sync missing** | Only `fa:logout` event exists; no `fa:login` event | Logging in on one tab does not propagate auth state to other open tabs. |

### LOW VULNERABILITIES

| # | Vulnerability | Evidence | Impact |
|---|---|---|---|
| **V14** | **Route protection is frontend-only UX layer** | `App.tsx:115-132` — React conditional render | Disabling JS bypasses guards, but backend APIs are separately protected (for auth endpoints). |
| **V15** | **Gamification data has no backup** | All `fraylon_*` and `fa_*` keys in localStorage only | Clearing browser data loses all progress permanently. |
| **V16** | **OAuth state verification implementation risk** (unconfirmed) | `oauthService.ts` not fully reviewed | Potential CSRF on OAuth callback if state parameter is not properly validated. |

---

## 10. Database Migration Readiness

### 10.1 Migration Map

| Current Storage | Future Table | Migration Complexity | Required Constraints |
|---|---|---|---|
| `fa_token` (localStorage JWT) | `sessions` table (server-managed) | **MEDIUM** — Move from localStorage to httpOnly cookie with session ID; current JWT + refresh token pattern is already backend-backed, but `fa_token` client storage could be eliminated entirely by using httpOnly cookie for access token too. | `user_id FK`, `refresh_token_hash`, `expires_at`, `device_info`, `created_at` |
| `lms:progress` (localStorage JSON) | `user_progress` table | **HIGH** — Full schema design needed. Each lecture's progress needs a row or document. | `user_id FK`, `course_slug`, `lecture_number`, `sections JSONB`, `quiz_score`, `quiz_completed`, `problems_completed JSONB`, `project_completed`, `lecture_completed`, `last_section`, `UNIQUE(user_id, course_slug, lecture_number)` |
| `fa_total_xp` (localStorage) | `user_xp` table (or column on `users`) | **LOW** — Single value per user | `user_id PK`, `total_xp DEFAULT 0`, `level` |
| `fraylon_xp` (localStorage) | **DROP** — Merge into `user_xp` | **LOW** — Eliminate duplicate system | N/A — consolidate into single XP source |
| `fraylon_xp_history` | `xp_transactions` table | **MEDIUM** — Audit log | `id PK`, `user_id FK`, `action`, `amount`, `created_at`, `reference_id` (for deduplication) |
| `fraylon_completed_actions` | **DROP** — Use `xp_transactions.reference_id` | **LOW** — Deduplication via DB | N/A — reference_id acts as dedup key |
| `fa_streak_count` / `fraylon_streak` | `user_streaks` table | **MEDIUM** — Merge both streak systems | `user_id PK`, `current_streak`, `longest_streak`, `last_activity_date` |
| `fa_last_submission_date` | Include in `user_streaks` above | **LOW** — Single column | Part of `user_streaks` |
| `fa_completed_projects` | `user_completed_projects` table | **LOW** — Simple mapping | `user_id FK`, `course_slug`, `project_id`, `completed_at`, `UNIQUE(user_id, project_id)` |
| `fa_completed_quizzes` | `quiz_attempts` table | **MEDIUM** — Already partially structured | `id PK`, `user_id FK`, `course_slug`, `lecture_number`, `score`, `total`, `passed`, `attempt_number`, `created_at` |
| `fraylon_achievements` | `user_achievements` table | **LOW** | `user_id FK`, `achievement_id`, `unlocked_at`, `UNIQUE(user_id, achievement_id)` |
| `fraylon_stats` | Computed from other tables | **LOW** — Not stored, derived | `lectures_completed`, `quizzes_passed`, `projects_submitted`, etc. |
| `fraylon_overall_progress` | Computed from `user_progress` | **LOW** — Derived value | Calculate from completed lectures / total lectures |
| `fa_submission_history` | `submission_log` table | **LOW** — Heatmap data | `user_id FK`, `date`, `count`, `UNIQUE(user_id, date)` |
| `fa_chat` | `chat_messages` table | **MEDIUM** | `id PK`, `user_id FK`, `problem_id`, `role`, `content`, `created_at` |
| `fa_code_<projectId>` | `code_drafts` table | **LOW** | `user_id FK`, `project_id`, `code TEXT`, `updated_at`, `UNIQUE(user_id, project_id)` |
| `lms:quiz_history:<quizId>` | Merge into `quiz_attempts` above | **MEDIUM** | Part of `quiz_attempts` |
| `fa_daily_missions_<date>` | `daily_missions` table | **LOW** | `id PK`, `user_id FK`, `mission_date`, `missions JSONB`, `completed JSONB` |

### 10.2 Recommended Schema (Core Tables)

```sql
-- Users (already exists in backend)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255),
  role VARCHAR(20) DEFAULT 'student',
  email_verified BOOLEAN DEFAULT false,
  github_id VARCHAR(255),
  linkedin_id VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sessions (for token management)
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash VARCHAR(255) NOT NULL,
  device_info JSONB,
  ip_address VARCHAR(45),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  revoked_at TIMESTAMP
);

-- User Progress (core of migration)
CREATE TABLE user_progress (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  course_slug VARCHAR(100) NOT NULL,
  lecture_number INT NOT NULL,
  sections JSONB DEFAULT '{}',
  quiz_score DECIMAL(5,2),
  quiz_completed BOOLEAN DEFAULT false,
  quiz_attempts INT DEFAULT 0,
  problems_completed TEXT[] DEFAULT '{}',
  project_completed BOOLEAN DEFAULT false,
  project_id VARCHAR(100),
  lecture_completed BOOLEAN DEFAULT false,
  last_section VARCHAR(100),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, course_slug, lecture_number)
);

-- XP (single consolidated system)
CREATE TABLE user_xp (
  user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_xp INT DEFAULT 0,
  level INT DEFAULT 1,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- XP Transactions (audit trail)
CREATE TABLE xp_transactions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  reference_id VARCHAR(255),  -- dedup key, e.g. "lecture_complete:cs50p:3"
  created_at TIMESTAMP DEFAULT NOW()
);

-- Streaks
CREATE TABLE user_streaks (
  user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Achievements
CREATE TABLE user_achievements (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  achievement_id VARCHAR(100) NOT NULL,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Quiz Attempts
CREATE TABLE quiz_attempts (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  course_slug VARCHAR(100) NOT NULL,
  lecture_number INT NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  total INT NOT NULL,
  passed BOOLEAN NOT NULL,
  attempt_number INT NOT NULL,
  details JSONB,  -- per-question answers
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 10.3 Migration Order

| Priority | Table | Reason |
|---|---|---|
| 1 | `users` | Already exists — foundation |
| 2 | `user_progress` | Core data, highest security risk |
| 3 | `user_xp` + `xp_transactions` | Consolidate two XP systems |
| 4 | `user_streaks` | Consolidate two streak systems |
| 5 | `user_achievements` | Server-verified unlocks |
| 6 | `quiz_attempts` | Server-graded quizzes |
| 7 | `sessions` | Token management enhancement |

### 10.4 Migration Complexity Summary

| Factor | Assessment |
|---|---|
| **Backend tables already exist?** | `users` table exists, `sessions`/tokens pattern exists; gamification tables do NOT exist |
| **Frontend changes needed?** | Replace all `localStorage.getItem/setItem` calls with API calls to new backend endpoints |
| **Backend changes needed?** | New routes: `GET/POST /api/progress`, `GET/POST /api/xp`, `GET/POST /api/streaks`, `GET/POST /api/achievements`, `GET /api/leaderboard` |
| **Data migration needed?** | Yes — existing localStorage data must be migrated to backend on first login after deployment |
| **Backward compatibility?** | Must support localStorage fallback during transition period |

---

## Summary of Findings

### By Severity

| Severity | Count | IDs |
|---|---|---|
| **CRITICAL** | 4 | V1, V2, V3, V4 |
| **HIGH** | 5 | V5, V6, V7, V8, V9 |
| **MEDIUM** | 4 | V10, V11, V12, V13 |
| **LOW** | 3 | V14, V15, V16 |
| **Total** | **16** | |

### Key Architectural Diagram

```
                         ┌──────────────────────────────┐
                         │       Browser (Client)        │
                         │                              │
  ┌──────────────────┐  │  ┌────────────────────────┐   │
  │                  │  │  │     React App           │   │
  │   Login Page     │  │  │  ┌──────────────────┐   │   │
  │   Register Page  │──┼──│  │   AuthProvider    │   │   │
  │   OAuthCallback  │  │  │  │  ┌────────────┐   │   │   │
  │                  │  │  │  │  │  useAuth()  │   │   │   │
  └──────────────────┘  │  │  │  └────────────┘   │   │   │
                         │  │  └──────────────────┘   │   │
                         │  │                         │   │
                         │  │  ┌──────────────────┐   │   │
                         │  │  │   localStorage    │   │   │
                         │  │  │  ┌──────────────┐ │   │   │
                         │  │  │  │ fa_token      │ │   │   │
                         │  │  │  │ lms:progress  │ │   │   │
                         │  │  │  │ fa_total_xp   │ │   │   │
                         │  │  │  │ fraylon_xp    │ │   │   │
                         │  │  │  │ fa_streak_*   │ │   │   │
                         │  │  │  │ ...22 keys   │ │   │   │
                         │  │  │  └──────────────┘ │   │   │
                         │  │  └──────────────────┘   │   │
                         │  │                         │   │
                         │  │  ┌──────────────────┐   │   │
                         │  │  │  Route Guards     │   │   │
                         │  │  │  RequireAuth      │   │   │
                         │  │  │  RequireRole      │   │   │
                         │  │  │  (frontend-only)  │   │   │
                         │  │  └──────────────────┘   │   │
                         │  └────────────────────────┘   │
                         └──────────────────────────────┘
                                      │
                    HTTP API (Bearer JWT + httpOnly cookie)
                                      │
                         ┌──────────────────────────────┐
                         │         Backend (Express)     │
                         │                              │
                         │  ┌────────────────────────┐   │
                         │  │  requireAuth middleware│   │
                         │  │  requireRole middleware│   │
                         │  │  JWT verify + refresh  │   │
                         │  └────────────────────────┘   │
                         │                              │
                         │  ┌────────────────────────┐   │
                         │  │  Auth Routes            │   │
                         │  │  POST /auth/login       │   │
                         │  │  POST /auth/register    │   │
                         │  │  POST /auth/logout      │   │
                         │  │  GET  /auth/me          │   │
                         │  │  POST /auth/refresh     │   │
                         │  │  OAuth flow             │   │
                         │  └────────────────────────┘   │
                         │                              │
                         │  ┌────────────────────────┐   │
                         │  │  ⚠️ NO PROGRESS/XP/    │   │
                         │  │  STREAK/ACHIEVEMENT    │   │
                         │  │  ENDPOINTS EXIST       │   │
                         │  │  All gamification is   │   │
                         │  │  client-side only      │   │
                         │  └────────────────────────┘   │
                         │                              │
                         │  ┌────────────────────────┐   │
                         │  │  PostgreSQL Database    │   │
                         │  │  users (exists)         │   │
                         │  │  No gamification tables │   │
                         │  └────────────────────────┘   │
                         └──────────────────────────────┘
```

### Recommended Fix Order

| Order | Fix | Severity | Effort |
|---|---|---|---|
| 1 | Clear all user-scoped localStorage on logout (progress, XP, streaks, achievements, quizzes, chats, drafts) | CRITICAL V2 | 1 day |
| 2 | Consolidate duplicate gamification systems (merge `fa_*` and `fraylon_*` into single API) | CRITICAL V3 | 2 days |
| 3 | Move progress/XP/streak/achievement storage to backend with authenticated API endpoints | CRITICAL V1 | 2 weeks |
| 4 | Implement real multi-user leaderboard backed by server data | CRITICAL V4 | 3 days |
| 5 | Move access token to httpOnly cookie (remove `fa_token` from localStorage) | HIGH V5 | 2 days |
| 6 | Unify quiz pass threshold to single value across all files | HIGH V6 | <1 day |
| 7 | Wire `RequireRole` to admin/instructor routes | HIGH V8 | <1 day |
| 8 | Remove `REVIEW_MODE = true` and implement proper lecture unlocking | HIGH V9 | 1 day |
| 9 | Add cross-tab login synchronization event | MEDIUM V13 | <1 day |
| 10 | Add "Remember Me" option using sessionStorage vs localStorage | MEDIUM V11 | <1 day |
