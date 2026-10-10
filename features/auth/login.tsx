"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import {
  Brand,
  DarkInput,
  FieldLabel,
  PasswordInput,
  PrimaryButton,
} from "@/components/ui";

import { useLogin } from "@/hooks/useLogin";
import { storeSession } from "@/lib/auth/token";
import { useAuth } from "@/lib/auth/use-auth";

function Segment() {
  return (
    <div className="grid grid-cols-2 rounded-full bg-neutral-900 p-1 text-center text-xs font-black">
      <Link
      className="rounded-full bg-violet-300 py-3 text-neutral-950 shadow-sm transition hover:bg-violet-200"
        href="/login"
      >
        Sign In
      </Link>

      <Link
        className="rounded-full py-3 text-neutral-400"
        href="/signup"
      >
        Create Account
      </Link>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { mutate, isPending, error } = useLogin();

  useEffect(() => {
    if (isAuthenticated) router.replace("/seller/dashboard");
  }, [isAuthenticated, router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    mutate(
      {
        email,
        password,
      },
      {
        onSuccess: (response) => {
          storeSession(response.accessToken, response.user);
          router.replace("/seller/dashboard");
        },
      },
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f2f8] p-5">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-8 shadow-[0_18px_60px_rgba(38,29,52,.08)] sm:p-10">
        <Segment />

        <div className="mt-5">
          <Brand />
        </div>

        <h1 className="font-museo mt-7 text-3xl font-bold tracking-tight">
          SELLER LOGIN
        </h1>

        <p className="mt-2 text-sm text-neutral-500">
          Welcome back! Sign in to manage your listings.
        </p>

        <p className="mt-2 text-sm text-neutral-500">
          New seller?{" "}
          <Link href="/signup" className="font-medium text-violet-500 transition hover:text-violet-600">
            Create your store →
          </Link>
        </p>

        <form onSubmit={handleSubmit}>
          <div>
            <FieldLabel>Email Address</FieldLabel>

            <DarkInput
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="mt-3">
            <div className="flex justify-between">
              <FieldLabel>Password</FieldLabel>

              <Link
                href="/forgot-password"
                className="text-xs text-violet-500 transition hover:text-violet-600"
              >
                Forgot password?
              </Link>
            </div>

            <PasswordInput
              placeholder="Your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error && (
            <p className="mt-3 text-xs text-red-500">
              {error.message}
            </p>
          )}

          <PrimaryButton
            type="submit"
            disabled={isPending}
            className="mt-5 w-full"
          >
            {isPending ? "Signing in…" : "Sign In →"}
          </PrimaryButton>
        </form>

        <p className="mt-5 text-center text-[9px] text-neutral-500">
          By signing in you agree to our{" "}
              <a className="text-violet-500">Terms of Service</a>{" "}
          and{" "}
              <a className="text-violet-500">Privacy Policy</a>.
        </p>
      </div>

      <p className="-mt-3 text-[10px] tracking-widest text-neutral-500">
        MARQETPLACE © 2026 · NIGERIA
      </p>
    </main>
  );
}
