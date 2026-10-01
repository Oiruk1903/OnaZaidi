import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { env } from "@/config/env";
import { useAuthStore } from "@/app/store/authStore";

export const api = axios.create({
  baseURL: env.API_URL,
  headers: {
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  },
});

// ---------- Request interceptor: proactive refresh + auth header ----------

let proactiveRefreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken, setAuth, clear } = useAuthStore.getState();
  if (!refreshToken) {
    clear();
    return null;
  }

  // If a refresh is already in flight, reuse it
  if (proactiveRefreshPromise) return proactiveRefreshPromise;

  proactiveRefreshPromise = (async () => {
    try {
      const { data } = await axios.post(`${env.API_URL}/auth/refresh`, {
        refreshToken,
      });
      if (!data?.success || !data?.data?.accessToken) {
        throw new Error("Refresh failed");
      }
      const { accessToken, refreshToken: newRefresh, user } = data.data;
      setAuth(accessToken, newRefresh, user);
      return accessToken as string;
    } catch {
      clear();
      return null;
    } finally {
      proactiveRefreshPromise = null;
    }
  })();

  return proactiveRefreshPromise;
}

function decodeJwtExp(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

api.interceptors.request.use(async (config) => {
  const { accessToken } = useAuthStore.getState();

  if (accessToken) {
    const exp = decodeJwtExp(accessToken);
    const nowSec = Math.floor(Date.now() / 1000);

    // If the token expires in less than 60 seconds, refresh it before sending
    if (exp !== null && exp - nowSec < 60) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        config.headers.Authorization = `Bearer ${newToken}`;
      } else {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } else {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  // Cache buster for GETs
  if ((config.method ?? "get").toLowerCase() === "get") {
    config.params = { ...(config.params ?? {}), _t: Date.now() };
  }

  return config;
});

// ---------- Response interceptor: reactive refresh on 401 ----------

let isRefreshing = false;
let waiters: Array<(token: string | null) => void> = [];

function onRefreshDone(token: string | null) {
  waiters.forEach((cb) => cb(token));
  waiters = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (!original || error.response?.status !== 401 || original._retry) {
      if (error.response?.status === 401) {
        useAuthStore.getState().clear();
      }
      return Promise.reject(error);
    }

    const { refreshToken, clear } = useAuthStore.getState();
    if (!refreshToken) {
      clear();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        waiters.push((newToken) => {
          if (!newToken) {
            reject(error);
            return;
          }
          original._retry = true;
          original.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(original));
        });
      });
    }

    isRefreshing = true;
    try {
      const newToken = await refreshAccessToken();
      if (!newToken) throw new Error("Refresh failed");

      onRefreshDone(newToken);
      original._retry = true;
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (refreshErr) {
      onRefreshDone(null);
      clear();
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export interface ApiErrorBody {
  success: false;
  error?: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}

export function extractApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorBody | undefined;
    if (data?.error?.message) return data.error.message;
    if (data?.error?.fields) {
      return Object.values(data.error.fields).join(", ");
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
}