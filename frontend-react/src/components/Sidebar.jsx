import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FileText,
  ScanLine,
  BarChart3,
  Ticket,
  Settings,
  LogOut,
  Bell,
} from "lucide-react";

const iconMap = {
  LayoutDashboard,
  Users,
  ClipboardList,
  FileText,
  ScanLine,
  BarChart3,
  Ticket,
  Settings,
  LogOut,
  Bell,
};

export default function Sidebar({ items, activeId, onSelect, user }) {
  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col">
      <div className="px-6 py-5 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white grid place-items-center font-bold">
            F
          </div>
          <div>
            <div className="font-semibold text-slate-900 leading-tight">FLN Platform</div>
            <div className="text-xs text-slate-500">Teacher Console</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = iconMap[item.icon];
          const active = item.id === activeId;
          return (
            <button
              key={item.id}
              onClick={() => onSelect?.(item.id)}
              className={[
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition",
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              ].join(" ")}
            >
              {Icon ? <Icon size={18} /> : null}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-200">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 rounded-full bg-slate-200 grid place-items-center text-slate-700 text-sm font-semibold">
            {user?.avatar ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-900 truncate">{user?.name}</div>
            <div className="text-xs text-slate-500 truncate">{user?.email}</div>
          </div>
          <button
            title="Logout"
            className="p-2 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export { iconMap };