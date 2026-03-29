import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { SignupPage } from "../features/auth/pages/SignupPage";
import { ExpenseDashboardPage } from "../features/expenses/pages/ExpenseDashboardPage";

export function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/expenses" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/expenses" element={<ExpenseDashboardPage />} />
        <Route path="/expenses/new" element={<ExpenseDashboardPage />} />
        <Route path="*" element={<Navigate to="/expenses" replace />} />
      </Routes>
    </Router>
  );
}
