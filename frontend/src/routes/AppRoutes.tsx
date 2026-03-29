import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { SignupPage } from "../features/auth/pages/SignupPage";
import { ExpenseDashboardPage } from "../features/expenses/pages/ExpenseDashboardPage";
import { AdminDashboardPage } from "../features/admin/pages/AdminDashboardPage";
import { ManagerDashboardPage } from "../features/admin/pages/ManagerDashboardPage";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { PublicOnlyRoute } from "../components/auth/PublicOnlyRoute";
import { HomeRedirect } from "./HomeRedirect";
import { AuthProvider } from "../features/auth/context/AuthContext";

export function AppRoutes() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />

          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicOnlyRoute>
                <SignupPage />
              </PublicOnlyRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute roles={["EMPLOYEE"]}>
                <ExpenseDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses/new"
            element={
              <ProtectedRoute roles={["EMPLOYEE"]}>
                <ExpenseDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/approvals"
            element={
              <ProtectedRoute roles={["MANAGER"]}>
                <ManagerDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route path="/admin-dashboard" element={<Navigate to="/admin" replace />} />
          <Route path="/manager-dashboard" element={<Navigate to="/approvals" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
