"use client";

import { request } from "./client";

export interface NafdacVerificationRecord {
  nafdacNumber: string;
  found: boolean;
  isValid?: boolean;
  productName?: string;
  expiryDate?: string;
  manufacturer?: string;
}

/** POST /products/nafdac/verify — public, rate limited. */
export function verifyNafdacNumber(
  number: string,
): Promise<NafdacVerificationRecord> {
  const normalized = number.trim().toUpperCase();
  if (!normalized) {
    throw new Error("Enter a NAFDAC registration number.");
  }
  return request<NafdacVerificationRecord>("/products/nafdac/verify", {
    method: "POST",
    body: JSON.stringify({ nafdacNumber: normalized }),
  });
}