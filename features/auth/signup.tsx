"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Brand, DarkInput, FieldLabel, PasswordInput, PrimaryButton } from "@/components/ui";

import { useSignup } from "@/hooks/useSignup";
import { storeSession } from "@/lib/auth/token";

function Segment() {
  return (
    <div className="grid grid-cols-2 rounded-full bg-neutral-100 p-1.5 text-center text-xs font-bold">
      <Link className="rounded-full py-3 text-neutral-500 transition hover:text-neutral-900"
        href="/login">
        Sign In
      </Link>

      <Link
        className="rounded-full bg-sky-100 py-3 text-neutral-900 shadow-sm"
        href="/signup" >
        Create Account
      </Link>
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const { mutate, isPending, error } = useSignup();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();

    mutate(
      {
        email: form.email,
        password: form.password,
        fullName,
      },
      {
        onSuccess: (response) => {
          storeSession(response.accessToken, response.user);
          router.push("/seller/listings/new");
        },
      },
    );
  }

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-10 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-lg flex-col justify-center">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <Segment />

          <div className="mt-8">
            <Brand />
          </div>

          <div className="mt-7">
            <h1 className="text-3xl font-black tracking-tight text-neutral-900">
              CREATE SELLER ACCOUNT
            </h1>

            <p className="mt-3 text-sm leading-6 text-neutral-500">
              Start selling your products on marqetplace.
            </p>

            <p className="mt-2 text-sm text-neutral-500">
              Already a seller?{" "}
              <Link
                href="/login"
                className="font-medium text-sky-600 hover:text-sky-700"
              >
                Sign in →
              </Link>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <FieldLabel>First Name</FieldLabel>

                <div className="mt-2">
                  <DarkInput
                    placeholder="First name"
                    value={form.firstName}
                    onChange={(event) =>
                      updateField(
                        "firstName",
                        event.target.value
                      )
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <FieldLabel>Last Name</FieldLabel>

                <div className="mt-2">
                  <DarkInput
                    placeholder="Last name"
                    value={form.lastName}
                    onChange={(event) =>
                      updateField(
                        "lastName",
                        event.target.value
                      )
                    }
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <FieldLabel>Email Address</FieldLabel>

              <div className="mt-2">
                <DarkInput
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(event) =>
                    updateField(
                      "email",
                      event.target.value
                    )
                  }
                  required
                />
              </div>
            </div>

            <div>
              <FieldLabel>Password</FieldLabel>

              <div className="mt-2">
                <PasswordInput
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={(event) =>
                    updateField(
                      "password",
                      event.target.value
                    )
                  }
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2.5">
                <p className="text-xs text-red-600">
                  {error.message}
                </p>
              </div>
            )}

            <PrimaryButton
              type="submit"
              disabled={isPending}
              className="mt-2 w-full"
            >
              {isPending
                ? "Creating…"
                : "Create Seller Account →"}
            </PrimaryButton>
          </form>

          <p className="mt-7 text-center text-[10px] leading-5 text-neutral-400">
            By creating an account you agree to our{" "}
            <a className="text-sky-600 hover:text-sky-700">
              Terms of Service
            </a>
            ,{" "}
            <a className="text-sky-600 hover:text-sky-700">
              Privacy Policy
            </a>
            , and{" "}
            <a className="text-sky-600 hover:text-sky-700">
              Seller Policy
            </a>
            .
          </p>
        </div>

        <p className="mt-6 text-center text-[10px] tracking-widest text-neutral-400">
          MARQETPLACE © 2026 · NIGERIA
        </p>
      </div>
    </main>
  );
}