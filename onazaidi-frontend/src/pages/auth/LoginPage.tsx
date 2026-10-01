import { Container } from "@/components/layout/Container";
import { LoginForm } from "@/features/auth/LoginForm";
import { env } from "@/config/env";

export function LoginPage() {
  return (
    <Container className="py-16">
      <div className="mx-auto max-w-md">
        <h1 className="font-heading text-3xl font-bold text-sage-900">
          Sign in to {env.APP_NAME}
        </h1>
        <p className="mt-2 text-sage-600">
          Access your purchases and continue exploring.
        </p>
        <div className="mt-8 card p-8">
          <LoginForm />
        </div>
      </div>
    </Container>
  );
}
