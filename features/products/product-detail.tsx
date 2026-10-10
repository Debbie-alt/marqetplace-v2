"use client";

import Link from "next/link";
 

import { Box, ChevronLeft, ChevronRight, Heart, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { useMarketplace } from "@/components/marketplace-provider";
import { CartButton, naira } from "@/components/ui";
import { ProductViewer } from "@/components/three-d/ProductViewer";
import { getProductById } from "@/lib/api/products";
import { NafdacVerification } from "@/components/verification/nafdac-verification";
import type { Product } from "@/lib/domain/product";



/* eslint-disable @next/next/no-img-element */


function ProductInfo({ product }: { product: Product }) {
  const { addToCart, wishlist, toggleWishlist } = useMarketplace();
  const [added, setAdded] = useState(false);
  const wished = wishlist.has(product.id);

  return (
    <section className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7 lg:p-8">
      <div className="flex flex-wrap items-center gap-2">
        {product.isNafdacVerifiable && product.nafdacVerified && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800">
            <ShieldCheck className="size-3.5" /> NAFDAC verified
          </span>
        )}

        {product.isNafdacVerifiable && !product.nafdacVerified && (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800">
            NAFDAC Verifiable
          </span>
        )}

        <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-600">
          {product.category || "Uncategorized"}
        </span>
      </div>

      <h1 className="mt-5 text-balance text-3xl font-semibold leading-tight tracking-[-0.035em] text-neutral-950 sm:text-4xl">
        {product.name}
      </h1>

      <div className="mt-6 flex items-end justify-between gap-4">
        <p className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
          {naira(product.price)}
        </p>
      </div>

      <hr className="my-6 border-neutral-100" />

      {product.size && (
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <span className="font-medium text-neutral-900">Size</span> {product.size}
        </div>
      )}

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <CartButton className="h-12 flex-1 !rounded-xl !bg-violet-300 !py-3 !text-sm !font-semibold !text-neutral-950 hover:!bg-violet-200" onClick={() => { addToCart(product.id); setAdded(true); window.setTimeout(() => setAdded(false), 900); }}>
          {added ? "Added to bag" : "Add to bag"}
        </CartButton>
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          className={`flex h-12 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition active:scale-[.98] ${wished ? "border-rose-200 bg-rose-50 text-rose-600" : "border-neutral-200 bg-white text-neutral-700 hover:border-violet-200 hover:bg-violet-50/40"}`}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className="size-4" fill={wished ? "currentColor" : "none"} />
          <span>Wishlist</span>
        </button>
      </div>

      <Link
        href={`/checkout/${product.id}`}
        className="mt-3 block rounded-xl border border-neutral-200 bg-white py-3.5 text-center text-sm font-semibold text-neutral-800 transition hover:border-neutral-300 hover:bg-neutral-50"
      >
        Buy Now
      </Link>

      <p className="mt-4 text-xs leading-relaxed text-neutral-600">
        Product details and imagery are provided by the seller. Use the NAFDAC
        verification details below for eligible products.
      </p>
    </section>
  );
}

