"use client";

import Link from "next/link";
import { MapPin, Pizza, ShoppingCart, Utensils } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  const { itemCount } = useCart();

  return (
    <header className="border-b border-black/[.08] dark:border-white/[.145]">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
        <Link
          href="/menu"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <Pizza className="h-6 w-6 text-primary" />
          OrderFlow Pizza
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/stores" aria-label="매장">
            <MapPin className="h-6 w-6" />
          </Link>
          <Link href="/menu" aria-label="메뉴">
            <Utensils className="h-6 w-6" />
          </Link>
          <Link
            href="/cart"
            aria-label={`장바구니, ${itemCount}개 항목`}
            className="relative"
          >
            <ShoppingCart className="h-6 w-6" />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {itemCount}
              </span>
            )}
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
