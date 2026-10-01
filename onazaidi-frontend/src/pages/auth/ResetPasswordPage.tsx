import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { authApi } from "@/services/api/authApi";
import { toast } from "@/components/ui/Toast";
import { extractApiError } from "@/lib/axios";
import { Lock, CheckCircle, AlertCircle } from "lucide-react";
import { routes } from "@/config/routes";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid or missing reset token");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      toast.error("Password must contain at least one uppercase letter");
      return;
    }

    if (!/\d/.test(password)) {
      toast.error("Password must contain at least one number");
      return;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      toast.error("Password must contain at least one special character");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
      toast.success("Password has been reset successfully");
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-earth-50 flex items-center justify-center py-12 px-4">
        <Container className="max-w-md">
          <div className="bg-white rounded-3xl shadow-soft p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">
              Invalid Reset Link
            </h1>
            <p className="text-sm text-gray-600 mb-6">
              The password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link to={routes.forgotPassword} className="btn-primary">
              Request new reset link
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-earth-50 flex items-center justify-center py-12 px-4">
        <Container className="max-w-md">
          <div className="bg-white rounded-3xl shadow-soft p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">
              Password Reset Successful
            </h1>
            <p className="text-sm text-gray-600 mb-6">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
            <Link to={routes.login} className="btn-primary">
              Sign in
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-earth-50 flex items-center justify-center py-12 px-4">
      <Container className="max-w-md">
        <div className="bg-white rounded-3xl shadow-soft p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-brand-600" />
            </div>
            <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">
              Reset your password
            </h1>
            <p className="text-sm text-gray-600">
              Enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="label">
                New password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="input"
                required
                minLength={8}
              />
              <p className="mt-2 text-xs text-gray-500">
                Must contain at least 8 characters, one uppercase letter, one number, and one special character.
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">
                Confirm new password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="input"
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset password"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Remember your password?{" "}
            <Link to={routes.login} className="text-brand-600 font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
