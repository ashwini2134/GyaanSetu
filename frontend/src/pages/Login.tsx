import { type FormEvent, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { AlertCircle, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../auth";
import { AuthLayout, Button, Input } from "../components";
import { OAuthButtons } from "../components/OAuthButtons";

export default function Login() {
  const { user, login } = useAuth();
  const [params] = useSearchParams();
  const oauthError = params.get("oauth_error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState<string | null>(oauthError);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await login(email, password);
    } catch {
      setErr("Invalid email or password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back 👋"
      subtitle="Sign in to your Fraylon Academy account"
      footerText="Don't have an account?"
      footerLink={
        <Link to="/register" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
          Create one
        </Link>
      }
    >
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
            leftIcon={<Mail className="h-4.5 w-4.5 text-slate-400" />}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-slate-200">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            leftIcon={<Lock className="h-4.5 w-4.5 text-slate-400" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-250 transition-colors focus:outline-none cursor-pointer flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-4.5 w-4.5" />
                ) : (
                  <Eye className="h-4.5 w-4.5" />
                )}
              </button>
            }
          />
        </div>

        {err && (
          <div className="rounded-lg bg-red-950/20 border border-red-500/20 px-4 py-3 text-sm text-red-200 flex items-start gap-3 shadow-[0_0_15px_rgba(239,68,68,0.07)]">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{err}</div>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={busy}
          disabled={busy}
          className="w-full mt-2 group flex items-center justify-center gap-2"
        >
          {busy ? (
            "Signing in…"
          ) : (
            <>
              <span>Sign in</span>
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </>
          )}
        </Button>
      </form>

      <div className="mt-6">
        <OAuthButtons />
      </div>
    </AuthLayout>
  );
}
