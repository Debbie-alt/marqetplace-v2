"use client";

import { request } from "./client";
import type { OrderStatus } from "@/lib/domain/product";

export interface OrderItem {
  product: {
    _id: string;
    productName: string;
    images: string[];
    model3dUrl: string | null;
    model3dStatus: string;
    status: string;
  } | null;
  vendor: string;
  productName: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  _id: string;
  buyer: {
    _id: string;
    fullName: string;
    email: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

interface BackendOrderResult {
  data: Order[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/** POST /orders — place a new order. Server computes prices. */
export function placeOrder(
  items: { productId: string; quantity: number }[],
): Promise<Order> {
  return request<Order>("/orders", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}

/** GET /orders — list orders (purchases or sales). */
export async function getOrders(
  view: "purchases" | "sales" = "purchases",
  page = 1,
  status?: OrderStatus,
): Promise<{ orders: Order[]; pagination: BackendOrderResult["pagination"] }> {
  const params = new URLSearchParams();
  params.set("view", view);
  params.set("page", String(page));
  if (status) params.set("status", status);

  const query = params.toString();
  const result = await request<BackendOrderResult>(
    `/orders${query ? `?${query}` : ""}`,
  );
  return { orders: result.data, pagination: result.pagination };
}

/** GET /orders/:id — single order detail. */
export function getOrder(orderId: string): Promise<Order> {
  return request<Order>(`/orders/${orderId}`);
}

/** PATCH /orders/:id/status — update order status (seller or admin). */
export function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<Order> {
  return request<Order>(`/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
