import { useEffect, useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  Loader2,
  X,
  Download,
  Eye,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { assessments, classes } from "../../data/teacherData";

const pipeline = [
  { id: "uploading",  label: "Uploading",            duration: 1500 },
  { id: "splitting",  label: "Splitting PDF",        duration: 1200 },
  { id: "readingIds", label: "Reading Student IDs",  duration: 1500 },
  { id: "evaluating", label: "Evaluating Papers",    duration: 2000 },
  { id: "reports",    label: "Generating Reports",   duration: 1500 },
];

const mockResults = [
  { id: "STU-001", name: "Aarav Kumar",  worksheetId: "WS-0051", score: 88, status: "Completed",     confidence: 0.97 },
  { id: "STU-002", name: "Diya Patel",   worksheetId: "WS-0052", score: 95, status: "Completed",     confidence: 0.99 },
  { id: "STU-003", name: "Rohan Singh",  worksheetId: "WS-0053", score: null, status: "Needs Review", confidence: 0.62 },
  { id: "STU-004", name: "Anaya Verma",  worksheetId: "WS-0054", score: 81, status: "Completed",     confidence: 0.93 },
  { id: "STU-005", name: "Vivaan Gupta", worksheetId: "WS-0055", score: null, status: "Failed",       confidence: 0.0 },
  { id: "STU-006", name: "Ishaan Reddy", worksheetId: "WS-0056", score: 48, status: "Completed",     confidence: 0.91 },
];

const statusStyles = {
  Completed:     "bg-emerald-50 text-emerald-700",
  "Needs Review": "bg-amber-50 text-amber-700",
  Failed:        "bg-rose-50 text-rose-700",
};

export default function UploadScripts() {
  const { setPageMeta } = useOutletContext();
  const [selectedAssessment, setSelectedAssessment] = useState(assessments[0]?.id ?? "");
  const [file, setFile] = useState(null);
  const [phase, setPhase] = useState("idle"); // idle | running | done
  const [stepIdx, setStepIdx] = useState(-1);
  const inputRef = useRef(null);

  useEffect(() => {
    setPageMeta({ title: "Upload Answer Scripts", subtitle: "Upload scanned PDF for an assessment" });
  }, [setPageMeta]);

  const onDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f && f.type === "application/pdf") {
      setFile(f);
      setPhase("idle");
    }
  };

  const onSelect = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPhase("idle");
    }
  };

  const startProcessing = async () => {
    if (!file) return;
    setPhase("running");
    setStepIdx(0);
    for (let i = 0; i < pipeline.length; i++) {
      setStepIdx(i);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, pipeline[i].duration));
    }
    setPhase("done");
  };

  const reset = () => {
    setFile(null);
    setPhase("idle");
    setStepIdx(-1);
  };

  const currentAssessment = assessments.find((a) => a.id === selectedAssessment);
  const classLabel = currentAssessment ? `${currentAssessment.className}` : "—";

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900">Upload Workflow</h3>
        <p className="text-sm text-slate-500 mt-1">
          Select an assessment, upload the scanned PDF containing answer sheets for the entire class,
          and the system will split, evaluate, and generate reports.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <Field label="Select Assessment">
            <select
              value={selectedAssessment}
              onChange={(e) => setSelectedAssessment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            >
              {assessments.map((a) => <option key={a.id} value={a.id}>{a.name} · {a.date}</option>)}
            </select>
          </Field>
          <Info label="Class"         value={classLabel} />
          <Info label="Expected Students" value={`${currentAssessment?.expected ?? "—"}`} />
        </div>
      </section>

      {/* Upload dropzone */}
      {phase !== "done" && (
        <section
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className={[
            "bg-white rounded-xl border-2 border-dashed p-10 text-center transition",
            file ? "border-blue-400 bg-blue-50/30" : "border-slate-300 hover:border-blue-400 hover:bg-slate-50",
          ].join(" ")}
        >
          {!file ? (
            <>
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 grid place-items-center">
                <Upload size={22} />
              </div>
              <p className="mt-3 text-sm text-slate-700 font-medium">Drag &amp; drop your scanned PDF here</p>
              <p className="text-xs text-slate-500 mt-1">or</p>
              <button
                onClick={() => inputRef.current?.click()}
                className="mt-3 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
              >
                Browse Files
              </button>
              <input ref={inputRef} type="file" accept="application/pdf" onChange={onSelect} className="hidden" />
              <div className="mt-5 flex justify-center gap-4 text-xs text-slate-500">
                <span>Accepted: <b>PDF</b></span>
                <span>Maximum size: <b>50 MB</b></span>
              </div>
            </>
          ) : (
            <>
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-100 text-blue-700 grid place-items-center">
                <FileText size={22} />
              </div>
              <p className="mt-3 text-sm font-medium text-slate-800">{file.name}</p>
              <p className="text-xs text-slate-500 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              <div className="mt-4 flex justify-center gap-2">
                <button
                  onClick={startProcessing}
                  disabled={phase === "running"}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60 inline-flex items-center gap-2"
                >
                  {phase === "running" ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  {phase === "running" ? "Processing…" : "Start Processing"}
                </button>
                <button
                  onClick={reset}
                  className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </section>
      )}

      {/* Processing timeline */}
      {phase === "running" && (
        <ProcessingTimeline stepIdx={stepIdx} />
      )}

      {/* Results */}
      {phase === "done" && (
        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">Processing Results</h3>
              <p className="text-xs text-slate-500">18 of 32 students processed · 4 need review</p>
            </div>
            <button onClick={reset} className="text-xs text-blue-600 hover:text-blue-700">Upload Another →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-3">Student</th>
                  <th className="text-left px-5 py-3">Worksheet ID</th>
                  <th className="text-right px-5 py-3">Score</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-right px-5 py-3">Confidence</th>
                  <th className="text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockResults.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="px-5 py-3">
                      <div className="font-medium text-slate-900">{r.name}</div>
                      <div className="text-xs text-slate-500 font-mono">{r.id}</div>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-700">{r.worksheetId}</td>
                    <td className="px-5 py-3 text-right font-semibold text-slate-900">{r.score ?? "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${statusStyles[r.status]}`}>{r.status}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full bg-blue-600" style={{ width: `${r.confidence * 100}%` }} />
                        </div>
                        <span className="text-xs text-slate-600">{Math.round(r.confidence * 100)}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button title="View"    className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100"><Eye size={14} /></button>
                        <button title="Review"  className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50"><AlertTriangle size={14} /></button>
                        <button title="Reprocess" className="p-1.5 rounded-md text-amber-600 hover:bg-amber-50"><RotateCcw size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
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

function Info({ label, value }) {
  return (
    <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
      <div className="text-xs text-slate-500 uppercase tracking-wider">{label}</div>
      <div className="text-sm font-semibold text-slate-900 mt-0.5">{value}</div>
    </div>
  );
}

function ProcessingTimeline({ stepIdx }) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Loader2 size={16} className="text-blue-600 animate-spin" />
        <h3 className="font-semibold text-slate-900">Processing Pipeline</h3>
      </div>
      <ol className="space-y-3">
        {pipeline.map((p, i) => {
          const done = i < stepIdx;
          const current = i === stepIdx;
          return (
            <li key={p.id} className="flex items-center gap-3">
              <div className={[
                "w-7 h-7 rounded-full grid place-items-center shrink-0",
                done ? "bg-emerald-100 text-emerald-700"
                  : current ? "bg-blue-100 text-blue-700"
                  : "bg-slate-100 text-slate-400",
              ].join(" ")}>
                {done ? <CheckCircle2 size={14} /> : current ? <Loader2 size={14} className="animate-spin" /> : <Clock size={14} />}
              </div>
              <div className="flex-1">
                <div className={[
                  "text-sm font-medium",
                  done ? "text-emerald-700"
                    : current ? "text-blue-700"
                    : "text-slate-500",
                ].join(" ")}>{p.label}</div>
                <div className="text-xs text-slate-400">{done ? "Completed" : current ? "Running" : "Pending"}</div>
              </div>
              <div className="text-xs text-slate-400">{i + 1} / {pipeline.length}</div>
            </li>
          );
        })}
      </ol>
      <div className="mt-5">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Overall progress</span>
          <span>{Math.round(((stepIdx + 1) / pipeline.length) * 100)}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full bg-blue-600 transition-all" style={{ width: `${((stepIdx + 1) / pipeline.length) * 100}%` }} />
        </div>
      </div>
    </section>
  );
}