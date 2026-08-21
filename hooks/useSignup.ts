"use client";

import { useMutation } from "@tanstack/react-query";
import { signup, SignupPayload } from "@/lib/api/auth";

export function useSignup() {
  return useMutation({
    mutationFn: (payload: SignupPayload) => signup(payload),
  });
}