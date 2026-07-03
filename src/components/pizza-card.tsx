"use client";

import { useState } from "react";
import type { Pizza, PizzaSize } from "@/lib/menu/types";
import { useCart } from "@/lib/cart/cart-context";

const SIZES: PizzaSize[] = ["S", "M", "L"];

function formatPrice(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

export function PizzaCard({ pizza }: { pizza: Pizza }) {
  const [size, setSize] = useState<PizzaSize>("M");
  const { addItem } = useCart();

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-black/[.08] p-4 dark:border-white/[.145]">
      <div>
        <h3 className="text-base font-semibold">{pizza.name}</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {pizza.description}
        </p>
      </div>

      <div className="flex gap-2">
        {SIZES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSize(s)}
            className={`rounded-full border px-3 py-1 text-sm ${
              size === s
                ? "border-foreground bg-foreground text-background"
                : "border-black/[.08] dark:border-white/[.145]"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="font-medium">{formatPrice(pizza.prices[size])}</span>
        <button
          type="button"
          onClick={() =>
            addItem({
              pizzaId: pizza.id,
              name: pizza.name,
              size,
              unitPrice: pizza.prices[size],
              quantity: 1,
            })
          }
          className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          장바구니 담기
        </button>
      </div>
    </div>
  );
}
