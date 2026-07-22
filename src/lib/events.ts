import { EventEmitter } from "node:events";
import type { OrderStatus } from "@/lib/orders/types";

export type OrderStatusEvent = {
  status: OrderStatus;
  changedAt: string;
};

// Cached on globalThis for the same reason as src/lib/db.ts's PrismaClient:
// Next.js dev mode reloads modules on every request, and a fresh
// EventEmitter per reload would silently drop subscribers. This only works
// within a single Node process — see docs/backlog.md for why that's fine
// for this project's deployment shape (and what changes if it isn't).
const globalForEvents = globalThis as unknown as { orderEvents?: EventEmitter };

export const orderEvents = globalForEvents.orderEvents ?? new EventEmitter();
// Unbounded: one listener per open SSE connection, not per "kind" of event.
orderEvents.setMaxListeners(0);

if (process.env.NODE_ENV !== "production") {
  globalForEvents.orderEvents = orderEvents;
}

function channelFor(orderId: string): string {
  return `order:${orderId}`;
}

export function emitOrderStatusEvent(orderId: string, event: OrderStatusEvent): void {
  orderEvents.emit(channelFor(orderId), event);
}

export function subscribeToOrder(
  orderId: string,
  listener: (event: OrderStatusEvent) => void
): () => void {
  const channel = channelFor(orderId);
  orderEvents.on(channel, listener);
  return () => orderEvents.off(channel, listener);
}
