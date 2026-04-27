/**
 * Base backend origin (no trailing slash). Example for ngrok:
 * VITE_API_BASE_URL=https://xxxx.ngrok-free.app
 */
const RAW_BASE_URL =
  typeof import.meta !== "undefined" ? import.meta.env?.VITE_API_BASE_URL : undefined;

export const BASE_URL =
  (typeof RAW_BASE_URL === "string" && RAW_BASE_URL.trim() ? RAW_BASE_URL.trim() : null) ||
  (typeof window !== "undefined" ? window.location.origin : "http://127.0.0.1:8000");

export const API_BASE_URL = `${BASE_URL.replace(/\/+$/, "")}/api`;