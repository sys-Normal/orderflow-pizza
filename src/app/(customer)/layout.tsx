import type { ReactNode } from "react";
import { CartProvider } from "@/lib/cart/cart-context";
import { SiteHeader } from "@/components/site-header";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        {children}
      </main>
    </CartProvider>
  );
}
