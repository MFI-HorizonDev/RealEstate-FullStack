import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet } from "../apiClient";

const normalizeOptions = (pageOrOptions) => {
  if (typeof pageOrOptions === "number") {
    return { page: pageOrOptions, enabled: true, status: null };
  }

  if (typeof pageOrOptions === "object" && pageOrOptions !== null) {
    return {
      page: Number.isInteger(pageOrOptions.page) && pageOrOptions.page > 0 ? pageOrOptions.page : 1,
      enabled: pageOrOptions.enabled ?? true,
      status: pageOrOptions.status ?? null,
    };
  }

  return { page: 1, enabled: true, status: null };
};

export function useProperties(pageOrOptions = 1) {
  const { page, enabled, status } = normalizeOptions(pageOrOptions);
  
  const url = status 
    ? `/properties/?page=${page}&status=${status}`
    : `/properties/?page=${page}`;

  return useQuery({
    queryKey: ["properties", page, status],
    queryFn: () => apiGet(url),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error?.status === 401) return false;
      return failureCount < 2;
    },
  });
}
