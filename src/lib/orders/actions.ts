"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { Order, OrderCustomer, OrderItem, OrderStatus } from "@/lib/orders/types";

export async function createOrder(input: {
  items: OrderItem[];
  subtotal: number;
  customer: OrderCustomer;
}): Promise<Order> {
  // No store-selection UI yet, so orders go to the single seeded store.
  // Revisit once multi-store checkout exists.
  const store = await prisma.store.findFirstOrThrow();

  const order = await prisma.order.create({
    data: {
      storeId: store.id,
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

  return {
    id: order.id,
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
  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}
