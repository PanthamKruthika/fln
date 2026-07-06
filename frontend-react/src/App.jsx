import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import DistrictAdminDashboard from "./pages/DistrictAdminDashboard";
import BlockAdminDashboard from "./pages/BlockAdminDashboard";
import SchoolPrincipalDashboard from "./pages/SchoolPrincipalDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import VolunteerDashboard from "./pages/VolunteerDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/superadmin" element={<SuperAdminDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/district" element={<DistrictAdminDashboard />} />
        <Route path="/block" element={<BlockAdminDashboard />} />
        <Route path="/school" element={<SchoolPrincipalDashboard />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/volunteer" element={<VolunteerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}