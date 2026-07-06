import { useEffect, useMemo, useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { Search, Filter, Download } from "lucide-react";
import { students, classes } from "../../data/teacherData";

const statusStyles = {
  "On Track":  "bg-emerald-50 text-emerald-700",
  "Needs Help": "bg-amber-50 text-amber-700",
  "At Risk":   "bg-rose-50 text-rose-700",
};

export default function Students() {
  const { setPageMeta } = useOutletContext();
  const [query, setQuery] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    setPageMeta({ title: "Students", subtitle: "All students in your assigned classes" });
  }, [setPageMeta]);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const q = query.toLowerCase();
      const matchQ = !q || s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
      const matchC = classFilter === "All" || s.classId === classFilter;
      const matchS = statusFilter === "All" || s.status === statusFilter;
      return matchQ && matchC && matchS;
    });
  }, [query, classFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-900">All Students</h2>
            <p className="text-xs text-slate-500">{filtered.length} of {students.length} students</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
              <Search size={14} className="text-slate-400" />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder="Search name or ID"
                className="bg-transparent outline-none text-sm w-44"
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
              <Filter size={14} className="text-slate-400" />
              <select
                value={classFilter}
                onChange={(e) => { setClassFilter(e.target.value); setPage(1); }}
                className="bg-transparent outline-none text-sm"
              >
                <option value="All">All classes</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.section}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
              <Filter size={14} className="text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="bg-transparent outline-none text-sm"
              >
                <option value="All">All statuses</option>
                <option value="On Track">On Track</option>
                <option value="Needs Help">Needs Help</option>
                <option value="At Risk">At Risk</option>
              </select>
            </div>
            <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3">Student ID</th>
                <th className="text-left px-5 py-3">Photo</th>
                <th className="text-left px-5 py-3">Name</th>
                <th className="text-right px-5 py-3">Roll</th>
                <th className="text-left px-5 py-3">Current Level</th>
                <th className="text-left px-5 py-3">Target Level</th>
                <th className="text-right px-5 py-3">Latest Score</th>
                <th className="text-right px-5 py-3">WS Accuracy</th>
                <th className="text-left px-5 py-3">Progress</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((s) => (
                <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-5 py-3 font-mono text-xs text-slate-600">{s.id}</td>
                  <td className="px-5 py-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 grid place-items-center text-xs font-semibold">
                      {s.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Link to={`/teacher/students/${s.id}`} className="font-medium text-slate-900 hover:text-blue-700">
                      {s.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-right text-slate-700">{s.roll}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">{s.level}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-700">{s.target}</td>
                  <td className="px-5 py-3 text-right text-slate-700">{s.score}%</td>
                  <td className="px-5 py-3 text-right text-slate-700">{s.wsAccuracy}%</td>
                  <td className="px-5 py-3 min-w-[120px]">
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{ width: `${s.progress}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${statusStyles[s.status] ?? "bg-slate-100 text-slate-700"}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link to={`/teacher/students/${s.id}`} className="text-blue-600 hover:text-blue-700 text-xs">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
              {paged.length === 0 ? (
                <tr><td colSpan={11} className="text-center text-slate-400 py-12">No students match your filters.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>Page {page} of {totalPages}</div>
          <div className="flex gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded-md border border-slate-200 disabled:opacity-50 hover:bg-slate-50"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 rounded-md border border-slate-200 disabled:opacity-50 hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}