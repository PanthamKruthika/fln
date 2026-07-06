import { BrowserRouter, Routes, Route } from "react-router-dom";
import TeacherDashboard from "./pages/TeacherDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TeacherDashboard />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}