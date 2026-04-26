import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, fetchWithAuth } from "./apiClient";
import { BASE_URL } from "./config";
import { useAuth as useContextAuth } from "@/context/AuthContext";

const isTokenLike = (token) => typeof token === "string" && token.split(".").length === 3;

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

const setTokenCookie = (key, value) => {
  document.cookie = `${key}=${encodeURIComponent(value)}; path=/; SameSite=Strict`;
};

const clearTokenCookie = (key) => {
  document.cookie = `${key}=; path=/; SameSite=Strict; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

const getCookieToken = (key) => {
  const cookieName = `${key}=`;
  for (const part of document.cookie.split(";")) {
    const cookie = part.trim();
    if (cookie.startsWith(cookieName))
      return normalizeToken(decodeURIComponent(cookie.slice(cookieName.length)));
  }
  return null;
};

// Login hook - uses TanStack Query mutation
export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password }) => {
      const response = await fetchWithAuth(`${BASE_URL}/api/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });

      let data = null;
      try { data = await response.json(); } catch { /* empty body */ }

      if (!response.ok) {
        throw new Error(data?.detail || data?.non_field_errors?.[0] || "Login failed");
      }

      return data;
    },
    onSuccess: (data) => {
      if (data?.access) localStorage.setItem("access", data.access);
      if (data?.refresh) localStorage.setItem("refresh", data.refresh);
      if (isTokenLike(data.access))  setTokenCookie("access", data.access);
      if (isTokenLike(data.refresh)) setTokenCookie("refresh", data.refresh);
      window.dispatchEvent(new Event("auth-changed"));
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

// Hook to fetch current user profile
export const useUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: () => apiGet("/me/"),
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
};

// Compound auth hook
export const useAuth = () => {
  const auth = useContextAuth();
  const loginMutation = useLogin();

  const logoutUser = () => {
    logout();
    window.location.href = "/";
  };

  return {
    loginMutation,
    user: auth.user,
    isLoading: auth.isAuthLoading,
    isError: false,
    logout: logoutUser,
    isLoggedIn: !auth.isAuthLoading && auth.isAuthenticated,
    isSuperAdmin: auth.isSuperAdmin,
    groups: auth.groups,
  };
};

// Signup hook
export const useSignup = () => {
  return useMutation({
    mutationFn: async (userData) => {
      const response = await fetchWithAuth(`${BASE_URL}/api/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      let data = null;
      try { data = await response.json(); } catch { /* empty body */ }

      if (!response.ok) {
        const err = new Error(data?.detail || "Registration failed");
        err.data = data;
        throw err;
      }

      if (data?.access) localStorage.setItem("access", data.access);
      if (data?.refresh) localStorage.setItem("refresh", data.refresh);
      window.dispatchEvent(new Event("auth-changed"));
      return data;
    },
  });
};

// Logout
export const logout = () => {
  fetch(`${BASE_URL}/api/logout/`, {
    method: "POST",
    credentials: "include",
  }).catch(() => {});
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  clearTokenCookie("access");
  clearTokenCookie("refresh");
  window.dispatchEvent(new Event("auth-changed"));
};

// Check if user is logged in
export const isUserLoggedIn = () => {
  const fromCookie = (key) => {
    const cookieName = `${key}=`;
    for (const part of document.cookie.split(";")) {
      const c = part.trim();
      if (c.startsWith(cookieName))
        return normalizeToken(decodeURIComponent(c.slice(cookieName.length)));
    }
    return null;
  };
  // Check cookies first, fall back to localStorage for backward compat
  const access  = fromCookie("access")  || normalizeToken(localStorage.getItem("access"));
  const refresh = fromCookie("refresh") || normalizeToken(localStorage.getItem("refresh"));
  return isTokenLike(access) || isTokenLike(refresh);
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

