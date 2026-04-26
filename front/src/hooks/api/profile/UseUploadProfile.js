import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "../config";

const safeJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

/**
 * Hook to upload profile image
 */
export const useUploadProfileImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageFile) => {
      const formData = new FormData();
      formData.append("profile_image", imageFile);

      const response = await fetch(`${BASE_URL}/api/profile/update/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
          // Do NOT set Content-Type — browser sets multipart boundary automatically
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await safeJson(response);
        throw new Error(error?.profile_image?.[0] || error?.detail || "Failed to upload profile image");
      }

      // 200/204 — return data if present, null otherwise
      return safeJson(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};
