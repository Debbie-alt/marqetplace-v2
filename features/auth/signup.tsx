"use client";

import Link from "next/link";
import { ShoppingCart, Store } from "lucide-react";
import { FormEvent, useState } from "react";
import { Brand, DarkInput, FieldLabel, PasswordInput, PrimaryButton,} from "@/components/ui";

import { useSignup } from "@/hooks/useSignup";

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

function Divider({ children }: { children: string }) {
  return (
    <div className="my-7 flex items-center gap-4 text-[10px] font-medium uppercase tracking-wider text-neutral-400 before:h-px before:flex-1 before:bg-neutral-200 after:h-px after:flex-1 after:bg-neutral-200">
      {children}
    </div>
  );
}

function OAuth({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="mb-3 w-full rounded-xl border border-neutral-200 bg-white py-3.5 text-xs font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50">
      {children}
    </button>
  );
}

export default function SignupPage() {
  const { mutate, isPending, error } = useSignup();

  const [seller, setSeller] = useState(true);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
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

    mutate({
      ...form,
      role: seller ? "seller" : "buyer",
    });
  }

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-10 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-lg flex-col justify-center">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          {/* Header */}
          <Segment />

          <div className="mt-8">
            <Brand />
          </div>

          <div className="mt-7">
            <h1 className="text-3xl font-black tracking-tight text-neutral-900">
              CREATE ACCOUNT.
            </h1>

            <p className="mt-3 text-sm leading-6 text-neutral-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-sky-600 hover:text-sky-700"
              >
                Sign in →
              </Link>
            </p>
          </div>

          {/* Account Type */}
          <div className="mt-7">
            <p className="mb-3 text-xs font-semibold text-neutral-700">
              What are you here to do?
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSeller(false)}
                className={`rounded-xl border p-4 text-center transition ${
                  !seller
                    ? "border-sky-300 bg-sky-50 shadow-sm"
                    : "border-neutral-200 bg-white hover:bg-neutral-50"
                }`}
              >
                <ShoppingCart
                  className={`mx-auto mb-2 size-5 ${
                    !seller
                      ? "text-sky-600"
                      : "text-neutral-500"
                  }`}
                />

                <b className="text-xs font-semibold text-neutral-800">
                  I&apos;m a Buyer
                </b>

                <small className="mt-1.5 block text-[10px] leading-4 text-neutral-500">
                  Shop verified products
                </small>
              </button>

              <button
                type="button"
                onClick={() => setSeller(true)}
                className={`rounded-xl border p-4 text-center transition ${
                  seller
                    ? "border-sky-300 bg-sky-50 shadow-sm"
                    : "border-neutral-200 bg-white hover:bg-neutral-50"
                }`}
              >
                <Store
                  className={`mx-auto mb-2 size-5 ${
                    seller
                      ? "text-sky-600"
                      : "text-neutral-500"
                  }`}
                />

                <b className="text-xs font-semibold text-neutral-800">
                  I&apos;m a Seller
                </b>

                <small className="mt-1.5 block text-[10px] leading-4 text-neutral-500">
                  List & sell products
                </small>
              </button>
            </div>
          </div>

          {/* Social Signup */}
          <div className="mt-7">
            <OAuth>Continue with Google</OAuth>
          </div>

          <Divider>or sign up with email</Divider>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
              <FieldLabel>Phone Number</FieldLabel>

              <div className="mt-2">
                <DarkInput
                  type="tel"
                  placeholder="0805236938"
                  value={form.phone}
                  onChange={(event) =>
                    updateField(
                      "phone",
                      event.target.value
                    )
                  }
                  required
                />
              </div>

              <p className="mt-2 text-[10px] leading-4 text-neutral-400">
                Nigerian number required for SMS verification
              </p>
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
                : "Create Account →"}
            </PrimaryButton>
          </form>

          {/* Terms */}
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