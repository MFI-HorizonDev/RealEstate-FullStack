import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { BASE_URL } from "@/hooks/api/config";

const AuthContext = createContext(null);

function getAccessTokenFromStorage() {
  const raw = localStorage.getItem("access");
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") return null;
  return trimmed;
}

async function customFetch(url, options = {}) {
  const token = getAccessTokenFromStorage();
  return fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "ngrok-skip-browser-warning": "true",
      ...(options.headers || {}),
    },
  });
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [isMeValid, setIsMeValid] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authNonce, setAuthNonce] = useState(0);

  useEffect(() => {
    const refreshAuth = () => setAuthNonce((prev) => prev + 1);
    window.addEventListener("storage", refreshAuth);
    window.addEventListener("auth-changed", refreshAuth);
    window.addEventListener("profile-updated", refreshAuth);
    return () => {
      window.removeEventListener("storage", refreshAuth);
      window.removeEventListener("auth-changed", refreshAuth);
      window.removeEventListener("profile-updated", refreshAuth);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchMe = async () => {
      try {
        const response = await customFetch(`${BASE_URL}/api/me/`, {
          method: "GET",
        });

        if (!isMounted) return;

        if (response.ok) {
          const data = await response.json();
          const fetchedGroups = Array.isArray(data?.groups) ? data.groups : [];
          setUser(data);
          setGroups(fetchedGroups);
          setIsMeValid(true);
          setIsAuthLoading(false);
          return;
        }

        setUser(null);
        setGroups([]);
        setIsMeValid(false);
        setIsAuthLoading(false);
      } catch (err) {
        if (!isMounted) return;
        setUser(null);
        setGroups([]);
        setIsMeValid(false);
        setIsAuthLoading(false);
      }
    };

    fetchMe();

    return () => {
      isMounted = false;
    };
  }, [authNonce]);

  const authValue = useMemo(() => {
    const isAuthenticated = groups.length > 0 || user !== null;

    const isSuperAdmin = user?.is_superuser === true || groups.includes("SuperAdmin") || groups.includes("Super Admin");

    return {
      user,
      groups,
      isAuthLoading,
      isAuthenticated,
      isAdmin: user?.is_superuser === true || user?.is_staff === true || groups.includes("Admin") || isSuperAdmin,
      isSuperAdmin,
      isAgent: groups.includes("Agent"),
      isVerifiedAgent: groups.includes("Verified Agents"),
      isOwner: groups.includes("Owner"),
      isBuyer: groups.includes("Buyer"),
    };
  }, [isMeValid, isAuthLoading, user, groups]);

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
