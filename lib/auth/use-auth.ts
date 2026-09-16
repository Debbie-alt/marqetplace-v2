"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  clearSession,
  getAuthToken,
  getSessionUser,
  type SessionUser,
} from "./token";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("marqetplace:auth", callback as EventListener);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("marqetplace:auth", callback as EventListener);
  };
}

const EMPTY_USER: SessionUser | null = null;

export function useAuth() {
  const token = useSyncExternalStore(
    subscribe,
    getAuthToken,
    () => null,
  );
  const user = useSyncExternalStore(
    subscribe,
    getSessionUser,
    () => EMPTY_USER,
  );

  const logout = useCallback(() => {
    clearSession();
  }, []);

  return {
    token,
    user,
    isAuthenticated: Boolean(token),
    logout,
  };
}