import { useState } from "react";
import AppLayout from "../layouts/AppLayout";
import SummaryCards from "../components/SummaryCards";
import { roles, roleNav } from "../data/roles";
import { Users, School, FileText, AlertTriangle } from "lucide-react";

const summaryCards = [
  { id: "volunteers", label: "Volunteers",     value: 6,    icon: "Users",          color: "bg-blue-50 text-blue-700",    trend: "3 active in field" },
  { id: "schools",    label: "Schools",        value: 12,   icon: "School",         color: "bg-emerald-50 text-emerald-700", trend: "8 low-strength" },
  { id: "students",   label: "Students",       value: 480,  icon: "Users",          color: "bg-violet-50 text-violet-700", trend: "Across assigned schools" },
  { id: "papers",     label: "Papers Generated", value: 192, icon: "FileText",     color: "bg-amber-50 text-amber-700",   trend: "Mid-Year cycle" },
  { id: "alerts",     label: "Escalations",    value: 1,    icon: "AlertTriangle",  color: "bg-rose-50 text-rose-700",     trend: "Defaulting school" },
];

const volunteers = [
  { id: "vol.rahul",  name: "Rahul Verma",   schools: 3, papers: 48, lastActive: "2h ago",     status: "Active" },
  { id: "vol.priya",  name: "Priya Kumari",  schools: 2, papers: 32, lastActive: "1d ago",     status: "Active" },
  { id: "vol.arjun",  name: "Arjun Yadav",   schools: 2, papers: 24, lastActive: "5h ago",     status: "Active" },
  { id: "vol.suman",  name: "Suman Pandey",  schools: 1, papers: 18, lastActive: "3d ago",     status: "Inactive" },
  { id: "vol.neha",   name: "Neha Singh",    schools: 2, papers: 36, lastActive: "12h ago",    status: "Active" },
  { id: "vol.ravi",   name: "Ravi Shankar",  schools: 2, papers: 34, lastActive: "30m ago",    status: "Active" },
];

const lowStrengthSchools = [
  { id: "gps-mt-014", name: "GPS Moga-14",   strength: 18, lastAssessed: "Mid-Year", examDate: "2026-07-08", status: "Scheduled" },
  { id: "gps-mt-022", name: "GPS Moga-22",   strength: 24, lastAssessed: "Mid-Year", examDate: "2026-07-09", status: "Scheduled" },
  { id: "gps-mt-031", name: "GPS Ludhiana-31", strength: 12, lastAssessed: "Mid-Year", examDate: "2026-07-08", status: "Conducted" },
  { id: "gps-mt-009", name: "GPS Ludhiana-09", strength: 22, lastAssessed: "Mid-Year", examDate: "2026-07-09", status: "Pending" },
  { id: "gps-mt-027", name: "GPS Ludhiana-27", strength: 15, lastAssessed: "Mid-Year", examDate: "2026-07-10", status: "Scheduled" },
];

export default function BlockAdminDashboard() {
  const [activeId, setActiveId] = useState("dashboard");

  return (
    <AppLayout
      navItems={roleNav.block_admin}
      user={roles.block_admin}
      title="Block Dashboard · Ludhiana-01"
      subtitle="Block coordination · low-strength schools + Volunteers"
      activeId={activeId}
      onSelect={setActiveId}
    >
      <SummaryCards cards={summaryCards} />

      <section className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900 inline-flex items-center gap-2">
            <Users size={18} className="text-indigo-600" />
            Volunteer Tracking
          </h2>
          <p className="text-xs text-slate-500">Field workers reporting to you. Provision new accounts from the Volunteers page.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3">Volunteer</th>
                <th className="text-right px-5 py-3">Schools</th>
                <th className="text-right px-5 py-3">Papers</th>
                <th className="text-left px-5 py-3">Last Active</th>
                <th className="text-left px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {volunteers.map((v) => (
                <tr key={v.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-5 py-3">
                    <div className="font-medium text-slate-900">{v.name}</div>
                    <div className="text-xs text-slate-500">{v.id}@fln.org</div>
                  </td>
                  <td className="px-5 py-3 text-right text-slate-700">{v.schools}</td>
                  <td className="px-5 py-3 text-right text-slate-700">{v.papers}</td>
                  <td className="px-5 py-3 text-slate-700">{v.lastActive}</td>
                  <td className="px-5 py-3">
                    <span className={[
                      "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium",
                      v.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700",
                    ].join(" ")}>{v.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 inline-flex items-center gap-2">
            <School size={18} className="text-indigo-600" />
            Low-Strength / No-Internet Schools
          </h2>
          <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
            <FileText size={14} />
            Generate Papers
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3">School ID</th>
                <th className="text-left px-5 py-3">Name</th>
                <th className="text-right px-5 py-3">Strength</th>
                <th className="text-left px-5 py-3">Last Assessed</th>
                <th className="text-left px-5 py-3">Exam Date</th>
                <th className="text-left px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {lowStrengthSchools.map((s) => (
                <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-5 py-3 font-mono text-xs text-slate-700">{s.id}</td>
                  <td className="px-5 py-3 font-medium text-slate-900">{s.name}</td>
                  <td className="px-5 py-3 text-right text-slate-700">{s.strength}</td>
                  <td className="px-5 py-3 text-slate-700">{s.lastAssessed}</td>
                  <td className="px-5 py-3 text-slate-700">{s.examDate}</td>
                  <td className="px-5 py-3">
                    <span className={[
                      "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium",
                      s.status === "Conducted" ? "bg-emerald-100 text-emerald-700"
                        : s.status === "Scheduled" ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700",
                    ].join(" ")}>{s.status}</span>
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