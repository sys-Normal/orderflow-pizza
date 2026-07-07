"use client";

import { useEffect, useState } from "react";
import type { Pizza, PizzaSize } from "@/lib/menu/types";
import { useCart } from "@/lib/cart/cart-context";
import { useToast } from "@/lib/toast/toast-context";

const SIZES: PizzaSize[] = ["S", "M", "L"];

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
  const [size, setSize] = useState<PizzaSize>("M");
  const [pressed, setPressed] = useState(false);
  const { addItem } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    if (!pressed) return;
    const timer = setTimeout(() => setPressed(false), 200);
    return () => clearTimeout(timer);
  }, [pressed]);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-black/[.08] bg-surface p-4 dark:border-white/[.145]">
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
                ? "border-primary bg-primary text-primary-foreground"
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
          onClick={() => {
            addItem({
              pizzaId: pizza.id,
              name: pizza.name,
              size,
              unitPrice: pizza.prices[size],
              quantity: 1,
              storeId,
              storeName,
            });
            showToast(`${pizza.name} 장바구니에 담았습니다`);
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
