import { useState } from "react";
import AppLayout from "../layouts/AppLayout";
import SummaryCards from "../components/SummaryCards";
import { roles, roleNav } from "../data/roles";
import { Building2, AlertTriangle, Award, Users, School } from "lucide-react";

const summaryCards = [
  { id: "districts",   label: "Districts",        value: 22,  icon: "Building2",      color: "bg-blue-50 text-blue-700",    trend: "All reporting" },
  { id: "schools",     label: "Schools",          value: 4720, icon: "School",         color: "bg-emerald-50 text-emerald-700", trend: "+42 this cycle" },
  { id: "students",    label: "Students",         value: 218300, icon: "Users",       color: "bg-violet-50 text-violet-700", trend: "Mid-Year ongoing" },
  { id: "lagging",     label: "Lagging Districts", value: 3,    icon: "AlertTriangle", color: "bg-rose-50 text-rose-700",     trend: "<40% FLN cert" },
  { id: "cert",        label: "FLN Certification", value: "68.1%", icon: "Award",      color: "bg-amber-50 text-amber-700",   trend: "+3.2% YoY" },
];

const districtRankings = [
  { rank: 1,  id: "LDH", name: "Ludhiana",       schools: 412, students: 38200, certified: "78.4%", gap: "Low" },
  { rank: 2,  id: "MOG", name: "Moga",           schools: 218, students: 15400, certified: "73.1%", gap: "Low" },
  { rank: 3,  id: "AMR", name: "Amritsar",       schools: 396, students: 28100, certified: "70.2%", gap: "Low" },
  { rank: 4,  id: "JAL", name: "Jalandhar",      schools: 312, students: 22400, certified: "65.8%", gap: "Medium" },
  { rank: 5,  id: "FZK", name: "Fazilka",        schools: 184, students: 12800, certified: "61.0%", gap: "Medium" },
  { rank: 6,  id: "FRI", name: "Firozpur",       schools: 162, students: 11200, certified: "57.3%", gap: "Medium" },
  { rank: 7,  id: "BTH", name: "Bathinda",       schools: 196, students: 13700, certified: "52.6%", gap: "High" },
  { rank: 8,  id: "MNS", name: "Mansa",          schools: 142, students: 9600,  certified: "48.2%", gap: "High" },
  { rank: 9,  id: "SAN", name: "Sangrur",        schools: 174, students: 11500, certified: "39.1%", gap: "Critical" },
  { rank: 10, id: "MUK", name: "Muktsar",        schools: 128, students: 8400,  certified: "37.5%", gap: "Critical" },
];

const learningGaps = [
  { topic: "Fractions",     mastery: 41, schools: 312 },
  { topic: "Money",         mastery: 56, schools: 412 },
  { topic: "Measurement",   mastery: 62, schools: 384 },
  { topic: "Patterns",      mastery: 71, schools: 296 },
  { topic: "Data Handling", mastery: 68, schools: 218 },
];

export default function AdminDashboard() {
  const [activeId, setActiveId] = useState("dashboard");

  return (
    <AppLayout
      navItems={roleNav.admin}
      user={roles.admin}
      title="Admin Dashboard · Punjab"
      subtitle="State-level coordination · 22 districts under your scope"
      activeId={activeId}
      onSelect={setActiveId}
    >
      <SummaryCards cards={summaryCards} />

      <section className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 inline-flex items-center gap-2">
            <Building2 size={18} className="text-indigo-600" />
            District Ranking
          </h2>
          <span className="text-xs text-slate-500">By FLN Certification %</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-right px-5 py-3 w-12">#</th>
                <th className="text-left px-5 py-3">District</th>
                <th className="text-right px-5 py-3">Schools</th>
                <th className="text-right px-5 py-3">Students</th>
                <th className="text-right px-5 py-3">FLN Cert %</th>
                <th className="text-left px-5 py-3">Learning Gap</th>
              </tr>
            </thead>
            <tbody>
              {districtRankings.map((d) => (
                <tr key={d.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-5 py-3 text-right text-slate-500">{d.rank}</td>
                  <td className="px-5 py-3 font-medium text-slate-900">{d.name}</td>
                  <td className="px-5 py-3 text-right text-slate-700">{d.schools}</td>
                  <td className="px-5 py-3 text-right text-slate-700">{d.students.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right">
                    <span className={[
                      "font-medium",
                      d.certified.startsWith("7") ? "text-emerald-700"
                        : d.certified.startsWith("6") ? "text-slate-900"
                        : d.certified.startsWith("5") ? "text-amber-700"
                        : d.certified.startsWith("4") ? "text-rose-700"
                        : "text-rose-700 font-semibold",
                    ].join(" ")}>{d.certified}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={[
                      "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium",
                      d.gap === "Low" ? "bg-emerald-100 text-emerald-700"
                        : d.gap === "Medium" ? "bg-amber-100 text-amber-700"
                        : d.gap === "High" ? "bg-orange-100 text-orange-700"
                        : "bg-rose-100 text-rose-700",
                    ].join(" ")}>{d.gap}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900 inline-flex items-center gap-2">
            <AlertTriangle size={18} className="text-indigo-600" />
            Learning Gap Analysis (state average)
          </h2>
          <p className="text-xs text-slate-500">Topics with the lowest mastery across all districts.</p>
        </div>
        <div className="p-5 space-y-4">
          {learningGaps.map((g) => (
            <div key={g.topic}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="font-medium text-slate-800">{g.topic}</span>
                <span className="text-slate-500">{g.mastery}% mastery · {g.schools} schools</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={[
                    "h-full rounded-full",
                    g.mastery < 50 ? "bg-rose-500"
                      : g.mastery < 65 ? "bg-amber-500"
                      : "bg-emerald-500",
                  ].join(" ")}
                  style={{ width: `${g.mastery}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}