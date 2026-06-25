import { Navigate, Route, Routes, useLocation, Outlet } from "react-router-dom";
import type { ReactNode } from "react";
import { Suspense, lazy } from "react";

import { useAuth } from "./auth";
import type { UserRole } from "./authClient";

// Pages
const CoursePage = lazy(
  () => import("./pages/CoursePage")
);

const CoursesPage = lazy(
  () => import("./pages/CoursesPage")
);

const Dashboard = lazy(
  () => import("./pages/Dashboard")
);

const LecturePage = lazy(
  () => import("./pages/LecturePage")
);

const Login = lazy(
  () => import("./pages/Login")
);

const QuizPage = lazy(
  () => import("./pages/QuizPage")
);

const Register = lazy(
  () => import("./pages/Register")
);

const ForgotPassword = lazy(
  () => import("./pages/ForgotPassword")
);

const ResetPassword = lazy(
  () => import("./pages/ResetPassword")
);

const OAuthCallback = lazy(
  () => import("./pages/OAuthCallback")
);

const Shell = lazy(
  () => import("./Shell")
);

const LeaderboardPage = lazy(
  () => import("./pages/LeaderboardPage")
);
const CertificationsPage = lazy(
  () => import("./pages/CertificationsPage")
);

const CapstonePage = lazy(
  () => import("./pages/CapstonePage")
);

const Projects = lazy(
  () => import("./pages/Projects")
);

const AssessmentsSection = lazy(
  () => import("./pages/AssessmentsSection")
);

const ProjectDetailsPage = lazy(
  () => import("./pages/ProjectDetailsPage")
);

const InteractiveProjectPage = lazy(
  () => import("./pages/InteractiveProjectPage")
);

const ProfilePage = lazy(
  () => import("./pages/ProfilePage")
);

const AdminContentStudioPage = lazy(
  () => import("./pages/AdminContentStudioPage")
);
const AdminReportsPage = lazy(
  () => import("./pages/AdminReportsPage")
);
const AdminOperationsMonitorPage = lazy(
  () => import("./pages/AdminOperationsMonitorPage")
);
const AdminSettingsPage = lazy(
  () => import("./pages/AdminSettingsPage")
);

// ── NEW PHASE 1 ADMIN COMPONENTS ──
const ContentStudio = lazy(() => import("./pages/admin/ContentStudio"));
const BlueprintBuilder = lazy(() => import("./pages/admin/BlueprintBuilder"));
const LessonEditor = lazy(() => import("./pages/admin/LessonEditor"));
const QuizBuilder = lazy(() => import("./pages/admin/QuizBuilder"));
const ProjectBuilder = lazy(() => import("./pages/admin/ProjectBuilder"));
const VersionHistory = lazy(() => import("./pages/admin/VersionHistory"));
const BetaTesting = lazy(() => import("./pages/admin/BetaTesting"));
const OperationsMonitor = lazy(() => import("./pages/admin/OperationsMonitor"));
const Analytics = lazy(() => import("./pages/admin/Analytics"));
const Settings = lazy(() => import("./pages/admin/Settings"));
import { AdminRoute } from "./components/admin/AdminRoute";

const LandingPage = lazy(
  () => import("./pages/LandingPage")
);

// Loading Spinner
function LoadingSpinner() {

  return (

    <div className="flex min-h-screen items-center justify-center bg-slate-950">

      <div className="flex flex-col items-center gap-4">

        <svg
          className="h-8 w-8 animate-spin text-blue-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >

          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />

          <path
            className="opacity-75"
            fill="currentColor"
            d="
              M4 12a8 8 0 018-8V0
              C5.373 0 0 5.373 0 12h4
              zm2 5.291A7.962 7.962 0 014 12H0
              c0 3.042 1.135 5.824 3 7.938
              l3-2.647z
            "
          />

        </svg>

        <p className="text-slate-400">
          Loading...
        </p>

      </div>

    </div>
  );
}


