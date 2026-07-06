import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "fln.auth";

const AuthContext = createContext(null);

const routeForRole = (role) => {
  switch (role) {
    case "superadmin":     return "/superadmin";
    case "admin":          return "/admin";
    case "district_admin": return "/district";
    case "block_admin":    return "/block";
    case "school":         return "/school";
    case "teacher":        return "/teacher";
    case "volunteer":      return "/volunteer";
    default:               return "/";
  }
};

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (auth) localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    else localStorage.removeItem(STORAGE_KEY);
  }, [auth]);

  const value = useMemo(
    () => ({
      auth,
      isAuthenticated: !!auth?.token,
      user: auth?.user ?? null,
      token: auth?.token ?? null,
      setSession: (payload) => setAuth(payload),
      login: (payload) => setAuth(payload),
      logout: () => setAuth(null),
      routeForRole,
    }),
    [auth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export function useLogout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return () => {
    logout();
    navigate("/", { replace: true });
  };
}