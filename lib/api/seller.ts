import type { LengthUnit } from "@/lib/domain/product";
import type { ProductView } from "./products";

export interface ListingDraft {
  categoryId?: string;
  name?: string;
  description?: string;
  price?: number;
  width?: number;
  height?: number;
  sizeUnit?: LengthUnit;
  nafdacNumber?: string;
  images: Partial<Record<ProductView, File>>;
}