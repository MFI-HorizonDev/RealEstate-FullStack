import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/utils/apiClient";

// ============ GET HOOKS ============

/**
 * Fetch all tours with optional filters
 */
export const useGetTours = (params = {}) => {
  return useQuery({
    queryKey: ["tours", params],
    queryFn: async () => {
      const queryString = new URLSearchParams(params).toString();
      return apiClient(`/api/tours/${queryString ? "?" + queryString : ""}`);
    },
    enabled: params.enabled !== false,
  });
};

/**
 * Fetch a single tour by ID
 */
export const useGetTourById = (tourId) => {
  return useQuery({
    queryKey: ["tour", tourId],
    queryFn: () => apiClient(`/api/tours/${tourId}/`),
    enabled: !!tourId,
  });
};

// ============ CREATE HOOKS ============

/**
 * Create a new tour
 */
export const useCreateTour = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tourData) =>
      apiClient("/api/tours/", {
        method: "POST",
        body: JSON.stringify(tourData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tours"] });
    },
  });
};

// ============ UPDATE HOOKS ============

/**
 * Agent action on tour (accept/reject/confirm)
 */
export const useUpdateTourAgentAction = (tourId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (actionData) =>
      apiClient(`/api/tours/${tourId}/agent-action/`, {
        method: "PUT",
        body: JSON.stringify(actionData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tour", tourId] });
      queryClient.invalidateQueries({ queryKey: ["tours"] });
    },
  });
};

/**
 * Manage tour (admin/owner action)
 */
export const useManageTour = (tourId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (manageData) =>
      apiClient(`/api/tours/${tourId}/manage/`, {
        method: "PUT",
        body: JSON.stringify(manageData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tour", tourId] });
      queryClient.invalidateQueries({ queryKey: ["tours"] });
    },
  });
};

// ============ DELETE HOOKS ============

/**
 * Delete a tour
 */
export const useDeleteTour = (tourId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient(`/api/tours/${tourId}/`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tours"] });
    },
  });
};
