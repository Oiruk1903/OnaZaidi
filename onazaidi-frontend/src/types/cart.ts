export interface CartItem {
  id: string;
  photoId: string;
  photoTitle: string;
  photoSlug: string;
  thumbnailUrl: string | null;
  price: string;
  currency: string;
}

export interface Cart {
  items: CartItem[];
  itemCount: number;
  subtotal: string;
  discount: string;
  tax: string;
  total: string;
  currency: string;
}
