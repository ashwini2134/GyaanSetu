import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { authApi, clearToken, getToken, setToken } from "./authClient";

describe("authClient", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("manages tokens in localStorage", () => {
    setToken("abc");
    expect(getToken()).toBe("abc");
    clearToken();
    expect(getToken()).toBeNull();
  });

  it("registers via API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: "token-1",
          user: { id: 1, email: "a@b.com", name: "A", role: "student", emailVerified: false },
        }),
      })
    );

    const res = await authApi.register("a@b.com", "password123", "A");
    expect(res.access_token).toBe("token-1");
    expect(res.user.name).toBe("A");
  });

  it("sends Authorization header on me()", async () => {
    setToken("my-token");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        user: { id: 1, email: "a@b.com", name: "A", role: "student", emailVerified: true },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await authApi.me();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/me",
      expect.objectContaining({
        headers: expect.any(Headers),
        credentials: "include",
      })
    );
    const headers = fetchMock.mock.calls[0][1].headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer my-token");
  });
});
