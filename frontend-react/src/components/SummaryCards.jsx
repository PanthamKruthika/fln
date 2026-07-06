import {
  Users,
  ClipboardCheck,
  FileText,
  BarChart3,
  AlertTriangle,
} from "lucide-react";

const iconMap = {
  Users,
  ClipboardCheck,
  FileText,
  BarChart3,
  AlertTriangle,
};

export default function SummaryCards({ cards }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((c) => {
        const Icon = iconMap[c.icon];
        return (
          <div
            key={c.id}
            className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <div
                className={[
                  "w-9 h-9 rounded-lg grid place-items-center",
                  c.color,
                ].join(" ")}
              >
                {Icon ? <Icon size={18} /> : null}
              </div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-900">{c.value}</div>
              <div className="text-sm text-slate-600">{c.label}</div>
            </div>
            <div className="text-xs text-slate-400">{c.trend}</div>
          </div>
        );
      })}
    </div>
  );
}