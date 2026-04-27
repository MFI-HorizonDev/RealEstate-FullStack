const rawBaseUrl =
  typeof import.meta !== "undefined" ? import.meta.env?.VITE_API_BASE_URL?.trim() : undefined;

const fallbackBaseUrl = typeof window !== "undefined" ? window.location.origin : "http://127.0.0.1:8000";

export const BASE_URL = (rawBaseUrl || fallbackBaseUrl).replace(/\/+$/, "");
export const API_BASE_URL = `${BASE_URL}/api`;
