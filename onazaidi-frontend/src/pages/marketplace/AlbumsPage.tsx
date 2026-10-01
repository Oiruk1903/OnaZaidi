import { useQuery } from "@tanstack/react-query";
import { Container } from "@/components/layout/Container";
import { albumApi, type Album } from "@/services/api/albumApi";
import { Folder, Image as ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { routes } from "@/config/routes";

export function AlbumsPage() {
  const { data: albums, isLoading, error } = useQuery({
    queryKey: ["albums"],
    queryFn: albumApi.list,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return (
    <div className="gradient-bg min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-400/20 via-white to-earth-100/30"></div>
        <Container className="relative py-24 sm:py-32">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-6">
              <span>Curated Collections</span>
            </div>
            <h1 className="font-heading text-5xl sm:text-7xl font-bold text-sage-900 mb-6 leading-tight">
              Photo <span className="gradient-text">Albums</span>
            </h1>
            <p className="text-xl text-sage-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Explore beautifully curated collections of photographs from Tanzania's most stunning destinations
            </p>
          </div>
        </Container>
      </section>

      {/* Albums Grid */}
      <section className="py-24">
        <Container>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brand-200 border-t-brand-600"></div>
              <p className="mt-4 text-sage-600">Loading albums...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-sage-600">Failed to load albums. Please try again later.</p>
            </div>
          ) : albums && albums.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {albums.map((album, index) => (
                <Link
                  key={album.id}
                  to={routes.albumDetail(album.slug)}
                  className="group animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="card-hover h-full p-8 flex flex-col">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white mb-6 shadow-soft group-hover:scale-110 transition-transform">
                      <Folder className="h-8 w-8" />
                    </div>
                    <h3 className="font-heading text-xl font-bold text-sage-900 mb-3 group-hover:text-brand-600 transition-colors">
                      {album.title}
                    </h3>
                    {album.description && (
                      <p className="text-sage-600 text-sm leading-relaxed mb-4 flex-1">
                        {album.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-sage-400 text-sm">
                      <ImageIcon className="h-4 w-4" />
                      <span>Collection</span>
                    </div>
                    <div className="mt-4 text-brand-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      View collection →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-sage-100 mb-6">
                <Folder className="h-10 w-10 text-sage-400" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-sage-900 mb-2">No albums yet</h3>
              <p className="text-sage-600 max-w-md mx-auto">
                Our photographers are busy creating beautiful collections. Check back soon!
              </p>
            </div>
          )}
        </Container>
      </section>
    </div>
  );
}
