import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../authClient";
import { AuthLayout, Button, Input } from "../components";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      setErr("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter your email and we'll send you a reset link"
      footerText="Remember your password?"
      footerLink={
        <Link to="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
          Sign in
        </Link>
      }
    >
      {sent ? (
        <div className="rounded-lg bg-green-900/20 border border-green-700/50 px-4 py-3 text-sm text-green-300">
          If an account exists for that email, a reset link has been sent. Check your inbox (or the
          server console in development).
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-slate-200">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          {err && (
            <div className="rounded-lg bg-red-900/20 border border-red-700/50 px-4 py-3 text-sm text-red-300">
              {err}
            </div>
          )}

          <Button type="submit" variant="primary" size="md" isLoading={busy} disabled={busy} className="w-full">
            {busy ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
