import { useQuery } from "@tanstack/react-query";
import { destinationApi } from "@/services/api/destinationApi";

export function useDestinations() {
  return useQuery({
    queryKey: ["destinations"],
    queryFn: destinationApi.list,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useDestination(slug: string) {
  return useQuery({
    queryKey: ["destination", slug],
    queryFn: () => destinationApi.getBySlug(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
