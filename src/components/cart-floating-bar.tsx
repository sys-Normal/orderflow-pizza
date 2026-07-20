"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart/cart-context";

function formatPrice(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

// Lets a customer jump straight to the cart from anywhere (e.g. /menu, /stores)
// without hunting for the header cart icon. Hidden on /cart and /checkout
// themselves since those pages already show the same info inline.
export function CartFloatingBar() {
  const pathname = usePathname();
  const { itemCount, subtotal } = useCart();

  if (itemCount === 0 || pathname === "/cart" || pathname === "/checkout") {
    return null;
  }

  return (
    <>
      {/* Reserves space so the fixed bar doesn't cover page content. */}
      <div className="h-20" aria-hidden="true" />
      {/* The Link wraps the full-width bar (not just a centered inner box)
          so the whole visible bar is clickable, with a hover/active tint
          as the affordance instead of a separate button-styled span. The
          tint is a separate absolutely-positioned layer on top of the
          always-opaque bg-surface — hover:bg-primary/5 directly on this
          element would replace bg-surface outright (same CSS property,
          last one wins) instead of blending over it, making the bar go
          almost fully see-through on hover. */}
      <Link
        href="/cart"
        className="group fixed inset-x-0 bottom-0 z-40 block border-t border-black/[.08] bg-surface dark:border-white/[.145]"
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-primary opacity-0 transition-opacity group-hover:opacity-5 group-active:opacity-10"
        />
        <span className="relative mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
          <span className="text-sm font-medium">
            {itemCount}개 담김 · {formatPrice(subtotal)}
          </span>
          <span className="flex items-center gap-1 text-sm font-medium text-primary">
            장바구니 보기
            <ChevronRight className="h-4 w-4" />
          </span>
        </span>
      </Link>
    </>
  );
}
