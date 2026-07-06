// Realistic dummy data for the redesigned Teacher Dashboard.
// All data is scoped to ONE school (ABC Public School) and ONE teacher
// (Anjali Sharma). No district/state data leaks in.

export const teacherProfile = {
  id: "gps-mt-001.t01@fln.org",
  name: "Anjali Sharma",
  role: "Teacher",
  avatar: "AS",
  school: {
    id: "gps-mt-001",
    name: "ABC Public School",
    address: "Sector 14, Gurugram, Haryana",
  },
};

export const summaryCards = [
  { id: "classes",        label: "Total Classes",                value: 4,      trend: "+0 this term",        color: "bg-blue-50 text-blue-700" },
  { id: "students",       label: "Total Students",               value: 132,    trend: "+3 new admissions",   color: "bg-violet-50 text-violet-700" },
  { id: "pending",        label: "Pending Assessments",          value: 2,      trend: "End-Year next week",  color: "bg-amber-50 text-amber-700" },
  { id: "completed",      label: "Completed Assessments",        value: 7,      trend: "All submitted",       color: "bg-emerald-50 text-emerald-700" },
  { id: "worksheets",     label: "Worksheets This Week",         value: 18,     trend: "+6 vs last week",     color: "bg-cyan-50 text-cyan-700" },
  { id: "support",        label: "Students Needing Support",     value: 11,     trend: "Below L3 mastery",    color: "bg-rose-50 text-rose-700" },
  { id: "score",          label: "Average Class Score",          value: "78%",  trend: "+4% this cycle",      color: "bg-indigo-50 text-indigo-700" },
  { id: "fln",            label: "Average Class FLN Level",      value: "L3.4", trend: "Stable",              color: "bg-teal-50 text-teal-700" },
];

export const classes = [
  { id: "C2A", name: "Class 2", section: "A", students: 32, avgScore: 82, avgLevel: "L3.2", pendingAssessments: 1, teacher: "Anjali Sharma" },
  { id: "C2B", name: "Class 2", section: "B", students: 30, avgScore: 76, avgLevel: "L2.9", pendingAssessments: 1, teacher: "Anjali Sharma" },
  { id: "C3A", name: "Class 3", section: "A", students: 36, avgScore: 80, avgLevel: "L3.4", pendingAssessments: 0, teacher: "Anjali Sharma" },
  { id: "C3B", name: "Class 3", section: "B", students: 34, avgScore: 73, avgLevel: "L3.1", pendingAssessments: 0, teacher: "Anjali Sharma" },
];

export const students = [
  { id: "STU-001", name: "Aarav Kumar",    roll: 1,  level: "L4", target: "L5", score: 88, wsAccuracy: 84, progress: 88, status: "On Track",  classId: "C2A" },
  { id: "STU-002", name: "Diya Patel",     roll: 2,  level: "L5", target: "L5", score: 95, wsAccuracy: 92, progress: 95, status: "On Track",  classId: "C2A" },
  { id: "STU-003", name: "Rohan Singh",    roll: 3,  level: "L3", target: "L4", score: 62, wsAccuracy: 58, progress: 62, status: "Needs Help", classId: "C2A" },
  { id: "STU-004", name: "Anaya Verma",    roll: 4,  level: "L4", target: "L5", score: 81, wsAccuracy: 78, progress: 81, status: "On Track",  classId: "C2A" },
  { id: "STU-005", name: "Vivaan Gupta",   roll: 5,  level: "L5", target: "L5", score: 90, wsAccuracy: 88, progress: 90, status: "On Track",  classId: "C2A" },
  { id: "STU-006", name: "Ishaan Reddy",   roll: 6,  level: "L2", target: "L3", score: 48, wsAccuracy: 42, progress: 48, status: "At Risk",   classId: "C2A" },
  { id: "STU-007", name: "Saanvi Iyer",    roll: 7,  level: "L4", target: "L5", score: 78, wsAccuracy: 74, progress: 78, status: "On Track",  classId: "C2A" },
  { id: "STU-008", name: "Kabir Joshi",    roll: 8,  level: "L3", target: "L4", score: 65, wsAccuracy: 60, progress: 65, status: "Needs Help", classId: "C2A" },
  { id: "STU-009", name: "Myra Nair",      roll: 9,  level: "L5", target: "L5", score: 96, wsAccuracy: 94, progress: 96, status: "On Track",  classId: "C2A" },
  { id: "STU-010", name: "Arjun Mehta",    roll: 10, level: "L4", target: "L5", score: 72, wsAccuracy: 68, progress: 72, status: "On Track",  classId: "C2A" },
  { id: "STU-011", name: "Aisha Khan",     roll: 1,  level: "L3", target: "L4", score: 70, wsAccuracy: 66, progress: 70, status: "On Track",  classId: "C2B" },
  { id: "STU-012", name: "Vihaan Das",     roll: 2,  level: "L3", target: "L4", score: 67, wsAccuracy: 64, progress: 67, status: "On Track",  classId: "C2B" },
  { id: "STU-013", name: "Pari Sharma",    roll: 3,  level: "L4", target: "L5", score: 84, wsAccuracy: 80, progress: 84, status: "On Track",  classId: "C2B" },
  { id: "STU-014", name: "Reyansh Roy",    roll: 4,  level: "L2", target: "L3", score: 52, wsAccuracy: 48, progress: 52, status: "Needs Help", classId: "C2B" },
  { id: "STU-015", name: "Ishita Bose",    roll: 5,  level: "L4", target: "L5", score: 79, wsAccuracy: 76, progress: 79, status: "On Track",  classId: "C3A" },
  { id: "STU-016", name: "Atharv Pillai",  roll: 6,  level: "L5", target: "L5", score: 91, wsAccuracy: 89, progress: 91, status: "On Track",  classId: "C3A" },
  { id: "STU-017", name: "Anvi Choudhary", roll: 7,  level: "L3", target: "L4", score: 64, wsAccuracy: 60, progress: 64, status: "Needs Help", classId: "C3B" },
];

