import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../apiClient";

const toList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

export function useMunicipalities({ enabled = true } = {}) {
  return useQuery({
    queryKey: ["municipalities"],
    queryFn: async () => {
      const payload = await apiGet("/municipalities/");
      return toList(payload);
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes - places don't change often
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error?.status === 401) return false;
      return failureCount < 2;
    },
  });
}
