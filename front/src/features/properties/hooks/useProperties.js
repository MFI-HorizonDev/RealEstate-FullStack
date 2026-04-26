import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/utils/apiClient";

// ============ GET HOOKS ============

/**
 * Fetch all properties with optional filters
 */
export const useGetProperties = (params = {}) => {
  return useQuery({
    queryKey: ["properties", params],
    queryFn: async () => {
      const queryString = new URLSearchParams(params).toString();
      return apiClient(`/api/properties/${queryString ? "?" + queryString : ""}`);
    },
    enabled: params.enabled !== false,
  });
};

/**
 * Fetch a single property by ID
 */
export const useGetPropertyById = (propertyId) => {
  return useQuery({
    queryKey: ["property", propertyId],
    queryFn: () => apiClient(`/api/properties/${propertyId}/`),
    enabled: !!propertyId,
  });
};

/**
 * Fetch property images
 */
export const useGetPropertyImages = (propertyId) => {
  return useQuery({
    queryKey: ["propertyImages", propertyId],
    queryFn: () => apiClient(`/api/properties/${propertyId}/images/`),
    enabled: !!propertyId,
  });
};

/**
 * Fetch property valuation preview
 */
export const useGetPropertyValuation = (propertyId) => {
  return useQuery({
    queryKey: ["propertyValuation", propertyId],
    queryFn: () => apiClient(`/api/properties/${propertyId}/valuation-preview/`),
    enabled: !!propertyId,
  });
};

/**
 * Fetch property amenities
 */
export const useGetPropertyAmenities = (propertyId) => {
  return useQuery({
    queryKey: ["propertyAmenities", propertyId],
    queryFn: () => apiClient(`/api/properties/${propertyId}/amenities/`),
    enabled: !!propertyId,
  });
};

// ============ CREATE HOOKS ============

/**
 * Create a new property
 */
export const useCreateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyData) =>
      apiClient("/api/properties/create/", {
        method: "POST",
        body: JSON.stringify(propertyData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
};

/**
 * Upload property image
 */
export const useCreatePropertyImage = (propertyId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageData) => {
      const formData = new FormData();
      formData.append("image", imageData.image);
      formData.append("alt_text", imageData.alt_text || "Property image");
      if (imageData.is_primary) {
        formData.append("is_primary", imageData.is_primary);
      }

      return fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/properties/${propertyId}/images/create/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: formData,
        }
      ).then((r) => (r.ok ? r.json() : Promise.reject(r)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["propertyImages", propertyId],
      });
    },
  });
};

/**
 * Create property amenity
 */
export const useCreatePropertyAmenity = (propertyId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (amenityData) =>
      apiClient(`/api/properties/${propertyId}/amenities/create/`, {
        method: "POST",
        body: JSON.stringify(amenityData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["propertyAmenities", propertyId],
      });
    },
  });
};

// ============ UPDATE HOOKS ============

/**
 * Update an existing property
 */
export const useUpdateProperty = (propertyId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyData) =>
      apiClient(`/api/properties/${propertyId}/update/`, {
        method: "PUT",
        body: JSON.stringify(propertyData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property", propertyId] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
};

/**
 * Update property image
 */
export const useUpdatePropertyImage = (imageId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageData) =>
      apiClient(`/api/images/${imageId}/update/`, {
        method: "PUT",
        body: JSON.stringify(imageData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["propertyImages"] });
    },
  });
};

/**
 * Update property amenity
 */
export const useUpdatePropertyAmenity = (amenityId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (amenityData) =>
      apiClient(`/api/amenities/${amenityId}/update/`, {
        method: "PUT",
        body: JSON.stringify(amenityData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["propertyAmenities"] });
    },
  });
};

/**
 * Update property admin status (admin only)
 */
export const useUpdatePropertyAdminStatus = (propertyId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (statusData) =>
      apiClient(`/api/properties/${propertyId}/admin-status/`, {
        method: "PUT",
        body: JSON.stringify(statusData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property", propertyId] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
};

/**
 * Assign agent to property (admin only)
 */
export const useAssignPropertyAgent = (propertyId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (agentData) =>
      apiClient(`/api/properties/${propertyId}/admin-agent/`, {
        method: "PUT",
        body: JSON.stringify(agentData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property", propertyId] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
};

// ============ DELETE HOOKS ============

/**
 * Delete a property
 */
export const useDeleteProperty = (propertyId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient(`/api/properties/${propertyId}/delete/`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
};

/**
 * Delete property image
 */
export const useDeletePropertyImage = (imageId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient(`/api/images/${imageId}/delete/`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["propertyImages"] });
    },
  });
};

/**
 * Delete property amenity
 */
export const useDeletePropertyAmenity = (amenityId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient(`/api/amenities/${amenityId}/delete/`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["propertyAmenities"] });
    },
  });
};
