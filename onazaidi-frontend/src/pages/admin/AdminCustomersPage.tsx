import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { adminApi } from "@/services/api/adminApi";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/utils/format";

export function AdminCustomersPage() {
  const [page, setPage] = useState(0);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-customers", page, q, status],
    queryFn: () =>
      adminApi.listCustomers({
        page,
        size: 20,
        q: q || undefined,
        status: status || undefined,
      }),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-gray-900">Customers</h1>
      <p className="mt-1 text-sm text-gray-600">
        Everyone who has registered on OnaZaidi.
      </p>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9 w-64"
            placeholder="Search name or email..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
          />
        </div>

        <select
          className="input max-w-xs"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(0);
          }}
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : isError ? (
          <div className="card p-6 text-center">
            <p className="text-sm text-red-600">
              Failed to load customers. Please try again.
            </p>
            <button onClick={() => refetch()} className="btn-secondary mt-4">
              Retry
            </button>
          </div>
        ) : !data || data.content.length === 0 ? (
          <EmptyState
            title="No customers yet"
            description="Registered customers will appear here."
          />
        ) : (
          <>
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Country</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Verified</th>
                    <th className="px-4 py-3">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.content.map((c) => (
                    <tr key={c.id}>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {c.firstName} {c.lastName ?? ""}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{c.email}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {c.countryCode ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            c.status === "ACTIVE"
                              ? "rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700"
                              : "rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600"
                          }
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {c.emailVerified ? (
                          <span className="text-xs font-medium text-green-700">Yes</span>
                        ) : (
                          <span className="text-xs text-gray-500">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(c.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="btn-secondary"
                >
                  ← Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page + 1} of {data.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
                  disabled={page >= data.totalPages - 1}
                  className="btn-secondary"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
