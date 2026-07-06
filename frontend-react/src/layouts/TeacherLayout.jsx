import { useState } from "react";
import { Outlet } from "react-router-dom";
import TeacherSidebar from "../components/teacher/TeacherSidebar";
import TeacherTopbar from "../components/teacher/TeacherTopbar";

export default function TeacherLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [pageMeta, setPageMeta] = useState({
    title: "Dashboard",
    subtitle: "Welcome back, Anjali",
  });

  return (
    <div className="flex h-screen bg-slate-50">
      <TeacherSidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <div className="flex-1 flex flex-col min-w-0">
        <TeacherTopbar pageTitle={pageMeta.title} pageSubtitle={pageMeta.subtitle} />
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <Outlet context={{ setPageMeta }} />
        </main>
      </div>
    </div>
  );
}