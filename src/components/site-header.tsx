"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";

export function SiteHeader() {
  const { itemCount } = useCart();

  return (
    <header className="border-b border-black/[.08] dark:border-white/[.145]">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
        <Link href="/menu" className="text-lg font-semibold tracking-tight">
          OrderFlow Pizza
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/menu">메뉴</Link>
          <Link href="/cart">장바구니 ({itemCount})</Link>
        </nav>
      </div>
    </header>
  );
}
