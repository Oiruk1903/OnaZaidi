import { useQuery } from "@tanstack/react-query";
import { photoApi } from "@/services/api/photoApi";
import type { PhotoFilter } from "@/types/photo";

export function usePhotos(filter: PhotoFilter) {
  return useQuery({
    queryKey: ["photos", filter],
    queryFn: () => photoApi.list(filter),
    staleTime: 60_000,
  });
}

export function usePhoto(slug: string) {
  return useQuery({
    queryKey: ["photo", slug],
    queryFn: () => photoApi.getBySlug(slug),
    enabled: !!slug,
    staleTime: 60_000,
  });
}
