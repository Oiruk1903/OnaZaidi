import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { orderApi } from "@/services/api/orderApi";
import { formatCurrency, formatDate } from "@/utils/format";
import { routes } from "@/config/routes";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";

export function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-orders", "full"],
    queryFn: () => orderApi.listMine(0, 50),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-gray-900">My orders</h1>
      <p className="mt-1 text-sm text-gray-600">Every order you've placed.</p>

      <div className="mt-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : !data || data.content.length === 0 ? (
          <EmptyState
            title="No orders yet"
            action={
              <Link to={routes.photos} className="btn-primary">
                Browse photos
              </Link>
            }
          />
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.content.map((o: any) => (
                  <tr key={o.id}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {o.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(o.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={o.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {formatCurrency(o.totalAmount, o.currency)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={routes.account.orderDetail(o.id)}
                        className="text-brand-700 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const cls =
    status === "PAID" || status === "FULFILLED"
      ? "bg-green-50 text-green-700"
      : status === "PAYMENT_PENDING"
      ? "bg-yellow-50 text-yellow-700"
      : status === "CANCELLED" || status === "EXPIRED"
      ? "bg-red-50 text-red-700"
      : "bg-gray-100 text-gray-700";
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}
