import { useEffect } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { GraduationCap, Users, FileText, ClipboardList } from "lucide-react";
import { classes } from "../../data/teacherData";

export default function MyClasses() {
  const { setPageMeta } = useOutletContext();
  useEffect(() => {
    setPageMeta({ title: "My Classes", subtitle: "All classes assigned to you" });
  }, [setPageMeta]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
        {classes.map((c) => {
          const scoreColor =
            c.avgScore >= 80 ? "text-emerald-600"
              : c.avgScore >= 70 ? "text-blue-600"
              : c.avgScore >= 60 ? "text-amber-600"
              : "text-rose-600";
          return (
            <article key={c.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500">Section {c.section}</div>
                  <h3 className="text-2xl font-semibold text-slate-900 mt-1">
                    {c.name} <span className="text-slate-400">· {c.section}</span>
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">Taught by {c.teacher}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 grid place-items-center">
                  <GraduationCap size={22} />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 text-center">
                <Stat icon={Users}          label="Students"   value={c.students} />
                <Stat label="Avg Score"     value={`${c.avgScore}%`} color={scoreColor} />
                <Stat icon={ClipboardList}  label="Assessments" value={4} />
                <Stat icon={FileText}       label="Worksheets"  value={32} />
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Class Average Mastery</span>
                  <span>{c.avgLevel}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${(parseFloat(c.avgLevel.slice(1)) / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <Link
                  to={`/teacher/classes/${c.id}`}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                >
                  Open Class →
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-lg bg-slate-50 py-2.5">
      <div className={`text-lg font-semibold ${color || "text-slate-900"}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
    </div>
  );
}