"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/current-user";
import type { Order, OrderCustomer, OrderItem, OrderStatus } from "@/lib/orders/types";

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

  return {
    id: order.id,
    storeId: order.storeId,
    status: order.status,
    subtotal: order.subtotal,
    createdAt: order.createdAt.toISOString(),
    customer: input.customer,
    items: input.items,
  };
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

  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath(`/admin/stores/${order.storeId}/orders`);
  revalidatePath("/admin/orders/search");
}
