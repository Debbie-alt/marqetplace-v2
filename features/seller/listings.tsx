"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Package, Trash2, Pencil, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Brand } from "@/components/ui";
/* eslint-disable @next/next/no-img-element */
import {
  deleteProduct,
  getMyProducts,
} from "@/lib/api/products";
import { getSessionUser } from "@/lib/auth/token";
import type { Product, ProductStatus } from "@/lib/domain/product";

const STATUS_STYLES: Record<ProductStatus, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-neutral-100 text-neutral-600" },
  PENDING_3D: { label: "3D in progress", className: "bg-amber-100 text-amber-700" },
  NEEDS_REVIEW: { label: "Needs review", className: "bg-orange-100 text-orange-700" },
  ACTIVE: { label: "Live", className: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-700" },
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);
}

function StatusBadge({ status }: { status?: ProductStatus }) {
  const style = STATUS_STYLES[status ?? "DRAFT"];
  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${style.className}`}>
      {style.label}
    </span>
  );
}

function ModelBadge({ product }: { product: Product }) {
  if (product.modelUrl) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-bold text-sky-700">
        · 3D ready
      </span>
    );
  }
  const text =
    product.model3dStatus === "PROCESSING" || product.model3dStatus === "PENDING"
      ? "Generating 3D…"
      : product.model3dStatus === "FAILED"
        ? "3D failed — retry"
        : "No 3D model yet";
  const className =
    product.model3dStatus === "FAILED"
      ? "bg-red-100 text-red-700"
      : "bg-neutral-100 text-neutral-500";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${className}`}>
      {text}
    </span>
  );
}

function RowActions({
  product,
  onDelete,
  deleting,
}: {
  product: Product;
  onDelete: () => void;
  deleting: boolean;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex items-center gap-2">
      {product.productStatus === "ACTIVE" && (
        <Link
          href={`/products/${product.id}`}
          className="flex items-center gap-1 rounded-full bg-black px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-neutral-800"
        >
          <ExternalLink className="size-3" />
          View
        </Link>
      )}

      <Link
        href={`/seller/listings/${product.id}/edit`}
        className="flex items-center gap-1 rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 transition hover:border-neutral-500"
      >
        <Pencil className="size-3" />
        Edit
      </Link>

      {confirming ? (
        <span className="flex items-center gap-1.5 rounded-full bg-red-50 py-1 pl-2 pr-1">
          <span className="text-[10px] font-bold text-red-600">Delete?</span>
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? "…" : "Yes"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded-full px-2 py-1 text-[10px] font-bold text-neutral-500 transition hover:text-neutral-800"
          >
            No
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="flex items-center gap-1 rounded-full border border-red-100 px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:border-red-400 hover:bg-red-50"
        >
          <Trash2 className="size-3" />
          Delete
        </button>
      )}
    </div>
  );
}

function ProductRow({
  product,
  onDelete,
  deleting,
}: {
  product: Product;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-300 hover:shadow-sm sm:flex-row sm:items-center">
      <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-50">
        {product.images[0] ? (
          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <Package className="size-6 text-neutral-300" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold text-neutral-900">{product.name}</div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
          <b className="text-sm font-black text-neutral-900">{formatPrice(product.price)}</b>
          <span className="text-neutral-300">·</span>
          <StatusBadge status={product.productStatus} />
          <ModelBadge product={product} />
        </div>
      </div>

      <RowActions product={product} onDelete={onDelete} deleting={deleting} />
    </div>
  );
}

export function SellerListings() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page] = useState(1);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["my-products", page],
    queryFn: () => getMyProducts(page),
  });

  useEffect(() => {
    if (!getSessionUser()) {
      router.replace("/login?next=/seller/listings");
    }
  }, [router]);

  const deleteMutation = useMutation({
    mutationFn: (productId: string) => deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-products"] });
    },
  });

  const products = data?.products ?? [];

  return (
    <main className="min-h-screen bg-neutral-100">
      <header className="border-b bg-white px-6 py-3">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <Brand />

          <span className="text-[10px] text-neutral-500">
            Seller Dashboard → My Listings
          </span>

          <div className="ml-auto flex gap-3 text-[10px]">
            <Link href="/seller/orders" className="rounded-full border px-3 py-1">
              Orders
            </Link>
            <Link href="/" className="rounded-full border px-3 py-1">
              ← Exit
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight">My Listings</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Manage your products, upload missing images and track the 3D review pipeline.
            </p>
          </div>

          <Link
            href="/seller/listings/new"
            className="flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-black text-neutral-950 transition hover:bg-amber-400"
          >
            <Plus className="size-4" />
            New Listing
          </Link>
        </div>

        <div className="mt-8">
          {isLoading && (
            <div className="grid gap-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-2xl bg-neutral-200" />
              ))}
            </div>
          )}

          {isError && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
              Unable to load your listings — {error instanceof Error ? error.message : "please try again."}
            </div>
          )}

          {!isLoading && !isError && products.length === 0 && (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-12 text-center">
              <Package className="mx-auto size-10 text-neutral-300" />
              <h2 className="mt-4 text-lg font-black">No listings yet</h2>
              <p className="mt-1 text-sm text-neutral-500">
                List your first product — upload 6 photos and we&apos;ll generate the 3D model for you.
              </p>
              <Link
                href="/seller/listings/new"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-sm font-black text-neutral-950 transition hover:bg-amber-400"
              >
                <Plus className="size-4" />
                Create your first listing
              </Link>
            </div>
          )}

          {!isLoading && !isError && products.length > 0 && (
            <div className="space-y-3">
              {products.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onDelete={() => deleteMutation.mutate(product.id)}
                  deleting={deleteMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}