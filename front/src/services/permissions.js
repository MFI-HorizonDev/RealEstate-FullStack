/**
 * Permission utility functions for frontend access control
 */

import { isSuperAdmin, hasRole, hasAnyRole } from "./api/useAuth";

/**
 * Check if user can view admin features
 */
export const canAccessAdmin = (user) => {
  if (!user) return false;
  return isSuperAdmin(user) || hasRole(user, "Admin");
};

/**
 * Check if user can create listings
 */
export const canCreateListing = (user) => {
  if (!user) return false;
  return isSuperAdmin(user) || hasAnyRole(user, ["Owner", "Agent"]);
};

/**
 * Check if user can edit a listing
 */
export const canEditListing = (user, listingOwnerId) => {
  if (!user) return false;
  return isSuperAdmin(user) || user.id === listingOwnerId || hasRole(user, "Agent");
};

/**
 * Check if user can delete a listing
 */
export const canDeleteListing = (user, listingOwnerId) => {
  if (!user) return false;
  return isSuperAdmin(user) || user.id === listingOwnerId;
};

/**
 * Check if user can manage users (admin only)
 */
export const canManageUsers = (user) => {
  if (!user) return false;
  return isSuperAdmin(user);
};

/**
 * Check if user can book tours
 */
export const canBookTour = (user) => {
  if (!user) return false;
  return isSuperAdmin(user) || hasAnyRole(user, ["Buyer", "Owner"]);
};

/**
 * Check if user can approve sales
 */
export const canApproveSale = (user) => {
  if (!user) return false;
  return isSuperAdmin(user) || hasRole(user, "Admin");
};

/**
 * Check if user can view commissions
 */
export const canViewCommissions = (user) => {
  if (!user) return false;
  return isSuperAdmin(user) || hasAnyRole(user, ["Agent", "Admin"]);
};

/**
 * Get user role display name
 */
export const getUserRoleDisplay = (user) => {
  if (!user) return "Unknown";
  if (isSuperAdmin(user)) return "Super Admin";
  if (user.groups && user.groups.length > 0) {
    return user.groups.join(", ");
  }
  return "User";
};
