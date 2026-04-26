import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/utils/apiClient";

// ============ SALES - GET HOOKS ============

/**
 * Fetch all sales with optional filters
 */
export const useGetSales = (params = {}) => {
  return useQuery({
    queryKey: ["sales", params],
    queryFn: async () => {
      const queryString = new URLSearchParams(params).toString();
      return apiClient(`/api/sales/${queryString ? "?" + queryString : ""}`);
    },
    enabled: params.enabled !== false,
  });
};

/**
 * Fetch a single sale by ID
 */
export const useGetSaleById = (saleId) => {
  return useQuery({
    queryKey: ["sale", saleId],
    queryFn: () => apiClient(`/api/sales/${saleId}/`),
    enabled: !!saleId,
  });
};

// ============ SALES - CREATE HOOKS ============

/**
 * Create a new sale
 */
export const useCreateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (saleData) =>
      apiClient("/api/sales/create/", {
        method: "POST",
        body: JSON.stringify(saleData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });
};

// ============ SALES - UPDATE HOOKS ============

/**
 * Update an existing sale
 */
export const useUpdateSale = (saleId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (saleData) =>
      apiClient(`/api/sales/${saleId}/update/`, {
        method: "PUT",
        body: JSON.stringify(saleData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sale", saleId] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });
};

/**
 * Approve/reject sale (admin only)
 */
export const useApproveSale = (saleId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (approvalData) =>
      apiClient(`/api/admin-sales/approve/${saleId}/`, {
        method: "PUT",
        body: JSON.stringify(approvalData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sale", saleId] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });
};

// ============ SALES - DELETE HOOKS ============

/**
 * Delete a sale
 */
export const useDeleteSale = (saleId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient(`/api/sales/${saleId}/delete/`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });
};

// ============ PENDING SALES - GET HOOKS ============

/**
 * Fetch all pending sales with optional filters
 */
export const useGetPendingSales = (params = {}) => {
  return useQuery({
    queryKey: ["pendingSales", params],
    queryFn: async () => {
      const queryString = new URLSearchParams(params).toString();
      return apiClient(
        `/api/pending-sales/${queryString ? "?" + queryString : ""}`
      );
    },
    enabled: params.enabled !== false,
  });
};

/**
 * Fetch a single pending sale by ID
 */
export const useGetPendingSaleById = (pendingSaleId) => {
  return useQuery({
    queryKey: ["pendingSale", pendingSaleId],
    queryFn: () => apiClient(`/api/pending-sales/${pendingSaleId}/`),
    enabled: !!pendingSaleId,
  });
};

// ============ PENDING SALES - UPDATE HOOKS ============

/**
 * Update a pending sale (approve/reject/modify)
 */
export const useUpdatePendingSale = (pendingSaleId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pendingSaleData) =>
      apiClient(`/api/pending-sales/${pendingSaleId}/update/`, {
        method: "PUT",
        body: JSON.stringify(pendingSaleData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingSale", pendingSaleId] });
      queryClient.invalidateQueries({ queryKey: ["pendingSales"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });
};
