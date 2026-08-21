"use client";

import { useMutation } from "@tanstack/react-query";
import { login, LoginPayload } from "@/lib/api/auth";

export function useLogin() {
  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
  });
}