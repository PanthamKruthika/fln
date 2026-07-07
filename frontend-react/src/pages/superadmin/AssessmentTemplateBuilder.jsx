import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Sparkles,
  Save,
  CheckCircle2,
  Loader2,
  Edit3,
  History,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
const QUESTION_TYPES = [
  "handwriting",
  "number",
  "multiple_choice",
  "circle",
  "matching",
  "tick",
  "trace",
  "drawing",
];
const CONCEPTS = [
  "Counting", "Number Sense", "Addition", "Subtraction",
  "Patterns", "Shapes", "Measurement", "Money",
  "Calendar and Time", "Fractions", "Data Handling",
];
const DIFFICULTIES = ["easy", "medium", "hard"];
const LEVELS = ["L1", "L2", "L3", "L4", "L5"];

export default function AssessmentTemplateBuilder() {
  const { assessmentId } = useParams();
  const { token } = useAuth();
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const [assessment, setAssessment] = useState(null);
  const [existingTemplate, setExistingTemplate] = useState(null);
  // phase: "upload" | "uploading" | "edit" | "saving"
  const [phase, setPhase] = useState("upload");
  const [questions, setQuestions] = useState([]);
  const [templateId, setTemplateId] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [error, setError] = useState("");
  const [extractionSource, setExtractionSource] = useState("");
  const [extractionNotes, setExtractionNotes] = useState("");
  const [templateStatus, setTemplateStatus] = useState("draft");
  const [loading, setLoading] = useState(true);
  const [lastRaw, setLastRaw] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const [a, t] = await Promise.all([
          fetch(`${API_BASE}/api/assessments/${assessmentId}`, { headers: authHeaders }).then((r) => r.json()),
          fetch(`${API_BASE}/api/assessments/template/by-assessment/${assessmentId}`, { headers: authHeaders }).then((r) => r.json()),
        ]);
        if (!alive) return;
        setAssessment(a);
        const latest = Array.isArray(t) && t[0];
        if (latest) setExistingTemplate(latest);
      } catch (e) {
        setError(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [assessmentId, token]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const isPdf = f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setError(`Not a PDF (got "${f.type || "unknown"}"). Please choose a .pdf file.`);
      return;
    }
    setPdfFile(f);
    setError("");
  };

  const handleUpload = async () => {
    if (!pdfFile) return;
    setPhase("uploading");
    setError("");
    try {
      const fd = new FormData();
      fd.append("pdf", pdfFile);
      fd.append("grade", "2");
      fd.append("subject", "Numeracy");
      fd.append("academicYear", "2025-26");
      fd.append("assessmentId", assessmentId);
      fd.append("worksheetType", "Diagnostic");

      const resp = await fetch(`${API_BASE}/api/assessments/template/upload`, {
        method: "POST",
        headers: authHeaders,
        body: fd,
      });

      const raw = await resp.text();
      setLastRaw(raw.slice(0, 4000));

      let data;
      try { data = JSON.parse(raw); }
      catch { throw new Error(`Server returned non-JSON (HTTP ${resp.status}): ${raw.slice(0, 200)}`); }

      if (!resp.ok) throw new Error(data.message || `HTTP ${resp.status}: Upload failed`);

      const extraction = data.extraction || {};
      const extracted = Array.isArray(extraction.questions) ? extraction.questions : [];

      setQuestions(extracted);
      setTemplateId(extraction.templateId || "");
      setExtractionSource(extraction.source || "");
      setExtractionNotes(extraction.notes || "");
      setTemplateStatus("draft");

      if (extracted.length > 0) {
        setPhase("edit");
      } else {
        setError(
          `No questions extracted (source: ${extraction.source || "none"}). ` +
          (extraction.notes || "") +
          " — see the debug panel below for the raw response."
        );
        setPhase("upload");
      }
    } catch (err) {
      setError(err.message);
      setPhase("upload");
    }
  };

  const continueWithExisting = () => {
    if (!existingTemplate) return;
    setQuestions(existingTemplate.questions || []);
    setTemplateId(existingTemplate.templateId);
    setTemplateStatus(existingTemplate.status);
    setPhase("edit");
  };

  const handleSave = async (approve = false) => {
    setPhase("saving");
    setError("");
    try {
      const resp = await fetch(`${API_BASE}/api/assessments/template/${templateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ questions }),
      });
      if (!resp.ok) throw new Error(await resp.text());

      if (approve) {
        const resp2 = await fetch(`${API_BASE}/api/assessments/template/${templateId}/approve`, {
          method: "POST",
          headers: authHeaders,
        });
        if (!resp2.ok) throw new Error(await resp2.text());
        setTemplateStatus("approved");
      }
      setPhase("edit");
    } catch (err) {
      setError(err.message);
      setPhase("edit");
    }
  };

  const startOver = () => {
    setQuestions([]);
    setTemplateId("");
    setExtractionSource("");
    setExtractionNotes("");
    setTemplateStatus("draft");
    setError("");
    setPhase("upload");
  };

  const updateQ = (i, patch) =>
    setQuestions((qs) => qs.map((q, j) => (i === j ? { ...q, ...patch } : q)));

  const totalMarks = questions.reduce((s, q) => s + Number(q.marks || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Topbar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/superadmin/assessments" className="text-slate-500 hover:text-slate-700 shrink-0">
              <ArrowLeft size={18} />
            </Link>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-slate-900 truncate">
                Assessment Template Builder
              </h1>
              <p className="text-xs text-slate-500 truncate">
                {assessment ? `${assessment.title} · ${assessment.id || assessment._id}` : "Loading…"}
              </p>
            </div>
          </div>
          <div className="text-[10px] font-mono text-slate-400 shrink-0">
            phase=<b className="text-blue-600">{phase}</b> · questions=<b className="text-blue-600">{questions.length}</b>
            {pdfFile && <> · file=<b>{pdfFile.name}</b></>}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Error banner — always visible */}
        {error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-700 flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>
              <b>Error:</b> {error}
            </div>
          </div>
        ) : null}

        {/* ===================== UPLOAD PHASE ===================== */}
        {(phase === "upload" || phase === "uploading") && (
          <>
            {/* Existing-template banner */}
            {phase === "upload" && existingTemplate && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <History size={18} className="text-amber-700 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-amber-900">
                      Existing template found: <span className="font-mono">{existingTemplate.templateId}</span>
                    </div>
                    <div className="text-xs text-amber-800 mt-0.5">
                      Status: {existingTemplate.status} · {existingTemplate.questions?.length || 0} questions · uploaded {new Date(existingTemplate.updatedAt).toLocaleString()}
                    </div>
                    <div className="text-xs text-amber-800 mt-1">
                      Uploading a new PDF will <b>replace</b> this template.
                    </div>
                  </div>
                </div>
                <button
                  onClick={continueWithExisting}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-medium hover:bg-amber-700 shrink-0"
                >
                  Continue editing existing →
                </button>
              </div>
            )}

            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-900 mb-1">Upload the question paper</h2>
              <p className="text-sm text-slate-500 mb-4">
                Drop the PDF below. The Python service will extract real text and (if
                <code className="px-1 mx-0.5 rounded bg-slate-100 font-mono text-xs">GEMINI_API_KEY</code>
                is set) classify each question via Google Gemini vision.
              </p>

              <label className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-10 text-center block cursor-pointer transition">
                <Upload size={28} className="mx-auto text-slate-400 mb-2" />
                <p className="text-sm text-slate-700 font-medium">
                  {pdfFile ? pdfFile.name : "Click to choose a PDF, or drop one here"}
                </p>
                <p className="text-xs text-slate-400 mt-1">PDF up to 50 MB</p>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleFile}
                  className="hidden"
                />
              </label>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={handleUpload}
                  disabled={!pdfFile || phase === "uploading"}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
                >
                  {phase === "uploading" ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Extracting…
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} /> Extract &amp; Analyze
                    </>
                  )}
                </button>
              </div>
            </section>
          </>
        )}

        {/* ===================== EDIT / SAVING PHASE ===================== */}
        {(phase === "edit" || phase === "saving") && questions.length > 0 && (
          <>
            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <h2 className="font-semibold text-slate-900">Review &amp; edit the AI-extracted template</h2>
                  <p className="text-sm text-slate-500">
                    Template ID: <span className="font-mono">{templateId}</span> · {questions.length} questions · {totalMarks} marks
                    {extractionSource && (
                      <span className="ml-2 text-xs italic">(source: {extractionSource})</span>
                    )}
                    {templateStatus && (
                      <span className={`ml-2 px-2 py-0.5 rounded-md text-[10px] font-medium ${
                        templateStatus === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}>
                        {templateStatus}
                      </span>
                    )}
                  </p>
                  {extractionNotes && (
                    <p className="text-xs text-slate-500 mt-1 italic">{extractionNotes}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={startOver}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm hover:bg-slate-50"
                  >
                    <Upload size={14} /> Upload different PDF
                  </button>
                  <button
                    onClick={() => handleSave(false)}
                    disabled={phase === "saving"}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-700 disabled:opacity-60"
                  >
                    {phase === "saving" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Save Edits
                  </button>
                  <button
                    onClick={() => handleSave(true)}
                    disabled={phase === "saving" || templateStatus === "approved"}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-60"
                  >
                    <CheckCircle2 size={14} />
                    {templateStatus === "approved" ? "Approved" : "Approve"}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {questions.map((q, i) => (
                  <article key={i} className="border border-slate-200 rounded-lg p-4 hover:border-slate-300">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 grid place-items-center font-semibold text-sm shrink-0">
                        Q{q.questionNo ?? i + 1}
                      </div>
                      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3">
                        <div className="lg:col-span-7">
                          <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Question text</label>
                          <textarea
                            rows={2}
                            value={q.questionText || ""}
                            onChange={(e) => updateQ(i, { questionText: e.target.value })}
                            className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm"
                          />
                          {q.answerOptions ? (
                            <details className="mt-1">
                              <summary className="text-xs text-slate-500 cursor-pointer inline-flex items-center gap-1">
                                <Edit3 size={11} /> Options
                              </summary>
                              <pre className="text-xs text-slate-600 mt-1 bg-slate-50 p-2 rounded font-mono whitespace-pre-wrap">
                                {JSON.stringify(q.answerOptions, null, 2)}
                              </pre>
                            </details>
                          ) : null}
                        </div>
                        <div className="lg:col-span-5 grid grid-cols-2 gap-2">
                          <TinyField label="Type">
                            <select
                              value={q.questionType || "number"}
                              onChange={(e) => updateQ(i, { questionType: e.target.value })}
                              className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                            >
                              {QUESTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </TinyField>
                          <TinyField label="Concept">
                            <select
                              value={q.concept || ""}
                              onChange={(e) => updateQ(i, { concept: e.target.value })}
                              className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                            >
                              <option value="">—</option>
                              {CONCEPTS.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </TinyField>
                          <TinyField label="Difficulty">
                            <select
                              value={q.difficulty || "easy"}
                              onChange={(e) => updateQ(i, { difficulty: e.target.value })}
                              className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                            >
                              {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </TinyField>
                          <TinyField label="Level">
                            <select
                              value={q.level || "L1"}
                              onChange={(e) => updateQ(i, { level: e.target.value })}
                              className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                            >
                              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                            </select>
                          </TinyField>
                          <TinyField label="Marks">
                            <input
                              type="number"
                              min={0}
                              value={q.marks || 0}
                              onChange={(e) => updateQ(i, { marks: Number(e.target.value) })}
                              className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                            />
                          </TinyField>
                          <TinyField label="Correct Answer">
                            <input
                              value={q.correctAnswer || ""}
                              onChange={(e) => updateQ(i, { correctAnswer: e.target.value, provenance: "human-edited" })}
                              className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-medium"
                            />
                          </TinyField>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Debug panel */}
        {lastRaw && (
          <details className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600">
            <summary className="cursor-pointer font-medium text-slate-700">
              🐞 Debug · raw response from server
            </summary>
            <pre className="mt-2 text-[11px] font-mono whitespace-pre-wrap break-all bg-white p-2 rounded border border-slate-100 max-h-64 overflow-auto">
              {lastRaw}
            </pre>
          </details>
        )}

        {/* Back link */}
        <div className="flex justify-between items-center text-xs text-slate-500">
          <Link to="/superadmin/assessments" className="hover:text-slate-700 inline-flex items-center gap-1">
            <ArrowLeft size={12} /> Back to Assessments
          </Link>
          {extractionSource && <span>Source: {extractionSource}</span>}
        </div>
      </div>
    </div>
  );
}

function TinyField({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">{label}</label>
      {children}
    </div>
  );
}