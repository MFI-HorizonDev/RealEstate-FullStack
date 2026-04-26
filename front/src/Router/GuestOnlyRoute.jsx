import { Navigate } from "react-router";
import { useAuth } from "@/services/api/useAuth";

export default function GuestOnlyRoute({ children }) {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
}

