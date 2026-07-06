import { useEffect, useState } from "react";
import { useParams, useOutletContext, Link } from "react-router-dom";
import { Users, GraduationCap, ClipboardList, FileText, ArrowLeft, Download, Eye } from "lucide-react";
import { classes, students, worksheets, assessments, studentDetail } from "../../data/teacherData";

const tabs = ["Students", "Question Papers", "Assessments", "Reports", "Analytics"];

const handleDownload = (label, id) => {
  console.log(`[download-question-paper] ${id}`);
  alert(`Downloading question paper for:\n${label}`);
};

export default function ClassDetail() {
  const { classId } = useParams();
  const { setPageMeta } = useOutletContext();
  const [activeTab, setActiveTab] = useState("Students");

  const cls = classes.find((c) => c.id === classId);
  const classStudents = students.filter((s) => s.classId === classId);
  const classWorksheets = worksheets.filter((w) => w.classId === classId);
  const classAssessments = assessments.filter((a) => a.className.includes(cls?.name ?? ""));

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
      <Link to="/teacher/classes" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft size={14} /> Back to My Classes
      </Link>

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
          {activeTab === "Students"     && <StudentsTab rows={classStudents} />}
          {activeTab === "Question Papers" && <QuestionPapersTab rows={classWorksheets} />}
          {activeTab === "Assessments"  && <AssessmentsTab rows={classAssessments} />}
          {activeTab === "Reports"      && <EmptyTab icon={FileText}      label="No reports yet — generate one from the Reports page." />}
          {activeTab === "Analytics"    && <EmptyTab icon={BarChartIcon}  label="Class analytics — view on the Analytics page." />}
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
              <Link to={`/teacher/students/${s.id}`} className="font-medium text-blue-600 hover:underline">{s.name}</Link>
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

function QuestionPapersTab({ rows }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">{rows.length} question papers generated for this class.</p>
        <Link to="/teacher/worksheets" className="text-xs text-blue-600 hover:text-blue-700">Generate new →</Link>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
          <tr>
            <th className="text-left px-4 py-3">Worksheet ID</th>
            <th className="text-left px-4 py-3">Student</th>
            <th className="text-left px-4 py-3">Generated</th>
            <th className="text-left px-4 py-3">Level</th>
            <th className="text-left px-4 py-3">Status</th>
            <th className="text-right px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((w) => (
            <tr key={w.id} className="border-t border-slate-100 hover:bg-slate-50/50">
              <td className="px-4 py-3 font-mono text-xs text-slate-700">{w.id}</td>
              <td className="px-4 py-3 font-medium text-slate-900">{w.student}</td>
              <td className="px-4 py-3 text-slate-700">{w.generatedAt}</td>
              <td className="px-4 py-3">
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">{w.level}</span>
              </td>
              <td className="px-4 py-3">
                <span className={[
                  "px-2 py-0.5 rounded-md text-xs font-medium",
                  w.status === "Completed" ? "bg-emerald-50 text-emerald-700"
                    : w.status === "Printed" ? "bg-violet-50 text-violet-700"
                    : w.status === "Downloaded" ? "bg-blue-50 text-blue-700"
                    : "bg-amber-50 text-amber-700",
                ].join(" ")}>{w.status}</span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => handleDownload(`${w.student} · ${w.id}`, w.id)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
                >
                  <Download size={12} /> Download
                </button>
              </td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr><td colSpan={6} className="text-center py-10 text-slate-400">No question papers yet for this class.</td></tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

function AssessmentsTab({ rows }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">{rows.length} assessments for this class.</p>
        <Link to="/teacher/assessments" className="text-xs text-blue-600 hover:text-blue-700">All assessments →</Link>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
          <tr>
            <th className="text-left px-4 py-3">Assessment</th>
            <th className="text-left px-4 py-3">Date</th>
            <th className="text-left px-4 py-3">Status</th>
            <th className="text-right px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.id} className="border-t border-slate-100 hover:bg-slate-50/50">
              <td className="px-4 py-3 font-medium text-slate-900">{a.name}</td>
              <td className="px-4 py-3 text-slate-700">{a.date}</td>
              <td className="px-4 py-3">
                <span className={[
                  "px-2 py-0.5 rounded-md text-xs font-medium",
                  a.status === "Completed" ? "bg-emerald-50 text-emerald-700"
                    : a.status === "Scheduled" ? "bg-blue-50 text-blue-700"
                    : "bg-amber-50 text-amber-700",
                ].join(" ")}>{a.status}</span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => handleDownload(`${a.name} · ${a.className}`, a.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
                >
                  <Download size={13} /> Download Question Paper
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyTab({ icon: Icon, label }) {
  return (
    <div className="text-center py-12">
      <div className="w-14 h-14 mx-auto rounded-xl bg-slate-50 text-slate-400 grid place-items-center">
        <Icon size={22} />
      </div>
      <p className="text-slate-500 mt-3">{label}</p>
    </div>
  );
}

const BarChartIcon = ClipboardList;

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