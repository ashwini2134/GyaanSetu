import { Navigate, Route, Routes } from "react-router-dom";
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

const CapstonePage = lazy(
  () => import("./pages/CapstonePage")
);

const ProfilePage = lazy(
  () => import("./pages/ProfilePage")
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

// Auth Wrapper
function RequireAuth({
  children,
}: {
  children: ReactNode;
}) {

  const { user, ready } = useAuth();

  if (!ready) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
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
          element={
            <RequireAuth>
              <Shell />
            </RequireAuth>
          }
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

          {/* Leaderboard */}

          <Route
            path="leaderboard"
            element={<LeaderboardPage />}
          />

          {/* Profile */}

          <Route
            path="profile"
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