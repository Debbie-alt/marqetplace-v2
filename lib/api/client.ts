"use client";

import { getAuthToken } from "@/lib/auth/token";

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export interface ApiEnvelope<T> {
  statusCode: number;
  message: string;
  data: T | null;
  error?: string[] | string | null;
}

/** Absolute origin of the NestJS API (empty string = same-origin). */
export function getApiOrigin(): string {
  return API_ORIGIN;
}

/** Build an absolute URL for an API path. */
export function apiUrl(path: string): string {
  return `${API_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Resolve a relative model/image URL against the API origin. */
export function resolveApiUrl(
  url: string | null | undefined,
): string | null {
  if (!url) return null;
  if (/^https?:\/\//.test(url)) return url;
  return `${API_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}

/**
 * Fetch helper that talks to the real NestJS backend.
 * - Attaches the JWT as `Authorization: Bearer <token>` when present.
 * - Unwraps the standard `{ statusCode, message, data, error }` envelope.
 * - Throws a plain Error with the backend's message on failure.
 */
export async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);

  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  if (init.body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAuthToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(apiUrl(path), {
    ...init,
    headers,
    cache: "no-store",
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json().catch(() => null)) as
    | ApiEnvelope<T>
    | null;

  if (!response.ok) {
    const rawError = payload?.error;
    const detail = Array.isArray(rawError) ? rawError[0] : rawError;
    const message =
      payload?.message ||
      detail ||
      `Request failed with status ${response.status}.`;
    throw new Error(message);
  }

  if (!payload) return undefined as T;
  return payload.data ?? (payload as unknown as T);
}