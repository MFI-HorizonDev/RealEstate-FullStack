import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut } from "../apiClient";
import {BASE_URL} from"../config" 
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




