import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet } from "../apiClient";

const normalizeOptions = (pageOrOptions) => {
  if (typeof pageOrOptions === "number") {
    return { page: pageOrOptions, enabled: true, status: null, allPages: false };
  }

  if (typeof pageOrOptions === "object" && pageOrOptions !== null) {
    return {
      page: Number.isInteger(pageOrOptions.page) && pageOrOptions.page > 0 ? pageOrOptions.page : 1,
      enabled: pageOrOptions.enabled ?? true,
      status: pageOrOptions.status ?? null,
      allPages: pageOrOptions.allPages ?? false,
    };
  }

  return { page: 1, enabled: true, status: null, allPages: false };
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

export function useProperties(pageOrOptions = 1) {
  const { page, enabled, status, allPages } = normalizeOptions(pageOrOptions);
  
  const url = status 
    ? `/properties/?page=${page}&status=${status}`
    : `/properties/?page=${page}`;

  return useQuery({
    queryKey: ["properties", page, status, allPages],
    queryFn: async () => {
      const firstPage = await apiGet(url);
      if (!allPages || !firstPage?.next) return firstPage;

      const combinedResults = Array.isArray(firstPage?.results) ? [...firstPage.results] : [];
      let next = firstPage.next;
      while (next) {
        const endpoint = toEndpointFromNextUrl(next);
        const nextPage = await apiGet(endpoint);
        if (Array.isArray(nextPage?.results)) {
          combinedResults.push(...nextPage.results);
        }
        next = nextPage?.next || null;
      }

      return {
        ...firstPage,
        count: combinedResults.length,
        next: null,
        previous: null,
        results: combinedResults,
      };
    },
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
