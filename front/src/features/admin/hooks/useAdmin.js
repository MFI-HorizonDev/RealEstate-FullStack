import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/utils/apiClient";

// ============ ADMIN USERS ============

/**
 * Fetch all users (admin only)
 */
export const useGetUsers = (params = {}) => {
  return useQuery({
    queryKey: ["adminUsers", params],
    queryFn: async () => {
      const queryString = new URLSearchParams(params).toString();
      return apiClient(`/api/admin/users/${queryString ? "?" + queryString : ""}`);
    },
    enabled: params.enabled !== false,
  });
};

/**
 * Fetch a single user by ID (admin only)
 */
export const useGetUserById = (userId) => {
  return useQuery({
    queryKey: ["adminUser", userId],
    queryFn: () => apiClient(`/api/admin/users/${userId}/`),
    enabled: !!userId,
  });
};

/**
 * Fetch user profile
 */
export const useGetUserProfile = (userId) => {
  return useQuery({
    queryKey: ["userProfile", userId],
    queryFn: () => apiClient(`/api/users/${userId}/`),
    enabled: !!userId,
  });
};

/**
 * Fetch current user profile
 */
export const useGetMyProfile = () => {
  return useQuery({
    queryKey: ["myProfile"],
    queryFn: () => apiClient("/api/me/"),
  });
};

// ============ ADMIN PROPERTIES ============

/**
 * Fetch all properties (admin view with all statuses)
 */
export const useGetAdminProperties = (params = {}) => {
  return useQuery({
    queryKey: ["adminProperties", params],
    queryFn: async () => {
      const queryString = new URLSearchParams(params).toString();
      return apiClient(
        `/api/admin/properties/${queryString ? "?" + queryString : ""}`
      );
    },
    enabled: params.enabled !== false,
  });
};

/**
 * Fetch admin view of single property
 */
export const useGetAdminPropertyById = (propertyId) => {
  return useQuery({
    queryKey: ["adminProperty", propertyId],
    queryFn: () => apiClient(`/api/admin/properties/${propertyId}/`),
    enabled: !!propertyId,
  });
};

/**
 * Fetch available agents (admin only)
 */
export const useGetAdminAgents = () => {
  return useQuery({
    queryKey: ["adminAgents"],
    queryFn: () => apiClient("/api/admin/agents/"),
  });
};

// ============ ROLE REQUESTS ============

/**
 * Fetch all role requests (admin only)
 */
export const useGetRoleRequests = (params = {}) => {
  return useQuery({
    queryKey: ["roleRequests", params],
    queryFn: async () => {
      const queryString = new URLSearchParams(params).toString();
      return apiClient(
        `/api/admin/role-requests/${queryString ? "?" + queryString : ""}`
      );
    },
    enabled: params.enabled !== false,
  });
};

// ============ ADMIN ACTIONS ============

/**
 * Update user profile (for any user, admin can update others)
 */
export const useUpdateUserProfile = (userId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileData) =>
      apiClient(`/api/profile/update/`, {
        method: "PUT",
        body: JSON.stringify(profileData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
};

/**
 * Handle role request (admin only)
 */
export const useHandleRoleRequest = (roleRequestId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (actionData) =>
      apiClient(`/api/admin/role-requests/${roleRequestId}/action/`, {
        method: "PUT",
        body: JSON.stringify(actionData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roleRequests"] });
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
  });
};

/**
 * Trigger market buffer update (admin only)
 */
export const useTriggerMarketUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient("/api/admin/trigger-market-update/", {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProperties"] });
    },
  });
};
