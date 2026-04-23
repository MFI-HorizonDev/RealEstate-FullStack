import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet } from "./apiClient";

const BASE_URL = "http://127.0.0.1:8000";

const normalizeToken = (value) => {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") {
    return null;
  }

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
};

const isTokenLike = (token) => typeof token === "string" && token.split(".").length === 3;

// Login hook - uses TanStack Query mutation
export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password }) => {
      const response = await fetch(`${BASE_URL}/api/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.non_field_errors?.[0] || "Login failed");
      }

      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      window.dispatchEvent(new Event("auth-changed"));
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

// Hook to fetch current user profile
export const useUser = () => {
  const isLoggedIn = isUserLoggedIn();
  return useQuery({
    queryKey: ["user"],
    queryFn: () => apiGet("/me/"),
    enabled: isLoggedIn,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
};

// Compound auth hook
export const useAuth = () => {
  const loginMutation = useLogin();
  const { data: user, isLoading, isError } = useUser();
  
  const logoutUser = () => {
    logout();
    window.location.href = "/";
  };

  return { 
    loginMutation, 
    user, 
    isLoading, 
    isError,
    logout: logoutUser,
    isLoggedIn: isUserLoggedIn(),
    isSuperAdmin: user?.is_superuser || false,
    groups: user?.groups || [],
  };
};

// Signup hook
export const useSignup = () => {
  return useMutation({
    mutationFn: async (userData) => {
      const response = await fetch(`${BASE_URL}/api/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        const err = new Error(data.detail || "Registration failed");
        err.data = data;
        throw err;
      }

      return data;
    },
  });
};

// Logout
export const logout = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  window.dispatchEvent(new Event("auth-changed"));
};

// Check if user is logged in
export const isUserLoggedIn = () => {
  const accessToken = normalizeToken(localStorage.getItem("access"));
  const refreshToken = normalizeToken(localStorage.getItem("refresh"));
  return isTokenLike(accessToken) || isTokenLike(refreshToken);
};

// Helper functions for permission checking
export const hasRole = (user, role) => {
  if (!user) return false;
  return user.groups && user.groups.includes(role);
};

export const hasAnyRole = (user, roles) => {
  if (!user) return false;
  return roles.some((role) => hasRole(user, role));
};

export const isSuperAdmin = (user) => {
  if (!user) return false;
  return user.is_superuser === true;
};

export const canEditProperty = (user, propertyOwnerId) => {
  if (!user) return false;
  return isSuperAdmin(user) || user.id === propertyOwnerId || hasRole(user, "Agent");
};

export const canDeleteProperty = (user, propertyOwnerId) => {
  if (!user) return false;
  return isSuperAdmin(user) || user.id === propertyOwnerId;
};

