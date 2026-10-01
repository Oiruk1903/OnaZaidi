export const env = {
  API_URL: import.meta.env.VITE_API_URL as string,
  APP_NAME: import.meta.env.VITE_APP_NAME ?? "OnaZaidi",
} as const;

if (!env.API_URL) {
  throw new Error(
    "VITE_API_URL is not set. Create a .env file in the frontend root with " +
    "VITE_API_URL=http://localhost:8081/api/v1 and restart `npm run dev`."
  );
}

