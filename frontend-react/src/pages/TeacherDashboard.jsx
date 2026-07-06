import { useState } from "react";
import AppLayout from "../layouts/AppLayout";
import SummaryCards from "../components/SummaryCards";
import ClassRoster from "../components/ClassRoster";
import ExamWindowBanner from "../components/ExamWindowBanner";
import { roles, roleNav } from "../data/roles";
import { classRoster, summaryCards, announcements, examWindow } from "../data/mockData";

export default function TeacherDashboard() {
  const [activeId, setActiveId] = useState("dashboard");
  const [students, setStudents] = useState(classRoster);

  const handleAddStudent = () => {
    const next = students.length + 1;
    const id = `STU-${String(next).padStart(3, "0")}`;
    setStudents((prev) => [
      ...prev,
      {
        id,
        name: `New Student ${next}`,
        class: "3-A",
        level: "L3",
        lastPaper: "—",
        lastReport: "—",
        status: "Pending",
      },
    ]);
  };

  return (
    <AppLayout
      navItems={roleNav.teacher}
      user={roles.teacher}
      title={`Welcome back, ${roles.teacher.name?.split(" ")[0] ?? "Teacher"}`}
      subtitle={`${roles.teacher.title} · Mid-Year cycle`}
      announcement={announcements[0]}
      activeId={activeId}
      onSelect={setActiveId}
    >
      <ExamWindowBanner window={examWindow} />
      <SummaryCards cards={summaryCards} />
      <ClassRoster students={students} onAddStudent={handleAddStudent} />
    </AppLayout>
  );
}