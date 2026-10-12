import { render, screen, act, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "./auth";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const adminUser = {
  id: "1",
  email: "admin@test.com",
  name: "Admin User",
  role: "admin" as const,
  emailVerified: true,
};

const studentUser = {
  id: "2",
  email: "student@test.com",
  name: "Student User",
  role: "student" as const,
  emailVerified: true,
};

let store: Record<string, string> = {};

function mockFetch(handler: (url: string, init?: RequestInit) => { status?: number; body: unknown }) {
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string, init?: RequestInit) => {
      const result = handler(url, init);
      const ok = !result.status || result.status < 400;
      return Promise.resolve({
        ok,
        status: result.status ?? 200,
        json: async () => result.body,
      });
    })
  );
}

function TestSession() {
  const { user, ready, login, register, logout, hasRole } = useAuth();

  if (!ready) return <div data-testid="loading">Loading...</div>;

  return (
    <div>
      <div data-testid="user-name">{user?.name || "null"}</div>
      <div data-testid="user-role">{user?.role || "null"}</div>
      <div data-testid="user-id">{user?.id || "null"}</div>
      <div data-testid="is-admin">{hasRole("admin") ? "true" : "false"}</div>
      <div data-testid="stored-token">{store["fa_token"] || "null"}</div>
      <button data-testid="btn-login" onClick={() => login("admin@test.com", "pass")}>
        Login
      </button>
      <button data-testid="btn-register" onClick={() => register("admin@test.com", "pass", "Admin User")}>
        Register
      </button>
      <button data-testid="btn-logout" onClick={() => logout()}>
        Logout
      </button>
    </div>
  );
}

function renderSession() {
  return render(
    <AuthProvider>
      <TestSession />
    </AuthProvider>
  );
}

describe("Admin session stored in auth context", () => {
  beforeEach(() => {
    store = {};

    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
      removeItem: vi.fn((key: string) => { delete store[key]; }),
      clear: vi.fn(() => { store = {}; }),
      get length() { return Object.keys(store).length; },
      key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
    });

    vi.restoreAllMocks();
    mockFetch((url) => {
      if (url.includes("/login")) {
        return { body: { access_token: "admin-token-123", user: adminUser } };
      }
      if (url.includes("/register")) {
        return { body: { access_token: "admin-token-456", user: adminUser } };
      }
      if (url.includes("/logout")) {
        return { body: { ok: true } };
      }
      if (url.includes("/me")) {
        const token = store["fa_token"];
        if (token === "admin-token-123" || token === "admin-token-456") {
          return { body: { user: adminUser } };
        }
        return { body: { user: null } };
      }
      return { body: {} };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it("starts with null user and admin=false", async () => {
    renderSession();
    const userName = await screen.findByTestId("user-name");
    expect(userName.textContent).toBe("null");
    expect(screen.getByTestId("user-role").textContent).toBe("null");
    expect(screen.getByTestId("is-admin").textContent).toBe("false");
  });

  it("stores admin user in context after login", async () => {
    const user = userEvent.setup();
    renderSession();

    await act(async () => {
      await user.click(await screen.findByTestId("btn-login"));
    });

    expect(screen.getByTestId("user-name").textContent).toBe("Admin User");
    expect(screen.getByTestId("user-role").textContent).toBe("admin");
    expect(screen.getByTestId("user-id").textContent).toBe("1");
    expect(screen.getByTestId("is-admin").textContent).toBe("true");
    expect(store["fa_token"]).toBe("admin-token-123");
  });

  it("stores admin user in context after register", async () => {
    const user = userEvent.setup();
    renderSession();

    await act(async () => {
      await user.click(await screen.findByTestId("btn-register"));
    });

    expect(screen.getByTestId("user-name").textContent).toBe("Admin User");
    expect(screen.getByTestId("user-role").textContent).toBe("admin");
    expect(screen.getByTestId("is-admin").textContent).toBe("true");
    expect(store["fa_token"]).toBe("admin-token-456");
  });

  it("clears admin session on logout", async () => {
    const user = userEvent.setup();
    renderSession();

    await act(async () => {
      await user.click(await screen.findByTestId("btn-login"));
    });

    expect(screen.getByTestId("is-admin").textContent).toBe("true");

    await act(async () => {
      await user.click(screen.getByTestId("btn-logout"));
    });

    expect(screen.getByTestId("user-name").textContent).toBe("null");
    expect(screen.getByTestId("is-admin").textContent).toBe("false");
    expect(store["fa_token"]).toBeUndefined();
  });

  it("restores admin session from token on mount (page reload)", async () => {
    store["fa_token"] = "admin-token-123";

    renderSession();

    expect(await screen.findByTestId("user-name")).toBeDefined();
    expect(screen.getByTestId("user-name").textContent).toBe("Admin User");
    expect(screen.getByTestId("user-role").textContent).toBe("admin");
    expect(screen.getByTestId("is-admin").textContent).toBe("true");
  });

  it("hasRole returns false for admin check when user is student", async () => {
    mockFetch((url) => {
      if (url.includes("/login")) {
        return { body: { access_token: "student-token", user: studentUser } };
      }
      if (url.includes("/logout")) return { body: { ok: true } };
      if (url.includes("/me")) return { body: { user: null } };
      return { body: {} };
    });

    const user = userEvent.setup();
    renderSession();

    await act(async () => {
      await user.click(await screen.findByTestId("btn-login"));
    });

    expect(screen.getByTestId("user-name").textContent).toBe("Student User");
    expect(screen.getByTestId("user-role").textContent).toBe("student");
    expect(screen.getByTestId("is-admin").textContent).toBe("false");
  });

  it("does not restore session when token is invalid (API returns null user)", async () => {
    store["fa_token"] = "expired-token";

    mockFetch((url) => {
      if (url.includes("/me")) return { user: null };
      return {};
    });

    renderSession();
    expect(await screen.findByTestId("user-name")).toBeDefined();
    expect(screen.getByTestId("user-name").textContent).toBe("null");
    expect(screen.getByTestId("is-admin").textContent).toBe("false");
  });

  it("clears token and session when API returns 401", async () => {
    store["fa_token"] = "expired-token";

    mockFetch((url) => {
      if (url.includes("/me")) return { status: 401, body: { error: "Not authenticated" } };
      if (url.includes("/refresh")) return { status: 401, body: { error: "Refresh failed" } };
      return { body: {} };
    });

    renderSession();
    expect(await screen.findByTestId("user-name")).toBeDefined();
    expect(screen.getByTestId("user-name").textContent).toBe("null");
    expect(screen.getByTestId("is-admin").textContent).toBe("false");
    expect(store["fa_token"]).toBeUndefined();
  });
});
