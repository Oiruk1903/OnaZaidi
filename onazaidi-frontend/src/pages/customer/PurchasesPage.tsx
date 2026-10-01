import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { purchaseApi } from "@/services/api/purchaseApi";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "@/components/ui/Toast";
import { extractApiError } from "@/lib/axios";
import { Link } from "react-router-dom";
import { routes } from "@/config/routes";

export function PurchasesPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["my-purchases"],
    queryFn: purchaseApi.list,
  });

  async function onDownload(entitlementId: string, photoTitle: string) {
    try {
      const res = await purchaseApi.requestDownload(entitlementId);
      // Trigger browser download
      const link = document.createElement("a");
      link.href = res.url;
      link.setAttribute("download", "");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Downloading "${photoTitle}"`);
      // Refresh counts
      refetch();
    } catch (err) {
      toast.error(extractApiError(err));
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-gray-900">
        Purchases & downloads
      </h1>
      <p className="mt-1 text-sm text-gray-600">
        Download your purchased photographs at any time.
      </p>

      <div className="mt-8 space-y-10">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : !data || data.length === 0 ? (
          <EmptyState
            title="No purchases yet"
            description="Once you buy a photograph, it appears here."
            action={
              <Link to={routes.photos} className="btn-primary">
                Browse photos
              </Link>
            }
          />
        ) : (
          data.map((group) => (
            <div key={group.orderId}>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">
                    Order {group.orderNumber}
                  </div>
                  <div className="text-xs text-gray-500">
                    {group.status} · {group.itemCount} item
                    {group.itemCount === 1 ? "" : "s"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((item) => (
                  <div key={item.entitlementId} className="card overflow-hidden">
                    <div className="aspect-square bg-gray-100 overflow-hidden">
                      {item.thumbnailUrl && (
                        <img
                          src={item.thumbnailUrl}
                          alt={item.photoTitle}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <div className="line-clamp-2 text-sm font-medium text-gray-900">
                        {item.photoTitle}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Downloads used: {item.downloadCount} / {item.maxDownloads}
                      </div>
                      <button
                        onClick={() =>
                          onDownload(item.entitlementId, item.photoTitle)
                        }
                        disabled={!item.downloadable}
                        className="btn-primary mt-3 w-full text-xs"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        {item.downloadable ? "Download" : "Limit reached"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
