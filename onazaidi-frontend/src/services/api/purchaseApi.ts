import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";

export interface PurchaseItem {
  entitlementId: string;
  photoId: string;
  photoTitle: string;
  photoSlug: string;
  thumbnailUrl: string | null;
  status: string;
  downloadCount: number;
  maxDownloads: number;
  downloadable: boolean;
  purchasedAt: string;
  lastDownloadedAt: string | null;
}

export interface PurchaseGroup {
  orderId: string;
  orderNumber: string;
  status: string;
  totalAmount: string;
  currency: string;
  purchasedAt: string;
  itemCount: number;
  items: PurchaseItem[];
}

export interface DownloadUrl {
  url: string;
  expiresAt: string;
  downloadsRemaining: number;
}

export const purchaseApi = {
  async list() {
    const { data } = await api.get<ApiResponse<PurchaseGroup[]>>("/me/purchases");
    return data.data;
  },

  async requestDownload(entitlementId: string) {
    const { data } = await api.post<ApiResponse<DownloadUrl>>(
      `/me/purchases/${entitlementId}/download`
    );
    return data.data;
  },
};
