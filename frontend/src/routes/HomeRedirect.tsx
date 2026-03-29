import { Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/context/AuthContext";
import { getDefaultRouteForRole } from "../features/auth/roleRoutes";

export function HomeRedirect() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
}
