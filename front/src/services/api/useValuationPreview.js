import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "./config";

async function fetchValuationPreview({ propertyId, formData, token }) {
  if (!propertyId) {
    throw new Error("propertyId is required");
  }

  const params = new URLSearchParams();
  Object.entries(formData || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });

  const url = `${BASE_URL}/properties/${propertyId}/valuation-preview/?${params.toString()}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch valuation preview");
  }

  return response.json();
}

export function useValuationPreview({ propertyId, formData, token, enabled = true }) {
  return useQuery({
    queryKey: ["valuation-preview", propertyId, formData],
    queryFn: () => fetchValuationPreview({ propertyId, formData, token }),
    enabled: enabled && Boolean(propertyId),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

