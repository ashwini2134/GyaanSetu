import { type FormEvent, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { authApi } from "../authClient";
import { AuthLayout, Button, Input } from "../components";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!token) return <Navigate to="/forgot-password" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (password !== confirm) {
      setErr("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
    } catch {
      setErr("Invalid or expired reset link. Please request a new one.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Set new password"
      subtitle="Choose a strong password for your account"
      footerText="Need a new link?"
      footerLink={
        <Link to="/forgot-password" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
          Request again
        </Link>
      }
    >
      {done ? (
        <div className="space-y-4">
          <div className="rounded-lg bg-green-900/20 border border-green-700/50 px-4 py-3 text-sm text-green-300">
            Your password has been updated. You can now sign in.
          </div>
          <Link to="/login">
            <Button variant="primary" size="md" className="w-full">
              Go to sign in
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-slate-200">
              New Password
            </label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirm" className="block text-sm font-medium text-slate-200">
              Confirm Password
            </label>
            <Input
              id="confirm"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {err && (
            <div className="rounded-lg bg-red-900/20 border border-red-700/50 px-4 py-3 text-sm text-red-300">
              {err}
            </div>
          )}

          <Button type="submit" variant="primary" size="md" isLoading={busy} disabled={busy} className="w-full">
            {busy ? "Updating…" : "Update password"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
