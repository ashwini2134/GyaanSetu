import { useEffect, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth";

export default function OAuthCallback() {
  const [params] = useSearchParams();
  const code = params.get("code");
  const { user, completeOAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!code || user || done) return;
    completeOAuth(code)
      .then(() => setDone(true))
      .catch(() => setError("OAuth sign-in failed. Please try again."));
  }, [code, user, done, completeOAuth]);

  if (user || done) return <Navigate to="/" replace />;
  if (error) return <Navigate to={`/login?oauth_error=${encodeURIComponent(error)}`} replace />;
  if (!code) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900">
      <p className="text-slate-400">Completing sign-in…</p>
    </div>
  );
}
