import type { ReactNode } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { SignupPage } from "../features/auth/pages/SignupPage";
import { ExpenseDashboardPage } from "../features/expenses/pages/ExpenseDashboardPage";
import { AdminDashboardPage } from "../features/admin/pages/AdminDashboardPage";
import { ManagerDashboardPage } from "../features/admin/pages/ManagerDashboardPage";

type StoredUser = {
  role: string;
};

const getStoredUser = (): StoredUser | null => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("user");
  if (!stored) return null;
  try {
    return JSON.parse(stored) as StoredUser;
  } catch {
    return null;
  }
};

function getRoleRedirectPath(role?: string): string {
  if (!role) return "/login";
  const normalized = role.toUpperCase();
  if (normalized === "ADMIN") return "/admin-dashboard";
  if (normalized === "MANAGER") return "/manager-dashboard";
  if (normalized === "EMPLOYEE") return "/expenses";
  return "/login";
}

function ProtectedRoute({ children, allowedRoles }: { children: ReactNode; allowedRoles: string[] }) {
  const user = getStoredUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const normalized = user.role.toUpperCase();
  if (!allowedRoles.map((r) => r.toUpperCase()).includes(normalized)) {
    return <Navigate to={getRoleRedirectPath(normalized)} replace />;
  }

  return children;
}

export function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={getRoleRedirectPath(getStoredUser()?.role)} replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/expenses"
          element={
            <ProtectedRoute allowedRoles={["EMPLOYEE", "MANAGER", "ADMIN"]}>
              <ExpenseDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses/new"
          element={
            <ProtectedRoute allowedRoles={["EMPLOYEE", "MANAGER", "ADMIN"]}>
              <ExpenseDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager-dashboard"
          element={
            <ProtectedRoute allowedRoles={["MANAGER"]}>
              <ManagerDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
