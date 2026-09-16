"use client";

export interface SessionUser {
  _id: string;
  email: string;
  fullName: string;
  roles: string[];
  createdAt?: string;
}

const TOKEN_KEY = "marqetplace.token";
const USER_KEY = "marqetplace.user";

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function getAuthToken(): string | null {
  return storage()?.getItem(TOKEN_KEY) ?? null;
}

let lastUserRaw: string | null | undefined;
let cachedUser: SessionUser | null = null;

export function getSessionUser(): SessionUser | null {
  const raw = storage()?.getItem(USER_KEY);
  if (raw === lastUserRaw) return cachedUser;
  lastUserRaw = raw;
  try {
    cachedUser = raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    cachedUser = null;
  }
  return cachedUser;
}

export function storeSession(accessToken: string, user: SessionUser): void {
  const store = storage();
  if (!store) return;
  store.setItem(TOKEN_KEY, accessToken);
  store.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("marqetplace:auth"));
}

export function clearSession(): void {
  const store = storage();
  if (!store) return;
  store.removeItem(TOKEN_KEY);
  store.removeItem(USER_KEY);
  window.dispatchEvent(new Event("marqetplace:auth"));
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken());
}