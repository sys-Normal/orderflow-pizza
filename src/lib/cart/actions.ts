"use server";

import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/current-user";
import type { CartItem } from "@/lib/cart/types";

// Persists the logged-in buyer's cart. userId comes from the session, never
// the client. A no-op for guests/non-buyers so it's safe to call optimistically.
export async function saveCart(items: CartItem[]): Promise<void> {
  const session = await getSessionUser();
  if (!session || session.role !== "buyer") return;

  const itemsJson = JSON.stringify(items);
  await prisma.cart.upsert({
    where: { userId: session.userId },
    update: { itemsJson },
    create: { userId: session.userId, itemsJson },
  });
}
