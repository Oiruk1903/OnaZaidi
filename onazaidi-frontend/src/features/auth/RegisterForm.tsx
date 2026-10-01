import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "@/services/api/authApi";
import { extractApiError } from "@/lib/axios";
import { useAuthStore } from "@/app/store/authStore";
import { routes } from "@/config/routes";
import { PasswordInput } from "@/components/ui/PasswordInput";

const schema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().optional(),
    email: z.string().email("Enter a valid email"),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/\d/, "Must contain at least one number")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "Must contain at least one special character"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      const res = await authApi.register({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
      });
      setAuth(res.accessToken, res.refreshToken, res.user);
      navigate(routes.account.dashboard, { replace: true });
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="firstName">First name</label>
          <input id="firstName" className="input" {...register("firstName")} />
          {errors.firstName && (
            <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="lastName">Last name</label>
          <input id="lastName" className="input" {...register("lastName")} />
        </div>
      </div>

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
      <p className="text-xs text-gray-500">
        Must contain at least 8 characters, one uppercase letter, one number, and one special character.
      </p>

      <PasswordInput
        id="confirmPassword"
        label="Confirm password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>

      <p className="text-center text-sm text-sage-600">
        Already have an account?{" "}
        <Link to={routes.login} className="text-brand-600 hover:text-brand-700 font-medium">
          Sign in
        </Link>
      </p>
    </form>
  );
}
