import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/services/api/adminApi";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { Spinner } from "@/components/ui/Spinner";

export function AdminOrderDetailPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();

  const { data: order, isLoading } = useQuery({
    queryKey: ["admin-order", orderNumber],
    queryFn: () => adminApi.getOrder(orderNumber!),
    enabled: !!orderNumber,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (!order) {
    return <p className="text-sm text-gray-600">Order not found.</p>;
  }

  return (
    <div>
      <Link
        to="/admin/orders"
        className="text-sm text-gray-500 hover:text-gray-900"
      >
        ← Back to orders
      </Link>

      <h1 className="mt-2 font-display text-2xl font-bold">
        Order {order.orderNumber}
      </h1>
      <p className="mt-1 text-sm text-gray-600">
        Placed {formatDateTime(order.createdAt)}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold">Customer</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Name" value={order.customerName} />
            <Row label="Email" value={order.customerEmail} />
          </dl>
        </div>

        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold">Payment</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Status" value={order.status} />
            <Row label="Currency" value={order.currency} />
            <Row
              label="Total"
              value={formatCurrency(order.totalAmount, order.currency)}
            />
          </dl>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold">Items</h2>
        <div className="mt-4 card divide-y divide-gray-200">
          {order.items.map((it: any) => (
            <div key={it.id} className="flex items-center gap-4 p-4">
              <div className="h-16 w-16 rounded bg-gray-100 overflow-hidden">
                {it.thumbnailUrl && (
                  <img
                    src={it.thumbnailUrl}
                    alt={it.photoTitle}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium">{it.photoTitle}</div>
                <div className="text-xs text-gray-500">{it.photoSlug}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  {formatCurrency(it.subtotal, order.currency)}
                </div>
                <div className="text-xs text-gray-500">
                  ×{it.quantity} @ {formatCurrency(it.unitPrice, order.currency)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between border-b border-gray-100 pb-2">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-900">{value ?? "—"}</dd>
    </div>
  );
}
