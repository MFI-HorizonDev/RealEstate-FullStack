import React from "react";
import { useAuth } from "@/services/api/useAuth";
import { hasRole, hasAnyRole, isSuperAdmin } from "@/services/api/useAuth";

/**
 * Component that renders children only if user has required role(s)
 * 
 * @param {React.ReactNode} children - Content to render if permission granted
 * @param {string|string[]} roles - Required role(s)
 * @param {React.ReactNode} fallback - Optional fallback content if permission denied
 * @param {boolean} requireAll - If true, user must have all roles (AND). If false, user must have any role (OR)
 */
export const CanAccess = ({ 
  children, 
  roles, 
  fallback = null, 
  requireAll = false 
}) => {
  const { user } = useAuth();

  if (!user) return fallback;

  // Allow super admin to access everything
  if (isSuperAdmin(user)) {
    return children;
  }

  const rolesArray = Array.isArray(roles) ? roles : [roles];
  
  let hasAccess = false;
  if (requireAll) {
    // User must have ALL specified roles
    hasAccess = rolesArray.every((role) => hasRole(user, role));
  } else {
    // User must have ANY of the specified roles
    hasAccess = hasAnyRole(user, rolesArray);
  }

  return hasAccess ? children : fallback;
};

/**
 * Component that renders children only if user is a super admin
 */
export const AdminOnly = ({ children, fallback = null }) => {
  const { user } = useAuth();

  if (!user) return fallback;

  return isSuperAdmin(user) ? children : fallback;
};

/**
 * Component that renders children only if user is logged in
 */
export const IfLoggedIn = ({ children, fallback = null }) => {
  const { isLoggedIn } = useAuth();

  return isLoggedIn ? children : fallback;
};

/**
 * Component that renders children only if user is NOT logged in
 */
export const IfNotLoggedIn = ({ children, fallback = null }) => {
  const { isLoggedIn } = useAuth();

  return !isLoggedIn ? children : fallback;
};

/**
 * Component that renders different content based on user's roles
 */
export const RoleBasedContent = ({ children }) => {
  const { user } = useAuth();

  return children(user);
};

export default {
  CanAccess,
  AdminOnly,
  IfLoggedIn,
  IfNotLoggedIn,
  RoleBasedContent,
};
