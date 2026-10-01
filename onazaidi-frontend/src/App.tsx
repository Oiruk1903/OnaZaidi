import { Component, type ReactNode } from "react";
import { RouterProvider } from "react-router-dom";
import { QueryProvider } from "@/app/providers/QueryProvider";
import { router } from "@/router";

class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: "system-ui" }}>
          <h1 style={{ color: "#dc2626" }}>Something crashed</h1>
          <p style={{ marginTop: 12 }}>
            This is a development error boundary. Full message:
          </p>
          <pre
            style={{
              background: "#f3f4f6",
              padding: 16,
              borderRadius: 8,
              overflow: "auto",
              marginTop: 12,
              fontSize: 13,
            }}
          >
            {this.state.error.message}
            {"\n\n"}
            {this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <RouterProvider router={router} />
      </QueryProvider>
    </ErrorBoundary>
  );
}
