import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("../../auth", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "../../auth";
import { AdminRoute } from "./AdminRoute";

function renderAdminRoute(authOverrides: Record<string, any>) {
  (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
    user: null,
    ready: true,
    hasRole: () => false,
    ...authOverrides,
  });

  return render(
    <MemoryRouter initialEntries={["/admin"]}>
      <AdminRoute>
        <div data-testid="admin-content">Admin Dashboard</div>
      </AdminRoute>
    </MemoryRouter>
  );
}

describe("AdminRoute frontend guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading spinner when auth is not ready", () => {
    renderAdminRoute({ ready: false });
    expect(screen.getByText("Loading...")).toBeDefined();
    expect(screen.queryByTestId("admin-content")).toBeNull();
  });

  it("redirects to / when user is null (not logged in)", () => {
    renderAdminRoute({ user: null, hasRole: () => false });
    expect(screen.queryByTestId("admin-content")).toBeNull();
  });

  it("redirects to / when user role is student (not admin)", () => {
    renderAdminRoute({
      user: { id: 1, role: "student", name: "Student" },
      hasRole: (...r: string[]) => r.includes("student"),
    });
    expect(screen.queryByTestId("admin-content")).toBeNull();
  });

  it("renders children when user role is admin", () => {
    renderAdminRoute({
      user: { id: 1, role: "admin", name: "Admin" },
      hasRole: (...r: string[]) => r.includes("admin"),
    });
    expect(screen.getByTestId("admin-content")).toBeDefined();
    expect(screen.getByText("Admin Dashboard")).toBeDefined();
  });
});
