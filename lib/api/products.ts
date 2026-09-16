"use client";

import { request, resolveApiUrl } from "./client";
import type {
  BackendProduct,
  LengthUnit,
  Model3dStatus,
  Product,
  ProductStatus,
} from "@/lib/domain/product";

export const PRODUCT_VIEWS = [
  "FRONT",
  "BACK",
  "LEFT",
  "RIGHT",
  "TOP",
  "BOTTOM",
] as const;

export type ProductView = (typeof PRODUCT_VIEWS)[number];

export interface CreateProductInput {
  categoryId: string;
  productName: string;
  description: string;
  price: number;
  widthValue: number;
  heightValue: number;
  sizeUnit?: LengthUnit;
  /** Required when the selected category requires NAFDAC registration. */
  nafdacNumber?: string;
}

export interface ProductCard {
  id: string;
  name: string;
  price: number;
  coverImage: string | null;
}

export interface ProductListResult {
  products: ProductCard[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface ProductFilters {
  categoryId?: string;
  nafdacVerified?: boolean;
  page?: number;
  limit?: number;
}

export interface Product3dStatus {
  productId: string;
  model3dStatus: Model3dStatus;
  model3dUrl: string | null;
  status: ProductStatus;
}

function categoryNameOf(backend: BackendProduct): string {
  if (!backend.category) return "";
  return typeof backend.category === "string"
    ? ""
    : backend.category.name;
}

function categoryIdOf(backend: BackendProduct): string | undefined {
  if (!backend.category) return undefined;
  return typeof backend.category === "string"
    ? backend.category
    : backend.category._id;
}

function categoryRequiresNafdac(backend: BackendProduct): boolean {
  if (!backend.category) return Boolean(backend.nafdacVerified);
  return typeof backend.category === "string"
    ? Boolean(backend.nafdacVerified)
    : Boolean(backend.category.requiresNafdac);
}

function mapModelStatus(
  model3dStatus: Model3dStatus | undefined,
  modelUrl: string | null,
): Product["modelStatus"] {
  if (modelUrl) return "ready";
  switch (model3dStatus) {
    case "PENDING":
      return "queued";
    case "PROCESSING":
      return "generating";
    case "COMPLETE":
      return "ready";
    case "FAILED":
      return "failed";
    default:
      return "not_requested";
  }
}

function mapModelProgress(
  model3dStatus: Model3dStatus | undefined,
  hasModel: boolean,
): number {
  if (hasModel) return 100;
  switch (model3dStatus) {
    case "PENDING":
      return 10;
    case "PROCESSING":
      return 60;
    case "COMPLETE":
      return 100;
    default:
      return 0;
  }
}

function sizeLabel(backend: BackendProduct): string {
  const width = backend.widthValue ?? 0;
  const height = backend.heightValue ?? 0;
  if (!width && !height) return "";
  return `${width} × ${height} ${backend.sizeUnit ?? "CM"}`;
}

function mapBackendProduct(backend: BackendProduct): Product {
  const modelUrl = resolveApiUrl(backend.model3dUrl);

  const images = (backend.images ?? [])
    .map((image) => resolveApiUrl(image.url))
    .filter((url): url is string => Boolean(url));

  const front = backend.images?.find((image) => image.view === "FRONT")?.url;
  const frontUrl = resolveApiUrl(front);
  if (frontUrl && !images.includes(frontUrl)) images.unshift(frontUrl);

  return {
    id: (backend._id ?? "") as string,
    name: backend.productName ?? "",
    description: backend.description ?? "",
    price: backend.price ?? 0,
    size: sizeLabel(backend),
    category: categoryNameOf(backend),
    categoryId: categoryIdOf(backend),
    isNafdacVerifiable:
      categoryRequiresNafdac(backend) || Boolean(backend.nafdacVerified),
    nafdacNumber: backend.nafdacNumber,
    images,
    modelUrl,
    model3dUrl: modelUrl,
    modelStatus: mapModelStatus(backend.model3dStatus, modelUrl),
    modelProgress: mapModelProgress(backend.model3dStatus, Boolean(modelUrl)),
    model3dStatus: backend.model3dStatus,
    productStatus: backend.status,
  };
}

/**
 * POST /products — creates a draft product. Requires an authenticated
 * user with a store profile. The product's 6 images are attached next
 * via uploadProductImages.
 */
export function createProduct(
  input: CreateProductInput,
): Promise<BackendProduct> {
  const body: Record<string, unknown> = {
    categoryId: input.categoryId,
    productName: input.productName,
    description: input.description,
    price: input.price,
    widthValue: input.widthValue,
    heightValue: input.heightValue,
    sizeUnit: input.sizeUnit ?? "CM",
  };
  if (input.nafdacNumber) body.nafdacNumber = input.nafdacNumber;

  return request<BackendProduct>("/products", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * POST /products/:id/images — multipart upload with exactly six
 * single-file fields named FRONT, BACK, LEFT, RIGHT, TOP, BOTTOM.
 * On success the product flips to PENDING_3D and Tripo generation is queued.
 */
export function uploadProductImages(
  productId: string,
  images: Record<ProductView, File>,
): Promise<BackendProduct> {
  const missing = PRODUCT_VIEWS.filter((view) => !images[view]);
  if (missing.length) {
    throw new Error(
      `Missing image for view: ${missing.join(", ")}. All 6 views are required.`,
    );
  }

  const formData = new FormData();
  for (const view of PRODUCT_VIEWS) {
    formData.append(view, images[view], images[view].name);
  }

  return request<BackendProduct>(`/products/${productId}/images`, {
    method: "POST",
    body: formData,
  });
}

/** GET /products/:id/3d-status — public poll endpoint. */
export function getProduct3dStatus(
  productId: string,
): Promise<Product3dStatus> {
  return request<Product3dStatus>(`/products/${productId}/3d-status`);
}

interface BackendListResult {
  data: Array<{
    _id: string;
    productName: string;
    price: number;
    coverImage: string | null;
  }>;
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/** GET /products — paginated public catalogue of ACTIVE products. */
export async function getProductsPage(
  filters: ProductFilters = {},
): Promise<ProductListResult> {
  const params = new URLSearchParams();
  if (filters.categoryId) params.set("category", filters.categoryId);
  if (filters.nafdacVerified) params.set("nafdacVerified", "true");
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  const query = params.toString();
  const result = await request<BackendListResult>(
    `/products${query ? `?${query}` : ""}`,
  );

  return {
    products: result.data.map((item) => ({
      id: item._id,
      name: item.productName,
      price: item.price,
      coverImage: item.coverImage,
    })),
    page: result.pagination.currentPage,
    pageSize: result.pagination.pageSize,
    totalItems: result.pagination.totalItems,
    totalPages: result.pagination.totalPages,
    hasNextPage: result.pagination.hasNextPage,
  };
}

/** Convenience list (first page) — used by the landing page. */
export async function getProducts(
  filters: ProductFilters = {},
): Promise<Product[]> {
  const result = await getProductsPage(filters);
  return result.products.map((card) => ({
    id: card.id,
    name: card.name,
    description: "",
    price: card.price,
    size: "",
    category: "",
    isNafdacVerifiable: false,
    images: card.coverImage ? [card.coverImage] : [],
    modelUrl: null,
    model3dUrl: null,
    modelStatus: "not_requested",
    modelProgress: 0,
  }));
}

/** GET /products/:id — full product detail (public, categories populated). */
export async function getProductById(
  productId: string,
): Promise<Product | null> {
  try {
    const backend = await request<BackendProduct>(`/products/${productId}`);
    return mapBackendProduct(backend);
  } catch (error) {
    if (error instanceof Error && /not found/i.test(error.message)) {
      return null;
    }
    throw error;
  }
}

export const getProduct = getProductById;