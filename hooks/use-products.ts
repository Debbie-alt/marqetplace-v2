"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import {
  generateProductModel,
  getProduct,
  getProducts,
  type ProductFilters,
} from "@/lib/api/products";

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => getProducts(filters),
  });
}

export function useProduct(productId: string) {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId),
    enabled: Boolean(productId),
  });
}

export function useGenerateProductModel() {
  return useMutation({
    mutationFn: ({ productId, imageUrls }: { productId: string; imageUrls?: string[] }) =>
      generateProductModel(productId, imageUrls),
  });
}