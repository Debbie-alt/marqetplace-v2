"use client";

import Link from "next/link";
 

import { ChevronLeft, ChevronRight, Heart, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { CartButton, naira, StarRating } from "@/components/ui";
import { ProductViewer } from "@/components/three-d/ProductViewer";
import { getProductById } from "@/lib/api/products";
import { NafdacVerification } from "@/components/verification/nafdac-verification";
import type { Product } from "@/lib/domain/product";



/* eslint-disable @next/next/no-img-element */


function ProductInfo({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);

  return (
    <section className="flex flex-col">
      <div className="flex flex-wrap items-center gap-2">
        {product.isNafdacVerifiable && product.nafdacVerified && (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-600/40 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-500">
            <span className="text-sm leading-none">✓</span> NAFDAC Verified
          </span>
        )}

        {product.isNafdacVerifiable && !product.nafdacVerified && (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-600/40 bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-amber-500">
            NAFDAC Verifiable
          </span>
        )}

        <span className="inline-flex items-center rounded-full border border-neutral-400/60 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wide text-neutral-700">
          {product.category || "Uncategorized"}
        </span>
      </div>

      <h1 className="mt-4 text-balance text-3xl font-black uppercase leading-[0.95] sm:text-4xl">
        {product.name}
      </h1>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-neutral-600">
        <StarRating />
        <span>214 reviews</span>
        <span className="text-neutral-400">•</span>
        <span>Marqetplace Official Store</span>
      </div>

      <div className="mt-6 flex items-end justify-between gap-4">
        <p className="text-4xl font-black tracking-tight sm:text-5xl">
          {naira(product.price)}
        </p>

        <span className="inline-flex rounded-full border border-red-900/60 bg-red-950/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-red-500">
          15% OFF – Limited Offer
        </span>
      </div>

      <hr className="my-6 border-neutral-300" />

      {product.size && (
        <div className="text-sm text-neutral-700">
          <span className="font-semibold">Size:</span> {product.size}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
          Qty
        </span>

        <div className="flex items-center overflow-hidden rounded-lg border border-neutral-300 bg-white shadow-sm">
          <button
            disabled={qty === 1}
            onClick={() => setQty(qty - 1)}
            className="grid h-9 w-9 place-items-center transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            <Minus className="size-3.5" />
          </button>

          <span className="min-w-10 px-2 py-2 text-center text-sm font-semibold tabular-nums">
            {qty}
          </span>

          <button
            onClick={() => setQty(qty + 1)}
            className="grid h-9 w-9 place-items-center transition hover:bg-neutral-50"
            aria-label="Increase quantity"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <CartButton className="flex-1">Add to Cart</CartButton>

        <button
          className="flex items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold transition hover:bg-neutral-50 active:scale-[0.995]"
          aria-label="Add to wishlist"
        >
          <Heart className="size-4" />
          <span>Wishlist</span>
        </button>
      </div>

      <Link
        href={`/checkout/${product.id}`}
        className="mt-3 block rounded-lg bg-neutral-900 py-4 text-center text-sm font-black uppercase tracking-wide text-white shadow-sm transition hover:bg-neutral-800 active:scale-[0.995]"
      >
        Buy Now
      </Link>

      <p className="mt-4 text-xs leading-relaxed text-neutral-600">
        Listed by a verified seller. Product information is reviewed for clarity
        and accuracy.
      </p>
    </section>
  );
}

function Gallery({ product }: { product: Product }) {
  const images = product.images?.length ? product.images : ["/window.svg"];
  const [active, setActive] = useState(0);

  return (
    <section className="flex flex-col">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-neutral-300 bg-white shadow-sm">
        <img
          src={images[active] ?? "/window.svg"}
          alt={product.name}
          className="size-full object-contain p-4 sm:p-6"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={() =>
                setActive((i) => (i === 0 ? images.length - 1 : i - 1))
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-neutral-300 bg-white/90 p-2 shadow-sm transition hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft className="size-4" />
            </button>

            <button
              onClick={() =>
                setActive((i) => (i === images.length - 1 ? 0 : i + 1))
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-neutral-300 bg-white/90 p-2 shadow-sm transition hover:bg-white"
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
              className={`size-14 overflow-hidden rounded-lg border transition ${
                idx === active
                  ? "border-neutral-900 ring-2 ring-neutral-900/10"
                  : "border-neutral-300 hover:border-neutral-400"
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
      <section className="mx-auto mt-12 w-full max-w-3xl overflow-hidden rounded-2xl border border-neutral-300 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-300 px-5 py-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-neutral-800">
            <span className="inline-block size-2 animate-pulse rounded-full bg-sky-400" />
            3D Generating
          </div>

          <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
            {product.modelProgress}% complete
          </span>
        </div>

        <div className="aspect-video bg-neutral-50">
          <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
            <p className="text-sm font-semibold text-neutral-800">
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
      <section className="mx-auto mt-12 w-full max-w-3xl overflow-hidden rounded-2xl border border-red-300 bg-white shadow-sm">
        <div className="border-b border-red-300 px-5 py-3 text-xs font-black uppercase tracking-wide text-red-700">
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
    <section className="mx-auto mt-12 w-full max-w-3xl overflow-hidden rounded-2xl border border-neutral-300 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-neutral-300 px-5 py-3">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-neutral-800">
          <span className="inline-block size-2 rounded-full bg-sky-400" />
          Interactive 3D
        </div>

        <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
          Drag • Scroll • Pinch
        </span>
      </div>

      <div className="overflow-hidden bg-neutral-50">
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
  const [tab, setTab] = useState<"description" | "reviews">("description");

  return (
    <section className="mt-12 overflow-hidden rounded-2xl border border-neutral-300 bg-white shadow-sm">
      <div className="flex gap-8 border-b border-neutral-300 px-6 sm:px-8">
        <button
          onClick={() => setTab("description")}
          className={`relative border-b-2 py-5 text-xs font-black uppercase tracking-wide transition ${
            tab === "description"
              ? "border-sky-400 text-neutral-900"
              : "border-transparent text-neutral-500 hover:text-neutral-700"
          }`}
        >
          Description
        </button>

        <button
          onClick={() => setTab("reviews")}
          className={`relative border-b-2 py-5 text-xs font-black uppercase tracking-wide transition ${
            tab === "reviews"
              ? "border-sky-400 text-neutral-900"
              : "border-transparent text-neutral-500 hover:text-neutral-700"
          }`}
        >
          Reviews (214)
        </button>
      </div>

      <div className="px-6 py-6 text-sm leading-7 text-neutral-700 sm:px-8 sm:py-8">
        {tab === "description" ? (
          <div className="space-y-4">
            <p className="whitespace-pre-line text-pretty">{product.description}</p>

            <p>
              Each product is listed by a verified seller and reviewed for clear,
              reliable marketplace information.
            </p>

            <div>
              <p className="font-semibold text-neutral-900">Dosage</p>

              <p>
                Follow the product label and consult a qualified professional
                before use where applicable.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-neutral-600">Reviews will appear here when available.</p>
        )}
      </div>

      <div className="border-t border-neutral-300 px-6 py-6 sm:px-8 sm:py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-balance text-2xl font-black uppercase tracking-tight sm:text-3xl">
            More products from store
          </h2>

          <Link
            href="/"
            className="text-xs font-black uppercase tracking-wide text-neutral-700 transition hover:text-neutral-900"
          >
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-1 overflow-hidden rounded-xl border border-neutral-300 bg-neutral-300 sm:grid-cols-4">
          {["Vitamin C", "Chloroquine", "Amoxicillin", "Ibuprofen"].map(
            (x, i) => (
              <Link
                href="/"
                key={x}
                className="group bg-white p-4 transition hover:bg-neutral-50 sm:p-5"
              >
                <div className="grid aspect-video place-items-center rounded-lg bg-neutral-50 text-3xl shadow-inner ring-1 ring-inset ring-neutral-200">
                  {["💉", "🩺", "💊", "🧪"][i]}
                </div>

                <p className="mt-3 line-clamp-1 text-xs font-semibold text-neutral-900">
                  {x}
                </p>

                <p className="mt-1 text-lg font-black text-sky-700">
                  {naira([850, 1200, 2800, 3600][i])}
                </p>
              </Link>
            ),
          )}
        </div>
      </div>
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
    <section className="mt-10 overflow-hidden rounded-2xl border border-neutral-300 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-300 px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-xs font-black uppercase tracking-wide text-neutral-900">
            NAFDAC Registration Details
          </h2>

          <p className="mt-1 text-xs text-neutral-600">
            Pulled from the official NAFDAC Greenbook registry.
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${
            verified
              ? "border border-emerald-600/40 bg-emerald-500/10 text-emerald-600"
              : "border border-amber-600/40 bg-amber-500/10 text-amber-600"
          }`}
        >
          {verified ? "✓ Verified" : "Not Verified"}
        </span>
      </div>

      <div className="px-5 py-2 sm:px-6">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-1 gap-1 border-b border-neutral-200 py-3 last:border-0 sm:grid-cols-[0.9fr_1.1fr] sm:gap-4 sm:items-center"
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
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
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
  });

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="bg-neutral-50 px-4 py-10">
          <div className="mx-auto max-w-6xl">
            <div className="h-8 w-48 animate-pulse rounded bg-neutral-200" />
            <div className="mt-6 grid gap-10 md:grid-cols-2">
              <div className="aspect-square animate-pulse rounded-2xl bg-neutral-200" />
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
          <div className="mx-auto max-w-xl text-center">
            <h1 className="text-2xl font-black uppercase tracking-tight">
              Product Not Found
            </h1>
            <p className="mt-2 text-sm text-neutral-600">
              This product may have been removed or is no longer available.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-neutral-900 px-6 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-neutral-800"
            >
              Back to Home
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-neutral-50 px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-2">
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