export const productCategories = [
  "food",
  "drug",
  "health",
  "fashion",
  "electronics",
  "other",
] as const;

export type ProductCategory = (typeof productCategories)[number];

export const productModelStatuses = [
  "not_requested",
  "queued",
  "generating",
  "ready",
  "failed",
] as const;

export type ProductModelStatus = (typeof productModelStatuses)[number];

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  size: string;
  category: ProductCategory;
  images: string[];

  isNafdacVerifiable: boolean;

  modelUrl: string | null;
  model3dUrl?: string | null;

  modelStatus: ProductModelStatus;
  modelProgress: number;
}

export interface ProductModelGenerationStatus {
  productId: string;
  modelUrl: string | null;
  modelStatus: ProductModelStatus;
  modelProgress: number;
}

/**
 * Raw product shape returned by the current Express backend.
 */
export interface BackendProduct {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category?: ProductCategory;
  size?: string;
  imageUrl?: string | null;
  images?: string[];
  isNafdacVerifiable?: boolean;
  taskId?: string;

  status:
    | "queued"
    | "running"
    | "success"
    | "failed"
    | "banned"
    | "expired"
    | "cancelled"
    | string;

  progress?: number;

  mode?: "single" | "multiview";

  angles?: string[];

  modelUrls?: {
    glb?: string | null;
  } | null;

  modelUrl?: string | null;

  thumbnailUrl?: string | null;

  createdAt?: string;
}