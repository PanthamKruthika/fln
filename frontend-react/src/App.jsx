import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import DistrictAdminDashboard from "./pages/DistrictAdminDashboard";
import BlockAdminDashboard from "./pages/BlockAdminDashboard";
import SchoolPrincipalDashboard from "./pages/SchoolPrincipalDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import VolunteerDashboard from "./pages/VolunteerDashboard";
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
          <Route path="/admin" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
          <Route path="/district" element={<RequireAuth><DistrictAdminDashboard /></RequireAuth>} />
          <Route path="/block" element={<RequireAuth><BlockAdminDashboard /></RequireAuth>} />
          <Route path="/school" element={<RequireAuth><SchoolPrincipalDashboard /></RequireAuth>} />
          <Route path="/teacher" element={<RequireAuth><TeacherDashboard /></RequireAuth>} />
          <Route path="/volunteer" element={<RequireAuth><VolunteerDashboard /></RequireAuth>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}