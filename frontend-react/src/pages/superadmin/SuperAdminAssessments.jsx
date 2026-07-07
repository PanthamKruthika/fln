import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, ArrowLeft, FileText, Sparkles, Calendar } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
const ASSESSMENT_TYPES = ["Diagnostic", "Practice", "Summative"];
const CYCLE_LABELS = { Baseline: "Baseline", "Mid-Year": "Mid-Year", "End-Year": "End-Year" };

export default function SuperAdminAssessments() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [templatesByAssessment, setTemplatesByAssessment] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state for creating an assessment
  const [form, setForm] = useState({
    title: "",
    assessmentType: "Summative",
    subject: "Numeracy",
    grade: 2,
    language: "English",
    academicYear: "2025-26",
    duration: 45,
    totalMarks: 20,
    totalQuestions: 15,
  });

  // Class lookup
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const [a, c] = await Promise.all([
          fetch(`${API_BASE}/api/assessments`, { headers: authHeaders }).then((r) => r.json()),
          // Classes aren't filtered yet on the backend, so list a manageable subset.
          fetch(`${API_BASE}/api/assessments`, { headers: authHeaders }).then((r) => r.json()).catch(() => []),
        ]);
        if (!alive) return;
        setAssessments(a);
        // Load templates for each assessment in parallel
        const tmpl = {};
        await Promise.all(
          a.map(async (ass) => {
            const id = ass.id || ass._id;
            const t = await fetch(`${API_BASE}/api/assessments/template/by-assessment/${id}`, { headers: authHeaders }).then((r) => r.json());
            tmpl[id] = t;
          }),
        );
        if (alive) setTemplatesByAssessment(tmpl);
        // Fallback for classes: hard-code for the demo
        setClasses([
          { id: "6a4d1a09cbf4bb92afb40b7f", className: "Class 2A" },
          { id: "C2B", className: "Class 2B" },
          { id: "C3A", className: "Class 3A" },
        ]);
        if (!classId && classes.length === 0) setClassId("6a4d1a09cbf4bb92afb40b7f");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [token]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      // Find or create the classId
      const teacherId = "6a4d1a09cbf4bb92afb40b7e"; // demo teacher from earlier
      const resp = await fetch(`${API_BASE}/api/assessments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          title: form.title,
          assessmentType: form.assessmentType,
          classId,
          teacherId,
          assessmentDate: new Date(Date.now() + 14 * 86400000).toISOString(),
          duration: form.duration,
          totalMarks: form.totalMarks,
          totalQuestions: form.totalQuestions,
        }),
      });
      if (!resp.ok) throw new Error(await resp.text());
      const a = await resp.json();
      setShowCreate(false);
      navigate(`/superadmin/assessments/${a.id || a._id}/template`);
    } catch (err) {
      alert(`Create failed: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Topbar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/superadmin" className="text-slate-500 hover:text-slate-700">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Assessments</h1>
              <p className="text-xs text-slate-500">Create assessments and generate AI-extracted answer-key templates.</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            <Plus size={14} /> Create Assessment
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
            Loading assessments…
          </div>
        ) : assessments.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
            <Calendar size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-600 mb-3">No assessments yet.</p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              <Plus size={14} /> Create your first assessment
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-3">Assessment</th>
                  <th className="text-left px-5 py-3">Type</th>
                  <th className="text-left px-5 py-3">Date</th>
                  <th className="text-right px-5 py-3">Marks / Q</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Template</th>
                  <th className="text-right px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((a) => {
                  const id = a.id || a._id;
                  const tmpl = templatesByAssessment[id] || [];
                  const latest = tmpl[0];
                  return (
                    <tr key={id} className="border-t border-slate-100 hover:bg-slate-50/50">
                      <td className="px-5 py-3 font-medium text-slate-900">{a.title}</td>
                      <td className="px-5 py-3 text-slate-700">{a.assessmentType}</td>
                      <td className="px-5 py-3 text-slate-700">
                        {new Date(a.assessmentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-5 py-3 text-right text-slate-700">{a.totalMarks} / {a.totalQuestions}</td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">{a.status}</span>
                      </td>
                      <td className="px-5 py-3">
                        {latest ? (
                          <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                            latest.status === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                          }`}>
                            {latest.templateId} · {latest.status}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">not generated</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          to={`/superadmin/assessments/${id}/template`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
                        >
                          <Sparkles size={12} /> Generate Template
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-30 bg-slate-900/40 grid place-items-center p-4">
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4"
          >
            <h3 className="text-lg font-semibold text-slate-900">Create Assessment</h3>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Title" full>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Class 2 Mid-Year 2026"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  required
                />
              </Field>
              <Field label="Assessment Type">
                <select
                  value={form.assessmentType}
                  onChange={(e) => setForm({ ...form, assessmentType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                >
                  {ASSESSMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Subject">
                <input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </Field>
              <Field label="Grade">
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={form.grade}
                  onChange={(e) => setForm({ ...form, grade: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </Field>
              <Field label="Language">
                <input
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </Field>
              <Field label="Academic Year">
                <input
                  value={form.academicYear}
                  onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </Field>
              <Field label="Duration (mins)">
                <input
                  type="number"
                  min={1}
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </Field>
              <Field label="Total Marks">
                <input
                  type="number"
                  min={0}
                  value={form.totalMarks}
                  onChange={(e) => setForm({ ...form, totalMarks: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </Field>
              <Field label="Total Questions">
                <input
                  type="number"
                  min={0}
                  value={form.totalQuestions}
                  onChange={(e) => setForm({ ...form, totalQuestions: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </Field>
              <Field label="Class" full>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                >
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.className}</option>)}
                </select>
              </Field>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 inline-flex items-center gap-2"
              >
                <Sparkles size={14} />
                {creating ? "Creating…" : "Create & Generate Template"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Field({ label, children, full }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="block text-xs font-medium text-slate-600 mb-1 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}