import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Image as ImageIcon, ShoppingBag, Users, DollarSign, TrendingUp } from "lucide-react";
import { adminApi } from "@/services/api/adminApi";
import { formatCurrency, formatDate } from "@/utils/format";
import { routes } from "@/config/routes";
import { Spinner } from "@/components/ui/Spinner";

export function AdminDashboardPage() {
  const { data: photosData, isLoading: photosLoading } = useQuery({
    queryKey: ["admin-photos", "recent"],
    queryFn: () => adminApi.listPhotos({ page: 0, size: 10 }),
refetchInterval: 10_000,
refetchIntervalInBackground: false,
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-orders", "recent"],
    queryFn: () => adminApi.listOrders({ page: 0, size: 10 }),
refetchInterval: 10_000,
refetchIntervalInBackground: false, 
 });

  const { data: customersData } = useQuery({
    queryKey: ["admin-customers", "count"],
    queryFn: () => adminApi.listCustomers({ page: 0, size: 1 }),
refetchInterval: 10_000,
refetchIntervalInBackground: false,
  });

  const totalRevenue =
    ordersData?.content
      .filter((o) => o.status === "PAID" || o.status === "FULFILLED")
      .reduce((sum, o) => sum + parseFloat(o.totalAmount), 0) ?? 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-sage-900">Dashboard</h1>
        <p className="mt-2 text-sage-600">
          Welcome back! Here's what's happening with your business.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={<ImageIcon className="h-6 w-6" />}
          label="Total Photos"
          value={String(photosData?.totalElements ?? 0)}
          color="brand"
        />
        <Stat
          icon={<ShoppingBag className="h-6 w-6" />}
          label="Total Orders"
          value={String(ordersData?.totalElements ?? 0)}
          color="earth"
        />
        <Stat
          icon={<Users className="h-6 w-6" />}
          label="Customers"
          value={String(customersData?.totalElements ?? 0)}
          color="accent"
        />
        <Stat
          icon={<DollarSign className="h-6 w-6" />}
          label="Revenue"
          value={formatCurrency(totalRevenue)}
          color="brand"
        />
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section className="animate-slide-up">
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-heading text-xl font-bold text-sage-900">Recent Photos</h2>
            <Link
              to={routes.admin.photos}
              className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
            >
              Manage all →
            </Link>
          </div>
          <div className="card divide-y divide-sage-100">
            {photosLoading ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : photosData?.content.length === 0 ? (
              <div className="p-8 text-center text-sage-500">No photos yet. Start by uploading your first photo!</div>
            ) : (
              photosData?.content.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center gap-4 p-4 hover:bg-sage-50 transition-colors">
                  <div className="h-14 w-14 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-100 to-earth-100">
                    {p.thumbnailUrl && (
                      <img
                        src={p.thumbnailUrl}
                        alt={p.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-heading font-medium text-sage-900 truncate">{p.title}</div>
                    <div className="text-sm text-sage-600 mt-1">
                      <span className="inline-flex px-2 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-medium">
                        {p.status}
                      </span>
                      <span className="mx-2">·</span>
                      {formatCurrency(p.price, p.currency)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-heading text-xl font-bold text-sage-900">Recent Orders</h2>
            <Link
              to={routes.admin.orders}
              className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="card divide-y divide-sage-100">
            {ordersLoading ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : ordersData?.content.length === 0 ? (
              <div className="p-8 text-center text-sage-500">No orders yet. Share your photos to start getting orders!</div>
            ) : (
              ordersData?.content.slice(0, 5).map((o) => (
                <Link
                  key={o.id}
                  to={routes.admin.orderDetail(o.orderNumber)}
                  className="flex items-center justify-between p-4 hover:bg-sage-50 transition-colors group"
                >
                  <div>
                    <div className="font-heading font-medium text-sage-900 group-hover:text-brand-600 transition-colors">{o.orderNumber}</div>
                    <div className="text-sm text-sage-600 mt-1">
                      {formatDate(o.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="font-heading font-bold text-sage-900">{formatCurrency(o.totalAmount, o.currency)}</div>
                    <TrendingUp className="h-4 w-4 text-sage-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  const colorClasses = {
    brand: "from-brand-500 to-brand-600",
    earth: "from-earth-500 to-earth-600",
    accent: "from-accent-500 to-accent-600",
  };

  return (
    <div className="card p-6 hover:shadow-elevated transition-all duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} text-white shadow-soft`}>
          {icon}
        </div>
        <span className="text-xs uppercase tracking-wide text-sage-600 font-semibold">{label}</span>
      </div>
      <div className="font-heading text-3xl font-bold text-sage-900">
        {value}
      </div>
    </div>
  );
}
