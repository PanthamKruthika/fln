import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, ShieldCheck } from "lucide-react";
import { loginRoles } from "../data/loginRoles";

export default function LoginPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("teacher");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const role = loginRoles.find((r) => r.id === selectedRole);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Invalid email or password");
      return;
    }

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const passwordValid =
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!emailValid || !passwordValid) {
      setError("Invalid email or password");
      return;
    }

    const dashboardMap = {
      superadmin: "/superadmin",
      admin: "/admin",
      district_admin: "/district",
      block_admin: "/block",
      school: "/school",
      teacher: "/teacher",
      volunteer: "/volunteer",
    };
    navigate(dashboardMap[selectedRole] ?? "/teacher");
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

          <div className="mb-5">
            <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-wide">
              Select your role
            </label>
            <div className="grid grid-cols-2 gap-2">
              {loginRoles.map((r) => {
                const active = r.id === selectedRole;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRole(r.id)}
                    className={[
                      "text-left px-3 py-2.5 rounded-lg border transition",
                      active
                        ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600"
                        : "border-slate-200 hover:border-slate-300 bg-white",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "text-sm font-medium",
                        active ? "text-indigo-700" : "text-slate-800",
                      ].join(" ")}
                    >
                      {r.label}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {r.description}
                    </div>
                  </button>
                );
              })}
            </div>
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
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition"
            >
              Sign In
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