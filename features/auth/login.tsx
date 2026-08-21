"use client";

import Link from "next/link";
import { Apple } from "lucide-react";
import { FormEvent, useState } from "react";

import {
  Brand,
  DarkInput,
  FieldLabel,
  PasswordInput,
  PrimaryButton,
} from "@/components/ui";

import { useLogin } from "@/hooks/useLogin";

function Segment() {
  return (
    <div className="grid grid-cols-2 rounded-full bg-neutral-900 p-1 text-center text-xs font-black">
      <Link
        className="rounded-full bg-sky-200 py-3 text-neutral-900"
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

function Divider({ children }: { children: string }) {
  return (
    <div className="my-5 flex items-center gap-3 text-[10px] text-neutral-500 before:h-px before:flex-1 before:bg-sky-200 after:h-px after:flex-1 after:bg-sky-200">
      {children}
    </div>
  );
}

function OAuth({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="mb-3 w-full rounded-xl bg-neutral-900 py-3 text-xs text-white"
    >
      {children}
    </button>
  );
}

export default function LoginPage() {
  const { mutate, isPending, error } = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    mutate({
      email,
      password,
    });
  }

  return (
    <main className="grid min-h-screen place-items-center bg-neutral-200 p-5">
      <div className="w-full max-w-lg bg-white p-8 shadow-sm sm:p-10">
        <Segment />

        <div className="mt-5">
          <Brand />
        </div>

        <h1 className="mt-7 text-3xl font-black">
          WELCOME BACK.
        </h1>

        <p className="mt-2 text-sm text-neutral-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-sky-600">
            Sign up free →
          </Link>
        </p>

        <div className="mt-5">
          <OAuth>Continue with Google</OAuth>

          <OAuth>
            <Apple className="mr-2 inline size-4" />
            Continue with Apple
          </OAuth>
        </div>

        <Divider>or sign in with email</Divider>

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
                className="text-[10px] text-sky-600"
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
          <a className="text-sky-600">Terms of Service</a>{" "}
          and{" "}
          <a className="text-sky-600">Privacy Policy</a>.
        </p>
      </div>

      <p className="-mt-3 text-[10px] tracking-widest text-neutral-500">
        MARQETPLACE © 2026 · NIGERIA
      </p>
    </main>
  );
}