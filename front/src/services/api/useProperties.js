import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { BASE_URL } from "./config";

async function fetchProperties({ page, token }) {
  const response = await fetch(`${BASE_URL}/properties/?page=${page}`, {
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

export function useProperties(page) {
  const [cookies] = useCookies(["access", "access_token", "token"]);
  const token = cookies.access || cookies.access_token || cookies.token;

  return useQuery({
    queryKey: ["properties", page],
    queryFn: () => fetchProperties({ page, token }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });
}
