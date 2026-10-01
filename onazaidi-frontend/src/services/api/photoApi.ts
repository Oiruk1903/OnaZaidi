import { api } from "@/lib/axios";
import type { ApiResponse, PageResponse } from "@/types/api";
import type { Photo, PhotoDetail, PhotoFilter } from "@/types/photo";

export const photoApi = {
  async list(filter: PhotoFilter = {}) {
    const { data } = await api.get<ApiResponse<PageResponse<Photo>>>("/photos", {
      params: {
        search: filter.search,
        destinationId: filter.destinationId,
        experienceId: filter.experienceId,
        categoryId: filter.categoryId,
        albumId: filter.albumId,
        minPrice: filter.minPrice,
        maxPrice: filter.maxPrice,
        sort: filter.sort ?? "latest",
        page: filter.page ?? 0,
        size: filter.size ?? 24,
      },
    });
    return data.data;
  },

  async getBySlug(slug: string) {
    const { data } = await api.get<ApiResponse<PhotoDetail>>(`/photos/${slug}`);
    return data.data;
  },
};
