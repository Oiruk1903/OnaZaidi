import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useCart, useRemoveFromCart } from "@/services/hooks/useCart";
import { formatCurrency } from "@/utils/format";
import { routes } from "@/config/routes";

export function CartPage() {
  const { data: cart, isLoading } = useCart();
  const remove = useRemoveFromCart();

  if (isLoading) {
    return (
      <Container className="flex justify-center py-32">
        <Spinner className="h-8 w-8 text-brand-600" />
      </Container>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Container className="py-16">
        <h1 className="font-display text-3xl font-bold text-gray-900">Your cart</h1>
        <div className="mt-8">
          <EmptyState
            title="Your cart is empty"
            description="Browse our collection to find photographs you love."
            action={
              <Link to={routes.photos} className="btn-primary">
                Explore photos
              </Link>
            }
          />
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <h1 className="font-display text-3xl font-bold text-gray-900">Your cart</h1>

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px]">
        <ul className="divide-y divide-gray-200 border-y border-gray-200">
          {cart.items.map((item) => (
            <li key={item.id} className="flex gap-6 py-6">
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {item.thumbnailUrl && (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.photoTitle}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col">
                <Link
                  to={routes.photoDetail(item.photoSlug)}
                  className="font-medium text-gray-900 hover:underline"
                >
                  {item.photoTitle}
                </Link>
                <div className="mt-1 text-sm text-gray-500">
                  Personal license · Digital download
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <button
                    onClick={() => remove.mutate(item.photoId)}
                    disabled={remove.isPending}
                    className="inline-flex items-center gap-1 text-sm text-red-600 hover:underline disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" /> Remove
                  </button>
                  <div className="text-lg font-semibold text-brand-700">
                    {formatCurrency(item.price, item.currency)}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <h2 className="font-display text-lg font-semibold">Order summary</h2>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Subtotal</dt>
                <dd className="text-gray-900">
                  {formatCurrency(cart.subtotal, cart.currency)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Tax</dt>
                <dd className="text-gray-900">
                  {formatCurrency(cart.tax, cart.currency)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-semibold">
                <dt>Total</dt>
                <dd className="text-brand-700">
                  {formatCurrency(cart.total, cart.currency)}
                </dd>
              </div>
            </dl>

            <Link to={routes.checkout} className="btn-primary mt-6 w-full">
              Proceed to checkout
            </Link>
          </div>
        </aside>
      </div>
    </Container>
  );
}
