import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch } from "../apiClient";
import { BASE_URL } from "../config";

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

  return useMutation({
    mutationFn: async ({ propertyId, images }) => {
      const accessToken = localStorage.getItem("access");
      const uploadPromises = images.map((imageFile, index) => {
        const formData = new FormData();
        formData.append("image", imageFile);
        // Only mark the very first image as primary
        formData.append("is_primary", index === 0 ? "true" : "false");

        return fetch(`${BASE_URL}/api/properties/${propertyId}/images/create/`, {
          method: "POST",
          credentials: "include",
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            // Do NOT set Content-Type — browser sets it with the correct boundary for multipart
          },
          body: formData,
        }).then(async (res) => {
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            const error = new Error(err?.detail || "Upload failed");
            error.data = err;
            error.status = res.status;
            throw error;
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
      const accessToken = localStorage.getItem("access");
      const response = await fetch(`${BASE_URL}/api/images/${imageId}/delete/`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        const error = new Error(err.detail || "Delete failed");
        error.data = err;
        error.status = response.status;
        throw error;
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
      const response = await fetch(`${BASE_URL}/api/images/${imageId}/update/`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Update failed");
      // 200 with body, or 204 with no body
      try { return await response.json(); } catch { return null; }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}
