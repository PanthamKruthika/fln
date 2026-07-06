import { useEffect } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { Plus, Calendar, Eye, Upload, BarChart3 } from "lucide-react";
import { assessments } from "../../data/teacherData";

export default function Assessments() {
  const { setPageMeta } = useOutletContext();

  useEffect(() => {
    setPageMeta({ title: "Assessments", subtitle: "Schedule, conduct, and review assessments" });
  }, [setPageMeta]);

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl border border-slate-200 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-900">Assessment Cycles</h3>
          <p className="text-sm text-slate-500">Baseline · Mid-Year · End-Year. Conduct each cycle for all students in your assigned classes.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 inline-flex items-center gap-2">
            <Plus size={14} /> Create Assessment
          </button>
          <button className="px-3 py-2 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-50 inline-flex items-center gap-2">
            <Calendar size={14} /> Schedule
          </button>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">All Assessments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3">Assessment</th>
                <th className="text-left px-5 py-3">Class</th>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-right px-5 py-3">Expected</th>
                <th className="text-right px-5 py-3">Completed</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((a) => {
                const completionPct = a.expected ? Math.round((a.completed / a.expected) * 100) : 0;
                return (
                  <tr key={a.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="px-5 py-3 font-medium text-slate-900">{a.name}</td>
                    <td className="px-5 py-3 text-slate-700">{a.className}</td>
                    <td className="px-5 py-3 text-slate-700">{a.date}</td>
                    <td className="px-5 py-3">
                      <span className={[
                        "px-2 py-0.5 rounded-md text-xs font-medium",
                        a.status === "Completed" ? "bg-emerald-50 text-emerald-700"
                          : a.status === "Scheduled" ? "bg-blue-50 text-blue-700"
                          : "bg-amber-50 text-amber-700",
                      ].join(" ")}>{a.status}</span>
                    </td>
                    <td className="px-5 py-3 text-right text-slate-700">{a.expected}</td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-slate-700">{a.completed}</span>
                      <span className="text-slate-400 ml-1">({completionPct}%)</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button title="View" className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100"><Eye size={14} /></button>
                        {a.status !== "Scheduled" && (
                          <Link to="/teacher/upload" className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50" title="Upload Scripts">
                            <Upload size={14} />
                          </Link>
                        )}
                        <button title="Results" className="p-1.5 rounded-md text-violet-600 hover:bg-violet-50"><BarChart3 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}