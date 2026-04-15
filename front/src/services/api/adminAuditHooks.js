import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "./config";

function getAuthHeaders(token) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error("Request failed");
  }
  return response.json();
}

async function fetchFlaggedListings(token) {
  const listings = await fetchJson(`${BASE_URL}/properties/?status=UNDER_REVIEW`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });

  const underReview = Array.isArray(listings)
    ? listings.filter((item) => item.status === "UNDER_REVIEW")
    : [];

  const withValuation = await Promise.all(
    underReview.map(async (item) => {
      try {
        const valuation = await fetchJson(
          `${BASE_URL}/properties/${item.id}/valuation-preview/`,
          {
            method: "GET",
            headers: getAuthHeaders(token),
          }
        );
        const engineBasePrice = Number(valuation?.estimated_total || 0);
        const requestedPrice = Number(item?.price || 0);
        const deviation = engineBasePrice
          ? ((requestedPrice - engineBasePrice) / engineBasePrice) * 100
          : 0;

        return {
          ...item,
          engineBasePrice,
          deviation,
        };
      } catch {
        return {
          ...item,
          engineBasePrice: 0,
          deviation: 0,
        };
      }
    })
  );

  return withValuation;
}

export function useFlaggedListings(token) {
  return useQuery({
    queryKey: ["flagged-listings"],
    queryFn: () => fetchFlaggedListings(token),
    refetchOnWindowFocus: false,
  });
}

export function useApproveListing(token) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (propertyId) => {
      return fetchJson(`${BASE_URL}/properties/${propertyId}/`, {
        method: "PATCH",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ status: "ACTIVE" }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flagged-listings"] });
    },
  });
}

export function useRejectListing(token) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (propertyId) => {
      return fetchJson(`${BASE_URL}/properties/${propertyId}/`, {
        method: "PATCH",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ status: "REJECTED" }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flagged-listings"] });
    },
  });
}

