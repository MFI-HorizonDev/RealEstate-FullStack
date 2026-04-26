import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut } from "../apiClient";
import {BASE_URL} from"../config"

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
