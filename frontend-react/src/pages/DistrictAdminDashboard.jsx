import { useState } from "react";
import AppLayout from "../layouts/AppLayout";
import SummaryCards from "../components/SummaryCards";
import { roles, roleNav } from "../data/roles";
import { Workflow, AlertTriangle, Building2, CheckCircle2, Clock } from "lucide-react";

const summaryCards = [
  { id: "blocks",      label: "Blocks",            value: 8,    icon: "Building2",    color: "bg-blue-50 text-blue-700",    trend: "All reporting" },
  { id: "schools",     label: "Schools",           value: 412,  icon: "School",       color: "bg-emerald-50 text-emerald-700", trend: "Mid-Year cycle" },
  { id: "students",    label: "Students",          value: 38200, icon: "Users",      color: "bg-violet-50 text-violet-700", trend: "+1.2k this month" },
  { id: "conducted",   label: "Conducted",         value: 391,  icon: "ClipboardCheck", color: "bg-amber-50 text-amber-700", trend: "94.9% of schools" },
  { id: "bottleneck",  label: "Bottlenecks",       value: 4,    icon: "AlertTriangle", color: "bg-rose-50 text-rose-700",   trend: "Scan stalled in 2 blocks" },
];

const dataPipeline = [
  { stage: "Conducted",  schools: 412, scanned: 412, evaluated: 412, certified: 408, pct: 99 },
  { stage: "Scanned",    schools: 412, scanned: 408, evaluated: 402, certified: 398, pct: 97 },
  { stage: "Evaluated",  schools: 412, scanned: 408, evaluated: 388, certified: 380, pct: 92 },
  { stage: "Certified",  schools: 412, scanned: 408, evaluated: 388, certified: 372, pct: 90 },
];

const blockAdmins = [
  { id: "LDH-01", name: "Harpreet Singh", blocks: 12, schools: 64, status: "On Track" },
  { id: "LDH-02", name: "Jasdeep Kaur",   blocks:  9, schools: 51, status: "On Track" },
  { id: "LDH-03", name: "Manjit Brar",    blocks: 11, schools: 58, status: "Stalled — Scanning" },
  { id: "LDH-04", name: "Simranjit Kaur", blocks:  7, schools: 39, status: "On Track" },
  { id: "LDH-05", name: "Balwinder Singh", blocks: 10, schools: 42, status: "Stalled — Submission" },
  { id: "LDH-06", name: "Navjot Sandhu",  blocks:  8, schools: 46, status: "On Track" },
  { id: "LDH-07", name: "Amarjeet Kaur",  blocks:  9, schools: 54, status: "On Track" },
  { id: "LDH-08", name: "Lakhwinder Singh", blocks: 8, schools: 58, status: "Stalled — Evaluation" },
];

export default function DistrictAdminDashboard() {
  const [activeId, setActiveId] = useState("dashboard");

  return (
    <AppLayout
      navItems={roleNav.district_admin}
      user={roles.district_admin}
      title="District Dashboard · Ludhiana"
      subtitle="District-wide coordination · 8 Block Admins under your scope"
      activeId={activeId}
      onSelect={setActiveId}
    >
      <SummaryCards cards={summaryCards} />

      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900 inline-flex items-center gap-2">
            <Workflow size={18} className="text-indigo-600" />
            Data Pipeline — Conducted → Scanned → Evaluated → Certified
          </h2>
          <span className="text-xs text-slate-500">Live snapshot · Mid-Year cycle</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dataPipeline.map((p, idx) => (
            <div key={p.stage} className="border border-slate-200 rounded-lg p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                Step {idx + 1}
              </div>
              <div className="text-lg font-semibold text-slate-900">{p.stage}</div>
              <div className="text-3xl font-bold text-indigo-600 mt-2">{p.pct}%</div>
              <div className="text-xs text-slate-500">{p.scanned} of {p.schools} schools</div>
              <div className="mt-3 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={[
                    "h-full rounded-full",
                    p.pct >= 95 ? "bg-emerald-500" : p.pct >= 85 ? "bg-amber-500" : "bg-rose-500",
                  ].join(" ")}
                  style={{ width: `${p.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900 inline-flex items-center gap-2">
            <Building2 size={18} className="text-indigo-600" />
            Block Admin Tracking
          </h2>
          <p className="text-xs text-slate-500">Status flags highlight bottlenecks in the pipeline.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3">Block</th>
                <th className="text-left px-5 py-3">Admin</th>
                <th className="text-right px-5 py-3">Blocks</th>
                <th className="text-right px-5 py-3">Schools</th>
                <th className="text-left px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {blockAdmins.map((b) => (
                <tr key={b.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-5 py-3 font-mono text-xs text-slate-700">{b.id}</td>
                  <td className="px-5 py-3 font-medium text-slate-900">{b.name}</td>
                  <td className="px-5 py-3 text-right text-slate-700">{b.blocks}</td>
                  <td className="px-5 py-3 text-right text-slate-700">{b.schools}</td>
                  <td className="px-5 py-3">
                    <span className={[
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
                      b.status === "On Track" ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700",
                    ].join(" ")}>
                      {b.status === "On Track" ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppLayout>
  );
}