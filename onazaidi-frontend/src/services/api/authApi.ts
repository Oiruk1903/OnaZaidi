import { api } from "@/lib/axios";
import type { AuthResponse, LoginRequest, RegisterRequest } from "@/types/auth";
import type { ApiResponse } from "@/types/api";

export const authApi = {
  async register(body: RegisterRequest) {
    const { data } = await api.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      body
    );
    return data.data;
  },

  async login(body: LoginRequest) {
    const { data } = await api.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      body
    );
    return data.data;
  },

  async me() {
    const { data } = await api.get<ApiResponse<AuthResponse["user"]>>(
      "/auth/me"
    );
    return data.data;
  },

  async logout(refreshToken: string) {
    await api.post("/auth/logout", { refreshToken });
  },

  async forgotPassword(email: string) {
    await api.post("/auth/forgot-password", { email });
  },

  async resetPassword(token: string, newPassword: string) {
    await api.post("/auth/reset-password", { token, newPassword });
  },
};
