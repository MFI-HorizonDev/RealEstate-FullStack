import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch } from "./apiClient";

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
  const BASE_URL = "http://127.0.0.1:8000";

  return useMutation({
    mutationFn: async ({ propertyId, images }) => {
      const uploadPromises = images.map((imageFile, index) => {
        const formData = new FormData();
        formData.append("image", imageFile);
        // Only mark the very first image as primary
        formData.append("is_primary", index === 0 ? "true" : "false");

        return fetch(`${BASE_URL}/api/properties/${propertyId}/images/create/`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("access")}`,
            // Do NOT set Content-Type — browser sets it with the correct boundary for multipart
          },
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
  const BASE_URL = "http://127.0.0.1:8000";

  return useMutation({
    mutationFn: async (imageId) => {
      const response = await fetch(`${BASE_URL}/api/images/${imageId}/delete/`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access")}`,
        },
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
  const BASE_URL = "http://127.0.0.1:8000";

  return useMutation({
    mutationFn: async ({ imageId, data }) => {
      const response = await fetch(`${BASE_URL}/api/images/${imageId}/update/`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Update failed");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}
