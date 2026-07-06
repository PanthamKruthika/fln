import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  GraduationCap,
  ClipboardList,
  CheckCircle2,
  FileText,
  HeartHandshake,
  TrendingUp,
  BarChart3,
  ChevronRight,
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

export default function TeacherHome() {
  useEffect(() => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    // (called from render via Outlet context in real apps; here we just set title)
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-sm">
        <div className="text-xs uppercase tracking-wider text-blue-100 mb-1">
          Welcome back
        </div>
        <h2 className="text-2xl font-semibold">Good morning, Anjali 👋</h2>
        <p className="text-blue-100 mt-1">
          Here's what's happening with your classes today.
        </p>
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">My Classes</h3>
            <p className="text-sm text-slate-500">Quick view of all classes you teach.</p>
          </div>
          <Link
            to="/teacher/classes"
            className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            View all <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {classes.map((c) => (
            <ClassCard key={c.id} cls={c} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ClassCard({ cls }) {
  const scoreColor =
    cls.avgScore >= 80 ? "text-emerald-600"
      : cls.avgScore >= 70 ? "text-blue-600"
      : cls.avgScore >= 60 ? "text-amber-600"
      : "text-rose-600";

  return (
    <article className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wider">{cls.teacher}</div>
          <h4 className="text-lg font-semibold text-slate-900 mt-0.5">
            {cls.name} <span className="text-slate-400">· Section {cls.section}</span>
          </h4>
        </div>
        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 grid place-items-center">
          <GraduationCap size={18} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-slate-50 py-2">
          <div className="text-lg font-semibold text-slate-900">{cls.students}</div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Students</div>
        </div>
        <div className="rounded-lg bg-slate-50 py-2">
          <div className={`text-lg font-semibold ${scoreColor}`}>{cls.avgScore}%</div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Avg Score</div>
        </div>
        <div className="rounded-lg bg-slate-50 py-2">
          <div className="text-lg font-semibold text-slate-900">{cls.avgLevel}</div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">FLN Level</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">
          {cls.pendingAssessments} pending assessment{cls.pendingAssessments === 1 ? "" : "s"}
        </span>
        <Link
          to={`/teacher/classes/${cls.id}`}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Open →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <Link
          to={`/teacher/classes/${cls.id}`}
          className="text-center px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 hover:bg-slate-50"
        >
          View Class
        </Link>
        <Link
          to="/teacher/worksheets"
          className="text-center px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700"
        >
          Generate Worksheets
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Link
          to="/teacher/assessments"
          className="text-center px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 hover:bg-slate-50"
        >
          Create Assessment
        </Link>
        <Link
          to="/teacher/upload"
          className="text-center px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 hover:bg-slate-50"
        >
          Upload Scripts
        </Link>
      </div>
    </article>
  );
}