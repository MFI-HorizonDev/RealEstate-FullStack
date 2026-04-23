import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch, apiPost } from "./apiClient";

const toList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

async function fetchFlaggedListings(status = "UNDER_REVIEW") {
  const listingsPayload = await apiGet(`/properties/?status=${status}`);
  const filtered = toList(listingsPayload);

  const withValuation = await Promise.all(
    filtered.map(async (item) => {
      try {
        const valuation = await apiGet(`/properties/${item.id}/valuation-preview/`);
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

export function useFlaggedListings(token, status = "UNDER_REVIEW") {
  return useQuery({
    queryKey: ["flagged-listings", status],
    queryFn: () => fetchFlaggedListings(status),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error?.status === 401) return false;
      return failureCount < 2;
    },
  });
}


export function useApproveListing(token) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (propertyId) => {
      return apiPatch(`/properties/${propertyId}/admin-status/`, { status: "ACTIVE" });
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
      // Rejection: set status to REJECTED
      return apiPatch(`/properties/${propertyId}/admin-status/`, { status: "REJECTED" });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flagged-listings"] });
    },
  });
}

export function useRoleRequests(token, status = "PENDING", roles = ["Agent", "Owner"]) {
  const roleQuery = roles.length ? `&role=${roles.join(",")}` : "";
  return useQuery({
    queryKey: ["role-requests", status, roles],
    queryFn: async () => {
      const payload = await apiGet(`/admin/role-requests/?status=${status}${roleQuery}`);
      return toList(payload);
    },
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });
}

export function useApproveRoleRequest(token) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileId) =>
      apiPatch(`/admin/role-requests/${profileId}/action/`, { action: "approve" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role-requests"] });
    },
  });
}

export function useRejectRoleRequest(token) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileId) =>
      apiPatch(`/admin/role-requests/${profileId}/action/`, { action: "reject" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role-requests"] });
    },
  });
}

export function useTriggerMarketUpdate(token) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => apiPost("/admin/trigger-market-update/", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flagged-listings"] });
    },
  });
}

