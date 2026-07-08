import type { ReactNode } from "react";
import { CartProvider } from "@/lib/cart/cart-context";
import { SiteHeader } from "@/components/site-header";
import { getSessionUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";

export default async function CustomerLayout({ children }: { children: ReactNode }) {
  const session = await getSessionUser();
  const buyer =
    session?.role === "buyer"
      ? await prisma.user.findUnique({
          where: { id: session.userId },
          select: { email: true },
        })
      : null;

  return (
    <CartProvider>
      <SiteHeader buyerEmail={buyer?.email} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        {children}
      </main>
    </CartProvider>
  );
}
