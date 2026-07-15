import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import AssessmentsListPage from "./pages/AnswerKeyGenerator/AssessmentsListPage";
import TemplateReviewPage from "./pages/AnswerKeyGenerator/TemplateReviewPage";

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <DashboardLayout />
        }
      >
        <Route index element={<Navigate to="/answer-key-generator" replace />} />
        <Route path="answer-key-generator" element={<AssessmentsListPage />} />
        <Route path="answer-key-generator/:id/review" element={<TemplateReviewPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/answer-key-generator" replace />} />
    </Routes>
  );
}