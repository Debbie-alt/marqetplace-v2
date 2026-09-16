"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle, Minus, Plus } from "lucide-react";
import { Brand, FieldLabel, PrimaryButton } from "@/components/ui";
import { getProduct } from "@/lib/api/products";
import { placeOrder } from "@/lib/api/orders";
import { getSessionUser } from "@/lib/auth/token";

function naira(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

export function Checkout() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const productId = params.id;

  useEffect(() => {
    if (!getSessionUser()) {
      router.replace(`/login?next=/checkout/${productId}`);
    }
  }, [router, productId]);

  const productQuery = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId),
    enabled: Boolean(productId),
  });

  const [qty, setQty] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const placeMutation = useMutation({
    mutationFn: () =>
      placeOrder([{ productId, quantity: qty }]),
    onSuccess: (order) => {
      setOrderId(order._id);
      setOrderPlaced(true);
    },
  });

  const product = productQuery.data;
  const total = product ? product.price * qty : 0;

  if (orderPlaced && orderId) {
    return (
      <main className="grid min-h-screen place-items-center bg-neutral-100 p-6">
        <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100">
            <CheckCircle className="size-8 text-emerald-600" />
          </div>

          <h1 className="mt-5 text-2xl font-black">Order Placed</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Your order is now <b>PENDING</b>. The seller will process it shortly.
          </p>

          <div className="mt-6 rounded-xl bg-neutral-50 p-4 text-xs text-neutral-600">
            <span className="font-bold">Order ID:</span> {orderId.slice(-8).toUpperCase()}
          </div>

          <div className="mt-6 flex gap-3">
            <Link
              href="/seller/orders"
              className="flex flex-1 items-center justify-center rounded-full border border-neutral-300 px-5 py-3 text-xs font-bold text-neutral-700 transition hover:border-neutral-500"
            >
              My Orders
            </Link>

            <Link
              href="/storefront"
              className="flex flex-1 items-center justify-center rounded-full bg-amber-500 px-5 py-3 text-xs font-bold text-neutral-950 transition hover:bg-amber-400"
            >
              Keep Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-100">
      <header className="border-b bg-white px-6 py-3">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <Brand />
          <span className="text-[10px] text-neutral-500">Checkout</span>
          <div className="ml-auto flex gap-3 text-[10px]">
            <Link href={`/products/${productId}`} className="rounded-full border px-3 py-1">
              ← Back to Product
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link
          href={`/products/${productId}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 transition hover:text-neutral-900"
        >
          <ArrowLeft className="size-3" />
          Back to product
        </Link>

        <h1 className="mt-2 text-2xl font-black tracking-tight">Checkout</h1>

        {productQuery.isLoading && (
          <div className="mt-8 h-48 animate-pulse rounded-2xl bg-neutral-200" />
        )}

        {productQuery.isError && (
          <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
            Unable to load product details.
          </div>
        )}

        {product && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5">
              <div className="flex gap-4">
                <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-50">
                  {product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">📦</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold">{product.name}</div>
                  <div className="mt-1 text-xs text-neutral-500">
                    {product.category || "Product"}
                  </div>
                  <div className="mt-2 text-lg font-black text-neutral-900">
                    {naira(product.price)}
                  </div>
                </div>
              </div>

              <hr className="my-5" />

              <div>
                <FieldLabel>Quantity</FieldLabel>
                <div className="mt-2 inline-flex items-center gap-3 rounded-xl border border-neutral-200 p-1">
                  <button
                    type="button"
                    disabled={qty === 1}
                    onClick={() => setQty(qty - 1)}
                    className="grid size-9 place-items-center rounded-lg transition hover:bg-neutral-100 disabled:opacity-30"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="min-w-[2rem] text-center text-sm font-bold">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(qty + 1)}
                    className="grid size-9 place-items-center rounded-lg transition hover:bg-neutral-100"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 self-start">
              <h2 className="text-sm font-black">Order Summary</h2>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Item</span>
                  <span className="font-semibold">{product.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Unit price</span>
                  <span className="font-semibold">{naira(product.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Quantity</span>
                  <span className="font-semibold">{qty}</span>
                </div>
                <hr className="!my-3" />
                <div className="flex justify-between">
                  <span className="font-black">Total</span>
                  <span className="text-lg font-black text-neutral-900">{naira(total)}</span>
                </div>
              </div>

              {placeMutation.error && (
                <div className="mt-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-xs text-red-600">
                  {placeMutation.error instanceof Error
                    ? placeMutation.error.message
                    : "Failed to place order."}
                </div>
              )}

              <PrimaryButton
                onClick={() => placeMutation.mutate()}
                disabled={placeMutation.isPending}
                className="mt-5 w-full"
              >
                {placeMutation.isPending ? "Placing order…" : `Pay ${naira(total)}`}
              </PrimaryButton>

              <p className="mt-3 text-center text-[10px] text-neutral-400">
                Server-computed pricing — you pay the current listed price.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}