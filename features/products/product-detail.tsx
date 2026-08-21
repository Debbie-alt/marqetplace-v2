"use client";

import Link from "next/link";
/* eslint-disable @next/next/no-img-element */

import { ChevronLeft, ChevronRight, Heart, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { CartButton, naira, StarRating } from "@/components/ui";
import { ProductViewer } from "@/components/three-d/ProductViewer";
import { getProductById } from "@/lib/api/products";
import { NafdacVerification } from "@/components/verification/nafdac-verification";
import type { Product } from "@/lib/domain/product";

function ProductInfo({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  return (
    <section>
      <div className="flex gap-2">
        {product.isNafdacVerifiable && (
          <span className="border border-emerald-500 px-3 py-1 text-[9px] font-black text-emerald-500">
            ✓ NAFDAC VERIFIED
          </span>
        )}

        <span className="border border-neutral-500 px-3 py-1 text-[9px] font-black uppercase">
          {product.category}
        </span>
      </div>

      <h1 className="mt-5 max-w-sm text-3xl font-black uppercase leading-none">
        {product.name}
      </h1>

      <div className="mt-4 flex items-center gap-2 text-xs text-neutral-500">
        <StarRating />
        <span>214 reviews</span>
        <span>•</span>
        <span>Marqetplace Official Store</span>
      </div>

      <p className="mt-4 text-4xl font-black">{naira(product.price)}</p>

      <span className="mt-2 inline-block rounded border border-red-900 bg-red-950/20 px-3 py-1 text-[10px] font-bold text-red-500">
        15% OFF – LIMITED OFFER
      </span>

      <hr className="my-6" />

      {product.size && (
        <p className="mt-6 text-sm text-neutral-600">
          Size: {product.size}
        </p>
      )}

      <div className="mt-5 flex items-center gap-3">
        <span className="text-[10px] font-black text-neutral-500">QTY</span>

        <div className="flex border">
          <button
            disabled={qty === 1}
            onClick={() => setQty(qty - 1)}
            className="p-2"
          >
            <Minus className="size-3" />
          </button>

          <span className="min-w-8 p-2 text-center text-sm">{qty}</span>

          <button
            onClick={() => setQty(qty + 1)}
            className="p-2"
          >
            <Plus className="size-3" />
          </button>
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <CartButton className="flex-1">ADD TO CART</CartButton>

        <button className="border px-4">
          <Heart className="size-5" />
        </button>
      </div>

      <Link
        href={`/checkout/${product.id}`}
        className="mt-3 block rounded bg-neutral-100 py-4 text-center text-sm font-black"
      >
        BUY NOW
      </Link>
    </section>
  );
}

function Gallery({ product }: { product: Product }) {
  return (
    <section>
      <div className="aspect-square bg-neutral-100">
        <img
          src={product.images[0] ?? "/window.svg"}
          alt={product.name}
          className="size-full object-cover"
        />
      </div>

      <div className="mt-3 flex justify-center gap-12">
        <ChevronLeft />
        <ChevronRight />
      </div>
    </section>
  );
}
function ViewerCard({ product }: { product: Product }) {
  if (product.modelStatus === "generating" || product.modelStatus === "queued") {
    return (
      <section className="mx-auto mt-12 max-w-xl rounded-xl bg-neutral-900 p-4 text-white">
        <span className="rounded border border-sky-300 px-2 py-1 text-[9px] font-bold text-sky-200">
          ● 3D GENERATING
        </span>

        <div className="mt-4 aspect-video rounded bg-neutral-800">
          <div className="flex h-full flex-col items-center justify-center">
            <div className="text-sm font-bold">
              Generating 3D model...
            </div>

            <div className="mt-3 h-2 w-48 overflow-hidden rounded-full bg-neutral-700">
              <div
                className="h-full bg-sky-300 transition-all"
                style={{
                  width: `${product.modelProgress}%`,
                }}
              />
            </div>

            <p className="mt-2 text-xs text-neutral-400">
              {product.modelProgress}% complete
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (product.modelStatus === "failed") {
    return (
      <section className="mx-auto mt-12 max-w-xl rounded-xl bg-neutral-900 p-6 text-center text-white">
        <p className="text-sm font-bold">
          3D model generation failed.
        </p>
      </section>
    );
  }

  if (product.modelStatus !== "ready" || !product.modelUrl) {
    return null;
  }

  return (
    <section className="mx-auto mt-12 max-w-xl rounded-xl bg-neutral-900 p-4 text-white">
      <span className="rounded border border-sky-300 px-2 py-1 text-[9px] font-bold text-sky-200">
        ● 3D LIVE
      </span>

      <div className="mt-4 overflow-hidden rounded bg-neutral-800">
        <ProductViewer
          modelUrl={product.modelUrl}
          productName={product.name}
          className="!aspect-video !rounded-none"
        />
      </div>

      <p className="my-3 text-center text-[8px] text-neutral-400">
        DRAG TO ROTATE · SCROLL TO ZOOM · PINCH ON MOBILE
      </p>
    </section>
  );
}

function Description({ product }: { product: Product }) {
  const [tab, setTab] = useState("description");

  return (
    <section className="mt-12 border border-neutral-300 bg-white">
      <div className="flex gap-8 border-b px-8">
        <button
          onClick={() => setTab("description")}
          className={`border-b-2 py-5 text-xs font-black uppercase ${
            tab === "description"
              ? "border-sky-300 text-sky-700"
              : "border-transparent"
          }`}
        >
          Description
        </button>

        <button
          onClick={() => setTab("reviews")}
          className="py-5 text-xs font-black uppercase"
        >
          Reviews (214)
        </button>
      </div>

      <div className="p-8 text-sm leading-7 text-neutral-700">
        {tab === "description" ? (
          <>
            <p>{product.description}</p>

            <p className="mt-4">
              Each product is listed by a verified seller and reviewed for
              clear, reliable marketplace information.
            </p>

            <p className="mt-4 font-semibold">Dosage:</p>

            <p>
              Follow the product label and professional guidance before use.
            </p>
          </>
        ) : (
          <p>Reviews will appear here when available.</p>
        )}
      </div>

      <div className="border-t p-8">
        <div className="mb-6 flex justify-between">
          <h2 className="text-2xl font-black uppercase">
            More products from store
          </h2>

          <Link href="/" className="text-xs font-black">
            VIEW ALL →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-px bg-neutral-400 sm:grid-cols-4">
          {["Vitamin C", "Chloroquine", "Amoxicillin", "Ibuprofen"].map(
            (x, i) => (
              <Link
                href="/"
                key={x}
                className="bg-neutral-900 p-5 text-white"
              >
                <div className="grid aspect-video place-items-center bg-neutral-800 text-3xl">
                  {["💉", "🩺", "💊", "🧪"][i]}
                </div>

                <p className="mt-3 text-xs font-bold">{x}</p>

                <p className="mt-1 text-lg font-black text-sky-200">
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

export function ProductDetail({ id }: { id: string }) {
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
  });

  if (isLoading) {
    return (
      <>
        <Header />
        <p className="p-10">Loading product…</p>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <p className="p-10">Product not found.</p>
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="bg-neutral-100 px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-2">
            <Gallery product={product} />

            <ProductInfo product={product} />
          </div>

          {product.isNafdacVerifiable && <NafdacVerification />}

          <ViewerCard product={product} />

          <Description product={product} />
        </div>
      </main>
    </>
  );
}