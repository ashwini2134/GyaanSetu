import { render, screen, act, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "./auth";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const mockUser = {
  id: 1,
  email: "test@example.com",
  name: "Test User",
  role: "student" as const,
  emailVerified: true,
};

function mockFetch(handler: (url: string, init?: RequestInit) => unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string, init?: RequestInit) =>
      Promise.resolve({
        ok: true,
        json: async () => handler(url, init),
      })
    )
  );
}

const TestComponent = () => {
  const { user, ready, login, logout, register } = useAuth();

  if (!ready) return <div>Loading...</div>;

  return (
    <div>
      <div data-testid="user-status">{user ? user.name : "No User"}</div>
      <button onClick={() => login("test@example.com", "password123")}>Login</button>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={() => register("test@example.com", "password123", "Test User")}>
        Register
      </button>
    </div>
  );
};

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    mockFetch((url) => {
      if (url.includes("/register") || url.includes("/login")) {
        return { access_token: "tok", user: mockUser };
      }
      if (url.includes("/logout")) return { ok: true };
      if (url.includes("/me")) return { user: mockUser };
      return {};
    });
  });

  afterEach(() => {
    localStorage.clear();
    cleanup();
  });

  it("renders children and provides auth context", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(await screen.findByText("No User")).toBeDefined();
  });

  it("handles registration", async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      await user.click(await screen.findByText("Register"));
    });

    expect(await screen.findByText("Test User")).toBeDefined();
  });

  it("handles logout", async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      await user.click(await screen.findByText("Register"));
    });
    expect(await screen.findByText("Test User")).toBeDefined();

    await act(async () => {
      await user.click(await screen.findByText("Logout"));
    });

    expect(await screen.findByText("No User")).toBeDefined();
  });
});
