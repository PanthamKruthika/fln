import { useEffect } from "react";
import { useParams, useOutletContext, Link } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Cake,
  User,
  BookOpen,
  Award,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Download,
} from "lucide-react";
import { studentDetail } from "../../data/teacherData";
import { competencyColors } from "../../data/teacherData";

export default function StudentProfile() {
  const { studentId } = useParams();
  const { setPageMeta } = useOutletContext();
  const s = studentDetail(studentId);

  useEffect(() => {
    setPageMeta({ title: s.name, subtitle: `${s.id} · Roll ${s.roll} · ${s.classId}` });
  }, [s, setPageMeta]);

  const initials = s.name.split(" ").map((p) => p[0]).slice(0, 2).join("");

  return (
    <div className="space-y-6">
      <Link to="/teacher/students" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft size={14} /> Back to Students
      </Link>

      {/* Header card */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-blue-100 text-blue-700 grid place-items-center text-2xl font-bold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-semibold text-slate-900">{s.name}</h2>
            <div className="text-sm text-slate-500 mt-1 font-mono">{s.id}</div>
            <div className="flex flex-wrap gap-3 mt-4 text-xs text-slate-600">
              <Tag icon={Cake}     label="Age"        value={`${s.age} yrs`} />
              <Tag icon={User}     label="Gender"     value={s.gender} />
              <Tag icon={BookOpen} label="Class"      value={s.classId} />
              <Tag icon={TrendingUp} label="Attendance" value={s.attendance} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">Current</div>
              <div className="text-xl font-semibold text-blue-600">{s.currentLevel}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">Target</div>
              <div className="text-xl font-semibold text-violet-600">{s.targetLevel}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">Progress</div>
              <div className="text-xl font-semibold text-emerald-600">{s.progress}%</div>
            </div>
          </div>
        </div>
      </section>

      {/* Competency Analysis */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900">Competency Analysis</h3>
            <p className="text-xs text-slate-500">Mastery per competency, derived from the latest assessment.</p>
          </div>
          <Award size={18} className="text-blue-600" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
          {s.competencies.map((c) => {
            const color = competencyColors[c.name] || "bg-blue-500";
            const tone = c.mastery >= 75 ? "text-emerald-600" : c.mastery >= 50 ? "text-amber-600" : "text-rose-600";
            return (
              <div key={c.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{c.name}</span>
                  <span className={`font-semibold ${tone}`}>{c.mastery}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${c.mastery}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* AI Insights */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-blue-600" />
          <h3 className="font-semibold text-slate-900">AI Insights</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
            <div className="text-xs uppercase tracking-wider text-emerald-700 font-semibold mb-2">Strengths</div>
            <ul className="space-y-1.5 text-sm text-slate-800">
              {s.aiInsights.strengths.map((x) => (
                <li key={x} className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  {x}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
            <div className="text-xs uppercase tracking-wider text-amber-700 font-semibold mb-2">Weaknesses</div>
            <ul className="space-y-1.5 text-sm text-slate-800">
              {s.aiInsights.weaknesses.map((x) => (
                <li key={x} className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-600" />
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/50 p-4">
          <div className="text-xs uppercase tracking-wider text-blue-700 font-semibold mb-2">Recommendations</div>
          <ul className="space-y-1.5 text-sm text-slate-800">
            {s.aiInsights.recommendations.map((x) => (
              <li key={x} className="flex items-start gap-2">
                <Sparkles size={14} className="text-blue-600 mt-0.5 shrink-0" />
                {x}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Assessment + Worksheet History in two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HistoryCard
          title="Assessment History"
          columns={["Assessment", "Date", "Score", "Level", "Status"]}
          rows={s.assessmentHistory.map((r) => [r.name, r.date, r.score ?? "—", r.level, r.status])}
          statusRow={(val) => val === "Completed" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}
        />
        <HistoryCard
          title="Worksheet History"
          columns={["Worksheet", "Generated", "Difficulty", "Completed", "Accuracy"]}
          rows={s.worksheetHistory.map((r) => [r.id, r.generatedAt, r.difficulty, r.completed ? "Yes" : "No", r.accuracy != null ? `${r.accuracy}%` : "—"])}
          statusRow={() => ""}
        />
      </div>
    </div>
  );
}

function Tag({ icon: Icon, label, value }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200">
      <Icon size={12} className="text-slate-400" />
      <span className="text-slate-500">{label}:</span>
      <span className="font-medium text-slate-800">{value}</span>
    </span>
  );
}

function HistoryCard({ title, columns, rows, statusRow }) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <button className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
          <Download size={12} /> Export
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
            <tr>{columns.map((c) => <th key={c} className="text-left px-4 py-2.5">{c}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-slate-100">
                {r.map((cell, j) => {
                  const last = j === r.length - 1;
                  return (
                    <td key={j} className="px-4 py-2.5">
                      {last && statusRow(cell) ? (
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${statusRow(cell)}`}>{cell}</span>
                      ) : (
                        <span className="text-slate-700">{cell}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}