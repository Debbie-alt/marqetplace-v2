"use client";

import { request } from "./client";
import type { Category } from "@/lib/domain/product";

/** GET /categories — public. */
export function getCategories(): Promise<Category[]> {
  return request<Category[]>("/categories");
}