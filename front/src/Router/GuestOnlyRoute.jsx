import { Navigate } from "react-router";
import { useAuth } from "@/services/api/useAuth";

export default function GuestOnlyRoute({ children }) {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return children;
  }

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
}

