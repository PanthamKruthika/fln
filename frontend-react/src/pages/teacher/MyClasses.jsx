import { useEffect } from "react";
import { useOutletContext, Link } from "react-router-dom";
import {
  GraduationCap,
  Users,
  ChevronRight,
  TrendingUp,
  Layers,
} from "lucide-react";
import { classes } from "../../data/teacherData";

const levelColor = (score) =>
  score >= 80 ? "emerald"
    : score >= 70 ? "blue"
    : score >= 60 ? "amber"
    : "rose";

const statusFor = (score) =>
  score >= 80 ? { label: "On Track",   chip: "bg-emerald-50 text-emerald-700 ring-emerald-200" }
    : score >= 70 ? { label: "Steady",     chip: "bg-blue-50 text-blue-700 ring-blue-200" }
    : score >= 60 ? { label: "Watch",      chip: "bg-amber-50 text-amber-700 ring-amber-200" }
    : { label: "Needs Attention", chip: "bg-rose-50 text-rose-700 ring-rose-200" };

export default function MyClasses() {
  const { setPageMeta } = useOutletContext();
  useEffect(() => {
    setPageMeta({ title: "My Classes", subtitle: "All classes assigned to you" });
  }, [setPageMeta]);

  const totalStudents = classes.reduce((s, c) => s + c.students, 0);
  const avgAcrossClasses = Math.round(
    classes.reduce((s, c) => s + c.avgScore, 0) / classes.length,
  );

  return (
    <div className="space-y-6">
      {/* Compact page header summary */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            {classes.length} classes · {totalStudents} students
          </h2>
          <p className="text-sm text-slate-500">
            Class-average across your classes:{" "}
            <span className={`font-semibold text-${levelColor(avgAcrossClasses)}-600`}>
              {avgAcrossClasses}%
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs hover:bg-slate-50 inline-flex items-center gap-1.5">
            <Layers size={13} /> View as list
          </button>
          <Link
            to="/teacher/students"
            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700 inline-flex items-center gap-1.5"
          >
            <Users size={13} /> All Students
          </Link>
        </div>
      </div>

      {/* Class cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {classes.map((c) => <ClassCard key={c.id} cls={c} />)}
      </div>
    </div>
  );
}

function ClassCard({ cls }) {
  const tone = levelColor(cls.avgScore);
  const masteryPct = (parseFloat(cls.avgLevel.slice(1)) / 5) * 100;
  const status = statusFor(cls.avgScore);
  const accent = {
    emerald: "from-emerald-500 to-teal-500",
    blue:    "from-blue-500 to-indigo-500",
    amber:   "from-amber-500 to-orange-500",
    rose:    "from-rose-500 to-pink-500",
  }[tone];

  return (
    <article className="group relative bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      {/* Accent strip */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${accent}`} />

      <div className="p-6 pl-7">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-medium tracking-wide uppercase">Class</span>
              <span>·</span>
              <span>Section {cls.section}</span>
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 mt-1 leading-tight">
              {cls.name} <span className="text-slate-300 font-normal">·</span>{" "}
              <span className="text-slate-500">{cls.section}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">Taught by {cls.teacher}</p>
          </div>
          <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${status.chip}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {status.label}
          </span>
        </div>

        {/* Stat strip — clean, no boxes */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-y border-slate-100 py-4 my-2">
          <Metric icon={Users}      label="Students" value={cls.students} />
          <Metric label="Avg Score" value={`${cls.avgScore}%`} tone={tone} />
          <Metric label="FLN Level" value={cls.avgLevel} tone={tone} />
        </div>

        {/* Mastery bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="inline-flex items-center gap-1 text-slate-500">
              <TrendingUp size={12} /> Class mastery
            </span>
            <span className="font-semibold text-slate-700">{Math.round(masteryPct)}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${accent} transition-all duration-500`}
              style={{ width: `${masteryPct}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <Link to="/teacher/students" className="hover:text-blue-600">
              Roster
            </Link>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <Link to="/teacher/reports" className="hover:text-blue-600">
              Reports
            </Link>
          </div>
          <Link
            to={`/teacher/classes/${cls.id}`}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            Open Class
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function Metric({ icon: Icon, label, value, tone }) {
  const toneClass =
    tone === "emerald" ? "text-emerald-600"
      : tone === "blue"  ? "text-blue-600"
      : tone === "amber" ? "text-amber-600"
      : tone === "rose"  ? "text-rose-600"
      : "text-slate-900";

  return (
    <div className="px-4 first:pl-0 last:pr-0">
      <div className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-slate-500">
        {Icon ? <Icon size={11} /> : null}
        {label}
      </div>
      <div className={`mt-1 text-2xl font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}