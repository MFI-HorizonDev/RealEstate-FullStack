/**
 * API Client with automatic authentication header handling
 */

import { API_BASE_URL, BASE_URL } from "./config";

const TOKEN_REFRESH_URL = `${API_BASE_URL}/token/refresh/`;
let tokenRefreshPromise = null;

/**
 * Clear all auth tokens from storage
 */
const clearTokens = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  document.cookie = "access=; path=/; SameSite=Strict; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "refresh=; path=/; SameSite=Strict; expires=Thu, 01 Jan 1970 00:00:00 GMT";
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

const getStoredToken = (key) => {
  // Compatibility fallback during migration: still read localStorage tokens.
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
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  const data = await parseJsonSafely(response);
  if (!response.ok || !isTokenLike(data?.access)) {
    clearTokens();
    return null;
  }

  // Do NOT store tokens in localStorage — rely on httpOnly cookies set by the server.
  // If the server returns tokens in the response body (non-httpOnly flow), store only in cookie.
  if (isTokenLike(data?.access)) {
    document.cookie = `access=${encodeURIComponent(data.access)}; path=/; SameSite=Strict`;
  }
  if (isTokenLike(data?.refresh)) {
    document.cookie = `refresh=${encodeURIComponent(data.refresh)}; path=/; SameSite=Strict`;
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
    "ngrok-skip-browser-warning": "true",
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
  assertTrustedUrl(url);
  console.log(`API Request: ${options.method || "GET"} ${url}`);

  try {
    let accessToken = await getValidAccessToken();
    let response = await fetch(url, {
      ...options,
      credentials: "include",
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
          response = await fetch(url, {
            ...options,
            credentials: "include",
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

      const error = new Error(errorData?.detail || `HTTP ${response.status}`);
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

const TRUSTED_ORIGIN = new URL(BASE_URL).origin;

/**
 * Validate a URL is within the trusted backend origin before fetching.
 * Throws if the URL points outside the allowed host.
 */
const assertTrustedUrl = (url) => {
  try {
    const parsed = new URL(url);
    if (parsed.origin !== TRUSTED_ORIGIN) {
      throw new Error(`Untrusted request origin: ${parsed.origin}`);
    }
  } catch (e) {
    if (e.message.startsWith("Untrusted")) throw e;
    throw new Error(`Invalid URL: ${url}`);
  }
};

/**
 * Raw fetch with auth + ngrok headers (for multipart/FormData requests)
 */
export const fetchWithAuth = (url, options = {}) => {
  assertTrustedUrl(url);
  const token = getStoredToken("access");
  const headers = {
    "ngrok-skip-browser-warning": "true",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  return fetch(url, { ...options, headers });
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
