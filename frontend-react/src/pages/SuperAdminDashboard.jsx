import { useState } from "react";
import AppLayout from "../layouts/AppLayout";
import SummaryCards from "../components/SummaryCards";
import { roles, roleNav } from "../data/roles";
import {
  Megaphone,
  Send,
  Ticket as TicketIcon,
  Building2,
  CheckCircle2,
  Clock,
  Flag,
} from "lucide-react";

const summaryCards = [
  { id: "states",       label: "States",          value: 28,    icon: "Building2",     color: "bg-blue-50 text-blue-700",   trend: "All reporting this cycle" },
  { id: "districts",    label: "Districts",       value: 723,   icon: "Map",           color: "bg-violet-50 text-violet-700", trend: "+12 onboarded this quarter" },
  { id: "schools",      label: "Schools",         value: 14290, icon: "School",        color: "bg-emerald-50 text-emerald-700", trend: "Active across 3 cycles" },
  { id: "assessments",  label: "Assessments",     value: 184230, icon: "ClipboardCheck", color: "bg-amber-50 text-amber-700", trend: "Mid-Year ongoing" },
  { id: "certification",label: "FLN Certification", value: "62.4%", icon: "Award",      color: "bg-rose-50 text-rose-700",    trend: "+2.1% vs last year" },
];

const stateStats = [
  { id: "PB", name: "Punjab",          schools: 4720, students: 218300, certified: "68.1%", status: "On Track" },
  { id: "HR", name: "Haryana",         schools: 3340, students: 162800, certified: "63.5%", status: "On Track" },
  { id: "UP", name: "Uttar Pradesh",   schools: 5840, students: 412100, certified: "54.2%", status: "Lagging" },
  { id: "RJ", name: "Rajasthan",       schools: 2210, students: 128700, certified: "61.8%", status: "On Track" },
  { id: "MP", name: "Madhya Pradesh",  schools: 2980, students: 161400, certified: "39.7%", status: "Critical" },
];

const tickets = [
  { id: "TKT-1041", type: "curriculum", from: "gps-ldh-014.t02@fln.org", subject: "Question Q14 in L3 has ambiguous wording", priority: "High" },
  { id: "TKT-1040", type: "general",    from: "admin.pb@fln.org",        subject: "Bulk upload for new teacher onboarding", priority: "Medium" },
  { id: "TKT-1039", type: "curriculum", from: "gps-mt-001.t03@fln.org",  subject: "Add currency recognition visuals for L2", priority: "Low" },
];

export default function SuperAdminDashboard() {
  const [activeId, setActiveId] = useState("dashboard");
  const [announcementDraft, setAnnouncementDraft] = useState({ title: "", body: "", urgent: false });

  return (
    <AppLayout
      navItems={roleNav.superadmin}
      user={roles.superadmin}
      title="Superadmin Dashboard"
      subtitle="National oversight · VLED Lab"
      activeId={activeId}
      onSelect={setActiveId}
    >
      <SummaryCards cards={summaryCards} />

      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-slate-900 inline-flex items-center gap-2">
              <Megaphone size={18} className="text-indigo-600" />
              Broadcast Announcement
            </h2>
            <p className="text-xs text-slate-500">Visible on every dashboard; email escalation when urgent.</p>
          </div>
        </div>
        <div className="space-y-3">
          <input
            value={announcementDraft.title}
            onChange={(e) => setAnnouncementDraft((d) => ({ ...d, title: e.target.value }))}
            placeholder="Announcement title"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:bg-white"
          />
          <textarea
            value={announcementDraft.body}
            onChange={(e) => setAnnouncementDraft((d) => ({ ...d, body: e.target.value }))}
            placeholder="What needs to be communicated to all roles?"
            rows={3}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:bg-white"
          />
          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={announcementDraft.urgent}
                onChange={(e) => setAnnouncementDraft((d) => ({ ...d, urgent: e.target.checked }))}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Urgent — trigger email escalation
            </label>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
              <Send size={14} /> Publish
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900 inline-flex items-center gap-2">
            <Building2 size={18} className="text-indigo-600" />
            State Performance
          </h2>
          <p className="text-xs text-slate-500">Click a row to drill into districts.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3">State</th>
                <th className="text-right px-5 py-3">Schools</th>
                <th className="text-right px-5 py-3">Students</th>
                <th className="text-right px-5 py-3">FLN Cert %</th>
                <th className="text-left px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {stateStats.map((s) => (
                <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50/50 cursor-pointer">
                  <td className="px-5 py-3 font-medium text-slate-900">{s.name}</td>
                  <td className="px-5 py-3 text-right text-slate-700">{s.schools.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right text-slate-700">{s.students.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right text-slate-700">{s.certified}</td>
                  <td className="px-5 py-3">
                    <span className={[
                      "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium",
                      s.status === "On Track" ? "bg-emerald-100 text-emerald-700"
                        : s.status === "Lagging" ? "bg-amber-100 text-amber-700"
                        : "bg-rose-100 text-rose-700",
                    ].join(" ")}>
                      {s.status}
                    </span>
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
            <TicketIcon size={18} className="text-indigo-600" />
            Ticket Review Queue
          </h2>
          <span className="text-xs text-slate-500">{tickets.length} pending</span>
        </div>
        <div className="divide-y divide-slate-100">
          {tickets.map((t) => (
            <div key={t.id} className="px-5 py-3 flex items-start gap-3">
              <div className={[
                "mt-0.5 w-8 h-8 rounded-lg grid place-items-center shrink-0",
                t.type === "curriculum" ? "bg-violet-50 text-violet-700" : "bg-blue-50 text-blue-700",
              ].join(" ")}>
                {t.type === "curriculum" ? <Flag size={16} /> : <Clock size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">{t.id}</span>
                  <span className={[
                    "text-xs px-1.5 py-0.5 rounded",
                    t.priority === "High" ? "bg-rose-100 text-rose-700"
                      : t.priority === "Medium" ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-700",
                  ].join(" ")}>{t.priority}</span>
                </div>
                <div className="text-sm font-medium text-slate-900 mt-0.5">{t.subject}</div>
                <div className="text-xs text-slate-500">{t.from}</div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-700 text-xs hover:bg-emerald-100 inline-flex items-center gap-1">
                  <CheckCircle2 size={12} /> Approve
                </button>
                <button className="px-3 py-1.5 rounded-md bg-slate-50 text-slate-700 text-xs hover:bg-slate-100">Reject</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}