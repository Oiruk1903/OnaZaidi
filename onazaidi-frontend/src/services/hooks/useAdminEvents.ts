import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { env } from "@/config/env";
import { useAuthStore } from "@/app/store/authStore";

export function useAdminEvents() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();

  useEffect(() => {
    if (!accessToken) return;

    // EventSource doesn't support Authorization headers natively.
    // Send the token as a query param and verify it server-side, OR
    // use a fetch-based SSE library. Simplest workaround: put it in the URL.
    const url = `${env.API_URL}/admin/events?token=${encodeURIComponent(accessToken)}`;
    const es = new EventSource(url);

    es.addEventListener("order-created", (ev) => {
      try {
        const payload = JSON.parse((ev as MessageEvent).data);
        // Invalidate the admin lists so they refetch
        queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
        queryClient.invalidateQueries({ queryKey: ["admin-photos"] });
        // Optionally show a toast
        // toast.info(`New order ${payload.orderNumber}`);
      } catch {}
    });

    es.onerror = () => {
      // Browsers auto-reconnect on error, but if auth failed they
      // will keep retrying uselessly. Close on 401.
      es.close();
    };

    return () => es.close();
  }, [accessToken, queryClient]);
}

