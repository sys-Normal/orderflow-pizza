"use client";

import { useSyncExternalStore, useMemo } from "react";
import { createLocalStore } from "@/lib/create-local-store";
import type { Order, OrderStatus } from "@/lib/orders/types";

const store = createLocalStore<Order[]>("orderflow_orders", []);

export function useOrders(): Order[] {
  const orders = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );
  return useMemo(
    () => [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [orders]
  );
}

export function useOrder(id: string): Order | undefined {
  const orders = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );
  return useMemo(() => orders.find((order) => order.id === id), [orders, id]);
}

export function addOrder(
  input: Omit<Order, "id" | "createdAt" | "status">
): Order {
  const order: Order = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "received",
  };
  store.write([...store.read(), order]);
  return order;
}

export function updateOrderStatus(id: string, status: OrderStatus): void {
  const orders = store.read().map((order) =>
    order.id === id ? { ...order, status } : order
  );
  store.write(orders);
}
