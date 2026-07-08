"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Pizza, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { buyerLogoutAction } from "@/lib/auth/buyer-actions";

export function SiteHeader({ buyerEmail }: { buyerEmail?: string | null }) {
  const { itemCount } = useCart();
  const pathname = usePathname();

  return (
    <header className="border-b border-black/[.08] dark:border-white/[.145]">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
        <Link
          href="/"
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
          {buyerEmail ? (
            <div className="flex items-center gap-2">
              <div
                title={buyerEmail}
                aria-label={buyerEmail}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
              >
                {buyerEmail.charAt(0).toUpperCase()}
              </div>
              <form action={buyerLogoutAction}>
                <button
                  type="submit"
                  className="text-xs text-zinc-600 hover:underline dark:text-zinc-400"
                >
                  로그아웃
                </button>
              </form>
            </div>
          ) : (
            <Link href={`/login?next=${encodeURIComponent(pathname)}`} aria-label="로그인">
              <User className="h-6 w-6" />
            </Link>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
