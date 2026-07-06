import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  School,
  Users,
  FileText,
  ClipboardList,
  Upload,
  BarChart3,
  FileBarChart,
  Settings,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useLogout } from "../../contexts/AuthContext";
import { teacherProfile } from "../../data/teacherData";

const iconMap = {
  Home, School, Users, FileText, ClipboardList, Upload,
  BarChart3, FileBarChart, Settings, LogOut,
};

export default function TeacherSidebar({ collapsed, onToggle }) {
  const logout = useLogout();
  const [activeId, setActiveId] = useState("home");

  const items = [
    { id: "home",        label: "Dashboard",            icon: "Home",           path: "/teacher" },
    { id: "classes",     label: "My Classes",           icon: "School",         path: "/teacher/classes" },
    { id: "students",    label: "Students",             icon: "Users",          path: "/teacher/students" },
    { id: "worksheets",  label: "Practice Worksheets",  icon: "FileText",       path: "/teacher/worksheets" },
    { id: "assessments", label: "Assessments",          icon: "ClipboardList",  path: "/teacher/assessments" },
    { id: "upload",      label: "Upload Answer Scripts", icon: "Upload",         path: "/teacher/upload" },
    { id: "analytics",   label: "Analytics",            icon: "BarChart3",      path: "/teacher/analytics" },
    { id: "reports",     label: "Reports",              icon: "FileBarChart",   path: "/teacher/reports" },
    { id: "settings",    label: "Settings",             icon: "Settings",       path: "/teacher/settings" },
  ];

  return (
    <aside
      className={[
        "shrink-0 bg-white border-r border-slate-200 flex flex-col transition-all duration-200",
        collapsed ? "w-20" : "w-64",
      ].join(" ")}
    >
      {/* Brand */}
      <div className="px-4 py-5 border-b border-slate-200 flex items-center gap-2 overflow-hidden">
        <div className="w-9 h-9 rounded-lg bg-blue-600 text-white grid place-items-center font-bold shrink-0">
          F
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-semibold text-slate-900 leading-tight truncate">FLN Teacher</div>
            <div className="text-xs text-slate-500 truncate">AI-powered assessment</div>
          </div>
        )}
      </div>

      {/* School context (locked, no dropdown per spec) */}
      {!collapsed ? (
        <div className="px-4 py-3 bg-blue-50/60 border-b border-blue-100">
          <div className="text-[10px] uppercase tracking-wider text-blue-700 font-semibold">School</div>
          <div className="text-sm font-medium text-slate-900 truncate">{teacherProfile.school.name}</div>
          <div className="text-xs text-slate-500 truncate">{teacherProfile.school.address}</div>
        </div>
      ) : (
        <div className="px-4 py-3 bg-blue-50/60 border-b border-blue-100 grid place-items-center">
          <School size={18} className="text-blue-700" />
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = iconMap[item.icon];
          return (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === "/teacher"}
              onClick={() => setActiveId(item.id)}
              className={({ isActive }) =>
                [
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                ].join(" ")
              }
              title={collapsed ? item.label : undefined}
            >
              {Icon ? <Icon size={18} /> : null}
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}

        <button
          onClick={logout}
          title={collapsed ? "Logout" : undefined}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition"
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </nav>

      {/* Collapse toggle */}
      <div className="px-3 py-3 border-t border-slate-200">
        <button
          onClick={onToggle}
          className="w-full inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs text-slate-500 hover:bg-slate-100"
        >
          {collapsed ? <ChevronsRight size={16} /> : (
            <>
              <ChevronsLeft size={16} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}