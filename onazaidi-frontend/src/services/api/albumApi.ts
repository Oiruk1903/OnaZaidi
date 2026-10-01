import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";

export interface Album {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  createdAt: string;
}

export const albumApi = {
  async list() {
    const { data } = await api.get<ApiResponse<Album[]>>("/albums");
    return data.data;
  },

  async getBySlug(slug: string) {
    const { data } = await api.get<ApiResponse<Album>>(`/albums/${slug}`);
    return data.data;
  },
};
