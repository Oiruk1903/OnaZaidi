import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";

export interface OrderItem {
  id: string;
  photoId: string;
  photoTitle: string;
  photoSlug: string;
  thumbnailUrl: string | null;
  unitPrice: string;
  quantity: number;
  subtotal: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  subtotal: string;
  totalAmount: string;
  currency: string;
  itemCount: number;
  items: OrderItem[];
  createdAt: string;
}

export interface InitiatePaymentResponse {
  paymentId: string;
  provider: string;
  redirectUrl: string;
  status: string;
}

export const orderApi = {
  async create(customerName: string, customerEmail: string) {
    const { data } = await api.post<ApiResponse<Order>>("/orders", {
      customerName,
      customerEmail,
    });
    return data.data;
  },

  async getByNumber(orderNumber: string) {
    const { data } = await api.get<ApiResponse<Order>>(`/orders/${orderNumber}`);
    return data.data;
  },
};

export const paymentApi = {
  async initiate(orderNumber: string, provider: string) {
    const { data } = await api.post<ApiResponse<InitiatePaymentResponse>>(
      "/payments",
      { orderNumber, provider }
    );
    return data.data;
  },
  async listMine(page = 0, size = 20) {
    const { data } = await api.get<ApiResponse<any>>("/orders", {
      params: { page, size },
    });
    return data.data;
  },
};
