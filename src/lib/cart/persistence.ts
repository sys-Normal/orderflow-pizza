import { prisma } from "@/lib/db";
import type { CartItem } from "@/lib/cart/types";

// Reads a buyer's saved cart (server-side only — called from the customer
// layout Server Component). Returns [] if there's no saved cart or the
// stored JSON is somehow unreadable.
export async function getCartForUser(userId: string): Promise<CartItem[]> {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return [];
  try {
    const parsed = JSON.parse(cart.itemsJson);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}
