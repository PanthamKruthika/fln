import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";
import { loginRoles } from "../data/loginRoles";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, routeForRole } = useAuth();

  const [selectedRole, setSelectedRole] = useState("teacher");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const role = loginRoles.find((r) => r.id === selectedRole);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Invalid email or password");
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: selectedRole }),
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        setError(data.message || "Invalid email or password");
        return;
      }

      const { token, user } = data;
      if (!token || !user?.role) {
        setError("Unexpected server response");
        return;
      }

      login({ token, user });
      navigate(routeForRole(user.role), { replace: true });
    } catch (err) {
      setError("Cannot reach the server. Is the backend running on :5000?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 grid place-items-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6 text-white">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur grid place-items-center font-bold text-lg">
            F
          </div>
          <div className="text-lg font-semibold tracking-wide">FLN Platform</div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
            <p className="text-sm text-slate-500 mt-1">
              Sign in to your account
            </p>
          </div>

          <div className="mb-5 border-b border-slate-200">
            <nav className="-mb-px flex overflow-x-auto" aria-label="Role tabs">
              {loginRoles.map((r) => {
                const active = r.id === selectedRole;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRole(r.id)}
                    className={[
                      "shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap",
                      active
                        ? "border-indigo-600 text-indigo-700"
                        : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300",
                    ].join(" ")}
                    aria-current={active ? "page" : undefined}
                  >
                    {r.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role?.example ?? "you@fln.org"}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:bg-white"
                autoComplete="username"
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-11 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:bg-white"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error ? (
              <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                <ShieldCheck size={14} />
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium rounded-lg transition inline-flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-indigo-600"
            >
              <ArrowLeft size={14} />
              Back to Home
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-white/80 mt-5">
          All accounts are created by Superadmin or Admin · No public sign-up
        </p>
      </div>
    </div>
  );
}