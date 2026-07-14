"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import { useToast } from "@/lib/toast/toast-context";
import { CartSummary } from "@/components/cart-summary";
import { StoreBadge } from "@/components/store-badge";
import type { CartItem } from "@/lib/cart/types";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const { showToast } = useToast();

  function handleRemove(pizzaId: string, size: CartItem["size"]) {
    const item = items.find(
      (line) => line.pizzaId === pizzaId && line.size === size
    );
    removeItem(pizzaId, size);
    if (item) {
      showToast(`${item.name} 삭제되었습니다`);
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">장바구니</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          장바구니가 비어 있습니다.
        </p>
        <Link
          href="/stores"
          className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
        >
          매장 보러가기
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">장바구니</h1>
      <StoreBadge storeName={items[0].storeName} subtitle="담긴 매장" />
      <CartSummary
        items={items}
        subtotal={subtotal}
        onUpdateQuantity={updateQuantity}
        onRemove={handleRemove}
        afterItems={
          <Link
            href={`/menu?storeId=${items[0].storeId}`}
            className="self-end rounded-full border border-black/[.08] px-5 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary dark:border-white/[.145]"
          >
            메뉴 추가하기
          </Link>
        }
      />
      <Link
        href="/checkout"
        className="self-end rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        주문하기
      </Link>
    </div>
  );
}
