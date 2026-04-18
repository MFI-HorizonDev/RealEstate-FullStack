import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { BASE_URL } from "./config";

async function fetchPropertiesPage({ page, token }) {
  const response = await fetch(`${BASE_URL}/properties/?page=${page}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch properties.");
  }

  return response.json();
}

export function useProperties(page) {
  const [cookies] = useCookies(["access"]);
  const token = cookies.access;

  return useQuery({
    queryKey: ["properties", page],
    queryFn: () => fetchPropertiesPage({ page, token }),
    placeholderData: keepPreviousData,
  });
}

