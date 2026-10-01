import type { Photo } from "@/types/photo";
import { PhotoCard } from "./PhotoCard";
import { Skeleton } from "@/components/ui/Skeleton";

export function PhotoGrid({
  photos,
  loading,
  skeletonCount = 8,
}: {
  photos?: Photo[];
  loading?: boolean;
  skeletonCount?: number;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="card overflow-hidden">
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-2 p-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!photos || photos.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {photos.map((p) => (
        <PhotoCard key={p.id} photo={p} />
      ))}
    </div>
  );
}
