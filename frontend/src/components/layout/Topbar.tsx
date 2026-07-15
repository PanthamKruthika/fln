import { useState, useRef, useEffect } from "react";
import { Bell, Sun, Moon, ChevronDown, ShieldCheck } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";

const NOTIFICATIONS = [
  { id: "1", title: "New assessment published", message: "FLN Q3 Assessment 2025-26 is now live", time: "2 min ago", unread: true },
  { id: "2", title: "State report ready", message: "Rajasthan FLN performance report is ready", time: "1 hour ago", unread: true },
  { id: "3", title: "Template approved", message: "Numeracy Template v2 has been approved", time: "3 hours ago", unread: false },
];

export default function Topbar() {
  const { theme, toggle } = useTheme();
  const { user } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="h-16 bg-gradient-to-r from-white via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 flex-shrink-0 shadow-sm">
      {/* Left: Welcome chip */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/15 dark:to-indigo-500/15 border border-blue-100 dark:border-blue-400/30">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="text-[12px] font-semibold text-blue-700 dark:text-blue-300 tracking-wide">
            Welcome back, {user?.firstName || "Admin"}
          </span>
        </div>
        <div className="hidden lg:block text-[11px] font-medium text-slate-400 dark:text-slate-500">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
          title="Toggle theme"
        >
          {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifs((v) => !v)}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-gradient-to-br from-red-500 to-pink-600 text-white text-[9px] font-bold grid place-items-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-900/10 z-50 overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-900">Notifications</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Stay updated with latest activity</p>
                </div>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
                {NOTIFICATIONS.map((n) => (
                  <div
                    key={n.id}
                    className={`px-5 py-3.5 hover:bg-slate-50 transition cursor-pointer ${
                      n.unread ? "bg-blue-50/30" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {n.unread && (
                        <span className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 flex-shrink-0 ring-4 ring-blue-100" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-slate-900">{n.title}</p>
                        <p className="text-[12px] text-slate-600 mt-0.5">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          {n.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
                <button className="text-[12px] text-blue-600 font-semibold hover:text-blue-700">
                  View all notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Vertical divider */}
        <div className="w-px h-7 bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile((v) => !v)}
            className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white grid place-items-center text-xs font-bold shadow-md shadow-blue-500/30">
                SA
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-white" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-[13px] font-semibold text-slate-900 dark:text-white leading-none">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">Super Admin</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 hidden sm:block" />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-900/10 z-50 overflow-hidden">
              <div className="px-4 py-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <p className="text-sm font-bold">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[11px] text-blue-100 mt-0.5 truncate">
                  {user?.email || "admin@fln.org"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}