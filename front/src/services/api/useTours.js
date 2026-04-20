import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch } from "./apiClient";

const toList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

export function useTours({ enabled = true } = {}) {
  return useQuery({
    queryKey: ["tours"],
    queryFn: async () => {
      const payload = await apiGet("/tours/");
      return toList(payload);
    },
    enabled,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error?.status === 401) return false;
      return failureCount < 2;
    },
  });
}

export function useCreateTour() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tourData) => apiPost("/tours/", tourData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tours"] });
    },
  });
}

export function useTourAgentAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => apiPatch(`/tours/${id}/agent-action/`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tours"] });
    },
  });
}
