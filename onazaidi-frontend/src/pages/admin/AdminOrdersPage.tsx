import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/services/api/adminApi";
import { formatCurrency, formatDate } from "@/utils/format";
import { Spinner } from "@/components/ui/Spinner";
import { routes } from "@/config/routes";

export function AdminOrdersPage() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("");

  const { data, isLoading } = useQuery({
  queryKey: ["admin-orders", page, status],
  queryFn: () => adminApi.listOrders({ page, size: 20, status: status || undefined }),
  refetchInterval: 10_000,          // ← refresh every 10 seconds
  refetchIntervalInBackground: false, // pause when tab is hidden
  refetchOnWindowFocus: true,
});

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-gray-900">Orders</h1>
      <p className="mt-1 text-sm text-gray-600">All customer orders.</p>

      <div className="mt-6">
        <select
          className="input max-w-xs"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(0);
          }}
        >
          <option value="">All statuses</option>
          <option value="CREATED">Created</option>
          <option value="PAYMENT_PENDING">Payment pending</option>
          <option value="PAID">Paid</option>
          <option value="FULFILLED">Fulfilled</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : !data || data.content.length === 0 ? (
          <div className="card p-8 text-center text-sm text-gray-500">
            No orders found.
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.content.map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-3 font-medium">{o.orderNumber}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(o.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium">
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{o.itemCount}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatCurrency(o.totalAmount, o.currency)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={routes.admin.orderDetail(o.orderNumber)}
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
