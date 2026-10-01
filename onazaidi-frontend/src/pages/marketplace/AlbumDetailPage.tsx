import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Container } from "@/components/layout/Container";
import { albumApi, type Album } from "@/services/api/albumApi";
import { photoApi } from "@/services/api/photoApi";
import { Folder, Image as ImageIcon, MapPin, Calendar } from "lucide-react";
import { formatCurrency } from "@/utils/format";
import { Spinner } from "@/components/ui/Spinner";

export function AlbumDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: album, isLoading: albumLoading, error: albumError } = useQuery({
    queryKey: ["album", slug],
    queryFn: () => albumApi.getBySlug(slug!),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: photos, isLoading: photosLoading } = useQuery({
    queryKey: ["album-photos", slug],
    queryFn: () => photoApi.list({ albumId: album?.id, size: 100 }),
    enabled: !!album?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (albumLoading) {
    return (
      <Container className="py-16">
        <div className="flex justify-center">
          <Spinner />
        </div>
      </Container>
    );
  }

  if (albumError || !album) {
    return (
      <Container className="py-16">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold text-sage-900 mb-2">Album not found</h1>
          <p className="text-sage-600">The album you're looking for doesn't exist.</p>
        </div>
      </Container>
    );
  }

  return (
    <div className="gradient-bg min-h-screen">
      {/* Album Header */}
      <section className="py-16 bg-white/50">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-soft">
                <Folder className="h-8 w-8" />
              </div>
              <div>
                <h1 className="font-heading text-4xl font-bold text-sage-900 mb-2">
                  {album.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-sage-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Created {new Date(album.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    <span>{photos?.totalElements || 0} photos</span>
                  </div>
                </div>
              </div>
            </div>
            {album.description && (
              <p className="text-lg text-sage-600 leading-relaxed max-w-2xl">
                {album.description}
              </p>
            )}
          </div>
        </Container>
      </section>

      {/* Photos Grid */}
      <section className="py-16">
        <Container>
          {photosLoading ? (
            <div className="text-center py-12">
              <Spinner />
              <p className="mt-4 text-sage-600">Loading photos...</p>
            </div>
          ) : photos && photos.content.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {photos.content.map((photo, index) => (
                <div
                  key={photo.id}
                  className="card-hover animate-scale-in group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="aspect-square bg-gradient-to-br from-sage-100 to-brand-50 overflow-hidden relative">
                    {photo.thumbnailUrl ? (
                      <img
                        src={photo.thumbnailUrl}
                        alt={photo.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sage-400">
                        <ImageIcon className="h-12 w-12" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-4">
                    <div className="font-heading font-semibold text-sage-900 truncate text-sm">
                      {photo.title}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-sage-600">
                      <MapPin className="h-3 w-3" />
                      <span>{photo.destinationName ?? "Tanzania"}</span>
                    </div>
                    <div className="mt-3 font-heading font-bold text-brand-600 text-sm">
                      {formatCurrency(photo.price, photo.currency)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-sage-100 mb-6">
                <ImageIcon className="h-10 w-10 text-sage-400" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-sage-900 mb-2">No photos yet</h3>
              <p className="text-sage-600 max-w-md mx-auto">
                This album is waiting for photographs. Check back soon!
              </p>
            </div>
          )}
        </Container>
      </section>
    </div>
  );
}
