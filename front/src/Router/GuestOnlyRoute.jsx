import { Navigate } from "react-router";
import { useAuth } from "@/services/api/useAuth";

export default function GuestOnlyRoute({ children }) {
  const { isLoggedIn } = useAuth();

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
}

