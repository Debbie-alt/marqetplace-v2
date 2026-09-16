"use client";

import { request } from "./client";
import type { SessionUser } from "@/lib/auth/token";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  accessToken: string;
  user: SessionUser;
}

/** POST /auth/register — public. */
export function signup(payload: SignupPayload): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** POST /auth/login — public. */
export function login(payload: LoginPayload): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** GET /auth/me — requires a valid bearer token. */
export function getMe(): Promise<SessionUser> {
  return request<SessionUser>("/auth/me");
}