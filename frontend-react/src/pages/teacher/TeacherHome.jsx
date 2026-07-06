import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  GraduationCap,
  ClipboardList,
  FileText,
  BarChart3,
  HeartHandshake,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { summaryCards, classes } from "../../data/teacherData";

const iconMap = {
  classes: GraduationCap,
  students: Users,
  pending: ClipboardList,
  completed: CheckCircle2,
  worksheets: FileText,
  support: HeartHandshake,
  score: TrendingUp,
  fln: BarChart3,
};

const tone = (score) =>
  score >= 80 ? "emerald"
    : score >= 70 ? "blue"
    : score >= 60 ? "amber"
    : "rose";

const toneText = {
  emerald: "text-emerald-600",
  blue:    "text-blue-600",
  amber:   "text-amber-600",
  rose:    "text-rose-600",
};

const toneBg = {
  emerald: "bg-emerald-500",
  blue:    "bg-blue-500",
  amber:   "bg-amber-500",
  rose:    "bg-rose-500",
};

const statusFor = (score) =>
  score >= 80 ? { label: "On Track", chip: "bg-emerald-50 text-emerald-700" }
    : score >= 70 ? { label: "Steady",   chip: "bg-blue-50 text-blue-700" }
    : score >= 60 ? { label: "Watch",    chip: "bg-amber-50 text-amber-700" }
    : { label: "Needs Attention", chip: "bg-rose-50 text-rose-700" };

export default function TeacherHome() {
  useEffect(() => {}, []);

  return (
    <div className="space-y-8">
      {/* Welcome banner — small, calm */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Good morning, Anjali.
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Here's what's happening across your classes today.
        </p>
      </div>

      {/* Summary cards — 4x2 grid, lighter weight */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {summaryCards.map((c) => {
            const Icon = iconMap[c.id];
            return (
              <div
                key={c.id}
                className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition"
              >
                <div className={`w-9 h-9 rounded-lg grid place-items-center ${c.color}`}>
                  {Icon ? <Icon size={16} /> : null}
                </div>
                <div className="mt-3 text-2xl font-semibold text-slate-900 leading-none">{c.value}</div>
                <div className="text-sm text-slate-600 mt-1.5">{c.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* My Classes — clean row list */}
      <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">My Classes</h2>
            <p className="text-xs text-slate-500">{classes.length} classes · {classes.reduce((s, c) => s + c.students, 0)} students total</p>
          </div>
          <Link
            to="/teacher/classes"
            className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 font-medium"
          >
            View all <ChevronRight size={14} />
          </Link>
        </div>

        {/* Column header (hidden on small screens) */}
        <div className="hidden md:grid grid-cols-[1.6fr_0.7fr_0.7fr_0.7fr_0.9fr_0.4fr] gap-4 px-6 py-3 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100 bg-slate-50/50">
          <div>Class</div>
          <div className="text-center">Students</div>
          <div className="text-center">Avg Score</div>
          <div className="text-center">FLN Level</div>
          <div>Status</div>
          <div className="text-right">Open</div>
        </div>

        <ul className="divide-y divide-slate-100">
          {classes.map((c) => <ClassRow key={c.id} cls={c} />)}
        </ul>
      </section>
    </div>
  );
}

function ClassRow({ cls }) {
  const t = tone(cls.avgScore);
  const status = statusFor(cls.avgScore);

  return (
    <li className="px-6 py-3.5 hover:bg-slate-50/60 transition">
      <Link
        to={`/teacher/classes/${cls.id}`}
        className="grid grid-cols-[1fr_auto] md:grid-cols-[1.6fr_0.7fr_0.7fr_0.7fr_0.9fr_0.4fr] gap-4 items-center"
      >
        {/* Class */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${toneBg[t]}`} />
            <span className="text-sm font-medium text-slate-900 truncate">
              {cls.name}
            </span>
            <span className="text-xs text-slate-400">· Section {cls.section}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 md:hidden">
            {cls.students} students · {cls.avgScore}% · {cls.avgLevel}
          </div>
        </div>

        {/* Students */}
        <div className="hidden md:flex justify-center items-center text-sm text-slate-700">
          <Users size={13} className="text-slate-400 mr-1.5" />
          {cls.students}
        </div>

        {/* Avg Score */}
        <div className={`hidden md:block text-center text-sm font-semibold ${toneText[t]}`}>
          {cls.avgScore}%
        </div>

        {/* Level */}
        <div className={`hidden md:block text-center text-sm font-medium ${toneText[t]}`}>
          {cls.avgLevel}
        </div>

        {/* Status */}
        <div className="hidden md:block">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${status.chip}`}>
            {status.label}
          </span>
        </div>

        {/* Open */}
        <div className="text-right">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition">
            <ArrowUpRight size={14} />
          </span>
        </div>
      </Link>
    </li>
  );
}