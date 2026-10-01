import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Spinner } from "@/components/ui/Spinner";
import { orderApi } from "@/services/api/orderApi";
import { routes } from "@/config/routes";

export function PaymentCallbackPage() {
  const [params] = useSearchParams();
  const orderNumber = params.get("orderNumber");
  const [state, setState] = useState<"loading" | "paid" | "pending" | "failed">(
    "loading"
  );

  useEffect(() => {
    if (!orderNumber) {
      setState("failed");
      return;
    }
    let cancelled = false;
    let attempts = 0;

    async function poll() {
      attempts++;
      try {
        const order = await orderApi.getByNumber(orderNumber!);
        if (cancelled) return;
        if (order.status === "PAID" || order.status === "FULFILLED") {
          setState("paid");
          return;
        }
        if (order.status === "CANCELLED" || order.status === "EXPIRED") {
          setState("failed");
          return;
        }
        if (attempts >= 10) {
          setState("pending");
          return;
        }
        setTimeout(poll, 3000);
      } catch {
        if (!cancelled) setState("failed");
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [orderNumber]);

  return (
    <Container className="py-24">
      <div className="mx-auto max-w-lg text-center">
        {state === "loading" && (
          <>
            <Spinner className="mx-auto h-10 w-10 text-brand-600" />
            <h1 className="mt-6 font-display text-2xl font-bold">
              Confirming your payment…
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              This can take a few seconds. Please don't close this page.
            </p>
          </>
        )}

        {state === "paid" && (
          <>
            <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" />
            <h1 className="mt-6 font-display text-2xl font-bold">Payment successful</h1>
            <p className="mt-2 text-sm text-gray-600">
              Your photographs are now available in your account.
            </p>
            <div className="mt-8 space-y-3">
              <Link to={routes.account.purchases} className="btn-primary block">
                View my purchases
              </Link>
              <Link to={routes.photos} className="btn-secondary block">
                Continue exploring
              </Link>
            </div>
          </>
        )}

        {state === "pending" && (
          <>
            <Spinner className="mx-auto h-10 w-10 text-brand-600" />
            <h1 className="mt-6 font-display text-2xl font-bold">
              Payment still processing
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Your bank or provider is still confirming. Check your account soon.
            </p>
            <Link to={routes.account.orders} className="btn-primary mt-8 inline-flex">
              View orders
            </Link>
          </>
        )}

        {state === "failed" && (
          <>
            <XCircle className="mx-auto h-14 w-14 text-red-600" />
            <h1 className="mt-6 font-display text-2xl font-bold">Payment failed</h1>
            <p className="mt-2 text-sm text-gray-600">
              Something went wrong. Try again or contact support.
            </p>
            <Link to={routes.cart} className="btn-primary mt-8 inline-flex">
              Back to cart
            </Link>
          </>
        )}
      </div>
    </Container>
  );
}
