"use client";

import Link from "next/link";
import { Pizza, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { buyerLogoutAction } from "@/lib/auth/buyer-actions";

export function SiteHeader({ buyerEmail }: { buyerEmail?: string | null }) {
  const { itemCount } = useCart();

  return (
    <header className="border-b border-black/[.08] dark:border-white/[.145]">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
        <Link
          href="/stores"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <Pizza className="h-6 w-6 text-primary" />
          OrderFlow Pizza
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
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
          {buyerEmail && (
            <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
              <span className="hidden sm:inline">{buyerEmail}</span>
              <form action={buyerLogoutAction}>
                <button type="submit" className="hover:underline">
                  로그아웃
                </button>
              </form>
            </div>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