function Gallery({ product }: { product: Product }) {
  const images = product.images ?? [];
  const [active, setActive] = useState(0);

  return (
    <section className="flex flex-col">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-neutral-200 bg-[#f5f4f8]">
        {images.length > 0 ? (
          <img src={images[active]} alt={product.name} className="size-full object-contain p-4 sm:p-6" />
        ) : (
          <div className="grid size-full place-items-center text-neutral-300"><div className="flex flex-col items-center gap-3"><Box className="size-12" strokeWidth={1.2} /><span className="text-xs text-neutral-400">No product images</span></div></div>
        )}

        {images.length > 1 && (
          <>
            <button
              onClick={() =>
                setActive((i) => (i === 0 ? images.length - 1 : i - 1))
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-neutral-200 bg-white/95 p-2.5 shadow-sm transition hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft className="size-4" />
            </button>

            <button
              onClick={() =>
                setActive((i) => (i === images.length - 1 ? 0 : i + 1))
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-neutral-200 bg-white/95 p-2.5 shadow-sm transition hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {images.map((src, idx) => (
            <button
              key={idx}
              onClick={() => setActive(idx)}
              className={`size-16 overflow-hidden rounded-xl border bg-white transition ${
                idx === active
                  ? "border-violet-500 ring-2 ring-violet-500/15"
                  : "border-neutral-200 hover:border-neutral-400"
              }`}
              aria-label={`View image ${idx + 1}`}
            >
              <img
                src={src}
                alt={`${product.name} ${idx + 1}`}
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
function ViewerCard({ product }: { product: Product }) {
  if (product.modelStatus === "generating" || product.modelStatus === "queued") {
    return (
      <section className="mx-auto mt-8 w-full max-w-4xl overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 sm:px-7">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
            <span className="inline-block size-2 animate-pulse rounded-full bg-sky-400" />
            3D Generating
          </div>

          <span className="text-xs font-medium text-neutral-500">
            {product.modelProgress}% complete
          </span>
        </div>

        <div className="aspect-video bg-[#f6f5f9]">
          <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
            <p className="text-sm font-medium text-neutral-800">
              Generating interactive 3D model…
            </p>

            <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full bg-sky-400 transition-all duration-500"
                style={{ width: `${product.modelProgress}%` }}
              />
            </div>

            <p className="text-xs text-neutral-500">
              This usually takes a moment. You can refresh this page in a bit.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (product.modelStatus === "failed") {
    return (
      <section className="mt-8 w-full overflow-hidden rounded-2xl border border-red-200 bg-white">
        <div className="border-b border-red-100 px-5 py-4 text-sm font-semibold text-red-700 sm:px-7">
          3D Generation Failed
        </div>

        <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
          <p className="text-sm font-semibold text-neutral-800">
            We couldn&apos;t generate this 3D model.
          </p>

          <p className="text-xs text-neutral-600">
            Try refreshing, or check back later.
          </p>
        </div>
      </section>
    );
  }

  if (product.modelStatus !== "ready" || !product.modelUrl) {
    return null;
  }

  return (
    <section className="mx-auto mt-8 w-full max-w-4xl overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 sm:px-7">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
          <span className="inline-block size-2 rounded-full bg-sky-400" />
          Interactive 3D
        </div>

        <span className="text-xs font-medium text-neutral-500">
          Drag • Scroll • Pinch
        </span>
      </div>

      <div className="overflow-hidden bg-[#f6f5f9]">
        <ProductViewer
          modelUrl={product.modelUrl}
          productName={product.name}
          className="!aspect-video !rounded-none"
        />
      </div>
    </section>
  );
}

function Description({ product }: { product: Product }) {
  return (
    <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-8">
      <h2 className="text-lg font-semibold tracking-tight text-neutral-950">About this product</h2>
      <p className="mt-4 whitespace-pre-line text-sm leading-7 text-neutral-600">
        {product.description || "The seller has not added a product description yet."}
      </p>
    </section>
  );
}

function NafdacDetailsCard({ product }: { product: Product }) {
  const rows: Array<[string, string]> = [
    ["NAFDAC Registration Number", product.nafdacNumber ?? ""],
    ["Registered Product Name", product.name],
    ["Manufacturer / Applicant", product.manufacturer ?? ""],
    ["Expiry Date", product.expiryDate ? String(product.expiryDate).slice(0, 10) : ""],
  ];

  const verified = Boolean(product.nafdacVerified);

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-5 py-5 sm:px-7">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">
            NAFDAC Registration Details
          </h2>

          <p className="mt-1 text-xs text-neutral-600">
            Registration information provided for this listing.
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${
            verified
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border border-amber-200 bg-amber-50 text-amber-700"
          }`}
        >
          {verified ? "✓ Verified" : "Not Verified"}
        </span>
      </div>

      <div className="px-5 py-2 sm:px-7">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-1 gap-1 border-b border-neutral-100 py-4 last:border-0 sm:grid-cols-[0.9fr_1.1fr] sm:items-center sm:gap-4"
          >
            <span className="text-xs font-medium text-neutral-500">
              {label}
            </span>

            <span className="text-sm font-semibold text-neutral-900 sm:text-right">
              {value || "Not provided"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ProductDetail({ id }: { id: string }) {
  const { data: product, isLoading, isError, refetch } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
  });

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[#faf9fc] px-4 py-10 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="h-8 w-48 animate-pulse rounded bg-neutral-200" />
            <div className="mt-6 grid gap-10 md:grid-cols-2">
              <div className="aspect-square animate-pulse rounded-2xl bg-neutral-100" />
              <div className="space-y-4">
                <div className="h-10 w-3/4 animate-pulse rounded bg-neutral-200" />
                <div className="h-6 w-1/2 animate-pulse rounded bg-neutral-200" />
                <div className="h-20 w-full animate-pulse rounded-xl bg-neutral-200" />
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <main className="bg-neutral-50 px-4 py-16">
          <div className="mx-auto max-w-xl rounded-2xl border border-neutral-200 bg-white px-6 py-14 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
              {isError ? "We couldn’t load this product" : "Product not found"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-neutral-500">
              {isError ? "Check your connection and try again." : "This product may have been removed or is no longer available."}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              {isError && <button type="button" onClick={() => void refetch()} className="rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-700">Try again</button>}
              <Link href="/storefront" className="rounded-full border border-neutral-200 px-5 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50">Back to storefront</Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#faf9fc] px-4 py-6 sm:px-6 sm:py-9 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-neutral-500">
            <Link href="/storefront" className="transition hover:text-violet-700">Storefront</Link>
            <span aria-hidden="true">/</span>
            <span className="max-w-[60vw] truncate text-neutral-800">{product.name}</span>
          </nav>
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,.95fr)] lg:gap-8">
            <Gallery product={product} />

            <ProductInfo product={product} />
          </div>

          {product.nafdacNumber && <NafdacDetailsCard product={product} />}

          {product.isNafdacVerifiable && (
            <NafdacVerification initialNumber={product.nafdacNumber} />
          )}

          <ViewerCard product={product} />

          <Description product={product} />
        </div>
      </main>
    </>
  );
}
