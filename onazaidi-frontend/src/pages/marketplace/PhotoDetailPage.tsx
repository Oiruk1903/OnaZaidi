import { useParams, useNavigate, Link } from "react-router-dom";
import { ShoppingCart, Zap, ArrowLeft } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Spinner } from "@/components/ui/Spinner";
import { usePhoto } from "@/services/hooks/usePhotos";
import { useAddToCart } from "@/services/hooks/useCart";
import { useCartUIStore } from "@/app/store/cartStore";
import { useAuthStore } from "@/app/store/authStore";
import { formatCurrency } from "@/utils/format";
import { routes } from "@/config/routes";

export function PhotoDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: photo, isLoading } = usePhoto(slug!);
  const add = useAddToCart();
  const openDrawer = useCartUIStore((s) => s.openDrawer);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Container className="flex justify-center py-32">
        <Spinner className="h-8 w-8 text-brand-600" />
      </Container>
    );
  }

  if (!photo) {
    return (
      <Container className="py-32 text-center">
        <h1 className="font-display text-2xl font-semibold">Photo not found</h1>
        <Link to={routes.photos} className="btn-primary mt-6 inline-flex">
          Back to photos
        </Link>
      </Container>
    );
  }

  const display = photo.watermarkUrl ?? photo.previewUrl;

  function requireAuth(): boolean {
    if (!isAuthenticated) {
      navigate(routes.login, { state: { from: routes.photoDetail(photo!.slug) } });
      return false;
    }
    return true;
  }

  function onAdd() {
    if (!requireAuth()) return;
    add.mutate(photo!.id, { onSuccess: () => openDrawer() });
  }

  function onBuyNow() {
    if (!requireAuth()) return;
    add.mutate(photo!.id, {
      onSuccess: () => navigate(routes.checkout),
    });
  }

  return (
    <Container className="py-12">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_400px]">
        <div>
          <div className="overflow-hidden rounded-xl bg-gray-100">
            {display ? (
              <img
                src={display}
                alt={photo.title}
                className="h-auto w-full"
              />
            ) : (
              <div className="flex aspect-video items-center justify-center text-gray-400">
                No image
              </div>
            )}
          </div>

          {photo.description && (
            <div className="mt-8">
              <h2 className="font-display text-lg font-semibold text-gray-900">
                About this photograph
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm text-gray-700">
                {photo.description}
              </p>
            </div>
          )}

          <dl className="mt-8 grid grid-cols-2 gap-y-4 border-t border-gray-200 pt-6 text-sm sm:grid-cols-3">
            {photo.destinationName && (
              <div>
                <dt className="text-gray-500">Destination</dt>
                <dd className="mt-1 font-medium text-gray-900">
                  {photo.destinationName}
                </dd>
              </div>
            )}
            {photo.experienceName && (
              <div>
                <dt className="text-gray-500">Experience</dt>
                <dd className="mt-1 font-medium text-gray-900">
                  {photo.experienceName}
                </dd>
              </div>
            )}
            {photo.categoryName && (
              <div>
                <dt className="text-gray-500">Category</dt>
                <dd className="mt-1 font-medium text-gray-900">
                  {photo.categoryName}
                </dd>
              </div>
            )}
            {photo.width && photo.height && (
              <div>
                <dt className="text-gray-500">Resolution</dt>
                <dd className="mt-1 font-medium text-gray-900">
                  {photo.width} × {photo.height}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <h1 className="font-display text-2xl font-bold text-gray-900">
              {photo.title}
            </h1>

            <div className="mt-4 text-3xl font-bold text-brand-700">
              {formatCurrency(photo.price, photo.currency)}
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={onAdd}
                disabled={add.isPending}
                className="btn-primary w-full"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {add.isPending ? "Adding..." : "Add to cart"}
              </button>

              <button
                onClick={onBuyNow}
                disabled={add.isPending}
                className="btn-secondary w-full"
              >
                <Zap className="mr-2 h-4 w-4" />
                Buy now
              </button>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-6 text-xs text-gray-600">
              <p>✓ Personal license included</p>
              <p className="mt-1">✓ High-resolution download</p>
              <p className="mt-1">✓ Instant delivery after payment</p>
            </div>
          </div>
        </aside>
      </div>
    </Container>
  );
}
