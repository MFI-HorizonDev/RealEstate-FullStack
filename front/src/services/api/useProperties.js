import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, fetchWithAuth } from "./apiClient";
import { BASE_URL } from "./config";

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


export function useProperty(id) {
  return useQuery({
    queryKey: ["property", id],
    queryFn: () => apiGet(`/properties/${id}/`),
    enabled: !!id,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error?.status === 401 || error?.status === 404) return false;
      return failureCount < 2;
    },
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiPost("/properties/create/", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
    },
  });
}

export function useUpdateProperty(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiPatch(`/properties/${id}/update/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property", String(id)] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

/**
 * Hook to upload images for a property
 */
export function useUploadPropertyImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ propertyId, images }) => {
      const uploadPromises = images.map((imageFile, index) => {
        const formData = new FormData();
        formData.append("image", imageFile);
        // Only mark the very first image as primary
        formData.append("is_primary", index === 0 ? "true" : "false");

        return fetchWithAuth(`${BASE_URL}/api/properties/${propertyId}/images/create/`, {
          method: "POST",
          body: formData,
        }).then(async (res) => {
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(JSON.stringify(err));
          }
          return res.json();
        });
      });

      return Promise.all(uploadPromises);
    },
    onSuccess: (_, { propertyId }) => {
      queryClient.invalidateQueries({ queryKey: ["property", propertyId] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

/**
 * Hook to delete a property image
 */
export function useDeletePropertyImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageId) => {
      const response = await fetchWithAuth(`${BASE_URL}/api/images/${imageId}/delete/`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || "Delete failed");
      }
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["property"] });
    },
  });
}

/**
 * Hook to update a property image
 */
export function useUpdatePropertyImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ imageId, data }) => {
      const response = await fetchWithAuth(`${BASE_URL}/api/images/${imageId}/update/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Update failed");
      try { return await response.json(); } catch { return null; }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}
