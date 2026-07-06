import { Bell, Search } from "lucide-react";

export default function Header({ title, subtitle, announcement }) {
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
          <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
}