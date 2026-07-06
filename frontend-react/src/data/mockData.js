export const teacherUser = {
  name: "Priya Sharma",
  email: "gps-mt-001.t01@fln.org",
  role: "teacher",
  schoolId: "gps-mt-001",
  schoolName: "GPS Model Town 001",
  avatar: "PS",
};

export const summaryCards = [
  {
    id: "students",
    label: "Total Students",
    value: 42,
    icon: "Users",
    color: "bg-blue-50 text-blue-700",
    trend: "+3 this month",
  },
  {
    id: "assessments",
    label: "Assessments Conducted",
    value: 38,
    icon: "ClipboardCheck",
    color: "bg-emerald-50 text-emerald-700",
    trend: "Mid-Year cycle in progress",
  },
  {
    id: "worksheets",
    label: "Worksheets Generated",
    value: 36,
    icon: "FileText",
    color: "bg-violet-50 text-violet-700",
    trend: "4 pending print",
  },
  {
    id: "reports",
    label: "Reports Available",
    value: 30,
    icon: "BarChart3",
    color: "bg-amber-50 text-amber-700",
    trend: "Last eval: 2 days ago",
  },
  {
    id: "alerts",
    label: "Pending Reviews",
    value: 2,
    icon: "AlertTriangle",
    color: "bg-rose-50 text-rose-700",
    trend: "1 Not-Submitted alert",
  },
];

export const classRoster = [
  { id: "STU-001", name: "Aarav Kumar",    class: "3-A", level: "L4", lastPaper: "Mid-Year", lastReport: "Score 17/20", status: "Submitted" },
  { id: "STU-002", name: "Diya Patel",     class: "3-A", level: "L5", lastPaper: "Mid-Year", lastReport: "Score 19/20", status: "Submitted" },
  { id: "STU-003", name: "Rohan Singh",    class: "3-A", level: "L3", lastPaper: "Mid-Year", lastReport: "Score 12/20", status: "Delayed" },
  { id: "STU-004", name: "Anaya Verma",    class: "3-A", level: "L4", lastPaper: "Mid-Year", lastReport: "Score 16/20", status: "Submitted" },
  { id: "STU-005", name: "Vivaan Gupta",   class: "3-A", level: "L5", lastPaper: "Mid-Year", lastReport: "Score 18/20", status: "Submitted" },
  { id: "STU-006", name: "Ishaan Reddy",   class: "3-A", level: "L2", lastPaper: "Mid-Year", lastReport: "Score 9/20",  status: "Not Submitted" },
  { id: "STU-007", name: "Saanvi Iyer",    class: "3-A", level: "L4", lastPaper: "Mid-Year", lastReport: "Score 15/20", status: "Submitted" },
  { id: "STU-008", name: "Kabir Joshi",    class: "3-A", level: "L3", lastPaper: "Mid-Year", lastReport: "Score 13/20", status: "Submitted" },
  { id: "STU-009", name: "Myra Nair",      class: "3-A", level: "L5", lastPaper: "Mid-Year", lastReport: "Score 20/20", status: "Submitted" },
  { id: "STU-010", name: "Arjun Mehta",    class: "3-A", level: "L4", lastPaper: "Mid-Year", lastReport: "Score 14/20", status: "Submitted" },
];

export const sidebarNav = [
  { id: "dashboard",   label: "Dashboard",        icon: "LayoutDashboard" },
  { id: "roster",      label: "Class Roster",     icon: "Users" },
  { id: "assessments", label: "Assessments",      icon: "ClipboardList" },
  { id: "worksheets",  label: "Generate Papers",  icon: "FileText" },
  { id: "scan",        label: "Scan & Upload",    icon: "ScanLine" },
  { id: "reports",     label: "Reports",          icon: "BarChart3" },
  { id: "tickets",     label: "Tickets",          icon: "Ticket" },
  { id: "settings",    label: "Settings",         icon: "Settings" },
];

export const announcements = [
  {
    id: "ANN-001",
    title: "Mid-Year Assessment Window Open",
    body: "The Mid-Year assessment print window opens at 08:00 IST tomorrow. Ensure all students are pre-registered.",
    urgent: true,
    postedAt: "2026-07-05",
  },
];

export const examWindow = {
  phase: "Print Window",
  startsAt: "2026-07-07 08:00 IST",
  endsAt:   "2026-07-07 09:00 IST",
  className: "Class 3-A",
};
