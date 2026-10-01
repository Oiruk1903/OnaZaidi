import { useParams } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { PhotoGrid } from "@/components/photos/PhotoGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useDestination } from "@/services/hooks/useDestinations";
import { usePhotos } from "@/services/hooks/usePhotos";
import { getDestinationConfig } from "@/config/destinations";

export function DestinationDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: dest, isLoading } = useDestination(slug!);

  const { data: photos, isLoading: photosLoading } = usePhotos({
    destinationId: dest?.id,
    size: 12,
    page: 0,
    sort: "latest",
  });

  if (isLoading) {
    return (
      <Container className="flex justify-center py-32">
        <Spinner className="h-8 w-8 text-brand-600" />
      </Container>
    );
  }

  if (!dest) {
    return (
      <Container className="py-32 text-center">
        <h1 className="font-display text-2xl font-bold">
          Destination not found
        </h1>
      </Container>
    );
  }

  const config = getDestinationConfig(dest.slug, dest.name);

  return (
    <div>
      <section className="relative h-[480px] md:h-[600px] overflow-hidden bg-gray-900">
        <img
          src={config.heroImage}
          alt={dest.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

        <Container className="relative flex h-full flex-col justify-end pb-12 text-white">
          {dest.region && (
            <div className="text-xs uppercase tracking-[0.2em] text-white/80">
              {dest.region}
            </div>
          )}
          <h1 className="mt-2 font-display text-4xl md:text-6xl font-bold">
            {dest.name}
          </h1>
          <p className="mt-3 text-lg italic text-white/95 md:text-2xl">
            {config.tagline}
          </p>

          {config.features.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {config.features.map((f) => (
                <li
                  key={f}
                  className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm"
                >
                  {f}
                </li>
              ))}
            </ul>
          )}

          {dest.description && (
            <p className="mt-6 max-w-2xl text-sm text-white/85 md:text-base">
              {dest.description}
            </p>
          )}
        </Container>
      </section>

      <Container className="py-16">
        <h2 className="font-display text-2xl font-bold">
          Photographs from {dest.name}
        </h2>
        <div className="mt-8">
          {photosLoading ? (
            <PhotoGrid loading skeletonCount={6} />
          ) : photos && photos.content.length > 0 ? (
            <PhotoGrid photos={photos.content} />
          ) : (
            <EmptyState
              title="No photographs for this destination yet"
              description="Check back soon."
            />
          )}
        </div>
      </Container>
    </div>
  );
}