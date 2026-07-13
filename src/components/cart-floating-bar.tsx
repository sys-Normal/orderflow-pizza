"use client";

import Link from "next/link";
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
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/[.08] bg-surface dark:border-white/[.145]">
        <Link
          href="/cart"
          className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4"
        >
          <span className="text-sm font-medium">
            {itemCount}개 담김 · {formatPrice(subtotal)}
          </span>
          <span className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">
            장바구니 보기
          </span>
        </Link>
      </div>
    </>
  );
}
