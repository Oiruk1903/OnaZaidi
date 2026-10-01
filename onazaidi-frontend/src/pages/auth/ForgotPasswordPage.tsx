import { useState } from "react";
import { Link } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { authApi } from "@/services/api/authApi";
import { toast } from "@/components/ui/Toast";
import { extractApiError } from "@/lib/axios";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { routes } from "@/config/routes";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSubmitted(true);
      toast.success("If an account exists with this email, a password reset link will be sent.");
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-earth-50 flex items-center justify-center py-12 px-4">
      <Container className="max-w-md">
        <div className="bg-white rounded-3xl shadow-soft p-8">
          <Link
            to={routes.login}
            className="inline-flex items-center gap-2 text-sm text-sage-600 hover:text-brand-600 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>

          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-brand-600" />
            </div>
            <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">
              Forgot your password?
            </h1>
            <p className="text-sm text-gray-600">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {submitted ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="font-display text-xl font-semibold text-gray-900 mb-2">
                Check your email
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                If an account exists with {email}, you'll receive a password reset link shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-brand-600 text-sm font-medium hover:underline"
              >
                Send another email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="label">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="input"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          )}

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
