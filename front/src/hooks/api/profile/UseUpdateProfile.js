import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "../config";

const safeJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData) => {
      const isFormData = profileData instanceof FormData;
      const response = await fetch(`${BASE_URL}/api/profile/update/`, {
        method: "PATCH",
        headers: isFormData
          ? {
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            }
          : {
              Authorization: `Bearer ${localStorage.getItem("access")}`,
              "Content-Type": "application/json",
            },
        body: isFormData ? profileData : JSON.stringify(profileData),
      });

      if (!response.ok) {
        const error = await safeJson(response);
        throw new Error(error?.detail || "Failed to update profile");
      }

      return safeJson(response);
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueryData(["userProfile"], data);
        queryClient.setQueryData(["user"], data);
      }
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};
