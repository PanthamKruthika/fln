import { useEffect, useState } from "react";
import { useParams, useOutletContext, Link } from "react-router-dom";
import { Users, GraduationCap, ClipboardList, FileText, ArrowLeft } from "lucide-react";
import { classes, students, studentDetail } from "../../data/teacherData";

const tabs = ["Students", "Worksheets", "Assessments", "Reports", "Analytics"];

export default function ClassDetail() {
  const { classId } = useParams();
  const { setPageMeta } = useOutletContext();
  const [activeTab, setActiveTab] = useState("Students");

  const cls = classes.find((c) => c.id === classId);
  const classStudents = students.filter((s) => s.classId === classId);

  useEffect(() => {
    if (cls) {
      setPageMeta({
        title: `${cls.name} · Section ${cls.section}`,
        subtitle: `${cls.students} students · ${cls.teacher}`,
      });
    }
  }, [cls, setPageMeta]);

  if (!cls) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
        <p className="text-slate-500">Class not found.</p>
        <Link to="/teacher/classes" className="text-blue-600 hover:text-blue-700 mt-3 inline-block">
          ← Back to My Classes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/teacher/classes"
        className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={14} /> Back to My Classes
      </Link>

      {/* Class info card */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-700 grid place-items-center">
              <GraduationCap size={24} />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500">Section {cls.section}</div>
              <h2 className="text-2xl font-semibold text-slate-900">{cls.name}</h2>
              <p className="text-sm text-slate-500 mt-0.5">Teacher: {cls.teacher}</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 text-center">
            <Mini label="Students" value={cls.students} icon={Users} />
            <Mini label="Avg Score" value={`${cls.avgScore}%`} color="text-blue-600" />
            <Mini label="Avg Level" value={cls.avgLevel} color="text-violet-600" />
            <Mini label="Latest Assessment" value="Mid-Year 2025" />
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 px-2">
          <nav className="flex overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={[
                  "px-4 py-3 text-sm font-medium border-b-2 -mb-px transition whitespace-nowrap",
                  activeTab === t
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-slate-500 hover:text-slate-800",
                ].join(" ")}
              >
                {t}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "Students" && <StudentsTab rows={classStudents} />}
          {activeTab === "Worksheets" && <SimpleTab rows={classStudents} icon={FileText} emptyLabel="No worksheets yet" />}
          {activeTab === "Assessments" && <SimpleTab rows={classStudents} icon={ClipboardList} emptyLabel="No assessments yet" />}
          {activeTab === "Reports" && <SimpleTab rows={classStudents} icon={FileText} emptyLabel="No reports yet" />}
          {activeTab === "Analytics" && <SimpleTab rows={classStudents} icon={FileText} emptyLabel="Analytics coming soon" />}
        </div>
      </div>
    </div>
  );
}

function StudentsTab({ rows }) {
  return (
    <table className="w-full text-sm">
      <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
        <tr>
          <th className="text-left px-4 py-3">Student ID</th>
          <th className="text-left px-4 py-3">Name</th>
          <th className="text-left px-4 py-3">Level</th>
          <th className="text-right px-4 py-3">Latest Score</th>
          <th className="text-left px-4 py-3">Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((s) => (
          <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50/50">
            <td className="px-4 py-3 font-mono text-xs text-slate-600">{s.id}</td>
            <td className="px-4 py-3">
              <Link to={`/teacher/students/${s.id}`} className="font-medium text-blue-600 hover:underline">
                {s.name}
              </Link>
            </td>
            <td className="px-4 py-3 text-slate-700">{s.level}</td>
            <td className="px-4 py-3 text-right text-slate-700">{s.score}%</td>
            <td className="px-4 py-3">
              <span className={[
                "px-2 py-0.5 rounded-md text-xs font-medium",
                s.status === "On Track" ? "bg-emerald-50 text-emerald-700"
                  : s.status === "Needs Help" ? "bg-amber-50 text-amber-700"
                  : "bg-rose-50 text-rose-700",
              ].join(" ")}>{s.status}</span>
            </td>
          </tr>
        ))}
        {rows.length === 0 ? (
          <tr><td colSpan={5} className="text-center py-10 text-slate-400">No students in this class.</td></tr>
        ) : null}
      </tbody>
    </table>
  );
}

function SimpleTab({ rows, icon: Icon, emptyLabel }) {
  return (
    <div className="text-center py-12">
      <div className="w-14 h-14 mx-auto rounded-xl bg-slate-50 text-slate-400 grid place-items-center">
        <Icon size={22} />
      </div>
      <p className="text-slate-500 mt-3">{emptyLabel}</p>
      <p className="text-xs text-slate-400 mt-1">({rows.length} students in this class)</p>
    </div>
  );
}

function Mini({ icon: Icon, label, value, color }) {
  return (
    <div className="text-left">
      <div className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1">
        {Icon ? <Icon size={11} /> : null} {label}
      </div>
      <div className={`text-base font-semibold ${color || "text-slate-900"} mt-0.5`}>{value}</div>
    </div>
  );
}