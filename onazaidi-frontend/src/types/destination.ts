export interface Destination {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  region: string | null;
  country: string;
  coverImageKey: string | null;
  status: string;
  createdAt: string;
}
