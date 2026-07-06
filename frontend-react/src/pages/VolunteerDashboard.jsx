import { useState } from "react";
import AppLayout from "../layouts/AppLayout";
import SummaryCards from "../components/SummaryCards";
import { roles, roleNav } from "../data/roles";
import { School, FileText, ScanLine, BookText, UserPlus } from "lucide-react";

const summaryCards = [
  { id: "schools",     label: "Assigned Schools", value: 3,    icon: "School",         color: "bg-blue-50 text-blue-700",    trend: "All low-strength" },
  { id: "students",    label: "Students (field)", value: 56,   icon: "Users",          color: "bg-emerald-50 text-emerald-700", trend: "Aadhar verified" },
  { id: "papers",      label: "Papers Generated", value: 48,   icon: "FileText",       color: "bg-violet-50 text-violet-700", trend: "Mid-Year cycle" },
  { id: "scans",       label: "Sheets Scanned",   value: 142,  icon: "ScanLine",       color: "bg-amber-50 text-amber-700",   trend: "Bulk 12 batches" },
  { id: "next",        label: "Next Visit",       value: "Jul 9", icon: "Clock",      color: "bg-rose-50 text-rose-700",     trend: "GPS Moga-14" },
];

const assignedSchools = [
  { id: "gps-mt-014", name: "GPS Moga-14",   students: 18, examDate: "2026-07-08", status: "Papers Ready",    strength: "Low" },
  { id: "gps-mt-022", name: "GPS Moga-22",   students: 24, examDate: "2026-07-09", status: "Exam Pending",    strength: "Low" },
  { id: "gps-mt-031", name: "GPS Ludhiana-31", students: 14, examDate: "2026-07-10", status: "Not Started",  strength: "Low" },
];

const scanLogbook = [
  { id: "SCN-211", date: "2026-07-04", school: "GPS Moga-14",  sheets: 18, status: "Submitted",  action: "Upload" },
  { id: "SCN-210", date: "2026-07-03", school: "GPS Ludhiana-31", sheets: 14, status: "Submitted",  action: "Re-process" },
  { id: "SCN-209", date: "2026-07-02", school: "GPS Moga-22",  sheets: 24, status: "Pending Review", action: "Verify" },
  { id: "SCN-208", date: "2026-07-01", school: "GPS Moga-14",  sheets: 18, status: "Submitted",  action: "Upload" },
];

export default function VolunteerDashboard() {
  const [activeId, setActiveId] = useState("dashboard");

  return (
    <AppLayout
      navItems={roleNav.volunteer}
      user={roles.volunteer}
      title="Volunteer Dashboard"
      subtitle="Field worker · Low-strength / no-internet schools"
      activeId={activeId}
      onSelect={setActiveId}
    >
      <SummaryCards cards={summaryCards} />

      <section className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 inline-flex items-center gap-2">
            <School size={18} className="text-indigo-600" />
            Assigned Schools
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
                <th className="text-left px-5 py-3">School</th>
                <th className="text-right px-5 py-3">Students</th>
                <th className="text-left px-5 py-3">Exam Date</th>
                <th className="text-left px-5 py-3">Strength</th>
                <th className="text-left px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {assignedSchools.map((s) => (
                <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-5 py-3">
                    <div className="font-medium text-slate-900">{s.name}</div>
                    <div className="text-xs font-mono text-slate-500">{s.id}</div>
                  </td>
                  <td className="px-5 py-3 text-right text-slate-700">{s.students}</td>
                  <td className="px-5 py-3 text-slate-700">{s.examDate}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-xs font-medium">
                      {s.strength}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={[
                      "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium",
                      s.status === "Papers Ready" ? "bg-emerald-100 text-emerald-700"
                        : s.status === "Exam Pending" ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-700",
                    ].join(" ")}>{s.status}</span>
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
            <BookText size={18} className="text-indigo-600" />
            Scan Logbook
          </h2>
          <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-50">
            <ScanLine size={14} />
            New Scan Batch
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3">Batch</th>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-left px-5 py-3">School</th>
                <th className="text-right px-5 py-3">Sheets</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-right px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {scanLogbook.map((s) => (
                <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-5 py-3 font-mono text-xs text-slate-700">{s.id}</td>
                  <td className="px-5 py-3 text-slate-700">{s.date}</td>
                  <td className="px-5 py-3 text-slate-900">{s.school}</td>
                  <td className="px-5 py-3 text-right text-slate-700">{s.sheets}</td>
                  <td className="px-5 py-3">
                    <span className={[
                      "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium",
                      s.status === "Submitted" ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700",
                    ].join(" ")}>{s.status}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button className="text-indigo-700 hover:bg-indigo-50 px-2.5 py-1 rounded-md text-xs">
                      {s.action}
                    </button>
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