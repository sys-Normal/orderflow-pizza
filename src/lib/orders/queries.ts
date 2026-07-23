import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type { SessionPayload } from "@/lib/auth/session";
import type { Order, OrderItem, OrderStatusHistoryEntry } from "@/lib/orders/types";

export const orderInclude = { items: true } satisfies Prisma.OrderInclude;

type OrderRow = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

export function toOrder(row: OrderRow): Order {
  return {
    id: row.id,
    storeId: row.storeId,
    status: row.status,
    subtotal: row.subtotal,
    createdAt: row.createdAt.toISOString(),
    customer: {
      name: row.customerName,
      phone: row.customerPhone,
      address: row.customerAddress,
      notes: row.customerNotes ?? undefined,
    },
    items: row.items.map(
      (item): OrderItem => ({
        pizzaId: item.menuItemId,
        name: item.name,
        size: item.size,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
      })
    ),
  };
}

export async function getOrders(): Promise<Order[]> {
  const rows = await prisma.order.findMany({
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toOrder);
}

export async function getOrder(id: string): Promise<Order | undefined> {
  const row = await prisma.order.findUnique({
    where: { id },
    include: orderInclude,
  });
  return row ? toOrder(row) : undefined;
}

// Sellers only see orders for stores they own; platform admins see everything.
export async function getOrdersForSession(session: SessionPayload): Promise<Order[]> {
  if (session.role === "platform_admin") {
    return getOrders();
  }
  const rows = await prisma.order.findMany({
    where: { store: { ownerId: session.userId } },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toOrder);
}

export async function getOrderForSession(
  id: string,
  session: SessionPayload
): Promise<Order | undefined> {
  if (session.role === "platform_admin") {
    return getOrder(id);
  }
  const row = await prisma.order.findFirst({
    where: { id, store: { ownerId: session.userId } },
    include: orderInclude,
  });
  return row ? toOrder(row) : undefined;
}

// Buyer's own order history (see /orders) — the only way back to an order
// once the buyer navigates away from its one-time /confirmation link. Also
// carries the store name, since a buyer can order from several stores and
// Order itself only has storeId.
export async function getOrdersForBuyer(
  buyerId: string
): Promise<(Order & { storeName: string })[]> {
  const rows = await prisma.order.findMany({
    where: { buyerId },
    include: { ...orderInclude, store: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((row) => ({ ...toOrder(row), storeName: row.store.name }));
}

// Powers the header's "order in progress" indicator (see site-header.tsx).
export async function hasActiveOrder(buyerId: string): Promise<boolean> {
  const count = await prisma.order.count({
    where: { buyerId, status: { notIn: ["completed", "cancelled"] } },
  });
  return count > 0;
}

// Platform-admin drill-down: a single store's orders (not scoped to a
// logged-in owner, since the admin is browsing someone else's store).
export async function getOrdersForStore(storeId: string): Promise<Order[]> {
  const rows = await prisma.order.findMany({
    where: { storeId },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toOrder);
}

export async function getOrderStatusHistory(
  orderId: string
): Promise<OrderStatusHistoryEntry[]> {
  const rows = await prisma.orderStatusHistory.findMany({
    where: { orderId },
    orderBy: { changedAt: "asc" },
  });
  return rows.map((row) => ({
    status: row.status,
    changedAt: row.changedAt.toISOString(),
  }));
}

// Platform-admin cross-store lookup for the rare "find this one order"
// case — not meant for routine browsing (see getOrdersForStore for that).
export async function searchOrders(query: string): Promise<Order[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const rows = await prisma.order.findMany({
    where: {
      OR: [
        { id: { contains: trimmed } },
        { customerPhone: { contains: trimmed } },
        { customerName: { contains: trimmed } },
      ],
    },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return rows.map(toOrder);
}
