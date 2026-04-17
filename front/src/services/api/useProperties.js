import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "./config";

async function fetchProperties(token) {
  const response = await fetch(`${BASE_URL}/properties/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch properties: ${response.status} ${text}`);
  }

  return response.json();
}

export function useProperties({ token, enabled = true }) {
  return useQuery({
    queryKey: ["properties"],
    queryFn: () => fetchProperties(token),
    enabled,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
}
