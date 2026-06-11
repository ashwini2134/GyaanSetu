import { type FormEvent, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth";
import { AuthLayout, Button, Input } from "../components";
import { OAuthButtons } from "../components/OAuthButtons";

export default function Register() {
  const { user, register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await register(email, password, name);
    } catch {
      setErr("Could not register. Email may already be in use.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Get started"
      subtitle="Create your Fraylon Academy account to begin learning"
      footerText="Already have an account?"
      footerLink={
        <Link to="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
          Sign in
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-sm font-medium text-slate-200">
            Full Name
          </label>
          <Input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
          />
        </div>

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

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-slate-200">
            Password <span className="text-xs text-slate-400">(min 8 characters)</span>
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

        {err && (
          <div className="rounded-lg bg-red-900/20 border border-red-700/50 px-4 py-3 text-sm text-red-300">
            {err}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={busy}
          disabled={busy}
          className="w-full mt-2"
        >
          {busy ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <div className="mt-6">
        <OAuthButtons />
      </div>
    </AuthLayout>
  );
}
