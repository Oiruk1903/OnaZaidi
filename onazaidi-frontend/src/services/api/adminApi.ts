import { api } from "@/lib/axios";
import type { ApiResponse, PageResponse } from "@/types/api";
import type { Photo } from "@/types/photo";

export interface AdminPhotoUploadMeta {
  title: string;
  description?: string;
  price: number;
  currency?: string;
  albumId?: string;
  destinationId?: string;
  experienceId?: string;
  categoryId?: string;
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: string;
  currency: string;
  itemCount: number;
  createdAt: string;
}

export interface PhotoPurchaser {
  customerId: string;
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  amountPaid: string;
  currency: string;
  purchasedAt: string;
}

export interface AdminCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  countryCode: string | null;
  status: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface Album {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  destinationId: string | null;
  destinationName: string | null;
  experienceId: string | null;
  experienceName: string | null;
  coverPhotoId: string | null;
  status: string;
  createdAt: string;
}

export const adminApi = {
  async listPhotos(params: { page?: number; size?: number; status?: string } = {}) {
    const { data } = await api.get<ApiResponse<PageResponse<Photo>>>(
      "/admin/photos",
      {
        params: {
          page: params.page ?? 0,
          size: params.size ?? 20,
          status: params.status,
        },
      }
    );
    return data.data;
  },

  async uploadPhoto(file: File, meta: AdminPhotoUploadMeta) {
    const form = new FormData();
    form.append("file", file);
    form.append(
      "meta",
      new Blob([JSON.stringify(meta)], { type: "application/json" })
    );

    const { data } = await api.post<ApiResponse<Photo>>(
      "/admin/photos/upload",
      form
    );
    return data.data;
  },

  async publishPhoto(id: string) {
    const { data } = await api.post<ApiResponse<Photo>>(
      `/admin/photos/${id}/publish-with-watermark`
    );
    return data.data;
  },

  async deletePhoto(id: string) {
    await api.delete(`/admin/photos/${id}`);
  },

  async archivePhoto(id: string) {
    const { data } = await api.post<ApiResponse<Photo>>(
      `/admin/photos/${id}/archive`
    );
    return data.data;
  },

  async listOrders(params: { page?: number; size?: number; status?: string } = {}) {
    const { data } = await api.get<ApiResponse<PageResponse<OrderSummary>>>(
      "/admin/orders",
      {
        params: {
          page: params.page ?? 0,
          size: params.size ?? 20,
          status: params.status,
        },
      }
    );
    return data.data;
  },

  async getOrder(orderNumber: string) {
    const { data } = await api.get<ApiResponse<any>>(
      `/admin/orders/${orderNumber}`
    );
    return data.data;
  },

  async photoPurchasers(photoId: string) {
    const { data } = await api.get<ApiResponse<PhotoPurchaser[]>>(
      `/admin/photos/${photoId}/purchasers`
    );
    return data.data;
  },

  async listAlbums() {
    const { data } = await api.get<ApiResponse<Album[]>>("/admin/albums");
    return data.data;
  },

  async createAlbum(body: {
    title: string;
    description?: string;
    destinationId?: string;
    experienceId?: string;
  }) {
    const { data } = await api.post<ApiResponse<Album>>("/admin/albums", body);
    return data.data;
  },

  async updateAlbum(
    id: string,
    body: {
      title?: string;
      description?: string;
      destinationId?: string;
      experienceId?: string;
      status?: string;
    }
  ) {
    const { data } = await api.patch<ApiResponse<Album>>(
      `/admin/albums/${id}`,
      body
    );
    return data.data;
  },

  async deleteAlbum(id: string) {
    await api.delete(`/admin/albums/${id}`);
  },

  async listCustomers(
    params: { page?: number; size?: number; q?: string; status?: string } = {}
  ) {
    const { data } = await api.get<ApiResponse<PageResponse<AdminCustomer>>>(
      "/admin/customers",
      {
        params: {
          page: params.page ?? 0,
          size: params.size ?? 20,
          q: params.q,
          status: params.status,
        },
      }
    );
    return data.data;
  },
};