// Landing or Dashboard Guard
function LandingOrDashboardGuard() {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return <LoadingSpinner />;
  }

  // If user is authenticated, render the main application Shell
  if (user) {
    return <Shell />;
  }

  // If user is not authenticated:
  const isRootPath = location.pathname === "/" || location.pathname === "";

  if (isRootPath) {
    return <LandingPage />;
  }

  // Redirect to login if accessing a private path while unauthenticated
  return <Navigate to="/login" replace state={{ from: location }} />;
}

export function RequireRole({
  roles,
  children,
}: {
  roles: UserRole[];
  children: ReactNode;
}) {
  const { user, ready, hasRole } = useAuth();

  if (!ready) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!hasRole(...roles)) return <Navigate to="/" replace />;

  return <>{children}</>;
}

// Main App
export default function App() {

  return (

    <Suspense fallback={<LoadingSpinner />}>

      <Routes>

        {/* PUBLIC ROUTES */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        <Route
          path="/auth/oauth"
          element={<OAuthCallback />}
        />

        {/* PRIVATE ROUTES */}

        <Route
          path="/"
          element={<LandingOrDashboardGuard />}
        >

          {/* Dashboard */}

          <Route
            index
            element={<Dashboard />}
          />

          {/* Courses catalog */}

          <Route
            path="courses"
            element={<CoursesPage />}
          />

          {/* Course */}

          <Route
            path="course/:slug"
            element={<CoursePage />}
          />

          {/* Lecture */}

          <Route
            path="course/:slug/lecture/:number"
            element={<LecturePage />}
          />

          {/* Interactive Project Workspace */}

          <Route
            path="course/:slug/lecture/:number/project/:projectId"
            element={<InteractiveProjectPage />}
          />

          {/* Quiz */}

          <Route
            path="course/:slug/lecture/:number/quiz"
            element={<QuizPage />}
          />

          {/* Capstone */}

          <Route
            path="course/:slug/capstone"
            element={<CapstonePage />}
          />

          {/* Certifications */}
          <Route
            path="certifications"
            element={<CertificationsPage />}
          />

          {/* Leaderboard */}
          <Route
            path="leaderboard"
            element={<LeaderboardPage />}
          />

          {/* Projects */}

          <Route
            path="projects"
            element={<Projects />}
          />
          <Route
            path="projects/:projectId"
            element={<ProjectDetailsPage />}
          />

          {/* Assessments */}

          <Route
            path="assessments"
            element={<AssessmentsSection />}
          />

          {/* Profile */}

          <Route
            path="profile"
            element={<ProfilePage />}
          />
          <Route
            path="profile/:userId"
            element={<ProfilePage />}
          />

          {/* ── Admin: Redirects (legacy routes) ── */}
          <Route path="qa" element={<Navigate to="/admin/operations" replace />} />

          {/* ── NEW PHASE 1 ADMIN ROUTER (NOW INSIDE DASHBOARD SHELL) ── */}
          <Route path="admin" element={<AdminRoute><Outlet /></AdminRoute>}>
            <Route index element={<Navigate to="content-studio" replace />} />
            <Route path="content-studio" element={<ContentStudio />} />
            <Route path="content-studio/new" element={<BlueprintBuilder />} />
            <Route path="content-studio/:courseId/blueprint" element={<BlueprintBuilder />} />
            <Route path="content-studio/:courseId/lessons" element={<LessonEditor />} />
            <Route path="content-studio/:courseId/quiz" element={<QuizBuilder />} />
            <Route path="content-studio/:courseId/project" element={<ProjectBuilder />} />
            <Route path="content-studio/:courseId/versions" element={<VersionHistory />} />
            <Route path="content-studio/:courseId/beta" element={<BetaTesting />} />
            <Route path="operations" element={<OperationsMonitor />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>

        </Route>

        {/* FALLBACK */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>

    </Suspense>
  );
}