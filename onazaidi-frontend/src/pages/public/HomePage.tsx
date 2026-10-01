import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Container } from "@/components/layout/Container";
import { destinationApi } from "@/services/api/destinationApi";
import { photoApi } from "@/services/api/photoApi";
import { routes } from "@/config/routes";
import { formatCurrency } from "@/utils/format";
import { Camera, MapPin, ArrowRight } from "lucide-react";

export function HomePage() {
  const { data: destinations } = useQuery({
    queryKey: ["destinations"],
    queryFn: destinationApi.list,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: featured } = useQuery({
    queryKey: ["photos", "featured"],
    queryFn: () => photoApi.list({ size: 8, sort: "latest" }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <div className="gradient-bg">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-400/20 via-white to-earth-100/30"></div>
        <Container className="relative py-32 sm:py-40">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-6 animate-slide-up">
              <span>Capture the magic of Tanzania</span>
            </div>
            <h1 className="font-heading text-5xl sm:text-7xl font-bold text-sage-900 mb-6 leading-tight animate-fade-in">
              See Tanzania <span className="gradient-text">differently</span>
            </h1>
            <p className="text-xl text-sage-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '100ms' }}>
              Discover extraordinary moments captured across Tanzania's breathtaking destinations — from the majestic Serengeti to the pristine beaches of Zanzibar.
            </p>
            <div className="flex flex-wrap gap-4 justify-center animate-slide-up" style={{ animationDelay: '200ms' }}>
              <Link to={routes.photos} className="btn-primary group">
                <span className="flex items-center gap-2">
                  Explore Photographs
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link
                to={routes.destinations}
                className="btn-secondary"
              >
                Browse Destinations
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Destinations */}
      {destinations && destinations.length > 0 && (
        <section className="py-24">
          <Container>
            <div className="text-center mb-16">
              <h2 className="section-title mx-auto animate-fade-in">Explore Destinations</h2>
              <p className="section-subtitle mx-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
                Journey through Tanzania's most stunning locations, each offering unique photographic opportunities
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {destinations.slice(0, 5).map((d, index) => (
                <Link
                  key={d.id}
                  to={routes.destinationDetail(d.slug)}
                  className="group animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="card-hover aspect-[4/5] bg-gradient-to-br from-brand-100 to-earth-100 flex flex-col items-center justify-center p-6 text-center transition-all duration-500">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center mb-4 shadow-glow group-hover:scale-110 transition-transform duration-300">
                      <MapPin className="h-8 w-8 text-white" />
                    </div>
                    <div className="font-heading text-lg font-bold text-sage-900 group-hover:text-brand-600 transition-colors">{d.name}</div>
                    {d.region && (
                      <div className="text-sm text-sage-600 mt-1">{d.region}</div>
                    )}
                    <div className="mt-4 text-brand-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Explore →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* About Dennis */}
      <section className="py-24 bg-white/50">
        <Container>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-6">
              <span>Meet the Photographer</span>
            </div>
            <h2 className="section-title mx-auto mb-6">Dennis Yamat</h2>
            <p className="text-sage-600 text-lg max-w-3xl mx-auto leading-relaxed mb-8">
              Born in Arusha, Tanzania, Dennis developed a deep passion for wildlife from a young age while visiting his father in the Serengeti National Park. Today, he's a professional wildlife guide and photographer based at Serengeti Under Canvas, capturing breathtaking moments of the African wilderness.
            </p>
          </div>

          <div className="text-center">
            <p className="text-sage-600 text-lg mb-6 max-w-3xl mx-auto leading-relaxed">
              With extensive training from Mweka College of African Wildlife Management and hands-on experience in conservation across Tanzania and South Africa, Dennis brings unique expertise to every photograph and safari experience.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to={routes.photos}
                className="inline-flex items-center gap-2 btn-primary group"
              >
                <span>View Dennis's Photos</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to={routes.about}
                className="btn-secondary"
              >
                Learn More About Dennis
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Featured photos */}
      {featured && featured.content.length > 0 && (
        <section className="py-24 bg-white/50">
          <Container>
            <div className="text-center mb-16">
              <h2 className="section-title mx-auto">Latest Captures</h2>
              <p className="section-subtitle mx-auto">
                Fresh perspectives from our talented photographers, ready to bring your memories to life
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featured.content.map((p, index) => (
                <Link
                  key={p.id}
                  to={routes.photoDetail(p.slug)}
                  className="group animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="card-hover overflow-hidden">
                    <div className="aspect-square bg-gradient-to-br from-sage-100 to-brand-50 overflow-hidden relative">
                      {p.thumbnailUrl ? (
                        <img
                          src={p.thumbnailUrl}
                          alt={p.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sage-400">
                          <Camera className="h-12 w-12" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="p-6">
                      <div className="font-heading font-semibold text-sage-900 truncate text-lg">
                        {p.title}
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-sm text-sage-600">
                        <MapPin className="h-4 w-4" />
                        <span>{p.destinationName ?? "Tanzania"}</span>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="font-heading font-bold text-brand-600 text-lg">
                          {formatCurrency(p.price, p.currency)}
                        </div>
                        <div className="text-sage-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          View →
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24">
        <Container>
          <div className="card p-12 text-center bg-gradient-to-br from-brand-500 to-brand-600 text-white">
            <div className="max-w-2xl mx-auto">
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                Ready to capture your story?
              </h2>
              <p className="text-brand-100 text-lg mb-8">
                Join thousands of travelers who have preserved their Tanzanian memories with our stunning photography
              </p>
              <Link to={routes.photos} className="btn bg-white text-brand-600 hover:bg-brand-50">
                Start Exploring
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
