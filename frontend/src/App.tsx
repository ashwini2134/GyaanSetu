import { Navigate, Route, Routes, useLocation } from "react-router-dom";
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

const QACenter = lazy(
  () => import("./pages/QACenter")
);
const AdminPage = lazy(
  () => import("./pages/AdminPage")
);
const ReviewQueuePage = lazy(
  () => import("./pages/ReviewQueuePage")
);
const StudentDirectoryPage = lazy(
  () => import("./pages/StudentDirectoryPage")
);
const StudentProfilePage = lazy(
  () => import("./pages/StudentProfilePage")
);
const AdminCoursesPage = lazy(
  () => import("./pages/AdminCoursesPage")
);
const AdminNotificationsPage = lazy(
  () => import("./pages/AdminNotificationsPage")
);
const AdminProjectsPage = lazy(
  () => import("./pages/AdminProjectsPage")
);
const AdminPracticeExercisesPage = lazy(
  () => import("./pages/AdminPracticeExercisesPage")
);
const AdminAssessmentsPage = lazy(
  () => import("./pages/AdminAssessmentsPage")
);
const AdminCertificationsPage = lazy(
  () => import("./pages/AdminCertificationsPage")
);
const AdminContentPage = lazy(
  () => import("./pages/AdminContentPage")
);
const AdminReportsPage = lazy(
  () => import("./pages/AdminReportsPage")
);
const AdminAutomationsPage = lazy(
  () => import("./pages/AdminAutomationsPage")
);
const AdminSettingsPage = lazy(
  () => import("./pages/AdminSettingsPage")
);

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

          {/* Admin Panel (admin only) */}

          <Route
            path="admin"
            element={
              <RequireRole roles={["admin"]}>
                <AdminPage />
              </RequireRole>
            }
          />

          {/* Review Queue (admin only) */}

          <Route
            path="admin/review-queue"
            element={
              <RequireRole roles={["admin"]}>
                <ReviewQueuePage />
              </RequireRole>
            }
          />

          {/* Student Directory (admin only) */}
          <Route
            path="admin/students"
            element={
              <RequireRole roles={["admin"]}>
                <StudentDirectoryPage />
              </RequireRole>
            }
          />
          <Route
            path="admin/students/:userId"
            element={
              <RequireRole roles={["admin"]}>
                <StudentProfilePage />
              </RequireRole>
            }
          />

          {/* Admin Courses (admin only) */}
          <Route
            path="admin/courses"
            element={
              <RequireRole roles={["admin"]}>
                <AdminCoursesPage />
              </RequireRole>
            }
          />

          {/* Admin Notifications (admin only) */}
          <Route
            path="admin/notifications"
            element={
              <RequireRole roles={["admin"]}>
                <AdminNotificationsPage />
              </RequireRole>
            }
          />

          {/* Admin Projects (admin only) */}
          <Route
            path="admin/projects"
            element={
              <RequireRole roles={["admin"]}>
                <AdminProjectsPage />
              </RequireRole>
            }
          />

          {/* Admin Practice Exercises (admin only) */}
          <Route
            path="admin/practice-exercises"
            element={
              <RequireRole roles={["admin"]}>
                <AdminPracticeExercisesPage />
              </RequireRole>
            }
          />

          {/* Admin Assessments (admin only) */}
          <Route
            path="admin/assessments"
            element={
              <RequireRole roles={["admin"]}>
                <AdminAssessmentsPage />
              </RequireRole>
            }
          />

          {/* Admin Certifications (admin only) */}
          <Route
            path="admin/certifications"
            element={
              <RequireRole roles={["admin"]}>
                <AdminCertificationsPage />
              </RequireRole>
            }
          />

          {/* Admin Content (admin only) */}
          <Route
            path="admin/content"
            element={
              <RequireRole roles={["admin"]}>
                <AdminContentPage />
              </RequireRole>
            }
          />

          {/* Admin Reports (admin only) */}
          <Route
            path="admin/reports"
            element={
              <RequireRole roles={["admin"]}>
                <AdminReportsPage />
              </RequireRole>
            }
          />

          {/* Admin Automations (admin only) */}
          <Route
            path="admin/automations"
            element={
              <RequireRole roles={["admin"]}>
                <AdminAutomationsPage />
              </RequireRole>
            }
          />

          {/* Admin Settings (admin only) */}
          <Route
            path="admin/settings"
            element={
              <RequireRole roles={["admin"]}>
                <AdminSettingsPage />
              </RequireRole>
            }
          />

          {/* QA Center (admin only) */}

          <Route
            path="qa"
            element={
              <RequireRole roles={["admin", "instructor"]}>
                <QACenter />
              </RequireRole>
            }
          />

          {/* Settings */}

          <Route
            path="settings"
            element={<ProfilePage />}
          />

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