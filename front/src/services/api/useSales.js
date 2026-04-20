import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut } from "./apiClient";

const toList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

export function useSales({ enabled = true } = {}) {
  return useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const payload = await apiGet("/sales/");
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

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (saleData) => apiPost("/sales/create/", saleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });
}

export function useUpdateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ saleId, saleData }) => apiPut(`/sales/${saleId}/update/`, saleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });
}
