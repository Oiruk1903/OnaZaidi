import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, Download, DollarSign } from "lucide-react";
import { orderApi } from "@/services/api/orderApi";
import { purchaseApi } from "@/services/api/purchaseApi";
import { formatCurrency, formatDate } from "@/utils/format";
import { routes } from "@/config/routes";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuthStore } from "@/app/store/authStore";

export function DashboardPage() {
  const { user } = useAuthStore();

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => orderApi.listMine(0, 5),
  });

  const { data: purchases, isLoading: purchasesLoading } = useQuery({
    queryKey: ["my-purchases"],
    queryFn: purchaseApi.list,
  });

  const totalSpent =
    purchases
      ?.filter((g) => g.status === "PAID" || g.status === "FULFILLED")
      .reduce((sum, g) => sum + parseFloat(g.totalAmount), 0) ?? 0;

  const availableDownloads =
    purchases
      ?.flatMap((g) => g.items)
      .filter((i) => i.downloadable).length ?? 0;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-gray-900">
        Welcome back, {user?.firstName}
      </h1>
      <p className="mt-1 text-sm text-gray-600">
        Here's a quick look at your OnaZaidi activity.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<ShoppingBag className="h-5 w-5" />}
          label="Orders"
          value={String(orders?.totalElements ?? 0)}
        />
        <StatCard
          icon={<Download className="h-5 w-5" />}
          label="Available downloads"
          value={String(availableDownloads)}
        />
        <StatCard
          icon={<DollarSign className="h-5 w-5" />}
          label="Total spent"
          value={formatCurrency(totalSpent)}
        />
      </div>

      <div className="mt-10">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-lg font-semibold">Recent orders</h2>
          <Link
            to={routes.account.orders}
            className="text-sm text-brand-700 hover:underline"
          >
            View all →
          </Link>
        </div>

        <div className="mt-4">
          {ordersLoading ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : !orders || orders.content.length === 0 ? (
            <EmptyState
              title="No orders yet"
              description="Your purchases will appear here."
              action={
                <Link to={routes.photos} className="btn-primary">
                  Browse photos
                </Link>
              }
            />
          ) : (
            <div className="card divide-y divide-gray-200">
              {orders.content.map((o: any) => (
                <Link
                  key={o.id}
                  to={routes.account.orderDetail(o.id)}
                  className="flex items-center justify-between p-4 hover:bg-gray-50"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {o.orderNumber}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(o.createdAt)} · {o.itemCount} item
                      {o.itemCount === 1 ? "" : "s"}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={
                        o.status === "PAID" || o.status === "FULFILLED"
                          ? "rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700"
                          : o.status === "PAYMENT_PENDING"
                          ? "rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700"
                          : "rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600"
                      }
                    >
                      {o.status}
                    </span>
                    <span className="font-semibold text-brand-700">
                      {formatCurrency(o.totalAmount, o.currency)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {!purchasesLoading && purchases && purchases.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-lg font-semibold">Recently purchased</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {purchases
              .flatMap((g) => g.items)
              .slice(0, 4)
              .map((item) => (
                <Link
                  key={item.entitlementId}
                  to={routes.account.purchases}
                  className="card overflow-hidden group"
                >
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    {item.thumbnailUrl && (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.photoTitle}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                    )}
                  </div>
                  <div className="p-3 text-xs font-medium line-clamp-2">
                    {item.photoTitle}
                  </div>
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 text-gray-600">
        {icon}
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-3 font-display text-2xl font-bold text-gray-900">
        {value}
      </div>
    </div>
  );
}
