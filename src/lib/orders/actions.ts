"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/current-user";
import { orderInclude, toOrder } from "@/lib/orders/queries";
import { emitOrderStatusEvent, emitStoreOrderEvent } from "@/lib/events";
import type { Order, OrderCustomer, OrderItem, OrderStatus } from "@/lib/orders/types";

const STORE_ORDERS_PAGE_SIZE = 10;

// Powers the store-list "주문 보기" modal (see store-orders-modal.tsx) — a
// Client Component can't call queries.ts directly (no "use server"), so this
// wraps the same paginated read as an invocable action.
export async function getStoreOrdersPage(
  storeId: string,
  page: number
): Promise<{ orders: Order[]; totalCount: number; page: number; pageSize: number }> {
  const session = await getSessionUser();
  if (!session || session.role !== "platform_admin") {
    throw new Error("플랫폼 관리자만 조회할 수 있습니다.");
  }

  const pageSize = STORE_ORDERS_PAGE_SIZE;
  const [rows, totalCount] = await Promise.all([
    prisma.order.findMany({
      where: { storeId },
      include: orderInclude,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where: { storeId } }),
  ]);

  return { orders: rows.map(toOrder), totalCount, page, pageSize };
}

export async function createOrder(input: {
  storeId: string;
  items: OrderItem[];
  subtotal: number;
  customer: OrderCustomer;
  rememberAddress?: boolean;
}): Promise<Order> {
  // /checkout is gated in src/proxy.ts, but Server Actions can be invoked
  // directly and can drift out of matcher coverage — check here too (same
  // defense-in-depth pattern as updateOrderStatus below).
  const session = await getSessionUser();
  if (!session || session.role !== "buyer") {
    throw new Error("로그인이 필요합니다.");
  }

  const order = await prisma.order.create({
    data: {
      storeId: input.storeId,
      buyerId: session.userId,
      subtotal: input.subtotal,
      customerName: input.customer.name,
      customerPhone: input.customer.phone,
      customerAddress: input.customer.address,
      customerNotes: input.customer.notes,
      items: {
        create: input.items.map((item) => ({
          menuItemId: item.pizzaId,
          name: item.name,
          size: item.size,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
        })),
      },
      // Seeds the status timeline (see OrderStatusHistory) with the
      // "received" entry every order starts at, so history is never empty.
      statusHistory: {
        create: [{ status: "received" }],
      },
    },
  });

  // recentAddress* is tracked on every order regardless of the checkbox, for
  // future reuse (e.g. a "최근 배송지" shortcut) even though nothing reads it
  // yet; defaultAddress* only updates when the buyer opts in, and is what
  // prefills the checkout form next time (see checkout/page.tsx).
  await prisma.user.update({
    where: { id: session.userId },
    data: {
      recentAddressName: input.customer.name,
      recentAddressPhone: input.customer.phone,
      recentAddressLine: input.customer.address,
      ...(input.rememberAddress
        ? {
            defaultAddressName: input.customer.name,
            defaultAddressPhone: input.customer.phone,
            defaultAddressLine: input.customer.address,
          }
        : {}),
    },
  });

  const result: Order = {
    id: order.id,
    storeId: order.storeId,
    status: order.status,
    subtotal: order.subtotal,
    createdAt: order.createdAt.toISOString(),
    customer: input.customer,
    items: input.items,
  };
  emitStoreOrderEvent(order.storeId, { type: "created", order: result });
  return result;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<void> {
  // Route matcher already guards /admin/*, but Server Actions are invoked
  // directly and can drift out of matcher coverage — check here too. A
  // buyer session is valid but has no admin privileges, so it must be
  // rejected explicitly rather than just checking "is there a session".
  const session = await getSessionUser();
  if (!session || (session.role !== "seller" && session.role !== "platform_admin")) {
    throw new Error("로그인이 필요합니다.");
  }

  const order = await prisma.order.findUnique({
    where: { id },
    select: { storeId: true, store: { select: { ownerId: true } } },
  });
  if (!order) {
    throw new Error("주문을 찾을 수 없습니다.");
  }

  // Sellers may only touch orders placed at a store they own; platform
  // admins can manage any store's orders.
  if (session.role === "seller" && order.store.ownerId !== session.userId) {
    throw new Error("이 주문에 대한 권한이 없습니다.");
  }

  const changedAt = new Date();
  await prisma.order.update({
    where: { id },
    data: { status, statusHistory: { create: [{ status, changedAt }] } },
  });
  const changedAtIso = changedAt.toISOString();
  emitOrderStatusEvent(id, { status, changedAt: changedAtIso });
  emitStoreOrderEvent(order.storeId, {
    type: "status",
    orderId: id,
    status,
    changedAt: changedAtIso,
  });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders/search");
}
