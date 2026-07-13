"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { PizzaIcon } from "@/components/icons";
import { useCart } from "@/lib/cart/cart-context";
import { useToast } from "@/lib/toast/toast-context";
import type { Pizza, PizzaSize } from "@/lib/menu/types";

const SIZES: PizzaSize[] = ["S", "M", "L"];

function formatPrice(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

export function PizzaDetailModal({
  pizza,
  storeId,
  storeName,
  onClose,
}: {
  pizza: Pizza;
  storeId: string;
  storeName: string;
  onClose: () => void;
}) {
  const [size, setSize] = useState<PizzaSize>("M");
  const { addItem } = useCart();
  const { showToast } = useToast();
  // description is a comma-separated ingredient list (e.g. "토마토 소스,
  // 모차렐라, 바질"), so it doubles as a 성분표 without a schema change.
  const ingredients = pizza.description
    .split(",")
    .map((ingredient) => ingredient.trim())
    .filter(Boolean);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-md flex-col gap-5 rounded-lg border border-black/[.08] bg-surface p-5 dark:border-white/[.145]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex aspect-square w-20 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <PizzaIcon className="h-10 w-10" />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="text-zinc-600 hover:text-primary dark:text-zinc-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <h2 className="text-lg font-semibold tracking-tight">{pizza.name}</h2>

        <div>
          <p className="mb-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            들어가는 재료
          </p>
          <ul className="flex flex-col gap-1.5 rounded-lg border border-black/[.08] p-3 text-sm dark:border-white/[.145]">
            {ingredients.map((ingredient) => (
              <li key={ingredient}>{ingredient}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            사이즈 선택
          </p>
          <div className="flex gap-2">
            {SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`flex-1 rounded-full border px-3 py-2 text-sm font-medium ${
                  size === s
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-black/[.08] dark:border-white/[.145]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-black/[.08] pt-4 dark:border-white/[.145]">
          <span className="text-lg font-semibold">
            {formatPrice(pizza.prices[size])}
          </span>
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
              onClose();
            }}
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            장바구니 담기
          </button>
        </div>
      </div>
    </div>
  );
}
