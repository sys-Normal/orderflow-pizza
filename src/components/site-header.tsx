"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat, Pizza, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";

export type BuyerAccount = { email: string; provider: "email" | "google" };

export function SiteHeader({
  buyer,
  hasActiveOrder = false,
}: {
  buyer?: BuyerAccount | null;
  hasActiveOrder?: boolean;
}) {
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
          {hasActiveOrder && (
            <Link
              href="/orders"
              aria-label="진행 중인 주문 보기"
              title="진행 중인 주문이 있습니다"
            >
              <ChefHat className="h-6 w-6 text-primary" />
            </Link>
          )}
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
          {buyer ? (
            <UserMenu email={buyer.email} provider={buyer.provider} />
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
