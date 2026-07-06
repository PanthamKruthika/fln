import { useMemo, useState } from "react";
import { Search, Filter, Plus, Eye } from "lucide-react";

const statusStyles = {
  Submitted:     "bg-emerald-100 text-emerald-700",
  Delayed:       "bg-amber-100 text-amber-700",
  "Not Submitted": "bg-rose-100 text-rose-700",
};

export default function ClassRoster({ students, onAddStudent }) {
  const [query, setQuery] = useState("");
  const [classFilter, setClassFilter] = useState("All");

  const classes = useMemo(
    () => ["All", ...new Set(students.map((s) => s.class))],
    [students],
  );

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesQuery =
        !query ||
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.id.toLowerCase().includes(query.toLowerCase());
      const matchesClass = classFilter === "All" || s.class === classFilter;
      return matchesQuery && matchesClass;
    });
  }, [students, query, classFilter]);

  return (
    <section className="bg-white rounded-xl border border-slate-200">
      <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">Class Roster</h2>
          <p className="text-xs text-slate-500">
            Students in your assigned class — {students.length} total
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            <Search size={14} className="text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or ID"
              className="bg-transparent outline-none text-sm w-44"
            />
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            <Filter size={14} className="text-slate-400" />
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="bg-transparent outline-none text-sm"
            >
              {classes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onAddStudent}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
          >
            <Plus size={14} />
            Add Student
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-5 py-3">Student ID</th>
              <th className="text-left px-5 py-3">Name</th>
              <th className="text-left px-5 py-3">Class</th>
              <th className="text-left px-5 py-3">FLN Level</th>
              <th className="text-left px-5 py-3">Last Paper</th>
              <th className="text-left px-5 py-3">Last Report</th>
              <th className="text-left px-5 py-3">Status</th>
              <th className="text-right px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr
                key={s.id}
                className="border-t border-slate-100 hover:bg-slate-50/50"
              >
                <td className="px-5 py-3 font-mono text-xs text-slate-600">{s.id}</td>
                <td className="px-5 py-3 font-medium text-slate-900">{s.name}</td>
                <td className="px-5 py-3 text-slate-700">{s.class}</td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium">
                    {s.level}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-700">{s.lastPaper}</td>
                <td className="px-5 py-3 text-slate-700">{s.lastReport}</td>
                <td className="px-5 py-3">
                  <span
                    className={[
                      "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium",
                      statusStyles[s.status] ?? "bg-slate-100 text-slate-700",
                    ].join(" ")}
                  >
                    {s.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs text-indigo-700 hover:bg-indigo-50">
                    <Eye size={14} />
                    View
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-slate-400 py-10">
                  No students match your filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}