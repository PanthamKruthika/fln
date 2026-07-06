// Computes the current exam-cycle phase for an assessment based on
// exam date/time. Reflects the timing rules in SRS §6.4 / §6.5:
//
//   > 1 day before exam           → too_early        (download disabled, upload disabled)
//   1 day before → exam start     → print_window     (download enabled,  upload disabled)
//   exam start → +45 min          → exam_window      (both disabled)
//   +45 min → +1h 45 min          → submission_window(download disabled, upload enabled)
//   > +1h 45 min                  → closed           (both disabled)
//
// `examDate` may be a Date or ISO string. All times are local-time;
// backend will replace with the real Generator-Lock Service (§13.2 R-11)
// — this is the UI-side reflection of the same lock.

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export function getExamPhase(examDate, now = new Date()) {
  const exam = new Date(examDate).getTime();
  const diffMs = exam - now.getTime();

  // > 1 day until exam
  if (diffMs > 1 * DAY) {
    return {
      key: "too_early",
      label: "Locked",
      badge: "bg-slate-100 text-slate-600",
      canDownload: false,
      canUpload: false,
      opensAt: new Date(exam - DAY).toISOString(),
    };
  }

  // 1 day before exam → exam start  (print window open)
  if (diffMs > 0) {
    const remainingH = Math.floor(diffMs / HOUR);
    const remainingM = Math.floor((diffMs % HOUR) / (60 * 1000));
    return {
      key: "print_window",
      label: `Print Window open · starts in ${remainingH}h ${remainingM}m`,
      badge: "bg-blue-100 text-blue-800",
      canDownload: true,
      canUpload: false,
    };
  }

  // exam start → +45 min (exam in progress)
  if (diffMs > -45 * 60 * 1000) {
    const elapsedM = Math.ceil(-diffMs / (60 * 1000));
    return {
      key: "exam_window",
      label: `Exam in progress · ${elapsedM} min elapsed`,
      badge: "bg-amber-100 text-amber-800",
      canDownload: false,
      canUpload: false,
    };
  }

  // +45 min → +24 hours (submission window)
  // Project policy: teachers can upload answer scripts for up to 1
  // day after the exam ends (longer than SRS §6.4's 1-hour default).
  if (diffMs > -24 * HOUR) {
    const remainingH = Math.floor((24 * HOUR + diffMs) / HOUR);
    const remainingM = Math.ceil(((24 * HOUR + diffMs) % HOUR) / (60 * 1000));
    return {
      key: "submission_window",
      label: `Submission window · ${remainingH}h ${remainingM}m remaining`,
      badge: "bg-emerald-100 text-emerald-800",
      canDownload: false,
      canUpload: true,
    };
  }

  return {
    key: "closed",
    label: "Closed",
    badge: "bg-slate-100 text-slate-500",
    canDownload: false,
    canUpload: false,
  };
}

export function formatExamDate(examDate) {
  const d = new Date(examDate);
  return d.toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}