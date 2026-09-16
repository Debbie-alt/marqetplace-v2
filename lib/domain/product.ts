export const productModelStatuses = [
  "not_requested",
  "queued",
  "generating",
  "ready",
  "failed",
] as const;

export type ProductModelStatus = (typeof productModelStatuses)[number];

export type ProductStatus =
  | "DRAFT"
  | "PENDING_3D"
  | "NEEDS_REVIEW"
  | "ACTIVE"
  | "REJECTED";

export type Model3dStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETE"
  | "FAILED";

export type LengthUnit = "CM" | "INCH" | "FEET";

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface Category {
  _id: string;
  name: string;
  requiresNafdac: boolean;
  description?: string;
}

export interface ProductImage {
  view: string;
  url: string;
  key: string;
}

/**
 * Frontend display model — the shape components consume.
 * Built from the NestJS backend's product documents.
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  size: string;
  category: string;
  categoryId?: string;
  isNafdacVerifiable: boolean;
  nafdacNumber?: string;
  images: string[];
  modelUrl: string | null;
  model3dUrl?: string | null;
  modelStatus: ProductModelStatus;
  modelProgress: number;
  productStatus?: ProductStatus;
  model3dStatus?: Model3dStatus;
  widthValue?: number;
  heightValue?: number;
  sizeUnit?: LengthUnit;
}

export interface ProductModelGenerationStatus {
  productId: string;
  modelUrl: string | null;
  modelStatus: ProductModelStatus;
  modelProgress: number;
}

/**
 * Raw product document returned by the real NestJS backend
 * (GET /products/:id). Fields differ from the old mock backend.
 */
export interface BackendProduct {
  _id?: string;
  productName?: string;
  description?: string;
  price?: number;
  widthValue?: number;
  heightValue?: number;
  sizeUnit?: LengthUnit;
  status?: ProductStatus;
  model3dStatus?: Model3dStatus;
  model3dUrl?: string | null;
  images?: ProductImage[];
  category?:
    | string
    | { _id: string; name: string; requiresNafdac: boolean };
  vendor?: string | { _id: string; storeName: string; logoUrl?: string };
  nafdacNumber?: string;
  expiryDate?: string;
  nameAutoFilled?: boolean;
  nafdacVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}