import { useMutation, useQuery } from "@tanstack/react-query";
import { apiGet, apiPost } from "../apiClient";

export function useValuationPreview(id) {
  return useQuery({
    queryKey: ["property-valuation", id],
    queryFn: () => apiGet(`/properties/${id}/valuation-preview/`),
    enabled: !!id,
  });
}

export function useValuationPreviewPOST() {
  return useMutation({
    mutationFn: (data) => apiPost(`/properties/valuation-preview/`, data),
  });
}
