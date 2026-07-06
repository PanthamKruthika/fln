import { useEffect } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { Calendar, Eye, Download, BarChart3, Lock, AlertTriangle } from "lucide-react";
import { assessments } from "../../data/teacherData";
import { getExamPhase, formatExamDate } from "../../utils/examPhase";

const phaseStyles = {
  too_early:         { row: "bg-slate-50/50",   badge: "bg-slate-100 text-slate-600" },
  print_window:      { row: "bg-blue-50/30",    badge: "bg-blue-100 text-blue-800" },
  exam_window:       { row: "bg-amber-50/30",   badge: "bg-amber-100 text-amber-800" },
  submission_window: { row: "bg-emerald-50/30", badge: "bg-emerald-100 text-emerald-800" },
  closed:            { row: "bg-slate-50/50",   badge: "bg-slate-100 text-slate-500" },
};

export default function Assessments() {
  const { setPageMeta } = useOutletContext();

  useEffect(() => {
    setPageMeta({ title: "Assessments", subtitle: "Announced cycles · time-gated downloads & uploads" });
  }, [setPageMeta]);

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <div>
          <h3 className="font-semibold text-slate-900">Announced Assessments</h3>
          <p className="text-sm text-slate-500 mt-1">
            Assessment cycles are scheduled by Superadmin / Admin. As a teacher you can only
            <b> download the question paper</b> during the print window (opens 1 day before
            the exam) and <b>upload answer scripts</b> during the submission window (up to 24 hours
            after the exam ends).
          </p>
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
                <th className="text-left px-5 py-3">Exam Date</th>
                <th className="text-left px-5 py-3">Cycle Phase</th>
                <th className="text-right px-5 py-3">Expected</th>
                <th className="text-right px-5 py-3">Completed</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((a) => {
                const phase = getExamPhase(a.date);
                const style = phaseStyles[phase.key];
                const completionPct = a.expected ? Math.round((a.completed / a.expected) * 100) : 0;
                return (
                  <tr key={a.id} className={`border-t border-slate-100 hover:bg-slate-50/60 ${style.row}`}>
                    <td className="px-5 py-3 font-medium text-slate-900">{a.name}</td>
                    <td className="px-5 py-3 text-slate-700">{a.className}</td>
                    <td className="px-5 py-3 text-slate-700">{formatExamDate(a.date)}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${style.badge}`}>
                        {phase.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-slate-700">{a.expected}</td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-slate-700">{a.completed}</span>
                      <span className="text-slate-400 ml-1">({completionPct}%)</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        {phase.canDownload ? (
                          <button
                            onClick={() => handleDownload(a)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
                          >
                            <Download size={13} /> Download Question Paper
                          </button>
                        ) : (
                          <button
                            disabled
                            title={
                              phase.key === "too_early"
                                ? "Available 1 day before exam"
                                : phase.key === "exam_window"
                                ? "Exam in progress"
                                : phase.key === "submission_window"
                                ? "Exam finished — download closed"
                                : "Cycle closed"
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-400 text-xs font-medium cursor-not-allowed"
                          >
                            <Lock size={12} /> Download Question Paper
                          </button>
                        )}

                        <button title="View" className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100"><Eye size={14} /></button>

                        {phase.canUpload ? (
                          <Link
                            to={`/teacher/upload?assessment=${a.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700"
                          >
                            <UploadIcon size={13} /> Upload Answer Scripts
                          </Link>
                        ) : (
                          <button
                            disabled
                            title={
                              phase.key === "too_early" || phase.key === "print_window"
                                ? "Upload opens after the exam ends"
                                : phase.key === "exam_window"
                                ? "Exam still in progress"
                                : "Submission window closed"
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-400 text-xs font-medium cursor-not-allowed"
                          >
                            <Lock size={12} /> Upload Answer Scripts
                          </button>
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

      {/* Phase legend */}
      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <h4 className="font-semibold text-slate-900 mb-3 inline-flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-500" />
          Timing rules
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600">
          <div><span className="font-semibold text-slate-700">&gt; 1 day before:</span> locked.</div>
          <div><span className="font-semibold text-slate-700">Print window:</span> 1 day before → exam start · download enabled.</div>
          <div><span className="font-semibold text-slate-700">Exam window:</span> exam start + 45 min · both locked.</div>
          <div><span className="font-semibold text-slate-700">Submission window:</span> exam end + 24 hours · upload enabled.</div>
        </div>
      </section>
    </div>
  );
}

function UploadIcon(props) {
  // Tiny inline SVG so we don't pull in another lucide icon import
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 14}
      height={props.size || 14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function handleDownload(a) {
  console.log(`[download-question-paper] ${a.id} — ${a.name}`);
  alert(`Downloading question paper for:\n${a.name}\n${a.className}`);
}