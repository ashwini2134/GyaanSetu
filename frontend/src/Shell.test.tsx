import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const mockAdminUser = {
  id: 1,
  email: "admin@test.com",
  name: "Admin User",
  role: "admin" as const,
  emailVerified: true,
};

const mockStudentUser = {
  id: 2,
  email: "student@test.com",
  name: "Student User",
  role: "student" as const,
  emailVerified: true,
};

vi.mock("./auth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("./api", () => ({
  api: { courses: vi.fn().mockResolvedValue([]) },
}));

vi.mock("./authClient", () => ({
  authApi: { getInAppNotifications: vi.fn().mockResolvedValue({ notifications: [], unread: 0 }) },
  getToken: vi.fn().mockReturnValue("mock-token"),
  authFetch: vi.fn(),
}));

vi.mock("./context/BrandingContext", () => ({
  useBranding: () => ({ branding: null, refreshBranding: vi.fn(), isLoading: false }),
}));

import { useAuth } from "./auth";
import Shell from "./Shell";

function renderShell(user: typeof mockAdminUser) {
  (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
    user,
    ready: true,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    completeOAuth: vi.fn(),
    hasRole: (...roles: string[]) => roles.includes(user.role),
    checkAuth: vi.fn(),
  });

  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Shell />
    </MemoryRouter>
  );
}

describe("Shell admin role badge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows Review Mode badge and role text for admin user", async () => {
    renderShell(mockAdminUser);

    expect(screen.getByText("Review Mode")).toBeDefined();
    expect(screen.getByText("All lectures unlocked")).toBeDefined();

    const roleBadges = screen.getAllByText("admin");
    expect(roleBadges.length).toBeGreaterThanOrEqual(1);
    roleBadges.forEach(badge => {
      expect(badge.className).toContain("capitalize");
    });
  });

  it("does NOT show Review Mode badge for student user", async () => {
    renderShell(mockStudentUser);

    expect(screen.queryByText("Review Mode")).toBeNull();
    expect(screen.queryByText("All lectures unlocked")).toBeNull();
  });

  it("shows role text for student user", async () => {
    renderShell(mockStudentUser);

    const roleBadges = screen.getAllByText("student");
    expect(roleBadges.length).toBeGreaterThanOrEqual(1);
    roleBadges.forEach(badge => {
      expect(badge.className).toContain("capitalize");
    });
  });

  it("shows user name for admin", async () => {
    renderShell(mockAdminUser);

    const names = screen.getAllByText("Admin User");
    expect(names.length).toBeGreaterThanOrEqual(1);
    names.forEach(name => {
      expect(name.className).toContain("truncate");
    });
  });

  it("shows user name for student", async () => {
    renderShell(mockStudentUser);

    const names = screen.getAllByText("Student User");
    expect(names.length).toBeGreaterThanOrEqual(1);
    names.forEach(name => {
      expect(name.className).toContain("truncate");
    });
  });
});
