"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import { CartSummary } from "@/components/cart-summary";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">장바구니</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          장바구니가 비어 있습니다.
        </p>
        <Link
          href="/menu"
          className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background"
        >
          메뉴 보러가기
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">장바구니</h1>
      <CartSummary
        items={items}
        subtotal={subtotal}
        onUpdateQuantity={updateQuantity}
        onRemove={removeItem}
      />
      <Link
        href="/checkout"
        className="self-start rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
      >
        주문하기
      </Link>
    </div>
  );
}
