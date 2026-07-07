import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import SuperAdminAssessments from "./pages/superadmin/SuperAdminAssessments";
import AssessmentTemplateBuilder from "./pages/superadmin/AssessmentTemplateBuilder";
import AdminDashboard from "./pages/AdminDashboard";
import DistrictAdminDashboard from "./pages/DistrictAdminDashboard";
import BlockAdminDashboard from "./pages/BlockAdminDashboard";
import SchoolPrincipalDashboard from "./pages/SchoolPrincipalDashboard";
import VolunteerDashboard from "./pages/VolunteerDashboard";

import TeacherLayout from "./layouts/TeacherLayout";
import TeacherHome from "./pages/teacher/TeacherHome";
import MyClasses from "./pages/teacher/MyClasses";
import ClassDetail from "./pages/teacher/ClassDetail";
import Students from "./pages/teacher/Students";
import StudentProfile from "./pages/teacher/StudentProfile";
import PracticeWorksheets from "./pages/teacher/PracticeWorksheets";
import Assessments from "./pages/teacher/Assessments";
import UploadScripts from "./pages/teacher/UploadScripts";
import Analytics from "./pages/teacher/Analytics";
import Reports from "./pages/teacher/Reports";
import Settings from "./pages/teacher/Settings";

import RequireAuth from "./components/RequireAuth";
import { AuthProvider } from "./contexts/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/superadmin" element={<RequireAuth><SuperAdminDashboard /></RequireAuth>} />
          <Route path="/superadmin/assessments" element={<RequireAuth><SuperAdminAssessments /></RequireAuth>} />
          <Route path="/superadmin/assessments/:assessmentId/template" element={<RequireAuth><AssessmentTemplateBuilder /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
          <Route path="/district" element={<RequireAuth><DistrictAdminDashboard /></RequireAuth>} />
          <Route path="/block" element={<RequireAuth><BlockAdminDashboard /></RequireAuth>} />
          <Route path="/school" element={<RequireAuth><SchoolPrincipalDashboard /></RequireAuth>} />
          <Route path="/volunteer" element={<RequireAuth><VolunteerDashboard /></RequireAuth>} />

          {/* Teacher — nested layout with all sub-pages */}
          <Route
            path="/teacher"
            element={<RequireAuth><TeacherLayout /></RequireAuth>}
          >
            <Route index element={<TeacherHome />} />
            <Route path="classes" element={<MyClasses />} />
            <Route path="classes/:classId" element={<ClassDetail />} />
            <Route path="students" element={<Students />} />
            <Route path="students/:studentId" element={<StudentProfile />} />
            <Route path="worksheets" element={<PracticeWorksheets />} />
            <Route path="assessments" element={<Assessments />} />
            <Route path="upload" element={<UploadScripts />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}