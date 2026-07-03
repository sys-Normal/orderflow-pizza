import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type { Order, OrderItem } from "@/lib/orders/types";

const orderInclude = { items: true } satisfies Prisma.OrderInclude;

type OrderRow = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

function toOrder(row: OrderRow): Order {
  return {
    id: row.id,
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
