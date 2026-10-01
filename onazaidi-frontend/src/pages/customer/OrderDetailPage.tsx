import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { orderApi } from "@/services/api/orderApi";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { Spinner } from "@/components/ui/Spinner";

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: orders } = useQuery({
    queryKey: ["my-orders", "full"],
    queryFn: () => orderApi.listMine(0, 100),
  });

  const order = orders?.content.find((o: any) => o.id === id);

  if (!orders) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (!order) {
    return <p className="text-sm text-gray-600">Order not found.</p>;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Order {order.orderNumber}</h1>
      <p className="mt-1 text-sm text-gray-600">
        Placed {formatDateTime(order.createdAt)}
      </p>

      <div className="mt-8 card p-6">
        <div className="flex justify-between border-b border-gray-200 pb-4">
          <span className="text-sm text-gray-500">Status</span>
          <span className="text-sm font-medium">{order.status}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 py-4">
          <span className="text-sm text-gray-500">Items</span>
          <span className="text-sm font-medium">{order.itemCount}</span>
        </div>
        <div className="flex justify-between pt-4">
          <span className="text-sm text-gray-500">Total</span>
          <span className="text-lg font-semibold text-brand-700">
            {formatCurrency(order.totalAmount, order.currency)}
          </span>
        </div>
      </div>

      {order.items && order.items.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-lg font-semibold">Items</h2>
          <div className="mt-4 card divide-y divide-gray-200">
            {order.items.map((it: any) => (
              <div key={it.id} className="flex items-center gap-4 p-4">
                <div className="h-16 w-16 overflow-hidden rounded bg-gray-100">
                  {it.thumbnailUrl && (
                    <img
                      src={it.thumbnailUrl}
                      alt={it.photoTitle}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{it.photoTitle}</div>
                  <div className="text-xs text-gray-500">{it.photoSlug}</div>
                </div>
                <div className="text-sm font-semibold">
                  {formatCurrency(it.subtotal, order.currency)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
