import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/utils/apiClient";

// ============ GET HOOKS ============

/**
 * Fetch current user profile with auth check
 */
export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: () => apiClient("/api/me/"),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Fetch any user profile by ID
 */
export const useGetUserProfile = (userId) => {
  return useQuery({
    queryKey: ["userProfile", userId],
    queryFn: () => apiClient(`/api/users/${userId}/`),
    enabled: !!userId,
  });
};

// ============ AUTH MUTATIONS ============

/**
 * Register new user
 */
export const useRegister = () => {
  return useMutation({
    mutationFn: (userData) =>
      apiClient("/api/register/", {
        method: "POST",
        body: JSON.stringify(userData),
      }),
  });
};

/**
 * Login user
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials) =>
      apiClient("/api/token/", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
    onSuccess: (data) => {
      if (data.access && data.refresh) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      }
    },
  });
};

/**
 * Logout user
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      // Backend might not need a specific logout endpoint
      // Just clear local storage
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

/**
 * Refresh authentication token
 */
export const useRefreshToken = () => {
  return useMutation({
    mutationFn: async () => {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      return apiClient("/api/token/refresh/", {
        method: "POST",
        body: JSON.stringify({ refresh: refreshToken }),
      });
    },
    onSuccess: (data) => {
      if (data.access) {
        localStorage.setItem("access_token", data.access);
      }
    },
  });
};

// ============ PROFILE UPDATE HOOKS ============

/**
 * Update current user profile
 */
export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileData) =>
      apiClient("/api/profile/update/", {
        method: "PUT",
        body: JSON.stringify(profileData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
};

// ============ UTILITY FUNCTIONS ============

/**
 * Check if user is logged in
 */
export const isUserLoggedIn = () => {
  return !!localStorage.getItem("access_token");
};

/**
 * Get stored auth token
 */
export const getAuthToken = () => {
  return localStorage.getItem("access_token");
};

/**
 * Get stored refresh token
 */
export const getRefreshToken = () => {
  return localStorage.getItem("refresh_token");
};

/**
 * Clear auth tokens
 */
export const clearAuthTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};
