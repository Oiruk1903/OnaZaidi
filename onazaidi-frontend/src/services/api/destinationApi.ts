import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { Destination } from "@/types/destination";

export const destinationApi = {
  async list() {
    const { data } = await api.get<ApiResponse<Destination[]>>("/destinations");
    return data.data;
  },

  async getBySlug(slug: string) {
    const { data } = await api.get<ApiResponse<Destination>>(
      `/destinations/${slug}`
    );
    return data.data;
  },
};
