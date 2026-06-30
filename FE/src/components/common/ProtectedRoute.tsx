import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "@/features/authentication/store/auth.store";

interface ProtectedRouteProps {
  allowedRoles?: ("USER" | "ADMIN")[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
