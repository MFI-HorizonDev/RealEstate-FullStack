import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);
const BASE_URL = "http://127.0.0.1:8000";

function normalizeToken(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") return null;
  return trimmed;
}

async function customFetch(url, token, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [isMeValid, setIsMeValid] = useState(false);

  const accessToken = normalizeToken(localStorage.getItem("access"));

  useEffect(() => {
    let isMounted = true;

    const fetchMe = async () => {
      if (!accessToken) {
        if (isMounted) {
          setUser(null);
          setGroups([]);
          setIsMeValid(false);
        }
        return;
      }

      try {
        const response = await customFetch(`${BASE_URL}/api/me/`, accessToken, {
          method: "GET",
        });

        if (!isMounted) return;

        if (response.ok) {
          const data = await response.json();
          const fetchedGroups = Array.isArray(data?.groups) ? data.groups : [];
          setUser(data);
          setGroups(fetchedGroups);
          console.log("Context updated:", { user: data, groups: fetchedGroups });
          setIsMeValid(true);
          return;
        }

        const errData = await response.json().catch(() => ({}));
        console.error("AUTH /api/me/ failed:", response.status, errData);
        setUser(null);
        setGroups([]);
        setIsMeValid(false);
      } catch (err) {
        if (!isMounted) return;
        console.error("AUTH fetch threw:", err);
        setUser(null);
        setGroups([]);
        setIsMeValid(false);
      }
    };

    fetchMe();

    return () => {
      isMounted = false;
    };
  }, [accessToken]);

  const authValue = useMemo(() => {
    const isAuthenticated = groups.length > 0 || user !== null;

    return {
      user,
      groups,
      isAuthenticated,
      isAdmin: user?.is_superuser === true,
      isAgent: groups.includes("Agent"),
      isVerifiedAgent: groups.includes("Verified Agents"),
      isOwner: groups.includes("Owner"),
      isBuyer: groups.includes("Buyer"),
    };
  }, [accessToken, isMeValid, user, groups]);

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

