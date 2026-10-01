import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { authApi } from "@/services/api/authApi";
import { extractApiError } from "@/lib/axios";
import { useAuthStore } from "@/app/store/authStore";
import { routes } from "@/config/routes";
import { PasswordInput } from "@/components/ui/PasswordInput";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      const res = await authApi.login(values);
      setAuth(res.accessToken, res.refreshToken, res.user);

      const next =
        res.user.roles?.includes("ROLE_ADMIN")
          ? routes.admin.dashboard
          : (location.state as { from?: string } | null)?.from ??
            routes.account.dashboard;

      navigate(next, { replace: true });
    } catch (err) {
      setServerError(extractApiError(err));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <div className="rounded-2xl bg-accent-50 border border-accent-200 p-4 text-sm text-accent-700">
          {serverError}
        </div>
      )}

      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" type="email" className="input" {...register("email")} />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      <PasswordInput
        id="password"
        label="Password"
        error={errors.password?.message}
        {...register("password")}
      />

      <div className="flex items-center justify-between">
        <Link
          to={routes.forgotPassword}
          className="text-sm text-brand-600 hover:text-brand-700 font-medium"
        >
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        className="btn-primary w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-center text-sm text-sage-600">
        No account yet?{" "}
        <Link to={routes.register} className="text-brand-600 hover:text-brand-700 font-medium">
          Create one
        </Link>
      </p>
    </form>
  );
}
