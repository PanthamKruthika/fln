import { Bell, Search, LogOut } from "lucide-react";
import { useAuth, useLogout } from "../contexts/AuthContext";

export default function Header({ title, subtitle, announcement }) {
  const { user } = useAuth();
  const logout = useLogout();

  return (
    <header className="bg-white border-b border-slate-200">
      {announcement ? (
        <div
          className={[
            "px-6 py-2 text-sm flex items-center gap-3 border-b",
            announcement.urgent
              ? "bg-amber-50 text-amber-900 border-amber-200"
              : "bg-indigo-50 text-indigo-900 border-indigo-200",
          ].join(" ")}
        >
          <Bell size={16} />
          <span className="font-medium">{announcement.title}:</span>
          <span className="truncate">{announcement.body}</span>
        </div>
      ) : null}

      <div className="px-6 py-5 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
          {subtitle ? (
            <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg w-72">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search students, papers..."
              className="bg-transparent outline-none text-sm flex-1"
            />
          </div>

          <button
            className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
          </button>

          {user ? (
            <div className="hidden sm:flex items-center gap-3 pl-3 ml-1 border-l border-slate-200">
              <div className="text-right leading-tight">
                <div className="text-sm font-medium text-slate-900">{user.name}</div>
                <div className="text-xs text-slate-500">{user.email}</div>
              </div>
              <button
                type="button"
                onClick={logout}
                title="Logout"
                aria-label="Logout"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-sm font-medium border border-rose-200"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}