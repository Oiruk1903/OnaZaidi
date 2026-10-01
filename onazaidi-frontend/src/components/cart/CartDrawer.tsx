import { Link } from "react-router-dom";
import { X, Trash2, ShoppingBag } from "lucide-react";
import { useCartUIStore } from "@/app/store/cartStore";
import { useCart, useRemoveFromCart } from "@/services/hooks/useCart";
import { formatCurrency } from "@/utils/format";
import { routes } from "@/config/routes";
import { Spinner } from "@/components/ui/Spinner";

export function CartDrawer() {
  const { isDrawerOpen, closeDrawer } = useCartUIStore();
  const { data: cart, isLoading } = useCart();
  const remove = useRemoveFromCart();

  if (!isDrawerOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="font-display text-lg font-semibold">Your cart</h2>
          <button
            onClick={closeDrawer}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="py-16 text-center">
              <ShoppingBag className="mx-auto h-10 w-10 text-gray-400" />
              <p className="mt-4 text-sm text-gray-600">Your cart is empty.</p>
              <Link
                to={routes.photos}
                onClick={closeDrawer}
                className="btn-primary mt-6 inline-flex"
              >
                Explore photos
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {cart.items.map((item) => (
                <li key={item.id} className="flex gap-4">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.photoTitle}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <Link
                        to={routes.photoDetail(item.photoSlug)}
                        onClick={closeDrawer}
                        className="text-sm font-medium text-gray-900 hover:underline line-clamp-2"
                      >
                        {item.photoTitle}
                      </Link>
                      <button
                        onClick={() => remove.mutate(item.photoId)}
                        disabled={remove.isPending}
                        className="text-gray-400 hover:text-red-600 disabled:opacity-50"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto text-sm font-semibold text-brand-700">
                      {formatCurrency(item.price, item.currency)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart && cart.items.length > 0 && (
          <footer className="border-t border-gray-200 p-6">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(cart.subtotal, cart.currency)}</span>
            </div>
            <div className="mt-2 flex justify-between text-base font-semibold text-gray-900">
              <span>Total</span>
              <span>{formatCurrency(cart.total, cart.currency)}</span>
            </div>
            <Link
              to={routes.checkout}
              onClick={closeDrawer}
              className="btn-primary mt-6 w-full"
            >
              Checkout
            </Link>
            <Link
              to={routes.cart}
              onClick={closeDrawer}
              className="mt-3 block text-center text-sm text-gray-600 hover:underline"
            >
              View full cart
            </Link>
          </footer>
        )}
      </aside>
    </>
  );
}
