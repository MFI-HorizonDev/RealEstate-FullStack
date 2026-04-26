/**
 * Frontend permission helpers for property operations.
 * These mirror the backend owner-only policy for listing writes.
 */

/**
 * Returns true if the authenticated user is allowed to edit or delete the given property.
 *
 * Conditions:
 *  - User is SuperAdmin / superuser
 *  - User is the property owner
 *
 * @param {object|null} authContext - The value from useAuth() / AuthContext
 * @param {object|null} property    - The property object from the API
 * @returns {boolean}
 */
export function canEditProperty(authContext, property) {
  if (!authContext || !property) return false;

  if (authContext.user?.is_superuser) return true;
  if (authContext.user?.groups?.includes("SuperAdmin") || authContext.user?.groups?.includes("Super Admin")) {
    return true;
  }

  const userId = authContext.user?.id;
  if (!userId) return false;

  if (property.owner_id !== undefined && userId === property.owner_id) return true;

  return false;
}

/**
 * Resolves a profile image path to an absolute URL.
 * If the path is already absolute (starts with http), it is returned as-is.
 * If the path is relative, BASE_URL is prepended.
 *
 * @param {string|null|undefined} path    - The image path from the API
 * @param {string} baseUrl                - The BASE_URL constant
 * @returns {string|null}
 */
export function resolveProfileImageUrl(path, baseUrl) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${baseUrl}${path}`;
}
