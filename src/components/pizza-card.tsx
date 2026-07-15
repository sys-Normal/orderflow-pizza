"use client";

import { useEffect, useState } from "react";
import type { Pizza } from "@/lib/menu/types";
import { useCart } from "@/lib/cart/cart-context";

// Chicken/side/drink don't need a size choice, so this card always adds the
// "M" tier — the underlying Pizza/CartItem type still carries S/M/L pricing,
// but only M is ever shown or ordered here.
const FIXED_SIZE = "M" as const;

function formatPrice(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

export function PizzaCard({
  pizza,
  storeId,
  storeName,
}: {
  pizza: Pizza;
  storeId: string;
  storeName: string;
}) {
  const [pressed, setPressed] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    if (!pressed) return;
    const timer = setTimeout(() => setPressed(false), 200);
    return () => clearTimeout(timer);
  }, [pressed]);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-black/[.08] bg-surface p-4 transition-colors hover:border-primary dark:border-white/[.145]">
      <div>
        <h3 className="text-base font-semibold">{pizza.name}</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {pizza.description}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <span className="font-medium">
          {formatPrice(pizza.prices[FIXED_SIZE])}
        </span>
        <button
          type="button"
          onClick={() => {
            addItem({
              pizzaId: pizza.id,
              name: pizza.name,
              category: pizza.category,
              size: FIXED_SIZE,
              unitPrice: pizza.prices[FIXED_SIZE],
              quantity: 1,
              storeId,
              storeName,
            });
            setPressed(true);
          }}
          className={`rounded-full px-4 py-2 text-sm font-medium text-primary-foreground transition-colors ${
            pressed ? "bg-primary/80" : "bg-primary hover:bg-primary/90"
          }`}
        >
          장바구니 담기
        </button>
      </div>
    </div>
  );
}
