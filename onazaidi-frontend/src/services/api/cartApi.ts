import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { Cart } from "@/types/cart";

export const cartApi = {
  async get() {
    const { data } = await api.get<ApiResponse<Cart>>("/cart");
    return data.data;
  },

  async add(photoId: string) {
    const { data } = await api.post<ApiResponse<Cart>>("/cart/items", { photoId });
    return data.data;
  },

  async remove(photoId: string) {
    const { data } = await api.delete<ApiResponse<Cart>>(`/cart/items/${photoId}`);
    return data.data;
  },

  async clear() {
    await api.delete("/cart");
  },
};
