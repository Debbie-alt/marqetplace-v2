"use client";

import type { ProductCategory } from "@/lib/domain/product";

export interface ListingDraft {
  category?: ProductCategory;
  name?: string;
  description?: string;
  price?: number;
  size?: string;
  images: File[];
}

export interface CreateProductResponse {
  productId: string;
  taskId: string;
  status: string;
}

export async function saveListingDraft(
  draft: ListingDraft,
): Promise<CreateProductResponse> {
  const formData = new FormData();

  formData.append("name", draft.name ?? "");
  formData.append("category", draft.category ?? "other");
  formData.append("description", draft.description ?? "");
  formData.append("price", String(draft.price ?? 0));
  formData.append("size", draft.size ?? "");

  draft.images.forEach((image) => {
    formData.append("photos", image);
  });

  const response = await fetch(`/api/v1/products`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.error ?? "Failed to create product.",
    );
  }

  return response.json();
}