export const studentDetail = (id) => {
  const s = students.find((x) => x.id === id) ?? students[0];
  return {
    ...s,
    age: 8,
    gender: "F",
    attendance: "94%",
    currentLevel: s.level,
    targetLevel: s.target,
    competencies: [
      { name: "Counting",         mastery: 88 },
      { name: "Number Sense",     mastery: 72 },
      { name: "Addition",         mastery: 65 },
      { name: "Subtraction",      mastery: 58 },
      { name: "Patterns",         mastery: 92 },
      { name: "Measurement",      mastery: 70 },
      { name: "Shapes",           mastery: 84 },
      { name: "Fractions",        mastery: 42 },
    ],
    assessmentHistory: [
      { name: "Baseline 2025",    date: "2025-04-12", score: 12, level: "L2", status: "Completed" },
      { name: "Mid-Year 2025",    date: "2025-09-08", score: 17, level: "L3", status: "Completed" },
      { name: "End-Year 2025",    date: "2026-03-22", score: 19, level: "L4", status: "Completed" },
      { name: "Mid-Year 2026",    date: "2026-09-10", score: null, level: "—",  status: "Scheduled" },
    ],
    worksheetHistory: [
      { id: "WS-0042", generatedAt: "2026-07-04", difficulty: "Easy",   completed: true,  accuracy: 92 },
      { id: "WS-0041", generatedAt: "2026-07-02", difficulty: "Easy",   completed: true,  accuracy: 88 },
      { id: "WS-0039", generatedAt: "2026-06-28", difficulty: "Medium", completed: true,  accuracy: 76 },
      { id: "WS-0037", generatedAt: "2026-06-24", difficulty: "Medium", completed: false, accuracy: null },
    ],
    aiInsights: {
      strengths: ["Counting", "Shapes", "Patterns"],
      weaknesses: ["Fractions", "Borrowing (subtraction)"],
      recommendations: [
        "Generate Level 3 worksheet focused on Fractions.",
        "Schedule 1-on-1 remediation session on borrowing within 10 days.",
        "Pair with Aarav Kumar (peer tutoring, strong in counting).",
      ],
    },
  };
};

export const worksheets = [
  { id: "WS-0050", student: "Aarav Kumar",  classId: "C2A", generatedAt: "2026-07-06", level: "L4", status: "Generated", difficulty: "Easy" },
  { id: "WS-0049", student: "Diya Patel",   classId: "C2A", generatedAt: "2026-07-06", level: "L5", status: "Downloaded", difficulty: "Easy" },
  { id: "WS-0048", student: "Rohan Singh",  classId: "C2A", generatedAt: "2026-07-06", level: "L3", status: "Printed",    difficulty: "Easy" },
  { id: "WS-0047", student: "Anaya Verma",  classId: "C2A", generatedAt: "2026-07-05", level: "L4", status: "Downloaded", difficulty: "Easy" },
  { id: "WS-0046", student: "Myra Nair",    classId: "C2A", generatedAt: "2026-07-05", level: "L5", status: "Generated", difficulty: "Medium" },
  { id: "WS-0045", student: "Vivaan Gupta", classId: "C2A", generatedAt: "2026-07-04", level: "L5", status: "Completed",  difficulty: "Easy" },
];

export const assessments = [
  { id: "AS-2026-MY", name: "Mid-Year Assessment 2026", className: "Class 2A", date: "2026-09-10", status: "Scheduled",   expected: 32, completed: 0 },
  { id: "AS-2026-BL", name: "Baseline 2026",            className: "Class 2A", date: "2026-04-15", status: "Completed",   expected: 32, completed: 32 },
  { id: "AS-2025-EY", name: "End-Year 2025",            className: "Class 2A", date: "2026-03-22", status: "Completed",   expected: 32, completed: 30 },
  { id: "AS-2025-MY", name: "Mid-Year 2025",            className: "Class 2A", date: "2025-09-08", status: "Completed",   expected: 32, completed: 32 },
];

export const navItems = [
  { id: "home",          label: "Dashboard",            icon: "Home",       path: "/teacher" },
  { id: "classes",       label: "My Classes",           icon: "School",     path: "/teacher/classes" },
  { id: "students",      label: "Students",             icon: "Users",      path: "/teacher/students" },
  { id: "worksheets",    label: "Practice Worksheets",  icon: "FileText",   path: "/teacher/worksheets" },
  { id: "assessments",   label: "Assessments",          icon: "ClipboardList", path: "/teacher/assessments" },
  { id: "upload",        label: "Upload Answer Scripts", icon: "Upload",     path: "/teacher/upload" },
  { id: "analytics",     label: "Analytics",            icon: "BarChart3",  path: "/teacher/analytics" },
  { id: "reports",       label: "Reports",              icon: "FileBarChart", path: "/teacher/reports" },
  { id: "settings",      label: "Settings",             icon: "Settings",   path: "/teacher/settings" },
  { id: "logout",        label: "Logout",               icon: "LogOut",     path: "/" },
];

export const competencyColors = {
  Counting: "bg-blue-500",
  "Number Sense": "bg-indigo-500",
  Addition: "bg-emerald-500",
  Subtraction: "bg-amber-500",
  Patterns: "bg-pink-500",
  Measurement: "bg-cyan-500",
  Shapes: "bg-violet-500",
  Fractions: "bg-rose-500",
};