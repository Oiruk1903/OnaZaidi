import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  assetsInclude: ['**/*.svg'],
  optimizeDeps: {
    include: ["react", "react-dom", "react/jsx-runtime"],
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8081",
        changeOrigin: true,
      },
      "/files": {
        target: "http://127.0.0.1:8081",
        changeOrigin: true,
      },
    },
  },
});
