import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/services/api/adminApi";
import { formatCurrency, formatDate } from "@/utils/format";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";

export function AdminPhotoPurchasersPage() {
  const { photoId } = useParams<{ photoId: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["photo-purchasers", photoId],
    queryFn: () => adminApi.photoPurchasers(photoId!),
    enabled: !!photoId,
  });

  const totalRevenue =
    data?.reduce((sum, p) => sum + parseFloat(p.amountPaid), 0) ?? 0;

  return (
    <div>
      <Link
        to="/admin/photos"
        className="text-sm text-gray-500 hover:text-gray-900"
      >
        ← Back to photos
      </Link>

      <h1 className="mt-2 font-display text-2xl font-bold">
        Purchasers of this photo
      </h1>
      <p className="mt-1 text-sm text-gray-600">
        {data?.length ?? 0} purchase{(data?.length ?? 0) === 1 ? "" : "s"} ·{" "}
        {formatCurrency(totalRevenue)} revenue
      </p>

      <div className="mt-8">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : !data || data.length === 0 ? (
          <EmptyState
            title="No purchases yet"
            description="This photo has not been purchased."
          />
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map((p, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 font-medium">{p.customerName}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {p.customerEmail}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/orders/${p.orderNumber}`}
                        className="text-brand-700 hover:underline"
                      >
                        {p.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(p.purchasedAt)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatCurrency(p.amountPaid, p.currency)}
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
