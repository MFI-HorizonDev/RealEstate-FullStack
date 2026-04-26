import React from "react";
import { Navigate } from "react-router";
import { useAuth } from "@/features/auth/context/AuthContext";

/**
 * WithAuth HOC - Wraps routes that require authentication
 * Redirects to login if not authenticated
 */
export const WithAuth = (Component, requiredRoles = []) => {
  return function ProtectedRoute(props) {
    const { isAuthenticated, user, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    // Check roles if specified
    if (requiredRoles.length > 0) {
      const userRole = user?.role || user?.user_role;
      if (!requiredRoles.includes(userRole)) {
        return <Navigate to="/unauthorized" replace />;
      }
    }

    return <Component {...props} />;
  };
};

/**
 * WithoutAuth HOC - Wraps routes that should only be accessible when not authenticated
 * Redirects to dashboard if already authenticated
 */
export const WithoutAuth = (Component) => {
  return function GuestOnlyRoute(props) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      );
    }

    if (isAuthenticated) {
      return <Navigate to="/dashboard" replace />;
    }

    return <Component {...props} />;
  };
};

/**
 * withAdminRole - Wrapper to require admin role
 */
export const withAdminRole = (Component) => {
  return WithAuth(Component, ["ADMIN", "SUPER_ADMIN"]);
};

/**
 * withAgentRole - Wrapper to require agent role
 */
export const withAgentRole = (Component) => {
  return WithAuth(Component, ["AGENT"]);
};

/**
 * withOwnerRole - Wrapper to require owner role
 */
export const withOwnerRole = (Component) => {
  return WithAuth(Component, ["OWNER", "AGENT", "ADMIN", "SUPER_ADMIN"]);
};
