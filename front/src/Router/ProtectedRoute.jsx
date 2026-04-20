import { Navigate } from "react-router";
import { useAuth } from "@/services/api/useAuth";

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { user, isLoading, isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  if (requiredRole) {
    const hasRole = user?.groups?.includes(requiredRole) || user?.is_superuser || user?.groups?.includes("SuperAdmin") || user?.groups?.includes("Super Admin");
    if (!hasRole) {
      // If user doesn't have the role, redirect to home or a forbidden page
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

