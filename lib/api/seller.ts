import type { ProductCategory } from "@/lib/domain/product";

export interface ListingDraft {
  category?: ProductCategory;
  name?: string;
  description?: string;
  price?: number;
  size?: string;
  images: File[];
}
