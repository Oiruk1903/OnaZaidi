import { Link } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { routes } from "@/config/routes";

export function NotFoundPage() {
  return (
    <Container className="py-32 text-center">
      <h1 className="font-display text-6xl font-bold text-gray-900">404</h1>
      <p className="mt-4 text-gray-600">This page could not be found.</p>
      <Link to={routes.home} className="btn-primary mt-8 inline-flex">
        Back to home
      </Link>
    </Container>
  );
}
