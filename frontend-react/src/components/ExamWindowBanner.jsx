import { Clock } from "lucide-react";

export default function ExamWindowBanner({ window }) {
  if (!window) return null;
  return (
    <div className="bg-indigo-600 text-white rounded-xl px-5 py-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white/15 grid place-items-center">
          <Clock size={20} />
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-indigo-100">
            Current exam-day phase — {window.className}
          </div>
          <div className="text-base font-semibold">{window.phase}</div>
        </div>
      </div>
      <div className="text-sm text-indigo-100">
        {window.startsAt} → {window.endsAt}
      </div>
    </div>
  );
}