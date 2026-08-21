"use client";

import { useMutation } from "@tanstack/react-query";

import {
  verifyNafdacNumber,
  type NafdacVerificationRecord,
} from "@/lib/api/verification";

export function useNafdacVerification() {
  return useMutation<NafdacVerificationRecord, Error, string>({
    mutationFn: verifyNafdacNumber,
  });
}