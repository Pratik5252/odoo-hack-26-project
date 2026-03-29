import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { SignupPage } from "../features/auth/pages/SignupPage";
import { ExpenseDashboardPage } from "../features/expenses/pages/ExpenseDashboardPage";
import { AdminDashboardPage } from "../features/admin/pages/AdminDashboardPage";
import { ManagerDashboardPage } from "../features/admin/pages/ManagerDashboardPage";

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
        <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
        <Route path="/manager-dashboard" element={<ManagerDashboardPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
