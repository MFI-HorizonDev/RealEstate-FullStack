import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut } from "./apiClient";

const BASE_URL = "http://127.0.0.1:8000";

/**
 * Hook to fetch current user's profile
 */
export const useUserProfile = () => {
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: () => apiGet("/me/"),
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to update user profile (without image)
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profileData) => {
      const response = await fetch(`${BASE_URL}/api/profile/update/`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access")}`,
        },
        body: profileData, // FormData for multipart
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to update profile");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

/**
 * Hook to upload profile image
 */
export const useUploadProfileImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageFile) => {
      const formData = new FormData();
      formData.append("profile_image", imageFile);

      const response = await fetch(`${BASE_URL}/api/profile/update/`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.profile_image?.[0] || "Failed to upload profile image");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

/**
 * Hook to fetch another user's profile by ID
 */
export const useGetUserProfile = (userId, options = {}) => {
  return useQuery({
    queryKey: ["userProfile", userId],
    queryFn: () => apiGet(`/users/${userId}/`),
    enabled: !!userId,
    retry: false,
    ...options,
  });
};

/**
 * Hook to fetch all users (admin only)
 */
export const useAllUsers = (options = {}) => {
  return useQuery({
    queryKey: ["allUsers"],
    queryFn: () => apiGet("/admin/users/"),
    retry: false,
    ...options,
  });
};

/**
 * Hook to update a user (admin only)
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, userData }) => {
      const response = await fetch(`${BASE_URL}/api/admin/users/${userId}/`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to update user");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

/**
 * Hook to delete a user (admin only)
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId) => {
      const response = await fetch(`${BASE_URL}/api/admin/users/${userId}/`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access")}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to delete user");
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
};
