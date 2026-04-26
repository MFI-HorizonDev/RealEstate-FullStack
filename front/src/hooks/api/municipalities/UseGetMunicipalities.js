import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../apiClient";

const toList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

const toEndpointFromNextUrl = (nextUrl) => {
  if (!nextUrl) return null;
  try {
    const parsed = new URL(nextUrl);
    const normalizedPath = parsed.pathname.startsWith("/api/")
      ? parsed.pathname.replace(/^\/api/, "")
      : parsed.pathname;
    return `${normalizedPath}${parsed.search}`;
  } catch {
    return nextUrl.startsWith("/api/") ? nextUrl.replace(/^\/api/, "") : nextUrl;
  }
};

export function useMunicipalities({ enabled = true } = {}) {
  return useQuery({
    queryKey: ["municipalities"],
    queryFn: async () => {
      const payload = await apiGet("/municipalities/");
      const all = toList(payload);
      let next = payload?.next || null;

      while (next) {
        const endpoint = toEndpointFromNextUrl(next);
        const nextPage = await apiGet(endpoint);
        all.push(...toList(nextPage));
        next = nextPage?.next || null;
      }

      return all;
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
