import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Container } from "@/components/layout/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useCart } from "@/services/hooks/useCart";
import { useAuthStore } from "@/app/store/authStore";
import { orderApi, paymentApi } from "@/services/api/orderApi";
import { formatCurrency } from "@/utils/format";
import { routes } from "@/config/routes";
import { extractApiError } from "@/lib/axios";
import { toast } from "@/components/ui/Toast";
import { Link } from "react-router-dom";

const schema = z.object({
  customerName: z.string().min(1, "Full name is required"),
  customerEmail: z.string().email("Enter a valid email"),
});

type FormValues = z.infer<typeof schema>;

export function CheckoutPage() {
  const navigate = useNavigate();
  const { data: cart, isLoading } = useCart();
  const { user } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      customerName: user
        ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
        : "",
      customerEmail: user?.email ?? "",
    },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      // 1. Create order
      const order = await orderApi.create(values.customerName, values.customerEmail);

      // 2. Initiate payment — Step 8 left both providers disabled by default.
      //    We attempt pesapal; if disabled, backend returns an error and we
      //    still keep the order in CREATED state for manual / dev simulation.
      try {
        const payment = await paymentApi.initiate(order.orderNumber, "pesapal");
        // Redirect to provider
        window.location.href = payment.redirectUrl;
      } catch (err) {
        toast.info(
          "Order created, but online payment is not enabled yet. " +
            "Use the dev endpoint or enable a provider to complete checkout."
        );
        navigate(routes.account.orders);
      }
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <Container className="flex justify-center py-32">
        <Spinner className="h-8 w-8 text-brand-600" />
      </Container>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Container className="py-16">
        <h1 className="font-display text-3xl font-bold">Checkout</h1>
        <div className="mt-8">
          <EmptyState
            title="Nothing to check out"
            action={
              <Link to={routes.photos} className="btn-primary">
                Browse photos
              </Link>
            }
          />
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <h1 className="font-display text-3xl font-bold text-gray-900">Checkout</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_400px]"
      >
        <div className="space-y-8">
          <section>
            <h2 className="font-display text-lg font-semibold">Contact details</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="label" htmlFor="customerName">Full name</label>
                <input id="customerName" className="input" {...register("customerName")} />
                {errors.customerName && (
                  <p className="mt-1 text-xs text-red-600">{errors.customerName.message}</p>
                )}
              </div>
              <div>
                <label className="label" htmlFor="customerEmail">Email</label>
                <input id="customerEmail" type="email" className="input" {...register("customerEmail")} />
                {errors.customerEmail && (
                  <p className="mt-1 text-xs text-red-600">{errors.customerEmail.message}</p>
                )}
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold">Payment method</h2>
            <div className="mt-4 space-y-3">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-brand-500 bg-brand-50 p-4">
                <input type="radio" defaultChecked name="provider" value="pesapal" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Visa / Mastercard</div>
                  <div className="text-xs text-gray-600">Secure checkout via Pesapal</div>
                </div>
              </label>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              You will be redirected to the payment provider to complete your purchase securely.
            </p>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <h2 className="font-display text-lg font-semibold">Order summary</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {cart.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-3">
                  <span className="line-clamp-2 text-gray-700">{item.photoTitle}</span>
                  <span className="whitespace-nowrap text-gray-900">
                    {formatCurrency(item.price, item.currency)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-gray-200 pt-3 text-base font-semibold">
              <span>Total</span>
              <span className="text-brand-700">
                {formatCurrency(cart.total, cart.currency)}
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary mt-6 w-full"
            >
              {submitting ? "Processing..." : `Pay ${formatCurrency(cart.total, cart.currency)}`}
            </button>
          </div>
        </aside>
      </form>
    </Container>
  );
}
