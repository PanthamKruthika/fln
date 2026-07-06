import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { classes, summaryCards, studentDetail } from "../../data/teacherData";

const scoreByClass = classes.map((c) => ({ name: `${c.name} ${c.section}`, score: c.avgScore }));

const weeklyWorksheets = [
  { week: "W1", count: 12 },
  { week: "W2", count: 16 },
  { week: "W3", count: 14 },
  { week: "W4", count: 22 },
  { week: "W5", count: 18 },
  { week: "W6", count: 24 },
  { week: "W7", count: 18 },
];

const monthlyProgress = [
  { month: "Apr", score: 68 },
  { month: "May", score: 72 },
  { month: "Jun", score: 75 },
  { month: "Jul", score: 78 },
];

const flnDistribution = [
  { name: "L2", value: 12 },
  { name: "L3", value: 38 },
  { name: "L4", value: 56 },
  { name: "L5", value: 26 },
];
const PIE_COLORS = ["#f59e0b", "#3b82f6", "#6366f1", "#10b981"];

const conceptMastery = [
  { topic: "Counting",     mastery: 86 },
  { topic: "Number Sense", mastery: 72 },
  { topic: "Addition",     mastery: 68 },
  { topic: "Subtraction",  mastery: 58 },
  { topic: "Patterns",     mastery: 84 },
  { topic: "Fractions",    mastery: 42 },
];

export default function Analytics() {
  const { setPageMeta } = useOutletContext();

  useEffect(() => {
    setPageMeta({ title: "Analytics", subtitle: "Charts and trends for your classes" });
  }, [setPageMeta]);

  return (
    <div className="space-y-6">
      {/* Top row: small KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.slice(0, 4).map((c) => (
          <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-xs uppercase tracking-wider text-slate-500">{c.label}</div>
            <div className="text-2xl font-semibold text-slate-900 mt-1">{c.value}</div>
            <div className="text-xs text-slate-400 mt-1">{c.trend}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Average Score by Class" subtitle="Latest assessment cycle">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={scoreByClass}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip />
              <Bar dataKey="score" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="FLN Level Distribution" subtitle="All students across your classes">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Tooltip />
              <Legend />
              <Pie data={flnDistribution} dataKey="value" nameKey="name" outerRadius={90} innerRadius={50}>
                {flnDistribution.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Concept Mastery" subtitle="Across all topics">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={conceptMastery} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis type="category" dataKey="topic" width={110} tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip />
              <Bar dataKey="mastery" fill="#10b981" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Weekly Worksheet Generation" subtitle="Last 7 weeks">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={weeklyWorksheets}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Class Average" subtitle="Average score trend">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Students Requiring Support" subtitle="Below L3 mastery">
          <div className="grid grid-cols-3 gap-3">
            {summaryCards.slice(5, 8).map((c) => (
              <div key={c.id} className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs uppercase tracking-wider text-slate-500">{c.label}</div>
                <div className="text-2xl font-semibold text-slate-900 mt-1">{c.value}</div>
                <div className="text-xs text-slate-400 mt-1">{c.trend}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3">Focus list auto-derived from the latest assessment data.</p>
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="mb-3">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        {subtitle ? <p className="text-xs text-slate-500">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}