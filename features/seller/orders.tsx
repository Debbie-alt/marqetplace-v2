"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Package, Clock, Truck, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Brand } from "@/components/ui";
/* eslint-disable @next/next/no-img-element */
import { getOrders, updateOrderStatus } from "@/lib/api/orders";
import { getSessionUser } from "@/lib/auth/token";
import type { Order, OrderItem } from "@/lib/api/orders";
import type { OrderStatus } from "@/lib/domain/product";

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: typeof Package; className: string }> = {
  PENDING: { label: "Pending", icon: Clock, className: "bg-amber-100 text-amber-700" },
  PROCESSING: { label: "Processing", icon: Package, className: "bg-blue-100 text-blue-700" },
  SHIPPED: { label: "Shipped", icon: Truck, className: "bg-sky-100 text-sky-700" },
  DELIVERED: { label: "Delivered", icon: CheckCircle, className: "bg-emerald-100 text-emerald-700" },
  CANCELLED: { label: "Cancelled", icon: XCircle, className: "bg-red-100 text-red-700" },
};

function naira(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${config.className}`}>
      <Icon className="size-3" />
      {config.label}
    </span>
  );
}

function nextStatus(current: OrderStatus): OrderStatus | null {
  switch (current) {
    case "PENDING": return "PROCESSING";
    case "PROCESSING": return "SHIPPED";
    case "SHIPPED": return "DELIVERED";
    default: return null;
  }
}

function nextStatusLabel(current: OrderStatus): string {
  switch (current) {
    case "PENDING": return "Mark Processing";
    case "PROCESSING": return "Mark Shipped";
    case "SHIPPED": return "Mark Delivered";
    default: return "";
  }
}

function OrderCard({
  order,
  onAdvance,
  advancing,
}: {
  order: Order;
  onAdvance: () => void;
  advancing: boolean;
}) {
  const next = nextStatus(order.status);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-300 hover:shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] text-neutral-400">
            <span>Order</span>
            <span className="font-mono font-bold text-neutral-600">#{order._id.slice(-8).toUpperCase()}</span>
            <span>·</span>
            <span>{new Date(order.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>

          <div className="mt-1 text-xs text-neutral-500">
            Buyer: <span className="font-semibold text-neutral-700">{order.buyer.fullName}</span>
          </div>
        </div>

        <StatusBadge status={order.status} />
      </div>

      <div className="mt-4 space-y-3">
        {order.items.map((item: OrderItem, index: number) => (
          <div key={index} className="flex gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-50">
              {item.product?.images?.[0] ? (
                <img
                  src={item.product.images[0]}
                  alt={item.productName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Package className="size-5 text-neutral-300" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-bold text-neutral-900">{item.productName}</div>
              <div className="mt-0.5 text-[10px] text-neutral-500">
                {naira(item.unitPrice)} × {item.quantity} = <span className="font-bold text-neutral-700">{naira(item.unitPrice * item.quantity)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4">
        <div className="text-sm font-black text-neutral-900">
          Total: {naira(order.totalAmount)}
        </div>

        <div className="flex items-center gap-2">
          {next && (
            <button
              type="button"
              onClick={onAdvance}
              disabled={advancing}
              className="flex items-center gap-1 rounded-full bg-amber-500 px-4 py-2 text-xs font-black text-neutral-950 transition hover:bg-amber-400 disabled:opacity-50"
            >
              {advancing ? "…" : nextStatusLabel(order.status)}
              {!advancing && <ArrowRight className="size-3" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function SellerOrders() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page] = useState(1);

  useEffect(() => {
    if (!getSessionUser()) {
      router.replace("/login?next=/seller/orders");
    }
  }, [router]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["orders-sales", page],
    queryFn: () => getOrders("sales", page),
  });

  const advanceMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders-sales"] });
    },
  });

  const orders = data?.orders ?? [];

  return (
    <main className="min-h-screen bg-neutral-100">
      <header className="border-b bg-white px-6 py-3">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <Brand />
          <span className="text-[10px] text-neutral-500">
            Seller Dashboard → Orders
          </span>
          <div className="ml-auto flex gap-3 text-[10px]">
            <Link href="/seller/listings" className="rounded-full border px-3 py-1">
              My Listings
            </Link>
            <Link href="/" className="rounded-full border px-3 py-1">
              ← Exit
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-black tracking-tight">Incoming Orders</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Orders containing your products. Advance each order through the pipeline as you process it.
        </p>

        <div className="mt-4 flex gap-2 text-xs">
          {(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const).map((status) => (
            <span
              key={status}
              className={`rounded-full px-3 py-1.5 font-bold uppercase tracking-wide ${STATUS_CONFIG[status].className}`}
            >
              {STATUS_CONFIG[status].label}
            </span>
          ))}
        </div>

        <div className="mt-8">
          {isLoading && (
            <div className="grid gap-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="h-40 animate-pulse rounded-2xl bg-neutral-200" />
              ))}
            </div>
          )}

          {isError && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-600">
              Unable to load orders — {error instanceof Error ? error.message : "please try again."}
            </div>
          )}

          {!isLoading && !isError && orders.length === 0 && (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-12 text-center">
              <Package className="mx-auto size-10 text-neutral-300" />
              <h2 className="mt-4 text-lg font-black">No orders yet</h2>
              <p className="mt-1 text-sm text-neutral-500">
                When a buyer places an order for your products, it will appear here.
              </p>
            </div>
          )}

          {!isLoading && !isError && orders.length > 0 && (
            <div className="grid gap-4 lg:grid-cols-2">
              {orders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onAdvance={() => {
                    const next = nextStatus(order.status);
                    if (next) {
                      advanceMutation.mutate({ orderId: order._id, status: next });
                    }
                  }}
                  advancing={advanceMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}