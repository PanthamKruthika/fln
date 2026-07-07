import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Sparkles,
  Save,
  CheckCircle2,
  Loader2,
  Edit3,
  History,
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
  const navigate = useNavigate();
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const [assessment, setAssessment] = useState(null);
  const [existingTemplate, setExistingTemplate] = useState(null);
  // phase: "upload" (always the entry point) | "edit" (after extraction) | "saving"
  const [phase, setPhase] = useState("upload");
  const [questions, setQuestions] = useState([]);
  const [templateId, setTemplateId] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [error, setError] = useState("");
  const [source, setSource] = useState("");
  const [notes, setNotes] = useState("");
  const [templateStatus, setTemplateStatus] = useState("draft");
  const [loading, setLoading] = useState(true);

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
        // ALWAYS start on the upload step — that's what
        // "Generate Template" is supposed to do.
        setPhase("upload");
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
    if (f && f.type === "application/pdf") {
      setPdfFile(f);
      setError("");
    } else if (f) {
      setError("Please upload a PDF file");
    }
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
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.message || "Upload failed");
      setQuestions(data.extraction.questions);
      setTemplateId(data.extraction.templateId);
      setSource(data.extraction.source);
      setNotes(data.extraction.notes || "");
      setTemplateStatus("draft");
      setPhase("edit");
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
    }
  };

  const startOver = () => {
    setQuestions([]);
    setTemplateId("");
    setSource("");
    setNotes("");
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
          <div className="flex items-center gap-3">
            <Link to="/superadmin/assessments" className="text-slate-500 hover:text-slate-700">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                Assessment Template Builder
              </h1>
              <p className="text-xs text-slate-500">
                {assessment ? `${assessment.title} · ${assessment.id || assessment._id}` : "Loading…"}
                {templateStatus && (
                  <span className={`ml-2 px-2 py-0.5 rounded-md text-[10px] font-medium ${
                    templateStatus === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  }`}>
                    {templateStatus}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {/* ---------- Step 1: Upload the question paper (always the entry point) ---------- */}
        {phase === "upload" && (
          <>
            {/* Banner if an existing template is on file */}
            {existingTemplate && (
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
                Drop the PDF below. We'll convert it to images, run OCR, then have AI classify each
                question by type, concept, difficulty, and suggested correct answer.
              </p>

              <label className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-10 text-center block cursor-pointer transition">
                <Upload size={28} className="mx-auto text-slate-400 mb-2" />
                <p className="text-sm text-slate-700 font-medium">
                  {pdfFile ? pdfFile.name : "Click to choose a PDF, or drop one here"}
                </p>
                <p className="text-xs text-slate-400 mt-1">PDF up to 50 MB</p>
                <input type="file" accept="application/pdf" onChange={handleFile} className="hidden" />
              </label>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={handleUpload}
                  disabled={!pdfFile || phase === "uploading"}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
                >
                  {phase === "uploading" ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {phase === "uploading" ? "Extracting…" : "Extract & Analyze"}
                </button>
              </div>
            </section>
          </>
        )}

        {/* ---------- Step 2: Review + edit ---------- */}
        {phase !== "upload" && questions.length > 0 && (
          <>
            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-semibold text-slate-900">Review &amp; edit the AI-extracted template</h2>
                  <p className="text-sm text-slate-500">
                    Template ID: <span className="font-mono">{templateId}</span> · {questions.length} questions · {totalMarks} marks
                    {source && <span className="ml-2 text-xs italic">(source: {source})</span>}
                  </p>
                  {notes && <p className="text-xs text-slate-500 mt-1 italic">{notes}</p>}
                </div>
                <div className="flex gap-2">
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
                        Q{q.questionNo}
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
                              value={q.questionType}
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
                              value={q.difficulty}
                              onChange={(e) => updateQ(i, { difficulty: e.target.value })}
                              className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                            >
                              {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </TinyField>
                          <TinyField label="Level">
                            <select
                              value={q.level}
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

            <div className="flex justify-between items-center text-xs text-slate-500">
              <Link to="/superadmin/assessments" className="hover:text-slate-700 inline-flex items-center gap-1">
                <ArrowLeft size={12} /> Back to Assessments
              </Link>
              <span>Source: {source || "—"}</span>
            </div>
          </>
        )}
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