"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getProduct,
  getProducts,
  type ProductFilters,
} from "@/lib/api/products";
import { getCategories } from "@/lib/api/categories";

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

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
}