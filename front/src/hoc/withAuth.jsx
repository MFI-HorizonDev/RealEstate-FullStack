import React from "react";
import { Navigate } from "react-router";
import { isUserLoggedIn, hasRole, hasAnyRole, isSuperAdmin } from "@/hooks/api/authentication/useAuth";
import { useAuth } from "@/hooks/api/authentication/useAuth";

/**
 * Higher-Order Component (HOC) to protect routes with permission-based access control.
 * 
 * @param {React.Component} WrappedComponent - The component to wrap
 * @param {string|string[]|null} requiredRoles - Optional role(s) required to access this component
 * @param {boolean} requireSuperAdmin - If true, only super admins can access
 * @returns {React.Component} - The wrapped, protected component
 */
const withAuth = (WrappedComponent, requiredRoles = null, requireSuperAdmin = false) => {
  return (props) => {
    const isLoggedIn = isUserLoggedIn();
    const { user, isLoading } = useAuth();

    // Show loading state while fetching user data
    if (isLoggedIn && isLoading) {
      return <div className="flex items-center justify-center min-h-[100dvh]">Loading...</div>;
    }

    // Redirect to login if the user is not authenticated
    if (!isLoggedIn) {
      return <Navigate to="/login" replace />;
    }

    // Check for super admin requirement
    if (requireSuperAdmin && !isSuperAdmin(user)) {
      return <Navigate to="/" replace />;
    }

    // Role-based access control (RBAC) - optional
    if (requiredRoles && !requireSuperAdmin) {
      const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      
      // Allow super admin to access any protected route
      const hasAccess = isSuperAdmin(user) || hasAnyRole(user, rolesArray);
      
      if (!hasAccess) {
        return <Navigate to="/" replace />;
      }
    }

    // Render the wrapped component with all its props if all checks pass
    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
