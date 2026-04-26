import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/utils/apiClient";

// ============ GET HOOKS ============

/**
 * Fetch current user profile
 */
export const useGetMyProfile = () => {
  return useQuery({
    queryKey: ["myProfile"],
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

/**
 * Fetch current user's owned properties
 */
export const useGetMyProperties = (params = {}) => {
  return useQuery({
    queryKey: ["myProperties", params],
    queryFn: async () => {
      const queryString = new URLSearchParams({
        owner: "me",
        ...params,
      }).toString();
      return apiClient(`/api/properties/?${queryString}`);
    },
  });
};

/**
 * Fetch current user's listed properties (for agents)
 */
export const useGetMyListings = (params = {}) => {
  return useQuery({
    queryKey: ["myListings", params],
    queryFn: async () => {
      const queryString = new URLSearchParams({
        agent: "me",
        ...params,
      }).toString();
      return apiClient(`/api/properties/?${queryString}`);
    },
  });
};

// ============ UPDATE HOOKS ============

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
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
};
