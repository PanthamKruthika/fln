import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Download, Eye, RotateCcw, FileText, Plus } from "lucide-react";
import { worksheets, classes } from "../../data/teacherData";

export default function PracticeWorksheets() {
  const { setPageMeta } = useOutletContext();
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedStudents, setSelectedStudents] = useState([]);

  useEffect(() => {
    setPageMeta({ title: "Practice Worksheets", subtitle: "AI-personalized worksheets for learning" });
  }, [setPageMeta]);

  const filtered = selectedClass === "All" ? worksheets : worksheets.filter((w) => w.classId === selectedClass);

  return (
    <div className="space-y-6">
      {/* Generator card */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-1">
          <FileText size={18} className="text-blue-600" />
          <h3 className="font-semibold text-slate-900">Generate Personalized Worksheets</h3>
        </div>
        <p className="text-sm text-slate-500 mb-5">For learning and practice. Select a class and students to generate AI-personalized worksheets at each student's current FLN level.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Select Class">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            >
              <option value="All">All classes</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.section}</option>)}
            </select>
          </Field>

          <Field label="Select Students">
            <select
              multiple
              value={selectedStudents}
              onChange={(e) => setSelectedStudents(Array.from(e.target.selectedOptions, (o) => o.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm h-24"
            >
              {classes.find((c) => c.id === selectedClass)?.name || "Pick a class first"}
            </select>
          </Field>

          <div className="flex flex-col justify-end gap-2">
            <button className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 inline-flex items-center justify-center gap-2">
              <Plus size={14} /> Generate Worksheets
            </button>
            <button className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-50">
              Preview Sample
            </button>
          </div>
        </div>
      </section>

      {/* Worksheet history table */}
      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">Worksheet History</h3>
            <p className="text-xs text-slate-500">{filtered.length} worksheets generated</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3">Student</th>
                <th className="text-left px-5 py-3">Worksheet ID</th>
                <th className="text-left px-5 py-3">Generated Date</th>
                <th className="text-left px-5 py-3">Level</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((w) => (
                <tr key={w.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-5 py-3 font-medium text-slate-900">{w.student}</td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-700">{w.id}</td>
                  <td className="px-5 py-3 text-slate-700">{w.generatedAt}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">{w.level}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={[
                      "px-2 py-0.5 rounded-md text-xs font-medium",
                      w.status === "Completed" ? "bg-emerald-50 text-emerald-700"
                        : w.status === "Printed" ? "bg-violet-50 text-violet-700"
                        : w.status === "Downloaded" ? "bg-blue-50 text-blue-700"
                        : "bg-amber-50 text-amber-700",
                    ].join(" ")}>{w.status}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <button title="Preview" className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100"><Eye size={14} /></button>
                      <button title="Download" className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50"><Download size={14} /></button>
                      <button title="Regenerate" className="p-1.5 rounded-md text-amber-600 hover:bg-amber-50"><RotateCcw size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}