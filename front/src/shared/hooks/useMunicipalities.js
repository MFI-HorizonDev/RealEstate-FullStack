import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/utils/apiClient";

// ============ GET HOOKS ============

/**
 * Fetch all municipalities
 */
export const useGetMunicipalities = (params = {}) => {
  return useQuery({
    queryKey: ["municipalities", params],
    queryFn: async () => {
      const queryString = new URLSearchParams(params).toString();
      return apiClient(
        `/api/municipalities/${queryString ? "?" + queryString : ""}`
      );
    },
  });
};

/**
 * Fetch a single municipality by ID
 */
export const useGetMunicipalityById = (municipalityId) => {
  return useQuery({
    queryKey: ["municipality", municipalityId],
    queryFn: () => apiClient(`/api/municipalities/${municipalityId}/`),
    enabled: !!municipalityId,
  });
};

// ============ CREATE HOOKS ============

/**
 * Create a new municipality (admin only)
 */
export const useCreateMunicipality = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (municipalityData) =>
      apiClient("/api/municipalities/create/", {
        method: "POST",
        body: JSON.stringify(municipalityData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["municipalities"] });
    },
  });
};

// ============ UPDATE HOOKS ============

/**
 * Update a municipality (admin only)
 */
export const useUpdateMunicipality = (municipalityId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (municipalityData) =>
      apiClient(`/api/municipalities/${municipalityId}/update/`, {
        method: "PUT",
        body: JSON.stringify(municipalityData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["municipality", municipalityId],
      });
      queryClient.invalidateQueries({ queryKey: ["municipalities"] });
    },
  });
};

// ============ DELETE HOOKS ============

/**
 * Delete a municipality (admin only)
 */
export const useDeleteMunicipality = (municipalityId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient(`/api/municipalities/${municipalityId}/delete/`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["municipalities"] });
    },
  });
};
