import { Bell, Search, Calendar } from "lucide-react";
import { teacherProfile } from "../../data/teacherData";

export default function TeacherTopbar({ pageTitle, pageSubtitle }) {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "short", year: "numeric",
  });

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-semibold text-slate-900 truncate">{pageTitle}</h1>
        {pageSubtitle ? (
          <p className="text-sm text-slate-500 truncate">{pageSubtitle}</p>
        ) : null}
      </div>

      <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg w-72">
        <Search size={16} className="text-slate-400" />
        <input
          type="text"
          placeholder="Search students, worksheets, assessments..."
          className="bg-transparent outline-none text-sm flex-1"
        />
      </div>

      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
        <Calendar size={14} className="text-slate-400" />
        {today}
      </div>

      <button
        className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600"
        aria-label="Notifications"
      >
        <Bell size={18} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
      </button>

      <div className="flex items-center gap-2 pl-3 ml-1 border-l border-slate-200">
        <div className="w-9 h-9 rounded-full bg-blue-600 text-white grid place-items-center font-semibold text-sm">
          {teacherProfile.avatar}
        </div>
        <div className="hidden sm:block text-right leading-tight">
          <div className="text-sm font-medium text-slate-900">{teacherProfile.name}</div>
          <div className="text-xs text-slate-500">{teacherProfile.role}</div>
        </div>
      </div>
    </header>
  );
}