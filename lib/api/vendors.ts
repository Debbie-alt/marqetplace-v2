"use client";

import { request } from "./client";

export interface Vendor {
  _id: string;
  storeName: string;
  description?: string;
  logoUrl?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVendorPayload {
  storeName: string;
  description?: string;
  logoUrl?: string;
  address?: string;
}

/** POST /vendors — creates the caller's store profile. */
export function createVendor(
  payload: CreateVendorPayload,
): Promise<Vendor> {
  return request<Vendor>("/vendors", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * GET /vendors/me — the caller's store profile, or null when
 * they have not opened a store yet (backend returns 404).
 */
export async function getVendorMe(): Promise<Vendor | null> {
  try {
    return await request<Vendor>("/vendors/me");
  } catch (error) {
    if (error instanceof Error && /store profile/i.test(error.message)) {
      return null;
    }
    throw error;
  }
}