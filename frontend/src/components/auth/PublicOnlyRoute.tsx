import { Navigate } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";
import { getDefaultRouteForRole } from "../../features/auth/roleRoutes";

export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated && user) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return <>{children}</>;
}
