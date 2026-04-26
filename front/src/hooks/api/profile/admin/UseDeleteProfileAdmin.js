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
 * Hook to delete a user (admin only)
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId) => {
      const response = await fetch(`${BASE_URL}/api/admin/users/${userId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });

      if (!response.ok) {
        const error = await safeJson(response);
        throw new Error(error?.detail || "Failed to delete user");
      }

      // DELETE typically returns 204 No Content — no body to parse
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
};
