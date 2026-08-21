"use client";

import type { BackendProduct, Product,ProductCategory,} from "@/lib/domain/product";

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
const API_ROOT = `${API_ORIGIN}/api/v1`;

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
export async function createProduct(input: {
  name: string;
  category: ProductCategory;
  description: string;
  price: number;
  size: string;
  photos: File[];
}) {
  if (!input.photos.length) {
    throw new Error("At least one product image is required.");
  }

  const formData = new FormData();

  formData.append("name", input.name);
  formData.append("category", input.category);
  formData.append("description", input.description);
  formData.append("price", String(input.price));
  formData.append("size", input.size);

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

/**
 * Get the generation status for a product.
 *
 * Backend:
 * GET /api/products/:id/status
 */
export interface ProductFilters {
  category?: ProductCategory | "";
  verified?: boolean;
  has3D?: boolean;
  minPrice?: string;
  maxPrice?: string;
}

export async function getProducts(
  filters: ProductFilters = {},
): Promise<Product[]> {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.verified) params.set("isNafdacVerifiable", "true");
  if (filters.has3D) params.set("has3D", "true");
  if (filters.minPrice) params.set("minPrice", filters.minPrice);
  if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);

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

/**
 * Get one product by ID.
 *
 * Since the current backend doesn't expose
 * GET /api/products/:id, we get the list and find it.
 */
export async function getProductById(
  productId: string,
): Promise<Product | null> {
  const products = await getProducts();

  return (
    products.find(
      (product) => product.id === productId,
    ) ?? null
  );
}