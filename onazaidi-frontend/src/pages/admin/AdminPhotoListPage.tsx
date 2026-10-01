import { Link } from "react-router-dom";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Upload, Archive } from "lucide-react";
import { adminApi } from "@/services/api/adminApi";
import { formatCurrency } from "@/utils/format";
import { routes } from "@/config/routes";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "@/components/ui/Toast";
import { extractApiError } from "@/lib/axios";

export function AdminPhotoListPage() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<string>("DRAFT");
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-photos", page, status],
    queryFn: () => adminApi.listPhotos({ page, size: 20, status: status || undefined }),
    initialData: undefined,
  });

  const publish = useMutation({
    mutationFn: adminApi.publishPhoto,
    onSuccess: () => {
      toast.success("Photo published");
      qc.invalidateQueries({ queryKey: ["admin-photos"] });
    },
    onError: (e) => toast.error(extractApiError(e)),
  });

  const remove = useMutation({
    mutationFn: adminApi.deletePhoto,
    onSuccess: () => {
      toast.success("Photo deleted");
      qc.invalidateQueries({ queryKey: ["admin-photos"] });
    },
    onError: (e) => toast.error(extractApiError(e)),
  });

  const archive = useMutation({
    mutationFn: adminApi.archivePhoto,
    onSuccess: () => {
      toast.success("Photo archived");
      qc.invalidateQueries({ queryKey: ["admin-photos"] });
    },
    onError: (e) => toast.error(extractApiError(e)),
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Photos</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your photograph collection.
          </p>
        </div>
        <Link to="/admin/photos/new" className="btn-primary">
          <Plus className="mr-2 h-4 w-4" /> Upload
        </Link>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <select
          className="input max-w-xs"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(0);
          }}
        >
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : !data || data.content.length === 0 ? (
          <EmptyState
            title="No photos"
            description="Upload your first photograph to get started."
            action={
              <Link to="/admin/photos/new" className="btn-primary">
                <Upload className="mr-2 h-4 w-4" /> Upload photo
              </Link>
            }
          />
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Photo</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Destination</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.content.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded bg-gray-100 overflow-hidden">
                          {p.thumbnailUrl && (
                            <img
                              src={p.thumbnailUrl}
                              alt={p.title}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {p.title}
                          </div>
                          <div className="text-xs text-gray-500">{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          p.status === "PUBLISHED"
                            ? "rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700"
                            : "rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600"
                        }
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatCurrency(p.price, p.currency)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {p.destinationName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Link
                        to={`/admin/photos/${p.id}/purchasers`}
                        className="text-xs text-brand-700 hover:underline"
                      >
                        Purchasers
                      </Link>
                      {p.status !== "PUBLISHED" && (
                        <button
                          onClick={() => publish.mutate(p.id)}
                          disabled={publish.isPending}
                          className="text-xs text-brand-700 hover:underline disabled:opacity-50"
                        >
                          Publish
                        </button>
                      )}
                      {p.status !== "ARCHIVED" && (
                        <button
                          onClick={() => archive.mutate(p.id)}
                          disabled={archive.isPending}
                          className="text-xs text-sage-600 hover:underline disabled:opacity-50"
                        >
                          <Archive className="inline h-3 w-3" /> Archive
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm("Delete this photo? This cannot be undone.")) remove.mutate(p.id);
                        }}
                        disabled={remove.isPending}
                        className="text-xs text-red-600 hover:underline disabled:opacity-50"
                      >
                        <Trash2 className="inline h-3 w-3" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.totalPages > 1 && (
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
      </div>
    </div>
  );
}
