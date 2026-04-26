import { useQuery } from "@tanstack/react-query";
import { apiGet } from "./apiClient";

export function useValuationPreview({ propertyId, formData, enabled = true } = {}) {
  const params = new URLSearchParams();
  if (formData) {
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });
  }

  const queryString = params.toString() ? `?${params.toString()}` : "";

  return useQuery({
    queryKey: ["valuation-preview", propertyId, formData],
    queryFn: () => apiGet(`/properties/${propertyId}/valuation-preview/${queryString}`),
    enabled: enabled && Boolean(propertyId),
    staleTime: 0,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error?.status === 401) return false;
      return failureCount < 2;
    },
  });
}

