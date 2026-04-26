import { BASE_URL } from "@/hooks/api/config";

/**
 * Centralized API client using native fetch
 * Handles:
 * - Authorization header injection
 * - Token refresh logic
 * - Error handling
 */

const getAuthToken = () => {
  const token = localStorage.getItem("access_token");
  return token;
};

const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("access_token", token);
  } else {
    localStorage.removeItem("access_token");
  }
};

const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(`${BASE_URL}/api/token/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    const data = await response.json();
    setAuthToken(data.access);
    return data.access;
  } catch (error) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
    throw error;
  }
};

export const apiClient = async (
  endpoint,
  options = {},
  retryCount = 0
) => {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle 401 - Token expired
    if (response.status === 401 && retryCount === 0) {
      const newToken = await refreshToken();
      return apiClient(endpoint, options, retryCount + 1);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.detail || response.statusText);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    return response.json();
  } catch (error) {
    throw error;
  }
};

export default apiClient;
