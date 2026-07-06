import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  GraduationCap,
  ClipboardList,
  FileText,
  BarChart3,
  AlertTriangle,
  HeartHandshake,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  Sparkles,
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

const levelColor = (score) =>
  score >= 80 ? "emerald"
    : score >= 70 ? "blue"
    : score >= 60 ? "amber"
    : "rose";

const statusFor = (score) =>
  score >= 80 ? { label: "On Track", chip: "bg-emerald-50 text-emerald-700 ring-emerald-200" }
    : score >= 70 ? { label: "Steady",   chip: "bg-blue-50 text-blue-700 ring-blue-200" }
    : score >= 60 ? { label: "Watch",    chip: "bg-amber-50 text-amber-700 ring-amber-200" }
    : { label: "Needs Attention", chip: "bg-rose-50 text-rose-700 ring-rose-200" };

const toneText = {
  emerald: "text-emerald-600",
  blue:    "text-blue-600",
  amber:   "text-amber-600",
  rose:    "text-rose-600",
};
const toneBg = {
  emerald: "from-emerald-500 to-teal-500",
  blue:    "from-blue-500 to-indigo-500",
  amber:   "from-amber-500 to-orange-500",
  rose:    "from-rose-500 to-pink-500",
};

export default function TeacherHome() {
  useEffect(() => {
    // intentionally empty — page title is already set by Topbar
  }, []);

  const focusClass = [...classes].sort((a, b) => a.avgScore - b.avgScore)[0];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-sm">
        <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_top_right,white,transparent_60%)]" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-blue-100 mb-1">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </div>
            <h2 className="text-2xl font-semibold">Good morning, Anjali 👋</h2>
            <p className="text-blue-100 mt-1">
              Here's what's happening with your classes today.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-white/15 backdrop-blur text-sm">
            <Sparkles size={16} />
            <span>3 new AI insights available</span>
          </div>
        </div>
      </div>

      {/* 8 summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((c) => {
          const Icon = iconMap[c.id];
          return (
            <div
              key={c.id}
              className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-3 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-lg grid place-items-center ${c.color}`}>
                  {Icon ? <Icon size={18} /> : null}
                </div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-slate-900">{c.value}</div>
                <div className="text-sm text-slate-600">{c.label}</div>
              </div>
              <div className="text-xs text-slate-400">{c.trend}</div>
            </div>
          );
        })}
      </div>

      {/* My Classes */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">My Classes</h3>
            <p className="text-sm text-slate-500">Quick view of all classes you teach.</p>
          </div>
          <div className="flex items-center gap-3">
            {focusClass && (
              <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
                <AlertTriangle size={12} />
                Needs attention: {focusClass.name} · Section {focusClass.section} ({focusClass.avgScore}%)
              </span>
            )}
            <Link
              to="/teacher/classes"
              className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 font-medium"
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {classes.map((c) => <ClassCard key={c.id} cls={c} />)}
        </div>
      </section>
    </div>
  );
}

function ClassCard({ cls }) {
  const tone = levelColor(cls.avgScore);
  const status = statusFor(cls.avgScore);
  const masteryPct = (parseFloat(cls.avgLevel.slice(1)) / 5) * 100;

  return (
    <article className="group relative bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${toneBg[tone]}`} />

      <div className="p-5 pl-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wider text-slate-500">Class · Section {cls.section}</div>
            <h4 className="text-lg font-semibold text-slate-900 mt-0.5 leading-tight truncate">
              {cls.name}
            </h4>
          </div>
          <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ring-1 ${status.chip}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {status.label}
          </span>
        </div>

        {/* Metric row */}
        <div className="flex items-center gap-4 text-sm">
          <Metric icon={Users}  label="Students" value={cls.students} />
          <span className="w-px h-7 bg-slate-100" />
          <Metric label="Avg"      value={`${cls.avgScore}%`} tone={tone} />
          <span className="w-px h-7 bg-slate-100" />
          <Metric label="Level"    value={cls.avgLevel} tone={tone} />
        </div>

        {/* Mastery */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-slate-500">Mastery</span>
            <span className="font-semibold text-slate-700">{Math.round(masteryPct)}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${toneBg[tone]} transition-all duration-500`}
              style={{ width: `${masteryPct}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <Link
            to="/teacher/worksheets"
            className="text-[11px] text-slate-500 hover:text-blue-600 inline-flex items-center gap-1"
          >
            <FileText size={11} /> Generate
          </Link>
          <Link
            to={`/teacher/classes/${cls.id}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 text-white text-xs font-medium hover:bg-blue-600 transition-colors"
          >
            Open
            <ChevronRight size={12} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function Metric({ icon: Icon, label, value, tone }) {
  return (
    <div className="flex-1">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-500">
        {Icon ? <Icon size={10} /> : null}
        {label}
      </div>
      <div className={`mt-0.5 text-base font-semibold ${tone ? toneText[tone] : "text-slate-900"}`}>
        {value}
      </div>
    </div>
  );
}