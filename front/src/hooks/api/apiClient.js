import { API_BASE_URL } from "./config";

const TOKEN_REFRESH_URL = `${API_BASE_URL}/token/refresh/`;
let tokenRefreshPromise = null;

/**
 * Clear all auth tokens from storage
 */
const clearTokens = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  document.cookie = "access=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "refresh=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
};

/**
 * Normalize token value read from storage
 */
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

const getCookieToken = (key) => {
  if (typeof document === "undefined") return null;
  const cookieName = `${key}=`;
  const parts = document.cookie.split(";");
  for (let i = 0; i < parts.length; i += 1) {
    const cookie = parts[i].trim();
    if (cookie.startsWith(cookieName)) {
      return normalizeToken(decodeURIComponent(cookie.slice(cookieName.length)));
    }
  }
  return null;
};

const getStoredToken = (key) => {
  // apiClient.js is a plain module, so useCookies() cannot be used here.
  // Read cookie directly, then fallback to localStorage for compatibility.
  const fromCookie = getCookieToken(key);
  if (fromCookie) return fromCookie;
  return normalizeToken(localStorage.getItem(key));
};

const isTokenLike = (token) => typeof token === "string" && token.split(".").length === 3;

const parseJsonSafely = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const extractErrorMessage = (errorData, status) => {
  if (!errorData) return `HTTP ${status}`;
  if (typeof errorData.detail === "string" && errorData.detail.trim()) return errorData.detail;
  if (Array.isArray(errorData.non_field_errors) && errorData.non_field_errors[0]) {
    return errorData.non_field_errors[0];
  }

  for (const [field, value] of Object.entries(errorData)) {
    if (field === "detail") continue;
    if (Array.isArray(value) && value[0]) return `${field}: ${value[0]}`;
    if (typeof value === "string" && value.trim()) return `${field}: ${value}`;
  }

  return `HTTP ${status}`;
};

/**
 * Attempt to refresh access token using stored refresh token.
 */
const refreshAccessToken = async () => {
  const refreshToken = getStoredToken("refresh");
  if (!isTokenLike(refreshToken)) {
    clearTokens();
    return null;
  }

  const response = await fetch(TOKEN_REFRESH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  const data = await parseJsonSafely(response);
  if (!response.ok || !isTokenLike(data?.access)) {
    clearTokens();
    return null;
  }

  localStorage.setItem("access", data.access);
  if (isTokenLike(data?.refresh)) {
    localStorage.setItem("refresh", data.refresh);
  }

  return data.access;
};

/**
 * Resolve a valid access token (refreshes when needed).
 */
const getValidAccessToken = async () => {
  const accessToken = getStoredToken("access");
  if (isTokenLike(accessToken)) {
    return accessToken;
  }

  if (!tokenRefreshPromise) {
    tokenRefreshPromise = refreshAccessToken().finally(() => {
      tokenRefreshPromise = null;
    });
  }

  return tokenRefreshPromise;
};

const buildHeaders = (accessToken, extraHeaders = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
};

/**
 * Make authenticated API request
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`API Request: ${options.method || "GET"} ${url}`);

  try {
    let accessToken = await getValidAccessToken();
    console.log("Token being sent:", accessToken);
    let response = await fetch(url, {
      ...options,
      headers: buildHeaders(accessToken, options.headers),
    });

    if (!response.ok) {
      let errorData = await parseJsonSafely(response);

      const tokenInvalid =
        response.status === 401 &&
        (errorData?.code === "token_not_valid" ||
          (typeof errorData?.detail === "string" &&
            errorData.detail.toLowerCase().includes("token")));

      if (tokenInvalid) {
        accessToken = await refreshAccessToken();

        if (accessToken) {
          console.log("Token being sent:", accessToken);
          response = await fetch(url, {
            ...options,
            headers: buildHeaders(accessToken, options.headers),
          });

          if (response.ok) {
            return response.status === 204 ? null : await parseJsonSafely(response);
          }

          errorData = await parseJsonSafely(response);
          if (response.status === 401) {
            clearTokens();
            errorData = {
              ...(errorData || {}),
              detail: "Session expired. Please sign in again.",
            };
          }
        } else {
          errorData = {
            ...(errorData || {}),
            detail: "Session expired. Please sign in again.",
          };
        }
      }

      // Do not force-logout on any generic 401.
      // Some endpoints can return 401/403 for permissions while session is still valid.

      const error = new Error(extractErrorMessage(errorData, response.status));
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    return response.status === 204 ? null : await parseJsonSafely(response);
  } catch (error) {
    console.error(`API Error: ${error.message}`);
    throw error;
  }
};

/**
 * GET request
 */
export const apiGet = (endpoint, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: "GET",
  });
};

/**
 * POST request
 */
export const apiPost = (endpoint, body, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: "POST",
    body: JSON.stringify(body),
  });
};

/**
 * PUT request
 */
export const apiPut = (endpoint, body, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: "PUT",
    body: JSON.stringify(body),
  });
};

/**
 * PATCH request
 */
export const apiPatch = (endpoint, body, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: "PATCH",
    body: JSON.stringify(body),
  });
};

/**
 * DELETE request
 */
export const apiDelete = (endpoint, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: "DELETE",
  });
};
