import { useState } from "react";
import { Container } from "@/components/layout/Container";
import { PhotoGrid } from "@/components/photos/PhotoGrid";
import { PhotoFilters } from "@/components/photos/PhotoFilters";
import { EmptyState } from "@/components/ui/EmptyState";
import { usePhotos } from "@/services/hooks/usePhotos";
import { useDestinations } from "@/services/hooks/useDestinations";
import type { PhotoFilter } from "@/types/photo";

export function PhotosPage() {
  const [filter, setFilter] = useState<PhotoFilter>({
    page: 0,
    size: 12,
    sort: "latest",
  });

  const { data: destinations } = useDestinations();
  const { data, isLoading, isFetching } = usePhotos(filter);

  const total = data?.totalElements ?? 0;
  const page = filter.page ?? 0;
  const size = filter.size ?? 12;
  const totalPages = data?.totalPages ?? 0;

  return (
    <Container className="py-12">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold text-gray-900">
          Photographs
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {total > 0
            ? `${total} photograph${total === 1 ? "" : "s"} available`
            : "Discover Tanzania through professional photography."}
        </p>
      </div>

      <div className="space-y-8">
        <PhotoFilters
          filter={filter}
          onChange={setFilter}
          destinations={destinations ?? []}
        />

        <div>
          <PhotoGrid
            photos={data?.content}
            loading={isLoading}
            skeletonCount={size}
          />

          {!isLoading && data?.content.length === 0 && (
            <EmptyState
              title="No photographs found"
              description="Try adjusting your filters or search terms."
            />
          )}

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-between">
              <button
                onClick={() =>
                  setFilter((f) => ({ ...f, page: Math.max(0, page - 1) }))
                }
                disabled={page === 0 || isFetching}
                className="btn-secondary"
              >
                ← Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setFilter((f) => ({
                    ...f,
                    page: Math.min(totalPages - 1, page + 1),
                  }))
                }
                disabled={page >= totalPages - 1 || isFetching}
                className="btn-secondary"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
