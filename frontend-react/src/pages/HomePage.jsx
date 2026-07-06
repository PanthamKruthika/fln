import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  School,
  Users,
  ClipboardCheck,
  Award,
  BookOpen,
  Target,
  Heart,
  ChevronRight,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const fallbackStats = {
  states: 28,
  districts: 723,
  blocks: 5820,
  schools: 14290,
  students: 1842300,
  assessmentsConducted: 4218000,
  flnCertificationPct: 62.4,
};

const statCards = (s) => [
  { id: "states",      label: "States",       value: s.states,                  icon: Building2,      chip: "bg-blue-50 text-blue-700" },
  { id: "districts",   label: "Districts",    value: s.districts.toLocaleString(), icon: Building2,   chip: "bg-violet-50 text-violet-700" },
  { id: "schools",     label: "Schools",      value: s.schools.toLocaleString(),   icon: School,      chip: "bg-emerald-50 text-emerald-700" },
  { id: "students",    label: "Students",     value: s.students.toLocaleString(),  icon: Users,       chip: "bg-amber-50 text-amber-700" },
  { id: "assessments", label: "Assessments",  value: s.assessmentsConducted.toLocaleString(), icon: ClipboardCheck, chip: "bg-rose-50 text-rose-700" },
  { id: "fln",         label: "FLN Score",    value: `${s.flnCertificationPct}%`, icon: Award,        chip: "bg-cyan-50 text-cyan-700" },
];

const knowledgeCards = [
  {
    icon: BookOpen,
    title: "ASER 2023 — Reading Levels",
    body: "Only ~25% of Class 3 students in rural India can read a Class 2 text fluently. FLN's AI-personalized worksheets aim to close this gap one student at a time.",
  },
  {
    icon: Target,
    title: "NAS 2021 — Numeracy Findings",
    body: "By Class 3, fewer than 30% of children can correctly solve a 2-digit subtraction problem. Our assessment engine tracks each competency individually.",
  },
  {
    icon: Heart,
    title: "NEP 2020 — Foundational Priority",
    body: "The National Education Policy places FLN at the core of India's schooling goals for Grades 1–3, with continuous assessment replacing one-shot testing.",
  },
];

function fmt(value) {
  if (typeof value === "number" && value >= 1000) {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1000)     return `${(value / 1000).toFixed(1)}k`;
  }
  return value;
}

export default function HomePage() {
  const [stats, setStats] = useState(fallbackStats);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/api/public/stats`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d) setStats(d);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white grid place-items-center font-bold">
              F
            </div>
            <div>
              <div className="font-semibold leading-tight">FLN Assessment</div>
              <div className="text-xs text-slate-500 leading-tight">Foundation for Every Child</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <a href="#mission" className="hover:text-indigo-600">Mission</a>
            <a href="#stats"    className="hover:text-indigo-600">Reach</a>
            <a href="#knowledge" className="hover:text-indigo-600">Why FLN</a>
            <a href="#contact"  className="hover:text-indigo-600">Contact</a>
          </nav>

          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
          >
            Login
            <ChevronRight size={14} />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white">
        <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_top_left,white,transparent_60%)]" />
        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs uppercase tracking-wide mb-5">
            FLN · Mathematics · Classes 2–4
          </div>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight max-w-3xl mx-auto">
            Foundational Literacy &amp; Numeracy —
            <br className="hidden md:block" />
            Assessment for Every Child, at Their Level
          </h1>
          <p className="mt-5 text-base md:text-lg text-indigo-100 max-w-2xl mx-auto">
            Three assessment cycles a year, AI-personalized worksheets, and real-time FLN-level
            tracking — from national oversight down to a single student.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 font-semibold rounded-lg shadow-lg hover:bg-indigo-50"
            >
              Sign In to Dashboard
              <ChevronRight size={16} />
            </Link>
            <a
              href="#stats"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur text-white font-medium rounded-lg border border-white/20 hover:bg-white/20"
            >
              See Our Reach
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="max-w-6xl mx-auto px-6 -mt-12 md:-mt-16 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8">
          <div className="text-center mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
              Reach at a glance
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Live numbers from the FLN platform · Last updated {new Date().toLocaleString()}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {statCards(stats).map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-3"
                >
                  <div
                    className={[
                      "w-9 h-9 rounded-lg grid place-items-center",
                      c.chip,
                    ].join(" ")}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-slate-900">{fmt(c.value)}</div>
                    <div className="text-sm text-slate-600">{c.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section id="mission" className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium uppercase tracking-wide">
            <Target size={14} /> Vision
          </div>
          <h3 className="mt-4 text-2xl font-semibold text-slate-900">
            Every child literate and numerate by the end of Class 3.
          </h3>
          <p className="mt-3 text-slate-600">
            A national-scale platform that gives every student — from the most connected city
            school to the most remote single-teacher block — an assessment and a worksheet
            tailored to exactly where they are.
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-medium uppercase tracking-wide">
            <Heart size={14} /> Mission
          </div>
          <h3 className="mt-4 text-2xl font-semibold text-slate-900">
            Continuous, personalized assessment — not one-shot testing.
          </h3>
          <p className="mt-3 text-slate-600">
            Three annual cycles (Baseline, Mid-Year, End-Year) measure every competency, AI
            updates each student's FLN level, and personalized worksheets guide them forward
            through their next milestone.
          </p>
        </div>
      </section>

      {/* Knowledge Cards */}
      <section id="knowledge" className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">Why FLN matters</h2>
            <p className="text-slate-600 mt-2 max-w-2xl mx-auto">
              India's foundational learning gap is well documented. Here is what the latest
              national surveys tell us.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {knowledgeCards.map(({ icon: Icon, title, body }) => (
              <article
                key={title}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 grid place-items-center">
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 text-slate-300">
        <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 grid place-items-center font-bold">F</div>
              <span className="font-semibold">FLN Assessment</span>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              A VLED Lab (IIT Ropar) initiative. Foundational literacy &amp; numeracy for
              every child in India.
            </p>
          </div>
          <div>
            <div className="text-white text-sm font-semibold mb-3">About</div>
            <ul className="space-y-2 text-sm">
              <li><a href="#mission" className="hover:text-white">Vision &amp; Mission</a></li>
              <li><a href="#stats" className="hover:text-white">Our Reach</a></li>
              <li><a href="#knowledge" className="hover:text-white">Why FLN</a></li>
            </ul>
          </div>
          <div>
            <div className="text-white text-sm font-semibold mb-3">Contact</div>
            <ul className="space-y-2 text-sm">
              <li>support@fln.org</li>
              <li>IIT Ropar, Rupnagar, Punjab</li>
            </ul>
          </div>
          <div>
            <div className="text-white text-sm font-semibold mb-3">Legal</div>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Use</a></li>
              <li><a href="#" className="hover:text-white">Data &amp; Aadhar Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800">
          <div className="max-w-6xl mx-auto px-6 py-4 text-xs text-slate-500 flex items-center justify-between">
            <span>© {new Date().getFullYear()} FLN Platform · VLED Lab, IIT Ropar</span>
            <span>Made with care for India's classrooms.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}