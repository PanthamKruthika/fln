import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import SummaryCards from "../components/SummaryCards";
import ClassRoster from "../components/ClassRoster";
import ExamWindowBanner from "../components/ExamWindowBanner";
import {
  teacherUser,
  sidebarNav,
  summaryCards,
  classRoster,
  announcements,
  examWindow,
} from "../data/mockData";

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
    <div className="flex h-screen bg-slate-50">
      <Sidebar
        items={sidebarNav}
        activeId={activeId}
        onSelect={setActiveId}
        user={teacherUser}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={`Welcome back, ${teacherUser.name.split(" ")[0]}`}
          subtitle={`${teacherUser.schoolName} · Class 3-A · Mid-Year cycle`}
          announcement={announcements[0]}
        />

        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <ExamWindowBanner window={examWindow} />

          <SummaryCards cards={summaryCards} />

          <ClassRoster
            students={students}
            onAddStudent={handleAddStudent}
          />
        </main>
      </div>
    </div>
  );
}