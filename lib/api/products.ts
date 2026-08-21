"use client";

import type { BackendProduct, Product,ProductCategory,} from "@/lib/domain/product";

const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"
).replace(/\/$/, "");
const API_ROOT = `${API_ORIGIN}/api`;

export interface CreateProductInput {
  name: string;
  category: ProductCategory;
  description: string;
  price: number;
  size: string;
  photos: File[];
}

export interface CreateProductResponse {
  productId: string;
  taskId: string;
  status: string;
}

export interface UploadProductImagesResponse {
  imageUrls: string[];
}

export interface GenerateProductModelResponse {
  productId: string;
  modelUrl: string | null;
  modelStatus: Product["modelStatus"];
}

/**
 * Converts the backend's relative generated-model URL
 * into a browser-accessible absolute URL.
 *
 * Backend:
 *   /generated/p_123.glb
 *
 * Frontend:
 *   http://localhost:4000/generated/p_123.glb
 */
function resolveBackendUrl(
  url: string | null | undefined,
): string | null {
  if (!url) return null;

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${API_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}

/**
 * Convert raw backend status into the status expected
 * by the frontend.
 */
function mapModelStatus(
  status?: string,
): Product["modelStatus"] {
  switch (status) {
    case "queued":
      return "queued";

    case "running":
      return "generating";

    case "success":
      return "ready";

    case "failed":
    case "banned":
    case "expired":
    case "cancelled":
      return "failed";

    default:
      return "not_requested";
  }
}

/**
 * Convert backend product into the frontend Product model.
 */
function mapBackendProduct(
  backendProduct: BackendProduct,
): Product {
  const modelUrl = resolveBackendUrl(
    backendProduct.modelUrl ?? backendProduct.modelUrls?.glb,
  );

  const images = (backendProduct.images ?? [])
    .map((image) => resolveBackendUrl(image))
    .filter((image): image is string => Boolean(image));

  if (backendProduct.imageUrl) {
    const imageUrl = resolveBackendUrl(backendProduct.imageUrl);
    if (imageUrl && !images.includes(imageUrl)) images.unshift(imageUrl);
  }

  return {
    id: backendProduct.id,
    name: backendProduct.name,

    description: backendProduct.description ?? "",
    price: backendProduct.price ?? 0,
    category: backendProduct.category ?? "other",
    size: backendProduct.size ?? "",
    images,

    isNafdacVerifiable: backendProduct.isNafdacVerifiable ?? false,

    modelUrl,
    model3dUrl: modelUrl,

    modelStatus: modelUrl
      ? "ready"
      : mapModelStatus(backendProduct.status),
    modelProgress: backendProduct.progress ?? 0,
  };
}

/**
 * Create a product and start Tripo 3D generation.
 *
 * Backend expects:
 *
 * POST /api/products
 * multipart/form-data
 *
 * photos
 * angles
 * name
 */
export async function createProduct(
  input: CreateProductInput,
): Promise<CreateProductResponse> {
  if (!input.photos.length) {
    throw new Error("At least one product image is required.");
  }

  const formData = new FormData();

  formData.append("name", input.name);
  formData.append("category", input.category);
  formData.append("description", input.description);
  formData.append("price", String(input.price));
  formData.append("size", input.size);

  const angles = ["front", "left", "back", "right"].slice(
    0,
    input.photos.length,
  );
  formData.append("angles", JSON.stringify(angles));

  input.photos.forEach((photo) => {
    formData.append("photos", photo);
  });

  const response = await fetch(`${API_ROOT}/products`, {
    method: "POST",
    body: formData,
  });

  let data: {
    productId?: string;
    taskId?: string;
    status?: string;
    error?: string;
    details?: { message?: string };
  };

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "The server returned an invalid response.",
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.error ||
        data?.details?.message ||
        "Unable to create product.",
    );
  }

  return {
    productId: data.productId ?? "",
    taskId: data.taskId ?? "",
    status: data.status ?? "",
  };
}

/** Uploads images through our backend; it never contacts the 3D provider. */
export async function uploadProductImages(
  productId: string,
  images: File[],
): Promise<UploadProductImagesResponse> {
  if (!images.length) {
    throw new Error("At least one product image is required.");
  }

  const formData = new FormData();
  images.forEach((image) => formData.append("images", image));

  const response = await fetch(`${API_ROOT}/products/${productId}/images`, {
    method: "POST",
    body: formData,
  });

  const data = (await response.json().catch(() => ({}))) as {
    imageUrls?: string[];
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error ?? "Unable to upload product images.");
  }

  return { imageUrls: data.imageUrls ?? [] };
}

/** Starts model generation through our backend only. */
export async function generateProductModel(
  productId: string,
  imageUrls: string[] = [],
): Promise<GenerateProductModelResponse> {
  const response = await fetch(`${API_ROOT}/products/${productId}/model`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrls }),
  });

  const data = (await response.json().catch(() => ({}))) as {
    productId?: string;
    modelUrl?: string | null;
    modelStatus?: Product["modelStatus"];
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error ?? "Unable to start 3D model generation.");
  }

  return {
    productId: data.productId ?? productId,
    modelUrl: resolveBackendUrl(data.modelUrl),
    modelStatus: data.modelStatus ?? "queued",
  };
}

export async function getProductGenerationStatus(
  productId: string,
): Promise<{
  productId: string;
  modelUrl: string | null;
  modelStatus: Product["modelStatus"];
  modelProgress: number;
}> {
  const response = await fetch(`${API_ROOT}/products/${productId}/status`, {
    cache: "no-store",
  });

  const data = (await response.json().catch(() => null)) as
    | BackendProduct
    | { error?: string }
    | null;

  if (!response.ok || !data || !("id" in data)) {
    throw new Error(
      data && "error" in data
        ? data.error ?? "Unable to check model generation status."
        : "Unable to check model generation status.",
    );
  }

  return {
    productId: data.id,
    modelUrl: resolveBackendUrl(data.modelUrl ?? data.modelUrls?.glb),
    modelStatus: data.modelUrl || data.modelUrls?.glb
      ? "ready"
      : mapModelStatus(data.status),
    modelProgress: data.progress ?? 0,
  };
}

/**
 * Get the generation status for a product.
 *
 * Backend:
 * GET /api/products/:id/status
 */
export interface ProductFilters {
  category?: ProductCategory | "";
  verified?: boolean;
}

export async function getProducts(
  filters: ProductFilters = {},
): Promise<Product[]> {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.verified) params.set("isNafdacVerifiable", "true");

  const query = params.toString();
  const response = await fetch(
    `${API_ROOT}/products${query ? `?${query}` : ""}`,
    {
    cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Unable to fetch products.");
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(mapBackendProduct);
}

/** Get one product by ID from the backend detail endpoint. */
export async function getProductById(
  productId: string,
): Promise<Product | null> {
  const response = await fetch(`${API_ROOT}/products/${productId}`, {
    cache: "no-store",
  });

  if (response.status === 404) return null;

  const data = (await response.json().catch(() => null)) as
    | BackendProduct
    | { error?: string; message?: string }
    | null;

  if (!response.ok) {
    const message =
      data && "error" in data
        ? data.error
        : data && "message" in data
          ? data.message
          : undefined;

    throw new Error(message ?? "Unable to fetch product.");
  }

  if (!data || !("id" in data)) {
    throw new Error("The server returned an invalid product.");
  }

  return mapBackendProduct(data);
}

export const getProduct = getProductById;