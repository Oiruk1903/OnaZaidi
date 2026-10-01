import { Container } from "@/components/layout/Container";
import { RegisterForm } from "@/features/auth/RegisterForm";
import { env } from "@/config/env";

export function RegisterPage() {
  return (
    <Container className="py-16">
      <div className="mx-auto max-w-md">
        <h1 className="font-heading text-3xl font-bold text-sage-900">
          Join {env.APP_NAME}
        </h1>
        <p className="mt-2 text-sage-600">
          Create an account to purchase and download photographs.
        </p>
        <div className="mt-8 card p-8">
          <RegisterForm />
        </div>
      </div>
    </Container>
  );
}
