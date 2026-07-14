import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  Building2,
  School,
  Users,
  GraduationCap,
  ClipboardCheck,
  Wand,
  BarChart3,
  UserCog,
  ScrollText,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const NAV = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "States", to: "/states", icon: Map },
  { label: "Districts", to: "/districts", icon: Building2 },
  { label: "Schools", to: "/schools", icon: School },
  { label: "Teachers", to: "/teachers", icon: Users },
  { label: "Students", to: "/students", icon: GraduationCap },
  { label: "Assessments", to: "/assessments", icon: ClipboardCheck },
  {
    label: "AI Answer Key",
    to: "/answer-key-generator",
    icon: Wand,
    highlight: true,
  },
  { label: "Reports & Analytics", to: "/reports", icon: BarChart3 },
  {
    label: "User Management",
    icon: UserCog,
    children: [
      { label: "All Users", to: "/users" },
      { label: "State Admins", to: "/users?role=state_admin" },
      { label: "District Admins", to: "/users?role=district_admin" },
      { label: "School Admins", to: "/users?role=school" },
      { label: "Teachers", to: "/users?role=teacher" },
    ],
  },
  { label: "Audit Logs", to: "/audit-logs", icon: ScrollText },
  { label: "System Settings", to: "/settings", icon: Settings },
  { label: "Profile", to: "/profile", icon: UserCog },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(["User Management"]));

  function toggleGroup(label: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  }

  function isActive(to: string) {
    if (to === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(to);
  }

  return (
    <aside className="w-64 h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-slate-200 flex flex-col flex-shrink-0 overflow-y-auto">
      {/* Logo header */}
      <div className="h-16 flex items-center px-5 border-b border-slate-700/60 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 grid place-items-center mr-3 shadow-lg shadow-blue-500/30">
          <svg viewBox="0 0 16 16" fill="white" className="w-5 h-5">
            <path d="M8 1 2 4.5 8 8l6-3.5L8 1Zm0 7 6 3.5L8 15 2 11.5 8 8Z" />
          </svg>
        </div>
        <div>
          <p className="text-[15px] font-bold text-white tracking-tight">FLN Platform</p>
          <p className="text-[11px] text-slate-400 font-medium">National Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Main Menu
        </p>

        {NAV.map((item) => {
          if (item.children) {
            const open = openGroups.has(item.label);
            const groupActive = item.children.some((c) => isActive(c.to));
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleGroup(item.label)}
                  className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all ${
                    groupActive
                      ? "bg-slate-800 text-white"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${
                      groupActive ? "text-blue-400" : "text-slate-400 group-hover:text-slate-200"
                    }`} />
                    <span>{item.label}</span>
                  </div>
                  {open ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                {open && (
                  <div className="ml-4 mt-1 mb-1 space-y-0.5 border-l-2 border-slate-700 pl-3">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        className={({ isActive }) =>
                          `block px-3 py-2 rounded-md text-[13px] transition-all ${
                            isActive
                              ? "text-white bg-blue-500/15 font-semibold border-l-2 border-blue-400 -ml-[14px] pl-[14px]"
                              : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                          }`
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          const active = isActive(item.to!);
          const highlight = (item as any).highlight;

          return (
            <NavLink
              key={item.label}
              to={item.to!}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all ${
                  isActive
                    ? highlight
                      ? "bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-white border border-violet-400/30 shadow-lg shadow-violet-500/10"
                      : "bg-blue-500/15 text-white border-l-4 border-blue-400 pl-[10px]"
                    : highlight
                      ? "text-violet-200 hover:bg-violet-500/10 border border-violet-500/20"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.icon && (
                    <item.icon
                      className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${
                        isActive
                          ? highlight ? "text-violet-300" : "text-blue-400"
                          : highlight
                            ? "text-violet-400 group-hover:text-violet-300"
                            : "text-slate-400 group-hover:text-slate-200"
                      }`}
                    />
                  )}
                  <span className="flex-1">{item.label}</span>
                  {highlight && (
                    <Sparkles className="w-3.5 h-3.5 text-violet-300" />
                  )}
                  {isActive && !highlight && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}

        <div className="pt-3 mt-3 border-t border-slate-700/60">
          <button
            onClick={() => {
              localStorage.removeItem("fln_token");
              localStorage.removeItem("fln_user");
              window.location.href = "/login";
            }}
            className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-700/60 flex-shrink-0">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-slate-800/60">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 grid place-items-center text-white font-bold text-xs shadow-md">
            SA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-white truncate">Super Admin</p>
            <p className="text-[10px] text-slate-400 truncate">admin@fln.org</p>
          </div>
        </div>
        <p className="text-[10px] text-slate-500 text-center mt-3 font-medium">
          FLN v1.0 · 2025
        </p>
      </div>
    </aside>
  );
}
