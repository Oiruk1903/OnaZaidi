export interface Photo {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  previewUrl: string | null;
  price: string;
  currency: string;
  status: string;
  albumId: string | null;
  albumTitle: string | null;
  destinationId: string | null;
  destinationName: string | null;
  experienceId: string | null;
  experienceName: string | null;
  createdAt: string;
}

export interface PhotoDetail extends Photo {
  description: string | null;
  watermarkUrl: string | null;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  fileSizeBytes: number | null;
  attractionId: string | null;
  attractionName: string | null;
  categoryId: string | null;
  categoryName: string | null;
  capturedAt: string | null;
}

export interface PhotoFilter {
  search?: string;
  destinationId?: string;
  experienceId?: string;
  categoryId?: string;
  albumId?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "latest" | "oldest" | "price_asc" | "price_desc";
  page?: number;
  size?: number;
}
