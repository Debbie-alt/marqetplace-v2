"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";
import { Brand, DarkInput, FieldLabel, PrimaryButton } from "@/components/ui";
/* eslint-disable @next/next/no-img-element */
import { getProduct, updateProduct } from "@/lib/api/products";
import { getSessionUser } from "@/lib/auth/token";
import type { LengthUnit, Product } from "@/lib/domain/product";

const SIZE_UNITS: LengthUnit[] = ["CM", "INCH", "FEET"];

function ProductForm({
  product,
  productId,
}: {
  product: Product;
  productId: string;
}) {
  const router = useRouter();

  const [form, setForm] = useState({
    description: product.description ?? "",
    price: String(product.price ?? ""),
    widthValue: String(product.widthValue ?? ""),
    heightValue: String(product.heightValue ?? ""),
    sizeUnit: product.sizeUnit ?? "CM",
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      updateProduct(productId, {
        description: form.description.trim(),
        price: Number(form.price) || 0,
        widthValue: Number(form.widthValue) || 0,
        heightValue: Number(form.heightValue) || 0,
        sizeUnit: form.sizeUnit,
      }),
    onSuccess: () => {
      router.push("/seller/listings");
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveMutation.mutate();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-2xl border border-neutral-200 bg-white p-6">
      <div className="flex items-center gap-4 rounded-xl bg-neutral-50 p-4">
        <div className="flex size-14 items-center justify-center overflow-hidden rounded-xl bg-white">
          {product.images[0] ? (
            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl">📦</span>
          )}
        </div>

        <div className="min-w-0">
          <div className="truncate text-sm font-bold">{product.name}</div>
          <div className="mt-0.5 text-xs text-neutral-500">
            {product.category || "Product"} · {product.size || "No size set"}
          </div>
        </div>
      </div>

      <div>
        <FieldLabel>Description</FieldLabel>
        <textarea
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          placeholder="Describe your product…"
          required
          rows={4}
          className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-400"
        />
      </div>

      <div>
        <FieldLabel>Price (₦)</FieldLabel>
        <DarkInput
          type="number"
          min={0}
          placeholder="e.g. 15000"
          value={form.price}
          onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
          required
          className="bg-white text-neutral-900 focus:ring-amber-400"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <FieldLabel>Width</FieldLabel>
          <DarkInput
            type="number"
            min={0}
            step="any"
            placeholder="e.g. 20"
            value={form.widthValue}
            onChange={(event) => setForm((prev) => ({ ...prev, widthValue: event.target.value }))}
            className="bg-white text-neutral-900 focus:ring-amber-400"
          />
        </div>

        <div>
          <FieldLabel>Height</FieldLabel>
          <DarkInput
            type="number"
            min={0}
            step="any"
            placeholder="e.g. 30"
            value={form.heightValue}
            onChange={(event) => setForm((prev) => ({ ...prev, heightValue: event.target.value }))}
            className="bg-white text-neutral-900 focus:ring-amber-400"
          />
        </div>

        <div>
          <FieldLabel>Unit</FieldLabel>
          <div className="flex gap-1 rounded-xl border border-neutral-200 bg-white p-1">
            {SIZE_UNITS.map((unit) => (
              <button
                key={unit}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, sizeUnit: unit }))}
                className={`flex-1 rounded-lg px-2 py-2 text-xs font-bold transition ${
                  form.sizeUnit === unit
                    ? "bg-amber-500 text-neutral-950"
                    : "text-neutral-500 hover:bg-neutral-100"
                }`}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>
      </div>

      {saveMutation.error && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-xs text-red-600">
          {saveMutation.error instanceof Error
            ? saveMutation.error.message
            : "Failed to update the listing."}
        </div>
      )}

      <div className="flex gap-3">
        <Link
          href="/seller/listings"
          className="flex items-center justify-center rounded-full border border-neutral-300 px-6 py-3 text-sm font-black text-neutral-600 transition hover:border-neutral-500"
        >
          Cancel
        </Link>

        <PrimaryButton
          type="submit"
          disabled={saveMutation.isPending}
          className="flex flex-1 items-center justify-center gap-2"
        >
          <Save className="size-4" />
          {saveMutation.isPending ? "Saving…" : "Save Changes"}
        </PrimaryButton>
      </div>
    </form>
  );
}

export function EditListing() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const productId = params.id;

  const productQuery = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId),
    enabled: Boolean(productId),
  });

  useEffect(() => {
    if (!getSessionUser()) {
      router.replace(`/login?next=/seller/listings/${productId}/edit`);
    }
  }, [router, productId]);

  const product = productQuery.data;

  return (
    <main className="min-h-screen bg-neutral-100">
      <header className="border-b bg-white px-6 py-3">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <Brand />

          <span className="text-[10px] text-neutral-500">
            Seller Dashboard → Edit Listing
          </span>

          <div className="ml-auto flex gap-3 text-[10px]">
            <Link href="/seller/listings" className="rounded-full border px-3 py-1">
              ← Back to Listings
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link
          href="/seller/listings"
          className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 transition hover:text-neutral-900"
        >
          <ArrowLeft className="size-3" />
          My Listings
        </Link>

        <h1 className="mt-2 text-2xl font-black tracking-tight">Edit Listing</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Update the price, description and real-world dimensions. The product name is locked.
        </p>

        {productQuery.isLoading && (
          <div className="mt-8 h-72 animate-pulse rounded-2xl bg-neutral-200" />
        )}

        {productQuery.isError && (
          <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
            Unable to load this listing.
          </div>
        )}

        {product && <ProductForm product={product} productId={productId} />}
      </div>
    </main>
  );
}