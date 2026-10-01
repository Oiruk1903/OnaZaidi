import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import type { Photo } from "@/types/photo";
import { formatCurrency } from "@/utils/format";
import { routes } from "@/config/routes";
import { useAddToCart } from "@/services/hooks/useCart";
import { useCartUIStore } from "@/app/store/cartStore";
import { useAuthStore } from "@/app/store/authStore";
import { useNavigate } from "react-router-dom";

export function PhotoCard({ photo }: { photo: Photo }) {
  const add = useAddToCart();
  const openDrawer = useCartUIStore((s) => s.openDrawer);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const navigate = useNavigate();

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate(routes.login, { state: { from: routes.photos } });
      return;
    }
    add.mutate(photo.id, {
      onSuccess: () => openDrawer(),
    });
  }

  return (
    <Link
      to={routes.photoDetail(photo.slug)}
      className="group card overflow-hidden"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {photo.thumbnailUrl ? (
          <img
            src={photo.thumbnailUrl}
            alt={photo.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">
            No preview
          </div>
        )}

        <button
          onClick={handleAdd}
          disabled={add.isPending}
          className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white text-brand-700 shadow-md transition-all opacity-0 sm:opacity-0 group-hover:opacity-100 hover:bg-brand-600 hover:text-white disabled:opacity-50"
          aria-label="Add to cart"
        >
          <ShoppingCart className="h-4 w-4" />
        </button>
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="line-clamp-1 text-sm sm:text-base font-medium text-gray-900">{photo.title}</h3>
        <p className="mt-1 text-xs text-gray-500">
          {photo.destinationName ?? "Tanzania"}
        </p>
        <div className="mt-2 sm:mt-3 flex items-center justify-between">
          <span className="font-semibold text-brand-700 text-sm sm:text-base">
            {formatCurrency(photo.price, photo.currency)}
          </span>
        </div>
      </div>
    </Link>
  );
}
