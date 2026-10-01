import { Link } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDestinations } from "@/services/hooks/useDestinations";
import { routes } from "@/config/routes";
import { getDestinationConfig } from "@/config/destinations";

export function DestinationsPage() {
  const { data, isLoading } = useDestinations();

  return (
    <Container className="py-12">
      <h1 className="font-display text-3xl font-bold text-gray-900">
        Destinations
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Explore Tanzania through our curated collections.
      </p>

      <div className="mt-10">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-xl bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <EmptyState
            title="No destinations yet"
            description="Check back soon for new collections."
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((d) => {
              const config = getDestinationConfig(d.slug, d.name);
              return (
                <Link
                  key={d.id}
                  to={routes.destinationDetail(d.slug)}
                  className="group card overflow-hidden"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
                    <img
                      src={config.heroImage}
                      alt={d.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                      <div className="font-display text-2xl font-semibold">
                        {d.name}
                      </div>
                      <div className="mt-1 text-sm italic text-white/90">
                        {config.tagline}
                      </div>
                      {d.region && (
                        <div className="mt-1 text-xs uppercase tracking-wider text-white/70">
                          {d.region}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Container>
  );
}