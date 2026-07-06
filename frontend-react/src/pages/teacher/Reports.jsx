import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { FileText, Download } from "lucide-react";

const reportTypes = [
  {
    id: "student-progress",
    title: "Student Progress Report",
    description: "Individual student's FLN level, competency mastery, and assessment history.",
    icon: "User",
  },
  {
    id: "class",
    title: "Class Report",
    description: "Class-level mastery overview, top performers, and students needing support.",
    icon: "Users",
  },
  {
    id: "assessment",
    title: "Assessment Report",
    description: "Detailed score breakdown per question and competency for an assessment.",
    icon: "ClipboardList",
  },
  {
    id: "competency",
    title: "Competency Report",
    description: "Mastery distribution per competency across all your students.",
    icon: "BarChart3",
  },
  {
    id: "monthly",
    title: "Monthly Report",
    description: "Month-over-month trends in scores, attendance, and worksheet generation.",
    icon: "Calendar",
  },
];

export default function Reports() {
  const { setPageMeta } = useOutletContext();

  useEffect(() => {
    setPageMeta({ title: "Reports", subtitle: "Generate and export reports for your classes" });
  }, [setPageMeta]);

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportTypes.map((r) => (
          <article key={r.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 grid place-items-center shrink-0">
                <FileText size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900">{r.title}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{r.description}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <select className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                <option>Select class...</option>
                <option>Class 2A</option>
                <option>Class 2B</option>
                <option>Class 3A</option>
                <option>Class 3B</option>
              </select>
              <button className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                <Download size={14} /> PDF
              </button>
              <button className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-50">
                <Download size={14} /> Excel
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}